# ============================================================================
# CONFTEST - CONFIGURAÇÕES E FIXTURES DO PYTEST
# ============================================================================
# Fixtures compartilhadas entre todos os testes

import pytest
import sys
import os

# Adiciona diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))


@pytest.fixture
def sample_produto_data():
    """Fixture que fornece dados de exemplo para Produto"""
    return {
        "company_id": "test-company-001",
        "codigo": 1001,
        "nome": "Produto de Teste",
        "tipo_material": "Matéria-Prima",
        "categoria": "Categoria A",
        "unidade_medida": "UN",
        "quantidade": 50,
        "data_fabricacao": "2025-01-15",
        "fornecedor": "Fornecedor XYZ",
        "local_armazem": "Estante A1",
        "valor_unitario": 25.50
    }


@pytest.fixture
def sample_funcionario_data():
    """Fixture que fornece dados de exemplo para Funcionario"""
    return {
        "company_id": "test-company-001",
        "nome": "João da Silva",
        "cargo": "Operário",
        "admissao": "2025-01-10"
    }


@pytest.fixture
def sample_metricas_operacionais():
    """Fixture que fornece métricas operacionais de exemplo"""
    return {
        "turnos": 2,
        "capacidade_por_turno": 1666,
        "dias_mes": 22,
        "horas_por_turno": 8
    }


@pytest.fixture
def sample_metricas_financeiras():
    """Fixture que fornece métricas financeiras de exemplo"""
    return {
        "receita_bruta": 50000.00,
        "custos": 20000.00,
        "despesas": 10000.00
    }
