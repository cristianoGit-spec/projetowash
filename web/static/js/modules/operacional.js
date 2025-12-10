/**
 * MÓDULO OPERACIONAL - v40.16
 * Capacidade de Produção com integração total ao sistema
 * Layout profissional seguindo padrão PrescrMed
 */

console.log('[MODULE] Módulo Operacional v40.16 carregado');

// ========================================
// HELPER FUNCTIONS
// ========================================

function mostrarToastOP(mensagem, tipo = 'info') {
    if (typeof mostrarToast === 'function') {
        mostrarToast(mensagem, tipo);
        return;
    }
    console.log(`[TOAST-OP ${tipo.toUpperCase()}]: ${mensagem}`);
}

function showLoadingOP(message = 'Carregando...') {
    if (typeof showLoading === 'function') {
        showLoading(message);
    }
}

function hideLoadingOP() {
    if (typeof hideLoading === 'function') {
        hideLoading();
    }
}

// ========================================
// CARREGAMENTO DO MÓDULO
// ========================================

async function loadOperacionalModule(container) {
    const html = `
        <div style="max-width: 1400px; margin: 0 auto;">
            <!-- Header -->
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #6b7280; font-size: 0.875rem; margin-bottom: 0.75rem;">
                    <i class="fas fa-home"></i>
                    <i class="fas fa-chevron-right" style="font-size: 0.625rem;"></i>
                    <span>Módulo Operacional</span>
                </div>
                <h2 style="font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 0;">Capacidade de Produção</h2>
            </div>

            <!-- Card de Configuração -->
            <div style="background: white; border: 2px solid #f3f4f6; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                <!-- Header do Card -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-calculator" style="color: white; font-size: 1.75rem;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.5rem; font-weight: 600; color: white; margin: 0;">
                                Cálculo de Capacidade de Produção
                            </h3>
                            <p style="color: rgba(255,255,255,0.9); font-size: 0.875rem; margin: 0.25rem 0 0 0;">Configure os turnos para análise operacional</p>
                        </div>
                    </div>
                </div>
                
                <!-- Form -->
                <div style="padding: 2rem;">
                    <form id="formOperacional" onsubmit="calcularOperacional(event)">
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #0f172a; margin-bottom: 0.625rem;">
                                <i class="fas fa-clock" style="color: #3b82f6; font-size: 0.875rem;"></i>
                                Número de Turnos Ativos
                            </label>
                            <select id="turnos" 
                                    name="turnos" 
                                    required 
                                    style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9375rem; color: #0f172a; transition: all 0.2s ease; background: #f9fafb; cursor: pointer;"
                                    onfocus="this.style.borderColor='#3b82f6'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                                    onblur="this.style.borderColor='#e5e7eb'; this.style.background='#f9fafb'; this.style.boxShadow='none'">
                                <option value="">Selecione o número de turnos...</option>
                                <option value="1">1 Turno (Manhã ou Tarde ou Noite - 24h)</option>
                                <option value="2">2 Turnos (Manhã + Tarde ou Manhã + Noite - 24h)</option>
                                <option value="3">3 Turnos (Manhã + Tarde + Noite - 24h)</option>
                            </select>
                            <p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.5rem; margin-left: 0.25rem;">
                                <i class="fas fa-info-circle" style="font-size: 0.625rem; margin-right: 0.25rem;"></i>
                                Cada turno tem 8 horas de operação
                            </p>
                        </div>
                        
                        <button type="submit" 
                                style="width: 100%; padding: 0.875rem 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 8px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px -2px rgba(59, 130, 246, 0.4)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(59, 130, 246, 0.3)'">
                            <i class="fas fa-calculator"></i>
                            Calcular Capacidade
                        </button>
                    </form>
                </div>
            </div>

            <!-- Resultado -->
            <div id="resultadoOperacional"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ========================================
// CÁLCULO DE CAPACIDADE
// ========================================

async function calcularOperacional(event) {
    event.preventDefault();
    
    const turnos = parseInt(document.getElementById('turnos').value);
    
    if (!turnos || turnos < 1 || turnos > 3) {
        mostrarToastOP('❌ Selecione um número válido de turnos', 'error');
        return;
    }
    
    showLoadingOP('Calculando capacidade de produção...');
    
    try {
        // Buscar dados reais do estoque
        let totalProdutos = 0;
        let itensEstoque = 0;
        let valorEstoque = 0;
        let vendasMes = 0;
        
        try {
            if (typeof obterDadosEstoque === 'function') {
                const produtos = await obterDadosEstoque();
                totalProdutos = produtos.length;
                itensEstoque = produtos.reduce((sum, p) => sum + (p.quantidade || 0), 0);
                valorEstoque = produtos.reduce((sum, p) => sum + ((p.quantidade || 0) * (p.valor || 0)), 0);
            }
            
            if (typeof obterHistoricoMovimentacoes === 'function') {
                const movimentacoes = await obterHistoricoMovimentacoes();
                const inicioMes = new Date();
                inicioMes.setDate(1);
                inicioMes.setHours(0, 0, 0, 0);
                
                const vendasDoMes = movimentacoes.filter(m => {
                    if (m.tipo !== 'saida') return false;
                    const dataMovimentacao = m.data?.toDate ? m.data.toDate() : new Date(m.data);
                    return dataMovimentacao >= inicioMes;
                });
                
                vendasMes = vendasDoMes.reduce((sum, v) => sum + (v.valorVenda || 0), 0);
            }
        } catch (error) {
            console.warn('[OP] Erro ao buscar dados do sistema:', error);
        }
        
        // Cálculos de capacidade
        const capacidade_por_turno = 1666; // unidades por turno (padrão da empresa)
        const dias_mes = 22; // dias úteis
        const horas_por_turno = 8;
        
        const capacidade_diaria = capacidade_por_turno * turnos;
        const capacidade_mensal = capacidade_diaria * dias_mes;
        const capacidade_anual = capacidade_mensal * 12;
        const capacidade_maxima = capacidade_por_turno * 3;
        const capacidade_ociosa = capacidade_maxima - capacidade_diaria;
        const percentual_uso = (capacidade_diaria / capacidade_maxima) * 100;
        
        const data = {
            turnos: turnos,
            capacidade_por_turno: capacidade_por_turno,
            capacidade_diaria: capacidade_diaria,
            capacidade_mensal: capacidade_mensal,
            capacidade_anual: capacidade_anual,
            capacidade_maxima: capacidade_maxima,
            capacidade_ociosa: capacidade_ociosa,
            percentual_uso: parseFloat(percentual_uso.toFixed(2)),
            horas_por_turno: horas_por_turno,
            horas_dia: horas_por_turno * turnos,
            // Dados reais do sistema
            totalProdutos: totalProdutos,
            itensEstoque: itensEstoque,
            valorEstoque: valorEstoque,
            vendasMes: vendasMes
        };
        
        exibirResultadoOperacional(data);
        mostrarToastOP('✅ Cálculo realizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('[ERROR] Erro ao calcular:', error);
        mostrarToastOP('❌ Erro ao calcular capacidade', 'error');
    } finally {
        hideLoadingOP();
    }
}

// ========================================
// EXIBIÇÃO DE RESULTADOS
// ========================================

function exibirResultadoOperacional(data) {
    const resultado = document.getElementById('resultadoOperacional');
    
    const html = `
        <!-- Cards de Estatísticas do Sistema -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <!-- Total de Produtos -->
            <div style="background: white; border: 2px solid #e5e7eb; border-left: 4px solid #3b82f6; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease;"
                 onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.15)'"
                 onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-boxes" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="color: #6b7280; font-size: 0.8125rem; margin-bottom: 0.25rem; font-weight: 500;">Total de Produtos</div>
                        <div style="font-size: 2rem; font-weight: 700; color: #0f172a; line-height: 1;">${formatNumber(data.totalProdutos)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Itens em Estoque -->
            <div style="background: white; border: 2px solid #e5e7eb; border-left: 4px solid #06b6d4; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease;"
                 onmouseover="this.style.borderColor='#06b6d4'; this.style.boxShadow='0 4px 12px rgba(6, 182, 212, 0.15)'"
                 onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-cubes" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="color: #6b7280; font-size: 0.8125rem; margin-bottom: 0.25rem; font-weight: 500;">Itens em Estoque</div>
                        <div style="font-size: 2rem; font-weight: 700; color: #0f172a; line-height: 1;">${formatNumber(data.itensEstoque)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Valor em Estoque -->
            <div style="background: white; border: 2px solid #e5e7eb; border-left: 4px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease;"
                 onmouseover="this.style.borderColor='#8b5cf6'; this.style.boxShadow='0 4px 12px rgba(139, 92, 246, 0.15)'"
                 onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-dollar-sign" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="color: #6b7280; font-size: 0.8125rem; margin-bottom: 0.25rem; font-weight: 500;">Valor em Estoque</div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: #0f172a; line-height: 1;">${formatCurrency(data.valorEstoque)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Vendas do Mês -->
            <div style="background: white; border: 2px solid #e5e7eb; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease;"
                 onmouseover="this.style.borderColor='#0ea5e9'; this.style.boxShadow='0 4px 12px rgba(14, 165, 233, 0.15)'"
                 onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-chart-line" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="color: #6b7280; font-size: 0.8125rem; margin-bottom: 0.25rem; font-weight: 500;">Vendas do Mês</div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: #0f172a; line-height: 1;">${formatCurrency(data.vendasMes)}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Card de Análise -->
        <div style="background: white; border: 2px solid #f3f4f6; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: #f9fafb; padding: 1.25rem; border-bottom: 2px solid #e5e7eb;">
                <h3 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line" style="color: #3b82f6;"></i>
                    Análise de Capacidade - ${data.turnos} Turno${data.turnos > 1 ? 's' : ''}
                </h3>
            </div>
            
            <!-- Body -->
            <div style="padding: 2rem;">
                <!-- Detalhes da Capacidade -->
                <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h4 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0 0 1.25rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                        Detalhes da Análise
                    </h4>
                    
                    <div style="display: grid; gap: 0.75rem;">
                        <!-- Capacidade Diária -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-size: 0.9375rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-calendar-day" style="color: #3b82f6; font-size: 0.875rem;"></i>
                                Capacidade Diária
                            </span>
                            <span style="font-weight: 700; color: #0f172a; font-size: 1rem;">${formatNumber(data.capacidade_diaria)} unidades</span>
                        </div>
                        
                        <!-- Capacidade Mensal -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-size: 0.9375rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-calendar-alt" style="color: #06b6d4; font-size: 0.875rem;"></i>
                                Capacidade Mensal (${data.turnos === 1 ? '3 turnos' : data.turnos + ' turnos'})
                            </span>
                            <span style="font-weight: 700; color: #0f172a; font-size: 1rem;">${formatNumber(data.capacidade_mensal)} unidades</span>
                        </div>
                        
                        <!-- Capacidade Anual -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-size: 0.9375rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-calendar" style="color: #8b5cf6; font-size: 0.875rem;"></i>
                                Capacidade Anual
                            </span>
                            <span style="font-weight: 700; color: #0f172a; font-size: 1rem;">${formatNumber(data.capacidade_anual)} unidades</span>
                        </div>
                        
                        <!-- Capacidade Máxima -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-size: 0.9375rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-cogs" style="color: #10b981; font-size: 0.875rem;"></i>
                                Capacidade Máxima (3 turnos)
                            </span>
                            <span style="font-weight: 700; color: #10b981; font-size: 1rem;">${formatNumber(data.capacidade_maxima)} unidades/dia</span>
                        </div>
                        
                        <!-- Capacidade Ociosa -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: ${data.capacidade_ociosa > 0 ? '#fef3c7' : '#d1fae5'}; border-radius: 8px; border: 2px solid ${data.capacidade_ociosa > 0 ? '#fbbf24' : '#10b981'};">
                            <span style="color: ${data.capacidade_ociosa > 0 ? '#92400e' : '#065f46'}; font-size: 0.9375rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-chart-bar" style="font-size: 0.875rem;"></i>
                                Capacidade Ociosa
                            </span>
                            <span style="font-weight: 700; color: ${data.capacidade_ociosa > 0 ? '#92400e' : '#065f46'}; font-size: 1.125rem;">${formatNumber(data.capacidade_ociosa)} unidades/dia</span>
                        </div>
                        
                        <!-- Horas de Operação -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-size: 0.9375rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-business-time" style="color: #0ea5e9; font-size: 0.875rem;"></i>
                                Horas de Operação
                            </span>
                            <span style="font-weight: 700; color: #0f172a; font-size: 1rem;">${data.horas_dia}h/dia (${data.horas_por_turno}h/turno)</span>
                        </div>
                    </div>
                </div>
                
                <!-- Alert de Status -->
                ${data.percentual_uso < 100 ? 
                    `<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 1.25rem; display: flex; align-items: start; gap: 1rem;">
                        <div style="width: 48px; height: 48px; background: rgba(245, 158, 11, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 1.25rem; color: #f59e0b;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="color: #92400e; font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem 0;">
                                Atenção: Existe capacidade ociosa de ${formatNumber(data.capacidade_ociosa)} unidades/dia
                            </h4>
                            <p style="color: #92400e; font-size: 0.875rem; margin: 0; line-height: 1.5;">
                                Percentual de uso atual: <strong>${data.percentual_uso}%</strong><br>
                                <em>Considere aumentar o número de turnos para maximizar a capacidade produtiva.</em>
                            </p>
                        </div>
                    </div>` : 
                    `<div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-left: 4px solid #059669; border-radius: 12px; padding: 1.25rem; display: flex; align-items: start; gap: 1rem;">
                        <div style="width: 48px; height: 48px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-check-circle" style="font-size: 1.25rem; color: #10b981;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="color: #065f46; font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem 0;">
                                Excelente! A fábrica está operando em capacidade MÁXIMA (100%)!
                            </h4>
                            <p style="color: #065f46; font-size: 0.875rem; margin: 0; line-height: 1.5;">
                                Todos os ${data.turnos} turnos estão ativos e a produção está otimizada.
                            </p>
                        </div>
                    </div>`
                }
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    
    // Scroll suave para o resultado
    setTimeout(() => {
        resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

console.log('[OK] Módulo Operacional pronto e integrado!');

