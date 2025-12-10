// ============================================================================
// MÓDULO OPERACIONAL
// ============================================================================

function loadOperacionalModule(container) {
    const html = `
        <div class="card modern-card">
            <div class="card-header modern-header">
                <div class="header-content">
                    <div class="header-icon">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="header-text">
                        <h3>Cálculo de Capacidade de Produção</h3>
                        <p class="subtitle">Configure os turnos para análise operacional</p>
                    </div>
                </div>
            </div>
            
            <div class="card-body modern-body">
                <form id="formOperacional" onsubmit="calcularOperacional(event)">
                    <div class="form-group modern-form-group">
                        <label for="turnos" class="modern-label">
                            <i class="fas fa-clock"></i>
                            <span>Número de Turnos Ativos</span>
                        </label>
                        <select id="turnos" name="turnos" class="modern-select" required>
                            <option value="">Selecione...</option>
                            <option value="1">1 Turno (Manhã ou Tarde ou Noite)</option>
                            <option value="2">2 Turnos (Manhã + Tarde ou Manhã + Noite, etc)</option>
                            <option value="3">3 Turnos (Manhã + Tarde + Noite - 24h)</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn btn-primary modern-btn">
                        <i class="fas fa-calculator"></i>
                        <span>Calcular Capacidade</span>
                    </button>
                </form>
                
                <div id="resultadoOperacional" class="mt-3 hidden"></div>
            </div>
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
        console.error('Erro ao calcular:', error);
        showToast('Erro ao calcular capacidade', 'error');
    } finally {
        hideLoading();
    }
}

function exibirResultadoOperacional(data) {
    const resultado = document.getElementById('resultadoOperacional');
    
    const html = `
        <div class="results-section">
            <div class="results-title">
                <i class="fas fa-chart-line"></i>
                <span>Análise de Capacidade - ${data.turnos} Turno(s)</span>
            </div>
            
            <div class="stats-grid grid-2">
                <div class="stat-card blue">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${formatNumber(data.capacidade_por_turno)}</h3>
                        <p>Capacidade/Turno</p>
                    </div>
                </div>
                
                <div class="stat-card green">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${formatNumber(data.capacidade_diaria)}</h3>
                        <p>Capacidade Diária</p>
                    </div>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-industry"></i> Capacidade Anual</span>
                    <span class="info-value">${formatNumber(data.capacidade_anual)} unidades</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-cogs"></i> Capacidade Máxima (3 turnos)</span>
                    <span class="info-value">${formatNumber(data.capacidade_maxima)} unidades/dia</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-chart-bar"></i> Capacidade Ociosa</span>
                    <span class="info-value ${data.diferenca_diaria > 0 ? 'warning' : 'success'}">${formatNumber(data.diferenca_diaria)} unidades/dia</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-business-time"></i> Horas de Operação</span>
                    <span class="info-value">${data.horas_dia}h/dia (${data.horas_por_turno}h/turno)</span>
                </div>
            </div>
            
            ${data.percentual_uso < 100 ? 
                `<div class="alert alert-warning simple-alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Oportunidade de Expansão: A fábrica está operando em ${data.percentual_uso}% da capacidade máxima.</span>
                </div>` : 
                `<div class="alert alert-success simple-alert">
                    <i class="fas fa-check-circle"></i>
                    <span>A fábrica está operando em capacidade MÁXIMA!</span>
                </div>`
            }
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
}
