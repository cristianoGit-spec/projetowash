# ============================================================================
# M\u00d3DULO DATABASE - CONFIGURA\u00c7\u00c3O DO BANCO DE DADOS E MODELOS ORM
# ============================================================================
# Este m\u00f3dulo define a estrutura do banco de dados usando SQLAlchemy ORM
# (Object-Relational Mapping - Mapeamento Objeto-Relacional)
#
# CONCEITOS DEMONSTRADOS:
# - ORM (Object-Relational Mapping): converte tabelas em classes Python
# - SQLAlchemy: biblioteca Python para trabalhar com bancos de dados
# - Modelos de dados: Classes que representam tabelas no banco
# - Migrations: Cria\u00e7\u00e3o autom\u00e1tica de tabelas
# - Vari\u00e1veis de ambiente: Configura\u00e7\u00f5es externas com .env
#
# TABELAS DO SISTEMA:
# 1. produtos: Armazena itens do estoque
# 2. funcionarios: Armazena dados dos colaboradores
# ============================================================================

# ============================================================================
# IMPORTA\u00c7\u00d5ES DE BIBLIOTECAS
# ============================================================================
import os  # Para ler vari\u00e1veis de ambiente do sistema operacional
from sqlalchemy import create_engine, Column, Integer, String, Float  # Core do SQLAlchemy
from sqlalchemy.ext.declarative import declarative_base  # Base para criar modelos
from sqlalchemy.orm import sessionmaker  # Gerenciador de sess\u00f5es do banco
from dotenv import load_dotenv  # Para carregar configura\u00e7\u00f5es do arquivo .env

# ============================================================================
# CARREGAMENTO DE VARI\u00c1VEIS DE AMBIENTE
# ============================================================================
# load_dotenv() l\u00ea o arquivo .env e carrega as vari\u00e1veis para o ambiente
# Isso permite configurar o banco de dados sem alterar o c\u00f3digo
load_dotenv()

# ============================================================================
# CONFIGURA\u00c7\u00c3O DA CONEX\u00c3O COM O BANCO DE DADOS
# ============================================================================
# L\u00ea a URL de conex\u00e3o do banco do arquivo .env
# Se n\u00e3o existir, usa SQLite local (arquivo dados.db) como padr\u00e3o
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///dados.db')

# ============================================================================
# COMPATIBILIDADE COM POSTGRESQL
# ============================================================================
# Ajuste necess\u00e1rio para compatibilidade com URLs antigas do Heroku
# O Heroku usa "postgres://" mas o SQLAlchemy moderno requer "postgresql://"
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# ============================================================================
# CRIA\u00c7\u00c3O DO ENGINE (MOTOR DO BANCO)
# ============================================================================
# O engine \u00e9 respons\u00e1vel por gerenciar a conex\u00e3o com o banco de dados
# Ele traduz comandos Python em SQL espec\u00edfico do banco (SQLite, PostgreSQL, etc.)
engine = create_engine(DATABASE_URL)

# ============================================================================
# CONFIGURA\u00c7\u00c3O DO SESSIONMAKER (F\u00c1BRICA DE SESS\u00d5ES)
# ============================================================================
# SessionLocal \u00e9 uma classe que cria sess\u00f5es de banco de dados
# Uma sess\u00e3o \u00e9 como uma "conversa" com o banco onde fazemos consultas e altera\u00e7\u00f5es
# Par\u00e2metros:
# - autocommit=False: Precisamos chamar commit() manualmente para salvar altera\u00e7\u00f5es
# - autoflush=False: Controle manual de quando sincronizar com o banco
# - bind=engine: Vincula ao engine criado acima
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ============================================================================
# CRIA\u00c7\u00c3O DA CLASSE BASE PARA MODELOS
# ============================================================================
# Base \u00e9 a classe pai de todos os modelos (tabelas) do sistema
# Todos os modelos herdam desta classe para terem funcionalidades ORM
Base = declarative_base()

# ============================================================================
# MODELO 1: PRODUTO (TABELA DE ESTOQUE)
# ============================================================================

class Produto(Base):
    """
    Modelo de dados para Produtos no Estoque.
    
    Esta classe representa a tabela 'produtos' no banco de dados.
    Cada inst\u00e2ncia desta classe corresponde a uma linha na tabela.
    
    CAMPOS (COLUNAS):
    - id: Identificador \u00fanico autom\u00e1tico (chave prim\u00e1ria)
    - codigo: C\u00f3digo do produto (\u00fanico, indexado para busca r\u00e1pida)
    - nome: Nome/descri\u00e7\u00e3o do produto
    - quantidade: Quantidade em estoque (padr\u00e3o: 0)
    - data_fabricacao: Data de fabrica\u00e7\u00e3o
    - fornecedor: Nome do fornecedor
    - local_armazem: Localiza\u00e7\u00e3o f\u00edsica no armaz\u00e9m
    - valor_unitario: Pre\u00e7o por unidade (padr\u00e3o: 0.0)
    """
    __tablename__ = "produtos"  # Nome da tabela no banco de dados

    # ========================================================================
    # DEFINI\u00c7\u00c3O DAS COLUNAS (CAMPOS DA TABELA)
    # ========================================================================
    # primary_key=True: Define como chave prim\u00e1ria (identificador \u00fanico)
    # index=True: Cria \u00edndice para acelerar buscas
    # unique=True: Garante que n\u00e3o haver\u00e1 valores duplicados
    # default=X: Valor padrão caso não seja fornecido
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, index=True)  # ID da empresa proprietária dos dados
    codigo = Column(Integer, index=True)  # Removido unique para permitir mesmo código em empresas diferentes
    nome = Column(String, index=True)
    tipo_material = Column(String)  # Tipo: Matéria-Prima, Semi-Acabado, Acabado, MRO, etc.
    categoria = Column(String)  # Categoria baseada no segmento da empresa
    unidade_medida = Column(String, default="UN")  # UN, KG, M, L, PC, SC, etc.
    quantidade = Column(Integer, default=0)
    data_fabricacao = Column(String)
    fornecedor = Column(String)
    local_armazem = Column(String)
    valor_unitario = Column(Float, default=0.0)

    def to_dict(self):
        """
        Converte o objeto Produto para dicion\u00e1rio Python.
        
        \u00datil para:
        - Serializa\u00e7\u00e3o JSON (APIs REST)
        - Compatibilidade com c\u00f3digo legado
        - Exibi\u00e7\u00e3o de dados em formatos diversos
        
        Returns:
            dict: Dicionário com os dados do produto (inclui company_id para multi-tenancy)
        """
        return {
            "id": self.id,
            "company_id": self.company_id,  # Multi-tenancy: Isolamento por empresa
            "codigo": self.codigo,
            "nome": self.nome,
            "tipo_material": self.tipo_material,
            "categoria": self.categoria,
            "unidade_medida": self.unidade_medida,
            "quantidade": self.quantidade,
            "data": self.data_fabricacao,
            "fornecedor": self.fornecedor,
            "local": self.local_armazem,
            "valor": self.valor_unitario
        }

# ============================================================================
# MODELO 2: FUNCION\u00c1RIO (TABELA DE RH)
# ============================================================================

class Funcionario(Base):
    """
    Modelo de dados para Funcion\u00e1rios.
    
    Esta classe representa a tabela 'funcionarios' no banco de dados.
    Armazena informa\u00e7\u00f5es b\u00e1sicas dos colaboradores da empresa.
    
    CAMPOS (COLUNAS):
    - id: Identificador \u00fanico autom\u00e1tico (chave prim\u00e1ria)
    - nome: Nome completo do funcion\u00e1rio
    - cargo: Cargo/fun\u00e7\u00e3o (Oper\u00e1rio, Supervisor, Gerente, Diretor)
    - admissao: Data de admiss\u00e3o no formato string
    """
    __tablename__ = "funcionarios"  # Nome da tabela no banco de dados

    # ========================================================================
    # DEFINI\u00c7\u00c3O DAS COLUNAS
    # ========================================================================
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, index=True)  # ID da empresa proprietária dos dados
    nome = Column(String, index=True)  # Indexado para busca rápida por nome
    cargo = Column(String)
    admissao = Column(String)
    
    def to_dict(self):
        """
        Converte o objeto Funcionario para dicionário Python.
        
        Returns:
            dict: Dicionário com os dados do funcionário (inclui company_id para multi-tenancy)
        """
        return {
            "id": self.id,
            "company_id": self.company_id,  # Multi-tenancy: Isolamento por empresa
            "nome": self.nome,
            "cargo": self.cargo,
            "admissao": self.admissao
        }

# ============================================================================
# FUN\u00c7\u00d5ES AUXILIARES PARA GERENCIAMENTO DO BANCO
# ============================================================================

def init_db():
    """
    Inicializa o banco de dados criando todas as tabelas definidas.
    
    Esta fun\u00e7\u00e3o executa o comando CREATE TABLE para cada modelo definido.
    Se as tabelas j\u00e1 existirem, elas N\u00c3O ser\u00e3o recriadas (sem perda de dados).
    
    QUANDO USAR:
    - Na primeira execu\u00e7\u00e3o do sistema
    - Ap\u00f3s adicionar novos modelos
    - Ao configurar ambiente de desenvolvimento
    """
    # create_all() cria todas as tabelas dos modelos que herdam de Base
    Base.metadata.create_all(bind=engine)

def get_db():
    """
    Fun\u00e7\u00e3o geradora que fornece uma sess\u00e3o do banco de dados.
    
    Esta fun\u00e7\u00e3o \u00e9 usada principalmente em APIs REST como depend\u00eancia.
    Ela garante que a conex\u00e3o com o banco seja fechada corretamente,
    mesmo se ocorrer um erro durante a execu\u00e7\u00e3o.
    
    PADR\u00c3O DE USO:
    ```python
    def minha_funcao():
        db = next(get_db())
        try:
            # Usar db aqui
            pass
        finally:
            db.close()
    ```
    
    Yields:
        Session: Sess\u00e3o ativa do banco de dados
    """
    db = SessionLocal()  # Cria uma nova sess\u00e3o
    try:
        yield db  # Fornece a sess\u00e3o para uso
    finally:
        db.close()  # Garante fechamento da conex\u00e3o

# ============================================================================
# FIM DO M\u00d3DULO DATABASE
# ============================================================================
# Este m\u00f3dulo \u00e9 a base de toda a persist\u00eancia de dados do sistema.
# Qualquer outro m\u00f3dulo que precise acessar o banco deve importar:
# - SessionLocal: para criar sess\u00f5es
# - Produto/Funcionario: para manipular dados
# - init_db(): para inicializar o banco
# ============================================================================
