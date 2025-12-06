# ============================================================================
# TESTES UNITÁRIOS - AUTENTICAÇÃO
# ============================================================================
# Testes para o módulo auth_utils.py (hash de senhas com bcrypt)

import pytest
from src.auth_utils import hash_password, verify_password, generate_api_key


class TestPasswordHashing:
    """Testes para hash e verificação de senhas"""
    
    def test_hash_password_returns_string(self):
        """Testa se hash_password retorna uma string"""
        senha = "test_password_123"
        hashed = hash_password(senha)
        
        assert isinstance(hashed, str)
        assert len(hashed) > 0
    
    def test_hash_password_different_each_time(self):
        """Testa se o mesmo password gera hashes diferentes (salt aleatório)"""
        senha = "same_password"
        hash1 = hash_password(senha)
        hash2 = hash_password(senha)
        
        assert hash1 != hash2  # Hashes devem ser diferentes devido ao salt
    
    def test_verify_password_correct(self):
        """Testa verificação de senha correta"""
        senha = "correct_password_456"
        hashed = hash_password(senha)
        
        result = verify_password(senha, hashed)
        assert result is True
    
    def test_verify_password_incorrect(self):
        """Testa verificação de senha incorreta"""
        senha_correta = "correct_password"
        senha_errada = "wrong_password"
        hashed = hash_password(senha_correta)
        
        result = verify_password(senha_errada, hashed)
        assert result is False
    
    def test_hash_password_with_special_chars(self):
        """Testa hash de senha com caracteres especiais"""
        senha = "P@ssw0rd!#$%&*()_+-=[]{}|;:',.<>?"
        hashed = hash_password(senha)
        
        result = verify_password(senha, hashed)
        assert result is True
    
    def test_hash_password_unicode(self):
        """Testa hash de senha com caracteres Unicode"""
        senha = "Sénhã_côm_açêntõs_123"
        hashed = hash_password(senha)
        
        result = verify_password(senha, hashed)
        assert result is True


class TestAPIKeyGeneration:
    """Testes para geração de API Keys"""
    
    def test_generate_api_key_returns_string(self):
        """Testa se generate_api_key retorna uma string"""
        api_key = generate_api_key()
        
        assert isinstance(api_key, str)
        assert len(api_key) > 0
    
    def test_generate_api_key_unique(self):
        """Testa se chaves geradas são únicas"""
        key1 = generate_api_key()
        key2 = generate_api_key()
        
        assert key1 != key2
    
    def test_generate_api_key_length(self):
        """Testa se a chave tem comprimento adequado (32 bytes = 43 chars base64)"""
        api_key = generate_api_key()
        
        # 32 bytes codificados em base64 URL-safe resultam em 43 caracteres
        assert len(api_key) == 43
    
    def test_generate_api_key_url_safe(self):
        """Testa se a chave é URL-safe (sem caracteres problemáticos)"""
        api_key = generate_api_key()
        
        # URL-safe base64 não deve conter +, /, ou =
        assert '+' not in api_key
        assert '/' not in api_key
