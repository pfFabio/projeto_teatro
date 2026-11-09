#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Gerador de Documento Word (.docx) Acadêmico ABNT
Documento de Engenharia de Requisitos de Software — Theatrum Mundi
Autor: Fábio Pinto Figueiredo | Matrícula: 202413741
Univassouras — Campus Maricá
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Configuração de Margens Padrão ABNT (Superior 3cm, Esquerda 3cm, Inferior 2cm, Direita 2cm)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.18)      # ~3.0 cm
        section.left_margin = Inches(1.18)     # ~3.0 cm
        section.bottom_margin = Inches(0.79)   # ~2.0 cm
        section.right_margin = Inches(0.79)    # ~2.0 cm

    # Estilos padrão
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Arial'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b)
    style_normal.paragraph_format.line_spacing = 1.25
    style_normal.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # CAPA ABNT
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run("UNIVERSIDADE DE VASSOURAS — UNIVASSOURAS\nCAMPUS UNIVERSITÁRIO DE MARICÁ\nCURSO DE BACHARELADO EM ENGENHARIA DE SOFTWARE\n6º PERÍODO LETIVO")
    r_inst.font.bold = True
    r_inst.font.size = Pt(12)
    p_inst.paragraph_format.space_after = Pt(90)

    p_autor = doc.add_paragraph()
    p_autor.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_autor = p_autor.add_run("FÁBIO PINTO FIGUEIREDO\nMATRÍCULA: 202413741")
    r_autor.font.bold = True
    r_autor.font.size = Pt(13)
    p_autor.paragraph_format.space_after = Pt(110)

    p_titulo = doc.add_paragraph()
    p_titulo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tit = p_titulo.add_run("ESPECIFICAÇÃO DE ENGENHARIA DE REQUISITOS DE SOFTWARE")
    r_tit.font.bold = True
    r_tit.font.size = Pt(15)
    r_tit.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Projeto Theatrum: Sistema Integrado de Gestão, Circulação e Difusão do Patrimônio Teatral")
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    p_sub.paragraph_format.space_after = Pt(130)

    p_rodape = doc.add_paragraph()
    p_rodape.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_rod = p_rodape.add_run("MARICÁ – RJ\n2026")
    r_rod.font.bold = True
    r_rod.font.size = Pt(11)

    doc.add_page_break()

    # -------------------------------------------------------------
    # FOLHA DE ROSTO
    # -------------------------------------------------------------
    p_fr_autor = doc.add_paragraph()
    p_fr_autor.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fr_aut = p_fr_autor.add_run("FÁBIO PINTO FIGUEIREDO\nMATRÍCULA: 202413741")
    r_fr_aut.font.bold = True
    r_fr_aut.font.size = Pt(12)
    p_fr_autor.paragraph_format.space_after = Pt(100)

    p_fr_tit = doc.add_paragraph()
    p_fr_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fr_t = p_fr_tit.add_run("ESPECIFICAÇÃO DE ENGENHARIA DE REQUISITOS DE SOFTWARE\nPROJETO THEATRUM MUNDI")
    r_fr_t.font.bold = True
    r_fr_t.font.size = Pt(14)
    p_fr_tit.paragraph_format.space_after = Pt(50)

    # Nota de Natureza Acadêmica à Direita
    p_nat = doc.add_paragraph()
    p_nat.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_nat.paragraph_format.left_indent = Inches(3.0)
    r_nat = p_nat.add_run(
        "Trabalho acadêmico e técnico de Especificação de Requisitos de Software "
        "apresentado como requisito parcial de avaliação para a disciplina de Engenharia de Software "
        "/ Projeto Integrador do curso de Bacharelado em Engenharia de Software da Universidade "
        "de Vassouras (Univassouras), Campus Maricá, sob conformidade com a norma ISO/IEC 25010 "
        "e a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)."
    )
    r_nat.font.size = Pt(10)
    p_nat.paragraph_format.space_after = Pt(140)

    p_fr_rod = doc.add_paragraph()
    p_fr_rod.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fr_r = p_fr_rod.add_run("MARICÁ – RJ\n2026")
    r_fr_r.font.bold = True
    r_fr_r.font.size = Pt(11)

    doc.add_page_break()

    # -------------------------------------------------------------
    # SUMÁRIO
    # -------------------------------------------------------------
    p_sum = doc.add_paragraph()
    r_sum = p_sum.add_run("SUMÁRIO")
    r_sum.font.bold = True
    r_sum.font.size = Pt(14)
    p_sum.paragraph_format.space_after = Pt(12)

    itens_sumario = [
        "1. INTRODUÇÃO E CONTEXTUALIZAÇÃO DO PROJETO",
        "2. TÉCNICAS DE ELICITAÇÃO DOS REQUISITOS",
        "   2.1 Técnicas Utilizadas e Dinâmica Metodológica",
        "   2.2 Evidências Concretas e Rastreabilidade Documental",
        "3. REQUISITOS FUNCIONAIS (RF) E PRIORIZAÇÃO MOSCOW",
        "   3.1 Lista Detalhada de Requisitos Funcionais",
        "   3.2 Matriz de Priorização MoSCoW",
        "4. REQUISITOS NÃO FUNCIONAIS (RNF) — ISO/IEC 25010 E LGPD",
        "   4.1 Segurança e Privacidade da Informação",
        "   4.2 Desempenho e Eficiência de Recursos",
        "   4.3 Usabilidade, Ergonomia e Acessibilidade",
        "   4.4 Confiabilidade e Disponibilidade",
        "   4.5 Manutenibilidade e Testabilidade",
        "5. HISTÓRIAS DE USUÁRIO (USER STORIES) E BACKLOG",
        "   5.1 Catálogo de User Stories com Critérios BDD / Gherkin",
        "   5.2 Evolução Comparativa: Product Backlog Inicial vs. Atual",
        "6. MODELAGEM UML DE REQUISITOS",
        "   6.1 Diagrama de Casos de Uso (UML)",
        "   6.2 Especificação Formal dos Casos de Uso Críticos",
        "7. MATRIZ DE RASTREABILIDADE BIDIRECIONAL",
        "8. REFERÊNCIAS BIBLIOGRÁFICAS E NORMATIVAS"
    ]
    for item in itens_sumario:
        p_it = doc.add_paragraph()
        r_it = p_it.add_run(item)
        r_it.font.size = Pt(10.5)
        p_it.paragraph_format.space_after = Pt(3)

    doc.add_page_break()

    # -------------------------------------------------------------
    # SEÇÃO 1: INTRODUÇÃO
    # -------------------------------------------------------------
    def add_h1(text):
        p = doc.add_paragraph()
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(13)
        r.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        r = p.add_run(text)
        r.font.bold = True
        r.font.size = Pt(11.5)
        r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        return p

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.bold = True
        p.add_run(text)
        p.paragraph_format.space_after = Pt(6)
        return p

    add_h1("1. INTRODUÇÃO E CONTEXTUALIZAÇÃO DO PROJETO")
    add_p(
        "O presente trabalho de Engenharia de Requisitos de Software formaliza a especificação, modelagem "
        "e rastreabilidade técnica do sistema Theatrum Mundi, desenvolvido no âmbito acadêmico pelo discente "
        "Fábio Pinto Figueiredo (Matrícula: 202413741) no 6º período do curso de Bacharelado em Engenharia de Software "
        "da Universidade de Vassouras (Univassouras), Campus Maricá."
    )
    add_p(
        "O sistema Theatrum Mundi consiste em uma solução full-stack moderna concebida para atender à demanda real "
        "de profissionalização da gestão e difusão cultural de companhias teatrais profissionais no Estado do Rio de Janeiro. "
        "O projeto atende como organização-parceira a companhia teatral Theatrum Mundi, sediada em Maricá/RJ e fundada "
        "em 2012 pelo dramaturgo e encenador Angelo Faria Turci. A plataforma contempla o gerenciamento do catálogo de "
        "obras, agenda georreferenciada de apresentações, difusão de materiais técnicos (Press Kit) para programadores de teatros, "
        "resguardo da memória da companhia, canal de ideação e governança de dados pessoais em estrita observância à "
        "Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e aos atributos de qualidade da norma ISO/IEC 25010."
    )
    add_p(
        "Acesso ao Protótipo Funcional e Repositório:\n"
        "• Protótipo em Produção (Web): https://pffabio.github.io/projeto_teatro/\n"
        "• Repositório de Código-Fonte (GitHub): https://github.com/pfFabio/projeto_teatro\n"
        "• API Backend em Produção (Render): https://projeto-teatro.onrender.com\n"
        "• Credenciais de Acesso Administrativo: Usuário 'admin' ou 'admin@theatrum.com' | Senha: 'admin123'",
        bold_prefix="Ambiente de Homologação e Testes: "
    )

    # -------------------------------------------------------------
    # SEÇÃO 2: TÉCNICAS DE ELICITAÇÃO
    # -------------------------------------------------------------
    add_h1("2. TÉCNICAS DE ELICITAÇÃO DOS REQUISITOS")
    add_h2("2.1 Técnicas Utilizadas e Dinâmica Metodológica")
    add_p(
        "A engenharia de requisitos do Theatrum Mundi foi estruturada através de uma abordagem empírica, ágil e participativa "
        "conduzida diretamente com o principal stakeholder da companhia (Angelo Faria Turci), combinando cinco técnicas consolidadas:"
    )

    tecnicas = [
        ("Entrevistas Semiestruturadas: ", "Reuniões formais via Google Meet com pautas orientadas a desafios de negócio, permitindo explorar a rotina da companhia com festivais, editais públicos (SECEC/RJ) e comunicação de equipe."),
        ("Prototipação Evolutiva (Live Demos): ", "Demonstração ao vivo de protótipos funcionais com compartilhamento de tela. Esse método permitiu validar e corrigir imediatamente a separação conceitual entre Obras (experiência cênica/sensorial) e Agenda (logística/datas/mapas)."),
        ("Análise Documental de Artefatos Oficiais: ", "Engenharia reversa e extração de regras a partir de editais oficiais (Edital Fluxos Fluminenses da SECEC/RJ), projetos de encenação, fichas técnicas e do portfólio institucional de 14 anos da companhia."),
        ("Elicitação Assíncrona e Coleta de Capturas de Tela: ", "Envio de evidências pelo stakeholder via WhatsApp com prints de formulários legados da companhia, viabilizando o levantamento dos 23 campos cadastrais completos da equipe."),
        ("Brainstorming e Sessões JAD (Joint Application Design): ", "Ideação conjunta para resolver dores de produção, resultando na concepção da área de downloads técnicos (press kit) para programadores e no canal público 'Tem uma ideia?'.")
    ]
    for pre, txt in tecnicas:
        add_p(txt, bold_prefix=pre)

    add_h2("2.2 Evidências Concretas e Rastreabilidade Documental")
    add_p(
        "Todas as reuniões e decisões foram catalogadas em atas com transcrição integral e arquivamento no repositório oficial:"
    )

    # Tabela de Evidências
    table_ev = doc.add_table(rows=1, cols=4)
    table_ev.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table_ev.rows[0].cells
    headers = ["Artefato / Evidência", "Caminho no Repositório", "Data", "Decisões Principais"]
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        set_cell_background(hdr_cells[i], "0f172a")
        p = hdr_cells[i].paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(0xff, 0xff, 0xff)
        p.runs[0].font.size = Pt(9.5)

    ev_data = [
        ("Ata de Reunião #01", "docs/reunioes/2026-08-28_reuniao_01_stakeholder.md", "28/08/2026", "Apresentação inicial, separação Obras × Agenda e status Em Repertório."),
        ("Ata de Reunião #02", "docs/reunioes/2026-10-07_reuniao_02_stakeholder.md", "07/10/2026", "Aprovação da navegação, criação do Press Kit, página Memória e prazo de segurança."),
        ("Transcrição Literal", "docs/reunioes/ixv-kgvh-bqc...Transcript.docx", "07/10/2026", "Registro literal de 30 minutos em áudio e texto de falas do stakeholder."),
        ("Capturas de Tela WhatsApp", "docs/reunioes/reuniao 2/*.jpeg", "07/10/2026", "Evidência visual dos 23 campos cadastrais exigidos para os colaboradores.")
    ]
    for art, cam, dt, dec in ev_data:
        row = table_ev.add_row().cells
        row[0].text = art
        row[1].text = cam
        row[2].text = dt
        row[3].text = dec
        for cell in row:
            set_cell_margins(cell, 80, 80, 100, 100)
            cell.paragraphs[0].runs[0].font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # SEÇÃO 3: REQUISITOS FUNCIONAIS E MOSCOW
    # -------------------------------------------------------------
    add_h1("3. REQUISITOS FUNCIONAIS (RF) E PRIORIZAÇÃO MOSCOW")
    add_h2("3.1 Lista Detalhada de Requisitos Funcionais")
    
    rfs = [
        ("RF01 — Catálogo de Obras: ", "O sistema deve exibir as peças teatrais classificadas em EM_CARTAZ, EM_REPERTORIO, PROJETO_FUTURO e ENCERRADA com cartazes, sinopses e fichas técnicas."),
        ("RF02 — Palco Visual Cinematográfico: ", "A página de detalhes da obra deve apresentar pôster em destaque cobrindo panoramicamente a tela com overlays cênicos e carrossel unificado."),
        ("RF03 — Agenda Teatral Georreferenciada: ", "O sistema deve listar apresentações cronológicas com datas, horários, teatros, mapa Leaflet interativo e link para o Google Maps."),
        ("RF04 — Integração de Ingressos Externos: ", "O sistema deve permitir cadastro de URLs de bilheterias oficiais (Sympla/Fever) com botões destacados na obra e na Agenda."),
        ("RF05 — Área de Downloads Técnicos (Press Kit): ", "Exclusivamente para obras EM_CARTAZ, o sistema deve fornecer downloads de rider técnico, projeto de encenação, dramaturgia e clipping."),
        ("RF06 — Página Memória e Acervo Histórico: ", "O sistema deve apresentar linha do tempo dos trabalhos (2012–2026), marcos, premiações e download do portfólio oficial em PDF."),
        ("RF07 — Vitrine de Projetos Futuros na Home: ", "A página inicial deve destacar os espetáculos em concepção (status PROJETO_FUTURO)."),
        ("RF08 — Canal Público 'Tem uma Ideia?': ", "Formulário na Home para propostas de parceria e novos textos, com validação de campos e consentimento LGPD."),
        ("RF09 — Triagem de Ideias no Admin: ", "Painel administrativo para filtrar por status (NOVA, LIDA, RESPONDIDA, ARQUIVADA), consultar dados e contatar proponentes."),
        ("RF10 — Cadastro Público de Colaboradores: ", "Formulário público para artistas e técnicos enviarem pré-cadastro com dados cênicos opcionais e aceite da LGPD."),
        ("RF11 — Ficha Cadastral Estendida no Admin: ", "Gestão administrativa dos 23 campos completos de colaboradores (dados sensíveis, saúde, documentos e medidas)."),
        ("RF12 — Mascaramento de Dados Sensíveis (LGPD): ", "A API pública deve ocultar CPF, RG, saúde, valores financeiros, celular e endereço, liberando-os apenas para admin autenticado."),
        ("RF13 — Autenticação Flexível do Administrador: ", "Login suportando e-mail ou nome de usuário ('admin') com validação Bcrypt e token JWT."),
        ("RF14 — Recuperação de Acesso ('Esqueci minha senha'): ", "Solicitação de token criptográfico de 1 hora para redefinição de senha com validação de confirmação."),
        ("RF15 — Alteração de Senha Autenticada: ", "Interface no painel de configurações para o administrador logado atualizar sua credencial."),
        ("RF16 — Gestão de Propagandas e Comunicados: ", "Criação, ordenação e ativação de anúncios institucionais exibidos na página inicial."),
        ("RF17 — Módulo de Comprovantes de Pagamento: ", "Upload e arquivo de notas e recibos fiscais com acesso exclusivo do administrador."),
        ("RF18 — Interações Lúdicas ('Quarto do Joca'): ", "Experiência infantil interativa e gamificada com ilustrações animadas.")
    ]
    for pre, txt in rfs:
        add_p(txt, bold_prefix=pre)

    add_h2("3.2 Matriz de Priorização MoSCoW")
    add_p(
        "A priorização dos requisitos funcionais foi balizada pelo acordo firmado na Ata #02 com go-live pactuado para novembro/2026:"
    )

    table_moscow = doc.add_table(rows=1, cols=3)
    table_moscow.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_m = table_moscow.rows[0].cells
    hdr_m[0].text = "Categoria MoSCoW"
    hdr_m[1].text = "Requisitos Contemplados"
    hdr_m[2].text = "Racional de Negócio / Decisão de Engenharia"
    for cell in hdr_m:
        set_cell_background(cell, "0f172a")
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(0xff, 0xff, 0xff)
        p.runs[0].font.size = Pt(9.5)

    moscow_data = [
        ("Must Have\n(Obrigatório)", "RF01, RF02, RF03, RF04, RF05, RF06, RF08, RF10, RF11, RF12, RF13, RF14, RF15", "Núcleo indispensável: catálogo teatral, agenda georreferenciada, bilheteria, press kit para programadores e governança de privacidade LGPD."),
        ("Should Have\n(Importante)", "RF07, RF09, RF16", "Diferencial de engajamento: vitrine de projetos futuros, caixa de entrada de ideias e comunicados na Home."),
        ("Could Have\n(Desejável)", "RF17", "Gestão de comprovantes de pagamento; agrega conveniência de auditoria interna."),
        ("Won't Have\n(Postergado)", "RF18", "Interações lúdicas do Quarto do Joca; postergado devido à necessidade de ilustrações autorais que extrapolavam o prazo.")
    ]
    for cat, reqs, just in moscow_data:
        row = table_moscow.add_row().cells
        row[0].text = cat
        row[1].text = reqs
        row[2].text = just
        for cell in row:
            set_cell_margins(cell, 80, 80, 100, 100)
            cell.paragraphs[0].runs[0].font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # SEÇÃO 4: REQUISITOS NÃO FUNCIONAIS
    # -------------------------------------------------------------
    add_h1("4. REQUISITOS NÃO FUNCIONAIS (RNF) — ISO/IEC 25010 E LGPD")
    add_p(
        "Os requisitos não funcionais foram alinhados às subcaracterísticas de qualidade do software da norma "
        "ISO/IEC 25010 e às diretrizes mandatórias da Lei Geral de Proteção de Dados Pessoais (LGPD):"
    )

    rnfs = [
        ("RNF-SEG-01 (Criptografia de Senhas): ", "Senhas devem ser cifradas utilizando Bcrypt com salt rounds igual a 10 antes da persistência no banco de dados."),
        ("RNF-SEG-02 (Autenticação Stateless JWT): ", "Controle de acesso autenticado através de tokens JWT com algoritmo HMAC SHA-256 e expiração máxima de 24 horas."),
        ("RNF-SEG-03 (Minimização de Dados - LGPD Art. 6º): ", "As consultas públicas a colaboradores devem omitir estritamente CPF, RG, celular, dados de saúde e histórico financeiro via mascaramento em runtime."),
        ("RNF-SEG-04 (Segurança Web e Anti-Spam): ", "Proteção com Helmet para headers HTTP seguros, CORS restrito a origens oficiais e limitação de taxa (Rate Limit) de 10 envios/hora por IP para ideias."),
        ("RNF-DES-01 (Tempo de Resposta de API): ", "Tempo médio de resposta para listagens paginadas inferior a 300 ms em condições nominais de carga."),
        ("RNF-DES-02 (Code-Splitting e Bundling Otimizado): ", "Aplicação cliente React SPA deve adotar carregamento tardio de rotas (React.lazy) e manualChunks no Vite para pacotes externos, com bundle inicial abaixo de 250 kB."),
        ("RNF-DES-03 (Persistência Binária no PostgreSQL): ", "Armazenamento de mídias e uploads binários no banco relacional via Prisma para garantir imunidade contra o disco efêmero do servidor em nuvem (Render)."),
        ("RNF-USA-01 (Design Responsivo e Cinemático): ", "Interface com design system flexível para resoluções de 320 px a 4K, com contraste em conformidade com as diretrizes WCAG 2.1 nível AA."),
        ("RNF-USA-02 (Feedback Imediato): ", "Todas as ações assíncronas devem apresentar feedback visual imediato (spinners e alertas contextuais em português do Brasil)."),
        ("RNF-DIS-01 (Disponibilidade Híbrida Desacoplada): ", "Frontend hospedado na CDN global do GitHub Pages (99,9% uptime) e backend REST no cluster gerenciado do Render."),
        ("RNF-DIS-02 (Resiliência a Cold Start): ", "Cliente Axios configurado com timeout de 60 segundos com interceptor para absorver o tempo de reativação de servidores PaaS gratuitos."),
        ("RNF-MAN-01 (Arquitetura Limpa em Camadas - SOLID): ", "Separação rigorosa de responsabilidades entre Rotas HTTP, Validadores puros, Controladores e Camada de Serviços (Service Layer)."),
        ("RNF-MAN-02 (Cobertura de Testes de Regressão): ", "Cobertura automatizada de testes superior a 80%, combinando Jest no backend e Vitest no frontend com 156 testes unitários e de integração.")
    ]
    for pre, txt in rnfs:
        add_p(txt, bold_prefix=pre)

    # -------------------------------------------------------------
    # SEÇÃO 5: HISTÓRIAS DE USUÁRIO
    # -------------------------------------------------------------
    add_h1("5. HISTÓRIAS DE USUÁRIO (USER STORIES) E BACKLOG")
    add_h2("5.1 Catálogo de User Stories com Critérios BDD / Gherkin")

    user_stories = [
        ("US01 — Palco Imersivo e Consulta de Peças",
         "Como espectador ou amante de artes cênicas,\nQuero visualizar a página da obra com cartaz em destaque, sinopse poética e elenco,\nPara que eu possa compreender o conceito estético e escolher o espetáculo desejado.",
         "Dado que o espetáculo 'Da Janela, o Mar' está cadastrado\nQuando o usuário acessa '/obras/1'\nEntão o pôster cênico cobre panoramicamente o topo da página\nE a sinopse poética e a listagem de integrantes do elenco são exibidas\nE botões de ação para a Agenda e compra de ingressos são ativados."),
        ("US02 — Consulta de Agenda e Rotas Teatrais",
         "Como espectador de teatro,\nQuero consultar as apresentações por data, horário e localização com mapas interativos,\nPara que eu consiga me deslocar pontualmente até o teatro correto.",
         "Dado que existem sessões cadastradas para o Centro de Artes da UFF\nQuando o espectador abre '/agenda'\nEntão ele visualiza datas, horários e endereço\nQuando clica no botão 'Ver no Mapa 📍'\nEntão um modal com mapa Leaflet é exibido\nE o botão 'Abrir no Google Maps ↗' traça a rota em nova aba."),
        ("US03 — Download de Press Kit por Curadores",
         "Como curador de festival ou programador de teatro,\nQuero baixar o rider técnico e o projeto de encenação de uma obra em cartaz,\nPara que eu possa avaliar a viabilidade de palco e iluminação sem troca excessiva de e-mails.",
         "Dado que a peça está com status 'EM_CARTAZ'\nQuando o curador abre os detalhes da obra\nEntão visualiza a seção 'Informações Técnicas & Downloads'\nE ao clicar em 'Baixar ↓' no Rider Técnico\nEntão o arquivo PDF é transferido com sucesso."),
        ("US04 — Envio de Proposta pelo Canal 'Tem uma Ideia?'",
         "Como dramaturgo ou artista parceiro,\nQuero submeter uma proposta de espetáculo ou texto dramático pela página inicial,\nPara que a direção do Theatrum Mundi conheça minha ideia e avalie futuras parcerias.",
         "Dado que o usuário preenche nome, e-mail, telefone e proposta\nE confirma a autorização de uso dos dados para contato segundo a LGPD\nQuando clica em 'Enviar Minha Proposta'\nEntão a mensagem é registrada com status 'NOVA'\nE uma confirmação de recebimento é exibida na tela."),
        ("US05 — Gestão de Colaboradores e Sigilo LGPD",
         "Como administrador da companhia,\nQuero manter a ficha cadastral completa dos integrantes (com prontuário médico e documentos),\nPara que a equipe esteja respaldada em turnês enquanto os dados sigilosos são resguardados de acessos públicos.",
         "Dado que o colaborador possui CPF, RG e saúde cadastrados\nQuando uma requisição anônima invoca 'GET /api/colaboradores'\nEntão os campos sensíveis são omitidos do JSON retornado\nQuando o administrador autentica-se com JWT\nEntão todos os 23 campos são visualizados no painel."),
        ("US06 — Recuperação Segura de Senha",
         "Como administrador da plataforma,\nQuero solicitar recuperação de acesso caso esqueça minha senha,\nPara que eu consiga redefinir minha credencial sem intervenção direta no banco de dados.",
         "Dado que o administrador solicita recuperação informando o usuário 'admin'\nQuando o sistema valida o usuário\nEntão emite um token com validade de 60 minutos\nQuando o administrador envia o token e sua nova senha\nEntão a nova senha é gravada com hash Bcrypt e o acesso é restabelecido.")
    ]

    for tit, hist, gherk in user_stories:
        add_h2(tit)
        add_p(hist)
        p_g = doc.add_paragraph()
        p_g.paragraph_format.left_indent = Inches(0.5)
        r_g_title = p_g.add_run("Critérios de Aceitação (BDD / Gherkin):\n")
        r_g_title.font.bold = True
        r_g_title.font.size = Pt(9.5)
        r_g_code = p_g.add_run(gherk)
        r_g_code.font.name = 'Consolas'
        r_g_code.font.size = Pt(9)
        p_g.paragraph_format.space_after = Pt(8)

    add_h2("5.2 Evolução Comparativa: Product Backlog Inicial vs. Atual")
    add_p(
        "A evolução do Product Backlog reflete a maturidade iterativa do projeto impulsionada pelos feedbacks diretos das atas de reunião:"
    )

    table_backlog = doc.add_table(rows=1, cols=3)
    table_backlog.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_b = table_backlog.rows[0].cells
    hdr_b[0].text = "Backlog Inicial (Sprint 0 / Ata #01)"
    hdr_b[1].text = "Backlog Atual Consolidado (Pós Ata #02)"
    hdr_b[2].text = "Situação de Entrega"
    for cell in hdr_b:
        set_cell_background(cell, "0f172a")
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(0xff, 0xff, 0xff)
        p.runs[0].font.size = Pt(9.5)

    backlog_data = [
        ("CRUD básico de peças", "Catálogo com 4 status (Em Cartaz, Em Repertório, Projeto Futuro, Encerrada) e Hero Palco", "🟢 Entregue"),
        ("Cadastro simples (7 campos)", "Ficha completa com 23 campos em sub-abas e mascaramento LGPD em runtime", "🟢 Entregue"),
        ("Lista unificada de peças e datas", "Separação conceitual Obras × Agenda com Leaflet e rotas no Google Maps", "🟢 Entregue"),
        ("Não previsto inicialmente", "Área de Downloads Técnicos (Press Kit) exclusiva para obras em temporada", "🟢 Entregue"),
        ("Não previsto inicialmente", "Página Memória e Acervo Histórico (2012–2026) com download de portfólio em PDF", "🟢 Entregue"),
        ("Não previsto inicialmente", "Canal público 'Tem uma ideia?' e aba administrativa de triagem de propostas", "🟢 Entregue"),
        ("Não previsto inicialmente", "Botão dinâmico de ingressos (Sympla/Fever) na obra e na Agenda", "🟢 Entregue"),
        ("Login por e-mail genérico", "Autenticação flexível por usuário ('admin'), recuperação de senha e troca no painel", "🟢 Entregue")
    ]
    for b_ini, b_atu, sit in backlog_data:
        row = table_backlog.add_row().cells
        row[0].text = b_ini
        row[1].text = b_atu
        row[2].text = sit
        for cell in row:
            set_cell_margins(cell, 80, 80, 100, 100)
            cell.paragraphs[0].runs[0].font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # SEÇÃO 6: MODELAGEM UML
    # -------------------------------------------------------------
    add_h1("6. MODELAGEM UML DE REQUISITOS")
    add_h2("6.1 Diagrama de Casos de Uso (UML)")
    add_p(
        "O diagrama de casos de uso modela as fronteiras funcionais do sistema Theatrum Mundi e os perfis de atores envolvidos:"
    )

    p_uml = doc.add_paragraph()
    p_uml.paragraph_format.left_indent = Inches(0.4)
    r_uml = p_uml.add_run(
        "Atores Mapeados:\n"
        "• 🎭 Espectador: Consulta obras, consulta agenda teatral, compra ingressos e submete propostas.\n"
        "• 🎪 Programador / Curador: Consulta especificações cênicas, baixa o press kit técnico e portfólio.\n"
        "• 👥 Colaborador: Realiza pré-cadastro artístico com termo de privacidade LGPD.\n"
        "• 🔐 Administrador: Gerencia o ciclo de vida de peças, locais de temporada, ficha de colaboradores, "
        "triagem de ideias e segurança de credenciais.\n\n"
        "Casos de Uso Principais:\n"
        "[UC01] Consultar Catálogo de Obras e Elenco\n"
        "[UC02] Consultar Agenda Teatral e Rotas Georreferenciadas\n"
        "[UC03] Comprar Ingressos via Bilheteria Externa (include UC02)\n"
        "[UC04] Baixar Press Kit Técnico de Obra em Cartaz\n"
        "[UC05] Consultar Memória e Baixar Portfólio Histórico\n"
        "[UC06] Enviar Proposta Artística pelo Canal Público\n"
        "[UC07] Realizar Pré-cadastro de Integrante da Companhia\n"
        "[UC08] Autenticar / Recuperar Acesso de Administrador\n"
        "[UC09] Gerenciar Obras, Temporadas e Locais de Apresentação\n"
        "[UC10] Gerenciar Ficha de Colaboradores com Proteção LGPD\n"
        "[UC11] Triar e Gerenciar Mensagens da Caixa de Ideias\n"
        "[UC12] Gerenciar Propagandas e Configurações Gerais do Site"
    )
    r_uml.font.size = Pt(9.5)
    r_uml.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_h2("6.2 Especificação Formal dos Casos de Uso Críticos")
    add_p(
        "Abaixo estão detalhadas as especificações formais dos três casos de uso centrais do sistema:",
        bold_prefix="Detalhamento Técnico: "
    )

    uc_specs = [
        ("Caso de Uso UC02: Consultar Agenda Teatral e Rotas",
         "Ator Principal: Espectador / Visitante Geral.\n"
         "Atores Secundários: Provedor Leaflet/OpenStreetMap, Google Maps.\n"
         "Pré-condições: Apresentações teatrais cadastradas com datas, horários e endereços válidos.\n"
         "Pós-condições: Espectador obtém informações logísticas da sessão ou é direcionado à bilheteria.\n"
         "Fluxo Principal:\n"
         "1. O espectador clica na aba 'Agenda' do cabeçalho de navegação.\n"
         "2. O sistema busca os eventos ativos na API e renderiza a lista cronológica de apresentações.\n"
         "3. O espectador utiliza os filtros disponíveis (busca textual por peça ou teatro, ou filtro por cidade).\n"
         "4. O espectador clica no botão 'Ver no Mapa 📍' de uma sessão específica.\n"
         "5. O sistema abre o modal contendo o mapa Leaflet renderizado nas coordenadas de GPS do teatro.\n"
         "6. O espectador clica em 'Abrir no Google Maps ↗' para traçar rotas a partir de sua localização.\n"
         "Fluxos Alternativos:\n"
         "• Compra de Ingresso: No passo 3, caso a sessão possua link de ingresso ativo, o espectador clica em '🎟️ Ingressos' e é direcionado à bilheteria do Sympla/Fever em nova aba.\n"
         "• Sem GPS: Caso o teatro não possua coordenadas geográficas, o sistema redireciona a busca pelo endereço textual no Google Maps."),
        ("Caso de Uso UC04: Baixar Press Kit Técnico de Obra em Cartaz",
         "Ator Principal: Programador de Festival, Curador ou Diretor de Espaço Cultural.\n"
         "Pré-condições: O espetáculo deve estar com status 'EM_CARTAZ' e possuir anexos técnicos vinculados.\n"
         "Pós-condições: Arquivo PDF de especificações técnicas transferido com sucesso.\n"
         "Fluxo Principal:\n"
         "1. O curador navega até a listagem de Obras e seleciona o espetáculo em temporada.\n"
         "2. O sistema carrega os dados e verifica que o status é 'EM_CARTAZ'.\n"
         "3. O sistema renderiza a seção 'Informações Técnicas & Downloads' exibindo os cards dos documentos.\n"
         "4. O curador clica no botão 'Baixar ↓' do Rider Técnico.\n"
         "5. O navegador descarrega o arquivo binário 'RIDER_TECNICO_Da_Janela_o_Mar.pdf'.\n"
         "Fluxo de Exceção:\n"
         "• Obra Fora de Cartaz: Se a peça consultada estiver com status EM_REPERTORIO, PROJETO_FUTURO ou ENCERRADA, a seção de downloads técnicos é ocultada automaticamente."),
        ("Caso de Uso UC10: Gerenciar Ficha de Colaboradores com Proteção LGPD",
         "Ator Principal: Administrador do Theatrum Mundi.\n"
         "Pré-condições: Administrador autenticado com token JWT ativo.\n"
         "Pós-condições: Dados cadastrais sensíveis atualizados e resguardados no banco de dados relacional.\n"
         "Fluxo Principal:\n"
         "1. O administrador acessa o painel e clica na aba 'Colaboradores'.\n"
         "2. O sistema exibe a tabela com indicadores de integrantes.\n"
         "3. O administrador clica no botão de edição de um colaborador.\n"
         "4. O sistema abre o modal com cinco sub-abas organizadas por área temática.\n"
         "5. O administrador edita campos sensíveis (como CPF, RG, DRT, dados de saúde e histórico financeiro).\n"
         "6. O administrador clica em 'Salvar Alterações'.\n"
         "7. O sistema valida os tipos de dados via validador puro e grava a atualização no banco de dados.\n"
         "Fluxo de Exceção:\n"
         "• Violação de Acesso: Caso uma requisição sem token tente atualizar o colaborador, o middleware encerra a conexão com código HTTP 401 Unauthorized.")
    ]

    for tit, corpo in uc_specs:
        add_h2(tit)
        p_c = doc.add_paragraph()
        p_c.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_c = p_c.add_run(corpo)
        r_c.font.size = Pt(9.5)
        p_c.paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # SEÇÃO 7: MATRIZ DE RASTREABILIDADE
    # -------------------------------------------------------------
    add_h1("7. MATRIZ DE RASTREABILIDADE BIDIRECIONAL")
    add_p(
        "A matriz de rastreabilidade bidirecional estabelece a conexão auditável entre Requisitos (RF/RNF), "
        "Casos de Uso (UC), Componentes de Frontend, Serviços de Backend e Testes Automatizados:"
    )

    table_rast = doc.add_table(rows=1, cols=5)
    table_rast.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_r = table_rast.rows[0].cells
    hdr_r[0].text = "ID Requisito"
    hdr_r[1].text = "Caso de Uso"
    hdr_r[2].text = "Interface (Frontend)"
    hdr_r[3].text = "API / Serviço (Backend)"
    hdr_r[4].text = "Teste Automatizado"
    for cell in hdr_r:
        set_cell_background(cell, "0f172a")
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(0xff, 0xff, 0xff)
        p.runs[0].font.size = Pt(9)

    rast_data = [
        ("RF01 / RF02", "UC01", "PecasPage.jsx\nPecaDetalhesPage.jsx", "GET /api/pecas\npecaService.js", "PecaDetalhesPage.test.jsx\npecaValidator.test.js"),
        ("RF03", "UC02", "AgendaPage.jsx\nMapView.jsx", "locaisController.js\npecaService.js", "AgendaPage.test.jsx"),
        ("RF04", "UC02, UC03", "PecaDetalhesPage.jsx\nAgendaPage.jsx", "linkIngresso em Peca\npecaService.js", "AgendaPage.test.jsx\nPecaDetalhesPage.test.jsx"),
        ("RF05", "UC04", "PecaDetalhesPage.jsx", "Tabela DownloadTecnico\npecasController.js", "PecaDetalhesPage.test.jsx"),
        ("RF06", "UC05", "MemoriaPage.jsx\nHeader.jsx", "GET /api/memoria\nmemoriaService.js", "memoriaService.test.js\nHeader.test.jsx"),
        ("RF07", "UC01", "HomePage.jsx", "status PROJETO_FUTURO\nstatusPeca.js", "HomePage.test.jsx\nstatusPeca.test.js"),
        ("RF08 / RF09", "UC06, UC11", "HomePage.jsx\nAbaIdeias.jsx", "POST /api/ideias\nideiaService.js", "ideiaService.test.js\nAbaIdeias.test.jsx"),
        ("RF10 / RF11", "UC07, UC10", "ColaboradorPage.jsx\nAbaColaboradores.jsx", "POST /api/colaboradores\ncolaboradorService.js", "colaboradorValidator.test.js"),
        ("RF12 (LGPD)", "UC10", "Projeção condicional UI", "Projeção ehAdmin no Prisma\ncolaboradorService.js", "auth.test.js\ncolaboradorValidator.test.js"),
        ("RF13..RF15", "UC08", "AdminLogin.jsx\nAbaConfig.jsx", "POST /api/auth/login\nauthService.js", "authService.test.js\nAdminLogin.test.jsx"),
        ("RF16", "UC12", "PropagandasSection.jsx\nAbaPropagandas.jsx", "GET /api/propagandas\npropagandaService.js", "propagandas.test.js\nPropagandasSection.test.jsx"),
        ("RNF-SEG-01..04", "Todos", "api.js (Interceptors)", "auth.js (JWT/Bearer)\napp.js (Helmet/RateLimit)", "auth.test.js\nvalidateId.test.js"),
        ("RNF-DES-01..03", "Todos", "vite.config.js (Chunks)\nApp.jsx (Lazy)", "Tabela Arquivo (Bytes)\nfileService.js", "fileService.test.js")
    ]
    for r_id, uc, fr, bk, ts in rast_data:
        row = table_rast.add_row().cells
        row[0].text = r_id
        row[1].text = uc
        row[2].text = fr
        row[3].text = bk
        row[4].text = ts
        for cell in row:
            set_cell_margins(cell, 70, 70, 80, 80)
            cell.paragraphs[0].runs[0].font.size = Pt(8)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # SEÇÃO 8: REFERÊNCIAS BIBLIOGRÁFICAS
    # -------------------------------------------------------------
    add_h1("8. REFERÊNCIAS BIBLIOGRÁFICAS E NORMATIVAS")
    refs = [
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS (ABNT). NBR ISO/IEC 25010: Sistemas e engenharia de software — Requisitos e avaliação da qualidade de produto de software (SQuaRE) — Modelos de qualidade de sistema e de software. Rio de Janeiro: ABNT, 2014.",
        "BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Diário Oficial da União: Brasília, DF, 15 ago. 2018.",
        "ISO/IEC/IEEE. ISO/IEC/IEEE 26515:2018 — Systems and software engineering — Developing information for users in an agile environment. Genebra: International Organization for Standardization, 2018.",
        "PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de Software: uma abordagem profissional. 9. ed. Porto Alegre: AMGH, 2021.",
        "SOMMERVILLE, Ian. Engenharia de Software. 10. ed. São Paulo: Pearson Education do Brasil, 2019.",
        "WIEGERS, Karl; BEATTY, Joy. Software Requirements. 3. ed. Redmond: Microsoft Press, 2013."
    ]
    for r in refs:
        p_r = doc.add_paragraph()
        p_r.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_run = p_r.add_run(r)
        r_run.font.size = Pt(9.5)
        p_r.paragraph_format.space_after = Pt(6)

    # Salva o arquivo Word (.docx)
    output_path = os.path.join(os.getcwd(), 'docs', 'DOCUMENTO_REQUISITOS_THEATRUM.docx')
    doc.save(output_path)
    print(f"✅ Documento Word gerado com sucesso em: {output_path}")

if __name__ == '__main__':
    create_document()

