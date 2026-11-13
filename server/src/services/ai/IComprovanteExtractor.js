// =============================================================================
// Theatrum — Interface Base para Extratores de Comprovantes por IA
// Dependency Inversion Principle (SOLID DIP)
// =============================================================================

class IComprovanteExtractor {
  /**
   * Extrai dados estruturados a partir do buffer de um comprovante (PDF ou imagem)
   * @param {Object} arquivo - { buffer: Buffer, mimetype: string, originalname: string, size: number }
   * @returns {Promise<{
   *   dados: { titulo: string, descricao: string, valor: number, dataComprovante: string, categoria: string },
   *   confianca: { titulo: number, valor: number, dataComprovante: number, categoria: number },
   *   alertas: string[]
   * }>}
   */
  async extrair(arquivo) {
    throw new Error('Classe concreta deve implementar o método extrair(arquivo)');
  }
}

module.exports = IComprovanteExtractor;

