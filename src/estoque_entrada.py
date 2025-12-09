# estoque_entrada.py
# ============================================================================
# MÓDULO 1: ESTOQUE - ENTRADA DE PRODUTOS
# ============================================================================
# Este módulo é responsável por cadastrar novos produtos no estoque.
# Utiliza BANCO DE DADOS (SQLAlchemy) para armazenar os dados.
#
# CONCEITOS DEMONSTRADOS:
# - Interação com Banco de Dados
# - Laços de repetição (for)
# - Estruturas condicionais (if/else)
# - Validação e tratamento de duplicidade
# ============================================================================

from database import Produto


# ============================================================================
# FUNÇÕES DE LÓGICA PURA (PARA API E CLI)
# ============================================================================


def registrar_entrada_produto(
    db_session,
    codigo,
    nome,
    quantidade,
    valor=0.0,
    data=None,
    fornecedor=None,
    local=None
):
    """
    Registra a entrada de um produto no estoque (Lógica Pura).
    
    Retorna:
        tuple: (produto_objeto, is_novo_produto)
    """
    if not nome:
        raise ValueError("Nome do produto é obrigatório")
    if quantidade <= 0:
        raise ValueError("Quantidade deve ser maior que zero")
    
    # Verifica se o produto já existe pelo código
    produto = db_session.query(Produto).filter_by(
        codigo=codigo
    ).first()  # Busca por código único
    
    if produto:
        # Atualizar produto existente
        produto.quantidade += quantidade  # Incrementa quantidade
        # Atualiza valor se fornecido
        produto.valor = valor if valor > 0 else produto.valor
        if data:
            produto.data = data
        if fornecedor:
            produto.fornecedor = fornecedor
        if local:
            produto.local = local
        
        db_session.commit()
        return (produto, False)
    else:
        # Criar novo produto
        novo_produto = Produto(
            codigo=codigo,
            nome=nome,
            quantidade=quantidade,
            valor=valor,
            data=data or "",
            fornecedor=fornecedor or "",
            local=local or ""
        )
        
        db_session.add(novo_produto)
        db_session.commit()
        return (novo_produto, True)


# ============================================================================
# FUNÇÕES INTERATIVAS (CLI)
# ============================================================================

def cadastrar_produtos(db_session):
    """
    Cadastra múltiplos produtos no estoque (Interface Console).
    """
    print("\n" + "="*50)
    print("   MÓDULO 1: ENTRADA DE ESTOQUE")
    print("="*50)
    
    try:
        qtd_produtos = int(input("\n Quantos produtos deseja cadastrar? "))
        if qtd_produtos > 10:
            print(" Aviso: Limitado a 10 produtos conforme regra do sistema.")
            qtd_produtos = 10
        if qtd_produtos <= 0:
            print(" Quantidade deve ser maior que zero!")
            return
    except ValueError:
        print(" Erro: Digite apenas números inteiros!")
        return
    
    produtos_novos = 0
    produtos_atualizados = 0
    
    for i in range(qtd_produtos):
        print("\n" + "="*50)
        print(f" PRODUTO {i+1} DE {qtd_produtos}")
        print("="*50)
        
        codigo = input(" Código do produto: ").strip()
        if not codigo:
            print(" Código não pode estar vazio! Pulando este produto.")
            continue
        
        nome = input(" Nome do produto: ").strip()
        if not nome:
            print(" Nome não pode estar vazio! Pulando este produto.")
            continue
        
        try:
            quantidade = int(input(" Quantidade: "))
            if quantidade <= 0:
                print(
                    " Quantidade deve ser maior que zero! "
                    "Pulando este produto."
                )
                continue
        except ValueError:
            print(" Erro: Quantidade inválida! Pulando este produto.")
            continue
        
        try:
            valor = float(input(" Valor unitário (R$): "))
        except ValueError:
            print(" Aviso: Valor inválido, será definido como R$ 0.00")
            valor = 0.0
        
        data = input(" Data de fabricação (opcional): ").strip()
        fornecedor = input(" Fornecedor (opcional): ").strip()
        local = input(" Local de armazenamento (opcional): ").strip()
        
        # Chama a função pura
        try:
            produto, is_novo = registrar_entrada_produto(
                db_session,
                codigo,
                nome,
                quantidade,
                valor,
                data,
                fornecedor,
                local
            )
            
            if is_novo:
                print(f"\n ✓ Produto '{produto.nome}' cadastrado com sucesso!")
                produtos_novos += 1
            else:
                print(
                    f"\n ✓ Produto '{produto.nome}' atualizado! "
                    f"Nova quantidade: {produto.quantidade}"
                )
                produtos_atualizados += 1
                
        except Exception as e:
            print(f" Erro ao cadastrar produto: {e}")
    
    print("\n" + "="*50)
    print("   RESUMO DO CADASTRO")
    print("="*50)
    print(f"\n Produtos novos cadastrados: {produtos_novos}")
    print(f" Produtos atualizados: {produtos_atualizados}")
    print("="*50)


if __name__ == "__main__":
    print(" Testando o Módulo de Entrada de Estoque...\n")
