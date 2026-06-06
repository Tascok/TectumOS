package system

import (
	"fmt"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

// Monitor collects system metrics periodically.
type Monitor struct {
	mu            sync.RWMutex
	current       SystemOverview
	prevNetSent   uint64
	prevNetRecv   uint64
	prevTimestamp time.Time
	subscribers   []chan SystemOverview
	subMu         sync.Mutex
}

// NewMonitor creates a new system monitor.
func NewMonitor() *Monitor {
	return &Monitor{}
}

// Subscribe registers a channel to receive metric updates.
func (m *Monitor) Subscribe() chan SystemOverview {
	m.subMu.Lock()
	defer m.subMu.Unlock()
	ch := make(chan SystemOverview, 1)
	m.subscribers = append(m.subscribers, ch)
	return ch
}

// Unsubscribe removes a subscriber channel.
func (m *Monitor) Unsubscribe(ch chan SystemOverview) {
	m.subMu.Lock()
	defer m.subMu.Unlock()
	for i, sub := range m.subscribers {
		if sub == ch {
			m.subscribers = append(m.subscribers[:i], m.subscribers[i+1:]...)
			close(ch)
			return
		}
	}
}

// GetCurrent returns the latest system metrics.
func (m *Monitor) GetCurrent() SystemOverview {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.current
}

// Start begins collecting metrics at the given interval.
func (m *Monitor) Start(interval time.Duration) {
	// Collect initial metrics
	m.collect()
	
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			m.collect()
			m.broadcast()
		}
	}()
}

func (m *Monitor) collect() {
	overview := SystemOverview{}

	// CPU
	cpuPercent, _ := cpu.Percent(time.Second, false)
	cpuInfo, _ := cpu.Info()
	overview.CPU = CPUInfo{
		UsagePercent: 0,
	}
	if len(cpuPercent) > 0 {
		overview.CPU.UsagePercent = cpuPercent[0]
	}
	if len(cpuInfo) > 0 {
		overview.CPU.Model = cpuInfo[0].ModelName
		overview.CPU.Cores = int(cpuInfo[0].Cores)
	}
	logicalCores, _ := cpu.Counts(true)
	overview.CPU.Threads = logicalCores

	// Temperature - best effort
	temps, err := host.SensorsTemperatures()
	if err == nil {
		for _, t := range temps {
			if t.Temperature > 0 {
				overview.CPU.Temperature = t.Temperature
				break
			}
		}
	}

	// Memory
	memInfo, _ := mem.VirtualMemory()
	if memInfo != nil {
		overview.Memory = MemoryInfo{
			Total:       memInfo.Total,
			Used:        memInfo.Used,
			Free:        memInfo.Available,
			UsedPercent: memInfo.UsedPercent,
		}
	}

	// Disks
	partitions, _ := disk.Partitions(false)
	for _, p := range partitions {
		usage, err := disk.Usage(p.Mountpoint)
		if err != nil {
			continue
		}
		// Skip virtual filesystems
		if usage.Total == 0 {
			continue
		}
		overview.Disks = append(overview.Disks, DiskInfo{
			Device:      p.Device,
			MountPoint:  p.Mountpoint,
			Fstype:      p.Fstype,
			Total:       usage.Total,
			Used:        usage.Used,
			Free:        usage.Free,
			UsedPercent: usage.UsedPercent,
		})
	}

	// Network
	netIO, _ := net.IOCounters(false)
	now := time.Now()
	if len(netIO) > 0 {
		overview.Network.TotalSent = netIO[0].BytesSent
		overview.Network.TotalRecv = netIO[0].BytesRecv

		if !m.prevTimestamp.IsZero() {
			elapsed := now.Sub(m.prevTimestamp).Seconds()
			if elapsed > 0 {
				overview.Network.SendRate = uint64(float64(netIO[0].BytesSent-m.prevNetSent) / elapsed)
				overview.Network.RecvRate = uint64(float64(netIO[0].BytesRecv-m.prevNetRecv) / elapsed)
			}
		}
		m.prevNetSent = netIO[0].BytesSent
		m.prevNetRecv = netIO[0].BytesRecv
	}
	m.prevTimestamp = now

	// Network interfaces
	interfaces, _ := net.Interfaces()
	for _, iface := range interfaces {
		if iface.Name == "lo" {
			continue
		}
		ni := NetInterface{
			Name: iface.Name,
			MAC:  iface.HardwareAddr,
		}
		for _, addr := range iface.Addrs {
			ni.IP = append(ni.IP, addr.Addr)
		}
		overview.Network.Interfaces = append(overview.Network.Interfaces, ni)
	}

	// Host
	hostInfo, _ := host.Info()
	if hostInfo != nil {
		overview.Host = HostInfo{
			Hostname:      hostInfo.Hostname,
			OS:            hostInfo.OS,
			Platform:      fmt.Sprintf("%s %s", hostInfo.Platform, hostInfo.PlatformVersion),
			KernelVersion: hostInfo.KernelVersion,
			Uptime:        hostInfo.Uptime,
			UptimeHuman:   FormatUptime(hostInfo.Uptime),
		}
	}

	m.mu.Lock()
	m.current = overview
	m.mu.Unlock()
}

func (m *Monitor) broadcast() {
	m.subMu.Lock()
	defer m.subMu.Unlock()

	current := m.GetCurrent()
	for _, ch := range m.subscribers {
		select {
		case ch <- current:
		default:
			// Skip if subscriber is not ready (non-blocking)
		}
	}
}
