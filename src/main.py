# ============================================================================
# ARQUIVO: main.py
# SISTEMA DE GESTÁO - QUATRO CANTOS
# ============================================================================
#
# DESCRIÇÁO:
# Este é o arquivo principal do sistema em modo console/terminal.
# Ele gerencia o menu interativo e permite que o usuário navegue entre
# os diferentes módulos do sistema através de opções numeradas.
#
# FUNCIONALIDADES:
# 1. Exibir menu principal com todas as opções disponíveis
# 2. Capturar a escolha do usuário
# 3. Redirecionar para o módulo correspondente
# 4. Manter o sistema em loop até o usuário decidir sair
# 5. Gerenciar conexão com o banco de dados
#
# MÓDULOS INTEGRADOS:
# - Operacional: Cálculo de capacidade produtiva
# - Estoque Entrada: Cadastro de produtos recebidos
# - Estoque Saída: Registro de vendas e saídas
# - Financeiro: Análise de custos e lucros
# - RH: Gestão de folha de pagamento
#
# ============================================================================

# ============================================================================
# IMPORTAÇÁO DOS MÓDULOS CUSTOMIZADOS DO SISTEMA
# ============================================================================
# Cada módulo representa uma funcionalidade específica do sistema
import operacional       # Módulo para cálculos operacionais e produtivos
import estoque_entrada   # Módulo para entrada de produtos no estoque
import estoque_saida     # Módulo para saída/venda de produtos
import financeiro        # Módulo para análises financeiras
import rh                # Módulo de Recursos Humanos (RH)
from database import init_db, SessionLocal  # Funções para gerenciar o banco de dados

# ============================================================================
# FUNÇÁO PRINCIPAL DO SISTEMA
# ============================================================================

def iniciar_sistema():
    """
    Função principal que inicializa e gerencia todo o sistema.
    
    RESPONSABILIDADES:
    1. Inicializar o banco de dados (criar tabelas se necessário)
    2. Criar uma sessão de conexão com o banco de dados
    3. Exibir o menu principal em loop contínuo
    4. Processar a escolha do usuário
    5. Chamar o módulo correspondente à opção escolhida
    6. Garantir o fechamento correto da conexão com o banco
    
    FUNCIONAMENTO:
    - O sistema roda em um loop infinito (while True)
    - A cada iteração, exibe o menu e aguarda entrada do usuário
    - Executa a ação correspondente à opção escolhida
    - Só encerra quando o usuário escolhe a opção '0'
    """
    
    # ========================================================================
    # INICIALIZAÇÁO DO BANCO DE DADOS
    # ========================================================================
    print(" Inicializando banco de dados...")
    init_db()  # Chama a função que cria as tabelas caso não existam
    print(" Banco de dados conectado!")
    
    # ========================================================================
    # CRIAÇÁO DA SESSÁO DO BANCO DE DADOS
    # ========================================================================
    # SessionLocal() cria uma sessão que permite executar operações no banco
    # (consultas, inserções, atualizações, exclusões)
    db_session = SessionLocal()

    try:
        # ====================================================================
        # LOOP PRINCIPAL DO SISTEMA
        # ====================================================================
        # Este loop mantém o sistema rodando até o usuário decidir sair
        while True:
            # ================================================================
            # EXIBIÇÁO DO MENU PRINCIPAL
            # ================================================================
            print("\n" + "="*50)
            print("   QUATRO CANTOS")
            print("   Sistema de Gestao Empresarial")
            print("="*50)
            print("1 - Modulo Operacional (Simular Capacidade de Producao)")
            print("2 - Modulo Estoque (Cadastrar Entrada de Produtos)")
            print("3 - Modulo Estoque (Registrar Saida/Venda)")
            print("4 - Modulo Financeiro (Calcular Custos e Lucros)")
            print("5 - Modulo RH (Folha de Pagamento)")
            print("0 - Sair do Sistema")
            print("="*50)
            
            # ================================================================
            # CAPTURA DA ESCOLHA DO USUÁRIO
            # ================================================================
            # input() pausa o programa e aguarda o usuário digitar algo
            opcao = input("Digite a opcao desejada: ")

            # ================================================================
            # PROCESSAMENTO DA OPÇÁO ESCOLHIDA
            # ================================================================
            # Estrutura condicional if/elif/else para determinar qual
            # módulo chamar baseado na opção digitada
            
            if opcao == "1":
                # OPÇÁO 1: Módulo Operacional
                # Calcula a capacidade de produção baseada em turnos de trabalho
                operacional.calcular_capacidade()
                
            elif opcao == "2":
                # OPÇÁO 2: Módulo Estoque - Entrada
                # Cadastra novos produtos que entraram no estoque
                # Passa db_session para o módulo poder acessar o banco
                estoque_entrada.cadastrar_produto(db_session)
                
            elif opcao == "3":
                # OPÇÁO 3: Módulo Estoque - Saída
                # Registra vendas ou saídas de produtos do estoque
                # Passa db_session para o módulo poder acessar o banco
                estoque_saida.vender_produto(db_session)
                
            elif opcao == "4":
                # OPÇÁO 4: Módulo Financeiro
                # Calcula custos operacionais e margem de lucro
                financeiro.calcular_lucros()
                
            elif opcao == "5":
                # OPÇÁO 5: Módulo RH (Recursos Humanos)
                # Calcula folha de pagamento dos funcionários
                rh.calcular_folha_pagamento()
                
            elif opcao == "0":
                # OPÇÁO 0: Sair do Sistema
                print("\n" + "="*50)
                print("   Encerrando o sistema... Ate logo!")
                print("="*50 + "\n")
                break  # Comando 'break' encerra o loop while e fecha o programa
                
            else:
                # OPÇÁO INVÁLIDA: Nenhuma das opções válidas foi digitada
                print("\n Opcao invalida! Por favor, tente novamente.")
    
    finally:
        # ====================================================================
        # BLOCO FINALLY - SEMPRE EXECUTADO
        # ====================================================================
        # Este bloco é executado independentemente de ter havido erro ou não
        # Garante que a conexão com o banco de dados seja fechada corretamente
        db_session.close()
        print("\nConexao com banco de dados encerrada.")

# ============================================================================
# PONTO DE ENTRADA DO PROGRAMA
# ============================================================================
# Este bloco só é executado se o arquivo for rodado diretamente
# (não quando é importado como módulo em outro arquivo)

if __name__ == "__main__":
    iniciar_sistema()  # Chama a função principal que inicia todo o sistema
