package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// RequireAuth is a Fiber middleware that checks for a valid JWT token.
func RequireAuth() fiber.Handler {
	// Paths that don't require authentication
	publicPaths := []string{
		"/api/auth/setup",
		"/api/auth/login",
		"/api/auth/status",
	}

	return func(c *fiber.Ctx) error {
		path := c.Path()

		// Skip auth for non-API routes (frontend)
		if !strings.HasPrefix(path, "/api/") {
			return c.Next()
		}

		// Skip auth for public API paths
		for _, p := range publicPaths {
			if path == p {
				return c.Next()
			}
		}

		// Extract token from Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "missing authorization header",
			})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid authorization format",
			})
		}

		claims, err := ValidateToken(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid or expired token",
			})
		}

		// Store user info in context
		c.Locals("user_id", claims["user_id"])
		c.Locals("username", claims["username"])

		return c.Next()
	}
}
