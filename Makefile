.PHONY: dev dev-backend dev-frontend build clean

# Development: run backend and frontend separately
dev-backend:
	go run main.go --dev --port 7800

dev-frontend:
	cd web && npm run dev

# Build: compile frontend then embed into Go binary
build:
	cd web && npm install && npm run build
	go build -ldflags="-s -w" -o tectum main.go

# Clean build artifacts
clean:
	rm -f tectum
	rm -rf web/dist

# Install Go dependencies
deps:
	go mod tidy

# Run production binary
run: build
	./tectum
