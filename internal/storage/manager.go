package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type DiskInfo struct {
	Name       string   `json:"name"`
	Path       string   `json:"path"`
	Size       string   `json:"size"`
	Type       string   `json:"type"`
	Mountpoint string   `json:"mountpoint"`
	Rota       bool     `json:"rota"` // true se for HDD, false se for SSD/NVMe
	IsSystem   bool     `json:"is_system"`
}

type LsblkOutput struct {
	Blockdevices []LsblkDevice `json:"blockdevices"`
}

type LsblkDevice struct {
	Name        string        `json:"name"`
	Path        string        `json:"path"`
	Size        string        `json:"size"`
	Type        string        `json:"type"`
	Mountpoints []string      `json:"mountpoints"`
	Rota        bool          `json:"rota"`
	Children    []LsblkDevice `json:"children"`
}

// GetDisks lista todos os discos e detecta os de sistema
func GetDisks() ([]DiskInfo, error) {
	cmd := exec.Command("lsblk", "-J", "-o", "NAME,PATH,SIZE,TYPE,MOUNTPOINTS,ROTA")
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("lsblk failed: %v", err)
	}

	var data LsblkOutput
	if err := json.Unmarshal(out, &data); err != nil {
		return nil, err
	}

	var disks []DiskInfo
	for _, dev := range data.Blockdevices {
		// Ignorar dispositivos como zram, squashfs
		if dev.Type != "disk" && dev.Type != "loop" {
			continue
		}
		if strings.HasPrefix(dev.Name, "zram") {
			continue
		}

		isSystem := false
		for _, mp := range dev.Mountpoints {
			if mp == "/" || mp == "/boot" || mp == "/home" {
				isSystem = true
				break
			}
		}

		// Checar filhos (partições)
		for _, child := range dev.Children {
			for _, mp := range child.Mountpoints {
				if mp == "/" || mp == "/boot" || mp == "/boot/efi" || mp == "/home" {
					isSystem = true
					break
				}
			}
		}

		disk := DiskInfo{
			Name:       dev.Name,
			Path:       dev.Path,
			Size:       dev.Size,
			Type:       dev.Type,
			Rota:       dev.Rota,
			IsSystem:   isSystem,
		}
		
		if len(dev.Mountpoints) > 0 && dev.Mountpoints[0] != "" {
			disk.Mountpoint = dev.Mountpoints[0]
		}

		disks = append(disks, disk)
	}

	return disks, nil
}

// CreateVirtualDisks cria arquivos de imagem e os monta como loop devices
func CreateVirtualDisks(count int, sizeMB int) error {
	dataDir := filepath.Join("data", "disks")
	os.MkdirAll(dataDir, 0755)

	for i := 1; i <= count; i++ {
		imgFile := filepath.Join(dataDir, fmt.Sprintf("disk%d.img", i))
		
		// Criar arquivo vazio se não existir
		if _, err := os.Stat(imgFile); os.IsNotExist(err) {
			cmd := exec.Command("dd", "if=/dev/zero", fmt.Sprintf("of=%s", imgFile), "bs=1M", fmt.Sprintf("count=%d", sizeMB))
			if err := cmd.Run(); err != nil {
				return fmt.Errorf("falha ao criar %s: %v", imgFile, err)
			}
		}

		// Montar como loop device
		// losetup -fP show
		cmd := exec.Command("losetup", "-j", imgFile)
		out, _ := cmd.Output()
		if len(out) == 0 {
			// Não está montado, então montar
			exec.Command("losetup", "-fP", imgFile).Run()
		}
	}
	return nil
}
