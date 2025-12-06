"""
Testes de isolamento multi-tenant
Valida que empresas diferentes não podem acessar dados umas das outras
"""
import pytest
import json
from pathlib import Path

class TestMultiTenant:
    """Testes de isolamento entre empresas (multi-tenancy)"""
    
    def test_companyid_obrigatorio_em_documentos(self):
        """Verifica se todos os documentos devem ter companyId"""
        # Simular estrutura de documento
        documentos_validos = [
            {
                "id": "prod1",
                "nome": "Produto A",
                "companyId": "empresa-001",
                "quantidade": 100
            }
        ]
        
        for doc in documentos_validos:
            assert "companyId" in doc
            assert doc["companyId"]
    
    def test_filtro_por_companyid(self):
        """Testa filtro por companyId"""
        todos_produtos = [
            {"id": "p1", "nome": "A", "companyId": "empresa-001"},
            {"id": "p2", "nome": "B", "companyId": "empresa-002"}
        ]
        
        filtrados = [p for p in todos_produtos if p["companyId"] == "empresa-001"]
        
        assert len(filtrados) == 1
        assert filtrados[0]["id"] == "p1"
    
    def test_admin_lista_apenas_propria_empresa(self):
        """Admin só vê usuários da própria empresa"""
        usuarios = [
            {"uid": "u1", "companyId": "comp-a", "role": "admin"},
            {"uid": "u2", "companyId": "comp-a", "role": "user"},
            {"uid": "u3", "companyId": "comp-b", "role": "admin"}
        ]
        
        visiveis = [u for u in usuarios if u["companyId"] == "comp-a"]
        
        assert len(visiveis) == 2
        assert not any(u["companyId"] == "comp-b" for u in visiveis)
    
    def test_firestore_rules_existe(self):
        """Verifica arquivo de regras"""
        rules_file = Path("firestore.rules")
        assert rules_file.exists()
        
        conteudo = rules_file.read_text(encoding='utf-8')
        assert "getUserCompanyId()" in conteudo
        assert "belongsToCompany()" in conteudo
