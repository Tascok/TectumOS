package apps

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
)

type CatalogApp struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Icon        string `json:"icon"`
	Version     string `json:"version"`
	DownloadURL string `json:"download_url"`
}

func GetCatalog() ([]CatalogApp, error) {
	catalogFile := filepath.Join("data", "catalog.json")
	
	// Se não existe, retornar uma lista mockada com algumas apps famosas
	if _, err := os.Stat(catalogFile); os.IsNotExist(err) {
		return getMockCatalog(), nil
	}

	data, err := ioutil.ReadFile(catalogFile)
	if err != nil {
		return nil, err
	}

	var catalog []CatalogApp
	if err := json.Unmarshal(data, &catalog); err != nil {
		return nil, err
	}
	return catalog, nil
}

func getMockCatalog() []CatalogApp {
	return []CatalogApp{
		{
			ID: "filebrowser",
			Name: "Filebrowser",
			Description: "Gerenciador de arquivos web simples e rápido pelo navegador.",
			Category: "Cloud & Arquivos",
			Icon: "📂",
			Version: "v2.27.0",
		},
		{
			ID: "jellyfin",
			Name: "Jellyfin",
			Description: "Media server open-source para assistir seus filmes e séries.",
			Category: "Mídia & Entretenimento",
			Icon: "🎬",
			Version: "v10.8.10",
		},
		{
			ID: "pihole",
			Name: "Pi-hole",
			Description: "Bloqueador de anúncios a nível de rede (DNS sinkhole).",
			Category: "Rede & Segurança",
			Icon: "🛡️",
			Version: "v5.17.1",
		},
		{
			ID: "uptime-kuma",
			Name: "Uptime Kuma",
			Description: "Ferramenta self-hosted para monitorar uptime de serviços.",
			Category: "Monitoramento",
			Icon: "⏱️",
			Version: "v1.23.1",
		},
		{
			ID: "nextcloud",
			Name: "Nextcloud",
			Description: "Sua própria nuvem privada para arquivos e contatos.",
			Category: "Cloud & Arquivos",
			Icon: "☁️",
			Version: "v27.0.0",
		},
		{
			ID: "gitea",
			Name: "Gitea",
			Description: "Servidor Git self-hosted leve e ultra-rápido.",
			Category: "Desenvolvimento",
			Icon: "☕",
			Version: "v1.20.3",
		},
	}
}
