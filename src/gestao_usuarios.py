# ============================================================================
# MÓDULO GESTAO_USUARIOS - CADASTRO E GERENCIAMENTO DE USUÁRIOS
# ============================================================================
# Este módulo gerencia usuários, empresas e permissões do sistema
# Implementa autenticação e controle de acesso
# ============================================================================

from datetime import datetime
from auth_utils import hash_password, verify_password
from models import Empresa, Usuario, Permissao, criar_permissoes_padrao
from sqlalchemy import func

# ============================================================================
# FUNÇÕES DE GERENCIAMENTO DE EMPRESAS
# ============================================================================

def cadastrar_empresa(db):
    """
    Cadastra uma nova empresa no sistema.
    
    Args:
        db: Sessão do banco de dados
    """
    print("\n" + "="*70)
    print("   CADASTRO DE EMPRESA")
    print("="*70)
    
    try:
        # Coleta de dados
        nome = input("\nNome da Empresa (Razão Social): ").strip()
        if len(nome) < 3:
            print("\nErro: Nome da empresa deve ter pelo menos 3 caracteres!")
            return
        
        cnpj = input("CNPJ (apenas números): ").strip()
        if len(cnpj) != 14 or not cnpj.isdigit():
            print("\nErro: CNPJ deve conter exatamente 14 dígitos!")
            return
        
        # Verifica se CNPJ já existe
        existe = db.query(Empresa).filter(Empresa.cnpj == cnpj).first()
        if existe:
            print(f"\nErro: Já existe uma empresa cadastrada com este CNPJ!")
            return
        
        # Segmento
        print("\nSegmentos disponíveis:")
        print("1 - Indústria")
        print("2 - Comércio")
        print("3 - Serviços")
        print("4 - Logística")
        print("5 - Outro")
        
        seg_opcao = input("Escolha o segmento (1-5): ").strip()
        segmentos = {
            "1": "Indústria",
            "2": "Comércio",
            "3": "Serviços",
            "4": "Logística",
            "5": "Outro"
        }
        segmento = segmentos.get(seg_opcao, "Não especificado")
        
        # Cria a empresa
        empresa = Empresa(
            nome=nome,
            cnpj=cnpj,
            segmento=segmento,
            ativa=True
        )
        
        db.add(empresa)
        db.commit()
        db.refresh(empresa)
        
        print("\n" + "="*70)
        print("   EMPRESA CADASTRADA COM SUCESSO!")
        print("="*70)
        print(f"ID: {empresa.id}")
        print(f"Nome: {empresa.nome}")
        print(f"CNPJ: {empresa.cnpj}")
        print(f"Segmento: {empresa.segmento}")
        print("="*70)
        
        return empresa
        
    except Exception as e:
        db.rollback()
        print(f"\nErro ao cadastrar empresa: {e}")
        return None

def listar_empresas(db):
    """
    Lista todas as empresas cadastradas.
    
    Args:
        db: Sessão do banco de dados
    """
    print("\n" + "="*70)
    print("   EMPRESAS CADASTRADAS")
    print("="*70)
    
    empresas = db.query(Empresa).order_by(Empresa.nome).all()
    
    if not empresas:
        print("\nNenhuma empresa cadastrada no sistema.")
        return
    
    for emp in empresas:
        status = "ATIVA" if emp.ativa else "INATIVA"
        print(f"\nID: {emp.id}")
        print(f"Nome: {emp.nome}")
        print(f"CNPJ: {emp.cnpj}")
        print(f"Segmento: {emp.segmento}")
        print(f"Status: {status}")
        print(f"Usuários: {len(emp.usuarios)}")
        print("-" * 70)

# ============================================================================
# FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS
# ============================================================================

def cadastrar_usuario(db):
    """
    Cadastra um novo usuário vinculado a uma empresa.
    
    Args:
        db: Sessão do banco de dados
    """
    print("\n" + "="*70)
    print("   CADASTRO DE USUÁRIO")
    print("="*70)
    
    # Lista empresas disponíveis
    empresas = db.query(Empresa).filter(Empresa.ativa == True).all()
    
    if not empresas:
        print("\nNenhuma empresa ativa cadastrada!")
        print("Por favor, cadastre uma empresa primeiro.")
        return
    
    print("\nEmpresas disponíveis:")
    for emp in empresas:
        print(f"{emp.id} - {emp.nome} ({emp.cnpj})")
    
    try:
        # Seleciona empresa
        empresa_id = int(input("\nID da Empresa: "))
        empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
        
        if not empresa:
            print(f"\nErro: Empresa com ID {empresa_id} não encontrada!")
            return
        
        # Coleta dados do usuário
        nome = input("Nome completo: ").strip()
        if len(nome) < 3:
            print("\nErro: Nome deve ter pelo menos 3 caracteres!")
            return
        
        email = input("Email: ").strip().lower()
        if "@" not in email or "." not in email:
            print("\nErro: Email inválido!")
            return
        
        # Verifica se email já existe
        existe = db.query(Usuario).filter(Usuario.email == email).first()
        if existe:
            print(f"\nErro: Já existe um usuário com este email!")
            return
        
        senha = input("Senha (mínimo 6 caracteres): ")
        if len(senha) < 6:
            print("\nErro: Senha deve ter no mínimo 6 caracteres!")
            return
        
        confirma_senha = input("Confirme a senha: ")
        if senha != confirma_senha:
            print("\nErro: As senhas não coincidem!")
            return
        
        # Admin?
        is_admin_input = input("Usuário administrador? (S/N): ").strip().upper()
        is_admin = is_admin_input == "S"
        
        # Hash da senha
        senha_hash = hash_password(senha)
        
        # Cria o usuário
        usuario = Usuario(
            empresa_id=empresa.id,
            nome=nome,
            email=email,
            senha_hash=senha_hash,
            ativo=True,
            is_admin=is_admin
        )
        
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
        print("\n" + "="*70)
        print("   USUÁRIO CADASTRADO COM SUCESSO!")
        print("="*70)
        print(f"ID: {usuario.id}")
        print(f"Nome: {usuario.nome}")
        print(f"Email: {usuario.email}")
        print(f"Empresa: {empresa.nome}")
        print(f"Admin: {'Sim' if usuario.is_admin else 'Não'}")
        print("="*70)
        
        # Se não é admin, configura permissões
        if not is_admin:
            print("\nDeseja configurar permissões agora? (S/N): ", end="")
            if input().strip().upper() == "S":
                configurar_permissoes_usuario(db, usuario.id)
        
        return usuario
        
    except ValueError:
        print("\nErro: Digite um número válido!")
        return None
    except Exception as e:
        db.rollback()
        print(f"\nErro ao cadastrar usuário: {e}")
        return None

def listar_usuarios(db):
    """
    Lista todos os usuários do sistema.
    
    Args:
        db: Sessão do banco de dados
    """
    print("\n" + "="*70)
    print("   USUÁRIOS CADASTRADOS")
    print("="*70)
    
    usuarios = db.query(Usuario).order_by(Usuario.empresa_id, Usuario.nome).all()
    
    if not usuarios:
        print("\nNenhum usuário cadastrado no sistema.")
        return
    
    empresa_atual = None
    for user in usuarios:
        if empresa_atual != user.empresa_id:
            empresa_atual = user.empresa_id
            print(f"\n{'='*70}")
            print(f"EMPRESA: {user.empresa.nome}")
            print(f"{'='*70}")
        
        status = "ATIVO" if user.ativo else "INATIVO"
        tipo = "ADMIN" if user.is_admin else "USUÁRIO"
        
        print(f"\nID: {user.id} | {tipo}")
        print(f"Nome: {user.nome}")
        print(f"Email: {user.email}")
        print(f"Status: {status}")
        
        if not user.is_admin and user.permissoes:
            perms = [p.nome for p in user.permissoes if p.ativa]
            if perms:
                print(f"Permissões: {', '.join(perms)}")
        elif not user.is_admin:
            print("Permissões: Nenhuma configurada")
        else:
            print("Permissões: TODAS (Administrador)")
        
        print("-" * 70)

# ============================================================================
# FUNÇÕES DE GERENCIAMENTO DE PERMISSÕES
# ============================================================================

def configurar_permissoes_usuario(db, usuario_id=None):
    """
    Configura permissões de acesso aos módulos para um usuário.
    
    Args:
        db: Sessão do banco de dados
        usuario_id: ID do usuário (opcional, se não fornecido solicita)
    """
    print("\n" + "="*70)
    print("   CONFIGURAR PERMISSÕES DE USUÁRIO")
    print("="*70)
    
    # Se não passou ID, solicita
    if usuario_id is None:
        try:
            usuario_id = int(input("\nID do Usuário: "))
        except ValueError:
            print("\nErro: Digite um número válido!")
            return
    
    # Busca usuário
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    if not usuario:
        print(f"\nErro: Usuário com ID {usuario_id} não encontrado!")
        return
    
    if usuario.is_admin:
        print(f"\nUsuário '{usuario.nome}' é administrador e tem acesso a todos os módulos.")
        return
    
    print(f"\nConfigurando permissões para: {usuario.nome} ({usuario.email})")
    print(f"Empresa: {usuario.empresa.nome}")
    
    # Lista permissões disponíveis
    permissoes = db.query(Permissao).filter(Permissao.ativa == True).all()
    
    if not permissoes:
        print("\nCriando permissões padrão do sistema...")
        criar_permissoes_padrao(db)
        permissoes = db.query(Permissao).filter(Permissao.ativa == True).all()
    
    print("\n" + "="*70)
    print("MÓDULOS DISPONÍVEIS:")
    print("="*70)
    
    # IDs das permissões atuais do usuário
    permissoes_atuais = {p.id for p in usuario.permissoes}
    
    for perm in permissoes:
        tem_acesso = perm.id in permissoes_atuais
        status = "[X]" if tem_acesso else "[ ]"
        print(f"{status} {perm.id} - {perm.nome}")
        print(f"    {perm.descricao}")
    
    print("\n" + "="*70)
    print("Digite os IDs dos módulos para CONCEDER acesso (separados por vírgula)")
    print("Exemplo: 1,2,3")
    print("Digite 'todos' para conceder acesso a todos os módulos")
    print("Digite 'nenhum' para remover todos os acessos")
    print("="*70)
    
    try:
        escolha = input("\nSua escolha: ").strip().lower()
        
        if escolha == "nenhum":
            usuario.permissoes.clear()
            db.commit()
            print("\nTodas as permissões foram removidas.")
            
        elif escolha == "todos":
            usuario.permissoes = permissoes
            db.commit()
            print("\nAcesso concedido a todos os módulos!")
            
        else:
            ids_escolhidos = [int(id.strip()) for id in escolha.split(",")]
            
            # Remove permissões antigas
            usuario.permissoes.clear()
            
            # Adiciona novas permissões
            for perm_id in ids_escolhidos:
                permissao = db.query(Permissao).filter(Permissao.id == perm_id).first()
                if permissao:
                    usuario.permissoes.append(permissao)
            
            db.commit()
            
            print("\n" + "="*70)
            print("PERMISSÕES CONFIGURADAS COM SUCESSO!")
            print("="*70)
            print(f"Usuário: {usuario.nome}")
            print(f"Módulos com acesso:")
            for perm in usuario.permissoes:
                print(f"  - {perm.nome}")
            print("="*70)
        
    except ValueError:
        print("\nErro: Digite números válidos separados por vírgula!")
    except Exception as e:
        db.rollback()
        print(f"\nErro ao configurar permissões: {e}")

# ============================================================================
# FUNÇÃO DE LOGIN
# ============================================================================

def fazer_login(db):
    """
    Realiza o login de um usuário no sistema.
    
    Args:
        db: Sessão do banco de dados
        
    Returns:
        Usuario: Objeto do usuário autenticado ou None
    """
    print("\n" + "="*70)
    print("   LOGIN NO SISTEMA")
    print("="*70)
    
    email = input("\nEmail: ").strip().lower()
    senha = input("Senha: ")
    
    # Busca usuário
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    
    if not usuario:
        print("\nErro: Email ou senha incorretos!")
        return None
    
    # Verifica se está ativo
    if not usuario.ativo:
        print("\nErro: Usuário inativo. Contate o administrador.")
        return None
    
    # Verifica se a empresa está ativa
    if not usuario.empresa.ativa:
        print("\nErro: Empresa inativa. Contate o suporte.")
        return None
    
    # Verifica senha
    if not verify_password(senha, usuario.senha_hash):
        print("\nErro: Email ou senha incorretos!")
        return None
    
    # Atualiza último login
    usuario.ultimo_login = datetime.utcnow()
    db.commit()
    
    print("\n" + "="*70)
    print(f"   BEM-VINDO(A), {usuario.nome.upper()}!")
    print("="*70)
    print(f"Empresa: {usuario.empresa.nome}")
    print(f"Tipo: {'Administrador' if usuario.is_admin else 'Usuário'}")
    
    if not usuario.is_admin:
        if usuario.permissoes:
            print(f"\nMódulos disponíveis:")
            for perm in usuario.permissoes:
                if perm.ativa:
                    print(f"  - {perm.nome}")
        else:
            print("\nAtenção: Você não possui permissões configuradas!")
            print("Contate o administrador do sistema.")
    else:
        print("\nAcesso: TODOS OS MÓDULOS")
    
    print("="*70)
    
    return usuario

# ============================================================================
# MENU DE GESTÃO DE USUÁRIOS
# ============================================================================

def menu_gestao_usuarios():
    """
    Menu principal de gestão de usuários e empresas.
    Deve ser executado antes do menu principal do sistema.
    """
    from database import SessionLocal, init_db
    
    # Inicializa banco
    init_db()
    
    # Cria permissões padrão se não existirem
    db = SessionLocal()
    criar_permissoes_padrao(db)
    db.close()
    
    while True:
        print("\n" + "="*70)
        print("   GESTÃO DE USUÁRIOS E EMPRESAS")
        print("="*70)
        print("1 - Cadastrar Empresa")
        print("2 - Listar Empresas")
        print("3 - Cadastrar Usuário")
        print("4 - Listar Usuários")
        print("5 - Configurar Permissões")
        print("0 - Voltar")
        print("="*70)
        
        opcao = input("Escolha uma opção: ").strip()
        
        db = SessionLocal()
        try:
            if opcao == "1":
                cadastrar_empresa(db)
            elif opcao == "2":
                listar_empresas(db)
            elif opcao == "3":
                cadastrar_usuario(db)
            elif opcao == "4":
                listar_usuarios(db)
            elif opcao == "5":
                configurar_permissoes_usuario(db)
            elif opcao == "0":
                break
            else:
                print("\nOpção inválida!")
            
            input("\nPressione Enter para continuar...")
            
        finally:
            db.close()

# ============================================================================
# FIM DO MÓDULO GESTAO_USUARIOS
# ============================================================================
