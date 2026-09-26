#!/bin/bash
# ==============================================================================
# SkillIntel AWS EC2 Automated Bootstrap Script
# Supports: Ubuntu 22.04/24.04 LTS & Amazon Linux 2023
# Usage: Run on a fresh EC2 instance or paste into EC2 "User Data" on launch.
# ==============================================================================

set -e

echo "=========================================="
echo "==> Step 1: Configuring SWAP memory (2GB)..."
echo "=========================================="
# Prevent OOM (Out Of Memory) issues during container builds on t2/t3 instances
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap allocated successfully."
else
    echo "Swap already configured."
fi

echo "=========================================="
echo "==> Step 2: Installing Docker & Git..."
echo "=========================================="
if command -v apt-get &> /dev/null; then
    # Ubuntu / Debian
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg git
    install -m 0755 -d /etc/apt/keyrings
    if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg
    fi
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
elif command -v dnf &> /dev/null; then
    # Amazon Linux 2023 / RHEL
    dnf update -y
    dnf install -y docker git
    systemctl enable docker
    systemctl start docker
    # Install docker compose plugin
    DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
fi

systemctl enable docker
systemctl start docker

# Add current user to docker group if running under non-root
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker "$SUDO_USER"
fi

echo "=========================================="
echo "==> Step 3: Setting up systemd auto-restart service..."
echo "=========================================="
# Create a systemd service so containers automatically start on server reboots
cat << 'EOF' > /etc/systemd/system/skillintel.service
[Unit]
Description=SkillIntel Production Docker Compose Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/sihproject
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

echo "=========================================="
echo "==> Bootstrap Complete!"
echo "Next steps:"
echo "1. Clone or copy your code to /opt/sihproject:"
echo "   sudo git clone <YOUR_REPO_URL> /opt/sihproject"
echo "2. Create /opt/sihproject/.env with your production credentials."
echo "3. Run deployment:"
echo "   cd /opt/sihproject && sudo ./aws/deploy.sh"
echo "4. Enable auto-start:"
echo "   sudo systemctl enable skillintel"
echo "=========================================="
