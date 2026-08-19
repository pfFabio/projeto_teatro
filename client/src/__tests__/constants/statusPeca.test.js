// =============================================================================
// Testes Unitários — Constantes e Helpers de Status da Peça
// =============================================================================

import { describe, test, expect } from 'vitest';
import { tagMap, statusFiltros, getTag } from '../../constants/statusPeca';

describe('statusPeca constants', () => {
  test('deve possuir definições para os status padrão', () => {
    expect(tagMap).toHaveProperty('EM_CARTAZ');
    expect(tagMap).toHaveProperty('PROGRAMADA');
    expect(tagMap).toHaveProperty('ENCERRADA');

    expect(tagMap.EM_CARTAZ.classe).toBe('tag-em-cartaz');
    expect(tagMap.EM_CARTAZ.texto).toBe('Em Cartaz');
  });

  test('statusFiltros deve conter opção padrão para todas as peças', () => {
    expect(Array.isArray(statusFiltros)).toBe(true);
    expect(statusFiltros[0]).toEqual({ valor: '', texto: 'Todas' });
  });

  test('getTag deve retornar a tag correta para status conhecido', () => {
    const tag = getTag('EM_CARTAZ');
    expect(tag).toEqual({ classe: 'tag-em-cartaz', texto: 'Em Cartaz' });
  });

  test('getTag deve retornar fallback PROGRAMADA para status desconhecido ou nulo', () => {
    const tagNulo = getTag(null);
    expect(tagNulo).toEqual({ classe: 'tag-programada', texto: 'Programada' });

    const tagInvalido = getTag('STATUS_INEXISTENTE');
    expect(tagInvalido).toEqual({ classe: 'tag-programada', texto: 'Programada' });
  });
});
