# URL Shortener API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway"/>
  <img src="https://img.shields.io/badge/CI-passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white" alt="CI"/>
</p>

API de encurtamento de URLs construída com **NestJS**, com cache em **Redis**, analytics de cliques (dispositivo, navegador, país, referrer), geração de **QR Code** e expiração de links por data ou número máximo de cliques.

---

## Funcionalidades

- **Encurtamento de URLs** — geração de código curto via nanoid com suporte a código personalizado
- **Cache Redis** — resolução de redirects em memória, sem consultar o banco no caminho crítico
- **Analytics de cliques** — registro de dispositivo, navegador, país (via GeoIP) e referrer a cada acesso
- **QR Code** — geração de imagem PNG para qualquer link encurtado
- **Expiração por data** — links podem expirar automaticamente em uma data definida
- **Expiração por cliques** — links desativados automaticamente ao atingir um limite de acessos
- **Rate limiting** — proteção global contra abuso via ThrottlerGuard (60 req/min)
- **Dashboard de analytics** — endpoint com totais, top links, distribuição por device/browser/país
- **Validação de entrada** — DTOs com `class-validator`, `whitelist: true`

---

## Endpoints

### URLs

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/urls` | Cria um link encurtado |
| `GET` | `/api/urls` | Lista todos os links com contagem de cliques |
| `GET` | `/api/urls/:shortCode` | Detalhes do link + últimos 20 cliques |
| `DELETE` | `/api/urls/:shortCode` | Remove o link e invalida o cache Redis |
| `GET` | `/api/urls/:shortCode/qr` | Gera QR Code em PNG para o link |

### Redirect

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/:code` | Redireciona para a URL original e registra o clique |

### Analytics

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/dashboard` | Visão geral: totais, top links, cliques por device/browser/país |

---

## 🏥 Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Status da aplicação |

**Produção:** `https://url-shortener-production-3eae.up.railway.app/api/health`

---

## Exemplo de uso

**Criar link encurtado:**

```bash
curl -X POST https://url-shortener-production-3eae.up.railway.app/api/urls \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com/0ManualDoDev0",
    "title": "Meu GitHub",
    "customCode": "meu-github",
    "expiresAt": "2026-12-31T23:59:59Z",
    "maxClicks": 1000
  }'
```

**Resposta:**

```json
{
  "id": "ee3d5b0b-6938-4444-94b0-fac86144d36c",
  "originalUrl": "https://github.com/0ManualDoDev0",
  "shortCode": "meu-github",
  "title": "Meu GitHub",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "maxClicks": 1000,
  "isActive": true,
  "createdAt": "2026-05-10T00:14:27.729Z"
}
```

**Acessar o link:** `https://url-shortener-production-3eae.up.railway.app/meu-github`

**Gerar QR Code:** `GET /api/urls/meu-github/qr` → retorna imagem PNG

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS 10 + TypeScript |
| ORM | Prisma 5 |
| Banco de dados | PostgreSQL 16 |
| Cache | Redis 7 (ioredis) |
| Encurtamento | nanoid 3 |
| QR Code | qrcode |
| Analytics de UA | ua-parser-js |
| GeoIP | geoip-lite |
| Rate limiting | @nestjs/throttler |
| Deploy | Railway |

---

## Configuração local

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/0ManualDoDev0/url-shortener.git
cd url-shortener

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
```

### Subir banco e Redis

```bash
docker compose up -d
```

### Rodar migrations

```bash
npm run db:migrate
```

### Iniciar em desenvolvimento

```bash
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

### Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta da aplicação | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | — |
| `REDIS_URL` | Connection string Redis (prioridade sobre host/port) | — |
| `REDIS_HOST` | Host do Redis | `localhost` |
| `REDIS_PORT` | Porta do Redis | `6379` |
| `REDIS_PASSWORD` | Senha do Redis | — |
| `BASE_URL` | URL base usada na geração do QR Code | — |

---

## Produção

A API está disponível em:

```
https://url-shortener-production-3eae.up.railway.app
```

Deploy contínuo via Railway — cada push para `main` dispara um novo deploy automaticamente.

---

## Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais informações.
