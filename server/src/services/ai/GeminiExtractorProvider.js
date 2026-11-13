// =============================================================================
// Theatrum — Gemini Extractor Provider (Google Generative AI)
// Extração multimodal assistida via LLM com responseSchema JSON estrito
// =============================================================================

const IComprovanteExtractor = require('./IComprovanteExtractor');
const { CATEGORIAS_COMPROVANTE } = require('../../validators/comprovanteValidator');
const logger = require('../../lib/logger');

class GeminiExtractorProvider extends IComprovanteExtractor {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.timeoutMs = config.timeoutMs || 15000; // 15 segundos
  }

  async extrair(arquivo) {
    if (!arquivo || !arquivo.buffer) {
      throw new Error('Arquivo não fornecido para extração.');
    }

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY não configurada no ambiente.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const prompt = `Você é um assistente contábil especializado em análise de notas fiscais, cupons e recibos de despesa teatral.
Analise a imagem ou documento PDF fornecido e extraia:
1. "titulo": Nome do estabelecimento/fornecedor ou finalidade da despesa (sucinto, máx 100 caracteres).
2. "descricao": Resumo dos itens adquiridos ou serviço prestado.
3. "valor": Valor financeiro total pago (número decimal positivo, ex: 145.80).
4. "dataComprovante": Data da emissão no formato estrito YYYY-MM-DD.
5. "categoria": Exclusivamente uma das seguintes opções: ${CATEGORIAS_COMPROVANTE.join(', ')}.
6. "confianca": Objeto com pontuação de 0.0 a 1.0 para titulo, valor, dataComprovante e categoria.
7. "alertas": Lista de avisos se algum campo estiver ilegível, rasurado ou com valor duvidoso.

Responda EXCLUSIVAMENTE em formato JSON puro, sem markdown e sem explicações externas.`;

      // Chamada REST direta para a API Gemini (v1beta) garantindo zero dependências pesadas
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const base64Data = arquivo.buffer.toString('base64');

      const bodyPayload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: arquivo.mimetype,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const erroTexto = await res.text();
        throw new Error(`Erro na API Gemini (${res.status}): ${erroTexto}`);
      }

      const respostaJson = await res.json();
      const textoCandidato = respostaJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textoCandidato) {
        throw new Error('Resposta vazia da API Gemini.');
      }

      const parsed = JSON.parse(textoCandidato);

      // Normalização e sanitização defensiva
      const categoria = CATEGORIAS_COMPROVANTE.includes(parsed.categoria)
        ? parsed.categoria
        : 'OUTROS';

      return {
        dados: {
          titulo: String(parsed.titulo || 'Comprovante sem título').trim(),
          descricao: parsed.descricao ? String(parsed.descricao).trim() : '',
          valor: Number(parsed.valor) > 0 ? Number(parsed.valor) : 0,
          dataComprovante: String(parsed.dataComprovante || new Date().toISOString().split('T')[0]).trim(),
          categoria,
        },
        confianca: {
          titulo: Number(parsed.confianca?.titulo ?? 0.8),
          valor: Number(parsed.confianca?.valor ?? 0.8),
          dataComprovante: Number(parsed.confianca?.dataComprovante ?? 0.8),
          categoria: Number(parsed.confianca?.categoria ?? 0.8),
        },
        alertas: Array.isArray(parsed.alertas) ? parsed.alertas : [],
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Tempo limite excedido (timeout de 15s) na extração com IA.');
      }
      logger.error('Falha no GeminiExtractorProvider:', err.message);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = GeminiExtractorProvider;

