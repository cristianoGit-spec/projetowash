// ============================================================================
// MÓDULO FINANCEIRO - LAYOUT MODERNO v31
// ============================================================================

function loadFinanceiroModule(container) {
    const html = `
        <div class="financeiro-module">
            <!-- Header -->
            <div class="welcome-header">
                <div>
                    <h2><i class="fas fa-chart-line"></i> Financeiro</h2>
                    <p>Gestão completa de receitas, despesas e fluxo de caixa.</p>
                </div>
            </div>

            <!-- Cards de Estatísticas Financeiras -->
            <div class="stats-grid" id="financeiroStats">
                <div class="stat-card blue">
                    <div class="stat-icon blue">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="saldoAtual">R$ 0,00</h3>
                        <p>Saldo Atual</p>
                    </div>
                </div>

                <div class="stat-card green">
                    <div class="stat-icon green">
                        <i class="fas fa-arrow-trend-up"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="receitasTotal">+R$ 0,00</h3>
                        <p>Receitas</p>
                    </div>
                </div>

                <div class="stat-card orange">
                    <div class="stat-icon orange">
                        <i class="fas fa-arrow-trend-down"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="despesasTotal">-R$ 0,00</h3>
                        <p>Despesas</p>
                    </div>
                </div>

                <div class="stat-card purple">
                    <div class="stat-icon purple">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="previsaoSaldo">R$ 0,00</h3>
                        <p>Previsão</p>
                    </div>
                </div>
            </div>

            <!-- Filtros e Busca -->
            <div class="financeiro-filters">
                <div class="filter-group">
                    <input type="text" id="searchTransacao" class="search-input" placeholder="🔍 Buscar transações...">
                </div>
                <div class="filter-group">
                    <select id="filterTipo" class="filter-select">
                        <option value="">Todos os tipos</option>
                        <option value="receita">Receitas</option>
                        <option value="despesa">Despesas</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select id="filterStatus" class="filter-select">
                        <option value="">Todos os status</option>
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>
                        <option value="vencido">Vencido</option>
                    </select>
                </div>
                <button onclick="abrirModalNovaTransacao()" class="btn-novo">
                    <i class="fas fa-plus"></i> Nova Transação
                </button>
            </div>

            <!-- Área de Transações -->
            <div class="chart-card">
                <h3><i class="fas fa-list"></i> Transações Recentes</h3>
                <div id="listaTransacoes" class="empty-state">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <h4>Nenhuma transação registrada</h4>
                    <p>Registre entradas ou saídas de valores para visualizar o histórico</p>
                    <button onclick="abrirModalNovaTransacao()" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Nova Transação
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal Nova Transação -->
        <div id="modalNovaTransacao" class="modal hidden">
            <div class="modal-content modal-medium">
                <div class="modal-header">
                    <h3><i class="fas fa-plus-circle"></i> Nova Transação</h3>
                    <button onclick="fecharModalNovaTransacao()" class="modal-close">&times;</button>
                </div>
                <form id="formNovaTransacao" onsubmit="salvarTransacao(event)">
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="tipoTransacao">
                                    <i class="fas fa-exchange-alt"></i> Tipo
                                </label>
                                <select id="tipoTransacao" required>
                                    <option value="">Selecione...</option>
                                    <option value="receita">💰 Receita</option>
                                    <option value="despesa">💸 Despesa</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="valorTransacao">
                                    <i class="fas fa-dollar-sign"></i> Valor (R$)
                                </label>
                                <input type="number" id="valorTransacao" step="0.01" min="0" required placeholder="0,00">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="descricaoTransacao">
                                <i class="fas fa-align-left"></i> Descrição
                            </label>
                            <input type="text" id="descricaoTransacao" required placeholder="Ex: Venda de produto X">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="categoriaTransacao">
                                    <i class="fas fa-tag"></i> Categoria
                                </label>
                                <select id="categoriaTransacao" required>
                                    <option value="">Selecione...</option>
                                    <option value="vendas">Vendas</option>
                                    <option value="servicos">Serviços</option>
                                    <option value="fornecedores">Fornecedores</option>
                                    <option value="salarios">Salários</option>
                                    <option value="impostos">Impostos</option>
                                    <option value="contas">Contas (água, luz)</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="dataTransacao">
                                    <i class="fas fa-calendar"></i> Data
                                </label>
                                <input type="date" id="dataTransacao" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="statusTransacao">
                                <i class="fas fa-check-circle"></i> Status
                            </label>
                            <select id="statusTransacao" required>
                                <option value="pago">✅ Pago/Recebido</option>
                                <option value="pendente">⏳ Pendente</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="fecharModalNovaTransacao()" class="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Salvar Transação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Definir data atual no campo de data
    document.getElementById('dataTransacao').valueAsDate = new Date();
    
    // Carregar transações salvas
    carregarTransacoes();
}

async function calcularFinanceiro(event) {
    event.preventDefault();
    
    const agua = parseFloat(document.getElementById('agua').value);
    const luz = parseFloat(document.getElementById('luz').value);
    const impostos = parseFloat(document.getElementById('impostos').value);
    const salarios = parseFloat(document.getElementById('salarios').value);
    const totalPallets = parseInt(document.getElementById('totalPallets').value);
    
    if (agua < 0 || luz < 0 || impostos < 0 || salarios < 0 || totalPallets <= 0) {
        showToast('Valores inválidos. Verifique os dados inseridos', 'error');
        return;
    }
    
    showLoading('Calculando...');
    
    try {
        const custoTotal = agua + luz + impostos + salarios;
        const custoPorPallet = custoTotal / totalPallets;
        const margemLucro = 0.50; // 50%
        const precoVenda = custoPorPallet * (1 + margemLucro);
        const lucroUnitario = precoVenda - custoPorPallet;
        
        const receitaMensal = precoVenda * totalPallets;
        const lucroMensal = lucroUnitario * totalPallets;
        const receitalAnual = receitaMensal * 12;
        const lucroAnual = lucroMensal * 12;
        
        const margemReal = (lucroMensal / receitaMensal * 100);
        const pontoEquilibrio = custoTotal / lucroUnitario;
        const roi = (lucroMensal / custoTotal * 100);
        
        const data = {
            custos: {
                agua: agua,
                luz: luz,
                impostos: impostos,
                salarios: salarios,
                total: custoTotal
            },
            precificacao: {
                custo_por_pallet: custoPorPallet,
                preco_venda: precoVenda,
                lucro_por_unidade: lucroUnitario,
                margem_lucro: 50
            },
            mensal: {
                receita: receitaMensal,
                lucro: lucroMensal,
                margem_real: margemReal
            },
            anual: {
                receita: receitalAnual,
                lucro: lucroAnual
            },
            indicadores: {
                ponto_equilibrio: Math.ceil(pontoEquilibrio),
                roi: roi
            }
        };
        
        exibirResultadoFinanceiro(data);
        showToast('Cálculo realizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao calcular:', error);
        showToast('Erro ao calcular financeiro', 'error');
    } finally {
        hideLoading();
    }
}

function exibirResultadoFinanceiro(data) {
    const resultado = document.getElementById('resultadoFinanceiro');
    
    const html = `
        <div class="card">
            <h4><i class="fas fa-chart-pie"></i> Relatório Financeiro</h4>
            
            <h5 class="mt-3"> Custos Mensais</h5>
            <div class="table-container">
                <table>
                    <tr>
                        <td>Água:</td>
                        <td>${formatCurrency(data.custos.agua)}</td>
                    </tr>
                    <tr>
                        <td>Luz:</td>
                        <td>${formatCurrency(data.custos.luz)}</td>
                    </tr>
                    <tr>
                        <td>Impostos:</td>
                        <td>${formatCurrency(data.custos.impostos)}</td>
                    </tr>
                    <tr>
                        <td>Salários:</td>
                        <td>${formatCurrency(data.custos.salarios)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #f0f0f0;">
                        <td>TOTAL:</td>
                        <td>${formatCurrency(data.custos.total)}</td>
                    </tr>
                </table>
            </div>
            
            <h5 class="mt-3"> Precificação</h5>
            <div class="table-container">
                <table>
                    <tr>
                        <td>Custo por Pallet:</td>
                        <td>${formatCurrency(data.precificacao.custo_por_pallet)}</td>
                    </tr>
                    <tr>
                        <td>Preço de Venda:</td>
                        <td>${formatCurrency(data.precificacao.preco_venda)}</td>
                    </tr>
                    <tr>
                        <td>Lucro por Unidade:</td>
                        <td>${formatCurrency(data.precificacao.lucro_por_unidade)}</td>
                    </tr>
                    <tr>
                        <td>Margem de Lucro:</td>
                        <td>${data.precificacao.margem_lucro}%</td>
                    </tr>
                </table>
            </div>
            
            <h5 class="mt-3"> Projeções</h5>
            <div class="table-container">
                <table>
                    <tr>
                        <td><strong>Receita Mensal:</strong></td>
                        <td><strong>${formatCurrency(data.mensal.receita)}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Lucro Mensal:</strong></td>
                        <td><strong>${formatCurrency(data.mensal.lucro)}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Receita Anual:</strong></td>
                        <td><strong>${formatCurrency(data.anual.receita)}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Lucro Anual:</strong></td>
                        <td><strong>${formatCurrency(data.anual.lucro)}</strong></td>
                    </tr>
                </table>
            </div>
            
            <h5 class="mt-3"> Indicadores</h5>
            <div class="table-container">
                <table>
                    <tr>
                        <td>Ponto de Equilíbrio:</td>
                        <td>${formatNumber(data.indicadores.ponto_equilibrio)} pallets/mês</td>
                    </tr>
                    <tr>
                        <td>ROI (Retorno):</td>
                        <td>${data.indicadores.roi.toFixed(2)}%</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
}
