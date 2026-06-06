package storage

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(router fiber.Router) {
	router.Get("/disks", GetDisksHandler)
	router.Post("/virtual-disks", CreateVirtualDisksHandler)
}

func GetDisksHandler(c *fiber.Ctx) error {
	disks, err := GetDisks()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(disks)
}

func CreateVirtualDisksHandler(c *fiber.Ctx) error {
	// Cria 3 discos de 1GB para simulação
	if err := CreateVirtualDisks(3, 1024); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "3 discos virtuais de 1GB criados com sucesso!"})
}
