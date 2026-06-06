#!/bin/bash
set -e

echo "==============================================="
echo "   🚀 Instalando TectumOS no seu Homelab...  "
echo "==============================================="

# Exigir root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Por favor, rode este script como root (sudo)."
  exit 1
fi

echo "[1/5] Atualizando pacotes e instalando dependências..."
apt-get update -y
apt-get install -y curl git make sudo systemd

# Instalar Node.js se não existir
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Instalar Go se não existir
if ! command -v go &> /dev/null; then
    GO_VERSION="1.22.1"
    curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" | tar -C /usr/local -xz
    ln -sf /usr/local/go/bin/go /usr/bin/go
fi

echo "[2/5] Clonando o repositório..."
INSTALL_DIR="/opt/tectumos"
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️ TectumOS já está presente em $INSTALL_DIR. Atualizando código..."
    cd $INSTALL_DIR
    git pull origin master
else
    git clone https://github.com/Tascok/TectumOS.git $INSTALL_DIR
    cd $INSTALL_DIR
fi

echo "[3/5] Compilando TectumOS..."
make build

echo "[4/5] Configurando serviço Systemd..."
cat <<EOF > /etc/systemd/system/tectum.service
[Unit]
Description=TectumOS Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/tectum
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tectum
systemctl restart tectum

echo "==============================================="
echo "   ✅ Instalação Concluída com Sucesso!      "
echo "==============================================="
echo ""
echo "O TectumOS já está rodando em segundo plano."
echo "Acesse o painel no navegador via: http://<IP_DO_SERVIDOR>:7800"
echo ""
