package server

import (
	"encoding/json"
	"io/fs"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/websocket/v2"
	"github.com/gustavo/tectum-os/internal/apps"
	"github.com/gustavo/tectum-os/internal/auth"
	"github.com/gustavo/tectum-os/internal/storage"
	"github.com/gustavo/tectum-os/internal/system"
)

// Config holds server configuration.
type Config struct {
	Port       string
	DevMode    bool
	Monitor    *system.Monitor
	FrontendFS fs.FS
}

// New creates and configures the Fiber app.
func New(cfg Config) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:      "TectumOS",
		ServerHeader: "TectumOS",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format:     "${time} ${status} ${method} ${path} ${latency}\n",
		TimeFormat: "15:04:05",
	}))

	if cfg.DevMode {
		app.Use(cors.New(cors.Config{
			AllowOrigins: "http://localhost:5173",
			AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		}))
	}

	// Auth middleware for API routes
	app.Use(auth.RequireAuth())

	// API routes
	api := app.Group("/api")
	auth.RegisterRoutes(api)
	system.RegisterRoutes(api, cfg.Monitor)
	apps.RegisterRoutes(api.Group("/apps"))
	storage.RegisterRoutes(api.Group("/storage"))

	// WebSocket endpoint for real-time metrics
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		ch := cfg.Monitor.Subscribe()
		defer cfg.Monitor.Unsubscribe(ch)

		// Send initial data immediately
		initial := cfg.Monitor.GetCurrent()
		data, _ := json.Marshal(initial)
		if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
			return
		}

		// Stream updates
		for metrics := range ch {
			data, err := json.Marshal(metrics)
			if err != nil {
				continue
			}
			if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
				return
			}
		}
	}))

	// Serve frontend (embedded or proxy in dev)
	if cfg.FrontendFS != nil {
		app.Use("/", func(c *fiber.Ctx) error {
			path := c.Path()
			servePath := path
			if servePath == "/" {
				servePath = "/index.html"
			}

			file, err := cfg.FrontendFS.Open(servePath[1:])
			if err != nil {
				servePath = "/index.html"
				file, err = cfg.FrontendFS.Open("index.html")
				if err != nil {
					return c.Next()
				}
			}
			defer file.Close()

			stat, err := file.Stat()
			if err != nil || stat.IsDir() {
				servePath = "/index.html"
				file2, err := cfg.FrontendFS.Open("index.html")
				if err != nil {
					return c.Next()
				}
				defer file2.Close()
				stat, _ = file2.Stat()
				file = file2
			}

			contentType := "application/octet-stream"
			switch {
			case endsWith(servePath, ".html"):
				contentType = "text/html; charset=utf-8"
			case endsWith(servePath, ".css"):
				contentType = "text/css; charset=utf-8"
			case endsWith(servePath, ".js"):
				contentType = "application/javascript; charset=utf-8"
			case endsWith(servePath, ".json"):
				contentType = "application/json"
			case endsWith(servePath, ".svg"):
				contentType = "image/svg+xml"
			case endsWith(servePath, ".png"):
				contentType = "image/png"
			case endsWith(servePath, ".ico"):
				contentType = "image/x-icon"
			case endsWith(servePath, ".woff2"):
				contentType = "font/woff2"
			case endsWith(servePath, ".woff"):
				contentType = "font/woff"
			}

			c.Set("Content-Type", contentType)
			buf := make([]byte, stat.Size())
			file.(interface{ Read([]byte) (int, error) }).Read(buf)
			return c.Send(buf)
		})
	}

	return app
}

func endsWith(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}

// Start starts the server on the given port.
func Start(app *fiber.App, port string) {
	log.Printf("🏠 TectumOS starting on http://localhost:%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
