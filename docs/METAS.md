# 🎯 Metas do Projeto Theatrum — Outubro/Novembro 2026

> Documento vivo, derivado das atas [#01 (28/08)](./reunioes/2026-08-28_reuniao_01_stakeholder.md) e [#02 (07/10)](./reunioes/2026-10-07_reuniao_02_stakeholder.md).
> **Marco principal acordado com o stakeholder:** segurança concluída até **31/10/2026** → site em uso real com dados verdadeiros a partir de **01/11/2026**.

---

## 📊 1. Panorama: O Que Foi Feito × O Que Falta

### 🟢 Já entregue
- [x] Separação conceitual **Obras** (artístico) × **Agenda** (prático)
- [x] Agenda com data, horário, endereço, mapa interno e link para Google Maps
- [x] Navegação enxuta: *Início · Obras · Agenda*; Colaborador e Admin no rodapé
- [x] Página da obra redesenhada (imagem de destaque ampliada, visual limpo)
- [x] Carrossel unificado de fotos + vídeos com ordem e capa definidas pelo admin
- [x] Orientações de formato/proporção 16:9 no upload de mídia
- [x] Base de segurança: Helmet, rate limit, JWT, proteção de dados de contato (LGPD)
- [x] Persistência de uploads no PostgreSQL (resistente ao disco efêmero do Render)

### 🔴 Falta fazer
| Origem | Item |
|---|---|
| Ata #01 | Link de ingresso · Status *Em Repertório* · Campos estendidos de colaborador · Comprovantes · Quarto do Joca |
| Ata #02 | Downloads técnicos · Página Memória · Projetos Futuros · Formulário de ideias · Login/recuperação de senha · Conteúdo real · Refino da Agenda |

---

## 🗓️ 2. Metas por Sprint

### 🏃 Sprint 1 — Conteúdo Real e Ganhos Rápidos (08/10 → 14/10)
*Objetivo: deixar o site com cara de "pronto" usando material público já recebido.*

| # | Meta | Critério de aceite |
|---|---|---|
| **M1** | **Link de ingresso** nas peças | Campo `linkIngresso` no schema + formulário admin; botão *"Comprar Ingresso"* aparece na obra e na Agenda somente quando preenchido. |
| **M2** | **Novos status de obra** | Status `EM_REPERTORIO` e `PROJETO_FUTURO` disponíveis no admin e nos filtros da página de Obras. |
| **M3** | **Conteúdo do espetáculo *Janela*** | Fotos e dados do Drive importados; imagens genéricas substituídas. |
| **M4** | **Identidade visual** | Logomarca transparente aplicada no cabeçalho, rodapé e favicon. |
| **M5** | **Refino da Agenda** | Cards com espaço adequado em desktop e mobile; expansão *"Saiba Mais"* fluida. |

### 🔐 Sprint 2 — Segurança e Dados Sensíveis (15/10 → 24/10) · **CRÍTICA**
*Objetivo: cumprir o compromisso de prazo e liberar o cadastro de dados reais.*

| # | Meta | Critério de aceite |
|---|---|---|
| **M6** | **Login próprio do admin** | Autenticação por *login + senha* (sem exigir e-mail real); credencial genérica de seed removida/trocada em produção. |
| **M7** | **Troca e recuperação de senha** | Tela "Alterar senha" no admin + fluxo "Esqueci minha senha" funcional (ver decisão pendente D1). Tokens com expiração e uso único. |
| **M8** | **Campos estendidos do colaborador** | Campos do print recebido implementados; dados sensíveis (saúde, documentos) visíveis **apenas** no admin; testes garantindo que a API pública não os expõe. |
| **M9** | **Módulo de comprovantes** | Upload de PDF/PNG/JPG vinculado à produção; rota acessível **somente** pelo admin; validação de tipo e tamanho. |
| **M10** | **Auditoria de segurança** | Checklist da skill `auth-jwt-lgpd-security` revisado; testes de 401/403 em todas as rotas admin. |

### 🎭 Sprint 3 — Novas Experiências Públicas (25/10 → 31/10)
*Objetivo: entregar os requisitos novos da Ata #02.*

| # | Meta | Critério de aceite |
|---|---|---|
| **M11** | **Downloads técnicos da obra** | Caixa *"Informações Técnicas"* (mesmo estilo de Equipe/Elenco) com links para projeto, rider, fotos, vídeos e clipping; visível **apenas** em obras Em Cartaz; gerenciável pelo admin. |
| **M12** | **Página Memória** | Item *Memória* no menu; linha do tempo cronológica dos trabalhos a partir do portfólio; botão para baixar o PDF completo. |
| **M13** | **Projetos Futuros na Home** | Setor de destaque na página inicial listando obras `PROJETO_FUTURO`. |
| **M14** | **Formulário "Tem uma ideia?"** | Formulário público (ideia + nome, telefone, e-mail) com consentimento LGPD e rate limit; mensagens listadas numa aba do admin. |

### 🚀 Marco — Go-Live (01/11/2026)
- [ ] Credenciais definitivas entregues ao stakeholder
- [ ] Dados reais de colaboradores cadastrados
- [ ] Suítes de testes (Jest + Vitest) 100% verdes
- [ ] Deploy atualizado no GitHub Pages + Render
- [ ] Ata #02 compartilhada com o stakeholder

### 🧊 Backlog (pós-novembro)
- Interações lúdicas *"Quarto do Joca"* (depende de assets de arte)
- Assistentes de IA para roteiros, sinopses e press releases
- Demais espetáculos (aguardando fotos do stakeholder)

---

## ❓ 3. Decisões Pendentes

| ID | Questão | Por que importa |
|---|---|---|
| **D1** | Como recuperar a senha se o login **não** for um e-mail real? | Recuperação exige um canal (e-mail de recuperação + serviço SMTP, código de recuperação impresso, ou reset pelo desenvolvedor). |
| **D2** | Onde hospedar arquivos pesados (vídeos, fotos em alta, PDFs de clipping)? | O PostgreSQL gratuito do Render tem limite de armazenamento; links externos (ex.: Google Drive) podem ser mais seguros para o press kit. |
| **D3** | Remover o bloco *"Novidades"* da Home? | Oferecido na reunião, sem decisão. |
| **D4** | Os novos campos do colaborador são obrigatórios ou opcionais? | Impacta validação e o formulário público. |

---

## ⚠️ 4. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Atraso no envio de fotos/portfólio 2026 | Página Memória e obras incompletas | Lembrar o stakeholder ativamente (ele pediu isso explicitamente). |
| Prazo de segurança apertado | Adiamento do go-live | Sprint 2 priorizada antes das features públicas. |
| Formulário público vira alvo de spam | Caixa de entrada poluída | Rate limit + honeypot + validação no backend. |
