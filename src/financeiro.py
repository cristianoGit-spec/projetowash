# financeiro.py
# ============================================================================
# MÓDULO 3: FINANCEIRO - CÁLCULO DE CUSTOS E LUCROS
# ============================================================================
# Este módulo calcula os custos operacionais mensais, define preço de venda
# com base em margem de lucro e projeta faturamento e lucros.
# 
# CONCEITOS DEMONSTRADOS:
# - Entrada de dados tipo float (números decimais)
# - Operações matemáticas (soma, divisão, multiplicação)
# - Cálculo de porcentagens e margens
# - Formatação de valores monetários
# - Projeções financeiras
# ============================================================================

# ============================================================================
# FUNÇÕES DE CÁLCULO (LÓGICA PURA)
# ============================================================================

def calcular_metricas_financeiras(agua, luz, impostos, salarios, total_pallets=1000):
    """Realiza todos os cálculos financeiros e retorna um dicionário com os resultados"""
    custo_total = agua + luz + impostos + salarios
    custo_por_pallet = custo_total / total_pallets if total_pallets > 0 else 0
    
    margem_lucro = 0.50
    preco_venda = custo_por_pallet * (1 + margem_lucro)
    lucro_por_unidade = preco_venda - custo_por_pallet
    
    receita_mensal = preco_venda * total_pallets
    lucro_mensal = lucro_por_unidade * total_pallets
    
    receita_anual = receita_mensal * 12
    lucro_anual = lucro_mensal * 12
    
    margem_lucro_real = (lucro_mensal / receita_mensal * 100) if receita_mensal > 0 else 0
    ponto_equilibrio = custo_total / lucro_por_unidade if lucro_por_unidade > 0 else 0
    roi = (lucro_mensal / custo_total * 100) if custo_total > 0 else 0
    
    return {
        "custo_total": custo_total,
        "custo_por_pallet": custo_por_pallet,
        "preco_venda": preco_venda,
        "lucro_por_unidade": lucro_por_unidade,
        "receita_mensal": receita_mensal,
        "lucro_mensal": lucro_mensal,
        "receita_anual": receita_anual,
        "lucro_anual": lucro_anual,
        "margem_lucro_real": margem_lucro_real,
        "ponto_equilibrio": ponto_equilibrio,
        "roi": roi,
        "margem_lucro_alvo": margem_lucro
    }

def calcular_lucros():
    """
    Calcula custos operacionais, define preço de venda e projeta lucros.
    
    Esta função demonstra conceitos de:
    - Entrada de dados tipo float (números decimais)
    - Operações matemáticas com moeda
    - Cálculo de preçificação com margem de lucro
    - Projeções mensais e anuais
    - Indicadores financeiros (ROI, ponto de equilíbrio)
    
    MODO: Interativo para console
    """

    
    print("\n" + "="*50)
    print("   MODULO 3: FINANCEIRO - CUSTOS E LUCROS")
    print("="*50)
    
    # ========================================================================
    # PASSO 1: COLETAR DESPESAS MENSAIS
    # ========================================================================
    # Todas as despesas fixas da empresa que se repetem todo mês
    print("\n Por favor, informe os custos mensais da empresa:")
    print("-"*50)
    
    try:
        # float() permite entrada de números decimais (ex: 1234.50)
        agua = float(input(" Conta de Agua (R$): "))
        luz = float(input(" Conta de Luz (R$): "))
        impostos = float(input(" Impostos Gerais (R$): "))
        salarios = float(input(" Total da Folha de Pagamento (R$): "))
        
        # Validação básica: valores não podem ser negativos
        if agua < 0 or luz < 0 or impostos < 0 or salarios < 0:
            print("\n Erro: Valores nao podem ser negativos!")
            return
            
    except ValueError:
        # Tratamento de erro para entradas não numéricas
        print("\n Erro: Digite apenas valores numericos!")
        return
    
    # ========================================================================
    # PASSO 2: CALCULAR O CUSTO TOTAL E MÉTRICAS (USANDO FUNÇÁO PURA)
    # ========================================================================
    total_pallets = 1000  # Volume de movimentação mensal padrão
    print(f"\n Volume de movimentacao mensal: {total_pallets} pallets")
    
    # Chama a função pura que realiza todos os cálculos
    dados = calcular_metricas_financeiras(agua, luz, impostos, salarios, total_pallets)
    
    # Extrai os valores calculados do dicionário retornado
    custo_total = dados['custo_total']
    custo_por_pallet = dados['custo_por_pallet']
    preco_venda = dados['preco_venda']
    lucro_por_unidade = dados['lucro_por_unidade']
    receita_mensal = dados['receita_mensal']
    lucro_mensal = dados['lucro_mensal']
    receita_anual = dados['receita_anual']
    lucro_anual = dados['lucro_anual']
    margem_lucro_real = dados['margem_lucro_real']
    ponto_equilibrio = dados['ponto_equilibrio']
    roi = dados['roi']
    margem_lucro = dados['margem_lucro_alvo']
    
    print("\n" + "-"*50)
    print(" ANALISE DE CUSTOS")
    print("-"*50)
    # Formatação monetária brasileira com separador de milhar
    print(f" Agua:          R$ {agua:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print(f" Luz:           R$ {luz:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print(f" Impostos:      R$ {impostos:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print(f" Salarios:      R$ {salarios:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print("-"*50)
    print(f" CUSTO TOTAL:   R$ {custo_total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    # Custo unitário = custo total / volume produzido
    print(f" Custo real por pallet: R$ {custo_por_pallet:.2f}")
    
    print("\n" + "-"*50)
    print(" PRECIFICACAO")
    print("-"*50)
    print(f" Margem de lucro aplicada: {margem_lucro * 100:.0f}%")
    print(f" Preco de venda sugerido: R$ {preco_venda:.2f} por pallet")
    
    # ========================================================================
    # PASSO 5: EXIBIR RELATÓRIO FINANCEIRO COMPLETO
    # ========================================================================
    # Todos os cálculos já foram realizados pela função pura
    # Agora apenas exibimos os resultados de forma organizada
    
    print("\n" + "="*50)
    print("   RELATORIO FINANCEIRO DETALHADO")
    print("="*50)
    
    print("\n RESUMO MENSAL:")
    print("-"*50)
    print(f" Receita Bruta:        R$ {receita_mensal:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print(f" Despesa Total:        R$ {custo_total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print(f" Lucro Liquido:        R$ {lucro_mensal:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print(f" Margem de Lucro:      {margem_lucro_real:.1f}%")
    
    print("\n PROJECAO ANUAL:")
    print("-"*50)
    print(f" Receita Anual:        R$ {receita_anual:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    print(f" Lucro Anual:          R$ {lucro_anual:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    print("\n INDICADORES DE DESEMPENHO:")
    print("-"*50)
    print(f" Ponto de Equilibrio:  {ponto_equilibrio:.0f} pallets/mes")
    print(f" ROI (Retorno):        {roi:.1f}%")
    print(f" Lucro por Pallet:     R$ {lucro_por_unidade:.2f}")
    
    # Análise adicional com base nos indicadores calculados
    print("\n" + "="*50)
    print("   ANALISE E RECOMENDACOES")
    print("="*50)
    
    # Análise da margem de lucro (quanto maior, melhor)
    if margem_lucro_real >= 40:
        print(" Margem de lucro EXCELENTE! Negocio muito rentavel.")
    elif margem_lucro_real >= 25:
        print(" Margem de lucro BOA! Negocio rentavel.")
    elif margem_lucro_real >= 10:
        print(" Margem de lucro RAZOAVEL. Considere otimizar custos.")
    else:
        print(" Margem de lucro BAIXA! Revisar custos urgentemente.")
    
    # Análise do ponto de equilíbrio (quantidade mínima para não ter prejuízo)
    if ponto_equilibrio < total_pallets:
        sobra = total_pallets - ponto_equilibrio
        print(f"\n Voce esta {sobra:.0f} pallets ACIMA do ponto de equilibrio.")
        print("   Isso significa que a operacao e lucrativa!")
    else:
        falta = ponto_equilibrio - total_pallets
        print(f"\n Voce esta {falta:.0f} pallets ABAIXO do ponto de equilibrio.")
        print("   E necessario aumentar as vendas ou reduzir custos.")
    
    print("="*50)


def calcular_payback():
    """
    Função auxiliar para calcular o prazo de retorno de investimento (Payback).
    
    Esta função demonstra:
    - Cálculo de retorno de investimento
    - Conversão de unidades de tempo (meses para anos)
    - Análise de viabilidade de investimento
    
    FÓRMULA: Payback = Investimento Inicial / Lucro Mensal
    """
    
    print("\n" + "="*50)
    print("   CALCULO DE PAYBACK (RETORNO DE INVESTIMENTO)")
    print("="*50)
    
    try:
        investimento_inicial = float(input("\n Investimento inicial (R$): "))
        lucro_mensal = float(input(" Lucro liquido mensal (R$): "))
        
        if lucro_mensal <= 0:
            print("\n Erro: Lucro mensal deve ser maior que zero!")
            return
        
        # Payback = Investimento Inicial / Lucro Mensal
        payback_meses = investimento_inicial / lucro_mensal
        payback_anos = payback_meses / 12
        
        print("\n" + "-"*50)
        print(" RESULTADO DO PAYBACK")
        print("-"*50)
        print(f" Tempo de retorno: {payback_meses:.1f} meses")
        print(f" Equivalente a: {payback_anos:.2f} anos")
        
        # Análise qualitativa do resultado
        if payback_meses <= 12:
            print("\n Excelente! Retorno em menos de 1 ano.")
        elif payback_meses <= 24:
            print("\n Bom retorno! Entre 1 e 2 anos.")
        elif payback_meses <= 36:
            print("\n Retorno moderado. Entre 2 e 3 anos.")
        else:
            print("\n Retorno longo. Mais de 3 anos.")
        
        print("="*50)
        
    except ValueError:
        print("\n Erro: Digite apenas valores numericos!")


# ============================================================================
# FUNÇÁO AUXILIAR PARA TESTES (OPCIONAL)
# ============================================================================
if __name__ == "__main__":
    print(" Testando o Módulo Financeiro...\n")
    calcular_lucros()
