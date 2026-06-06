package main

import (
	"embed"
	"flag"
	"io/fs"
	"log"
	"os"
	"os/signal"
	"os/user"
	"path/filepath"
	"syscall"
	"time"

	"github.com/gustavo/tectum-os/internal/auth"
	"github.com/gustavo/tectum-os/internal/database"
	"github.com/gustavo/tectum-os/internal/server"
	"github.com/gustavo/tectum-os/internal/system"
)

//go:embed web/dist/*
var embeddedFrontend embed.FS

func main() {
	port := flag.String("port", "7800", "Server port")
	dataDir := flag.String("data", "./data", "Data directory path")
	dev := flag.Bool("dev", false, "Enable development mode (CORS for localhost:5173)")
	flag.Parse()

	log.Println("⬡ TectumOS — Homelab Panel")
	log.Println("──────────────────────────────")

	currentUser, err := user.Current()
	if err == nil && currentUser.Uid != "0" {
		log.Println("=========================================================")
		log.Println("❌ ERRO CRÍTICO: PERMISSÃO NEGADA")
		log.Println("O TectumOS precisa rodar como 'root' para gerenciar os")
		log.Println("aplicativos via systemd. Feche este processo e rode:")
		log.Println("")
		log.Println("    sudo ./tectum")
		log.Println("")
		log.Println("=========================================================")
		os.Exit(1)
	}

	// Initialize database
	if err := database.Init(*dataDir); err != nil {
		log.Fatalf("❌ Database init failed: %v", err)
	}
	defer database.Close()
	log.Println("✓ Database initialized")

	// Initialize JWT
	if err := auth.InitJWT(*dataDir); err != nil {
		log.Fatalf("❌ JWT init failed: %v", err)
	}
	log.Println("✓ JWT initialized")

	// Start system monitor
	monitor := system.NewMonitor()
	monitor.Start(2 * time.Second)
	log.Println("✓ System monitor started (2s interval)")

	// Setup frontend filesystem
	var frontendFS fs.FS
	if *dev {
		log.Println("⚠ Dev mode: frontend served by Vite at localhost:5173")
	} else {
		var err error
		frontendFS, err = fs.Sub(embeddedFrontend, "web/dist")
		if err != nil {
			log.Printf("⚠ No embedded frontend found, running API-only: %v", err)
		} else {
			log.Println("✓ Frontend embedded in binary")
		}
	}

	// Check first run
	firstRun, _ := database.IsFirstRun()
	if firstRun {
		log.Println("📋 First run detected — setup wizard will be shown")
	}

	// Create and start server
	app := server.New(server.Config{
		Port:       *port,
		DevMode:    *dev,
		Monitor:    monitor,
		FrontendFS: frontendFS,
	})

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("\n⬡ Shutting down TectumOS...")
		_ = app.Shutdown()
		_ = database.Close()
		os.Exit(0)
	}()

	// Resolve data dir for logging
	absDataDir, _ := filepath.Abs(*dataDir)
	log.Printf("📁 Data directory: %s", absDataDir)

	server.Start(app, *port)
}
