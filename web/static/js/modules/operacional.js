// ============================================================================
// MÓDULO OPERACIONAL - v39
// ============================================================================

console.log('[MODULE] Módulo Operacional v39 carregado');

function loadOperacionalModule(container) {
    const html = `
        <div class="operacional-module">
            <!-- Header com Breadcrumb -->
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-industry"></i>
                    <span>Módulo Operacional</span>
                </div>
                <h2 style="font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 0;">Capacidade de Produção</h2>
            </div>

            <!-- Card Principal com estilo PrescrMed -->
            <div class="card" style="margin-bottom: 2rem;">
                <div class="card-header" style="background: white; border-bottom: 1px solid #f1f5f9;">
                    <h3 style="display: flex; align-items: center; gap: 10px; margin: 0; color: #0f172a; font-size: 1.125rem; font-weight: 600;">
                        <i class="fas fa-calculator" style="color: #3b82f6;"></i>
                        Cálculo de Capacidade de Produção
                    </h3>
                </div>
                <div class="card-body">
                    <p style="color: #64748b; margin-bottom: 1.5rem; font-size: 0.9375rem;">
                        Configure os turnos para análise operacional
                    </p>
                    
                    <form id="formOperacional" onsubmit="calcularOperacional(event)">
                        <div class="form-group">
                            <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-clock" style="color: #3b82f6;"></i>
                                Número de Turnos Ativos
                            </label>
                            <select id="turnos" name="turnos" required class="form-select">
                                <option value="">Selecione...</option>
                                <option value="1">1 Turno (Manhã ou Tarde ou Noite - 24h)</option>
                                <option value="2">2 Turnos (Manhã + Tarde ou Manhã + Noite, etc - 24h)</option>
                                <option value="3">3 Turnos (Manhã + Tarde + Noite - 24h)</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-calculator"></i>
                            Calcular Capacidade
                        </button>
                    </form>
                </div>
            </div>

            <!-- Resultado -->
            <div id="resultadoOperacional" class="hidden"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

async function calcularOperacional(event) {
    event.preventDefault();
    
    const turnos = parseInt(document.getElementById('turnos').value);
    
    showLoading('Calculando capacidade...');
    
    try {
        // Cálculo local de capacidade
        const capacidade_por_turno = 1666; // unidades por turno (padrão da empresa)
        const dias_mes = 22; // dias úteis
        const horas_por_turno = 8;
        
        const capacidade_diaria = capacidade_por_turno * turnos;
        const capacidade_mensal = capacidade_diaria * dias_mes;
        const capacidade_anual = capacidade_mensal * 12;
        const capacidade_maxima = capacidade_por_turno * 3;
        const diferenca = capacidade_maxima - capacidade_diaria;
        const percentual_uso = (capacidade_diaria / capacidade_maxima) * 100;
        
        const data = {
            turnos: turnos,
            capacidade_por_turno: capacidade_por_turno,
            capacidade_diaria: capacidade_diaria,
            capacidade_mensal: capacidade_mensal,
            capacidade_anual: capacidade_anual,
            capacidade_maxima: capacidade_maxima,
            diferenca_diaria: diferenca,
            percentual_uso: parseFloat(percentual_uso.toFixed(2)),
            horas_por_turno: horas_por_turno,
            horas_dia: horas_por_turno * turnos
        };
        
        exibirResultadoOperacional(data);
        showToast('Cálculo realizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('[ERROR] Erro ao calcular:', error);
        showToast('Erro ao calcular capacidade', 'error');
    } finally {
        hideLoading();
    }
}

function exibirResultadoOperacional(data) {
    const resultado = document.getElementById('resultadoOperacional');
    
    const html = `
        <div class="card">
            <div class="card-header" style="background: white; border-bottom: 1px solid #f1f5f9;">
                <h3 style="display: flex; align-items: center; gap: 10px; margin: 0; color: #0f172a; font-size: 1.125rem; font-weight: 600;">
                    <i class="fas fa-chart-line" style="color: #3b82f6;"></i>
                    Análise de Capacidade - ${data.turnos} Turno(s)
                </h3>
            </div>
            <div class="card-body">
                <!-- Cards de Destaque Estilo PrescrMed -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                    <!-- Card 1 - Azul -->
                    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%); 
                                border: 1px solid rgba(59, 130, 246, 0.2); 
                                border-left: 4px solid #3b82f6; 
                                padding: 1.5rem; 
                                border-radius: 0.75rem;">
                        <div style="display: flex; align-items: flex-start; gap: 1rem;">
                            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); 
                                        width: 56px; 
                                        height: 56px; 
                                        border-radius: 0.75rem; 
                                        display: flex; 
                                        align-items: center; 
                                        justify-content: center; 
                                        color: white; 
                                        font-size: 1.5rem;
                                        flex-shrink: 0;">
                                <i class="fas fa-boxes"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem;">Total de Produtos</div>
                                <div style="font-size: 2rem; font-weight: 700; color: #0f172a;">${formatNumber(data.capacidade_por_turno)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Card 2 - Ciano -->
                    <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%); 
                                border: 1px solid rgba(6, 182, 212, 0.2); 
                                border-left: 4px solid #06b6d4; 
                                padding: 1.5rem; 
                                border-radius: 0.75rem;">
                        <div style="display: flex; align-items: flex-start; gap: 1rem;">
                            <div style="background: linear-gradient(135deg, #06b6d4, #0891b2); 
                                        width: 56px; 
                                        height: 56px; 
                                        border-radius: 0.75rem; 
                                        display: flex; 
                                        align-items: center; 
                                        justify-content: center; 
                                        color: white; 
                                        font-size: 1.5rem;
                                        flex-shrink: 0;">
                                <i class="fas fa-cubes"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem;">Itens em Estoque</div>
                                <div style="font-size: 2rem; font-weight: 700; color: #0f172a;">${formatNumber(data.capacidade_diaria)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Card 3 - Roxo -->
                    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%); 
                                border: 1px solid rgba(139, 92, 246, 0.2); 
                                border-left: 4px solid #8b5cf6; 
                                padding: 1.5rem; 
                                border-radius: 0.75rem;">
                        <div style="display: flex; align-items: flex-start; gap: 1rem;">
                            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); 
                                        width: 56px; 
                                        height: 56px; 
                                        border-radius: 0.75rem; 
                                        display: flex; 
                                        align-items: center; 
                                        justify-content: center; 
                                        color: white; 
                                        font-size: 1.5rem;
                                        flex-shrink: 0;">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem;">Valor em Estoque</div>
                                <div style="font-size: 2rem; font-weight: 700; color: #0f172a;">R$ ${formatNumber(data.capacidade_mensal)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Card 4 - Azul Claro -->
                    <div style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(2, 132, 199, 0.05) 100%); 
                                border: 1px solid rgba(14, 165, 233, 0.2); 
                                border-left: 4px solid #0ea5e9; 
                                padding: 1.5rem; 
                                border-radius: 0.75rem;">
                        <div style="display: flex; align-items: flex-start; gap: 1rem;">
                            <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); 
                                        width: 56px; 
                                        height: 56px; 
                                        border-radius: 0.75rem; 
                                        display: flex; 
                                        align-items: center; 
                                        justify-content: center; 
                                        color: white; 
                                        font-size: 1.5rem;
                                        flex-shrink: 0;">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 0.25rem;">Vendas do Mês</div>
                                <div style="font-size: 2rem; font-weight: 700; color: #0f172a;">R$ ${formatNumber(data.capacidade_anual)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Informações Detalhadas -->
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
                    <h4 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem;">Detalhes da Análise</h4>
                    <div style="display: grid; gap: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem;">
                            <span style="color: #64748b; font-size: 0.9375rem;"><i class="fas fa-calendar-alt" style="color: #3b82f6; margin-right: 0.5rem;"></i>Capacidade Anual:</span>
                            <span style="font-weight: 600; color: #0f172a;">${formatNumber(data.capacidade_anual)} unidades</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem;">
                            <span style="color: #64748b; font-size: 0.9375rem;"><i class="fas fa-cogs" style="color: #8b5cf6; margin-right: 0.5rem;"></i>Capacidade Máxima (3 turnos):</span>
                            <span style="font-weight: 600; color: #0f172a;">${formatNumber(data.capacidade_maxima)} unidades/dia</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem;">
                            <span style="color: #64748b; font-size: 0.9375rem;"><i class="fas fa-chart-bar" style="color: #f59e0b; margin-right: 0.5rem;"></i>Capacidade Ociosa:</span>
                            <span style="font-weight: 600; color: ${data.diferenca_diaria > 0 ? '#f59e0b' : '#10b981'};">${formatNumber(data.diferenca_diaria)} unidades/dia</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem;">
                            <span style="color: #64748b; font-size: 0.9375rem;"><i class="fas fa-business-time" style="color: #06b6d4; margin-right: 0.5rem;"></i>Horas de Operação:</span>
                            <span style="font-weight: 600; color: #0f172a;">${data.horas_dia}h/dia (${data.horas_por_turno}h/turno)</span>
                        </div>
                    </div>
                </div>
                
                <!-- Alert -->
                ${data.percentual_uso < 100 ? 
                    `<div class="alert alert-warning" style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 1.25rem;"></i>
                        <div>
                            <strong>Atenção:</strong> Existe capacidade ociosa de ${formatNumber(data.diferenca_diaria)} unidades/dia. Percentual de uso: ${data.percentual_uso}%
                        </div>
                    </div>` : 
                    `<div class="alert alert-success" style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-check-circle" style="font-size: 1.25rem;"></i>
                        <div>
                            <strong>Excelente!</strong> A fábrica está operando em capacidade MÁXIMA (100%)!
                        </div>
                    </div>`
                }
            </div>
        </div>
        
        <!-- CSS Responsivo -->
        <style>
            @media (max-width: 1024px) {
                .card-body > div:first-child {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
            }
            @media (max-width: 640px) {
                .card-body > div:first-child {
                    grid-template-columns: 1fr !important;
                }
            }
        </style>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
    
    // Scroll suave para o resultado
    setTimeout(() => {
        resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

console.log('[OK] Módulo Operacional pronto!');

