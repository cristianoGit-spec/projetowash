// ============================================================================
// MÓDULO OPERACIONAL - v39
// ============================================================================

console.log('[MODULE] Módulo Operacional v39 carregado');

function loadOperacionalModule(container) {
    const html = `
        <div class="operacional-module">
            <!-- Header Moderno com Gradiente -->
            <div class="modern-header">
                <div class="header-content">
                    <div class="header-icon">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div>
                        <h2>Módulo Operacional</h2>
                        <p>Capacidade de Produção</p>
                    </div>
                </div>
            </div>

            <!-- Card Principal -->
            <div class="modern-card" style="margin-bottom: 30px;">
                <div class="modern-body">
                    <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #1e40af;">
                        <i class="fas fa-calculator"></i>
                        Cálculo de Capacidade de Produção
                    </h3>
                    <p style="color: #6b7280; margin-bottom: 25px; font-size: 14px;">
                        Configure os turnos para análise operacional
                    </p>
                    
                    <form id="formOperacional" onsubmit="calcularOperacional(event)">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #374151; font-weight: 600; font-size: 14px;">
                                <i class="fas fa-clock"></i>
                                Número de Turnos Ativos
                            </label>
                            <select id="turnos" name="turnos" required 
                                    style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
                                <option value="">Selecione...</option>
                                <option value="1">1 Turno (Manhã ou Tarde ou Noite - 24h)</option>
                                <option value="2">2 Turnos (Manhã + Tarde ou Manhã + Noite, etc - 24h)</option>
                                <option value="3">3 Turnos (Manhã + Tarde + Noite - 24h)</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" 
                                style="width: 100%; padding: 14px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
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
        <div class="modern-card">
            <div class="modern-body">
                <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 25px; color: #1e40af;">
                    <i class="fas fa-chart-line"></i>
                    Análise de Capacidade - ${data.turnos} Turno(s)
                </h3>
                
                <!-- Cards de Destaque -->
                <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px; font-size: 24px;">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">${formatNumber(data.capacidade_por_turno)}</div>
                                <div style="font-size: 13px; opacity: 0.9;">Capacidade/Turno</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px; font-size: 24px;">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div>
                                <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">${formatNumber(data.capacidade_diaria)}</div>
                                <div style="font-size: 13px; opacity: 0.9;">Capacidade Diária</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Informações Detalhadas -->
                <div class="info-grid" style="margin-bottom: 25px;">
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-calendar-alt" style="color: #3b82f6;"></i> Capacidade Anual:</span>
                        <span class="info-value" style="font-weight: 600; color: #1e40af;">${formatNumber(data.capacidade_anual)} unidades</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-cogs" style="color: #8b5cf6;"></i> Capacidade Máxima (3 turnos):</span>
                        <span class="info-value" style="font-weight: 600;">${formatNumber(data.capacidade_maxima)} unidades/dia</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-chart-bar" style="color: #f59e0b;"></i> Capacidade Ociosa:</span>
                        <span class="info-value" style="font-weight: 600; color: ${data.diferenca_diaria > 0 ? '#f59e0b' : '#10b981'};">${formatNumber(data.diferenca_diaria)} unidades/dia</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label"><i class="fas fa-business-time" style="color: #06b6d4;"></i> Horas de Operação:</span>
                        <span class="info-value" style="font-weight: 600;">${data.horas_dia}h/dia (${data.horas_por_turno}h/turno)</span>
                    </div>
                </div>
                
                <!-- Alert -->
                ${data.percentual_uso < 100 ? 
                    `<div class="simple-alert" style="background: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e;">
                        <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                        <div>
                            <strong>Capacidade Total:</strong> A fábrica está operando com capacidade MÁXIMA!
                        </div>
                    </div>` : 
                    `<div class="simple-alert" style="background: #d1fae5; border-left: 4px solid #10b981; color: #065f46;">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        <div>
                            <strong>Capacidade Total:</strong> A fábrica está operando em capacidade MÁXIMA!
                        </div>
                    </div>`
                }
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
    
    // Scroll suave para o resultado
    setTimeout(() => {
        resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

console.log('[OK] Módulo Operacional pronto!');

