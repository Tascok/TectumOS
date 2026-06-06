package apps

type Manifest struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Version     string `json:"version"`
	Description string `json:"description"`
	Icon        string `json:"icon,omitempty"`
	Port        int    `json:"port"`
	Cmd         string `json:"cmd"`            // Relative path to executable, e.g. "./app"
	Args        string `json:"args,omitempty"` // Extra arguments to run
}

type AppStatus struct {
	Manifest
	Status      string `json:"status"` // "running", "stopped", "failed", "uninstalled"
	InstallTime int64  `json:"install_time,omitempty"`
}
