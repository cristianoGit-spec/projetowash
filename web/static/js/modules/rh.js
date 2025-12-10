// ============================================================================
// MÓDULO RH (SISTEMA HÍBRIDO - FIREBASE + LOCALSTORAGE)
// ============================================================================

console.log('📋 Módulo RH carregado - v18');

let funcionariosCache = []; // Cache local para pesquisa e cálculo
let lastCalculatedFolha = null; // Cache para exportação PDF

function loadRHModule(container) {
    const html = `
        <div class="card modern-card">
            <div class="card-header modern-header">
                <div class="header-content">
                    <div class="header-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="header-text">
                        <h3>Gestão de RH e Folha de Pagamento</h3>
                        <p class="subtitle">Cadastro de funcionários e cálculo de folha</p>
                    </div>
                </div>
            </div>
            
            <div class="card-body modern-body">
                <!-- Formulário de Cadastro Limpo -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-user-plus"></i>
                        <span>Cadastrar Novo Funcionário</span>
                    </div>
                    
                    <form id="formCadastroFuncionario" onsubmit="cadastrarFuncionario(event)">
                        <div class="form-group modern-form-group">
                            <label class="modern-label">
                                <i class="fas fa-id-card"></i>
                                <span>Nome Completo</span>
                            </label>
                            <input type="text" id="novoNome" class="modern-input" required 
                                   placeholder="Ex: João da Silva Santos">
                        </div>
                        
                        <div class="form-group modern-form-group">
                            <label class="modern-label">
                                <i class="fas fa-briefcase"></i>
                                <span>Cargo / Função</span>
                            </label>
                            <select id="novoCargo" class="modern-select" required>
                                <option value="">Selecione o cargo...</option>
                                <option value="Operário (R$ 15/h)">Operário - R$ 15,00/hora</option>
                                <option value="Supervisor (R$ 40/h)">Supervisor - R$ 40,00/hora</option>
                                <option value="Gerente (R$ 60/h)">Gerente - R$ 60,00/hora</option>
                                <option value="Diretor (R$ 80/h)">Diretor - R$ 80,00/hora</option>
                            </select>
                        </div>
                        
                        <div class="form-group modern-form-group">
                            <label class="modern-label">
                                <i class="fas fa-calendar-check"></i>
                                <span>Data de Admissão</span>
                            </label>
                            <input type="date" id="novoAdmissao" class="modern-input" required>
                        </div>
                        
                        <button type="submit" class="btn btn-success modern-btn-success">
                            <i class="fas fa-save"></i>
                            <span>Salvar Funcionário</span>
                        </button>
                    </form>
                </div>

                <!-- Barra de Pesquisa Limpa -->
                <div class="form-group modern-form-group">
                    <label class="modern-label">
                        <i class="fas fa-search"></i>
                        <span>Pesquisar Funcionário</span>
                    </label>
                    <input type="text" id="searchFuncionario" class="modern-input" 
                           onkeyup="filtrarFuncionarios()" 
                           placeholder="Digite o nome ou cargo para buscar...">
                </div>
                
                <!-- Lista de Funcionários -->
                <div id="listaFuncionariosContainer" class="mb-3">
                    <p class="text-center text-muted">Carregando funcionários...</p>
                </div>
                
                <!-- Botão de Cálculo -->
                <div class="button-center">
                    <button class="btn btn-primary modern-btn" onclick="calcularFolhaPagamento()">
                        <i class="fas fa-calculator"></i>
                        <span>Calcular Folha de Pagamento (Mês Atual)</span>
                    </button>
                </div>
                
                <div id="resultadoRH" class="mt-3 hidden"></div>
            </div>
        </div>
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
                console.log('✅ Funcionário salvo no Firebase');
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
    console.log('💾 Funcionário salvo no localStorage');
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
                
                console.log('✅ Funcionários carregados do Firebase:', funcionarios.length);
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
    
    console.log('💾 Funcionários carregados do localStorage:', funcionarios.length);
    return funcionarios;
}

function renderizarListaFuncionarios(lista) {
    const container = document.getElementById('listaFuncionariosContainer');
    
    if (lista.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Nenhum funcionário cadastrado.</p>';
        return;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px; margin-top: 15px;">';
    
    lista.forEach(func => {
        // Extrair apenas nome do cargo sem o valor
        const cargoNome = func.cargo.split('(')[0].trim();
        const cargoValor = func.cargo.match(/\((.+)\)/)?.[1] || '';
        
        // Definir cor do cargo
        let cargoCor = '#3b82f6';
        if (func.cargo.includes('Diretor')) cargoCor = '#8b5cf6';
        else if (func.cargo.includes('Gerente')) cargoCor = '#10b981';
        else if (func.cargo.includes('Supervisor')) cargoCor = '#f59e0b';
        else if (func.cargo.includes('Operário')) cargoCor = '#6366f1';
        
        // Calcular tempo de empresa
        const dataAdmissao = new Date(func.admissao + 'T00:00:00');
        const hoje = new Date();
        const diffTime = Math.abs(hoje - dataAdmissao);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const meses = Math.floor(diffDays / 30);
        const tempoEmpresa = meses > 0 ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : `${diffDays} dias`;
        
        html += `
            <div class="card" style="padding: 16px; background: white; border: 2px solid #e2e8f0; border-radius: 12px; transition: all 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 20px rgba(102,126,234,0.15)'; this.style.borderColor='${cargoCor}'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'; this.style.borderColor='#e2e8f0'">
                
                <!-- Cabeçalho do Card -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <h6 style="margin: 0 0 4px 0; color: #0f172a; font-size: 1.05rem; font-weight: 600;">
                            👤 ${func.nome}
                        </h6>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                            <span style="background: ${cargoCor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                ${cargoNome}
                            </span>
                            <span style="color: #64748b; font-size: 0.85rem; font-weight: 500;">
                                ${cargoValor}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Informações -->
                <div style="background: #f8fafc; padding: 10px; border-radius: 8px; margin: 12px 0; border-left: 3px solid ${cargoCor};">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <i class="fas fa-calendar-check" style="color: ${cargoCor}; width: 16px;"></i>
                        <span style="font-size: 0.85rem; color: #475569;">
                            <strong>Admissão:</strong> ${new Date(func.admissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-clock" style="color: ${cargoCor}; width: 16px;"></i>
                        <span style="font-size: 0.85rem; color: #475569;">
                            <strong>Na empresa:</strong> ${tempoEmpresa}
                        </span>
                    </div>
                </div>
                
                <!-- Horas Extras e Ações -->
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 12px;">
                    <div class="form-group mb-0" style="flex: 1;">
                        <label style="font-size: 0.8rem; margin-bottom: 4px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                            ⏰ Horas Extras (mês)
                        </label>
                        <input type="number" class="func-he-input" data-id="${func.id}" min="0" max="100" value="0" step="0.5" 
                               placeholder="0h"
                               style="padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; font-weight: 600; text-align: center; transition: all 0.3s; width: 100%;"
                               onfocus="this.style.borderColor='${cargoCor}'; this.style.boxShadow='0 0 0 3px rgba(102,126,234,0.1)'"
                               onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                    </div>
                    
                    <button class="btn btn-danger btn-sm" onclick="removerFuncionario('${func.id}')" 
                            title="Excluir Funcionário"
                            style="padding: 8px 12px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: none; border-radius: 6px; transition: all 0.3s; box-shadow: 0 2px 4px rgba(239,68,68,0.3);"
                            onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(239,68,68,0.4)'"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(239,68,68,0.3)'">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
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
                console.log('✅ Funcionário excluído do Firebase');
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
    console.log('💾 Funcionário excluído do localStorage');
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
            <tr style="transition: all 0.3s; cursor: pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                <td style="font-weight: bold; color: #667eea;">${idx + 1}</td>
                <td style="font-weight: 500;">${func.nome}</td>
                <td><span style="background: #e0e7ff; color: #4c51bf; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${func.cargo}</span></td>
                <td style="text-align: center; font-weight: bold; color: ${func.horasExtras > 0 ? '#f59e0b' : '#94a3b8'};">
                    ${func.horasExtras > 0 ? func.horasExtras + 'h' : '-'}
                </td>
                <td style="text-align: right;">${formatCurrency(func.salarioBase)}</td>
                <td style="text-align: right; color: ${func.valorHorasExtras > 0 ? '#16a34a' : '#94a3b8'};">
                    ${func.valorHorasExtras > 0 ? '+ ' + formatCurrency(func.valorHorasExtras) : '-'}
                </td>
                <td style="text-align: right; font-weight: bold; color: #0f172a; background: #f1f5f9;">${formatCurrency(func.salarioBruto)}</td>
                <td style="text-align: right; color: #dc2626;">- ${formatCurrency(func.inss)}</td>
                <td style="text-align: right; color: #dc2626;">- ${formatCurrency(func.ir)}</td>
                <td style="text-align: right; font-weight: bold; font-size: 1.05rem; color: #16a34a; background: #f0fdf4;">${formatCurrency(func.salarioLiquido)}</td>
            </tr>
        `;
    });
    
    const html = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                <h4 style="margin: 0;"><i class="fas fa-file-invoice"></i> Folha de Pagamento - ${data.mes}</h4>
                <button class="btn btn-danger btn-sm" onclick="exportarFolhaPDF()">
                    <i class="fas fa-file-pdf"></i> Exportar PDF
                </button>
            </div>
            
            <div class="table-container" style="overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px;">
                <table style="margin: 0;">
                    <thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <tr>
                            <th style="color: white;">#</th>
                            <th style="color: white; text-align: left;">👤 Nome</th>
                            <th style="color: white; text-align: left;">💼 Cargo</th>
                            <th style="color: white; text-align: center;">⏰ HE</th>
                            <th style="color: white; text-align: right;">💰 Base (220h)</th>
                            <th style="color: white; text-align: right;">⚡ Valor HE (+50%)</th>
                            <th style="color: white; text-align: right;">📊 Bruto</th>
                            <th style="color: white; text-align: right;">🏛️ INSS</th>
                            <th style="color: white; text-align: right;">🏦 IR</th>
                            <th style="color: white; text-align: right;">✅ Líquido</th>
                        </tr>
                    </thead>
                    <tbody style="background: white;">
                        ${tabelaHTML}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2563eb;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Total Bruto</p>
                        <h3 style="margin: 5px 0 0 0; color: #0f172a;">${formatCurrency(data.detalhes.reduce((sum, f) => sum + f.salarioBruto, 0))}</h3>
                    </div>
                    <div>
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
                    <li><strong>Horas Extras:</strong> Valor/hora × 1.5 (adicional de 50% por lei)</li>
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
        showToast('⚠️ Nenhuma folha calculada para exportar', 'warning');
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
        
        showToast('✅ PDF exportado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao exportar PDF:', error);
        showToast('❌ Erro ao exportar PDF', 'error');
    }
}
