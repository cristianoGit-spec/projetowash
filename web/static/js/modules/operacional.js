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
        <div class="results-header">
            <i class="fas fa-chart-line"></i>
            <h4>Análise de Capacidade - ${data.turnos} Turno(s)</h4>
        </div>
        
        <div class="stats-grid results-grid">
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
            
            <div class="stat-card purple">
                <div class="stat-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-info">
                    <h3>${formatNumber(data.capacidade_mensal)}</h3>
                    <p>Capacidade Mensal</p>
                </div>
            </div>
            
            <div class="stat-card orange">
                <div class="stat-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="stat-info">
                    <h3>${data.percentual_uso}%</h3>
                    <p>Utilização</p>
                </div>
            </div>
        </div>
        
        <div class="info-cards">
            <div class="info-card">
                <div class="info-icon blue">
                    <i class="fas fa-industry"></i>
                </div>
                <div class="info-content">
                    <h5>Capacidade Anual</h5>
                    <p class="value">${formatNumber(data.capacidade_anual)} unidades</p>
                </div>
            </div>
            
            <div class="info-card">
                <div class="info-icon green">
                    <i class="fas fa-cogs"></i>
                </div>
                <div class="info-content">
                    <h5>Capacidade Máxima (3 turnos)</h5>
                    <p class="value">${formatNumber(data.capacidade_maxima)} unidades/dia</p>
                </div>
            </div>
            
            <div class="info-card">
                <div class="info-icon ${data.diferenca_diaria > 0 ? 'orange' : 'green'}">
                    <i class="fas ${data.diferenca_diaria > 0 ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                </div>
                <div class="info-content">
                    <h5>Capacidade Ociosa</h5>
                    <p class="value">${formatNumber(data.diferenca_diaria)} unidades/dia</p>
                </div>
            </div>
            
            <div class="info-card">
                <div class="info-icon purple">
                    <i class="fas fa-business-time"></i>
                </div>
                <div class="info-content">
                    <h5>Horas de Operação</h5>
                    <p class="value">${data.horas_dia}h/dia (${data.horas_por_turno}h/turno)</p>
                </div>
            </div>
        </div>
        
        ${data.percentual_uso < 100 ? 
            `<div class="alert alert-warning modern-alert">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Oportunidade de Expansão</strong>
                    <p>A fábrica está operando em ${data.percentual_uso}% da capacidade máxima.</p>
                </div>
            </div>` : 
            `<div class="alert alert-success modern-alert">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Capacidade Total</strong>
                    <p>A fábrica está operando em capacidade MÁXIMA!</p>
                </div>
            </div>`
        }
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
}
