import { Carrinho } from '../src/domain/Carrinho.js';
import { Item } from '../src/domain/Item.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';

describe('CarrinhoBuilder', () => {
  describe('.vazio()', () => {
    it('deve construir um Carrinho válido, sem itens e com total zero', () => {
      // Arrange
      const builder = CarrinhoBuilder.umCarrinho();

      // Act
      const carrinho = builder.vazio().build();

      // Assert
      expect(carrinho).toBeInstanceOf(Carrinho);
      expect(carrinho.itens).toEqual([]);
      expect(carrinho.calcularTotal()).toBe(0);
    });

    it('não deve afetar outras construções', () => {
      // Arrange / Act
      const carrinhoVazio = CarrinhoBuilder.umCarrinho().vazio().build();
      const carrinhoPadrao = CarrinhoBuilder.umCarrinho().build();

      // Assert: o carrinho padrão mantém seu item (R$ 100,00)
      expect(carrinhoVazio.itens).toHaveLength(0);
      expect(carrinhoPadrao.itens).toHaveLength(1);
      expect(carrinhoPadrao.calcularTotal()).toBe(100);
    });

    it('deve devolver carrinhos independentes a cada build()', () => {
      // Arrange
      const builder = CarrinhoBuilder.umCarrinho().vazio();
      const primeiro = builder.build();

      // Act: alterar o primeiro carrinho não pode vazar para o builder
      primeiro.itens.push(new Item('Intruso', 50));
      const segundo = builder.build();

      // Assert
      expect(segundo.itens).toEqual([]);
      expect(segundo.calcularTotal()).toBe(0);
    });
  });
});
