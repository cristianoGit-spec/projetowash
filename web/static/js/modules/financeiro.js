// ============================================================================
// MÓDULO FINANCEIRO
// ============================================================================

function loadFinanceiroModule(container) {
    const html = `
        <div class="card">
            <div class="card-header">
                <i class="fas fa-chart-line"></i> Cálculo Financeiro
            </div>
            
            <form id="formFinanceiro" onsubmit="calcularFinanceiro(event)">
                <div class="financeiro-form-grid">
                    <div class="form-group">
                        <label for="agua"><i class="fas fa-water"></i> Conta de Água (R$)</label>
                        <input type="number" id="agua" name="agua" required min="0" step="0.01" placeholder="Ex: 1000.00">
                    </div>
                    
                    <div class="form-group">
                        <label for="luz"><i class="fas fa-lightbulb"></i> Conta de Luz (R$)</label>
                        <input type="number" id="luz" name="luz" required min="0" step="0.01" placeholder="Ex: 2500.00">
                    </div>

                    <div class="form-group">
                        <label for="impostos"><i class="fas fa-file-invoice-dollar"></i> Impostos (R$)</label>
                        <input type="number" id="impostos" name="impostos" required min="0" step="0.01" placeholder="Ex: 3000.00">
                    </div>
                    
                    <div class="form-group">
                        <label for="salarios"><i class="fas fa-money-bill-wave"></i> Salários (R$)</label>
                        <input type="number" id="salarios" name="salarios" required min="0" step="0.01" placeholder="Ex: 20000.00">
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="totalPallets"><i class="fas fa-boxes"></i> Total de Pallets/Mês</label>
                        <input type="number" id="totalPallets" name="totalPallets" required min="1" placeholder="Ex: 1000">
                    </div>
                </div>
                
                <button type="submit" class="btn btn-calcular">
                    <i class="fas fa-calculator"></i> Calcular Custos e Lucros
                </button>
            </form>
            
            <div id="resultadoFinanceiro" class="mt-3 hidden"></div>
        </div>
    `;
    
    container.innerHTML = html;
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
