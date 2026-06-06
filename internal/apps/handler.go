package apps

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gustavo/tectum-os/internal/database"
)

func RegisterRoutes(router fiber.Router) {
	router.Get("/catalog", GetCatalogApps)
	router.Get("/installed", GetInstalledApps)
	router.Post("/upload", UploadTapp)
	router.Post("/:id/action", HandleAppAction)
}

func GetCatalogApps(c *fiber.Ctx) error {
	catalog, err := GetCatalog()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(catalog)
}

func GetInstalledApps(c *fiber.Ctx) error {
	rows, err := database.DB.Query("SELECT id, name, version, status, port FROM installed_apps")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer rows.Close()

	var apps []AppStatus
	for rows.Next() {
		var app AppStatus
		if err := rows.Scan(&app.ID, &app.Name, &app.Version, &app.Status, &app.Port); err != nil {
			continue
		}
		
		// Get live status from systemd
		liveStatus := GetAppStatus(app.ID)
		app.Status = liveStatus

		// Update DB with live status if changed (optional, but good for consistency)
		database.DB.Exec("UPDATE installed_apps SET status = ? WHERE id = ?", liveStatus, app.ID)

		apps = append(apps, app)
	}

	return c.JSON(apps)
}

func UploadTapp(c *fiber.Ctx) error {
	file, err := c.FormFile("tapp")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Tapp file is required"})
	}

	tempFile := filepath.Join(os.TempDir(), file.Filename)
	if err := c.SaveFile(file, tempFile); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save file"})
	}
	defer os.Remove(tempFile)

	manifest, err := ExtractTapp(tempFile)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": fmt.Sprintf("Failed to extract: %v", err)})
	}

	if err := InstallSystemdService(manifest); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": fmt.Sprintf("Failed to setup service: %v", err)})
	}

	// Save to DB
	_, err = database.DB.Exec(`
		INSERT INTO installed_apps (id, name, version, port, status) 
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET 
		name=excluded.name, version=excluded.version, port=excluded.port, status=excluded.status
	`, manifest.ID, manifest.Name, manifest.Version, manifest.Port, "running")

	if err != nil && err != sql.ErrNoRows {
		return c.Status(500).JSON(fiber.Map{"error": fmt.Sprintf("Failed to save to db: %v", err)})
	}

	return c.JSON(fiber.Map{"message": "App installed successfully", "app": manifest})
}

type ActionRequest struct {
	Action string `json:"action"`
}

func HandleAppAction(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var req ActionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var err error
	switch req.Action {
	case "start":
		err = StartApp(id)
	case "stop":
		err = StopApp(id)
	case "restart":
		err = RestartApp(id)
	case "uninstall":
		err = UninstallApp(id)
		if err == nil {
			database.DB.Exec("DELETE FROM installed_apps WHERE id = ?", id)
		}
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Unknown action"})
	}

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": fmt.Sprintf("Action %s failed: %v", req.Action, err)})
	}

	status := "uninstalled"
	if req.Action != "uninstall" {
		status = GetAppStatus(id)
		database.DB.Exec("UPDATE installed_apps SET status = ? WHERE id = ?", status, id)
	}

	return c.JSON(fiber.Map{"message": "Action successful", "status": status})
}
