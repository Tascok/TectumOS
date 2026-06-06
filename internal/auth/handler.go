package auth

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gustavo/tectum-os/internal/database"
	"golang.org/x/crypto/bcrypt"
)

type setupRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterRoutes registers auth-related routes.
func RegisterRoutes(app fiber.Router) {
	auth := app.Group("/auth")
	auth.Get("/status", handleStatus)
	auth.Post("/setup", handleSetup)
	auth.Post("/login", handleLogin)
	auth.Get("/me", handleMe)
}

// handleStatus checks if the system needs initial setup.
func handleStatus(c *fiber.Ctx) error {
	firstRun, err := database.IsFirstRun()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to check system status",
		})
	}
	return c.JSON(fiber.Map{
		"needs_setup": firstRun,
	})
}

// handleSetup creates the first admin user.
func handleSetup(c *fiber.Ctx) error {
	firstRun, err := database.IsFirstRun()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to check system status",
		})
	}
	if !firstRun {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "setup already completed",
		})
	}

	var req setupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if len(req.Username) < 3 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "username must be at least 3 characters",
		})
	}
	if len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "password must be at least 6 characters",
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to hash password",
		})
	}

	result, err := database.DB.Exec(
		"INSERT INTO users (username, password_hash) VALUES (?, ?)",
		req.Username, string(hash),
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create user",
		})
	}

	userID, _ := result.LastInsertId()
	token, err := GenerateToken(int(userID), req.Username)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token":    token,
		"username": req.Username,
	})
}

// handleLogin authenticates a user and returns a JWT.
func handleLogin(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	var userID int
	var username, passwordHash string
	err := database.DB.QueryRow(
		"SELECT id, username, password_hash FROM users WHERE username = ?",
		req.Username,
	).Scan(&userID, &username, &passwordHash)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	token, err := GenerateToken(userID, username)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token":    token,
		"username": username,
	})
}

// handleMe returns the current user info.
func handleMe(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "not authenticated",
		})
	}

	return c.JSON(fiber.Map{
		"username": username,
	})
}
