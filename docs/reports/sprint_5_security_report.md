# Relatório da Sprint 5: Security Hardening & Pre-Deploy Certification

## 1. Contexto e Motivação
A Sprint 5 focou 100% em engenharia de base, visando garantir que o sistema não apenas funcionasse, mas fosse impenetrável contra ataques comuns antes do deploy final.

## 2. Tarefas Executadas
- **Rack::Attack & Throttling:** Proteção na camada de aplicação contra brute-force, DoS e credential-stuffing (bloqueios em login, registros e websockets).
- **Sanitização de Uploads:** Validação rigorosa via gem `Marcel` para impedir spoofing de extensão em anexos, restringindo uploads maliciosos.
- **XSS & IDOR Defense:** Filtro HTML de lista branca (`ActionController::Base.helpers.sanitize`) nos editores ricos e forte isolamento de tenant (pesquisas via `current_workspace`).
- **Infraestrutura Docker:** Configuração de Docker Multi-Stage com `jemalloc` e proxy local `Thruster` rodando via usuário *non-root*, maximizando os parcos 512MB RAM disponíveis no Render.
- **Qualidade Assegurada:** Passagem com 0 falhas no `exhaustive_platform_test.rb` (114 testes, 335 asserções) e no `security_hardening_test.rb`.
