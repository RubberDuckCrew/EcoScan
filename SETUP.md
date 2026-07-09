# Setup & Local Execution Guide

This guide describes how to set up and run the entire EcoScan ecosystem (mobile application, backend, AI service, databases, and authentication).

## 📋 Prerequisites

Make sure you have the following installed on your development machine:

- **Docker & Docker Compose**
- **Node.js** (see [mise.toml](./mise.toml) for versions)
- **Git**

## 🌐 Network Configuration

Services run on `localhost` of your machine, but mobile devices need to reach them over the network. The correct host depends on your target:

| Target | Host |
|---|---|
| **Physical device** | Your machine's local IP (e.g., `192.168.1.100`) |
| **Android emulator** | `10.0.2.2` (Android host alias) |
| **iOS simulator** | `localhost` (no change needed) |

> 💡 **Android tip:** Use `adb reverse tcp:8100 tcp:8100` and `adb reverse tcp:8080 tcp:8080` to forward ports from your Android device (physical or emulator) to your host — then you can keep `localhost` in the URLs below.

You'll need to substitute the correct host in the next steps wherever you see `<HOST>`.

## 🛠️ Step-by-Step Setup

### 1. Download the OpenFoodFacts Database

EcoScan uses a local export of the Open Food Facts database in Parquet format, which is queried via DuckDB.

Run the provided startup script in the root directory to download the database file:

```bash
# On Linux/macOS or Git Bash
chmod +x ./startup.sh
./startup.sh
```

Alternatively, you can manually download the file from [Hugging Face](https://huggingface.co/datasets/openfoodfacts/product-database/resolve/main/food.parquet?download=true) and save it under:

- `data/food/food.parquet` (see [data/food/README.md](./data/food/README.md))

### 2. Configure Root Environment Variables

Create a `.env` file in the project root directory by copying the example:

```bash
cp .env.example .env
```

Inside the root [.env](./.env), configure your Keycloak external hostname:

```env
KEYCLOAK_HOSTNAME=http://<HOST>:8100
```

### 3. Configure the AI Service LLM

The AI service requires access to an LLM provider. Navigate to [ecoscan_ai](./ecoscan_ai) and create and `.env` file that configures your LLM.

For Nvidia Nim:

```env
MODEL=nvidia_nim/meta/llama-3.2-3b-instruct
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key_here
```

For Ollama:

```env
MODEL=ollama/llama3.2
OPENAI_BASE_URL=http://host.docker.internal:11434
```

Add your corresponding API key. You can also configure other model providers supported by crewAI (e.g. OpenAI, Anthropic, or Ollama for local offline execution).

### 4. Configure Mobile App Environment & IPs

To connect the mobile application to your local stack, locate [ecoscan_app/.env](./ecoscan_app/.env).

Update the IP addresses for Keycloak and the backend:

```env
EXPO_PUBLIC_KEYCLOAK_URL=http://<HOST>:8100
EXPO_PUBLIC_KEYCLOAK_REALM=local_realm
EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=local
EXPO_PUBLIC_BACKEND_URL=http://<HOST>:8080/api
```

### 5. Launch the Infrastructure Stack

Run the entire infrastructure stack (databases, message broker, Keycloak, backend, and AI service) using Docker Compose from the root directory:

```bash
docker compose up -d
```

This command starts:

- **postgres** (Database for scans & user history)
- **rabbitmq** (Message broker for AI task distribution)
- **keycloak** (Identity & Access Management on port `8100`)
- **init-keycloak** (Initial configuration runner for client registration)
- **backend** (Java Spring Boot API server on port `8080`)
- **ai-service** (Python/crewAI engine)

Verify that all containers are healthy using:

```bash
docker compose ps
```

### 6. Start the Mobile Application

1. Navigate into the mobile app folder:
   ```bash
   cd ecoscan_app
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm run start
   ```
4. Scan the QR code displayed in your terminal using the Expo Go app (Android/iOS) or press `a` (for Android emulator) or `i` (for iOS simulator) to run the application.

### Login Credentials
The default credentials are:
- Username: `user`
- Password: `user`
