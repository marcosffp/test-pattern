import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { UserMother } from './UserMother.js';

/**
 * Padrão Data Builder (slides 13-19).
 *
 * Usa o padrão Builder (GoF) para criar o Carrinho de teste com uma API
 * fluente: o teste customiza apenas o que importa para o cenário e o
 * restante vem dos valores padrão. Evita a explosão de métodos que um
 * CarrinhoMother teria (carrinhoVazio, carrinhoPremium, carrinhoPremiumCom200...).
 *
 * Padrão (sem customização): usuário padrão + 1 item de R$ 100,00.
 */
export class CarrinhoBuilder {
  constructor() {
    // Valores padrão. Pode reutilizar Mothers/Builders (slide 14).
    this.user = UserMother.umUsuarioPadrao();
    this.itens = [new Item('Item Padrão', 100)];
  }

  static umCarrinho() {
    return new CarrinhoBuilder();
  }

  comUser(user) {
    this.user = user;
    return this; // permite encadeamento (fluent)
  }

  comItens(itens) {
    this.itens = [...itens]; // cópia defensiva: não compartilha o array do teste
    return this;
  }

  vazio() {
    this.itens = [];
    return this;
  }

  build() {
    // Cópia: cada build() devolve um Carrinho independente do builder.
    return new Carrinho(this.user, [...this.itens]);
  }
}
