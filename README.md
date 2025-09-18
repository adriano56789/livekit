# 🚀 LiveKit Server - Configuração para VPS Própria

Este repositório contém uma configuração otimizada para executar o LiveKit em sua própria VPS, fornecendo controle total sobre a infraestrutura de streaming de vídeo e áudio em tempo real.

## 🎯 Visão Geral

Este projeto configura o LiveKit com:
- 🐳 Servidor LiveKit em containers Docker
- 🧠 Redis para armazenamento em cache e estado distribuído
- ⚙️ Configuração personalizável via arquivo `livekit.yaml`
- 🔄 Balanceamento de carga e alta disponibilidade
- 🔒 Segurança reforçada com autenticação por token

## 🛠️ Pré-requisitos

- VPS com Ubuntu 20.04/22.04 (recomendado)
- Mínimo 2 vCPUs, 4GB RAM (recomendado 4 vCPUs, 8GB RAM para produção)
- Docker e Docker Compose instalados
- Domínio configurado (recomendado para produção)
- Portas abertas:
  - 80/tcp (HTTP)
  - 443/tcp (HTTPS)
  - 7880/tcp (WebSocket)
  - 7881/udp (RTP/RTCP)
  - 50000-60000/udp (WebRTC)
  - 3478/udp (STUN)
  - 5349/tcp (TURN)

## 🚀 Instalação Rápida

1. **Acesse sua VPS**
   ```bash
   ssh seu_usuario@seu_ip_da_vps
   ```

2. **Atualize o sistema**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Instale dependências**
   ```bash
   sudo apt install -y git docker.io docker-compose
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   newgrp docker
   ```

4. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/livekit-docker.git
   cd livekit-docker
   ```

5. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   nano .env  # Use o editor de sua preferência
   ```

6. **Configure o domínio (recomendado)**
   - Aponte seu domínio para o IP da VPS
   - Instale o certbot para SSL:
   ```bash
   sudo apt install -y certbot
   sudo certbot certonly --standalone -d seu.dominio.com
   ```
   - Crie diretório para certificados:
   ```bash
   mkdir -p certs
   sudo ln -s /etc/letsencrypt/live/seu.dominio.com/fullchain.pem certs/cert.pem
   sudo ln -s /etc/letsencrypt/live/seu.dominio.com/privkey.pem certs/key.pem
   ```

7. **Inicie os contêineres**
   ```bash
   docker-compose up -d --build
   ```

8. **Verifique os logs**
   ```bash
   docker-compose logs -f
   ```

## 🔧 Configuração Avançada

### Variáveis de Ambiente Importantes

Edite o arquivo `.env` para configurar:

```env
# Configuração Básica
PUBLIC_IP=seu_ip_publico
DOMAIN=seu.dominio.com

# Segurança
LIVEKIT_API_KEY=sua_chave_aqui
LIVEKIT_API_SECRET=sua_senha_segura_aqui
REDIS_PASSWORD=outra_senha_segura
API_AUTH_TOKEN=token_para_acesso_a_api

# Configurações do LiveKit
LIVEKIT_REGION=us-east-1
LIVEKIT_TURNS_ENABLED=true
LOG_LEVEL=info
```

### Portas Utilizadas

| Porta   | Protocolo | Finalidade                     |
|---------|-----------|--------------------------------|
| 80      | TCP       | Redirecionamento HTTP → HTTPS  |
| 443     | TCP       | HTTPS (WebRTC/TURN)            |
| 7880    | TCP       | API e WebSocket LiveKit        |
| 7881    | UDP       | RTP/RTCP                       |
| 3478    | UDP       | STUN                           |
| 5349    | TCP       | TURN sobre TLS                 |
| 50000-60000 | UDP   | WebRTC (faixa dinâmica)        |

## 🔒 Segurança

1. **Firewall**
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp        # SSH
   sudo ufw allow 80/tcp        # HTTP
   sudo ufw allow 443/tcp       # HTTPS
   sudo ufw allow 7880/tcp      # LiveKit WS
   sudo ufw allow 7881/udp      # LiveKit RTP
   sudo ufw allow 3478/udp      # STUN
   sudo ufw allow 5349/tcp      # TURN over TLS
   sudo ufw allow 50000:60000/udp  # WebRTC
   sudo ufw enable
   ```

2. **Atualizações Automáticas**
   ```bash
   # Atualização de segurança automática
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   
   # Atualização automática de certificados
   (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook \"cd /caminho/para/livekit-docker && docker-compose restart livekit\"") | crontab -
   ```

## 📊 Monitoramento

### Métricas do LiveKit
O LiveKit expõe métricas no formato Prometheus em `http://localhost:7880/metrics`

### Monitoramento com Netdata (Opcional)
```bash
docker run -d --name=netdata \
  --pid=host \
  --network=host \
  -v netdataconfig:/etc/netdata \
  -v netdatalib:/var/lib/netdata \
  -v netdatacache:/var/cache/netdata \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \n  --restart unless-stopped \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  netdata/netdata
```

## 🔄 Manutenção

### Atualização
```bash
cd /caminho/para/livekit-docker
git pull
docker-compose pull
docker-compose up -d --build
```

### Backup
```bash
# Backup do Redis
mkdir -p ~/backups
sudo cp -r /var/lib/docker/volumes/livekit-docker_redis_data ~/backups/redis_$(date +%Y%m%d)
```

## 🛠️ Solução de Problemas

### Verificar Status
```bash
docker-compose ps
docker stats
docker-compose logs -f
```

### Reiniciar Serviços
```bash
docker-compose restart
# Ou para um serviço específico
docker-compose restart livekit
```

### Limpar Recursos Não Utilizados
```bash
docker system prune -f
docker volume prune -f
```

## 📚 Recursos Adicionais

- [Documentação Oficial do LiveKit](https://docs.livekit.io/)
- [Exemplos de Uso](https://github.com/livekit-examples)
- [Fórum da Comunidade](https://github.com/livekit/livekit/discussions)

## 📄 Licença

Este projeto está licenciado sob a Licença Apache 2.0 - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
docker-compose logs redis
```

### Reiniciar serviços
```bash
docker-compose restart
```

## Atualização

Para atualizar para a versão mais recente:

```bash
docker-compose pull
docker-compose up -d
```

## Licença

Este projeto está licenciado sob a [Licença Apache 2.0](LICENSE).
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/livekit/livekit)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/livekit/livekit)](https://github.com/livekit/livekit/releases/latest)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/livekit/livekit/buildtest.yaml?branch=master)](https://github.com/livekit/livekit/actions/workflows/buildtest.yaml)
[![License](https://img.shields.io/github/license/livekit/livekit)](https://github.com/livekit/livekit/blob/master/LICENSE)

## Features

-   Scalable, distributed WebRTC SFU (Selective Forwarding Unit)
-   Modern, full-featured client SDKs
-   Built for production, supports JWT authentication
-   Robust networking and connectivity, UDP/TCP/TURN
-   Easy to deploy: single binary, Docker or Kubernetes
-   Advanced features including:
    -   [speaker detection](https://docs.livekit.io/home/client/tracks/subscribe/#speaker-detection)
    -   [simulcast](https://docs.livekit.io/home/client/tracks/publish/#video-simulcast)
    -   [end-to-end optimizations](https://blog.livekit.io/livekit-one-dot-zero/)
    -   [selective subscription](https://docs.livekit.io/home/client/tracks/subscribe/#selective-subscription)
    -   [moderation APIs](https://docs.livekit.io/home/server/managing-participants/)
    -   end-to-end encryption
    -   SVC codecs (VP9, AV1)
    -   [webhooks](https://docs.livekit.io/home/server/webhooks/)
    -   [distributed and multi-region](https://docs.livekit.io/home/self-hosting/distributed/)

## Documentation & Guides

https://docs.livekit.io

## Live Demos

-   [LiveKit Meet](https://meet.livekit.io) ([source](https://github.com/livekit-examples/meet))
-   [Spatial Audio](https://spatial-audio-demo.livekit.io/) ([source](https://github.com/livekit-examples/spatial-audio))
-   Livestreaming from OBS Studio ([source](https://github.com/livekit-examples/livestream))
-   [AI voice assistant using ChatGPT](https://livekit.io/kitt) ([source](https://github.com/livekit-examples/kitt))

## Ecosystem

-   [Agents](https://github.com/livekit/agents): build real-time multimodal AI applications with programmable backend participants
-   [Egress](https://github.com/livekit/egress): record or multi-stream rooms and export individual tracks
-   [Ingress](https://github.com/livekit/ingress): ingest streams from external sources like RTMP, WHIP, HLS, or OBS Studio

## SDKs & Tools

### Client SDKs

Client SDKs enable your frontend to include interactive, multi-user experiences.

<table>
  <tr>
    <th>Language</th>
    <th>Repo</th>
    <th>
        <a href="https://docs.livekit.io/home/client/events/#declarative-ui" target="_blank" rel="noopener noreferrer">Declarative UI</a>
    </th>
    <th>Links</th>
  </tr>
  <!-- BEGIN Template
  <tr>
    <td>Language</td>
    <td>
      <a href="" target="_blank" rel="noopener noreferrer"></a>
    </td>
    <td></td>
    <td></td>
  </tr>
  END -->
  <!-- JavaScript -->
  <tr>
    <td>JavaScript (TypeScript)</td>
    <td>
      <a href="https://github.com/livekit/client-sdk-js" target="_blank" rel="noopener noreferrer">client-sdk-js</a>
    </td>
    <td>
      <a href="https://github.com/livekit/livekit-react" target="_blank" rel="noopener noreferrer">React</a>
    </td>
    <td>
      <a href="https://docs.livekit.io/client-sdk-js/" target="_blank" rel="noopener noreferrer">docs</a>
      |
      <a href="https://github.com/livekit/client-sdk-js/tree/main/example" target="_blank" rel="noopener noreferrer">JS example</a>
      |
      <a href="https://github.com/livekit/client-sdk-js/tree/main/example" target="_blank" rel="noopener noreferrer">React example</a>
    </td>
  </tr>
  <!-- Swift -->
  <tr>
    <td>Swift (iOS / MacOS)</td>
    <td>
      <a href="https://github.com/livekit/client-sdk-swift" target="_blank" rel="noopener noreferrer">client-sdk-swift</a>
    </td>
    <td>Swift UI</td>
    <td>
      <a href="https://docs.livekit.io/client-sdk-swift/" target="_blank" rel="noopener noreferrer">docs</a>
      |
      <a href="https://github.com/livekit/client-example-swift" target="_blank" rel="noopener noreferrer">example</a>
    </td>
  </tr>
  <!-- Kotlin -->
  <tr>
    <td>Kotlin (Android)</td>
    <td>
      <a href="https://github.com/livekit/client-sdk-android" target="_blank" rel="noopener noreferrer">client-sdk-android</a>
    </td>
    <td>Compose</td>
    <td>
      <a href="https://docs.livekit.io/client-sdk-android/index.html" target="_blank" rel="noopener noreferrer">docs</a>
      |
      <a href="https://github.com/livekit/client-sdk-android/tree/main/sample-app/src/main/java/io/livekit/android/sample" target="_blank" rel="noopener noreferrer">example</a>
      |
      <a href="https://github.com/livekit/client-sdk-android/tree/main/sample-app-compose/src/main/java/io/livekit/android/composesample" target="_blank" rel="noopener noreferrer">Compose example</a>
    </td>
  </tr>
<!-- Flutter -->
  <tr>
    <td>Flutter (all platforms)</td>
    <td>
      <a href="https://github.com/livekit/client-sdk-flutter" target="_blank" rel="noopener noreferrer">client-sdk-flutter</a>
    </td>
    <td>native</td>
    <td>
      <a href="https://docs.livekit.io/client-sdk-flutter/" target="_blank" rel="noopener noreferrer">docs</a>
      |
      <a href="https://github.com/livekit/client-sdk-flutter/tree/main/example" target="_blank" rel="noopener noreferrer">example</a>
    </td>
  </tr>
  <!-- Unity -->
  <tr>
    <td>Unity WebGL</td>
    <td>
      <a href="https://github.com/livekit/client-sdk-unity-web" target="_blank" rel="noopener noreferrer">client-sdk-unity-web</a>
    </td>
    <td></td>
    <td>
      <a href="https://livekit.github.io/client-sdk-unity-web/" target="_blank" rel="noopener noreferrer">docs</a>
    </td>
  </tr>
  <!-- React Native -->
  <tr>
    <td>React Native (beta)</td>
    <td>
      <a href="https://github.com/livekit/client-sdk-react-native" target="_blank" rel="noopener noreferrer">client-sdk-react-native</a>
    </td>
    <td>native</td>
    <td></td>
  </tr>
  <!-- Rust -->
  <tr>
    <td>Rust</td>
    <td>
      <a href="https://github.com/livekit/client-sdk-rust" target="_blank" rel="noopener noreferrer">client-sdk-rust</a>
    </td>
    <td></td>
    <td></td>
  </tr>
</table>

### Server SDKs

Server SDKs enable your backend to generate [access tokens](https://docs.livekit.io/home/get-started/authentication/),
call [server APIs](https://docs.livekit.io/reference/server/server-apis/), and
receive [webhooks](https://docs.livekit.io/home/server/webhooks/). In addition, the Go SDK includes client capabilities,
enabling you to build automations that behave like end-users.

| Language                | Repo                                                                                    | Docs                                                        |
| :---------------------- | :-------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| Go                      | [server-sdk-go](https://github.com/livekit/server-sdk-go)                               | [docs](https://pkg.go.dev/github.com/livekit/server-sdk-go) |
| JavaScript (TypeScript) | [server-sdk-js](https://github.com/livekit/server-sdk-js)                               | [docs](https://docs.livekit.io/server-sdk-js/)              |
| Ruby                    | [server-sdk-ruby](https://github.com/livekit/server-sdk-ruby)                           |                                                             |
| Java (Kotlin)           | [server-sdk-kotlin](https://github.com/livekit/server-sdk-kotlin)                       |                                                             |
| Python (community)      | [python-sdks](https://github.com/livekit/python-sdks)                                   |                                                             |
| PHP (community)         | [agence104/livekit-server-sdk-php](https://github.com/agence104/livekit-server-sdk-php) |                                                             |

### Tools

-   [CLI](https://github.com/livekit/livekit-cli) - command line interface & load tester
-   [Docker image](https://hub.docker.com/r/livekit/livekit-server)
-   [Helm charts](https://github.com/livekit/livekit-helm)

## Install

> [!TIP]
> We recommend installing [LiveKit CLI](https://github.com/livekit/livekit-cli) along with the server. It lets you access
> server APIs, create tokens, and generate test traffic.

The following will install LiveKit's media server:

### MacOS

```shell
brew install livekit
```

### Linux

```shell
curl -sSL https://get.livekit.io | bash
```

### Windows

Download the [latest release here](https://github.com/livekit/livekit/releases/latest)

## Getting Started

### Starting LiveKit

Start LiveKit in development mode by running `livekit-server --dev`. It'll use a placeholder API key/secret pair.

```
API Key: devkey
API Secret: secret
```

To customize your setup for production, refer to our [deployment docs](https://docs.livekit.io/deploy/)

### Creating access token

A user connecting to a LiveKit room requires an [access token](https://docs.livekit.io/home/get-started/authentication/#creating-a-token). Access
tokens (JWT) encode the user's identity and the room permissions they've been granted. You can generate a token with our
CLI:

```shell
lk token create \
    --api-key devkey --api-secret secret \
    --join --room my-first-room --identity user1 \
    --valid-for 24h
```

### Test with example app

Head over to our [example app](https://example.livekit.io) and enter a generated token to connect to your LiveKit
server. This app is built with our [React SDK](https://github.com/livekit/livekit-react).

Once connected, your video and audio are now being published to your new LiveKit instance!

### Simulating a test publisher

```shell
lk room join \
    --url ws://localhost:7880 \
    --api-key devkey --api-secret secret \
    --identity bot-user1 \
    --publish-demo \
    my-first-room
```

This command publishes a looped demo video to a room. Due to how the video clip was encoded (keyframes every 3s),
there's a slight delay before the browser has sufficient data to begin rendering frames. This is an artifact of the
simulation.

## Deployment

### Use LiveKit Cloud

LiveKit Cloud is the fastest and most reliable way to run LiveKit. Every project gets free monthly bandwidth and
transcoding credits.

Sign up for [LiveKit Cloud](https://cloud.livekit.io/).

### Self-host

Read our [deployment docs](https://docs.livekit.io/deploy/) for more information.

## Building from source

Pre-requisites:

-   Go 1.23+ is installed
-   GOPATH/bin is in your PATH

Then run

```shell
git clone https://github.com/livekit/livekit
cd livekit
./bootstrap.sh
mage
```

## Contributing

We welcome your contributions toward improving LiveKit! Please join us
[on Slack](http://livekit.io/join-slack) to discuss your ideas and/or PRs.

## License

LiveKit server is licensed under Apache License v2.0.

<!--BEGIN_REPO_NAV-->
<br/><table>
<thead><tr><th colspan="2">LiveKit Ecosystem</th></tr></thead>
<tbody>
<tr><td>LiveKit SDKs</td><td><a href="https://github.com/livekit/client-sdk-js">Browser</a> · <a href="https://github.com/livekit/client-sdk-swift">iOS/macOS/visionOS</a> · <a href="https://github.com/livekit/client-sdk-android">Android</a> · <a href="https://github.com/livekit/client-sdk-flutter">Flutter</a> · <a href="https://github.com/livekit/client-sdk-react-native">React Native</a> · <a href="https://github.com/livekit/rust-sdks">Rust</a> · <a href="https://github.com/livekit/node-sdks">Node.js</a> · <a href="https://github.com/livekit/python-sdks">Python</a> · <a href="https://github.com/livekit/client-sdk-unity">Unity</a> · <a href="https://github.com/livekit/client-sdk-unity-web">Unity (WebGL)</a> · <a href="https://github.com/livekit/client-sdk-esp32">ESP32</a></td></tr><tr></tr>
<tr><td>Server APIs</td><td><a href="https://github.com/livekit/node-sdks">Node.js</a> · <a href="https://github.com/livekit/server-sdk-go">Golang</a> · <a href="https://github.com/livekit/server-sdk-ruby">Ruby</a> · <a href="https://github.com/livekit/server-sdk-kotlin">Java/Kotlin</a> · <a href="https://github.com/livekit/python-sdks">Python</a> · <a href="https://github.com/livekit/rust-sdks">Rust</a> · <a href="https://github.com/agence104/livekit-server-sdk-php">PHP (community)</a> · <a href="https://github.com/pabloFuente/livekit-server-sdk-dotnet">.NET (community)</a></td></tr><tr></tr>
<tr><td>UI Components</td><td><a href="https://github.com/livekit/components-js">React</a> · <a href="https://github.com/livekit/components-android">Android Compose</a> · <a href="https://github.com/livekit/components-swift">SwiftUI</a> · <a href="https://github.com/livekit/components-flutter">Flutter</a></td></tr><tr></tr>
<tr><td>Agents Frameworks</td><td><a href="https://github.com/livekit/agents">Python</a> · <a href="https://github.com/livekit/agents-js">Node.js</a> · <a href="https://github.com/livekit/agent-playground">Playground</a></td></tr><tr></tr>
<tr><td>Services</td><td><b>LiveKit server</b> · <a href="https://github.com/livekit/egress">Egress</a> · <a href="https://github.com/livekit/ingress">Ingress</a> · <a href="https://github.com/livekit/sip">SIP</a></td></tr><tr></tr>
<tr><td>Resources</td><td><a href="https://docs.livekit.io">Docs</a> · <a href="https://github.com/livekit-examples">Example apps</a> · <a href="https://livekit.io/cloud">Cloud</a> · <a href="https://docs.livekit.io/home/self-hosting/deployment">Self-hosting</a> · <a href="https://github.com/livekit/livekit-cli">CLI</a></td></tr>
</tbody>
</table>
<!--END_REPO_NAV-->
