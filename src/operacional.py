# operacional.py
# ============================================================================
# MÓDULO 1: OPERACIONAL - CÁLCULO DE CAPACIDADE DE PRODUÇÁO
# ============================================================================
# Este módulo é responsável por calcular a capacidade de produção da fábrica
# com base no número de turnos ativos (Manhã, Tarde e/ou Noite).
# 
# CONCEITOS DEMONSTRADOS:
# - Entrada e validação de dados
# - Operações matemáticas básicas (multiplicação)
# - Estruturas condicionais (if/else)
# - Formatação de saída de dados
# ============================================================================

# ============================================================================
# FUNÇÕES DE CÁLCULO (LÓGICA PURA)
# ============================================================================

def calcular_metricas_capacidade(turnos):
    """Calcula as métricas de capacidade baseada nos turnos"""
    capacidade_por_turno = 1666 # unidades por turno
    capacidade_diaria = capacidade_por_turno * turnos # unidades por dia
    capacidade_mensal = capacidade_diaria * 30 # unidades por mês
    capacidade_anual = capacidade_mensal * 12 # unidades por ano
    
    capacidade_maxima_diaria = capacidade_por_turno * 3 # unidades por dia (3 turnos)
    diferenca = capacidade_maxima_diaria - capacidade_diaria # unidades ociosas por dia
    percentual_uso = (capacidade_diaria / capacidade_maxima_diaria) * 100
    
    return {
        "turnos": turnos,
        "capacidade_por_turno": capacidade_por_turno,
        "capacidade_diaria": capacidade_diaria,
        "capacidade_mensal": capacidade_mensal,
        "capacidade_anual": capacidade_anual,
        "capacidade_maxima_diaria": capacidade_maxima_diaria,
        "diferenca": diferenca,
        "percentual_uso": percentual_uso
    }

def calcular_capacidade():
    """
    Calcula a capacidade de produção da fábrica baseada nos turnos ativos.
    
    Esta função demonstra conceitos de:
    - Entrada e validação de dados numéricos
    - Operações matemáticas básicas (multiplicação)
    - Cálculo de porcentagens
    - Análise de capacidade ociosa
    - Formatação de números com separadores de milhar
    
    MODO: Interativo para console
    """
    
    print("\n" + "="*50)
    print("   MODULO 1: OPERACIONAL - CAPACIDADE DE PRODUCAO")
    print("="*50)
    
    # ========================================================================
    # PASSO 1: DEFINIR A CAPACIDADE FIXA POR TURNO
    # ========================================================================
    # Este valor é fixo e representa quantas unidades cada turno pode produzir
    # Em uma fábrica real, esse valor viria de estudos de tempos e movimentos
    capacidade_por_turno = 1666  # unidades por turno
    
    print(f"\n Capacidade por turno: {capacidade_por_turno} unidades")
    
    # ========================================================================
    # PASSO 2: PERGUNTAR QUANTOS TURNOS ESTARÁO ATIVOS
    # ========================================================================
    # A empresa pode operar em 1, 2 ou 3 turnos dependendo da demanda
    print("\n Turnos disponiveis: Manha, Tarde, Noite")
    
    try:
        # input() captura o texto digitado pelo usuário
        # int() converte o texto para número inteiro
        turnos = int(input("Quantos turnos estarao ativos (1, 2 ou 3)? "))
        
        # ====================================================================
        # VALIDAÇÁO: Verificar se o número está entre 1 e 3
        # ====================================================================
        # Não faz sentido ter 0 turnos ou mais de 3 turnos (máximo possível)
        if turnos < 1 or turnos > 3:
            print("\n Erro: Por favor, escolha entre 1, 2 ou 3 turnos.")
            return  # Comando 'return' encerra a execução da função
            
    except ValueError:
        # ====================================================================
        # TRATAMENTO DE EXCEÇÁO
        # ====================================================================
        # Se o usuário digitar texto (ex: "abc"), int() gera ValueError
        # O bloco except captura esse erro e exibe mensagem amigável
        print("\n Erro: Digite apenas numeros inteiros!")
        return
        
    # ========================================================================
    # PASSO 3: REALIZAR OS CÁLCULOS DE CAPACIDADE (USANDO FUNÇÁO PURA)
    # ========================================================================
    
    dados = calcular_metricas_capacidade(turnos)
    
    capacidade_diaria = dados['capacidade_diaria']
    capacidade_mensal = dados['capacidade_mensal']
    capacidade_anual = dados['capacidade_anual']
    percentual_uso = dados['percentual_uso']
    diferenca = dados['diferenca']
    capacidade_maxima_diaria = dados['capacidade_maxima_diaria']
    
    # ========================================================================
    # PASSO 5: EXIBIR RELATÓRIO COMPLETO
    # ========================================================================
    # Apresenta os resultados formatados de forma clara e organizada
    print("\n" + "="*50)
    print(f"   RESULTADOS PARA {turnos} TURNO(S)")
    print("="*50)
    
    # replace(',', '.') converte separador americano para brasileiro
    print(f"\n Capacidade Diaria:  {capacidade_diaria:,} unidades".replace(',', '.'))
    print(f" Capacidade Mensal:  {capacidade_mensal:,} unidades".replace(',', '.'))
    print(f" Capacidade Anual:   {capacidade_anual:,} unidades".replace(',', '.'))
    
    # .1f = uma casa decimal
    print(f"\n Percentual de Uso:  {percentual_uso:.1f}% da capacidade maxima")
    
    # ========================================================================
    # ANÁLISE DA CAPACIDADE (DECISÁO BASEADA EM LÓGICA)
    # ========================================================================
    # Verifica se há capacidade ociosa (não utilizada)
    if diferenca > 0:
        print(f"\n A fabrica esta operando ABAIXO da capacidade maxima.")
        print(f"   Diferenca: {diferenca:,} unidades/dia nao produzidas".replace(',', '.'))
        print(f"   Isso representa {capacidade_maxima_diaria - capacidade_diaria:,} unidades/dia de capacidade ociosa.".replace(',', '.'))
    else:
        # Se diferença = 0, todos os 3 turnos estão ativos
        print("\n A fabrica esta operando em capacidade TOTAL (100%)!")
        print("   Todos os turnos estao ativos e produzindo no maximo.")
    
    print("="*50)


# ============================================================================
# BLOCO DE TESTE ISOLADO
# ============================================================================
# __name__ == "__main__" é True apenas quando este arquivo é executado diretamente
# Se este módulo for importado em outro arquivo, este bloco NÁO é executado
# Isso permite testar o módulo de forma independente
# ============================================================================
if __name__ == "__main__":
    print(" Testando o Modulo Operacional...\n")
    calcular_capacidade()
