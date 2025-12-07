# ============================================================================
# MÓDULO AUTH_UTILS - UTILITÁRIOS DE AUTENTICAÇÁO SEGURA
# ============================================================================
# Este módulo fornece funções para hash e verificação de senhas usando bcrypt
# 
# SEGURANÇA:
# - Bcrypt é um algoritmo de hashing projetado para senhas
# - Utiliza salt automático para prevenir ataques rainbow table
# - Computacionalmente caro (dificulta ataques de força bruta)
# ============================================================================

import bcrypt

def hash_password(password: str) -> str:
    """
    Gera um hash seguro da senha usando bcrypt.
    
    Args:
        password: Senha em texto claro
        
    Returns:
        Hash da senha como string (pode ser armazenado no banco)
        
    Example:
        >>> hashed = hash_password("minha_senha_123")
        >>> print(hashed)
        '$2b$12$...'
    """
    # Converte a senha para bytes
    password_bytes = password.encode('utf-8')
    
    # Gera o salt e cria o hash
    # rounds=12 é um bom balanço entre segurança e performance
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Retorna como string para armazenamento
    return hashed.decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """
    Verifica se uma senha corresponde ao hash armazenado.
    
    Args:
        password: Senha em texto claro fornecida pelo usuário
        hashed: Hash armazenado no banco de dados
        
    Returns:
        True se a senha é válida, False caso contrário
        
    Example:
        >>> hashed = hash_password("minha_senha_123")
        >>> verify_password("minha_senha_123", hashed)
        True
        >>> verify_password("senha_errada", hashed)
        False
    """
    # Converte ambos para bytes
    password_bytes = password.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    
    # Verifica se a senha corresponde ao hash
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def generate_api_key() -> str:
    """
    Gera uma chave de API segura e aleatória.
    
    Returns:
        String base64 URL-safe com 32 bytes (256 bits) de entropia
        
    Example:
        >>> api_key = generate_api_key()
        >>> len(api_key)
        43  # 32 bytes codificados em base64
    """
    import secrets
    return secrets.token_urlsafe(32)


# ============================================================================
# EXEMPLO DE USO
# ============================================================================
if __name__ == "__main__":
    # Teste de hash de senha
    senha_original = "admin@2025"
    
    print("=== TESTE DE HASH DE SENHA ===")
    print(f"Senha original: {senha_original}")
    
    # Gerar hash
    senha_hash = hash_password(senha_original)
    print(f"Hash gerado: {senha_hash}")
    
    # Verificar senha correta
    resultado = verify_password(senha_original, senha_hash)
    print(f"Verificação (senha correta): {resultado}")  # True
    
    # Verificar senha incorreta
    resultado = verify_password("senha_errada", senha_hash)
    print(f"Verificação (senha incorreta): {resultado}")  # False
    
    # Gerar API Key
    print("\n=== GERAÇÁO DE API KEY ===")
    api_key = generate_api_key()
    print(f"API Key gerada: {api_key}")
