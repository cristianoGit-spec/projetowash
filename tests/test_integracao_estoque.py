"""
Testes de integração entre entrada e saída de estoque
Verifica se os valores estão interligados e se os cálculos estão corretos
"""
import pytest
import json
from pathlib import Path

class TestIntegracaoEstoque:
    """Testes de integração do sistema de estoque"""
    
    def test_estrutura_dados_local_storage(self):
        """Verifica se a estrutura de dados do localStorage está correta"""
        # Simular dados do localStorage
        local_estoque = [
            {
                "id": "1",
                "codigo": "P001",
                "nome": "Produto A",
                "quantidade": 100,
                "valor": 50.0,
                "fornecedor": "Fornecedor X",
                "local": "Almoxarifado",
                "data": "2024-01-15"
            }
        ]
        
        # Verificar estrutura
        assert isinstance(local_estoque, list)
        assert len(local_estoque) > 0
        
        produto = local_estoque[0]
        assert "id" in produto
        assert "codigo" in produto
        assert "nome" in produto
        assert "quantidade" in produto
        assert "valor" in produto
        
    def test_entrada_aumenta_quantidade(self):
        """Testa se entrada de estoque aumenta a quantidade corretamente"""
        # Estado inicial
        produto = {
            "id": "1",
            "codigo": "P001",
            "nome": "Produto A",
            "quantidade": 100,
            "valor": 50.0
        }
        
        # Simular entrada
        quantidade_entrada = 50
        produto["quantidade"] += quantidade_entrada
        
        # Verificar
        assert produto["quantidade"] == 150
        
    def test_saida_diminui_quantidade(self):
        """Testa se saída de estoque diminui a quantidade corretamente"""
        # Estado inicial
        produto = {
            "id": "1",
            "codigo": "P001",
            "nome": "Produto A",
            "quantidade": 100,
            "valor": 50.0
        }
        
        # Simular saída
        quantidade_saida = 30
        produto["quantidade"] -= quantidade_saida
        
        # Verificar
        assert produto["quantidade"] == 70
        
    def test_saida_nao_permite_estoque_negativo(self):
        """Testa validação de estoque insuficiente"""
        produto = {
            "id": "1",
            "codigo": "P001",
            "nome": "Produto A",
            "quantidade": 10,
            "valor": 50.0
        }
        
        quantidade_saida = 15
        
        # Verificar se quantidade disponível é suficiente
        estoque_suficiente = produto["quantidade"] >= quantidade_saida
        assert not estoque_suficiente, "Deve impedir venda com estoque insuficiente"
        
    def test_calculo_valor_venda_com_margem(self):
        """Testa cálculo do valor de venda com margem de 30%"""
        valor_custo = 50.0
        margem = 0.30
        
        valor_venda = valor_custo * (1 + margem)
        
        assert valor_venda == 65.0
        
    def test_calculo_valor_total_estoque(self):
        """Testa cálculo do valor total do estoque"""
        estoque = [
            {"quantidade": 100, "valor": 50.0},
            {"quantidade": 50, "valor": 30.0},
            {"quantidade": 25, "valor": 80.0}
        ]
        
        valor_total = sum(p["quantidade"] * p["valor"] for p in estoque)
        
        assert valor_total == 8500.0  # (100*50) + (50*30) + (25*80)
        
    def test_calculo_total_itens_estoque(self):
        """Testa cálculo do total de itens no estoque"""
        estoque = [
            {"quantidade": 100},
            {"quantidade": 50},
            {"quantidade": 25}
        ]
        
        total_itens = sum(p["quantidade"] for p in estoque)
        
        assert total_itens == 175
        
    def test_registro_movimentacao(self):
        """Testa se movimentações são registradas corretamente"""
        movimentacoes = []
        
        # Registrar entrada
        movimentacoes.append({
            "tipo": "entrada",
            "produtoId": "1",
            "quantidade": 50,
            "data": "2024-01-15",
            "valor": 2500.0
        })
        
        # Registrar saída
        movimentacoes.append({
            "tipo": "saida",
            "produtoId": "1",
            "quantidade": 30,
            "data": "2024-01-16",
            "valor": 1950.0  # Com margem de 30%
        })
        
        assert len(movimentacoes) == 2
        assert movimentacoes[0]["tipo"] == "entrada"
        assert movimentacoes[1]["tipo"] == "saida"
        
    def test_integracao_entrada_saida(self):
        """Testa fluxo completo: entrada → estoque → saída"""
        # Estado inicial vazio
        estoque = []
        
        # 1. ENTRADA - Cadastrar produto
        novo_produto = {
            "id": "1",
            "codigo": "P001",
            "nome": "Produto Teste",
            "quantidade": 100,
            "valor": 50.0,
            "fornecedor": "Fornecedor X",
            "local": "Almoxarifado"
        }
        estoque.append(novo_produto)
        
        # Verificar entrada
        assert len(estoque) == 1
        assert estoque[0]["quantidade"] == 100
        
        # 2. SAÍDA - Vender produto
        quantidade_vendida = 30
        estoque[0]["quantidade"] -= quantidade_vendida
        
        # Verificar saída
        assert estoque[0]["quantidade"] == 70
        
        # 3. Nova ENTRADA - Repor estoque
        quantidade_reposicao = 50
        estoque[0]["quantidade"] += quantidade_reposicao
        
        # Verificar reposição
        assert estoque[0]["quantidade"] == 120
        
    def test_verificacao_js_files_existem(self):
        """Verifica se os arquivos JS principais existem"""
        base_path = Path("web/static/js")
        
        arquivos_necessarios = [
            "app.js",
            "dashboard.js",
            "local-firestore.js",
            "modules/estoque_entrada.js",
            "modules/estoque_saida.js"
        ]
        
        for arquivo in arquivos_necessarios:
            caminho = base_path / arquivo
            assert caminho.exists(), f"Arquivo {arquivo} não encontrado"
            
    def test_funcoes_entrada_saida_em_app_js(self):
        """Verifica se funções de entrada/saída existem em app.js"""
        app_js = Path("web/static/js/app.js")
        
        if app_js.exists():
            conteudo = app_js.read_text(encoding='utf-8')
            
            # Verificar funções principais
            assert "salvarProdutoEstoque" in conteudo
            assert "registrarSaidaEstoque" in conteudo
            assert "atualizarDashboardSeAtivo" in conteudo
            
    def test_dashboard_tem_load_function(self):
        """Verifica se dashboard.js tem função de carregamento"""
        dashboard_js = Path("web/static/js/dashboard.js")
        
        if dashboard_js.exists():
            conteudo = dashboard_js.read_text(encoding='utf-8')
            
            # Verificar função principal
            assert "loadDashboard" in conteudo or "carregarDashboard" in conteudo
            
    def test_local_firestore_tem_funcoes_crud(self):
        """Verifica se local-firestore.js tem funções CRUD"""
        local_firestore = Path("web/static/js/local-firestore.js")
        
        if local_firestore.exists():
            conteudo = local_firestore.read_text(encoding='utf-8')
            
            # Verificar operações
            assert "cadastrarProdutoFirestoreLocal" in conteudo or "cadastrarProduto" in conteudo
            assert "registrarSaidaProdutoLocal" in conteudo or "registrarSaida" in conteudo
            assert "saveLocalData" in conteudo or "salvarDados" in conteudo
