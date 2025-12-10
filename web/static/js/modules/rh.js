// ============================================================================
// MÓDULO RH - SISTEMA COMPLETO DE RECURSOS HUMANOS
// Versão: 40.12 - Reconstruído com todas as funcionalidades e fórmulas
// ============================================================================

console.log('[MODULE] Módulo RH v40.12 - Sistema Completo');

let funcionariosCache = [];
let lastCalculatedFolha = null;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Exibe toast de notificação (usa função global ou fallback)
 */
function mostrarToastRH(mensagem, tipo = 'info') {
    if (typeof mostrarToast === 'function') {
        mostrarToast(mensagem, tipo);
    } else if (typeof showToast === 'function') {
        showToast(mensagem, tipo);
    } else {
        console.log(`[TOAST ${tipo.toUpperCase()}] ${mensagem}`);
        alert(mensagem);
    }
}

/**
 * Verifica se Firebase está inicializado
 */
function isFirebaseAvailable() {
    return typeof firebaseInitialized !== 'undefined' && firebaseInitialized && typeof db !== 'undefined';
}

/**
 * Obtém usuário atual
 */
function getCurrentUser() {
    if (typeof currentUser !== 'undefined' && currentUser) {
        return currentUser;
    }
    // Fallback: tentar obter do localStorage
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
        try {
            return JSON.parse(localUser);
        } catch (e) {
            console.error('Erro ao parse do usuário local:', e);
        }
    }
    return null;
}

/**
 * Mostra loading (usa função global ou fallback)
 */
function showLoadingRH(message = 'Carregando...') {
    if (typeof showLoading === 'function') {
        showLoading(message);
    }
}

/**
 * Esconde loading (usa função global ou fallback)
 */
function hideLoadingRH() {
    if (typeof hideLoading === 'function') {
        hideLoading();
    }
}

// ============================================================================
// VALORES POR CARGO (Base: 220h mensais)
// ============================================================================
const CARGOS = {
    'Operário': { valorHora: 15, cor: '#6b7280', icon: 'fa-wrench' },
    'Supervisor': { valorHora: 40, cor: '#f59e0b', icon: 'fa-user-tie' },
    'Gerente': { valorHora: 60, cor: '#10b981', icon: 'fa-user-shield' },
    'Diretor': { valorHora: 80, cor: '#8b5cf6', icon: 'fa-crown' }
};

// ============================================================================
// TABELAS FISCAIS 2025
// ============================================================================

// INSS Progressivo 2025
const TABELA_INSS = [
    { limite: 1412.00, aliquota: 0.075, parcela: 0 },
    { limite: 2666.68, aliquota: 0.09, parcela: 21.18 },
    { limite: 4000.03, aliquota: 0.12, parcela: 101.18 },
    { limite: 7786.02, aliquota: 0.14, parcela: 181.18 },
    { limite: Infinity, aliquota: 0, parcela: 908.85 } // Teto máximo
];

// IR Progressivo 2025
const TABELA_IR = [
    { limite: 2259.20, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
    { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { limite: Infinity, aliquota: 0.275, deducao: 896.00 }
];

// ============================================================================
// CÁLCULOS TRABALHISTAS
// ============================================================================

/**
 * Calcula INSS Progressivo (2025)
 */
function calcularINSS(salarioBruto) {
    let inss = 0;
    let salarioRestante = salarioBruto;
    
    for (let i = 0; i < TABELA_INSS.length - 1; i++) {
        const faixa = TABELA_INSS[i];
        const faixaAnterior = i > 0 ? TABELA_INSS[i - 1].limite : 0;
        const valorFaixa = faixa.limite - faixaAnterior;
        
        if (salarioRestante > valorFaixa) {
            inss += valorFaixa * faixa.aliquota;
            salarioRestante -= valorFaixa;
        } else {
            inss += salarioRestante * faixa.aliquota;
            break;
        }
    }
    
    // Aplicar teto máximo
    const teto = TABELA_INSS[TABELA_INSS.length - 1].parcela;
    return Math.min(inss, teto);
}

/**
 * Calcula IR Progressivo (2025)
 * Base de cálculo = Salário Bruto - INSS
 */
function calcularIR(baseCalculo) {
    if (baseCalculo <= 0) return 0;
    
    for (const faixa of TABELA_IR) {
        if (baseCalculo <= faixa.limite) {
            const ir = (baseCalculo * faixa.aliquota) - faixa.deducao;
            return Math.max(ir, 0);
        }
    }
    
    return 0;
}

/**
 * Calcula horas extras com adicional de 50%
 */
function calcularHorasExtras(valorHora, horasExtras) {
    if (!horasExtras || horasExtras <= 0) return 0;
    return horasExtras * (valorHora * 1.5);
}

/**
 * Calcula tempo de empresa em anos/meses
 */
function calcularTempoEmpresa(dataAdmissao) {
    const admissao = new Date(dataAdmissao);
    const hoje = new Date();
    
    let anos = hoje.getFullYear() - admissao.getFullYear();
    let meses = hoje.getMonth() - admissao.getMonth();
    
    if (meses < 0) {
        anos--;
        meses += 12;
    }
    
    if (anos > 0) {
        return `${anos} ano${anos > 1 ? 's' : ''}${meses > 0 ? ` e ${meses} mes${meses > 1 ? 'es' : ''}` : ''}`;
    }
    return `${meses} mes${meses > 1 ? 'es' : ''}`;
}

// ============================================================================
// INTERFACE DO MÓDULO
// ============================================================================

function loadRHModule(container) {
    const html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 1.5rem; border-bottom: 1px solid #f3f4f6;">
                <h1 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-users" style="color: #10b981; font-size: 0.875rem;"></i>
                    Gestão de RH e Folha de Pagamento
                </h1>
                <p style="color: #6b7280; margin: 0.5rem 0 0 0; font-size: 0.8125rem;">
                    Sistema completo com cálculo de horas extras, INSS e IR progressivos (2025)
                </p>
            </div>
            
            <!-- Conteúdo -->
            <div style="padding: 1.5rem;">
                <!-- Grid 2 Colunas (Responsivo) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                    
                    <!-- Coluna Esquerda: Cadastro -->
                    <div style="background: #f9fafb; border-radius: 8px; padding: 1.5rem; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <i class="fas fa-user-plus" style="color: #3b82f6; font-size: 0.875rem;"></i>
                            <h3 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0;">Cadastrar Novo Funcionário</h3>
                        </div>
                        
                        <form id="formCadastroFuncionario" onsubmit="cadastrarFuncionario(event)">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-id-card" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Nome Completo
                                </label>
                                <input type="text" id="novoNome" required 
                                       placeholder="Ex: João da Silva Santos"
                                       style="width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; transition: all 0.2s; outline: none;">
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-briefcase" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Cargo / Função
                                </label>
                                <select id="novoCargo" required
                                        style="width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; background: white; cursor: pointer; transition: all 0.2s;">
                                    <option value="">Selecione o cargo...</option>
                                    <option value="Operário">🔧 Operário - R$ 15,00/h (R$ 3.300,00/mês)</option>
                                    <option value="Supervisor">👷 Supervisor - R$ 40,00/h (R$ 8.800,00/mês)</option>
                                    <option value="Gerente">👔 Gerente - R$ 60,00/h (R$ 13.200,00/mês)</option>
                                    <option value="Diretor">💼 Diretor - R$ 80,00/h (R$ 17.600,00/mês)</option>
                                </select>
                            </div>
                            
                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-calendar-check" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Data de Admissão
                                </label>
                                <input type="date" id="novoAdmissao" required
                                       max="${new Date().toISOString().split('T')[0]}"
                                       style="width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                            </div>
                            
                            <button type="submit" style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                                <i class="fas fa-save"></i>
                                Salvar Funcionário
                            </button>
                        </form>
                    </div>
                    
                    <!-- Coluna Direita: Ações -->
                    <div style="background: #f9fafb; border-radius: 8px; padding: 1.5rem; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <i class="fas fa-search" style="color: #3b82f6; font-size: 0.875rem;"></i>
                            <h3 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0;">Pesquisar Funcionário</h3>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <input type="text" id="searchFuncionario" 
                                   oninput="filtrarFuncionarios()" 
                                   placeholder="🔍 Digite o nome ou cargo para buscar..."
                                   style="width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; transition: all 0.2s;">
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <i class="fas fa-calculator" style="color: #8b5cf6; font-size: 0.875rem;"></i>
                            <h3 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0;">Cálculo de Folha</h3>
                        </div>
                        
                        <button onclick="calcularFolhaPagamento()" style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                            <i class="fas fa-calculator"></i>
                            Calcular Folha de Pagamento (Mês Atual)
                        </button>
                        
                        <button onclick="exportarPDF()" id="btnExportarPDF" disabled style="width: 100%; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: not-allowed; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; opacity: 0.5;">
                            <i class="fas fa-file-pdf"></i>
                            Exportar PDF
                        </button>
                        
                        <!-- Info Box -->
                        <div style="background: white; border: 1px solid #dbeafe; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 0.875rem; margin-top: 1rem;">
                            <div style="display: flex; align-items: start; gap: 0.625rem;">
                                <i class="fas fa-info-circle" style="color: #3b82f6; font-size: 0.875rem; margin-top: 0.125rem;"></i>
                                <div style="font-size: 0.8125rem; color: #1e40af; line-height: 1.5;">
                                    <strong style="display: block; margin-bottom: 0.25rem;">Horas Extras:</strong>
                                    <span style="color: #6b7280;">Digite a quantidade no card do funcionário antes de calcular. Aceita valores decimais (2.5 = 2h30min).</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Lista de Funcionários -->
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-users" style="color: #10b981; font-size: 0.875rem;"></i>
                            Funcionários Cadastrados
                        </h3>
                        <span id="totalFuncionarios" style="font-size: 0.8125rem; color: #6b7280; background: #f3f4f6; padding: 0.375rem 0.75rem; border-radius: 9999px;"></span>
                    </div>
                    
                    <div id="listaFuncionarios" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                        <!-- Preenchido via JS -->
                    </div>
                </div>
                
                <!-- Resultado da Folha -->
                <div id="resultadoFolha" style="display: none;">
                    <!-- Preenchido via JS -->
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    carregarFuncionarios();
}

// ============================================================================
// CRUD DE FUNCIONÁRIOS
// ============================================================================

/**
 * Cadastra novo funcionário
 */
async function cadastrarFuncionario(event) {
    event.preventDefault();
    
    const nome = document.getElementById('novoNome').value.trim();
    const cargo = document.getElementById('novoCargo').value;
    const admissao = document.getElementById('novoAdmissao').value;
    
    if (!nome || !cargo || !admissao) {
        mostrarToastRH('Preencha todos os campos', 'error');
        return;
    }
    
    const user = getCurrentUser();
    const funcionario = {
        id: Date.now().toString(),
        nome,
        cargo,
        admissao,
        horasExtras: 0,
        companyId: user?.companyId || 'local',
        createdAt: new Date().toISOString()
    };
    
    try {
        showLoadingRH();
        
        // Salvar no Firebase
        if (isFirebaseAvailable() && user) {
            await db.collection('funcionarios').add(funcionario);
        } else {
            // Fallback localStorage
            const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
            funcionarios.push(funcionario);
            localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        }
        
        mostrarToastRH('Funcionário cadastrado com sucesso!', 'success');
        document.getElementById('formCadastroFuncionario').reset();
        await carregarFuncionarios();
        
    } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
        mostrarToastRH('Erro ao cadastrar funcionário', 'error');
    } finally {
        hideLoadingRH();
    }
}

/**
 * Carrega todos os funcionários
 */
async function carregarFuncionarios() {
    try {
        let funcionarios = [];
        const user = getCurrentUser();
        
        // Carregar do Firebase
        if (isFirebaseAvailable() && user) {
            const snapshot = await db.collection('funcionarios')
                .where('companyId', '==', user.companyId)
                .get();
            
            snapshot.forEach(doc => {
                funcionarios.push({ id: doc.id, ...doc.data() });
            });
        } else {
            // Fallback localStorage
            funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
        }
        
        funcionariosCache = funcionarios;
        renderizarListaFuncionarios(funcionarios);
        
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        mostrarToastRH('Erro ao carregar funcionários', 'error');
    }
}

/**
 * Renderiza lista de funcionários
 */
function renderizarListaFuncionarios(funcionarios) {
    const container = document.getElementById('listaFuncionarios');
    const totalSpan = document.getElementById('totalFuncionarios');
    
    if (!container) return;
    
    totalSpan.textContent = `${funcionarios.length} funcionário${funcionarios.length !== 1 ? 's' : ''}`;
    
    if (funcionarios.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px;">
                <i class="fas fa-users" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                <p style="color: #6b7280; font-size: 0.9375rem; margin: 0;">Nenhum funcionário cadastrado ainda</p>
                <p style="color: #9ca3af; font-size: 0.8125rem; margin: 0.5rem 0 0 0;">Adicione funcionários no formulário ao lado</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = funcionarios.map(func => {
        const cargoInfo = CARGOS[func.cargo];
        const tempoEmpresa = calcularTempoEmpresa(func.admissao);
        const salarioBase = (cargoInfo.valorHora * 220).toFixed(2);
        
        return `
            <div class="card-funcionario" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden;">
                <!-- Borda colorida por cargo -->
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${cargoInfo.cor};"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas ${cargoInfo.icon}" style="color: ${cargoInfo.cor}; font-size: 0.875rem;"></i>
                            ${func.nome}
                        </h4>
                        <span style="display: inline-block; background: ${cargoInfo.cor}20; color: ${cargoInfo.cor}; padding: 0.25rem 0.625rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">
                            ${func.cargo}
                        </span>
                    </div>
                    <button onclick="deletarFuncionario('${func.id}')" style="background: #fee2e2; color: #ef4444; border: none; width: 2rem; height: 2rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" title="Excluir">
                        <i class="fas fa-trash" style="font-size: 0.75rem;"></i>
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8125rem; color: #6b7280; margin-bottom: 0.75rem;">
                    <div>
                        <i class="fas fa-dollar-sign" style="color: #10b981; font-size: 0.75rem;"></i>
                        R$ ${cargoInfo.valorHora},00/h
                    </div>
                    <div>
                        <i class="fas fa-calendar" style="color: #3b82f6; font-size: 0.75rem;"></i>
                        ${tempoEmpresa}
                    </div>
                </div>
                
                <div style="background: #f9fafb; border-radius: 6px; padding: 0.75rem; margin-top: 0.75rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 500; color: #374151; margin-bottom: 0.375rem;">
                        ⏰ Horas Extras (mês):
                    </label>
                    <input type="number" 
                           id="he_${func.id}" 
                           value="${func.horasExtras || 0}" 
                           min="0" 
                           max="100" 
                           step="0.5"
                           onchange="atualizarHorasExtras('${func.id}', this.value)"
                           style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; text-align: center; font-weight: 600;">
                    <small style="display: block; color: #6b7280; font-size: 0.75rem; margin-top: 0.25rem; text-align: center;">
                        Adicional de 50% (R$ ${(cargoInfo.valorHora * 1.5).toFixed(2)}/h extra)
                    </small>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; margin-top: 0.75rem; padding-top: 0.75rem; font-size: 0.8125rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280;">Salário Base:</span>
                        <strong style="color: #10b981; font-size: 0.9375rem;">R$ ${Number(salarioBase).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Adicionar hover effect
    document.querySelectorAll('.card-funcionario').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            this.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Atualiza horas extras do funcionário
 */
async function atualizarHorasExtras(funcId, horasExtras) {
    try {
        const horas = parseFloat(horasExtras) || 0;
        const user = getCurrentUser();
        
        if (isFirebaseAvailable() && user) {
            await db.collection('funcionarios').doc(funcId).update({
                horasExtras: horas
            });
        } else {
            const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
            const index = funcionarios.findIndex(f => f.id === funcId);
            if (index !== -1) {
                funcionarios[index].horasExtras = horas;
                localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
            }
        }
        
        // Atualizar cache
        const funcIndex = funcionariosCache.findIndex(f => f.id === funcId);
        if (funcIndex !== -1) {
            funcionariosCache[funcIndex].horasExtras = horas;
        }
        
    } catch (error) {
        console.error('Erro ao atualizar horas extras:', error);
        mostrarToastRH('Erro ao atualizar horas extras', 'error');
    }
}

/**
 * Deleta funcionário
 */
async function deletarFuncionario(funcId) {
    if (!confirm('Deseja realmente excluir este funcionário?')) return;
    
    try {
        showLoadingRH();
        const user = getCurrentUser();
        
        if (isFirebaseAvailable() && user) {
            await db.collection('funcionarios').doc(funcId).delete();
        } else {
            let funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
            funcionarios = funcionarios.filter(f => f.id !== funcId);
            localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        }
        
        mostrarToastRH('Funcionário excluído com sucesso', 'success');
        await carregarFuncionarios();
        
    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        mostrarToastRH('Erro ao deletar funcionário', 'error');
    } finally {
        hideLoadingRH();
    }
}

/**
 * Filtra funcionários por nome ou cargo
 */
function filtrarFuncionarios() {
    const searchTerm = document.getElementById('searchFuncionario')?.value.toLowerCase() || '';
    
    const filtrados = funcionariosCache.filter(func => 
        func.nome.toLowerCase().includes(searchTerm) ||
        func.cargo.toLowerCase().includes(searchTerm)
    );
    
    renderizarListaFuncionarios(filtrados);
}

// ============================================================================
// CÁLCULO DE FOLHA DE PAGAMENTO
// ============================================================================

/**
 * Calcula folha de pagamento completa
 */
async function calcularFolhaPagamento() {
    if (funcionariosCache.length === 0) {
        mostrarToastRH('Nenhum funcionário cadastrado', 'error');
        return;
    }
    
    try {
        showLoadingRH('Calculando folha de pagamento...');
        const user = getCurrentUser();
        
        const folha = {
            mes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            data: new Date().toLocaleDateString('pt-BR'),
            funcionarios: [],
            totais: {
                salarioBase: 0,
                horasExtras: 0,
                salarioBruto: 0,
                inss: 0,
                ir: 0,
                descontos: 0,
                salarioLiquido: 0
            }
        };
        
        // Calcular para cada funcionário
        for (const func of funcionariosCache) {
            const cargoInfo = CARGOS[func.cargo];
            const valorHora = cargoInfo.valorHora;
            const horasExtras = func.horasExtras || 0;
            
            // Salário base (220h)
            const salarioBase = valorHora * 220;
            
            // Horas extras (+50%)
            const valorHorasExtras = calcularHorasExtras(valorHora, horasExtras);
            
            // Salário bruto
            const salarioBruto = salarioBase + valorHorasExtras;
            
            // INSS
            const inss = calcularINSS(salarioBruto);
            
            // IR (sobre base = bruto - INSS)
            const baseIR = salarioBruto - inss;
            const ir = calcularIR(baseIR);
            
            // Salário líquido
            const descontos = inss + ir;
            const salarioLiquido = salarioBruto - descontos;
            
            const calculos = {
                ...func,
                valorHora,
                salarioBase,
                horasExtras,
                valorHorasExtras,
                salarioBruto,
                inss,
                ir,
                descontos,
                salarioLiquido,
                cor: cargoInfo.cor,
                icon: cargoInfo.icon
            };
            
            folha.funcionarios.push(calculos);
            
            // Somar totais
            folha.totais.salarioBase += salarioBase;
            folha.totais.horasExtras += valorHorasExtras;
            folha.totais.salarioBruto += salarioBruto;
            folha.totais.inss += inss;
            folha.totais.ir += ir;
            folha.totais.descontos += descontos;
            folha.totais.salarioLiquido += salarioLiquido;
        }
        
        lastCalculatedFolha = folha;
        exibirResultadoFolha(folha);
        
        // Habilitar exportação PDF
        const btnPDF = document.getElementById('btnExportarPDF');
        if (btnPDF) {
            btnPDF.disabled = false;
            btnPDF.style.background = '#ef4444';
            btnPDF.style.cursor = 'pointer';
            btnPDF.style.opacity = '1';
        }
        
        // Salvar no Firebase
        if (isFirebaseAvailable() && user) {
            await db.collection('folha_pagamento').add({
                ...folha,
                companyId: user.companyId,
                createdAt: new Date()
            });
        }
        
        mostrarToastRH('Folha calculada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao calcular folha:', error);
        mostrarToastRH('Erro ao calcular folha de pagamento', 'error');
    } finally {
        hideLoadingRH();
    }
}

/**
 * Exibe resultado da folha de pagamento
 */
function exibirResultadoFolha(folha) {
    const container = document.getElementById('resultadoFolha');
    if (!container) return;
    
    const html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-top: 2rem;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #f3f4f6;">
                <div>
                    <h2 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-file-invoice-dollar" style="color: #8b5cf6;"></i>
                        Folha de Pagamento
                    </h2>
                    <p style="color: #6b7280; margin: 0.25rem 0 0 0; font-size: 0.875rem;">
                        ${folha.mes.charAt(0).toUpperCase() + folha.mes.slice(1)} • ${folha.data}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem;">Total Líquido</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">
                        R$ ${folha.totais.salarioLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                </div>
            </div>
            
            <!-- Cards Resumo -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, #10b98120 0%, #10b98110 100%); border: 1px solid #10b98130; border-radius: 8px; padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-money-bill-wave" style="color: #10b981; font-size: 0.875rem;"></i>
                        <span style="font-size: 0.75rem; color: #6b7280; font-weight: 500;">Salário Bruto</span>
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">
                        R$ ${folha.totais.salarioBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%); border: 1px solid #f59e0b30; border-radius: 8px; padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-clock" style="color: #f59e0b; font-size: 0.875rem;"></i>
                        <span style="font-size: 0.75rem; color: #6b7280; font-weight: 500;">Horas Extras (+50%)</span>
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b;">
                        R$ ${folha.totais.horasExtras.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #ef444420 0%, #ef444410 100%); border: 1px solid #ef444430; border-radius: 8px; padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-minus-circle" style="color: #ef4444; font-size: 0.875rem;"></i>
                        <span style="font-size: 0.75rem; color: #6b7280; font-weight: 500;">Total Descontos</span>
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: #ef4444;">
                        R$ ${folha.totais.descontos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #3b82f620 0%, #3b82f610 100%); border: 1px solid #3b82f630; border-radius: 8px; padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-users" style="color: #3b82f6; font-size: 0.875rem;"></i>
                        <span style="font-size: 0.75rem; color: #6b7280; font-weight: 500;">Funcionários</span>
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6;">
                        ${folha.funcionarios.length}
                    </div>
                </div>
            </div>
            
            <!-- Tabela -->
            <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                    <thead>
                        <tr style="background: #f9fafb;">
                            <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">#</th>
                            <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">Funcionário</th>
                            <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">Cargo</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">HE</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">Base</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">HE (+50%)</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">Bruto</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">INSS</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">IR</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">Líquido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${folha.funcionarios.map((func, index) => `
                            <tr style="border-bottom: 1px solid #f3f4f6; transition: background 0.2s;" 
                                onmouseover="this.style.background='#f9fafb'" 
                                onmouseout="this.style.background='white'">
                                <td style="padding: 0.875rem;">${index + 1}</td>
                                <td style="padding: 0.875rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <i class="fas ${func.icon}" style="color: ${func.cor}; font-size: 0.75rem;"></i>
                                        <strong style="color: #111827;">${func.nome}</strong>
                                    </div>
                                </td>
                                <td style="padding: 0.875rem;">
                                    <span style="display: inline-block; background: ${func.cor}20; color: ${func.cor}; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">
                                        ${func.cargo}
                                    </span>
                                </td>
                                <td style="padding: 0.875rem; text-align: right; color: #f59e0b; font-weight: 600;">
                                    ${func.horasExtras > 0 ? func.horasExtras + 'h' : '-'}
                                </td>
                                <td style="padding: 0.875rem; text-align: right; color: #6b7280;">
                                    R$ ${func.salarioBase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </td>
                                <td style="padding: 0.875rem; text-align: right; color: ${func.valorHorasExtras > 0 ? '#f59e0b' : '#9ca3af'}; font-weight: ${func.valorHorasExtras > 0 ? '600' : 'normal'};">
                                    ${func.valorHorasExtras > 0 ? '+ R$ ' + func.valorHorasExtras.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}
                                </td>
                                <td style="padding: 0.875rem; text-align: right; color: #111827; font-weight: 600;">
                                    R$ ${func.salarioBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </td>
                                <td style="padding: 0.875rem; text-align: right; color: #ef4444;">
                                    - R$ ${func.inss.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </td>
                                <td style="padding: 0.875rem; text-align: right; color: #ef4444;">
                                    ${func.ir > 0 ? '- R$ ' + func.ir.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'Isento'}
                                </td>
                                <td style="padding: 0.875rem; text-align: right; color: #10b981; font-weight: 700; font-size: 0.9375rem;">
                                    R$ ${func.salarioLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f9fafb; font-weight: 700;">
                            <td colspan="4" style="padding: 1rem; text-align: right; color: #111827; font-size: 0.9375rem;">TOTAIS:</td>
                            <td style="padding: 1rem; text-align: right; color: #6b7280;">
                                R$ ${folha.totais.salarioBase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </td>
                            <td style="padding: 1rem; text-align: right; color: #f59e0b;">
                                + R$ ${folha.totais.horasExtras.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </td>
                            <td style="padding: 1rem; text-align: right; color: #111827;">
                                R$ ${folha.totais.salarioBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </td>
                            <td style="padding: 1rem; text-align: right; color: #ef4444;">
                                - R$ ${folha.totais.inss.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </td>
                            <td style="padding: 1rem; text-align: right; color: #ef4444;">
                                - R$ ${folha.totais.ir.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </td>
                            <td style="padding: 1rem; text-align: right; color: #10b981; font-size: 1rem;">
                                R$ ${folha.totais.salarioLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    // Scroll suave até o resultado
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================================
// EXPORTAÇÃO PDF
// ============================================================================

/**
 * Exporta folha de pagamento em PDF
 */
function exportarPDF() {
    if (!lastCalculatedFolha) {
        mostrarToastRH('Calcule a folha primeiro', 'error');
        return;
    }
    
    showLoadingRH('Gerando PDF da folha de pagamento...');
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const user = getCurrentUser();
        const nomeEmpresa = user ? user.nomeEmpresa : 'Empresa';
        
        // ===== CABEÇALHO =====
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.setFont(undefined, 'bold');
        doc.text(nomeEmpresa, 14, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Folha de Pagamento - ' + lastCalculatedFolha.mes, 14, 28);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, 'normal');
        doc.text(`Emitido em: ${lastCalculatedFolha.data}`, 14, 34);
        
        // ===== TABELA DE FUNCIONÁRIOS =====
        const tableColumn = ["Nome", "Cargo", "Sal. Base", "H. Extras", "Sal. Bruto", "INSS", "IR", "Líquido"];
        const tableRows = [];
        
        lastCalculatedFolha.funcionarios.forEach(func => {
            const row = [
                func.nome,
                func.cargo.replace(/_/g, ' '),
                formatCurrency(func.salarioBase),
                formatCurrency(func.valorHorasExtras),
                formatCurrency(func.salarioBruto),
                formatCurrency(func.inss),
                formatCurrency(func.ir),
                formatCurrency(func.salarioLiquido)
            ];
            tableRows.push(row);
        });
        
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 42,
            theme: 'grid',
            styles: { 
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: { 
                fillColor: [59, 130, 246],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 8
            },
            columnStyles: {
                0: { cellWidth: 35 },  // Nome
                1: { cellWidth: 25 },  // Cargo
                2: { cellWidth: 22 },  // Salário Base
                3: { cellWidth: 20 },  // H. Extras
                4: { cellWidth: 22 },  // Salário Bruto
                5: { cellWidth: 18 },  // INSS
                6: { cellWidth: 18 },  // IR
                7: { cellWidth: 22 }   // Líquido
            }
        });
        
        // ===== RESUMO GERAL =====
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFillColor(59, 130, 246);
        doc.rect(14, finalY, 182, 40, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('RESUMO GERAL DA FOLHA', 20, finalY + 8);
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Total de Funcionários: ${lastCalculatedFolha.funcionarios.length}`, 20, finalY + 16);
        doc.text(`Salários Base: ${formatCurrency(lastCalculatedFolha.totais.salarioBase)}`, 20, finalY + 22);
        doc.text(`Horas Extras: ${formatCurrency(lastCalculatedFolha.totais.horasExtras)}`, 20, finalY + 28);
        doc.text(`Salário Bruto Total: ${formatCurrency(lastCalculatedFolha.totais.salarioBruto)}`, 20, finalY + 34);
        
        doc.text(`INSS Total: ${formatCurrency(lastCalculatedFolha.totais.inss)}`, 110, finalY + 16);
        doc.text(`IR Total: ${formatCurrency(lastCalculatedFolha.totais.ir)}`, 110, finalY + 22);
        doc.text(`Descontos Totais: ${formatCurrency(lastCalculatedFolha.totais.descontos)}`, 110, finalY + 28);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`LÍQUIDO A PAGAR: ${formatCurrency(lastCalculatedFolha.totais.salarioLiquido)}`, 110, finalY + 34);
        
        // ===== RODAPÉ =====
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.setFont(undefined, 'normal');
        doc.text('Documento gerado automaticamente pelo sistema Quatro Cantos', 14, 285);
        doc.text(`Página 1 de 1 | ${new Date().toLocaleString('pt-BR')}`, 14, 290);
        
        // ===== SALVAR PDF =====
        const nomeArquivo = `Folha_Pagamento_${lastCalculatedFolha.mes.replace(/ /g, '_')}_${new Date().getTime()}.pdf`;
        doc.save(nomeArquivo);
        
        mostrarToastRH('PDF exportado com sucesso!', 'success');
        console.log('✅ PDF gerado:', nomeArquivo);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        mostrarToastRH('Erro ao gerar PDF. Verifique se jsPDF está carregado.', 'error');
    } finally {
        hideLoadingRH();
    }
}

// ============================================================================
// EXPOR FUNÇÕES GLOBALMENTE
// ============================================================================

window.loadRHModule = loadRHModule;
window.cadastrarFuncionario = cadastrarFuncionario;
window.carregarFuncionarios = carregarFuncionarios;
window.filtrarFuncionarios = filtrarFuncionarios;
window.deletarFuncionario = deletarFuncionario;
window.atualizarHorasExtras = atualizarHorasExtras;
window.calcularFolhaPagamento = calcularFolhaPagamento;
window.exportarPDF = exportarPDF;

console.log('[OK] Módulo RH v40.12 carregado - Sistema completo com INSS e IR progressivos 2025');
