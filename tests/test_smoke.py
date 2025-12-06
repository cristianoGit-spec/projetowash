# ============================================================================
# SMOKE TESTS - TESTES DE FUMAÇA
# ============================================================================
# Testes rápidos para verificar funcionalidades básicas do sistema

import pytest
from src.database import init_db, Produto, Funcionario, SessionLocal
from src.operacional import calcular_metricas_capacidade
from src.financeiro import calcular_metricas_financeiras
from src.rh import processar_funcionario


@pytest.mark.smoke
class TestDatabaseSmoke:
    """Testes de fumaça para o banco de dados"""
    
    def test_init_db_no_error(self):
        """Testa se init_db executa sem erros"""
        try:
            init_db()
            assert True
        except Exception as e:
            pytest.fail(f"init_db() falhou: {e}")
    
    def test_produto_model_creation(self):
        """Testa criação de objeto Produto"""
        produto = Produto(
            company_id="test-company",
            codigo=1001,
            nome="Produto Teste",
            tipo_material="Matéria-Prima",
            categoria="Categoria Teste",
            unidade_medida="UN",
            quantidade=100,
            data_fabricacao="2025-01-01",
            fornecedor="Fornecedor Teste",
            local_armazem="A1",
            valor_unitario=10.50
        )
        
        assert produto.nome == "Produto Teste"
        assert produto.quantidade == 100
        assert produto.valor_unitario == 10.50
    
    def test_funcionario_model_creation(self):
        """Testa criação de objeto Funcionario"""
        funcionario = Funcionario(
            company_id="test-company",
            nome="João Silva",
            cargo="Operário",
            admissao="2025-01-01"
        )
        
        assert funcionario.nome == "João Silva"
        assert funcionario.cargo == "Operário"


@pytest.mark.smoke
class TestOperacionalSmoke:
    """Testes de fumaça para módulo operacional"""
    
    def test_calcular_metricas_capacidade_returns_dict(self):
        """Testa se calcular_metricas_capacidade retorna dicionário"""
        result = calcular_metricas_capacidade(turnos=2)
        
        assert isinstance(result, dict)
        assert "capacidade_diaria" in result
        assert "capacidade_mensal" in result
    
    def test_calcular_metricas_capacidade_values(self):
        """Testa valores básicos do cálculo de capacidade"""
        result = calcular_metricas_capacidade(turnos=1)
        
        assert result["capacidade_diaria"] == 1666
        assert result["capacidade_mensal"] == 1666 * 30  # Corrigido: usa 30 dias
        assert result["turnos"] == 1


@pytest.mark.smoke
class TestFinanceiroSmoke:
    """Testes de fumaça para módulo financeiro"""
    
    def test_calcular_metricas_financeiras_returns_dict(self):
        """Testa se calcular_metricas_financeiras retorna dicionário"""
        result = calcular_metricas_financeiras(
            agua=500,
            luz=800,
            impostos=1500,
            salarios=5000,
            total_pallets=1000
        )
        
        assert isinstance(result, dict)
        assert "custo_total" in result
        assert "lucro_mensal" in result
    
    def test_calcular_metricas_financeiras_logic(self):
        """Testa lógica básica de cálculo financeiro"""
        result = calcular_metricas_financeiras(
            agua=500,
            luz=800,
            impostos=1500,
            salarios=5000,
            total_pallets=1000
        )
        
        assert result["custo_total"] == 500 + 800 + 1500 + 5000
        assert result["custo_por_pallet"] == 7800 / 1000


@pytest.mark.smoke
class TestRHSmoke:
    """Testes de fumaça para módulo RH"""
    
    def test_processar_funcionario_returns_dict(self):
        """Testa se processar_funcionario retorna dicionário"""
        result = processar_funcionario(
            nome="Maria Santos",
            cargo="Supervisor",
            horas_extras=10  # Corrigido: parâmetro correto é horas_extras
        )
        
        assert isinstance(result, dict)
        assert "nome" in result
        assert "cargo" in result
