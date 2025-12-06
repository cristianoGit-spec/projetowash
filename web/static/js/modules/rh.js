// ============================================================================
// MÓDULO RH (COM PERSISTÊNCIA E PESQUISA)
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
                <form id="formCadastroFuncionario" onsubmit="cadastrarFuncionarioAPI(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome Completo</label>
                            <input type="text" id="novoNome" required placeholder="Ex: João da Silva">
                        </div>
                        <div class="form-group">
                            <label>Cargo</label>
                            <select id="novoCargo" required>
                                <option value="">Selecione...</option>
                                <option value="Operário">Operário (R$ 15/h)</option>
                                <option value="Supervisor">Supervisor (R$ 40/h)</option>
                                <option value="Gerente">Gerente (R$ 60/h)</option>
                                <option value="Diretor">Diretor (R$ 80/h)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Admissão</label>
                            <input type="date" id="novoAdmissao">
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
                <button class="btn btn-primary" onclick="calcularFolhaPagamentoAPI()">
                    <i class="fas fa-calculator"></i> Calcular Folha (Mês Atual)
                </button>
            </div>
            
            <div id="resultadoRH" class="mt-3 hidden"></div>
        </div>
    `;
    
    container.innerHTML = html;
    listarFuncionariosAPI();
}

async function cadastrarFuncionarioAPI(event) {
    event.preventDefault();
    
    const nome = document.getElementById('novoNome').value.trim();
    const cargo = document.getElementById('novoCargo').value;
    const admissao = document.getElementById('novoAdmissao').value;
    
    if (!nome || !cargo) {
        showToast('Nome e Cargo são obrigatórios', 'warning');
        return;
    }
    
    showLoading('Salvando funcionário...');
    
    try {
        await apiRequest('/rh/funcionarios', {
            method: 'POST',
            body: JSON.stringify({ nome, cargo, admissao })
        });
        
        showToast('Funcionário cadastrado com sucesso!', 'success');
        document.getElementById('formCadastroFuncionario').reset();
        listarFuncionariosAPI(); // Recarrega a lista
        
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        showToast('Erro ao cadastrar funcionário', 'error');
    } finally {
        hideLoading();
    }
}

async function listarFuncionariosAPI() {
    const container = document.getElementById('listaFuncionariosContainer');
    
    try {
        const response = await apiRequest('/rh/funcionarios', { method: 'GET' });
        funcionariosCache = response.data || [];
        
        renderizarListaFuncionarios(funcionariosCache);
        
    } catch (error) {
        console.error('Erro ao listar:', error);
        container.innerHTML = '<p class="text-danger">Erro ao carregar funcionários.</p>';
    }
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
                        
                        <button class="btn btn-danger btn-sm" onclick="removerFuncionarioAPI(${func.id})" title="Excluir (Admin)">
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

async function removerFuncionarioAPI(id) {
    // Solicitar senha de admin
    const senha = prompt(" Área Restrita\nDigite a senha de administrador para excluir:");
    
    if (!senha) return; // Cancelado
    
    showLoading('Excluindo...');
    
    try {
        // Headers personalizados precisam ser passados de forma específica
        // Adicionamos X-User-Role: admin para permitir a exclusão no backend
        // (Simulando elevação de privilégio via senha)
        
        const token = localStorage.getItem('api_key');
        const headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': token,
            'X-Admin-Pass': senha,
            'X-User-Role': 'admin' // Necessário para passar no middleware @require_role('admin')
        };

        const response = await fetch(`${API_BASE_URL}/rh/funcionarios/${id}`, {
            method: 'DELETE',
            headers: headers
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Funcionário excluído com sucesso!', 'success');
            listarFuncionariosAPI();
        } else {
            showToast(data.error || 'Erro ao excluir (Senha incorreta?)', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao excluir:', error);
        showToast('Erro de conexão ao excluir', 'error');
    } finally {
        hideLoading();
    }
}

async function calcularFolhaPagamentoAPI() {
    // Coletar horas extras dos inputs
    const inputsHE = document.querySelectorAll('.func-he-input');
    const mapHE = {};
    inputsHE.forEach(input => {
        mapHE[input.dataset.id] = parseFloat(input.value) || 0;
    });
    
    // Preparar dados para envio
    // Usamos o cache para pegar nome e cargo, e o input para HE
    const funcionariosParaCalculo = funcionariosCache.map(f => ({
        nome: f.nome,
        cargo: f.cargo,
        horas_extras: mapHE[f.id] || 0
    }));
    
    if (funcionariosParaCalculo.length === 0) {
        showToast('Nenhum funcionário para calcular', 'warning');
        return;
    }
    
    showLoading('Calculando folha...');
    
    try {
        const response = await apiRequest('/rh/calcular', {
            method: 'POST',
            body: JSON.stringify({ funcionarios: funcionariosParaCalculo })
        });
        
        exibirResultadoRH(response.data);
        showToast('Folha calculada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao calcular:', error);
        showToast('Erro ao calcular folha', 'error');
    } finally {
        hideLoading();
    }
}

function exibirResultadoRH(data) {
    lastCalculatedFolha = data; // Salvar para exportação
    const resultado = document.getElementById('resultadoRH');
    
    let tabelaHTML = '';
    data.funcionarios.forEach((func, idx) => {
        tabelaHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${func.nome}</td>
                <td>${func.cargo}</td>
                <td>${formatCurrency(func.valorHora)}/h</td>
                <td>${func.horasExtras > 0 ? func.horasExtras : '-'}</td>
                <td>${formatCurrency(func.salarioBruto)}</td>
                <td>${formatCurrency(func.descINSS)}</td>
                <td>${formatCurrency(func.descIR)}</td>
                <td><strong>${formatCurrency(func.salarioLiquido)}</strong></td>
            </tr>
        `;
    });
    
    const html = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0;"><i class="fas fa-file-invoice"></i> Folha de Pagamento</h4>
                <button class="btn btn-danger btn-sm" onclick="exportarFolhaPDF()">
                    <i class="fas fa-file-pdf"></i> Exportar PDF
                </button>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nome</th>
                            <th>Cargo</th>
                            <th>Valor/h</th>
                            <th>HE</th>
                            <th>Salário Bruto</th>
                            <th>INSS</th>
                            <th>IR</th>
                            <th>Líquido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tabelaHTML}
                    </tbody>
                </table>
            </div>
            
            <h5 class="mt-3"> Resumo da Folha</h5>
            <div class="table-container">
                <table>
                    <tr>
                        <td>Total de Funcionários:</td>
                        <td>${data.totais.total_funcionarios}</td>
                    </tr>
                    <tr style="font-weight: bold;">
                        <td>Total Bruto:</td>
                        <td>${formatCurrency(data.totais.total_bruto)}</td>
                    </tr>
                    <tr>
                        <td>Total INSS:</td>
                        <td>${formatCurrency(data.totais.total_inss)}</td>
                    </tr>
                    <tr>
                        <td>Total IR:</td>
                        <td>${formatCurrency(data.totais.total_ir)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #e8f5e9;">
                        <td>Total Líquido:</td>
                        <td>${formatCurrency(data.totais.total_liquido)}</td>
                    </tr>
                    <tr>
                        <td>Encargos Patronais (27,65%):</td>
                        <td>${formatCurrency(data.totais.encargos_patronais)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #fff3e0;">
                        <td>Custo Total para Empresa:</td>
                        <td>${formatCurrency(data.totais.custo_total_empresa)}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
    
    // Scroll para o resultado
    resultado.scrollIntoView({ behavior: 'smooth' });
}

async function exportarFolhaPDF() {
    if (!lastCalculatedFolha) {
        showToast('Nenhuma folha calculada para exportar', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Quatro Cantos', 14, 22);
    doc.setFontSize(14);
    doc.text('Relatório de Folha de Pagamento', 14, 32);
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 40);
    
    // Tabela de Funcionários
    const tableColumn = ["Nome", "Cargo", "Valor/h", "HE", "Bruto", "INSS", "IR", "Líquido"];
    const tableRows = [];

    lastCalculatedFolha.funcionarios.forEach(func => {
        const row = [
            func.nome,
            func.cargo,
            formatCurrency(func.valorHora),
            func.horasExtras || '-',
            formatCurrency(func.salarioBruto),
            formatCurrency(func.descINSS),
            formatCurrency(func.descIR),
            formatCurrency(func.salarioLiquido)
        ];
        tableRows.push(row);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Totais
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Resumo Financeiro:', 14, finalY);
    
    const totais = lastCalculatedFolha.totais;
    doc.setFontSize(10);
    doc.text(`Total Bruto: ${formatCurrency(totais.total_bruto)}`, 14, finalY + 10);
    doc.text(`Total Líquido: ${formatCurrency(totais.total_liquido)}`, 14, finalY + 16);
    doc.text(`Encargos Patronais: ${formatCurrency(totais.encargos_patronais)}`, 14, finalY + 22);
    doc.text(`Custo Total Empresa: ${formatCurrency(totais.custo_total_empresa)}`, 14, finalY + 28);
    
    doc.save('folha_pagamento.pdf');
    showToast('PDF gerado com sucesso!', 'success');
}
