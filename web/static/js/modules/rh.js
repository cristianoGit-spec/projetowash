// ============================================================================
// MÓDULO RH (SISTEMA HÍBRIDO - FIREBASE + LOCALSTORAGE)
// ============================================================================

console.log('[MODULE] Módulo RH carregado - v18');

let funcionariosCache = []; // Cache local para pesquisa e cálculo
let lastCalculatedFolha = null; // Cache para exportação PDF

function loadRHModule(container) {
    const html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 1.5rem; border-bottom: 1px solid #f3f4f6;">
                <h1 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-users" style="color: #10b981; font-size: 0.875rem;"></i>
                    Gestão de RH e Folha de Pagamento
                </h1>
                <p style="color: #6b7280; margin: 0.5rem 0 0 0; font-size: 0.8125rem;">Cadastro de funcionários e cálculo de folha</p>
            </div>
            
            <!-- Conteúdo -->
            <div style="padding: 1.5rem;">
                <!-- Grid 2 Colunas -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
                    
                    <!-- Coluna Esquerda: Cadastro -->
                    <div style="background: #f9fafb; border-radius: 8px; padding: 1.5rem;">
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
                                       style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; transition: all 0.2s; outline: none;">
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-briefcase" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Cargo / Função
                                </label>
                                <select id="novoCargo" required
                                        style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; background: white; cursor: pointer;">
                                    <option value="">Selecione o cargo...</option>
                                    <option value="Operário (R$ 15/h)">Operário - R$ 15,00/hora</option>
                                    <option value="Supervisor (R$ 40/h)">Supervisor - R$ 40,00/hora</option>
                                    <option value="Gerente (R$ 60/h)">Gerente - R$ 60,00/hora</option>
                                    <option value="Diretor (R$ 80/h)">Diretor - R$ 80,00/hora</option>
                                </select>
                            </div>
                            
                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-calendar-check" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Data de Admissão
                                </label>
                                <input type="date" id="novoAdmissao" required
                                       style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                            </div>
                            
                            <button type="submit" style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                                <i class="fas fa-save"></i>
                                Salvar Funcionário
                            </button>
                        </form>
                    </div>
                    
                    <!-- Coluna Direita: Pesquisa e Ações -->
                    <div style="background: #f9fafb; border-radius: 8px; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <i class="fas fa-search" style="color: #3b82f6; font-size: 0.875rem;"></i>
                            <h3 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0;">Pesquisar Funcionário</h3>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <input type="text" id="searchFuncionario" 
                                   onkeyup="filtrarFuncionarios()" 
                                   placeholder="Digite o nome ou cargo para buscar..."
                                   style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <i class="fas fa-calculator" style="color: #8b5cf6; font-size: 0.875rem;"></i>
                            <h3 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0;">Cálculo de Folha</h3>
                        </div>
                        
                        <button onclick="calcularFolhaPagamento()" style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fas fa-calculator"></i>
                            Calcular Folha de Pagamento (Mês Atual)
                        </button>
                        
                        <!-- Info Alert -->
                        <div style="margin-top: 1.5rem; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 0.75rem; display: flex; gap: 0.75rem;">
                            <i class="fas fa-info-circle" style="color: #3b82f6; font-size: 0.875rem; margin-top: 2px;"></i>
                            <div>
                                <p style="margin: 0; font-size: 0.8125rem; color: #1e40af; line-height: 1.5;">
                                    <strong>Funcionários cadastrados:</strong> <span id="totalFuncionarios">0</span><br>
                                    O cálculo considera 176 horas/mês e descontos de INSS/IR.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Lista de Funcionários -->
                <div style="background: #f9fafb; border-radius: 8px; padding: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-users" style="color: #10b981; font-size: 0.875rem;"></i>
                            <h3 style="font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0;">Funcionários Cadastrados</h3>
                        </div>
                    </div>
                    
                    <div id="listaFuncionariosContainer" style="min-height: 200px;">
                        <p style="text-align: center; color: #6b7280; padding: 2rem;">Carregando funcionários...</p>
                    </div>
                </div>
                
                <!-- Resultado do Cálculo -->
                <div id="resultadoRH" class="hidden" style="margin-top: 1.5rem;"></div>
            </div>
        </div>
        
        <style>
            /* Focus states */
            #formCadastroFuncionario input:focus,
            #formCadastroFuncionario select:focus,
            #searchFuncionario:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            /* Hover states */
            button[type="submit"]:hover {
                background: #059669 !important;
            }
            
            button[onclick="calcularFolhaPagamento()"]:hover {
                background: #2563eb !important;
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                div[style*="grid-template-columns: repeat(2, 1fr)"] {
                    grid-template-columns: 1fr !important;
                }
            }
        </style>
    `;
    
    container.innerHTML = html;
    listarFuncionarios();
}

async function cadastrarFuncionario(event) {
    event.preventDefault();
    
    const nome = document.getElementById('novoNome').value.trim();
    const cargo = document.getElementById('novoCargo').value;
    const admissao = document.getElementById('novoAdmissao').value;
    
    if (!nome || !cargo || !admissao) {
        showToast('Preencha todos os campos obrigatórios', 'warning');
        return;
    }
    
    showLoading('Salvando funcionário...');
    
    try {
        // Sistema Híbrido: Tenta Firebase primeiro, se falhar usa LocalStorage
        const funcionario = {
            id: 'func-' + Date.now(),
            companyId: localCurrentUser?.companyId || currentUser?.companyId || 'comp-default',
            nome: nome,
            cargo: cargo,
            admissao: admissao,
            criadoEm: new Date().toISOString(),
            criadoPor: localCurrentUser?.nome || currentUser?.displayName || 'Sistema'
        };
        
        // Tentar salvar no Firebase
        if (typeof db !== 'undefined' && db) {
            try {
                await addDoc(collection(db, 'funcionarios'), funcionario);
                console.log('[OK] Funcionário salvo no Firebase');
            } catch (firebaseError) {
                console.warn('⚠️ Firebase indisponível, salvando localmente:', firebaseError);
                // Fallback para localStorage
                await salvarFuncionarioLocal(funcionario);
            }
        } else {
            // Modo offline: salvar direto no localStorage
            await salvarFuncionarioLocal(funcionario);
        }
        
        showToast('✅ Funcionário cadastrado com sucesso!', 'success');
        document.getElementById('formCadastroFuncionario').reset();
        listarFuncionarios(); // Recarrega a lista
        
    } catch (error) {
        console.error('❌ Erro ao cadastrar funcionário:', error);
        showToast('❌ Erro ao cadastrar funcionário', 'error');
    } finally {
        hideLoading();
    }
}

// Salvar funcionário no localStorage
async function salvarFuncionarioLocal(funcionario) {
    let funcionarios = JSON.parse(localStorage.getItem('localFuncionarios') || '[]');
    funcionarios.push(funcionario);
    localStorage.setItem('localFuncionarios', JSON.stringify(funcionarios));
    console.log('[STORAGE] Funcionário salvo no localStorage');
}

async function listarFuncionarios() {
    const container = document.getElementById('listaFuncionariosContainer');
    
    try {
        let funcionarios = [];
        
        // Sistema Híbrido: Tenta Firebase primeiro
        if (typeof db !== 'undefined' && db) {
            try {
                const companyId = localCurrentUser?.companyId || currentUser?.companyId || 'comp-default';
                const q = query(collection(db, 'funcionarios'), where('companyId', '==', companyId));
                const snapshot = await getDocs(q);
                
                funcionarios = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.log('[OK] Funcionários carregados do Firebase:', funcionarios.length);
            } catch (firebaseError) {
                console.warn('⚠️ Firebase indisponível, carregando localStorage:', firebaseError);
                funcionarios = await carregarFuncionariosLocal();
            }
        } else {
            // Modo offline
            funcionarios = await carregarFuncionariosLocal();
        }
        
        funcionariosCache = funcionarios;
        renderizarListaFuncionarios(funcionariosCache);
        
    } catch (error) {
        console.error('❌ Erro ao listar funcionários:', error);
        container.innerHTML = '<p class="text-danger">⚠️ Erro ao carregar funcionários.</p>';
    }
}

// Carregar funcionários do localStorage
async function carregarFuncionariosLocal() {
    let funcionarios = JSON.parse(localStorage.getItem('localFuncionarios') || '[]');
    const companyId = localCurrentUser?.companyId || 'comp-default';
    
    // Filtrar por empresa
    funcionarios = funcionarios.filter(f => f.companyId === companyId);
    
    console.log('[STORAGE] Funcionários carregados do localStorage:', funcionarios.length);
    return funcionarios;
}

function renderizarListaFuncionarios(lista) {
    const container = document.getElementById('listaFuncionariosContainer');
    const totalFuncionariosEl = document.getElementById('totalFuncionarios');
    
    if (totalFuncionariosEl) {
        totalFuncionariosEl.textContent = lista.length;
    }
    
    if (lista.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: #6b7280;">
                <i class="fas fa-users" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                <p style="font-size: 0.9375rem; font-weight: 500; margin-bottom: 0.5rem;">Nenhum funcionário cadastrado</p>
                <p style="font-size: 0.8125rem; color: #9ca3af;">Cadastre o primeiro funcionário usando o formulário acima</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">';
    
    lista.forEach(func => {
        // Extrair apenas nome do cargo sem o valor
        const cargoNome = func.cargo.split('(')[0].trim();
        const cargoValor = func.cargo.match(/\((.+)\)/)?.[1] || '';
        
        // Definir cor do cargo
        let cargoCor = '#3b82f6';
        if (func.cargo.includes('Diretor')) cargoCor = '#8b5cf6';
        else if (func.cargo.includes('Gerente')) cargoCor = '#10b981';
        else if (func.cargo.includes('Supervisor')) cargoCor = '#f59e0b';
        else if (func.cargo.includes('Operário')) cargoCor = '#6b7280';
        
        // Calcular tempo de empresa
        const dataAdmissao = new Date(func.admissao + 'T00:00:00');
        const hoje = new Date();
        const diffTime = Math.abs(hoje - dataAdmissao);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const meses = Math.floor(diffDays / 30);
        const tempoEmpresa = meses > 0 ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : `${diffDays} dias`;
        
        html += `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; transition: all 0.2s;">
                <!-- Header do Card -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                    <div style="flex: 1;">
                        <h6 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 0.9375rem; font-weight: 600;">
                            ${func.nome}
                        </h6>
                        <span style="display: inline-block; background: ${cargoCor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
                            ${cargoNome}
                        </span>
                        <span style="color: #6b7280; font-size: 0.75rem; margin-left: 0.5rem;">
                            ${cargoValor}
                        </span>
                    </div>
                    <button onclick="removerFuncionario('${func.id}')" 
                            title="Excluir Funcionário"
                            style="padding: 0.375rem 0.625rem; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <!-- Informações -->
                <div style="background: #f9fafb; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-calendar-check" style="color: ${cargoCor}; font-size: 0.75rem; width: 14px;"></i>
                        <span style="font-size: 0.8125rem; color: #374151;">
                            <strong>Admissão:</strong> ${new Date(func.admissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-clock" style="color: ${cargoCor}; font-size: 0.75rem; width: 14px;"></i>
                        <span style="font-size: 0.8125rem; color: #374151;">
                            <strong>Tempo:</strong> ${tempoEmpresa}
                        </span>
                    </div>
                </div>
                
                <!-- Horas Extras -->
                <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 500; color: #6b7280; margin-bottom: 0.375rem;">
                        <i class="fas fa-clock" style="font-size: 0.625rem;"></i>
                        Horas Extras (mês)
                    </label>
                    <input type="number" class="func-he-input" data-id="${func.id}" min="0" max="100" value="0" step="0.5" 
                           placeholder="0h"
                           style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.8125rem; text-align: center; transition: all 0.2s; outline: none;">
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    html += `
        <style>
            .func-he-input:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            button[onclick^="removerFuncionario"]:hover {
                background: #dc2626 !important;
            }
        </style>
    `;
    
    container.innerHTML = html;
}

function filtrarFuncionarios() {
    const termo = document.getElementById('searchFuncionario').value.toLowerCase();
    const filtrados = funcionariosCache.filter(f => f.nome.toLowerCase().includes(termo));
    renderizarListaFuncionarios(filtrados);
}

async function removerFuncionario(id) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este funcionário?')) {
        return;
    }
    
    showLoading('Excluindo...');
    
    try {
        // Sistema Híbrido: Tenta Firebase primeiro
        if (typeof db !== 'undefined' && db) {
            try {
                await deleteDoc(doc(db, 'funcionarios', id));
                console.log('[OK] Funcionário excluído do Firebase');
            } catch (firebaseError) {
                console.warn('⚠️ Firebase indisponível, excluindo localmente:', firebaseError);
                await removerFuncionarioLocal(id);
            }
        } else {
            // Modo offline
            await removerFuncionarioLocal(id);
        }
        
        showToast('✅ Funcionário excluído com sucesso!', 'success');
        listarFuncionarios();
        
    } catch (error) {
        console.error('❌ Erro ao excluir funcionário:', error);
        showToast('❌ Erro ao excluir funcionário', 'error');
    } finally {
        hideLoading();
    }
}

// Remover funcionário do localStorage
async function removerFuncionarioLocal(id) {
    let funcionarios = JSON.parse(localStorage.getItem('localFuncionarios') || '[]');
    funcionarios = funcionarios.filter(f => f.id !== id);
    localStorage.setItem('localFuncionarios', JSON.stringify(funcionarios));
    console.log('[STORAGE] Funcionário excluído do localStorage');
}

async function calcularFolhaPagamento() {
    // Coletar horas extras dos inputs
    const inputsHE = document.querySelectorAll('.func-he-input');
    const mapHE = {};
    inputsHE.forEach(input => {
        mapHE[input.dataset.id] = parseFloat(input.value) || 0;
    });
    
    if (funcionariosCache.length === 0) {
        showToast('⚠️ Nenhum funcionário cadastrado', 'warning');
        return;
    }
    
    showLoading('Calculando folha...');
    
    try {
        // Tabela de valores por hora
        const tabelaValores = {
            'Operário (R$ 15/h)': 15,
            'Supervisor (R$ 40/h)': 40,
            'Gerente (R$ 60/h)': 60,
            'Diretor (R$ 80/h)': 80
        };
        
        let totalFolha = 0;
        let totalDescontos = 0;
        let detalhes = [];
        
        // Horas normais por mês (220h = 40h/semana * 4.4 semanas)
        const horasNormais = 220;
        
        funcionariosCache.forEach(func => {
            const valorHora = tabelaValores[func.cargo] || 15;
            const horasExtras = mapHE[func.id] || 0;
            
            // Salário base (220h mensais)
            const salarioBase = valorHora * horasNormais;
            
            // Horas extras com adicional de 50% (valor da hora × 1.5)
            // Exemplo: R$ 15/h × 1.5 = R$ 22.50/h para cada hora extra
            const valorHorasExtras = horasExtras * (valorHora * 1.5);
            
            // Salário bruto = Base + Horas Extras
            const salarioBruto = salarioBase + valorHorasExtras;
            
            // Calcular INSS progressivo (Tabela 2025)
            const inss = calcularINSS(salarioBruto);
            
            // Base de cálculo IR = Salário bruto - INSS
            const baseIR = salarioBruto - inss;
            
            // Calcular IR progressivo (Tabela 2025)
            const ir = calcularIR(baseIR);
            
            // Total de descontos
            const totalDescontosFunc = inss + ir;
            
            // Salário líquido
            const salarioLiquido = salarioBruto - totalDescontosFunc;
            
            totalFolha += salarioLiquido;
            totalDescontos += totalDescontosFunc;
            
            detalhes.push({
                nome: func.nome,
                cargo: func.cargo,
                salarioBase: salarioBase,
                horasExtras: horasExtras,
                valorHorasExtras: valorHorasExtras,
                salarioBruto: salarioBruto,
                inss: inss,
                ir: ir,
                totalDescontos: totalDescontosFunc,
                salarioLiquido: salarioLiquido
            });
        });
        
        // Armazenar resultado para exportação
        lastCalculatedFolha = {
            mes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            data: new Date().toLocaleDateString('pt-BR'),
            detalhes: detalhes,
            totalFolha: totalFolha,
            totalDescontos: totalDescontos
        };
        
        exibirResultadoRH(lastCalculatedFolha);
        showToast('✅ Folha calculada com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao calcular folha:', error);
        showToast('❌ Erro ao calcular folha', 'error');
    } finally {
        hideLoading();
    }
}

// Calcular INSS progressivo (Tabela 2025)
function calcularINSS(salario) {
    let inss = 0;
    
    // Faixa 1: Até R$ 1.412,00 = 7,5%
    if (salario <= 1412.00) {
        inss = salario * 0.075;
    }
    // Faixa 2: R$ 1.412,01 a R$ 2.666,68 = 9%
    else if (salario <= 2666.68) {
        inss = (1412.00 * 0.075) + ((salario - 1412.00) * 0.09);
    }
    // Faixa 3: R$ 2.666,69 a R$ 4.000,03 = 12%
    else if (salario <= 4000.03) {
        inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((salario - 2666.68) * 0.12);
    }
    // Faixa 4: R$ 4.000,04 a R$ 7.786,02 = 14%
    else if (salario <= 7786.02) {
        inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((salario - 4000.03) * 0.14);
    }
    // Acima do teto: limitado ao máximo
    else {
        inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((7786.02 - 4000.03) * 0.14);
    }
    
    return inss;
}

// Calcular IR progressivo (Tabela 2025)
function calcularIR(baseCalculo) {
    let ir = 0;
    
    // Faixa 1: Até R$ 2.259,20 = Isento
    if (baseCalculo <= 2259.20) {
        ir = 0;
    }
    // Faixa 2: R$ 2.259,21 a R$ 2.826,65 = 7,5% - R$ 169,44
    else if (baseCalculo <= 2826.65) {
        ir = (baseCalculo * 0.075) - 169.44;
    }
    // Faixa 3: R$ 2.826,66 a R$ 3.751,05 = 15% - R$ 381,44
    else if (baseCalculo <= 3751.05) {
        ir = (baseCalculo * 0.15) - 381.44;
    }
    // Faixa 4: R$ 3.751,06 a R$ 4.664,68 = 22,5% - R$ 662,77
    else if (baseCalculo <= 4664.68) {
        ir = (baseCalculo * 0.225) - 662.77;
    }
    // Faixa 5: Acima de R$ 4.664,68 = 27,5% - R$ 896,00
    else {
        ir = (baseCalculo * 0.275) - 896.00;
    }
    
    return Math.max(0, ir); // Garantir que não seja negativo
}

function exibirResultadoRH(data) {
    const resultado = document.getElementById('resultadoRH');
    
    let tabelaHTML = '';
    data.detalhes.forEach((func, idx) => {
        // Calcular valor/hora para exibição
        const valorHoraBase = func.salarioBase / 220; // 220h normais/mês
        const valorHoraExtra = valorHoraBase * 1.5; // Hora extra com adicional de 50%
        
        tabelaHTML += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 0.75rem; text-align: center; color: #6b7280; font-weight: 500;">${idx + 1}</td>
                <td style="padding: 0.75rem; color: #111827; font-weight: 500;">${func.nome}</td>
                <td style="padding: 0.75rem; color: #6b7280; font-size: 0.8125rem;">${func.cargo.split('(')[0].trim()}</td>
                <td style="padding: 0.75rem; text-align: center; color: ${func.horasExtras > 0 ? '#10b981' : '#9ca3af'}; font-weight: 600;">
                    ${func.horasExtras > 0 ? func.horasExtras + 'h' : '-'}
                </td>
                <td style="padding: 0.75rem; text-align: right; color: #374151;">${formatCurrency(func.salarioBase)}</td>
                <td style="padding: 0.75rem; text-align: right; color: ${func.valorHorasExtras > 0 ? '#10b981' : '#9ca3af'}; font-weight: ${func.valorHorasExtras > 0 ? '600' : '400'};">
                    ${func.valorHorasExtras > 0 ? '+ ' + formatCurrency(func.valorHorasExtras) : '-'}
                </td>
                <td style="padding: 0.75rem; text-align: right; font-weight: 600; color: #111827;">${formatCurrency(func.salarioBruto)}</td>
                <td style="padding: 0.75rem; text-align: right; color: #ef4444;">- ${formatCurrency(func.inss)}</td>
                <td style="padding: 0.75rem; text-align: right; color: #ef4444;">- ${formatCurrency(func.ir)}</td>
                <td style="padding: 0.75rem; text-align: right; font-weight: 700; font-size: 0.9375rem; color: #10b981;">${formatCurrency(func.salarioLiquido)}</td>
            </tr>
        `;
    });
    
    const html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-file-invoice" style="color: #3b82f6; font-size: 0.875rem;"></i>
                        Folha de Pagamento - ${data.mes}
                    </h1>
                    <p style="color: #6b7280; margin: 0.5rem 0 0 0; font-size: 0.8125rem;">Gerado em ${data.data}</p>
                </div>
                <button onclick="exportarFolhaPDF()" style="padding: 0.625rem 1.25rem; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-file-pdf"></i>
                    Exportar PDF
                </button>
            </div>
            
            <!-- Tabela -->
            <div style="padding: 1.5rem; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                    <thead>
                        <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                            <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151;">#</th>
                            <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151;">Nome</th>
                            <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151;">Cargo</th>
                            <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151;">HE</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Base (220h)</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Valor HE (+50%)</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Bruto</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">INSS</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">IR</th>
                            <th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Líquido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tabelaHTML}
                    </tbody>
                </table>
            </div>
            
            <!-- Resumo -->
            <div style="padding: 1.5rem; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                        <p style="margin: 0; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total Bruto</p>
                        <h3 style="margin: 0.5rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #111827;">${formatCurrency(data.detalhes.reduce((sum, f) => sum + f.salarioBruto, 0))}</h3>
                    </div>
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                        <p style="margin: 0; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total Descontos</p>
                        <h3 style="margin: 0.5rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #ef4444;">- ${formatCurrency(data.totalDescontos)}</h3>
                    </div>
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                        <p style="margin: 0; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total Líquido</p>
                        <h3 style="margin: 0.5rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #10b981;">${formatCurrency(data.totalFolha)}</h3>
                    </div>
                </div>
            </div>
            
            <!-- Info Alert -->
            <div style="margin: 1.5rem; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 1rem;">
                <div style="display: flex; gap: 0.75rem;">
                    <i class="fas fa-info-circle" style="color: #3b82f6; font-size: 0.875rem; margin-top: 2px;"></i>
                    <div>
                        <p style="margin: 0 0 0.5rem 0; font-size: 0.8125rem; color: #1e40af; font-weight: 600;">
                            Cálculos conforme legislação 2025:
                        </p>
                        <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.8125rem; color: #1e40af; line-height: 1.6;">
                            <li><strong>Horas Extras:</strong> Valor/hora × 1.5 (adicional de 50%)</li>
                            <li><strong>INSS:</strong> Progressivo de 7,5% a 14% (máx. R$ 908,85)</li>
                            <li><strong>IR:</strong> Progressivo de 0% a 27,5% (isento até R$ 2.259,20)</li>
                            <li><strong>Base de Cálculo:</strong> 220 horas/mês (44h/semana)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            button[onclick="exportarFolhaPDF()"]:hover {
                background: #dc2626 !important;
            }
            
            @media (max-width: 768px) {
                div[style*="grid-template-columns: repeat(3, 1fr)"] {
                    grid-template-columns: 1fr !important;
                }
            }
        </style>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
    
    // Scroll para o resultado
    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
                        <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Total Descontos</p>
                        <h3 style="margin: 5px 0 0 0; color: #dc2626;">- ${formatCurrency(data.totalDescontos)}</h3>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Total Líquido</p>
                        <h3 style="margin: 5px 0 0 0; color: #16a34a;">${formatCurrency(data.totalFolha)}</h3>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 8px 0; font-size: 0.875rem; color: #92400e;">
                    <i class="fas fa-info-circle"></i>
                    <strong>Cálculos conforme legislação 2025:</strong>
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: #78350f;">
                    <li><strong>Horas Extras:</strong> Valor/hora x 1.5 (adicional de 50% por lei)</li>
                    <li><strong>INSS:</strong> Progressivo de 7,5% a 14% (máx. R$ 908,85)</li>
                    <li><strong>IR:</strong> Progressivo de 0% a 27,5% (isento até R$ 2.259,20)</li>
                    <li><strong>Base de Cálculo:</strong> 220 horas/mês (44h/semana)</li>
                </ul>
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
    
    // Scroll para o resultado
    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function exportarFolhaPDF() {
    if (!lastCalculatedFolha) {
        showToast('Nenhuma folha calculada para exportar', 'warning');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(18);
        doc.setTextColor(102, 126, 234);
        doc.text('Quatro Cantos', 14, 22);
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Folha de Pagamento', 14, 32);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Período: ${lastCalculatedFolha.mes}`, 14, 40);
        doc.text(`Emissão: ${lastCalculatedFolha.data}`, 14, 46);
        
        // Tabela de Funcionários
        const tableColumn = ["Nome", "Cargo", "HE", "Salário Base", "Valor HE", "Total"];
        const tableRows = [];

        lastCalculatedFolha.detalhes.forEach(func => {
            const row = [
                func.nome,
                func.cargo,
                func.horasExtras > 0 ? func.horasExtras + 'h' : '-',
                formatCurrency(func.salarioBase),
                formatCurrency(func.valorHorasExtras),
                formatCurrency(func.salarioBruto)
            ];
            tableRows.push(row);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 3
            },
            headStyles: { 
                fillColor: [102, 126, 234],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 45 }, // Nome
                1: { cellWidth: 35 }, // Cargo
                2: { cellWidth: 15, halign: 'center' }, // HE
                3: { cellWidth: 30, halign: 'right' }, // Salário Base
                4: { cellWidth: 30, halign: 'right' }, // Valor HE
                5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' } // Total
            }
        });
        
        // Resumo com destaque
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFillColor(102, 126, 234);
        doc.rect(14, finalY, 182, 25, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('RESUMO DA FOLHA', 20, finalY + 8);
        
        doc.setFontSize(10);
        doc.text(`Total de Funcionários: ${lastCalculatedFolha.detalhes.length}`, 20, finalY + 16);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Total da Folha: ${formatCurrency(lastCalculatedFolha.totalFolha)}`, 20, finalY + 22);
        
        // Rodapé
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Sistema de Gestão Quatro Cantos - Gerado automaticamente', 14, 285);
        
        // Salvar PDF
        const filename = `Folha_${lastCalculatedFolha.mes.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        doc.save(filename);
        
        showToast('PDF exportado com sucesso!', 'success');
        
    } catch (error) {
        console.error('[ERROR] Erro ao exportar PDF:', error);
        showToast('Erro ao exportar PDF', 'error');
    }
}
