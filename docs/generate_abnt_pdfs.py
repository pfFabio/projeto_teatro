#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Gerador de Documentos ABNT (.docx e .pdf) da P2 de Engenharia de Software
Universidade de Vassouras — Campus Maricá
Autor: Fábio Pinto Figueiredo | Matrícula: 202413741
"""

import os
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BRASAO_PATH = os.path.join(BASE_DIR, 'univassouras_brasao.png')

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

def create_abnt_document():
    doc = docx.Document()
    for section in doc.sections:
        section.top_margin = Inches(1.18)      # 3.0 cm
        section.left_margin = Inches(1.18)     # 3.0 cm
        section.bottom_margin = Inches(0.79)   # 2.0 cm
        section.right_margin = Inches(0.79)    # 2.0 cm

    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Arial'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b)
    style_normal.paragraph_format.line_spacing = 1.25
    style_normal.paragraph_format.space_after = Pt(6)
    return doc

def add_capa_abnt(doc, titulo_principal, subtitulo, exercicio_num=""):
    # Brasão Univassouras
    if os.path.exists(BRASAO_PATH):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(16)
        r_logo = p_logo.add_run()
        r_logo.add_picture(BRASAO_PATH, width=Inches(3.2))

    # Instituição
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run(
        "UNIVERSIDADE DE VASSOURAS — UNIVASSOURAS\n"
        "CAMPUS UNIVERSITÁRIO DE MARICÁ\n"
        "CURSO DE BACHARELADO EM ENGENHARIA DE SOFTWARE\n"
        "6º PERÍODO LETIVO"
    )
    r_inst.font.bold = True
    r_inst.font.size = Pt(12)
    p_inst.paragraph_format.space_after = Pt(70)

    # Autor
    p_autor = doc.add_paragraph()
    p_autor.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_autor = p_autor.add_run("FÁBIO PINTO FIGUEIREDO\nMATRÍCULA: 202413741")
    r_autor.font.bold = True
    r_autor.font.size = Pt(12)
    p_autor.paragraph_format.space_after = Pt(90)

    # Título
    p_titulo = doc.add_paragraph()
    p_titulo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tit = p_titulo.add_run(titulo_principal.upper())
    r_tit.font.bold = True
    r_tit.font.size = Pt(14)
    r_tit.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run(subtitulo)
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    p_sub.paragraph_format.space_after = Pt(120)

    # Local e Ano
    p_local = doc.add_paragraph()
    p_local.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_loc = p_local.add_run("MARICÁ – RJ\n2026")
    r_loc.font.bold = True
    r_loc.font.size = Pt(11)

    # Quebra para Folha de Rosto
    doc.add_page_break()

    # -------------------------------------------------------------
    # FOLHA DE ROSTO ABNT
    # -------------------------------------------------------------
    p_fr_aut = doc.add_paragraph()
    p_fr_aut.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fr_aut = p_fr_aut.add_run("FÁBIO PINTO FIGUEIREDO\nMATRÍCULA: 202413741")
    r_fr_aut.font.bold = True
    r_fr_aut.font.size = Pt(12)
    p_fr_aut.paragraph_format.space_after = Pt(100)

    p_fr_tit = doc.add_paragraph()
    p_fr_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fr_tit = p_fr_tit.add_run(titulo_principal.upper())
    r_fr_tit.font.bold = True
    r_fr_tit.font.size = Pt(13)
    p_fr_tit.paragraph_format.space_after = Pt(6)

    p_fr_sub = doc.add_paragraph()
    p_fr_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fr_sub = p_fr_sub.add_run(subtitulo)
    r_fr_sub.font.size = Pt(11)
    r_fr_sub.font.italic = True
    p_fr_sub.paragraph_format.space_after = Pt(70)

    # Recuo de natureza do trabalho (ABNT: recuo à direita a partir do meio da página)
    table_nat = doc.add_table(rows=1, cols=2)
    table_nat.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_nat.autofit = False
    col_left, col_right = table_nat.columns[0], table_nat.columns[1]
    col_left.width = Inches(3.0)
    col_right.width = Inches(3.5)

    cell_empty = table_nat.cell(0, 0)
    cell_text = table_nat.cell(0, 1)

    p_nat = cell_text.paragraphs[0]
    p_nat.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_nat = p_nat.add_run(
        f"Relatório Técnico e Acadêmico de Engenharia de Software apresentado como requisito parcial de avaliação para a P2 / Trabalho de Conclusão de Curso (TCC) do curso de Bacharelado em Engenharia de Software da Universidade de Vassouras (Univassouras), Campus Maricá.\n\n"
        f"Orientação: Corpo Docente de Engenharia de Software\n"
        f"Stakeholder: Angelo Faria Turci (Diretor Geral da Cia Theatrum Mundi)\n"
        f"Ambiente em Produção: https://pffabio.github.io/projeto_teatro/\n"
        f"API Backend: https://projeto-teatro.onrender.com\n"
        f"Banco de Dados: Supabase PostgreSQL (Managed Cloud Platform)"
    )
    r_nat.font.size = Pt(9.5)
    p_nat.paragraph_format.line_spacing = 1.15

    p_fr_sp = doc.add_paragraph()
    p_fr_sp.paragraph_format.space_after = Pt(110)

    p_fr_loc = doc.add_paragraph()
    p_fr_loc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fr_loc = p_fr_loc.add_run("MARICÁ – RJ\n2026")
    r_fr_loc.font.bold = True
    r_fr_loc.font.size = Pt(11)

    doc.add_page_break()

def parse_markdown_to_docx(md_path, doc):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_table = False
    table_data = []

    # Ignora cabeçalho inicial que já está na Capa/Folha de Rosto
    skip_header = True

    i = 0
    while i < len(lines):
        line = lines[i].rstrip()

        # Finaliza o skip_header quando encontra a primeira seção '## 1.' ou '##'
        if skip_header:
            if line.startswith('## 1.') or line.startswith('## 1 ') or line.startswith('# PARTE'):
                skip_header = False
            else:
                i += 1
                continue

        # Tratamento de tabelas Markdown
        if '|' in line and not line.startswith('```'):
            # Detecta linha de separação (|---|:---:|)
            if re.match(r'^\s*\|?\s*:?-+:?\s*\|', line):
                i += 1
                continue
            cols = [c.strip() for c in line.split('|')[1:-1]]
            if cols:
                in_table = True
                table_data.append(cols)
                i += 1
                continue
        else:
            if in_table and table_data:
                # Renderiza a tabela acumulada
                render_table(doc, table_data)
                table_data = []
                in_table = False

        # Linha horizontal
        if line.strip() in ['---', '***', '___']:
            i += 1
            continue

        # Títulos
        if line.startswith('# '):
            p = doc.add_paragraph()
            r = p.add_run(line[2:].strip().upper())
            r.font.bold = True
            r.font.size = Pt(14)
            r.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.keep_with_next = True
        elif line.startswith('## '):
            p = doc.add_paragraph()
            r = p.add_run(line[3:].strip())
            r.font.bold = True
            r.font.size = Pt(12.5)
            r.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b)
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
        elif line.startswith('### '):
            p = doc.add_paragraph()
            r = p.add_run(line[4:].strip())
            r.font.bold = True
            r.font.size = Pt(11.5)
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
        elif line.startswith('#### '):
            p = doc.add_paragraph()
            r = p.add_run(line[5:].strip())
            r.font.bold = True
            r.font.size = Pt(11)
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
        # Bloco de código / Diagramas
        elif line.startswith('```'):
            code_lines = []
            lang = line[3:].strip()
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code_lines.append(lines[i].rstrip())
                i += 1
            render_code_block(doc, '\n'.join(code_lines), lang)
        # Lista com bullet
        elif line.strip().startswith('* ') or line.strip().startswith('- '):
            bullet_text = line.strip()[2:]
            render_bullet(doc, bullet_text)
        # Lista numerada
        elif re.match(r'^\s*\d+\.\s+', line):
            num_text = re.sub(r'^\s*\d+\.\s+', '', line)
            render_numbered(doc, num_text)
        # Parágrafo normal
        elif line.strip():
            render_formatted_paragraph(doc, line)

        i += 1

    if in_table and table_data:
        render_table(doc, table_data)

def render_bullet(doc, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    add_formatted_runs(p, text)

def render_numbered(doc, text):
    p = doc.add_paragraph(style='List Number')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    add_formatted_runs(p, text)

def render_formatted_paragraph(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.first_line_indent = Inches(0.49) # 1.25 cm padrão ABNT
    add_formatted_runs(p, text)

def add_formatted_runs(p, text):
    # Processa bold (**texto**), italic (*texto*), inline code (`código`)
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**'):
            r = p.add_run(token[2:-2])
            r.font.bold = True
        elif token.startswith('*') and token.endswith('*'):
            r = p.add_run(token[1:-1])
            r.font.italic = True
        elif token.startswith('`') and token.endswith('`'):
            r = p.add_run(token[1:-1])
            r.font.name = 'Consolas'
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(0x0f, 0x76, 0x6e)
        else:
            p.add_run(token)

def render_code_block(doc, code, lang=""):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.0
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(code)
    r.font.name = 'Consolas'
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)

def render_table(doc, data):
    if not data or len(data) == 0:
        return
    num_rows = len(data)
    num_cols = max(len(row) for row in data)
    table = doc.add_table(rows=num_rows, cols=num_cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    for r_idx, row in enumerate(data):
        for c_idx, val in enumerate(row):
            if c_idx < num_cols:
                cell = table.cell(r_idx, c_idx)
                p = cell.paragraphs[0]
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.05
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

                # Cabeçalho da tabela
                if r_idx == 0:
                    set_cell_background(cell, "0F172A")
                    set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
                    r = p.add_run(val)
                    r.font.bold = True
                    r.font.size = Pt(9)
                    r.font.color.rgb = RGBColor(0xff, 0xff, 0xff)
                else:
                    bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
                    set_cell_background(cell, bg)
                    set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    add_formatted_runs(p, val)
                    for r in p.runs:
                        r.font.size = Pt(8.5)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_after = Pt(8)

def convert_to_pdf(docx_path, pdf_path):
    import win32com.client
    word = win32com.client.Dispatch('Word.Application')
    word.Visible = False
    try:
        doc_word = word.Documents.Open(os.path.abspath(docx_path))
        doc_word.SaveAs(os.path.abspath(pdf_path), FileFormat=17) # 17 = wdFormatPDF
        doc_word.Close()
        print(f"✅ Gerado com sucesso: {pdf_path}")
    except Exception as e:
        print(f"❌ Erro ao converter {docx_path} para PDF: {e}")
    finally:
        word.Quit()

def build_all():
    docs_to_build = [
        {
            "md": os.path.join(BASE_DIR, "exercicio_1_requisitos.md"),
            "docx": os.path.join(BASE_DIR, "EXERCICIO_1_REQUISITOS_ABNT.docx"),
            "pdf": os.path.join(BASE_DIR, "EXERCICIO_1_REQUISITOS_ABNT.pdf"),
            "titulo": "Relatório Técnico — Engenharia de Requisitos de Software",
            "subtitulo": "Exercício 1 — Elicitação, Catálogo MoSCoW, RNF ISO 25010, User Stories BDD e Modelagem UML"
        },
        {
            "md": os.path.join(BASE_DIR, "exercicio_2_arquitetura_modelagem.md"),
            "docx": os.path.join(BASE_DIR, "EXERCICIO_2_ARQUITETURA_MODELAGEM_ABNT.docx"),
            "pdf": os.path.join(BASE_DIR, "EXERCICIO_2_ARQUITETURA_MODELAGEM_ABNT.pdf"),
            "titulo": "Relatório Técnico — Arquitetura, Modelagem, UX e Segurança",
            "subtitulo": "Exercício 2 — Arquitetura em Camadas, Diagramas UML, Mascaramento LGPD, Modelo Relacional e Wireframes"
        },
        {
            "md": os.path.join(BASE_DIR, "exercicio_3_gestao_devops_mvp.md"),
            "docx": os.path.join(BASE_DIR, "EXERCICIO_3_GESTAO_DEVOPS_MVP_ABNT.docx"),
            "pdf": os.path.join(BASE_DIR, "EXERCICIO_3_GESTAO_DEVOPS_MVP_ABNT.pdf"),
            "titulo": "Relatório Técnico — Gestão de Projetos, DevOps e MVP",
            "subtitulo": "Exercício 3 — Metodologia Scrumban, EAP, Riscos, TDD (221 Testes), CI/CD GitHub Actions e Deploy em Produção"
        },
        {
            "md": os.path.join(BASE_DIR, "exercicios.md"),
            "docx": os.path.join(BASE_DIR, "RELATORIO_TECNICO_INTEGRADO_THEATRUM_ABNT.docx"),
            "pdf": os.path.join(BASE_DIR, "RELATORIO_TECNICO_INTEGRADO_THEATRUM_ABNT.pdf"),
            "titulo": "Relatório Técnico Integrado de Engenharia de Software",
            "subtitulo": "Projeto Theatrum Mundi: Plataforma Integrada de Difusão, Circulação e Gestão Teatral (P2 / TCC)"
        }
    ]

    for item in docs_to_build:
        print(f"\n📄 Processando {os.path.basename(item['md'])}...")
        doc = create_abnt_document()
        add_capa_abnt(doc, item["titulo"], item["subtitulo"])
        parse_markdown_to_docx(item["md"], doc)
        doc.save(item["docx"])
        print(f"✅ DOCX salvo: {item['docx']}")
        convert_to_pdf(item["docx"], item["pdf"])

if __name__ == '__main__':
    build_all()

