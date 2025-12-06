# Tests Directory

Este diretório contém todos os testes automatizados do projeto.

## Estrutura

```
tests/
├── conftest.py              # Configurações e fixtures compartilhadas
├── test_auth_utils.py       # Testes de autenticação e segurança
├── test_smoke.py            # Smoke tests (testes de fumaça)
└── README.md               # Este arquivo
```

## Como Executar

### Todos os testes
```bash
pytest
```

### Apenas smoke tests
```bash
pytest -m smoke
```

### Com cobertura
```bash
pytest --cov=src --cov-report=html
```

### Testes específicos
```bash
pytest tests/test_auth_utils.py
pytest tests/test_smoke.py::TestDatabaseSmoke
```

## Marcadores

- `@pytest.mark.smoke`: Testes rápidos de funcionalidades básicas
- `@pytest.mark.unit`: Testes unitários isolados
- `@pytest.mark.integration`: Testes de integração entre módulos
- `@pytest.mark.slow`: Testes que demoram mais de 1 segundo

## Fixtures Disponíveis

- `sample_produto_data`: Dados de exemplo para Produto
- `sample_funcionario_data`: Dados de exemplo para Funcionario
- `sample_metricas_operacionais`: Métricas operacionais de exemplo
- `sample_metricas_financeiras`: Métricas financeiras de exemplo
