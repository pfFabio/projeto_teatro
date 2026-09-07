import urllib.request
import os
import ssl
import json

# Ignore SSL verification for academic servers with self-signed certs
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

dest_dir = r"c:\faculdade\theatrum\docs\referencias"
os.makedirs(dest_dir, exist_ok=True)

papers = [
    {
        "filename": "01_Bellini_Nesi_2015_Performing_Arts_Metadata_ECLAP.pdf",
        "title": "Modeling Performing Arts Metadata and Relationships in Content Service for Institutions",
        "urls": [
            "http://www.disit.org/drupal/sites/default/files/papers/mmsys-eclap-model-v6.3-final.pdf",
            "http://www.disit.dinfo.unifi.it/drupal/sites/default/files/papers/mmsys-eclap-model-v6.3-final.pdf",
            "https://www.disit.org/drupal/sites/default/files/papers/mmsys-eclap-model-v6.3-final.pdf"
        ]
    },
    {
        "filename": "02_Portales_et_al_2022_Cultural_Heritage_Leaflet_WebGIS.pdf",
        "title": "Increasing Access to Cultural Heritage Objects from Multiple Museums through Semantically-Aware Maps",
        "urls": [
            "https://www.mdpi.com/2220-9964/11/4/266/pdf?version=1650337839",
            "https://www.mdpi.com/2220-9964/11/4/266/pdf"
        ]
    },
    {
        "filename": "03_Rizzi_et_al_2018_Performing_Arts_PLM_Management.pdf",
        "title": "Innovating Performing Arts Management Through a Product Lifecycle Management Approach",
        "urls": [
            "https://aisberg.unibg.it/bitstream/10446/132145/1/PLM%202018_Rizzi_Postprint.pdf",
            "https://aisberg.unibg.it/bitstream/10446/132145/1/PLM_2018_Rizzi_Postprint.pdf"
        ]
    },
    {
        "filename": "04_Lawi_et_al_2021_Evaluating_REST_API_Performance_Information_Systems.pdf",
        "title": "Evaluating GraphQL and REST API Services Performance in a Massive and Intensive Accessible Information System",
        "urls": [
            "https://www.mdpi.com/2073-431X/10/11/138/pdf?version=1635393220",
            "https://www.mdpi.com/2073-431X/10/11/138/pdf"
        ]
    },
    {
        "filename": "05_Kim_et_al_2023_Authentication_Access_Control_JWT_RBAC.pdf",
        "title": "Authentication and Access Control in Cloud-Based Systems",
        "urls": [
            "https://koreascience.kr/article/CFKO202324941916327.pdf",
            "http://www.kics.or.kr/storage/paper/event/2023_summer/10A-4.pdf"
        ]
    },
    {
        "filename": "06_Silva_et_al_2022_Ensuring_Privacy_LGPD_Web_Applications.pdf",
        "title": "Ensuring Privacy in the Application of the Brazilian General Data Protection Law (LGPD)",
        "urls": [
            "https://sol.sbc.org.br/index.php/erigo/article/download/17395/17231",
            "https://sol.sbc.org.br/livros/index.php/sbc/catalog/download/80/346/609-1"
        ]
    }
]

results = []

for paper in papers:
    filepath = os.path.join(dest_dir, paper["filename"])
    downloaded = False
    for url in paper["urls"]:
        try:
            print(f"Tentando baixar {paper['filename']} de {url}...")
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=20) as response:
                content = response.read()
                if len(content) > 5000 and (content[:4] == b'%PDF' or b'PDF' in content[:50] or b'%PDF' in content[:1024]):
                    with open(filepath, 'wb') as f:
                        f.write(content)
                    print(f"-> Sucesso! Salvo em: {filepath} ({len(content):,} bytes)")
                    downloaded = True
                    results.append({"file": paper["filename"], "status": "OK", "size": len(content)})
                    break
                else:
                    print(f"-> Resposta não é um PDF válido (tamanho: {len(content)} bytes). Tentando próximo...")
        except Exception as e:
            print(f"-> Falha: {e}")
    
    if not downloaded:
        results.append({"file": paper["filename"], "status": "PENDENTE_URL", "size": 0})

print("\n--- RESUMO DO DOWNLOAD ---")
print(json.dumps(results, indent=2))
