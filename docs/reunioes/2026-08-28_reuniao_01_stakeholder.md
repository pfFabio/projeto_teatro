# 📝 Ata de Reunião #01 — Alinhamento com Stakeholder do Teatro

| Metadado | Detalhe |
|---|---|
| **Data** | 28 de Agosto de 2026 |
| **Horário** | 20:10 às 21:00 (Duração: 50 min) |
| **Pauta** | Apresentação do sistema, alinhamento de design, novas funcionalidades e visão de futuro |
| **Status** | Registrado e Documentado |

---

## 🎯 1. Resumo Executivo da Reunião

Foi realizada a primeira reunião oficial de apresentação e alinhamento com a diretoria/stakeholder do teatro. Durante a sessão, o projeto Theatrum foi demonstrado, recebendo feedbacks positivos e direcionamentos estratégicos para aprimoramento da experiência visual, estruturação da navegação, gestão interna de equipe e controle de comprovantes financeiros.

---

## 📌 2. Tópicos Discutidos e Novos Requisitos Levantados

### 2.1. Gestão Estendida de Funcionários / Colaboradores
* **Necessidade:** O teatro identificou a importância de manter um prontuário/registro interno mais detalhado dos colaboradores e equipe técnica.
* **Novos Campos Discutidos:**
  * Idade e data de nascimento;
  * Registros e histórico de saúde (relevante para viagens, turnês e cobertura de seguros);
  * Trabalhos prévios e portfólio;
  * Biografia completa e formação artística.
* **Próximo Passo:** O stakeholder enviará a listagem formal dos campos prioritários e obrigatórios.
* **Atenção LGPD:** Garantir que dados sensíveis de saúde e documentação pessoal fiquem restritos exclusivamente ao painel administrativo.

---

### 2.2. Registro e Arquivamento de Comprovantes de Pagamento
* **Necessidade:** Criação de uma área administrativa para upload e auditoria de comprovantes de pagamento (prestação de contas, recibos de cachês, transporte e notas de produção).
* **Formatos Suportados:** Documentos em PDF e arquivos de imagem (`.png`, `.jpg`, `.jpeg`).
* **Objetivo:** Manter centralizado no sistema o histórico financeiro comprobatório de cada projeto/produção teatral.

---

### 2.3. Link Externo para Compra de Ingressos (Ticketing)
* **Funcionalidade:** Adicionar um campo dinâmico nas peças para direcionamento direto à plataforma oficial de vendas do espetáculo (ex: *Fever, Sympla, Bilheteria Express*).
* **Interface:** Botão com chamada de ação visual destacada (*"Comprar Ingresso"* ou *"Garantir Lugar"*).

---

### 2.4. Nova Classificação de Obras: "Em Repertório"
* **Conceito:** Atualmente o sistema trabalha com *Em Cartaz*, *Programadas* e *Encerradas*. 
* **Novo Status:** Criar a categoria **"Em Repertório"** para catalogar obras do acervo da companhia que não estão ativas no momento, mas permanecem no repertório fixo e podem voltar aos palcos a qualquer momento.

---

### 2.5. Reestruturação da Navegação: "Obras" vs. "Agenda"
* **Separação Conceitual:**
  * **Aba/Página de Obras:** Foco puramente artístico e sensorial — transmissão da "vibe" do espetáculo, leitura de sinopses e scripts, elenco e fotos de alta resolução.
  * **Aba/Página de Agenda:** Foco prático e cronológico — exibição organizada de datas, locais, endereços, horários e links de ingressos.
* **Interatividade na Agenda:**
  * Ao clicar no card ou evento da agenda, haverá uma expansão fluida (quadro *"Saiba Mais"* / acordeão) revelando mapa, endereço detalhado, instruções de acesso e informações complementares.

---

### 2.6. Inspirações de Design & Interatividade
* **Referências Enviadas pelo Stakeholder:**
  1. [Artedante](https://www.artedante.com) — Referência de estética artística, elegância e linguagem visual.
  2. [Lando Norris Official](https://landonorris.com/) — Referência de dinamismo moderno, micro-interações e transições fluidas.
* **Ideias de Interatividade Lúdica:**
  * Conceito *"Quarto do Joca"*: Criação de uma experiência imersiva onde o visitante interage com o personagem e elementos do cenário.
  * Elementos animados e personagens reagindo à movimentação do cursor do mouse (*hover* e *parallax*).
  * *Observação:* Trata-se de uma ideia conceitual preliminar para estudo, que dependerá da produção prévia de ilustrações e assets de animação pela equipe de arte.

---

### 2.7. Exploração de Inteligência Artificial
* **Aplicações Ventiladas:**
  * Uso de assistentes de IA para geração, organização e formatação de scripts/roteiros.
  * Apoio na criação de resumos, press releases e sinopses para divulgação.

---

## 📋 3. Matriz de Ações e Próximos Passos (To-Dos)

| Item | Ação | Responsável | Prioridade |
|---|---|---|---|
| **01** | Aguardar envio da lista de campos adicionais de colaboradores | Stakeholder do Teatro | Alta |
| **02** | Prototipar e implementar a categoria *"Em Repertório"* nas peças | Desenvolvimento | Média |
| **03** | Adicionar campo de Link de Ingresso (Fever/Sympla) nas peças e no formulário admin | Desenvolvimento | Alta |
| **04** | Planejar a separação entre páginas de **Obras** e **Agenda** (com quadro expansível) | Desenvolvimento / UI | Alta |
| **05** | Estruturar modelo de dados e upload para comprovantes em PDF/Imagens | Backend / DB | Média |
| **06** | Analisar as referências de design (*Artedante* e *Lando Norris*) para refinar o visual | UI / UX | Média |
| **07** | Mapear viabilidade técnica das interações lúdicas (*Quarto do Joca*) conforme envio dos assets | Pesquisa & Design | Baixa (Conceitual) |
