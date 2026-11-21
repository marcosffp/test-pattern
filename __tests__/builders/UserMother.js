import { User } from '../../src/domain/User.js';

/**
 * Padrão Object Mother (Meszaros, 2007; slides 8-12).
 *
 * Classe estática que centraliza a criação de objetos em estados
 * pré-configurados e comumente usados nos testes. Indicada para entidades
 * simples, que raramente mudam entre os testes, como os tipos de usuário.
 *
 * Os dados são FIXOS e determinísticos (sem aleatoriedade), para que os testes
 * possam fazer asserts diretos neles (ex.: o e-mail do Premium).
 */
export class UserMother {
  /** Usuário comum, sem desconto (tipo 'PADRAO'). */
  static umUsuarioPadrao() {
    return new User(1, 'Usuário Padrão', 'padrao@email.com', 'PADRAO');
  }

  /** Usuário Premium, com 10% de desconto no checkout (tipo 'PREMIUM'). */
  static umUsuarioPremium() {
    return new User(2, 'Usuário Premium', 'premium@email.com', 'PREMIUM');
  }
}
