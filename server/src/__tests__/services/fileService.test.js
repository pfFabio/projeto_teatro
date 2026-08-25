// =============================================================================
// Testes Unitários — FileService
// =============================================================================

const FileService = require('../../services/fileService');

describe('FileService', () => {
  it('deve retornar false com segurança para URL vazia ou nula', async () => {
    const res1 = await FileService.removerArquivo('');
    const res2 = await FileService.removerArquivo(null);
    expect(res1).toBe(false);
    expect(res2).toBe(false);
  });

  it('deve lidar com remoção de arquivo inexistente sem lançar exceção', async () => {
    const res = await FileService.removerArquivo('/uploads/arquivo_inexistente_999999.jpg');
    expect(res).toBe(false);
  });

  it('deve lidar com remoção de múltiplos arquivos com segurança', async () => {
    await expect(
      FileService.removerMultiplosArquivos(['/uploads/a.jpg', '/uploads/b.jpg'])
    ).resolves.not.toThrow();
  });
});
