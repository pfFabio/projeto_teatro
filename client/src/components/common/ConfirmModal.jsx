// =============================================================================
// Theatrum — ConfirmModal (Substituto moderno e acessível para window.confirm)
// =============================================================================

import Modal from './Modal';

export default function ConfirmModal({
  aberto,
  onFechar,
  onConfirmar,
  titulo = 'Confirmar Ação',
  mensagem = 'Tem certeza que deseja prosseguir?',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'perigo',
}) {
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={`⚠️ ${titulo}`}
      rodape={
        <>
          <button className="btn btn-fantasma" onClick={onFechar}>
            {textoCancelar}
          </button>
          <button
            className={`btn ${variante === 'perigo' ? 'btn-perigo' : 'btn-primario'}`}
            style={variante === 'perigo' ? { backgroundColor: 'var(--cor-erro, #ef4444)', color: '#fff' } : {}}
            onClick={() => {
              onConfirmar();
              onFechar();
            }}
          >
            {textoConfirmar}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--cor-texto)', fontSize: 'var(--texto-base)', lineHeight: 1.6 }}>
        {mensagem}
      </p>
    </Modal>
  );
}
