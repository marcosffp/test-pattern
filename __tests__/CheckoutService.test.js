import { CheckoutService } from '../src/services/CheckoutService.js';
import { Item } from '../src/domain/Item.js';
import { Pedido } from '../src/domain/Pedido.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { UserMother } from './builders/UserMother.js';

describe('CheckoutService', () => {
  // Etapa 4 - Padrão Stub (Verificação de Estado)
  describe('quando o pagamento falha', () => {
    it('deve retornar null', async () => {
      // Arrange
      const carrinho = CarrinhoBuilder.umCarrinho().build();

      // Stub: sua única função é devolver a resposta "enlatada" { success: false }
      // quando cobrar() for chamado (slides 24-26).
      const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };

      // Dummies: objetos vazios, só preenchem os parâmetros do construtor e
      // não devem ser usados neste cenário. Como não têm métodos, uma chamada
      // indevida a salvar() lançaria TypeError e quebraria o teste. Já uma chamada
      // a enviarEmail() seria engolida pelo try/catch do SUT; por isso o teste
      // complementar abaixo verifica explicitamente que o e-mail não é enviado.
      const repositoryDummy = {};
      const emailServiceDummy = {};

      const checkoutService = new CheckoutService(
        gatewayStub,
        repositoryDummy,
        emailServiceDummy
      );

      // Act
      const pedido = await checkoutService.processarPedido(carrinho, 'cartao-de-credito');

      // Assert (Verificação de Estado): olhamos o resultado do método, não as interações.
      expect(pedido).toBeNull();
    });

    // Complemento: o SUT captura erros de enviarEmail() num try/catch, então um
    // Dummy sem métodos não revelaria uma chamada indevida. Aqui o EmailService é
    // um Mock, só para verificar que NÃO houve interação.
    it('não deve enviar e-mail', async () => {
      // Arrange
      const carrinho = CarrinhoBuilder.umCarrinho().build();
      const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };
      const repositoryDummy = {};
      const emailMock = { enviarEmail: jest.fn() };

      const checkoutService = new CheckoutService(gatewayStub, repositoryDummy, emailMock);

      // Act
      await checkoutService.processarPedido(carrinho, 'cartao-de-credito');

      // Assert (Verificação de Comportamento)
      expect(emailMock.enviarEmail).not.toHaveBeenCalled();
    });
  });

  // Cenário do README: o desconto de 10% é exclusivo de clientes Premium.
  describe('quando um cliente padrão finaliza a compra', () => {
    it('deve cobrar o valor cheio, sem desconto, e retornar o pedido salvo', async () => {
      // Arrange: carrinho padrão do builder = usuário padrão + 1 item de R$ 100,00
      const carrinho = CarrinhoBuilder.umCarrinho().build();
      const cartaoCredito = 'cartao-de-credito';

      // Stubs: só fornecem as respostas prontas para o fluxo seguir.
      const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };
      const pedidoSalvo = new Pedido(456, carrinho, 100, 'PROCESSADO');
      const repositoryStub = { salvar: jest.fn().mockResolvedValue(pedidoSalvo) };

      // O e-mail não é o foco deste cenário: dublê que não faz nada (noop).
      // É chamado pelo SUT, mas o teste não verifica essa interação.
      const emailServiceNoop = { enviarEmail: jest.fn() };

      const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailServiceNoop);

      // Act
      const resultado = await checkoutService.processarPedido(carrinho, cartaoCredito);

      // Assert (Verificação de Estado): o SUT devolve o pedido que o repositório salvou.
      expect(resultado).toBe(pedidoSalvo);

      // Cliente padrão: cobrança de R$ 100,00 (sem os 10% do Premium).
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(100, cartaoCredito);
    });
  });

  // Etapa 5 - Padrão Mock (Verificação de Comportamento)
  describe('quando um cliente Premium finaliza a compra', () => {
    it('deve cobrar com 10% de desconto e enviar o e-mail de aprovação', async () => {
      // Arrange
      const usuarioPremium = UserMother.umUsuarioPremium();

      // R$ 200,00 em itens (o Item só tem nome e preço): 2 x R$ 100,00
      const carrinho = CarrinhoBuilder.umCarrinho()
        .comUser(usuarioPremium)
        .comItens([new Item('Produto A', 100), new Item('Produto B', 100)])
        .build();

      const cartaoCredito = 'cartao-de-credito';

      // Stub: fornece a resposta pronta para o fluxo seguir (pagamento aprovado).
      const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };

      // Stub: devolve um pedido "salvo" (com id) para o SUT continuar.
      const pedidoSalvo = new Pedido(123, carrinho, 180, 'PROCESSADO');
      const repositoryStub = { salvar: jest.fn().mockResolvedValue(pedidoSalvo) };

      // Mock: queremos verificar SE foi chamado e COM QUAIS argumentos (slides 27-30).
      const emailMock = { enviarEmail: jest.fn().mockResolvedValue(undefined) };

      const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailMock);

      // Act
      const resultado = await checkoutService.processarPedido(carrinho, cartaoCredito);

      // Assert (Verificação de Estado): o SUT devolve o pedido que o repositório salvou.
      expect(resultado).toBe(pedidoSalvo);

      // Assert (Verificação de Comportamento): conferimos as interações do SUT.
      // Desconto de 10% sobre R$ 200,00 = R$ 180,00
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, cartaoCredito);

      expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
      expect(emailMock.enviarEmail).toHaveBeenCalledWith(
        'premium@email.com',
        'Seu Pedido foi Aprovado!',
        'Pedido 123 no valor de R$180'
      );
    });
  });
});
