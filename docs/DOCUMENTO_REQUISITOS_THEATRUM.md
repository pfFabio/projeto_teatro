# UNIVERSIDADE DE VASSOURAS — UNIVASSOURAS
## CAMPUS UNIVERSITÁRIO DE MARICÁ
### CURSO DE BACHARELADO EM ENGENHARIA DE SOFTWARE — 6º PERÍODO

---

# ESPECIFICAÇÃO DE ENGENHARIA DE REQUISITOS DE SOFTWARE
## PROJETO THEATRUM: SISTEMA INTEGRADO DE GESTÃO, CIRCULAÇÃO E DIFUSÃO DO PATRIMÔNIO TEATRAL

**Discente:** Fábio Pinto Figueiredo  
**Matrícula:** 202413741  
**Disciplina:** Engenharia de Software / Projeto Integrador / Engenharia de Requisitos  
**Orientação Docente:** Corpo Docente de Engenharia de Software — Univassouras  
**Local / Data:** Maricá – RJ, 2026  

---

## SUMÁRIO
1. [INTRODUÇÃO E CONTEXTUALIZAÇÃO DO PROJETO](#1-introdução-e-contextualização-do-projeto)
2. [TÉCNICAS DE ELICITAÇÃO DOS REQUISITOS](#2-técnicas-de-elicitação-dos-requisitos)
   - 2.1 Técnicas Utilizadas e Dinâmica Metodológica
   - 2.2 Evidências Concretas e Rastreabilidade Documental
3. [REQUISITOS FUNCIONAIS (RF) E PRIORIZAÇÃO MOSCOW](#3-requisitos-funcionais-rf-e-priorização-moscow)
   - 3.1 Lista Detalhada de Requisitos Funcionais
   - 3.2 Matriz de Priorização MoSCoW
4. [REQUISITOS NÃO FUNCIONAIS (RNF) — ISO/IEC 25010 E LGPD](#4-requisitos-não-funcionais-rnf--isoiec-25010-e-lgpd)
   - 4.1 Segurança e Privacidade da Informação
   - 4.2 Desempenho e Eficiência de Recursos
   - 4.3 Usabilidade, Ergonomia e Acessibilidade
   - 4.4 Confiabilidade e Disponibilidade
   - 4.5 Manutenibilidade e Testabilidade
5. [HISTÓRIAS DE USUÁRIO (USER STORIES) E BACKLOG](#5-histórias-de-usuário-user-stories-e-backlog)
   - 5.1 Catálogo de User Stories com Critérios BDD / Gherkin
   - 5.2 Evolução Comparativa: Product Backlog Inicial vs. Atual
6. [MODELAGEM UML DE REQUISITOS](#6-modelagem-uml-de-requisitos)
   - 6.1 Diagrama de Casos de Uso (UML)
   - 6.2 Especificação Formal dos Casos de Uso Críticos
7. [MATRIZ DE RASTREABILIDADE BIDIRECIONAL](#7-matriz-de-rastreabilidade-bidirecional)
8. [REFERÊNCIAS BIBLIOGRÁFICAS E NORMATIVAS](#8-referências-bibliográficas-e-normativas)

---

## 1. INTRODUÇÃO E CONTEXTUALIZAÇÃO DO PROJETO

O presente documento de Engenharia de Requisitos estabelece a especificação formal, analítica e rastreável do sistema **Theatrum Mundi**, desenvolvido como solução full-stack para modernizar, profissionalizar e salvaguardar a gestão de companhias teatrais profissionais no Estado do Rio de Janeiro. 

O projeto base apoia a companhia **Theatrum Mundi**, sediada em Maricá/RJ e fundada em 2012 pelo dramaturgo e encenador Angelo Faria Turci. O sistema atende à complexa dinâmica de produção teatral independente, abrangendo o ciclo de temporadas, circulação interestadual (editais públicos, SESC, SESI e teatros municipais), relação contratual com programadores/curadores, preservação da memória artística e conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).

A solução arquitetural é composta por uma aplicação web de página única (Single Page Application — SPA) desenvolvida em **React 19** com **Vite**, consumindo uma API RESTful modular construída em **Node.js** e **Express**, orquestrada pelo **Prisma ORM** sobre banco de dados relacional (PostgreSQL em produção no Render e SQLite para desenvolvimento), com renderização cartográfica via **Leaflet/OpenStreetMap**.

### Acesso ao Protótipo Funcional e Código-Fonte:
* **Protótipo em Produção (Web):** [https://pffabio.github.io/projeto_teatro/](https://pffabio.github.io/projeto_teatro/)
* **Repositório do Código-Fonte (GitHub):** [https://github.com/pfFabio/projeto_teatro](https://github.com/pfFabio/projeto_teatro)
* **API Backend REST (Render):** `https://projeto-teatro.onrender.com`
* **Credenciais de Teste Administrativo:**
  * **Usuário / Identificador:** `admin` ou `admin@theatrum.com`
  * **Senha padrão:** `admin123`

---

## 2. TÉCNICAS DE ELICITAÇÃO DOS REQUISITOS

### 2.1 Técnicas Utilizadas e Dinâmica Metodológica

A elicitação de requisitos foi conduzida sob o modelo ágil participativo (*Customer-Centric Engineering*), integrando técnicas primárias e secundárias para mitigar ambiguidades e capturar necessidades tácitas:

1. **Entrevistas Semiestruturadas:**
   - Realizadas com o principal stakeholder da companhia (**Angelo Faria Turci**, Diretor Geral).
   - Foco na identificação de gargalos operacionais da rotina teatral: reenvio exaustivo de e-mails com projetos pesados para programadores culturais, fragmentação da prestação de contas financeiras e ausência de uma vitrine digital imersiva focada no espectador.

2. **Prototipação Evolutiva e Demonstração Interativa (Live Demos):**
   - Utilização de sessões com compartilhamento de tela no Google Meet para validação ao vivo dos incrementos de software.
   - O stakeholder navegou guiado pelos fluxos de tela, o que permitiu identificar de forma imediata a necessidade de separar o viés artístico (*Obras*) do viés logístico e cronológico (*Agenda*).

3. **Análise Documental de Artefatos Oficiais de Produção (Engenharia Reversa de Requisitos):**
   - Mineração de regras de negócio a partir de documentos jurídicos, editais de fomento e memoriais técnicos reais da companhia.
   - Dentre os artefatos analisados destacam-se: Edital Fluxos Fluminenses da SECEC/RJ, Rider Técnico de Som e Luz, Projeto de Encenação e Dramaturgia Poética do espetáculo *Da Janela, o Mar*, e o Portfólio de 14 anos da Theatrum.

4. **Elicitação Assíncrona e Análise de Mensagens (WhatsApp):**
   - Coleta de evidências visuais e registros fotográficos em tempo real enviados pelo stakeholder.
   - O stakeholder enviou prints de formulários legados da companhia apontando 23 campos essenciais de cadastro de elenco e equipe técnica (medidas para figurino, registros profissionais DRT/OMB, prontuário médico de alergias para turnês).

5. **Brainstorming e Sessões JAD (Joint Application Design):**
   - Discussão estruturada para desenhar novas experiências públicas: criação da aba "Memória", catálogo de "Projetos Futuros" em laboratório, área pública de "Press Kit Técnico" para obras em cartaz e o canal público "Tem uma ideia?".

### 2.2 Evidências Concretas e Rastreabilidade Documental

| Evidência | Identificador / Arquivo no Repositório | Data | Conteúdo Validado |
|---|---|:---:|---|
| **Ata de Reunião #01** | `docs/reunioes/2026-08-28_reuniao_01_stakeholder.md` | 28/08/2026 | Alinhamento inicial de escopo, separação Obras × Agenda, categoria Em Repertório e módulo de comprovantes. |
| **Ata de Reunião #02** | `docs/reunioes/2026-10-07_reuniao_02_stakeholder.md` | 07/10/2026 | Validação da nova navegação, criação do Press Kit, página Memória, formulário de ideias e prazo crítico de segurança. |
| **Transcrição Literal da Reunião** | `docs/reunioes/ixv-kgvh-bqc (2026-10-07 10_57 GMT-3) - Transcript.docx` | 07/10/2026 | Registro de 30 minutos em áudio e texto com todas as falas do stakeholder Angelo Turci e do desenvolvedor Fábio Figueiredo. |
| **Captura de Tela WhatsApp (Ficha Cadastral)** | `docs/reunioes/reuniao 2/WhatsApp Image 2026-10-07 at 11.07.22.jpeg` | 07/10/2026 | Print de tela do cadastro legado contendo os campos de saúde, medidas físicas e documentos do colaborador. |
| **Documentos Técnicos Oficiais** | `client/public/downloads/*.pdf` | Out/2026 | Rider Técnico, Projeto de Encenação, Dramaturgia poética e Portfólio Histórico oficial 2012–2026. |

---

## 3. REQUISITOS FUNCIONAIS (RF) E PRIORIZAÇÃO MOSCOW

### 3.1 Lista Detalhada de Requisitos Funcionais

* **RF01 — Catálogo e Classificação de Obras:** O sistema deve listar as obras teatrais da companhia, categorizadas pelos status `EM_CARTAZ`, `EM_REPERTORIO`, `PROJETO_FUTURO` e `ENCERRADA`, exibindo cartaz, sinopse, ficha técnica e fotos.
* **RF02 — Palco Visual Cinematográfico:** A página de detalhes da obra deve apresentar o pôster ou vídeo principal cobrindo panoramicamente a tela com overlays cênicos, carrossel unificado de mídias e controles intuitivos.
* **RF03 — Agenda Teatral com Georreferenciamento:** O sistema deve exibir a programação das apresentações em ordem cronológica com data de estreia, data de término, horário de sessão, teatro, mapa Leaflet interativo e link direto para traçar rota no Google Maps.
* **RF04 — Integração de Ingressos Externos:** O sistema deve permitir o cadastro de URLs de bilheterias oficiais (Sympla, Fever, etc.) e renderizar botões de chamada de ação (*"Comprar Ingresso"*) na página da obra e nos cards da Agenda.
* **RF05 — Área de Downloads Técnicos (Press Kit):** O sistema deve fornecer, exclusivamente para obras com status `EM_CARTAZ`, links diretos para download de arquivos técnicos (rider de iluminação/som, projeto de encenação, dramaturgia e clipping de imprensa).
* **RF06 — Linha do Tempo e Acervo Histórico ("Memória"):** O sistema deve apresentar a trajetória histórica da companhia desde a fundação em 2012, com marcos cronológicos, espetáculos premiados, filtros temáticos e botão de download do portfólio completo em PDF.
* **RF07 — Vitrine de Projetos Futuros na Home:** A página inicial deve dispor de uma seção dedicada aos espetáculos em concepção e laboratório cênico (status `PROJETO_FUTURO`).
* **RF08 — Formulário Público "Tem uma Ideia?":** O sistema deve disponibilizar formulário público na Home para recebimento de propostas de parceria ou textos dramáticos com validação de campos e aceite da LGPD.
* **RF09 — Painel de Triagem de Ideias:** O administrador deve possuir caixa de entrada para triar, filtrar por status (`NOVA`, `LIDA`, `RESPONDIDA`, `ARQUIVADA`), consultar contato (com link para WhatsApp) e gerenciar propostas recebidas.
* **RF10 — Formulário Público de Colaboradores:** Artistas e técnicos devem poder submeter proposta de ingresso na companhia via formulário web com dados essenciais e ficha artística/cênica opcional, acompanhada de consentimento de privacidade.
* **RF11 — Ficha Cadastral Completa no Admin:** O administrador deve poder cadastrar e atualizar todos os 23 campos estendidos de colaboradores (identificação, contato, documentos sigilosos, características físicas e saúde).
* **RF12 — Mascaramento de Dados Sensíveis (LGPD):** A API pública deve omitir da resposta JSON todos os dados fiscais e sensíveis de colaboradores, restringindo sua visualização à sessão de administradores autenticados.
* **RF13 — Autenticação Flexível de Administrador:** O sistema deve autenticar o administrador aceitando tanto o e-mail cadastrado quanto o identificador de usuário (`admin`), emitindo token JWT seguro.
* **RF14 — Recuperação de Acesso ("Esqueci minha senha"):** O sistema deve permitir a solicitação de token criptográfico temporário (validade de 1 hora) para redefinição de senha esquecida sem exposição de dados de usuário.
* **RF15 — Alteração de Senha Autenticada:** O administrador autenticado deve poder redefinir sua credencial de acesso diretamente no painel de configurações, validando a senha atual.
* **RF16 — Gestão de Propagandas e Comunicados:** O administrador deve poder criar, ordenar e ativar comunicados institucionais exibidos em carrossel na página inicial.
* **RF17 — Módulo de Comprovantes de Pagamento:** O sistema deve permitir ao administrador anexar notas e comprovantes de pagamentos (PDF/imagens) associados a peças e produções.
* **RF18 — Interações Lúdicas ("Quarto do Joca"):** Experiência interativa infantojuvenil com ilustrações animadas e narrativa cênica gamificada.

### 3.2 Matriz de Priorização MoSCoW

| Categoria MoSCoW | Requisitos Alocados | Justificativa Técnica / Estratégica |
|---|---|---|
| **Must Have (Obrigatório)** | RF01, RF02, RF03, RF04, RF05, RF06, RF08, RF10, RF11, RF12, RF13, RF14, RF15 | Núcleo essencial do sistema acordado em contrato: o site precisa divulgar peças, orientar o público na agenda, permitir venda de ingressos, disponibilizar materiais a curadores e operar sob segurança estrita da LGPD. |
| **Should Have (Importante)** | RF07, RF09, RF16 | Agrega grande valor competitivo e institucional à companhia (vitrine de ideias futuras e canal de comunicação dinâmica na Home). |
| **Could Have (Desejável)** | RF17 | Centralização de recibos fiscais; agrega conveniência administrativa, mas não impede o lançamento público do site. |
| **Won't Have (Postergado)** | RF18 | Depende do fornecimento de ilustrações autorais e assets gráficos que não faziam parte da entrega de novembro/2026. |

---

## 4. REQUISITOS NÃO FUNCIONAIS (RNF) — ISO/IEC 25010 E LGPD

### 4.1 Segurança e Privacidade da Informação (ISO 25010: Security & LGPD)
* **RNF-SEG-01 (Criptografia de Senhas):** As credenciais de acesso devem ser transformadas em hashes unidirecionais utilizando o algoritmo **Bcrypt** com fator de custo de 10 rodadas de salt antes de qualquer persistência em disco.
* **RNF-SEG-02 (Autorização Stateless JWT):** O controle de acesso a rotas administrativas deve ocorrer através de cabeçalhos HTTP `Authorization: Bearer <token>`, com tokens assinados digitalmente via HMAC SHA-256 e expiração máxima de 24 horas.
* **RNF-SEG-03 (Minimização e Mascaramento LGPD - Art. 6º, III):** Endpoints públicos de colaboradores devem retornar apenas dados de identificação artística. CPF, RG, celular, dados médicos e histórico financeiro são bloqueados em nível de serviço Prisma caso o usuário não possua papel `ADMIN`.
* **RNF-SEG-04 (Proteção contra Ameaças Web e Rate Limit):** O middleware Express deve injetar cabeçalhos HTTP de segurança via **Helmet**, aplicar política estrita de **CORS** para a origem autorizada do GitHub Pages e restringir o formulário de ideias a 10 requisições por hora por IP via `express-rate-limit`.

### 4.2 Desempenho e Eficiência de Recursos (ISO 25010: Performance Efficiency)
* **RNF-DES-01 (Tempo de Resposta dos Serviços):** O tempo médio de resposta da API para listagens paginadas (obras, colaboradores, memória) não deve exceder **300 ms** em regime nominal.
* **RNF-DES-02 (Divisão de Código e Lazy Loading):** A aplicação cliente deve implementar carregamento tardio de rotas (`React.lazy` e `Suspense`) e particionamento manual de pacotes (`manualChunks` no Vite para Leaflet e React), garantindo que o bundle inicial não ultrapasse **250 kB** comprimido em Gzip.
* **RNF-DES-03 (Persistência Binária contra Filesystem Efêmero):** Arquivos de upload enviados via `multer` devem ser armazenados de forma binária (`bytea`/`Bytes`) na tabela relacional `Arquivo` do PostgreSQL, tornando os uploads imunes à reinicialização de instâncias efêmeras em servidores PaaS (Render).

### 4.3 Usabilidade, Ergonomia e Acessibilidade (ISO 25010: Usability)
* **RNF-USA-01 (Design Responsivo e Cinemático):** A interface deve renderizar perfeitamente em telas com larguras a partir de **320 px** até monitores Ultra-Wide (4K), utilizando design tokens flexíveis e hierarquia tipográfica consistente.
* **RNF-USA-02 (Feedback Visual Imediato):** Toda submissão assíncrona deve desabilitar botões interativos, exibir indicadores visuais de carregamento (*spinners*) e fornecer alertas contextuais de sucesso ou erro com mensagens em português do Brasil.

### 4.4 Confiabilidade e Disponibilidade (ISO 25010: Reliability)
* **RNF-DIS-01 (Hospedagem Híbrida e Alta Resiliência):** O frontend deve operar com disponibilidade de 99,9% via rede global de distribuição de conteúdo (CDN) do **GitHub Pages**, enquanto a API Express opera de forma independente no cluster gerenciado do **Render.com**.
* **RNF-DIS-02 (Tolerância a Latência e Cold Start):** O cliente Axios deve configurar *timeout* de **60.000 ms** (60 segundos) com interceptor automático para tolerar o aquecimento de instâncias (*cold start*) do plano gratuito do Render sem quebrar a navegação do usuário.

### 4.5 Manutenibilidade e Testabilidade (ISO 25010: Maintainability)
* **RNF-MAN-01 (Arquitetura Limpa em Camadas - SOLID):** O código backend deve desacoplar responsabilidades em camadas puras: Rotas (Roteamento HTTP), Validadores (funções puras sem efeitos colaterais), Controladores (Tratamento de Req/Res) e Serviços (Regras de negócio e Prisma).
* **RNF-MAN-02 (Cobertura de Testes de Regressão):** A base de código deve ser protegida por no mínimo 80% de cobertura de testes automatizados, combinando testes de integração de API no backend com **Jest + Supertest** e testes de componentes visuais no frontend com **Vitest + Testing Library**.

---

## 5. HISTÓRIAS DE USUÁRIO (USER STORIES) E BACKLOG

### 5.1 Catálogo de User Stories com Critérios BDD / Gherkin

#### [US01] Consulta de Espetáculos e Palco Imersivo
* **Como** espectador ou amante de teatro,  
* **Quero** visualizar a página da obra com cartaz em tela cheia, sinopse e elenco,  
* **Para que** eu possa compreender a estética e o conceito artístico da peça antes de assistir.
```gherkin
Cenário: Visualização bem-sucedida de detalhes de obra teatral
  Dado que o espetáculo "Da Janela, o Mar" está catalogado no sistema
  Quando o espectador acessa a rota "/obras/1"
  Então o sistema renderiza o pôster cênico em destaque cobrindo o topo da página
  E exibe a sinopse poética do espetáculo e a listagem de integrantes do elenco
  E apresenta botões de ação para consulta de datas na Agenda
```

#### [US02] Consulta da Agenda Teatral e Rotas com GPS
* **Como** espectador de teatro,  
* **Quero** consultar as apresentações em cartaz com horários, teatros e mapas interativos,  
* **Para que** eu consiga traçar minha rota de deslocamento até o local do espetáculo.
```gherkin
Cenário: Visualizar localização de apresentação e abrir no Google Maps
  Dado que existem sessões cadastradas para o Centro de Artes da UFF
  Quando o espectador navega até a página "/agenda"
  Então visualiza o card com data, horário de início e endereço completo
  Quando clica no botão "Ver no Mapa 📍"
  Então um modal com mapa Leaflet é carregado com marcador no endereço da UFF
  E o botão "Abrir no Google Maps ↗" direciona para o traçado de rotas em nova aba
```

#### [US03] Download de Materiais Técnicos (Press Kit) por Curadores
* **Como** curador de festival ou programador de centro cultural,  
* **Quero** realizar o download do rider técnico e do projeto de encenação de uma obra em cartaz,  
* **Para que** eu possa avaliar imediatamente os requisitos de som, luz e palco sem necessidade de contato prévio por e-mail.
```gherkin
Cenário: Curador baixa rider técnico de peça em temporada
  Dado que a peça "Da Janela, o Mar" possui o status "EM_CARTAZ"
  Quando o curador abre a página da peça
  Então visualiza a seção "Informações Técnicas & Downloads"
  E ao clicar no botão "Baixar ↓" do Rider Técnico
  Então o navegador inicia o download do arquivo "RIDER_TECNICO_Da_Janela_o_Mar.pdf"
```

#### [US04] Envio de Proposta pelo Canal "Tem uma Ideia?"
* **Como** dramaturgo ou produtor parceiro,  
* **Quero** enviar uma proposta de espetáculo ou texto autoral pela página inicial,  
* **Para que** a direção da Theatrum Mundi conheça minha ideia para futuras montagens.
```gherkin
Cenário: Submissão de proposta artística com consentimento LGPD
  Dado que o usuário preenche nome, e-mail, telefone e a descrição de sua proposta
  E marca a caixa de autorização de tratamento de dados pessoais conforme a LGPD
  Quando aciona o botão "Enviar Minha Proposta"
  Então o sistema armazena a mensagem na tabela "mensagens_ideias" com status "NOVA"
  E exibe confirmação visual de agradecimento na tela
```

#### [US05] Gestão Segura de Colaboradores e Proteção de Privacidade
* **Como** diretor administrativo da companhia,  
* **Quero** manter a ficha cadastral completa dos integrantes (com prontuário médico e documentos),  
* **Para que** a equipe esteja respaldada em turnês enquanto os dados sigilosos são resguardados de acessos externos.
```gherkin
Cenário: Ocultação de dados sigilosos para requisições não autenticadas
  Dado que o colaborador possui CPF, RG e histórico de alergias cadastrados
  Quando uma requisição pública invoca o endpoint "GET /api/colaboradores"
  Então a resposta HTTP 200 não deve conter os campos "cpf", "rg" e "saude"
  Quando o administrador autentica-se com JWT e consulta o colaborador no painel
  Então todos os 23 campos cadastrais são exibidos de forma irrestrita
```

#### [US06] Recuperação e Alteração de Senha do Administrador
* **Como** administrador da plataforma,  
* **Quero** solicitar recuperação de acesso caso esqueça minha senha,  
* **Para que** eu consiga redefinir minha credencial sem intervenção direta no banco de dados.
```gherkin
Cenário: Redefinição de senha através de token temporário
  Dado que o administrador solicita recuperação para o usuário "admin"
  Quando o sistema valida a solicitação
  Então emite um token com validade de 60 minutos
  Quando o administrador envia o token e sua nova senha de 8 caracteres
  Então a nova senha é gravada com hash Bcrypt e a mensagem de sucesso é retornada
```

### 5.2 Evolução Comparativa: Product Backlog Inicial vs. Atual

| Backlog Inicial (Sprint 0 / Ata #01) | Backlog Atualizado e Entregue (Pós Ata #02) | Status de Entrega |
|---|---|:---:|
| CRUD Simples de Peças e Sinopse | Catálogo com 4 Status (`EM_CARTAZ`, `EM_REPERTORIO`, `PROJETO_FUTURO`, `ENCERRADA`) e Hero Palco | 🟢 Concluído |
| Cadastro Básico de Colaboradores (7 campos) | Ficha Estendida com 23 campos, separação em sub-abas e mascaramento LGPD em runtime | 🟢 Concluído |
| Lista Unificada de Peças e Datas | Separação conceitual Obras × Agenda com Leaflet e rotas no Google Maps | 🟢 Concluído |
| *Não previsto inicialmente* | Área de Downloads Técnicos (Press Kit) exclusiva para obras em temporada | 🟢 Concluído |
| *Não previsto inicialmente* | Página Memória e Acervo Histórico (2012–2026) com download do portfólio em PDF | 🟢 Concluído |
| *Não previsto inicialmente* | Canal Público "Tem uma ideia?" e caixa de entrada de propostas no admin | 🟢 Concluído |
| *Não previsto inicialmente* | Botão dinâmico de ingressos integrado com Sympla/Fever na obra e na Agenda | 🟢 Concluído |
| Login por e-mail genérico hardcoded | Autenticação flexível por usuário (`admin`), "Esqueci minha senha" e troca de senha no painel | 🟢 Concluído |
| Upload em disco local | Uploads binários persistidos no PostgreSQL do Render para tolerar filesystem efêmero | 🟢 Concluído |

---

## 6. MODELAGEM UML DE REQUISITOS

### 6.1 Diagrama de Casos de Uso Geral

```
                              ┌──────────────────────────────────────────────────────────────┐
                              │                    SISTEMA THEATRUM MUNDI                    │
                              ├──────────────────────────────────────────────────────────────┤
                              │                                                              │
   🎭 ESPECTADOR ────────────┼──► [ UC01: Consultar Catálogo de Obras e Elenco ]             │
         │                    │                                                              │
         ├────────────────────┼──► [ UC02: Consultar Agenda Teatral e Rotas ]                │
         │                    │          │                                                   │
         │                    │          └── (include) ──► [ UC03: Comprar Ingressos ]       │
         │                    │                                                              │
         ├────────────────────┼──► [ UC05: Consultar Memória e Baixar Portfólio ]            │
         │                    │                                                              │
         └────────────────────┼──► [ UC06: Enviar Proposta / Ideia pelo Canal Público ]      │
                              │                                                              │
   🎪 PROGRAMADOR / CURADOR ─┼──► [ UC04: Baixar Press Kit Técnico de Obra em Cartaz ]       │
                              │                                                              │
   👥 COLABORADOR ────────────┼──► [ UC07: Realizar Pré-cadastro de Integrante ]             │
                              │                                                              │
   🔐 ADMINISTRADOR ──────────┼──► [ UC08: Autenticar / Recuperar Acesso (Login/Senha) ]      │
         │                    │                                                              │
         ├────────────────────┼──► [ UC09: Gerenciar Obras, Temporadas e Locais ]            │
         │                    │                                                              │
         ├────────────────────┼──► [ UC10: Gerenciar Ficha de Colaboradores (LGPD) ]         │
         │                    │                                                              │
         ├────────────────────┼──► [ UC11: Triar e Gerenciar Caixa de Ideias ]               │
         │                    │                                                              │
         └────────────────────┼──► [ UC12: Gerenciar Propagandas e Configurações do Site ]   │
                              │                                                              │
                              └──────────────────────────────────────────────────────────────┘
```

### 6.2 Especificação Formal dos Casos de Uso Críticos

#### [UC02] Consultar Agenda Teatral e Rotas
* **Ator Principal:** Espectador / Visitante Geral.
* **Atores Secundários:** Provedor de Cartografia OpenStreetMap / Leaflet, Google Maps.
* **Pré-condições:** Apresentações teatrais cadastradas com datas, horários e endereços válidos.
* **Garantia de Sucesso (Pós-condição):** O espectador obtém informações logísticas da sessão, visualiza a localização em mapa interativo ou é encaminhado para compra de ingresso.
* **Fluxo Principal:**
  1. O espectador clica na aba **Agenda** do cabeçalho.
  2. O sistema busca os eventos ativos via requisição assíncrona à API e renderiza a lista cronológica de apresentações.
  3. O espectador utiliza os filtros disponíveis (busca textual por peça/teatro ou filtro dropdown por cidade).
  4. O espectador clica no botão **"Ver no Mapa 📍"** de uma sessão específica.
  5. O sistema abre uma janela modal contendo o mapa Leaflet renderizado nas coordenadas de latitude e longitude do teatro.
  6. O espectador clica em **"Abrir no Google Maps ↗"** para traçar rotas de transporte.
  7. O espectador fecha o modal e retorna à navegação.
* **Fluxo Alternativo A (Compra de Ingresso):**
  - No passo 3, caso a sessão possua link de ingresso ativo, o espectador clica em **"🎟️ Ingressos"**.
  - O sistema abre a bilheteria oficial da peça (Sympla/Fever) em nova aba do navegador.
* **Fluxo de Exceção (Endereço sem Coordenadas GPS):**
  - No passo 4, se o teatro não possuir coordenadas geográficas cadastradas, o botão de mapa interno é substituído por um link direto que pesquisa o logradouro literal no Google Maps.

#### [UC04] Baixar Press Kit Técnico de Obra em Cartaz
* **Ator Principal:** Programador de Festival, Curador ou Gestor de Teatro.
* **Pré-condições:** O espetáculo deve estar com status `EM_CARTAZ` e possuir anexos técnicos vinculados.
* **Garantia de Sucesso:** O curador obtém cópia local do Rider Técnico ou Projeto de Encenação em PDF.
* **Fluxo Principal:**
  1. O curador navega até a listagem de Obras e seleciona o espetáculo em temporada.
  2. O sistema carrega os dados e verifica que o status é `EM_CARTAZ`.
  3. O sistema renderiza a seção **"Informações Técnicas & Downloads"** exibindo os cards dos documentos (Rider Técnico, Projeto, Dramaturgia e Ficha Técnica).
  4. O curador clica no botão **"Baixar ↓"** do Rider Técnico.
  5. O navegador faz o download do arquivo `RIDER_TECNICO_Da_Janela_o_Mar.pdf`.
* **Fluxo Alternativo (Obra com Outro Status):**
  - Se a peça consultada estiver com status `EM_REPERTORIO`, `PROJETO_FUTURO` ou `ENCERRADA`, a seção de downloads técnicos permanece oculta, impedindo download indevido de projetos fora de temporada.

#### [UC10] Gerenciar Ficha de Colaboradores com Proteção LGPD
* **Ator Principal:** Administrador do Theatrum Mundi.
* **Pré-condições:** Administrador autenticado com token JWT ativo.
* **Garantia de Sucesso:** Os dados sensíveis são salvos no banco relacional sob isolamento de privilégios.
* **Fluxo Principal:**
  1. O administrador acessa o painel administrativo e clica na aba **Colaboradores**.
  2. O sistema exibe a tabela de integrantes da companhia com indicadores visuais.
  3. O administrador clica no botão `✏️` para editar um colaborador.
  4. O sistema abre o modal com cinco sub-abas (*Identificação, Contato, Documentos Sensíveis, Cênico & Saúde, Histórico*).
  5. O administrador edita campos sensíveis (como CPF, RG, DRT, dados de saúde e histórico financeiro).
  6. O administrador aciona **"Salvar Alterações"**.
  7. O sistema valida os tipos de dados via `colaboradorValidator.js` e executa a atualização no PostgreSQL.
  8. A listagem é recarregada e uma notificação de sucesso é exibida.
* **Fluxo de Exceção (Tentativa de Violação de Acesso):**
  - Se uma requisição pública desautenticada tentar invocar a rota de atualização, o middleware `auth.js` intercepta e encerra a conexão com erro `HTTP 401 Unauthorized`.

---

## 7. MATRIZ DE RASTREABILIDADE BIDIRECIONAL

A tabela abaixo conecta os requisitos de engenharia, casos de uso, artefatos de código de frontend e backend, e os arquivos de teste automatizado implementados no repositório:

| ID Requisito | Caso de Uso | Arquivo Frontend (Interface) | Arquivo Backend (API/Regra) | Teste Automatizado de Verificação |
|:---:|:---:|---|---|---|
| **RF01** / **RF02** | UC01 | `client/src/pages/PecasPage.jsx`<br>`client/src/pages/PecaDetalhesPage.jsx` | `server/src/routes/pecas.js`<br>`server/src/services/pecaService.js` | `client/src/__tests__/components/PecaDetalhesPage.test.jsx`<br>`server/src/__tests__/validators/pecaValidator.test.js` |
| **RF03** | UC02 | `client/src/pages/AgendaPage.jsx`<br>`client/src/components/common/MapView.jsx` | `server/src/controllers/locaisController.js`<br>`server/src/services/pecaService.js` | `client/src/__tests__/components/AgendaPage.test.jsx` |
| **RF04** | UC02, UC03 | `client/src/pages/PecaDetalhesPage.jsx`<br>`client/src/pages/AgendaPage.jsx` | Coluna `linkIngresso` em `Peca`<br>`server/src/services/pecaService.js` | `client/src/__tests__/components/AgendaPage.test.jsx`<br>`client/src/__tests__/components/PecaDetalhesPage.test.jsx` |
| **RF05** | UC04 | `client/src/pages/PecaDetalhesPage.jsx` | Tabela `DownloadTecnico`<br>`server/src/controllers/pecasController.js` | `client/src/__tests__/components/PecaDetalhesPage.test.jsx` |
| **RF06** | UC05 | `client/src/pages/MemoriaPage.jsx`<br>`client/src/components/layout/Header.jsx` | `server/src/routes/memoria.js`<br>`server/src/services/memoriaService.js` | `server/src/__tests__/services/memoriaService.test.js`<br>`client/src/__tests__/components/Header.test.jsx` |
| **RF07** | UC01 | `client/src/pages/HomePage.jsx` | `server/src/constants/statusPeca.js` | `client/src/__tests__/components/HomePage.test.jsx`<br>`client/src/__tests__/constants/statusPeca.test.js` |
| **RF08** / **RF09** | UC06, UC11 | `client/src/pages/HomePage.jsx`<br>`client/src/components/admin/AbaIdeias.jsx` | `server/src/routes/ideias.js`<br>`server/src/services/ideiaService.js` | `server/src/__tests__/services/ideiaService.test.js`<br>`client/src/__tests__/components/AbaIdeias.test.jsx` |
| **RF10** / **RF11** | UC07, UC10 | `client/src/pages/ColaboradorPage.jsx`<br>`client/src/components/admin/AbaColaboradores.jsx` | `server/src/routes/colaboradores.js`<br>`server/src/services/colaboradorService.js` | `server/src/__tests__/validators/colaboradorValidator.test.js` |
| **RF12** (LGPD) | UC10 | Projeção segura de tela no client | Projeção `ehAdmin` no `colaboradorService.js` | `server/src/__tests__/middleware/auth.test.js`<br>`server/src/__tests__/validators/colaboradorValidator.test.js` |
| **RF13** / **RF14** / **RF15** | UC08 | `client/src/components/admin/AdminLogin.jsx`<br>`client/src/components/admin/AbaConfig.jsx` | `server/src/routes/auth.js`<br>`server/src/services/authService.js` | `server/src/__tests__/services/authService.test.js`<br>`server/src/__tests__/validators/authValidator.test.js`<br>`client/src/__tests__/components/AdminLogin.test.jsx` |
| **RF16** | UC12 | `client/src/components/common/PropagandasSection.jsx`<br>`client/src/components/admin/AbaPropagandas.jsx` | `server/src/routes/propagandas.js`<br>`server/src/services/propagandaService.js` | `server/src/__tests__/routes/propagandas.test.js`<br>`client/src/__tests__/components/PropagandasSection.test.jsx` |
| **RNF-SEG-01..04** | Todos | `client/src/services/api.js` | `server/src/middleware/auth.js`<br>`server/src/app.js` (Helmet/Cors/Limit) | `server/src/__tests__/middleware/auth.test.js`<br>`server/src/__tests__/middleware/validateId.test.js` |
| **RNF-DES-01..03** | Todos | `client/vite.config.js`<br>`client/src/App.jsx` | Tabela `Arquivo` no `schema.prisma`<br>`server/src/services/fileService.js` | `server/src/__tests__/services/fileService.test.js` |

---

## 8. REFERÊNCIAS BIBLIOGRÁFICAS E NORMATIVAS

1. **ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS (ABNT).** *NBR ISO/IEC 25010: Sistemas e engenharia de software — Requisitos e avaliação da qualidade de produto de software (SQuaRE) — Modelos de qualidade de sistema e de software*. Rio de Janeiro: ABNT, 2014.
2. **BRASIL.** *Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD)*. Diário Oficial da União: Brasília, DF, 15 ago. 2018.
3. **ISO/IEC/IEEE.** *ISO/IEC/IEEE 26515:2018 — Systems and software engineering — Developing information for users in an agile environment*. Genebra: International Organization for Standardization, 2018.
4. **PRESSMAN, Roger S.; MAXIM, Bruce R.** *Engenharia de Software: uma abordagem profissional*. 9. ed. Porto Alegre: AMGH, 2021.
5. **SOMMERVILLE, Ian.** *Engenharia de Software*. 10. ed. São Paulo: Pearson Education do Brasil, 2019.
6. **WIEGERS, Karl; BEATTY, Joy.** *Software Requirements*. 3. ed. Redmond: Microsoft Press, 2013.

