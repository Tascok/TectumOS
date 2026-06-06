package system

import (
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers system-related routes.
func RegisterRoutes(app fiber.Router, monitor *Monitor) {
	sys := app.Group("/system")
	sys.Get("/overview", handleOverview(monitor))
}

func handleOverview(monitor *Monitor) fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.JSON(monitor.GetCurrent())
	}
}
