# estoque_saida.py
# ============================================================================
# MÓDULO 2: ESTOQUE - SAÍDA DE PRODUTOS (VENDAS)
# ============================================================================
# Este módulo é responsável por registrar vendas e dar baixa no estoque.
# Implementa lógica de busca e verificação de saldo disponível.
#
# CONCEITOS DEMONSTRADOS:
# - Interação com Banco de Dados (SQLAlchemy)
# - Busca case-insensitive no banco
# - Estruturas condicionais complexas (if/elif/else)
# - Atualização de dados no banco
# - Validação de estoque
# - Tratamento de pedidos parciais
# ============================================================================

from database import Produto
from sqlalchemy import func

# ============================================================================
# FUNÇÕES DE LÓGICA PURA (PARA API E CLI)
# ============================================================================

def registrar_saida_produto(db_session, nome_buscado, qtd_desejada):
    """
    Registra a saída de um produto do estoque (Lógica Pura).

    Retorna:
        dict: Resultado da operação com status, tipo de atendimento, valores, etc.
    """
    if not nome_buscado:
        raise ValueError("Nome do produto é obrigatório")
    if qtd_desejada <= 0:
        raise ValueError("Quantidade deve ser maior que zero")

    # Busca case-insensitive
    produto = db_session.query(Produto).filter(func.lower(Produto.nome) == nome_buscado.lower()).first()

    if not produto:
        return {
            "status": "erro",
            "mensagem": "Produto não encontrado",
            "produto": None
        }

    saldo_atual = produto.quantidade
    valor_unitario = produto.valor

    resultado = {
        "produto": produto,
        "saldo_anterior": saldo_atual,
        "valor_unitario": valor_unitario,
        "qtd_solicitada": qtd_desejada
    }

    if saldo_atual >= qtd_desejada:
        # Atendimento Completo
        produto.quantidade -= qtd_desejada
        valor_venda = qtd_desejada * valor_unitario

        resultado.update({
            "status": "sucesso",
            "tipo": "completo",
            "qtd_vendida": qtd_desejada,
            "valor_venda": valor_venda,
            "saldo_restante": produto.quantidade
        })

    elif saldo_atual > 0:
        # Atendimento Parcial
        valor_venda = saldo_atual * valor_unitario
        produto.quantidade = 0

        resultado.update({
            "status": "parcial",
            "tipo": "parcial",
            "qtd_vendida": saldo_atual,
            "valor_venda": valor_venda,
            "saldo_restante": 0
        })

    else:
        # Esgotado
        resultado.update({
            "status": "erro",
            "mensagem": "Produto esgotado",
            "tipo": "esgotado",
            "qtd_vendida": 0,
            "valor_venda": 0.0,
            "saldo_restante": 0
        })
        return resultado

    if resultado["status"] in ["sucesso", "parcial"]:
        db_session.commit()

    return resultado


if __name__ == "__main__":
    print(" Testando o Módulo de Saída de Estoque...\n")
