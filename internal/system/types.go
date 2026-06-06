package system

import (
	"fmt"
	"time"
)

// SystemOverview contains all system metrics.
type SystemOverview struct {
	CPU     CPUInfo     `json:"cpu"`
	Memory  MemoryInfo  `json:"memory"`
	Disks   []DiskInfo  `json:"disks"`
	Network NetworkInfo `json:"network"`
	Host    HostInfo    `json:"host"`
}

// CPUInfo contains CPU metrics.
type CPUInfo struct {
	Model       string  `json:"model"`
	Cores       int     `json:"cores"`
	Threads     int     `json:"threads"`
	UsagePercent float64 `json:"usage_percent"`
	Temperature  float64 `json:"temperature"`
}

// MemoryInfo contains RAM metrics.
type MemoryInfo struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
}

// DiskInfo contains information about a disk partition.
type DiskInfo struct {
	Device      string  `json:"device"`
	MountPoint  string  `json:"mount_point"`
	Fstype      string  `json:"fstype"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
}

// NetworkInfo contains network metrics.
type NetworkInfo struct {
	Interfaces []NetInterface `json:"interfaces"`
	TotalSent  uint64         `json:"total_sent"`
	TotalRecv  uint64         `json:"total_recv"`
	SendRate   uint64         `json:"send_rate"`
	RecvRate   uint64         `json:"recv_rate"`
}

// NetInterface represents a network interface.
type NetInterface struct {
	Name    string   `json:"name"`
	IP      []string `json:"ip"`
	MAC     string   `json:"mac"`
}

// HostInfo contains host information.
type HostInfo struct {
	Hostname     string `json:"hostname"`
	OS           string `json:"os"`
	Platform     string `json:"platform"`
	KernelVersion string `json:"kernel_version"`
	Uptime       uint64 `json:"uptime"`
	UptimeHuman  string `json:"uptime_human"`
}

// FormatUptime converts seconds to human-readable format.
func FormatUptime(seconds uint64) string {
	d := time.Duration(seconds) * time.Second
	days := int(d.Hours()) / 24
	hours := int(d.Hours()) % 24
	minutes := int(d.Minutes()) % 60

	if days > 0 {
		return fmt.Sprintf("%dd %dh %dm", days, hours, minutes)
	}
	if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}
