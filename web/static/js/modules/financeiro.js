// ============================================================================
// MÓDULO FINANCEIRO - LAYOUT MODERNO v39
// ============================================================================

console.log('[MODULE] Módulo Financeiro v39 carregado');

function loadFinanceiroModule(container) {
    const html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 1.25rem; border-bottom: 1px solid #f3f4f6;">
                <h3 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line" style="color: #10b981; font-size: 0.875rem;"></i>
                    Módulo Financeiro
                </h3>
                <p style="color: #6b7280; font-size: 0.8125rem; margin: 0;">Gestão de Custos e Lucros</p>
            </div>

            <!-- Content -->
            <div style="padding: 1.5rem;">
                <!-- Grid: Lançamentos + Resumo -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
                    <!-- Card Lançamentos -->
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem;">
                        <h4 style="font-size: 0.9375rem; font-weight: 600; color: #0f172a; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-exchange-alt" style="color: #3b82f6; font-size: 0.875rem;"></i>
                            Lançamentos
                        </h4>
                        <form id="formLancamento" onsubmit="salvarLancamento(event)">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-tag" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Tipo
                                </label>
                                <select id="tipoLancamento" required 
                                        style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                                        onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                                        onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                                    <option value="">Selecione...</option>
                                    <option value="receita">Receita</option>
                                    <option value="despesa">Despesa</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-dollar-sign" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Valor (R$)
                                </label>
                                <input type="number" id="valorLancamento" step="0.01" min="0" required placeholder="0,00"
                                       style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                                       onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                                       onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-align-left" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Descrição
                                </label>
                                <input type="text" id="descricaoLancamento" required placeholder="Ex: Venda de produto X"
                                       style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                                       onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                                       onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                            </div>
                            <div style="margin-bottom: 1.25rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                                    <i class="fas fa-calendar" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Data
                                </label>
                                <input type="date" id="dataLancamento" required
                                       style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                                       onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                                       onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                            </div>
                            <button type="submit" 
                                    style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease;"
                                    onmouseover="this.style.background='#2563eb'"
                                    onmouseout="this.style.background='#3b82f6'">
                                <i class="fas fa-save"></i> Salvar Lançamento
                            </button>
                        </form>
                    </div>

                    <!-- Card Resumo -->
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem;">
                        <h4 style="font-size: 0.9375rem; font-weight: 600; color: #0f172a; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-calculator" style="color: #8b5cf6; font-size: 0.875rem;"></i>
                            Resumo Financeiro
                        </h4>
                        <div id="resumoFinanceiro" style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem;">
                                <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-arrow-up" style="color: #10b981; font-size: 0.75rem;"></i>
                                    Total Receitas:
                                </span>
                                <span style="font-weight: 600; color: #10b981; font-size: 0.875rem;" id="totalReceitas">R$ 0,00</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem;">
                                <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-arrow-down" style="color: #ef4444; font-size: 0.75rem;"></i>
                                    Total Despesas:
                                </span>
                                <span style="font-weight: 600; color: #ef4444; font-size: 0.875rem;" id="totalDespesas">R$ 0,00</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                                <span style="color: #0f172a; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-balance-scale" style="color: #3b82f6; font-size: 0.75rem;"></i>
                                    Saldo:
                                </span>
                                <span style="font-weight: 700; color: #3b82f6; font-size: 1.125rem;" id="saldoTotal">R$ 0,00</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem;">
                                <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-list" style="color: #6b7280; font-size: 0.75rem;"></i>
                                    Total de Lançamentos:
                                </span>
                                <span style="font-weight: 600; color: #0f172a; font-size: 0.875rem;" id="totalLancamentos">0</span>
                            </div>
                        </div>
                        <button onclick="calcularFluxoCaixa()" 
                                style="width: 100%; margin-top: 1rem; padding: 0.625rem; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease;"
                                onmouseover="this.style.background='#f9fafb'; this.style.borderColor='#9ca3af'"
                                onmouseout="this.style.background='white'; this.style.borderColor='#d1d5db'">
                            <i class="fas fa-chart-bar"></i> Atualizar Resumo
                        </button>
                    </div>
                </div>

                <!-- Alert -->
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                    <i class="fas fa-info-circle" style="color: #3b82f6; font-size: 1.25rem;"></i>
                    <span style="color: #1e40af; font-size: 0.875rem;">Registre todas as receitas e despesas para acompanhar o fluxo de caixa da empresa.</span>
                </div>

                <!-- Histórico -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                        <h4 style="font-size: 0.9375rem; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-history" style="color: #8b5cf6; font-size: 0.875rem;"></i>
                            Histórico de Lançamentos
                        </h4>
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                            <select id="filtroTipo" onchange="filtrarLancamentos()" 
                                    style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; background: white; color: #374151;">
                                <option value="">Todos os tipos</option>
                                <option value="receita">Receitas</option>
                                <option value="despesa">Despesas</option>
                            </select>
                            <button onclick="limparHistorico()" 
                                    style="padding: 0.5rem 0.75rem; background: #ef4444; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.375rem; transition: all 0.2s ease;"
                                    onmouseover="this.style.background='#dc2626'"
                                    onmouseout="this.style.background='#ef4444'">
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
