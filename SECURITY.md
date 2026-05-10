# Security Policy

## Versões Suportadas

| Versão | Suportada |
|--------|-----------|
| latest | ✅ |

## Reportando Vulnerabilidades

Se você encontrou uma vulnerabilidade de segurança, **não abra uma issue pública**.

Entre em contato diretamente por: pedro.rafael090301@gmail.com

Você receberá uma resposta em até 48 horas.

## Medidas de Segurança Implementadas

- **Rate Limiting** — proteção global contra abuso via ThrottlerGuard (60 requisições/min por IP)
- **ValidationPipe** — validação e sanitização de todos os inputs com `whitelist: true`
- **CORS** — controle de origens permitidas
- **Expiração de links** — links podem ser limitados por data ou número máximo de cliques
- **Redirect seguro** — links expirados retornam 404 em vez de redirecionar para URLs inválidas
- **GeoIP local** — resolução de país sem envio de dados a serviços externos
- **Sem exposição de IPs** — endereços IP são armazenados apenas para analytics interno
