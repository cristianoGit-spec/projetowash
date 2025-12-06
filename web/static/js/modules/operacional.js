// ============================================================================
// MÓDULO OPERACIONAL
// ============================================================================

function loadOperacionalModule(container) {
    const html = `
        <div class="card">
            <div class="card-header">
                <i class="fas fa-industry"></i> Cálculo de Capacidade de Produção
            </div>
            
            <form id="formOperacional" onsubmit="calcularOperacional(event)">
                <div class="form-group">
                    <label for="turnos">
                        <i class="fas fa-clock"></i> Número de Turnos Ativos
                    </label>
                    <select id="turnos" name="turnos" required>
                        <option value="">Selecione...</option>
                        <option value="1">1 Turno (Manhã ou Tarde ou Noite)</option>
                        <option value="2">2 Turnos (Manhã + Tarde ou Manhã + Noite, etc)</option>
                        <option value="3">3 Turnos (Manhã + Tarde + Noite - 24h)</option>
                    </select>
                </div>
                
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-calculator"></i> Calcular Capacidade
                </button>
            </form>
            
            <div id="resultadoOperacional" class="mt-3 hidden"></div>
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
        <div class="card">
            <h4><i class="fas fa-chart-bar"></i> Resultados para ${data.turnos} Turno(s)</h4>
            
            <div class="table-container">
                <table>
                    <tr>
                        <td><strong>Capacidade por Turno:</strong></td>
                        <td>${formatNumber(data.capacidade_por_turno)} unidades</td>
                    </tr>
                    <tr>
                        <td><strong>Horas por Turno:</strong></td>
                        <td>${data.horas_por_turno}h/dia</td>
                    </tr>
                    <tr>
                        <td><strong>Capacidade Diária:</strong></td>
                        <td>${formatNumber(data.capacidade_diaria)} unidades (${data.horas_dia}h/dia)</td>
                    </tr>
                    <tr>
                        <td><strong>Capacidade Mensal:</strong></td>
                        <td>${formatNumber(data.capacidade_mensal)} unidades</td>
                    </tr>
                    <tr>
                        <td><strong>Capacidade Anual:</strong></td>
                        <td>${formatNumber(data.capacidade_anual)} unidades</td>
                    </tr>
                    <tr>
                        <td><strong>Capacidade Máxima (3 turnos):</strong></td>
                        <td>${formatNumber(data.capacidade_maxima)} unidades</td>
                    </tr>
                    <tr>
                        <td><strong>Percentual de Uso:</strong></td>
                        <td>${data.percentual_uso}%</td>
                    </tr>
                    <tr>
                        <td><strong>Capacidade Ociosa (Diária):</strong></td>
                        <td>${formatNumber(data.diferenca_diaria)} unidades</td>
                    </tr>
                </table>
            </div>
            
            ${data.percentual_uso < 100 ? 
                `<div class="alert alert-warning mt-2">
                    <i class="fas fa-exclamation-triangle"></i>
                    A fábrica está operando abaixo da capacidade máxima. Há oportunidade de aumento produtivo.
                </div>` : 
                `<div class="alert alert-success mt-2">
                    <i class="fas fa-check-circle"></i>
                    A fábrica está operando em capacidade TOTAL!
                </div>`
            }
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
}
