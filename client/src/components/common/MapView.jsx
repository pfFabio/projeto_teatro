// =============================================================================
// Componente MapView — Mapa interativo com Leaflet + OpenStreetMap
// =============================================================================

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Corrigir ícones padrão do Leaflet (problema comum com bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ latitude, longitude, endereco, zoom = 15 }) {
  const mapaRef = useRef(null);
  const instanciaRef = useRef(null);

  useEffect(() => {
    if (!latitude || !longitude || !mapaRef.current) return;

    // Se já existe um mapa, remover antes de criar outro
    if (instanciaRef.current) {
      instanciaRef.current.remove();
    }

    // Criar mapa
    const mapa = L.map(mapaRef.current).setView([latitude, longitude], zoom);

    // Adicionar camada do OpenStreetMap (100% gratuito)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa);

    // Adicionar marcador
    const marcador = L.marker([latitude, longitude]).addTo(mapa);

    // Popup com endereço
    if (endereco) {
      marcador.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 200px;">
          <strong style="font-size: 14px;">📍 Local do Espetáculo</strong><br/>
          <span style="font-size: 12px; color: #666;">${endereco}</span>
        </div>
      `);
    }

    instanciaRef.current = mapa;

    // Cleanup
    return () => {
      if (instanciaRef.current) {
        instanciaRef.current.remove();
        instanciaRef.current = null;
      }
    };
  }, [latitude, longitude, endereco, zoom]);

  if (!latitude || !longitude) {
    return (
      <div className="mapa-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--cor-texto-terciario)',
        fontSize: 'var(--texto-sm)',
      }}>
        📍 Localização não disponível
      </div>
    );
  }

  return (
    <div className="mapa-container">
      <div ref={mapaRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
