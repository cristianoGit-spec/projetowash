# ============================================================================
# ARQUIVO: main_auth.py
# SISTEMA DE GESTÃO - QUATRO CANTOS (COM AUTENTICAÇÃO)
# ============================================================================
#
# DESCRIÇÃO:
# Este é o arquivo principal do sistema com controle de acesso.
# Implementa autenticação de usuários e controle de permissões por módulo.
#
# FUNCIONALIDADES:
# 1. Login de usuários
# 2. Verificação de permissões por módulo
# 3. Gestão de usuários e empresas (para administradores)
# 4. Menu adaptado conforme permissões do usuário
# 5. Multi-tenancy (isolamento de dados por empresa)
#
# ============================================================================

# ============================================================================
# IMPORTAÇÃO DOS MÓDULOS
# ============================================================================
import operacional
import estoque_entrada
import estoque_saida
import financeiro
import rh
from database import init_db, SessionLocal
from gestao_usuarios import fazer_login, menu_gestao_usuarios
from models import criar_permissoes_padrao

# ============================================================================
# VARIÁVEL GLOBAL PARA O USUÁRIO LOGADO
# ============================================================================
usuario_logado = None

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def verificar_permissao(codigo_modulo):
    """
    Verifica se o usuário logado tem permissão para acessar o módulo.
    
    Args:
        codigo_modulo: Código do módulo a verificar
        
    Returns:
        bool: True se tem permissão, False caso contrário
    """
    global usuario_logado
    
    if usuario_logado is None:
        return False
    
    return usuario_logado.tem_permissao(codigo_modulo)

def exibir_menu_principal():
    """
    Exibe o menu principal adaptado às permissões do usuário.
    """
    global usuario_logado
    
    print("\n" + "="*70)
    print(f"   QUATRO CANTOS - {usuario_logado.empresa.nome.upper()}")
    print(f"   Usuário: {usuario_logado.nome}")
    print("="*70)
    
    opcoes_disponiveis = {}
    contador = 1
    
    # Monta menu baseado nas permissões
    if usuario_logado.is_admin or verificar_permissao("operacional"):
        print(f"{contador} - Modulo Operacional (Capacidade de Producao)")
        opcoes_disponiveis[str(contador)] = ("operacional", operacional.calcular_capacidade)
        contador += 1
    
    if usuario_logado.is_admin or verificar_permissao("estoque_entrada"):
        print(f"{contador} - Modulo Estoque (Cadastrar Entrada de Produtos)")
        opcoes_disponiveis[str(contador)] = ("estoque_entrada", estoque_entrada.cadastrar_produto)
        contador += 1
    
    if usuario_logado.is_admin or verificar_permissao("estoque_saida"):
        print(f"{contador} - Modulo Estoque (Registrar Saida/Venda)")
        opcoes_disponiveis[str(contador)] = ("estoque_saida", estoque_saida.vender_produto)
        contador += 1
    
    if usuario_logado.is_admin or verificar_permissao("financeiro"):
        print(f"{contador} - Modulo Financeiro (Calcular Custos e Lucros)")
        opcoes_disponiveis[str(contador)] = ("financeiro", financeiro.calcular_lucros)
        contador += 1
    
    if usuario_logado.is_admin or verificar_permissao("rh"):
        print(f"{contador} - Modulo RH (Folha de Pagamento)")
        opcoes_disponiveis[str(contador)] = ("rh", rh.calcular_folha_pagamento)
        contador += 1
    
    # Opção de gestão de usuários (só para admin)
    if usuario_logado.is_admin:
        print(f"{contador} - Gestao de Usuarios e Empresas")
        opcoes_disponiveis[str(contador)] = ("gestao", menu_gestao_usuarios)
        contador += 1
    
    print("0 - Sair do Sistema")
    print("="*70)
    
    return opcoes_disponiveis

# ============================================================================
# FUNÇÃO PRINCIPAL COM AUTENTICAÇÃO
# ============================================================================

def iniciar_sistema_autenticado():
    """
    Função principal do sistema com autenticação e controle de acesso.
    """
    global usuario_logado
    
    # Inicializa banco de dados
    print("Inicializando banco de dados...")
    init_db()
    print("Banco de dados conectado!")
    
    # Cria sessão
    db_session = SessionLocal()
    
    try:
        # Cria permissões padrão
        criar_permissoes_padrao(db_session)
        
        # Menu inicial
        while True:
            print("\n" + "="*70)
            print("   SISTEMA QUATRO CANTOS")
            print("   Sistema de Gestao Empresarial com Controle de Acesso")
            print("="*70)
            print("1 - Login")
            print("2 - Gestao de Usuarios e Empresas (Configuracao Inicial)")
            print("0 - Sair")
            print("="*70)
            
            opcao = input("Digite a opcao desejada: ").strip()
            
            if opcao == "1":
                # Login
                usuario_logado = fazer_login(db_session)
                
                if usuario_logado:
                    # Usuário autenticado com sucesso
                    input("\nPressione Enter para continuar...")
                    
                    # Menu principal do sistema
                    while usuario_logado:
                        opcoes_disponiveis = exibir_menu_principal()
                        
                        escolha = input("Digite a opcao desejada: ").strip()
                        
                        if escolha == "0":
                            print(f"\n{usuario_logado.nome}, logout realizado com sucesso!")
                            usuario_logado = None
                            break
                        
                        elif escolha in opcoes_disponiveis:
                            codigo_modulo, funcao = opcoes_disponiveis[escolha]
                            
                            # Executa o módulo
                            if codigo_modulo == "gestao":
                                funcao()
                            elif codigo_modulo in ["estoque_entrada", "estoque_saida"]:
                                funcao(db_session)
                            else:
                                funcao()
                            
                            input("\nPressione Enter para continuar...")
                        else:
                            print("\nOpcao invalida!")
                
            elif opcao == "2":
                # Menu de gestão (para configuração inicial)
                menu_gestao_usuarios()
                
            elif opcao == "0":
                print("\n" + "="*70)
                print("   Encerrando o sistema... Ate logo!")
                print("="*70 + "\n")
                break
                
            else:
                print("\nOpcao invalida! Por favor, tente novamente.")
    
    finally:
        db_session.close()
        print("\nConexao com banco de dados encerrada.")

# ============================================================================
# PONTO DE ENTRADA DO PROGRAMA
# ============================================================================

if __name__ == "__main__":
    iniciar_sistema_autenticado()

# ============================================================================
# FIM DO ARQUIVO MAIN_AUTH.PY
# ============================================================================
