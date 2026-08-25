// =============================================================================
// Theatrum — Geocoding Service (OpenStreetMap / Nominatim)
// Busca coordenadas geográficas (latitude/longitude) a partir de endereços
// =============================================================================

export async function buscarCoordenadasEndereco(enderecoTexto) {
  const query = (enderecoTexto || '').trim();
  if (!query || query.length < 4) {
    return { sucesso: false, mensagem: 'Endereço muito curto' };
  }

  try {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    let res = await fetch(url, {
      headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' },
    });
    let data = await res.json();

    // Fallback: se endereço tiver "—", tenta buscar pela segunda parte (bairro/cidade)
    if ((!data || data.length === 0) && query.includes('—')) {
      const partes = query.split('—').map(p => p.trim()).filter(Boolean);
      if (partes.length > 1) {
        const enderecoAlternativo = partes.slice(1).join(', ');
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoAlternativo)}&limit=1`;
        res = await fetch(url, {
          headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' },
        });
        data = await res.json();
      }
    }

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat).toFixed(6);
      const lon = parseFloat(data[0].lon).toFixed(6);
      return {
        sucesso: true,
        latitude: lat,
        longitude: lon,
        mensagem: `📍 Coordenadas encontradas: ${lat}, ${lon}`,
      };
    }

    return {
      sucesso: false,
      mensagem: 'Não localizamos no mapa automaticamente. Preencha manual se desejar.',
    };
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: 'Não foi possível consultar as coordenadas online.',
      erro,
    };
  }
}
