# AWS Deployment Guide for SkillIntel

This guide provides end-to-end instructions for deploying the **SkillIntel** platform (Next.js 16 frontend + FastAPI backend + PostgreSQL + PyTorch AI) on **Amazon Web Services (AWS)**.

---

## Architecture Options

| Method | Target Use Case | Recommended AWS Services | Monthly Cost Estimate |
| :--- | :--- | :--- | :--- |
| **Option 1 (Recommended)** | **Hackathons, Demos, Rapid Production** | **AWS EC2 (t3.small or t3.medium) + Docker Compose + Nginx** | **$0 (Free Tier) to ~$12/mo** |
| **Option 2** | **Serverless Container Scaling** | **AWS App Runner (or ECS Fargate) + AWS RDS PostgreSQL** | **~$20 - $40/mo** |
| **Option 3** | **Simple Flat-Fee VPS** | **AWS Lightsail Container / Instance** | **~$5 - $10/mo** |

---

## Option 1: Quick Deployment on AWS EC2 (Recommended)

In this setup, your Next.js frontend, FastAPI backend, and Nginx reverse proxy run as coordinated Docker containers on an EC2 instance. All web traffic flows through Port 80/443 with zero CORS issues.

### Step 1: Launch an AWS EC2 Instance

1. Log into your [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Navigate to **EC2** > **Instances** > **Launch Instances**.
3. Set the following settings:
   - **Name**: `skillintel-server`
   - **OS Image**: **Ubuntu Server 24.04 LTS** (or Amazon Linux 2023)
   - **Instance Type**:
     - For Free Tier / Evaluation: `t3.micro` or `t3.small` (our setup script automatically provisions a **2GB SWAP** file so PyTorch and Next.js build without memory errors).
     - Recommended for optimal speed: `t3.medium` (2 vCPU, 4GB RAM)
   - **Key Pair**: Select or create an SSH key pair (`.pem` file) to connect.
   - **Storage**: At least **20 GB gp3** storage.

### Step 2: Configure the Security Group (Firewall)

Under **Network Settings**, configure the following inbound rules:

| Type | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | `My IP` (or `0.0.0.0/0`) | Secure terminal access |
| **HTTP** | `80` | `0.0.0.0/0` | Public web app traffic |
| **HTTPS** | `443` | `0.0.0.0/0` | SSL / Secure web traffic |
| **Custom TCP (Optional)** | `8000` | `0.0.0.0/0` | Direct FastAPI Docs access (optional) |

Click **Launch Instance**.

---

### Step 3: Connect and Run the Bootstrap Script

Connect to your EC2 instance via SSH:
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Clone the repository and run the automated EC2 bootstrap script:
```bash
# Clone the repository
git clone https://github.com/<your-username>/sihproject.git /opt/sihproject
cd /opt/sihproject

# Run the automated setup script (installs Docker, Compose, Swap, and auto-restart service)
sudo chmod +x aws/ec2-setup.sh aws/deploy.sh
sudo ./aws/ec2-setup.sh
```

---

### Step 4: Configure Environment Variables

Create your production environment file `/opt/sihproject/.env`:

```bash
cp .env.example .env
nano .env
```

Fill in your production values:
```env
# Database (AWS RDS PostgreSQL or Neon DB)
DATABASE_URL=postgresql+psycopg://postgres:<PASSWORD>@<DB_HOST>:5432/skillintel

# Application Secrets
SECRET_KEY=generate_a_random_32_character_string
DEMO_LOGIN_PASSWORD=demopassword

# AI Provider
GROQ_API_KEY=gsk_your_groq_api_key_here

# Frontend (Leave blank when using Nginx reverse proxy on port 80)
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_DEMO_LOGIN_PASSWORD=demopassword
CORS_ORIGINS=*

AUTO_SEED=true
WEB_CONCURRENCY=2
```

---

### Step 5: Launch the Application

Run the deployment script:
```bash
sudo ./aws/deploy.sh
```

This will:
1. Build the production multi-stage Next.js frontend image.
2. Build the FastAPI backend image and pre-download the ML embedding model.
3. Automatically run Alembic database migrations.
4. Automatically seed the initial database if `AUTO_SEED=true`.
5. Start Nginx on port 80.

Enable system auto-start so your app restarts after any server reboot:
```bash
sudo systemctl enable skillintel
```

**Your application is now live!**
Open your browser and navigate to:
```text
http://<YOUR_EC2_PUBLIC_IP>
```
To access the FastAPI API documentation:
```text
http://<YOUR_EC2_PUBLIC_IP>/docs
```

---

## Option 2: Serverless Deployment (AWS App Runner + RDS + Amplify)

For auto-scaling container infrastructure without managing an EC2 virtual machine:

### 1. Database: AWS RDS PostgreSQL
1. Go to **AWS RDS** > **Create database**.
2. Select **PostgreSQL 16**.
3. Choose **Free tier** (`db.t4g.micro` or `db.t3.micro`).
4. Set Master username (`postgres`) and Master password.
5. In **Connectivity**, set **Public access** to **Yes** (or place inside the same VPC).
6. Note the database endpoint URL:
   `postgresql+psycopg://postgres:<PASSWORD>@<RDS_ENDPOINT>:5432/skillintel`

### 2. Backend: AWS App Runner
1. Push your backend image to **Amazon ECR** (Elastic Container Registry):
   ```bash
   aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
   aws ecr create-repository --repository-name skillintel-backend
   docker build -t skillintel-backend ./backend
   docker tag skillintel-backend:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/skillintel-backend:latest
   docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/skillintel-backend:latest
   ```
2. In AWS Console, search for **AWS App Runner** > **Create service**.
3. Select **Container registry** > **Amazon ECR** > Select `skillintel-backend:latest`.
4. Configure service:
   - **Port**: `8000`
   - **Environment variables**:
     - `DATABASE_URL`: Your RDS PostgreSQL URL
     - `GROQ_API_KEY`: Your Groq API key
     - `SECRET_KEY`: Your secret key
     - `DEMO_LOGIN_PASSWORD`: `demopassword`
     - `AUTO_SEED`: `true`
5. Click **Create & Deploy**. App Runner will provide a secure HTTPS endpoint (e.g. `https://xxxx.awsapprunner.com`).

### 3. Frontend: AWS Amplify Hosting or ECS
1. Go to **AWS Amplify** > **Deploy an app** > Select **GitHub**.
2. Connect your repository and select the `main` branch.
3. In **Build Settings**, set the environment variable:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://xxxx.awsapprunner.com` (your App Runner backend URL)
4. Deploy! Amplify will automatically build and host the Next.js app with global CloudFront CDN caching and free SSL.

---

## Adding a Custom Domain & Free SSL (Let's Encrypt) on EC2

To attach a custom domain (e.g., `skillintel.yourdomain.com`) with automated HTTPS:

1. Create a **DNS A Record** in Route 53 or your DNS registrar pointing to `<YOUR_EC2_PUBLIC_IP>`.
2. On your EC2 server, install Certbot:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   ```
3. Stop Nginx container temporarily or generate standalone certificate:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```
4. Mount certificates in `docker-compose.prod.yml`:
   ```yaml
   nginx:
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

---

## Verification & Health Check Checklist

After deployment, verify the following endpoints:

| Endpoint | Expected Response | Description |
| :--- | :--- | :--- |
| `http://<IP>/` | `200 OK` (HTML) | Next.js Landing / Dashboard |
| `http://<IP>/health` | `{"status":"healthy"}` | Nginx & Backend Health Check |
| `http://<IP>/api/v1/officials` | `200 OK` (JSON) | Officials API Data |
| `http://<IP>/docs` | `200 OK` (Swagger UI) | Interactive OpenAPI documentation |

---

## Useful Maintenance Commands

```bash
# Check running container status
sudo docker compose -f docker-compose.prod.yml ps

# View live backend logs
sudo docker compose -f docker-compose.prod.yml logs -f backend

# View live frontend logs
sudo docker compose -f docker-compose.prod.yml logs -f frontend

# Restart services
sudo docker compose -f docker-compose.prod.yml restart

# Pull latest code and re-deploy
sudo ./aws/deploy.sh
```
