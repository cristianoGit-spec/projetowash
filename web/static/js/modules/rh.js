// ============================================================================
// MÓDULO RH (SISTEMA HÍBRIDO - FIREBASE + LOCALSTORAGE)
// ============================================================================

let funcionariosCache = []; // Cache local para pesquisa e cálculo
let lastCalculatedFolha = null; // Cache para exportação PDF

function loadRHModule(container) {
    const html = `
        <div class="card">
            <div class="card-header">
                <i class="fas fa-users"></i> Gestão de RH e Folha de Pagamento
            </div>
            
            <!-- Formulário de Cadastro -->
            <div class="card mb-3" style="background: #f8f9fa; border: 1px solid #e9ecef;">
                <h5 class="mb-3"><i class="fas fa-user-plus"></i> Novo Funcionário</h5>
                <form id="formCadastroFuncionario" onsubmit="cadastrarFuncionario(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome Completo</label>
                            <input type="text" id="novoNome" required placeholder="Ex: João da Silva">
                        </div>
                        <div class="form-group">
                            <label>Cargo</label>
                            <select id="novoCargo" required>
                                <option value="">Selecione...</option>
                                <option value="Operário (R$ 15/h)">Operário (R$ 15/h)</option>
                                <option value="Supervisor (R$ 40/h)">Supervisor (R$ 40/h)</option>
                                <option value="Gerente (R$ 60/h)">Gerente (R$ 60/h)</option>
                                <option value="Diretor (R$ 80/h)">Diretor (R$ 80/h)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Admissão</label>
                            <input type="date" id="novoAdmissao" required>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-success btn-sm">
                        <i class="fas fa-save"></i> Salvar Funcionário
                    </button>
                </form>
            </div>

            <!-- Barra de Pesquisa -->
            <div class="form-group">
                <label><i class="fas fa-search"></i> Pesquisar Funcionário</label>
                <input type="text" id="searchFuncionario" onkeyup="filtrarFuncionarios()" placeholder="Digite o nome para buscar...">
            </div>
            
            <!-- Lista de Funcionários -->
            <div id="listaFuncionariosContainer" class="mb-3">
                <p class="text-center text-muted">Carregando funcionários...</p>
            </div>
            
            <div class="button-group">
                <button class="btn btn-primary" onclick="calcularFolhaPagamento()">
                    <i class="fas fa-calculator"></i> Calcular Folha (Mês Atual)
                </button>
            </div>
            
            <div id="resultadoRH" class="mt-3 hidden"></div>
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
    
    let html = '';
    lista.forEach(func => {
        html += `
            <div class="card mb-2 func-card" data-id="${func.id}" style="background: #fff; border-left: 4px solid #007bff;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <strong>${func.nome}</strong><br>
                        <small class="text-muted">${func.cargo} | Adm: ${func.admissao || 'N/A'}</small>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                        <div class="form-group mb-0" style="width: 120px;">
                            <label style="font-size: 0.8rem; margin-bottom: 0;">Horas Extras</label>
                            <input type="number" class="func-he-input" data-id="${func.id}" min="0" value="0" step="0.5" style="padding: 4px;">
                        </div>
                        
                        <button class="btn btn-danger btn-sm" onclick="removerFuncionario('${func.id}')" title="Excluir Funcionário">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
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
        let detalhes = [];
        
        // Horas normais por mês (220h = 40h/semana * 4.4 semanas)
        const horasNormais = 220;
        
        funcionariosCache.forEach(func => {
            const valorHora = tabelaValores[func.cargo] || 15;
            const horasExtras = mapHE[func.id] || 0;
            
            // Salário base
            const salarioBase = valorHora * horasNormais;
            
            // Horas extras (50% adicional)
            const valorHorasExtras = horasExtras * valorHora * 1.5;
            
            // Total
            const salarioTotal = salarioBase + valorHorasExtras;
            
            totalFolha += salarioTotal;
            
            detalhes.push({
                nome: func.nome,
                cargo: func.cargo,
                salarioBase: salarioBase,
                horasExtras: horasExtras,
                valorHorasExtras: valorHorasExtras,
                salarioTotal: salarioTotal
            });
        });
        
        // Armazenar resultado para exportação
        lastCalculatedFolha = {
            mes: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            data: new Date().toLocaleDateString('pt-BR'),
            detalhes: detalhes,
            totalFolha: totalFolha
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

function exibirResultadoRH(data) {
    const resultado = document.getElementById('resultadoRH');
    
    let tabelaHTML = '';
    data.detalhes.forEach((func, idx) => {
        tabelaHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${func.nome}</td>
                <td>${func.cargo}</td>
                <td>${func.horasExtras > 0 ? func.horasExtras + 'h' : '-'}</td>
                <td>${formatCurrency(func.salarioBase)}</td>
                <td>${formatCurrency(func.valorHorasExtras)}</td>
                <td><strong>${formatCurrency(func.salarioTotal)}</strong></td>
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
            
            <div class="table-container" style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nome</th>
                            <th>Cargo</th>
                            <th>Horas Extras</th>
                            <th>Salário Base</th>
                            <th>Valor HE (1.5x)</th>
                            <th>Total a Pagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tabelaHTML}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3 p-3" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h5 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-money-bill-wave"></i> Resumo da Folha</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <small style="opacity: 0.9;">Total de Funcionários</small>
                        <h4 style="margin: 5px 0; color: white;">${data.detalhes.length}</h4>
                    </div>
                    <div>
                        <small style="opacity: 0.9;">Total da Folha</small>
                        <h4 style="margin: 5px 0; color: white;">${formatCurrency(data.totalFolha)}</h4>
                    </div>
                    <div>
                        <small style="opacity: 0.9;">Data do Cálculo</small>
                        <h4 style="margin: 5px 0; color: white; font-size: 1rem;">${data.data}</h4>
                    </div>
                </div>
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
                formatCurrency(func.salarioTotal)
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
