# Changelog

Todas as mudanças relevantes do projeto são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.0.0] - 2026-05-10

### Adicionado

- Encurtamento de URLs com nanoid e suporte a código personalizado
- Cache Redis para resolução de redirects sem consultar o banco
- Analytics de cliques: dispositivo, navegador, país (GeoIP) e referrer
- Geração de QR Code em PNG para qualquer link encurtado
- Expiração de links por data (`expiresAt`) ou número máximo de cliques (`maxClicks`)
- Rate limiting global via ThrottlerGuard (60 req/min por IP)
- Dashboard de analytics com totais e distribuições por device/browser/país
- Integração com PostgreSQL via Prisma 5
- Deploy automatizado na Railway
- Documentação completa no README
- Política de segurança (SECURITY.md)
