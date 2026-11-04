# 📝 Ata de Reunião #02 — Validação de Entregas e Novos Requisitos

| Metadado | Detalhe |
|---|---|
| **Data** | 07 de Outubro de 2026 |
| **Horário** | 10:57 às 11:27 (Duração: ~30 min) |
| **Participantes** | Fabio Figueiredo (Desenvolvimento) · Faria Turci (Stakeholder / Companhia) |
| **Formato** | Google Meet com compartilhamento de tela (demonstração ao vivo) |
| **Pauta** | Revisão das ações da Ata #01, demonstração da nova navegação, novos requisitos de conteúdo e segurança |
| **Fonte** | Transcrição automática: `ixv-kgvh-bqc (2026-10-07 10_57 GMT-3) - Transcript.docx` |
| **Status** | Registrado e Documentado |

---

## 🎯 1. Resumo Executivo

Foi apresentada ao stakeholder a nova versão do site, com a navegação simplificada (**Início · Obras · Agenda**), a separação conceitual entre Obras e Agenda, a página de detalhes da obra redesenhada (imagem de destaque maior, sinopse e elenco mais limpos) e o carrossel unificado de fotos e vídeos. O stakeholder aprovou a direção e entregou os materiais pendentes (campos do cadastro, Drive do espetáculo *Janela*, portfólio/clipping e logomarca transparente).

Surgiram **quatro novos requisitos**: área de downloads técnicos nas obras em cartaz, página **"Memória"** da companhia, categoria de **projetos futuros** e um formulário público para **envio de ideias**. Ficou acordado que **dados reais só entram no sistema após o reforço de segurança**, previsto para o **fim de outubro**, com uso pleno do site em **novembro de 2026**.

---

## ✅ 2. Revisão das Ações da Ata #01

> Status verificado contra o código do repositório em 07/10/2026.

| Item | Ação (Ata #01) | Status | Observação |
|---|---|---|---|
| **01** | Lista de campos adicionais de colaboradores | 🟡 Desbloqueado | Stakeholder enviou print da tela via WhatsApp durante a reunião. Implementação pendente. |
| **02** | Categoria *"Em Repertório"* | 🔴 Pendente | Não discutido nesta reunião; ainda não existe no schema. |
| **03** | Link externo de ingresso (Sympla/Fever) | 🔴 Pendente | Mencionado como "vai estar lá"; campo ainda não existe no schema nem no admin. |
| **04** | Separação **Obras** × **Agenda** | 🟢 Concluído | Página de Agenda com data, horário, endereço, mapa e botão *"Abrir no Google Maps"*. Layout da Agenda ainda precisa de refino (espaço apertado). |
| **05** | Comprovantes de pagamento (PDF/imagem) | 🔴 Pendente | **Escopo esclarecido:** acesso exclusivo do administrador. Colaboradores **não** terão acesso. |
| **06** | Aplicar referências de design | 🟡 Parcial | Visual mais limpo, imagem de destaque ampliada, carrossel minimalista. |
| **07** | Interações lúdicas (*Quarto do Joca*) | ⚪ Não iniciado | Conceitual, depende de assets de arte. |

---

## 🖥️ 3. Demonstração Realizada

* **Navegação superior:** reduzida a *Início, Obras e Agenda*. Links de **"Seja Colaborador"** e **Administração** movidos para o rodapé, pois o site passa a ser focado no **espectador**. → *Aceito pelo stakeholder* ("tá, pode ser").
* **Página inicial:** mais limpa, com menos caixas de informação. O bloco *"Novidades"* pode ser removido (sem decisão final).
* **Página da obra:** imagem maior ocupando a tela, sinopse e participantes logo abaixo.
* **Carrossel de mídia:** fotos e vídeos no mesmo carrossel, com ordem definida pelo admin, para "contar uma história" conforme o visitante navega. Aceita MP4; recomendado **GIF** pela leveza. → *Stakeholder aprovou manter as mídias no topo.*
* **Agenda → Mapa:** abre mapa interno com opção de abrir no app Google Maps (rotas).

---

## 📌 4. Novos Requisitos Levantados

### 4.1. Área de Downloads Técnicos na Obra ("Press Kit" / Materiais para Programadores)
* **Necessidade:** Evitar o envio repetitivo de e-mails para contratantes e programadores. O stakeholder enviará apenas o link da obra.
* **Conteúdo:** Projeto de encenação, **rider técnico**, fotos em alta qualidade, vídeos, clipping e texto.
* **Local:** Na **página da obra**, em uma caixa no mesmo estilo de *"Equipe / Elenco"* (ex.: *"Informações Técnicas"*), com 3 a 4 links de download.
* **Regra:** Exibido **somente para obras Em Cartaz**.
* **Acesso:** Público (sem login).

### 4.2. Página "Memória" da Companhia
* **Necessidade:** Um lugar que guarde a memória da companhia — histórico cronológico de trabalhos (ex.: *"1998 — fulano fez a peça X, no local Y"*), currículo e clipping.
* **Navegação:** Novo item no menu superior → **Início · Obras · Agenda · Memória**.
* **Formato:** Visualização direta no site **e** opção de baixar o arquivo completo (PDF).
* **Fonte dos dados:** Portfólio enviado via WhatsApp (ainda precisa de atualização com os trabalhos de 2026).

### 4.3. Nova Categoria: Projetos Futuros / Novas Ideias
* **Conceito:** Peças que ainda são ideia ou próximo trabalho a ser montado — diferente de *Programada* (que já está pronta para estrear).
* **Exibição:** Nova categoria nas Obras e um setor de destaque na página inicial.

### 4.4. Formulário Público "Tem uma ideia?"
* **Conceito:** Botão no setor de Novas Ideias para qualquer visitante sugerir um espetáculo ou parceria.
* **Campos:** Descrição breve da ideia + contato (nome, telefone, e-mail).
* **Observação técnica:** Formulário público exige anti-spam/rate limit, consentimento LGPD e visualização das mensagens no painel admin.

### 4.5. Autenticação do Administrador
* **Login:** Substituir o e-mail genérico por um **login e senha** da companhia (não precisa ser um e-mail real).
* **Recuperação:** Implementar **"Esqueci minha senha"** e **troca de senha** (stakeholder pediu explicitamente).
* **Restrição:** Dados reais de pessoas **não serão cadastrados** até que o banco esteja seguro.
* **Prazo acordado:** Segurança pronta até o **fim de outubro/2026**; uso 100% a partir de **novembro/2026**.

---

## 📦 5. Materiais Recebidos do Stakeholder

| Material | Canal | Situação |
|---|---|---|
| Print da tela de cadastro (campos do colaborador) | WhatsApp | ✅ Recebido |
| Drive do espetáculo **Janela** (fotos e dados) | WhatsApp (link) | ✅ Recebido — outros espetáculos ainda não estão no Drive |
| Portfólio / clipping completo da companhia | WhatsApp | ✅ Recebido — falta atualização de 2026 |
| Logomarca com fundo transparente | WhatsApp | ✅ Recebido |
| Fotos dos demais espetáculos | — | ⏳ Pendente |

> [!NOTE]
> Trecho de transcrição incerto (~00:28): o stakeholder pediu para ser lembrado de enviar "umas cinco fotos" que estão faltando. Cabe ao desenvolvimento listar e cobrar esse material.

---

## 📋 6. Matriz de Ações e Próximos Passos

| Item | Ação | Responsável | Prioridade |
|---|---|---|---|
| **01** | Implementar novos campos do colaborador conforme print recebido (com proteção LGPD) | Desenvolvimento | Alta |
| **02** | Implementar segurança do admin: login/senha, troca e recuperação de senha | Backend / Segurança | **Crítica** (até 31/10) |
| **03** | Importar conteúdo real do espetáculo *Janela* (fotos, dados) e aplicar a logomarca | Desenvolvimento | Alta |
| **04** | Adicionar campo de link de ingresso nas peças e no admin | Desenvolvimento | Alta |
| **05** | Criar área de downloads técnicos (rider, projeto, fotos, clipping) para obras Em Cartaz | Full-stack | Alta |
| **06** | Estruturar e criar a página **Memória** a partir do portfólio | Full-stack / UI | Média |
| **07** | Criar categorias *Em Repertório* e *Projetos Futuros* + setor na Home | Full-stack | Média |
| **08** | Criar formulário público "Tem uma ideia?" com caixa de entrada no admin | Full-stack | Média |
| **09** | Refinar layout da página de Agenda | UI / UX | Média |
| **10** | Implementar módulo de comprovantes (somente admin) | Backend / DB | Média |
| **11** | Enviar fotos dos demais espetáculos e atualizar portfólio 2026 | Stakeholder | Média |
| **12** | Cobrar do stakeholder a lista de fotos faltantes | Desenvolvimento | Baixa |
| **13** | Compartilhar esta ata com o stakeholder | Desenvolvimento | Baixa |

📎 As metas derivadas desta reunião estão consolidadas em [METAS.md](../METAS.md).
