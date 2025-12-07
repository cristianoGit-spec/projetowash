# ============================================================================
# MÓDULO MODELS - MODELOS ADICIONAIS DO SISTEMA
# ============================================================================
# Este módulo contém os modelos de Empresa, Usuário e Permissões
# Implementa autenticação, autorização e multi-tenancy
# ============================================================================

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# ============================================================================
# TABELA ASSOCIATIVA: USUÁRIO <-> PERMISSÕES (MUITOS PARA MUITOS)
# ============================================================================
usuario_permissoes = Table(
    'usuario_permissoes',
    Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuarios.id'), primary_key=True),
    Column('permissao_id', Integer, ForeignKey('permissoes.id'), primary_key=True)
)

# ============================================================================
# MODELO 1: EMPRESA (MULTI-TENANCY)
# ============================================================================

class Empresa(Base):
    """
    Modelo de dados para Empresas.
    
    Implementa multi-tenancy: cada empresa tem seus próprios dados isolados.
    Os usuários pertencem a uma empresa e só acessam dados dela.
    
    CAMPOS:
    - id: Identificador único
    - nome: Nome/Razão Social da empresa
    - cnpj: CNPJ (único)
    - segmento: Tipo de negócio (Indústria, Comércio, Serviços, etc.)
    - ativa: Se a empresa está ativa no sistema
    - data_cadastro: Data de criação do registro
    - data_atualizacao: Data da última atualização
    """
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False, index=True)
    cnpj = Column(String(18), unique=True, index=True)
    segmento = Column(String(100))  # Indústria, Comércio, Serviços, etc.
    ativa = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    usuarios = relationship("Usuario", back_populates="empresa")
    
    def __repr__(self):
        return f"<Empresa(id={self.id}, nome='{self.nome}', cnpj='{self.cnpj}')>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "cnpj": self.cnpj,
            "segmento": self.segmento,
            "ativa": self.ativa,
            "data_cadastro": self.data_cadastro.isoformat() if self.data_cadastro else None,
            "data_atualizacao": self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

# ============================================================================
# MODELO 2: USUÁRIO (AUTENTICAÇÃO E AUTORIZAÇÃO)
# ============================================================================

class Usuario(Base):
    """
    Modelo de dados para Usuários do Sistema.
    
    Gerencia autenticação (quem é o usuário) e autorização (o que pode fazer).
    Cada usuário pertence a uma empresa e possui permissões específicas.
    
    CAMPOS:
    - id: Identificador único
    - empresa_id: FK para Empresa (multi-tenancy)
    - nome: Nome completo do usuário
    - email: Email (único, usado para login)
    - senha_hash: Senha criptografada (bcrypt)
    - ativo: Se o usuário pode fazer login
    - is_admin: Se é administrador da empresa
    - ultimo_login: Data/hora do último acesso
    - data_cadastro: Data de criação
    - data_atualizacao: Data da última atualização
    """
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), nullable=False)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    senha_hash = Column(String(200), nullable=False)
    ativo = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)  # Admin da empresa
    ultimo_login = Column(DateTime)
    data_cadastro = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="usuarios")
    permissoes = relationship("Permissao", secondary=usuario_permissoes, back_populates="usuarios")
    
    def __repr__(self):
        return f"<Usuario(id={self.id}, email='{self.email}', empresa_id={self.empresa_id})>"
    
    def to_dict(self, include_permissions=False):
        data = {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "nome": self.nome,
            "email": self.email,
            "ativo": self.ativo,
            "is_admin": self.is_admin,
            "ultimo_login": self.ultimo_login.isoformat() if self.ultimo_login else None,
            "data_cadastro": self.data_cadastro.isoformat() if self.data_cadastro else None
        }
        
        if include_permissions:
            data["permissoes"] = [p.to_dict() for p in self.permissoes]
            
        return data
    
    def tem_permissao(self, codigo_modulo):
        """
        Verifica se o usuário tem permissão para acessar um módulo.
        
        Args:
            codigo_modulo: Código do módulo (operacional, estoque, financeiro, rh)
            
        Returns:
            bool: True se tem permissão, False caso contrário
        """
        if self.is_admin:
            return True  # Admin tem acesso a tudo
            
        return any(p.codigo == codigo_modulo and p.ativa for p in self.permissoes)

# ============================================================================
# MODELO 3: PERMISSÃO (CONTROLE DE ACESSO)
# ============================================================================

class Permissao(Base):
    """
    Modelo de dados para Permissões de Acesso.
    
    Define quais módulos do sistema cada usuário pode acessar.
    Implementa controle de acesso baseado em roles/permissões.
    
    MÓDULOS DISPONÍVEIS:
    - operacional: Módulo de capacidade produtiva
    - estoque_entrada: Cadastro de produtos
    - estoque_saida: Registro de vendas
    - financeiro: Análise de custos e lucros
    - rh: Folha de pagamento
    
    CAMPOS:
    - id: Identificador único
    - codigo: Código único do módulo
    - nome: Nome descritivo da permissão
    - descricao: Descrição detalhada
    - ativa: Se a permissão está ativa
    """
    __tablename__ = "permissoes"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(500))
    ativa = Column(Boolean, default=True)
    
    # Relacionamentos
    usuarios = relationship("Usuario", secondary=usuario_permissoes, back_populates="permissoes")
    
    def __repr__(self):
        return f"<Permissao(id={self.id}, codigo='{self.codigo}', nome='{self.nome}')>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "nome": self.nome,
            "descricao": self.descricao,
            "ativa": self.ativa
        }

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def criar_permissoes_padrao(db):
    """
    Cria as permissões padrão do sistema se não existirem.
    
    Args:
        db: Sessão do banco de dados
    """
    permissoes_padrao = [
        {
            "codigo": "operacional",
            "nome": "Módulo Operacional",
            "descricao": "Acesso ao cálculo de capacidade produtiva"
        },
        {
            "codigo": "estoque_entrada",
            "nome": "Estoque - Entrada",
            "descricao": "Cadastro de entrada de produtos no estoque"
        },
        {
            "codigo": "estoque_saida",
            "nome": "Estoque - Saída",
            "descricao": "Registro de saída e vendas de produtos"
        },
        {
            "codigo": "financeiro",
            "nome": "Módulo Financeiro",
            "descricao": "Acesso a análise de custos e lucros"
        },
        {
            "codigo": "rh",
            "nome": "Módulo RH",
            "descricao": "Acesso à folha de pagamento e gestão de funcionários"
        }
    ]
    
    for perm_data in permissoes_padrao:
        # Verifica se já existe
        existe = db.query(Permissao).filter(Permissao.codigo == perm_data["codigo"]).first()
        if not existe:
            permissao = Permissao(**perm_data)
            db.add(permissao)
    
    db.commit()
    print("Permissões padrão criadas/verificadas com sucesso!")

# ============================================================================
# FIM DO MÓDULO MODELS
# ============================================================================
