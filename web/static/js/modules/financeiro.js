// ============================================================================
// MÓDULO FINANCEIRO - LAYOUT MODERNO v39
// ============================================================================

console.log('[MODULE] Módulo Financeiro v39 carregado');

function loadFinanceiroModule(container) {
    const html = `
        <div class="financeiro-module">
            <!-- Header Moderno com Gradiente -->
            <div class="modern-header">
                <div class="header-content">
                    <div class="header-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <h2>Módulo Financeiro</h2>
                        <p>Gestão de Custos e Lucros</p>
                    </div>
                </div>
            </div>

            <!-- Cards Principais -->
            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <!-- Card Lançamentos -->
                <div class="modern-card">
                    <div class="modern-body">
                        <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #1e40af;">
                            <i class="fas fa-exchange-alt"></i>
                            Lançamentos
                        </h3>
                        <form id="formLancamento" onsubmit="salvarLancamento(event)">
                            <div class="form-group">
                                <label><i class="fas fa-tag"></i> Tipo</label>
                                <select id="tipoLancamento" required style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                                    <option value="">Selecione...</option>
                                    <option value="receita">Receita</option>
                                    <option value="despesa">Despesa</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-dollar-sign"></i> Valor (R$)</label>
                                <input type="number" id="valorLancamento" step="0.01" min="0" required 
                                       placeholder="0,00" 
                                       style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-align-left"></i> Descrição</label>
                                <input type="text" id="descricaoLancamento" required 
                                       placeholder="Ex: Venda de produto X" 
                                       style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-calendar"></i> Data</label>
                                <input type="date" id="dataLancamento" required 
                                       style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                            </div>
                            <button type="submit" class="btn btn-primary" 
                                    style="width: 100%; padding: 12px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="fas fa-save"></i> Salvar Lançamento
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Card Resumo Financeiro -->
                <div class="modern-card">
                    <div class="modern-body">
                        <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #1e40af;">
                            <i class="fas fa-calculator"></i>
                            Resumo Financeiro
                        </h3>
                        <div class="info-grid" id="resumoFinanceiro">
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-arrow-up" style="color: #10b981;"></i> Total Receitas:</span>
                                <span class="info-value" style="color: #10b981; font-weight: 600;" id="totalReceitas">R$ 0,00</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-arrow-down" style="color: #ef4444;"></i> Total Despesas:</span>
                                <span class="info-value" style="color: #ef4444; font-weight: 600;" id="totalDespesas">R$ 0,00</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-balance-scale" style="color: #3b82f6;"></i> Saldo:</span>
                                <span class="info-value" style="color: #3b82f6; font-weight: 700; font-size: 18px;" id="saldoTotal">R$ 0,00</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-list"></i> Total de Lançamentos:</span>
                                <span class="info-value" id="totalLancamentos">0</span>
                            </div>
                        </div>
                        <div style="margin-top: 20px;">
                            <button onclick="calcularFluxoCaixa()" class="btn btn-secondary" 
                                    style="width: 100%; padding: 10px; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="fas fa-chart-bar"></i> Atualizar Resumo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alert de Informação -->
            <div class="simple-alert">
                <i class="fas fa-info-circle"></i>
                <span>Registre todas as receitas e despesas para acompanhar o fluxo de caixa da empresa.</span>
            </div>

            <!-- Histórico de Lançamentos -->
            <div class="modern-card" style="margin-top: 30px;">
                <div class="modern-body">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                        <h3 style="display: flex; align-items: center; gap: 10px; margin: 0; color: #1e40af;">
                            <i class="fas fa-history"></i>
                            Histórico de Lançamentos
                        </h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <select id="filtroTipo" onchange="filtrarLancamentos()" 
                                    style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
                                <option value="">Todos os tipos</option>
                                <option value="receita">Receitas</option>
                                <option value="despesa">Despesas</option>
                            </select>
                            <button onclick="limparHistorico()" class="btn btn-danger" 
                                    style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-trash"></i> Limpar Histórico
                            </button>
                        </div>
                    </div>
                    <div id="listaLancamentos" style="min-height: 200px;">
                        <!-- Lançamentos serão inseridos aqui via JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Definir data atual no campo de data
    document.getElementById('dataLancamento').valueAsDate = new Date();
    
    // Carregar lançamentos salvos
    carregarLancamentos();
}

// ============================================================================
// FUNÇÕES DE GERENCIAMENTO
// ============================================================================

function salvarLancamento(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('tipoLancamento').value;
    const valor = parseFloat(document.getElementById('valorLancamento').value);
    const descricao = document.getElementById('descricaoLancamento').value;
    const data = document.getElementById('dataLancamento').value;
    
    if (!tipo || !valor || !descricao || !data) {
        showToast('Preencha todos os campos', 'error');
        return;
    }
    
    const lancamento = {
        id: Date.now().toString(),
        tipo,
        valor,
        descricao,
        data,
        timestamp: new Date().toISOString()
    };
    
    // Salvar no localStorage
    let lancamentos = JSON.parse(localStorage.getItem('financeiro_lancamentos') || '[]');
    lancamentos.unshift(lancamento); // Adicionar no início
    localStorage.setItem('financeiro_lancamentos', JSON.stringify(lancamentos));
    
    console.log('[OK] Lançamento salvo:', lancamento);
    
    // Limpar formulário
    document.getElementById('formLancamento').reset();
    document.getElementById('dataLancamento').valueAsDate = new Date();
    
    // Recarregar lista
    carregarLancamentos();
    
    showToast('Lançamento registrado com sucesso!', 'success');
}

function carregarLancamentos() {
    const lancamentos = JSON.parse(localStorage.getItem('financeiro_lancamentos') || '[]');
    const lista = document.getElementById('listaLancamentos');
    const filtroTipo = document.getElementById('filtroTipo')?.value || '';
    
    // Filtrar lançamentos
    let lancamentosFiltrados = lancamentos;
    if (filtroTipo) {
        lancamentosFiltrados = lancamentos.filter(l => l.tipo === filtroTipo);
    }
    
    if (lancamentosFiltrados.length === 0) {
        lista.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
                <i class="fas fa-file-invoice-dollar" style="font-size: 64px; opacity: 0.3; margin-bottom: 20px;"></i>
                <h4 style="color: #6b7280; margin: 15px 0 8px 0;">Nenhum lançamento encontrado</h4>
                <p style="color: #9ca3af; margin: 0; font-size: 14px;">Registre receitas ou despesas para visualizar o histórico</p>
            </div>
        `;
    } else {
        lista.innerHTML = `
            <div class="info-grid">
                ${lancamentosFiltrados.map(lancamento => {
                    const isReceita = lancamento.tipo === 'receita';
                    const cor = isReceita ? '#10b981' : '#ef4444';
                    const icone = isReceita ? 'arrow-up' : 'arrow-down';
                    const sinal = isReceita ? '+' : '-';
                    
                    return `
                        <div class="info-row" style="padding: 15px; border-left: 4px solid ${cor}; background: ${isReceita ? '#f0fdf4' : '#fef2f2'};">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                    <i class="fas fa-${icone}" style="color: ${cor};"></i>
                                    <span style="font-weight: 600; color: #374151;">${lancamento.descricao}</span>
                                </div>
                                <div style="font-size: 13px; color: #6b7280;">
                                    <i class="fas fa-calendar"></i> ${new Date(lancamento.data).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 18px; font-weight: 700; color: ${cor};">
                                    ${sinal}R$ ${lancamento.valor.toFixed(2)}
                                </div>
                                <button onclick="excluirLancamento('${lancamento.id}')" 
                                        style="margin-top: 5px; padding: 4px 10px; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                    <i class="fas fa-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Atualizar resumo financeiro
    calcularFluxoCaixa();
}

function calcularFluxoCaixa() {
    const lancamentos = JSON.parse(localStorage.getItem('financeiro_lancamentos') || '[]');
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    lancamentos.forEach(lancamento => {
        if (lancamento.tipo === 'receita') {
            totalReceitas += lancamento.valor;
        } else {
            totalDespesas += lancamento.valor;
        }
    });
    
    const saldo = totalReceitas - totalDespesas;
    
    // Atualizar cards de resumo
    document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('totalDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
    document.getElementById('saldoTotal').textContent = `R$ ${saldo.toFixed(2)}`;
    document.getElementById('totalLancamentos').textContent = lancamentos.length;
    
    // Mudar cor do saldo baseado no valor
    const saldoElement = document.getElementById('saldoTotal');
    if (saldo > 0) {
        saldoElement.style.color = '#10b981';
    } else if (saldo < 0) {
        saldoElement.style.color = '#ef4444';
    } else {
        saldoElement.style.color = '#3b82f6';
    }
    
    console.log('[DATA] Fluxo de caixa calculado:', { totalReceitas, totalDespesas, saldo });
}

function filtrarLancamentos() {
    carregarLancamentos();
}

function excluirLancamento(id) {
    if (!confirm('Deseja realmente excluir este lançamento?')) {
        return;
    }
    
    let lancamentos = JSON.parse(localStorage.getItem('financeiro_lancamentos') || '[]');
    lancamentos = lancamentos.filter(l => l.id !== id);
    localStorage.setItem('financeiro_lancamentos', JSON.stringify(lancamentos));
    
    console.log('[OK] Lançamento excluído:', id);
    
    carregarLancamentos();
    showToast('Lançamento excluído com sucesso', 'success');
}

function limparHistorico() {
    if (!confirm('Deseja realmente limpar TODO o histórico de lançamentos? Esta ação não pode ser desfeita!')) {
        return;
    }
    
    localStorage.removeItem('financeiro_lancamentos');
    carregarLancamentos();
    
    console.log('[OK] Histórico financeiro limpo');
    showToast('Histórico limpo com sucesso', 'success');
}

// Expor funções globalmente
window.loadFinanceiroModule = loadFinanceiroModule;
window.salvarLancamento = salvarLancamento;
window.carregarLancamentos = carregarLancamentos;
window.calcularFluxoCaixa = calcularFluxoCaixa;
window.filtrarLancamentos = filtrarLancamentos;
window.excluirLancamento = excluirLancamento;
window.limparHistorico = limparHistorico;

console.log('[OK] Módulo Financeiro pronto!');
