import urllib.request
import json
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'TheatrumAcademicResearch/1.0 (mailto:academic@theatrum.edu)'
}

dois = [
    {"id": "01", "name": "Bellini_Nesi_2015_Performing_Arts_Metadata_ECLAP", "doi": "10.1007/s00530-014-0366-0"},
    {"id": "02", "name": "Portales_et_al_2022_Cultural_Heritage_Leaflet_WebGIS", "doi": "10.3390/ijgi11040266"},
    {"id": "03", "name": "Rizzi_et_al_2018_Performing_Arts_PLM_Management", "doi": "10.1007/978-3-030-01614-2_39"},
    {"id": "04", "name": "Lawi_et_al_2021_Evaluating_REST_API_Performance_Information_Systems", "doi": "10.3390/computers10110138"},
    {"id": "05", "name": "Kim_et_al_2023_Authentication_Access_Control_JWT_RBAC", "doi": "10.1109/ICUFN57554.2023.10201206"},
    {"id": "06", "name": "Silva_et_al_2022_Ensuring_Privacy_LGPD_Web_Applications", "doi": "10.1145/3477314.3507023"}
]

dest_dir = r"c:\faculdade\theatrum\docs\referencias"
os.makedirs(dest_dir, exist_ok=True)

for item in dois:
    doi_clean = item["doi"]
    url = f"https://api.openalex.org/works/https://doi.org/{doi_clean}"
    print(f"\nConsultando OpenAlex para DOI: {doi_clean}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            title = data.get("title")
            oa = data.get("open_access", {})
            best_oa = data.get("best_oa_location") or {}
            pdf_url = best_oa.get("pdf_url") or oa.get("oa_url")
            landing_url = best_oa.get("landing_page_url") or data.get("doi")
            locations = data.get("locations", [])
            
            print(f"Título: {title}")
            print(f"Open Access: {oa.get('is_oa')}, Status: {oa.get('oa_status')}")
            print(f"PDF URL: {pdf_url}")
            print(f"Landing Page: {landing_url}")
            
            # Salvar metadados completos em JSON de referência
            meta_path = os.path.join(dest_dir, f"{item['id']}_{item['name']}_metadata.json")
            with open(meta_path, 'w', encoding='utf-8') as mf:
                json.dump({
                    "doi": item["doi"],
                    "title": title,
                    "publication_year": data.get("publication_year"),
                    "host_venue": data.get("primary_location", {}).get("source", {}).get("display_name"),
                    "authors": [a.get("author", {}).get("display_name") for a in data.get("authorships", [])],
                    "open_access": oa,
                    "best_oa_location": best_oa,
                    "all_locations": [{"pdf_url": loc.get("pdf_url"), "landing_page": loc.get("landing_page_url")} for loc in locations if loc.get("pdf_url") or loc.get("landing_page_url")],
                    "abstract_inverted_index": data.get("abstract_inverted_index")
                }, mf, indent=2, ensure_ascii=False)
            print(f"-> Metadados salvos em: {meta_path}")

    except Exception as e:
        print(f"Erro ao consultar OpenAlex: {e}")
