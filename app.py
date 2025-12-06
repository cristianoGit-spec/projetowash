# ============================================================================
# ARQUIVO: app.py
# SISTEMA DE GESTÁO EMPRESARIAL - API REST COM FLASK
# ============================================================================
# 
# DESCRIÇÁO:
# Este arquivo é o servidor principal da aplicação web. Ele cria uma API REST
# (Representational State Transfer) usando o framework Flask do Python.
# A API conecta o backend (Python) com o frontend (HTML/CSS/JavaScript).
#
# FUNCIONALIDADES PRINCIPAIS:
# 1. Servir páginas HTML através de rotas web
# 2. Fornecer endpoints de API para operações CRUD (Create, Read, Update, Delete)
# 3. Gerenciar autenticação de usuários
# 4. Processar requisições dos módulos: Operacional, Estoque, Financeiro e RH
# 5. Permitir instalação como PWA (Progressive Web App)
#
# TECNOLOGIAS UTILIZADAS:
# - Flask: Framework web Python para criar APIs REST
# - Flask-CORS: Biblioteca para habilitar CORS (Cross-Origin Resource Sharing)
# - SQLAlchemy: ORM para gerenciar banco de dados
# - JSON: Formato de troca de dados entre frontend e backend
#
# ============================================================================

# ============================================================================
# IMPORTAÇÕES DE BIBLIOTECAS
# ============================================================================

from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import sys
import os
from functools import wraps

# ============================================================================
# CONFIGURAÇÁO DO PATH DO SISTEMA
# ============================================================================
# Adiciona o diretório 'src' ao caminho de busca do Python
# Isso permite importar os módulos localizados na pasta src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# ============================================================================
# IMPORTAÇÁO DOS MÓDULOS CUSTOMIZADOS DO SISTEMA
# ============================================================================
# Importa as classes e funções dos módulos do sistema
from database import init_db, Produto, Funcionario, SessionLocal # Funções para gerenciar o banco de dados
from operacional import calcular_metricas_capacidade # Função refatorada do módulo operacional
from financeiro import calcular_metricas_financeiras # Função refatorada do módulo financeiro
from rh import processar_funcionario # Função refatorada do módulo RH
from estoque_entrada import registrar_entrada_produto # Função refatorada do módulo estoque entrada
from estoque_saida import registrar_saida_produto # Função refatorada do módulo estoque saída

# ============================================================================
# CRIAÇÁO E CONFIGURAÇÁO DA APLICAÇÁO FLASK
# ============================================================================
# Cria a instância principal da aplicação Flask
# template_folder: define onde estão os arquivos HTML
# static_folder: define onde estão os arquivos CSS, JS, imagens
app = Flask(__name__,
            template_folder='web',
            static_folder='web/static')

# ============================================================================
# CONFIGURAÇÁO DE CORS (Cross-Origin Resource Sharing)
# ============================================================================
# CORS permite que o frontend (rodando em uma URL) acesse o backend (rodando
# em outra URL). Essencial para APIs REST e aplicações PWA.
CORS(app)

# ============================================================================
# INICIALIZAÇÁO DO BANCO DE DADOS
# ============================================================================
# Chama a função que cria as tabelas no banco de dados caso não existam
init_db()

# ============================================================================
# MIDDLEWARE DE SEGURANÇA: VALIDAÇÁO DE API KEY
# ============================================================================
# Este decorator (função que decora outra função) adiciona uma camada de
# segurança às rotas da API. Exige que o cliente envie uma chave de API
# válida no header da requisição HTTP.
#
# COMO FUNCIONA:
# 1. O cliente envia a chave no header 'X-API-KEY'
# 2. O servidor compara com a chave configurada nas variáveis de ambiente
# 3. Se não houver chave configurada ou se a chave for válida, permite acesso
# 4. Se a chave for inválida, retorna erro 401 (Não autorizado)

def require_api_key(f):
    """
    Decorator para proteger rotas que exigem autenticação via API Key.
    
    Argumentos:
        f: função da rota que será protegida
        
    Retorna:
        Função decorada com validação de API Key
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Obtém a API Key enviada pelo cliente no header da requisição
        api_key = request.headers.get('X-API-KEY')
        
        # Obtém a API Key configurada no servidor (variável de ambiente)
        env_key = os.getenv('API_KEY')

        # SEGURANÇA: API Key é OBRIGATÓRIA - não permite acesso sem autenticação
        if not env_key:
            return jsonify({'error': 'Servidor não configurado corretamente (API_KEY ausente)'}), 500
        
        if not api_key or api_key != env_key:
            return jsonify({'error': 'Acesso não autorizado - API Key inválida ou ausente'}), 401
        
        # Se passou na validação, executa a função original
        return f(*args, **kwargs)
    return decorated_function

# ============================================================================
# MIDDLEWARE DE CONTROLE DE ACESSO BASEADO EM FUNÇÁO (RBAC)
# ============================================================================
# RBAC = Role-Based Access Control (Controle de Acesso Baseado em Função)
# 
# Este sistema implementa três níveis de acesso:
# - admin: Acesso total ao sistema (nível 3)
# - manager: Acesso gerencial (nível 2)
# - user: Acesso básico (nível 1)
#
# COMO FUNCIONA:
# 1. O cliente envia sua função (role) no header 'X-User-Role'
# 2. O servidor verifica se o nível de acesso do usuário é suficiente
# 3. Se o nível for insuficiente, retorna erro 403 (Acesso Negado)
# 4. Se o nível for suficiente, permite a execução da função

def require_role(required_role):
    """
    Decorator para implementar controle de acesso baseado em função.
    
    Argumentos:
        required_role: função mínima necessária ('admin', 'manager' ou 'user')
        
    Retorna:
        Decorator que valida o nível de acesso do usuário
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Obtém a função do usuário do header (padrão: 'user')
            # NOTA: Em produção, isso deve vir de um token JWT seguro
            user_role = request.headers.get('X-User-Role', 'user')
            
            # Define a hierarquia de níveis de acesso
            # Quanto maior o número, maior o nível de permissão
            roles_hierarchy = {
                'admin': 3,      # Administrador: acesso total
                'manager': 2,    # Gerente: acesso intermediário
                'user': 1        # Usuário comum: acesso básico
            }
            
            # Obtém o nível numérico do usuário e do requisito
            user_level = roles_hierarchy.get(user_role, 0)
            required_level = roles_hierarchy.get(required_role, 1)
            
            # Se o nível do usuário for menor que o necessário, nega acesso
            if user_level < required_level:
                return jsonify({
                    'success': False,
                    'error': (
                        f'Acesso negado. Requer privilegios de '
                        f'{required_role} ou superior.'
                    )
                }), 403
            
            # Se passou na validação, executa a função original
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# ============================================================================
# ROTAS WEB (PÁGINAS HTML)
# ============================================================================

@app.route('/')
def index():
    """Página principal do sistema"""
    # Injeta a API Key no template para uso no frontend
    api_key = os.getenv('API_KEY', '')
    return render_template('index.html', api_key=api_key)

@app.route('/manifest.json')
def manifest():
    """Manifest para PWA"""
    try:
        return send_file(
            'web/static/manifest.json',
            mimetype='application/json'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/service-worker.js')
def service_worker():
    """Service Worker para PWA"""
    try:
        response = send_file(
            'web/static/service-worker.js',
            mimetype='application/javascript'
        )
        response.headers['Service-Worker-Allowed'] = '/'
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/favicon.ico')
def favicon():
    """Favicon para o navegador"""
    try:
        return send_file(
            'web/static/icons/icon.svg',
            mimetype='image/svg+xml'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 404

# ============================================================================
# API ENDPOINTS - MÓDULO OPERACIONAL
# ============================================================================

@app.route('/api/operacional/calcular', methods=['POST'])
@require_api_key
def calcular_capacidade_api():
    """
    Calcula a capacidade de produção baseada nos turnos.
    """
    try:
        data = request.get_json()
        turnos = int(data.get('turnos', 1))
        
        if turnos < 1 or turnos > 3:
            return jsonify({
                'success': False,
                'error': 'Turnos deve estar entre 1 e 3'
            }), 400
        
        # Usar função refatorada
        resultado = calcular_metricas_capacidade(turnos)
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# API ENDPOINTS - MÓDULO ESTOQUE (COM BANCO DE DADOS)
# ============================================================================

@app.route('/api/estoque/produtos', methods=['GET'])
def listar_produtos():
    """Retorna todos os produtos do estoque (Banco de Dados)"""
    db = SessionLocal()
    try:
        produtos = db.query(Produto).all()
        lista_produtos = [p.to_dict() for p in produtos]
        
        total_itens = sum(p.quantidade for p in produtos)
        valor_total = sum(p.quantidade * p.valor_unitario for p in produtos)
        
        return jsonify({
            'success': True,
            'data': {
                'produtos': lista_produtos,
                'total_produtos': len(lista_produtos),
                'total_itens': total_itens,
                'valor_total': round(valor_total, 2)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/estoque/entrada', methods=['POST'])
@require_api_key
@require_role('manager')
def cadastrar_produto_api():
    """Cadastra ou atualiza produto no banco de dados"""
    db = SessionLocal()
    try:
        data = request.get_json()
        
        codigo = int(data.get('codigo'))
        nome = data.get('nome', '').strip()
        quantidade = int(data.get('quantidade'))
        valor = float(data.get('valor', 0))
        
        # Usar função refatorada do módulo estoque_entrada
        produto, is_novo = registrar_entrada_produto(
            db, 
            codigo, 
            nome, 
            quantidade, 
            valor, 
            data.get('data', ''), 
            data.get('fornecedor', ''), 
            data.get('local', '')
        )
        
        msg = 'Produto cadastrado com sucesso' if is_novo else 'Produto atualizado com sucesso'
        return jsonify({'success': True, 'message': msg, 'data': produto.to_dict()})
            
    except ValueError as ve:
        return jsonify({'success': False, 'error': str(ve)}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/estoque/saida', methods=['POST'])
@require_api_key
def vender_produto_api():
    """Registra venda e baixa no estoque (Banco de Dados)"""
    db = SessionLocal()
    try:
        data = request.get_json()
        nome = data.get('nome', '').strip()
        quantidade = int(data.get('quantidade'))
        
        # Usar função refatorada do módulo estoque_saida
        resultado = registrar_saida_produto(db, nome, quantidade)
        
        if resultado['status'] == 'erro':
            return jsonify({'success': False, 'error': resultado['mensagem']}), 400
            
        return jsonify({
            'success': True,
            'message': f"Pedido atendido ({resultado['tipo']})",
            'data': {
                'tipo': resultado['tipo'],
                'quantidade_vendida': resultado['qtd_vendida'],
                'valor_venda': round(resultado['valor_venda'], 2),
                'estoque_restante': resultado['saldo_restante']
            }
        })
            
    except ValueError as ve:
        return jsonify({'success': False, 'error': str(ve)}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        db.close()

# ============================================================================
# API ENDPOINTS - MÓDULO FINANCEIRO
# ============================================================================

@app.route('/api/financeiro/calcular', methods=['POST'])
@require_api_key
def calcular_financeiro_api():
    """Calcula custos e lucros usando lógica refatorada"""
    try:
        data = request.get_json()
        
        agua = float(data.get('agua', 0))
        luz = float(data.get('luz', 0))
        impostos = float(data.get('impostos', 0))
        salarios = float(data.get('salarios', 0))
        total_pallets = int(data.get('total_pallets', 1000))
        
        if agua < 0 or luz < 0 or impostos < 0 or salarios < 0:
            return jsonify({'success': False, 'error': 'Valores negativos não permitidos'}), 400
        
        # Usar função refatorada
        resultado = calcular_metricas_financeiras(agua, luz, impostos, salarios, total_pallets)
        
        # Adaptar resposta para o formato esperado pelo frontend
        return jsonify({
            'success': True,
            'data': {
                'custos': {
                    'agua': agua, 'luz': luz, 'impostos': impostos, 'salarios': salarios,
                    'total': resultado['custo_total']
                },
                'precificacao': {
                    'custo_por_pallet': resultado['custo_por_pallet'],
                    'preco_venda': resultado['preco_venda'],
                    'lucro_por_unidade': resultado['lucro_por_unidade'],
                    'margem_lucro': 50
                },
                'mensal': {
                    'receita': resultado['receita_mensal'],
                    'lucro': resultado['lucro_mensal'],
                    'margem_real': resultado['margem_lucro_real']
                },
                'anual': {
                    'receita': resultado['receita_anual'],
                    'lucro': resultado['lucro_anual']
                },
                'indicadores': {
                    'ponto_equilibrio': resultado['ponto_equilibrio'],
                    'roi': resultado['roi']
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/rh/calcular', methods=['POST'])
@require_api_key
def calcular_rh_api():
    """Calcula folha de pagamento usando lógica refatorada"""
    try:
        data = request.get_json()
        funcionarios = data.get('funcionarios', [])
        
        if not funcionarios:
            return jsonify({'success': False, 'error': 'Nenhum funcionário informado'}), 400
        
        resultado = []
        total_bruto = 0
        total_inss = 0
        total_ir = 0
        total_liquido = 0
        
        for func in funcionarios:
            nome = func.get('nome', '').strip()
            cargo = func.get('cargo', 'Operário')
            horas_extras = float(func.get('horas_extras', 0))
            
            if not nome: continue
            
            # Usar função refatorada
            res_func = processar_funcionario(nome, cargo, horas_extras)
            
            # Adaptar chaves para o frontend (se necessário)
            res_func['salario_bruto'] = res_func.pop('bruto')
            res_func['desconto_inss'] = res_func.pop('inss')
            res_func['desconto_ir'] = res_func.pop('ir')
            res_func['salario_liquido'] = res_func.pop('liquido')
            res_func['valor_extras'] = res_func.pop('extras')
            
            resultado.append(res_func)
            
            total_bruto += res_func['salario_bruto']
            total_inss += res_func['desconto_inss']
            total_ir += res_func['desconto_ir']
            total_liquido += res_func['salario_liquido']
        
        resultado.sort(key=lambda x: x['nome'])
        encargos = total_bruto * 0.2765
        custo_total = total_liquido + total_inss + total_ir + encargos
        
        return jsonify({
            'success': True,
            'data': {
                'funcionarios': resultado,
                'totais': {
                    'total_funcionarios': len(resultado),
                    'total_bruto': round(total_bruto, 2),
                    'total_inss': round(total_inss, 2),
                    'total_ir': round(total_ir, 2),
                    'total_liquido': round(total_liquido, 2),
                    'encargos_patronais': round(encargos, 2),
                    'custo_total_empresa': round(custo_total, 2)
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# API ENDPOINTS - MÓDULO RH (CRUD)
# ============================================================================

@app.route('/api/rh/funcionarios', methods=['GET'])
def listar_funcionarios():
    """Retorna todos os funcionários cadastrados"""
    db = SessionLocal()
    try:
        funcionarios = db.query(Funcionario).all()
        lista_funcionarios = [f.to_dict() for f in funcionarios]
        return jsonify({'success': True, 'data': lista_funcionarios})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/rh/funcionarios', methods=['POST'])
@require_api_key
@require_role('manager')
def cadastrar_funcionario():
    """Cadastra um novo funcionário"""
    db = SessionLocal()
    try:
        data = request.get_json()
        nome = data.get('nome', '').strip()
        cargo = data.get('cargo', '').strip()
        admissao = data.get('admissao', '')

        if not nome or not cargo:
            return jsonify({'success': False, 'error': 'Nome e Cargo são obrigatórios'}), 400

        novo_func = Funcionario(nome=nome, cargo=cargo, admissao=admissao)
        db.add(novo_func)
        db.commit()
        
        return jsonify({'success': True, 'message': 'Funcionário cadastrado com sucesso', 'data': novo_func.to_dict()})
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/rh/funcionarios/<int:id>', methods=['DELETE'])
@require_api_key
@require_role('admin')
def excluir_funcionario(id):
    """Exclui um funcionário (Requer admin)"""
    db = SessionLocal()
    try:
        func = db.query(Funcionario).filter(Funcionario.id == id).first()
        if not func:
            return jsonify({'success': False, 'error': 'Funcionário não encontrado'}), 404
            
        db.delete(func)
        db.commit()
        return jsonify({'success': True, 'message': 'Funcionário excluído com sucesso'})
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        db.close()

# ============================================================================
# INICIALIZAÇÁO DO SERVIDOR WEB
# ============================================================================
# Este bloco é executado quando o arquivo app.py é executado diretamente
# (não quando é importado como módulo)

if __name__ == '__main__':
    # Exibe banner informativo no console
    print("\n" + "="*50)
    print("   QUATRO CANTOS - SERVIDOR WEB")
    print("   Sistema de Gestao Empresarial")
    print("="*50)
    print("\n Servidor iniciando...")
    print(" Acesse: http://localhost:5000")
    print(" Pressione Ctrl+C para encerrar\n")
    print("="*50 + "\n")
    
    # ========================================================================
    # INICIA O SERVIDOR FLASK
    # ========================================================================
    # Parâmetros:
    # - debug=True: Ativa modo de desenvolvimento (recarrega automaticamente)
    # - host='0.0.0.0': Permite acesso de qualquer IP (necessário para rede local)
    # - port=5000: Define a porta do servidor (padrão do Flask)
    app.run(debug=True, host='0.0.0.0', port=5000)
