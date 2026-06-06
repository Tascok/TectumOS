package apps

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const (
	AppsDir    = "/opt/tectumos/apps"
	SystemdDir = "/etc/systemd/system"
)

// ExtractTapp extracts a .tapp (.tar.gz) file to the AppsDir and reads the manifest
func ExtractTapp(tappPath string) (*Manifest, error) {
	if err := os.MkdirAll(AppsDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create apps directory: %v", err)
	}

	tempDir, err := os.MkdirTemp(AppsDir, "tapp_extract_*")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(tempDir) // Cleaned up if rename fails

	file, err := os.Open(tappPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	gzr, err := gzip.NewReader(file)
	if err != nil {
		return nil, err
	}
	defer gzr.Close()

	tr := tar.NewReader(gzr)
	for {
		header, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		// Prevent zip-slip
		target := filepath.Join(tempDir, header.Name)
		if !strings.HasPrefix(target, filepath.Clean(tempDir)+string(os.PathSeparator)) {
			continue // skip invalid paths
		}

		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(target, 0755); err != nil {
				return nil, err
			}
		case tar.TypeReg:
			if err := os.MkdirAll(filepath.Dir(target), 0755); err != nil {
				return nil, err
			}
			f, err := os.OpenFile(target, os.O_CREATE|os.O_RDWR|os.O_TRUNC, os.FileMode(header.Mode))
			if err != nil {
				return nil, err
			}
			if _, err := io.Copy(f, tr); err != nil {
				f.Close()
				return nil, err
			}
			f.Close()
		}
	}

	manifestData, err := os.ReadFile(filepath.Join(tempDir, "manifest.json"))
	if err != nil {
		return nil, fmt.Errorf("manifest.json not found in .tapp: %v", err)
	}

	var manifest Manifest
	if err := json.Unmarshal(manifestData, &manifest); err != nil {
		return nil, fmt.Errorf("invalid manifest.json: %v", err)
	}

	finalDir := filepath.Join(AppsDir, manifest.ID)
	os.RemoveAll(finalDir) // Clean up old installation if exists

	if err := os.Rename(tempDir, finalDir); err != nil {
		return nil, fmt.Errorf("failed to move app to final directory: %v", err)
	}

	return &manifest, nil
}

func InstallSystemdService(manifest *Manifest) error {
	serviceName := manifest.ID + ".service"
	servicePath := filepath.Join(SystemdDir, serviceName)
	appDir := filepath.Join(AppsDir, manifest.ID)

	execStart := manifest.Cmd
	if strings.HasPrefix(execStart, "./") {
		execStart = filepath.Join(appDir, strings.TrimPrefix(execStart, "./"))
	} else if !filepath.IsAbs(execStart) {
		execStart = filepath.Join(appDir, execStart)
	}

	content := fmt.Sprintf(`[Unit]
Description=TectumOS App: %s
After=network.target

[Service]
Type=simple
WorkingDirectory=%s
ExecStart=%s %s
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
`, manifest.Name, appDir, execStart, manifest.Args)

	if err := os.WriteFile(servicePath, []byte(content), 0644); err != nil {
		return err
	}

	if err := exec.Command("systemctl", "daemon-reload").Run(); err != nil {
		return fmt.Errorf("failed to reload systemd: %v", err)
	}
	if err := exec.Command("systemctl", "enable", serviceName).Run(); err != nil {
		return fmt.Errorf("failed to enable service: %v", err)
	}
	if err := exec.Command("systemctl", "start", serviceName).Run(); err != nil {
		return fmt.Errorf("failed to start service: %v", err)
	}
	return nil
}

func StartApp(id string) error {
	return exec.Command("systemctl", "start", id+".service").Run()
}

func StopApp(id string) error {
	return exec.Command("systemctl", "stop", id+".service").Run()
}

func RestartApp(id string) error {
	return exec.Command("systemctl", "restart", id+".service").Run()
}

func UninstallApp(id string) error {
	serviceName := id + ".service"
	servicePath := filepath.Join(SystemdDir, serviceName)
	appDir := filepath.Join(AppsDir, id)

	exec.Command("systemctl", "stop", serviceName).Run()
	exec.Command("systemctl", "disable", serviceName).Run()
	
	os.Remove(servicePath)
	exec.Command("systemctl", "daemon-reload").Run()
	
	os.RemoveAll(appDir)
	return nil
}

func GetAppStatus(id string) string {
	cmd := exec.Command("systemctl", "is-active", id+".service")
	out, err := cmd.Output()
	status := strings.TrimSpace(string(out))
	if err != nil {
		if status == "" {
			status = "inactive"
		}
	}
	return status
}
