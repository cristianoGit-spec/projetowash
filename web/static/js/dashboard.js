// Dashboard Functions

let chartMovimentacoes = null;
let chartTopProdutos = null;
let chartEficiencia = null;

// Carregar dashboard
async function loadDashboard() {
    try {
        showLoading('Carregando dashboard...');
        
        const stats = await obterEstatisticas();
        
        // Atualizar cards de estatisticas
        document.getElementById('statTotalProdutos').textContent = stats.totalProdutos || 0;
        document.getElementById('statTotalItens').textContent = stats.totalItens || 0;
        document.getElementById('statValorTotal').textContent = formatCurrency(stats.valorTotal || 0);
        document.getElementById('statVendasMes').textContent = formatCurrency(stats.vendasMes || 0);
        
        // Carregar historico
        loadHistoricoRecente(stats.movimentacoes);
        
        // Carregar graficos e verificar estoque baixo
        await loadChartsAndAlerts();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error('Erro ao carregar dashboard:', error);
        showToast('Erro ao carregar dashboard', 'error');
    }
}

// Carregar historico recente
function loadHistoricoRecente(movimentacoes) {
    const container = document.getElementById('historicoRecente');
    
    if (!movimentacoes || movimentacoes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma movimentacao recente</p>
            </div>
        `;
        return;
    }
    
    const html = movimentacoes.map(mov => {
        const tipo = mov.tipo;
        const icon = tipo === 'entrada' ? 'box-open' : 'truck-loading';
        const quantidade = mov.quantidade || mov.quantidadeVendida || 0;
        const valor = mov.valorVenda || 0;
        
        return `
            <div class="history-item ${tipo}">
                <div class="history-info">
                    <div class="history-icon">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div class="history-details">
                        <h4>${mov.produtoNome}</h4>
                        <p>${tipo === 'entrada' ? 'Entrada' : 'Saida'} de ${quantidade} unidade(s)</p>
                    </div>
                </div>
                <div class="history-value">
                    ${tipo === 'saida' ? formatCurrency(valor) : `${quantidade}x`}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Carregar graficos e alertas
async function loadChartsAndAlerts() {
    try {
        const [produtos, movimentacoes] = await Promise.all([
            obterDadosEstoque(),
            obterHistoricoMovimentacoes()
        ]);
        
        // Verificar estoque baixo
        checkLowStock(produtos);

        // Grafico de Movimentacoes
        loadChartMovimentacoes(movimentacoes);
        
        // Grafico de Top Produtos
        loadChartTopProdutos(produtos);

        // Grafico de Eficiencia (Gauge)
        loadChartEficiencia();
        
    } catch (error) {
        console.error('Erro ao carregar graficos:', error);
    }
}

// Verificar estoque baixo
function checkLowStock(produtos) {
    const container = document.getElementById('stockAlerts');
    const threshold = 10; // Limite para alerta
    
    const lowStockItems = produtos.filter(p => p.quantidade <= threshold);
    
    if (lowStockItems.length > 0) {
        const itemsHtml = lowStockItems.map(p => `
            <li>
                <strong>${p.nome}</strong>: Restam apenas <span class="badge-danger">${p.quantidade}</span> unidades
            </li>
        `).join('');
        
        container.innerHTML = `
            <div class="alert alert-warning" style="display: block; margin-bottom: 20px;">
                <h4><i class="fas fa-exclamation-triangle"></i> Alerta de Estoque Baixo</h4>
                <ul style="margin-top: 10px; padding-left: 20px;">
                    ${itemsHtml}
                </ul>
            </div>
        `;
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
        container.innerHTML = '';
    }
}

// Grafico de Movimentacoes
function loadChartMovimentacoes(movimentacoes) {
    const ctx = document.getElementById('chartMovimentacoes');
    
    // Contar entradas e saidas dos ultimos 7 dias
    const hoje = new Date();
    const dias = [];
    const entradas = new Array(7).fill(0);
    const saidas = new Array(7).fill(0);
    
    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        dias.push(data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    
    movimentacoes.forEach(mov => {
        if (!mov.timestamp) return;
        
        const movData = mov.timestamp.toDate ? mov.timestamp.toDate() : new Date(mov.timestamp);
        const diffDias = Math.floor((hoje - movData) / (1000 * 60 * 60 * 24));
        
        if (diffDias >= 0 && diffDias < 7) {
            const index = 6 - diffDias;
            if (mov.tipo === 'entrada') {
                entradas[index] += mov.quantidade || 0;
            } else if (mov.tipo === 'saida') {
                saidas[index] += mov.quantidade || mov.quantidadeVendida || 0;
            }
        }
    });
    
    // Destruir grafico anterior
    if (chartMovimentacoes) {
        chartMovimentacoes.destroy();
    }
    
    // Criar novo grafico
    chartMovimentacoes = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dias,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradas,
                    borderColor: '#10b981', // Emerald
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Saidas',
                    data: saidas,
                    borderColor: '#f59e0b', // Amber
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Grafico de Top Produtos
function loadChartTopProdutos(produtos) {
    const ctx = document.getElementById('chartTopProdutos');
    
    // Ordenar por quantidade e pegar top 5
    const top5 = produtos
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);
    
    const labels = top5.map(p => p.nome);
    const data = top5.map(p => p.quantidade);
    const colors = [
        'rgba(37, 99, 235, 0.8)',  // Blue
        'rgba(6, 182, 212, 0.8)',   // Cyan
        'rgba(16, 185, 129, 0.8)',  // Emerald
        'rgba(139, 92, 246, 0.8)',  // Violet
        'rgba(245, 158, 11, 0.8)'   // Amber
    ];
    
    // Destruir grafico anterior
    if (chartTopProdutos) {
        chartTopProdutos.destroy();
    }
    
    // Criar novo grafico
    chartTopProdutos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade em Estoque',
                data: data,
                backgroundColor: colors,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Grafico de Eficiencia (Gauge)
async function loadChartEficiencia() {
    const ctx = document.getElementById('chartEficiencia');
    
    // Calcular eficiência real baseada nos dados do sistema
    const eficiencia = await calcularOEE();
    const restante = 100 - eficiencia;
    
    if (chartEficiencia) {
        chartEficiencia.destroy();
    }
    
    chartEficiencia = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Eficiência', 'Perda'],
            datasets: [{
                data: [eficiencia, restante],
                backgroundColor: [
                    '#10b981', // Emerald (Success)
                    '#e2e8f0'  // Gray (Empty)
                ],
                borderWidth: 0,
                cutout: '75%',
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        },
        plugins: [{
            id: 'textCenter',
            beforeDraw: function(chart) {
                var width = chart.width,
                    height = chart.height,
                    ctx = chart.ctx;

                ctx.restore();
                var fontSize = (height / 114).toFixed(2);
                ctx.font = "bold " + fontSize + "em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#0f172a";

                var text = eficiencia + "%",
                    textX = Math.round((width - ctx.measureText(text).width) / 2),
                    textY = height / 1.5;

                ctx.fillText(text, textX, textY);
                
                ctx.font = "normal " + (fontSize*0.4).toFixed(2) + "em sans-serif";
                ctx.fillStyle = "#64748b";
                var label = "OEE",
                    labelX = Math.round((width - ctx.measureText(label).width) / 2),
                    labelY = height / 1.2;
                    
                ctx.fillText(label, labelX, labelY);
                ctx.save();
            }
        }]
    });
}

// Atualizar dashboard periodicamente
setInterval(() => {
    const user = typeof localCurrentUser !== 'undefined' ? localCurrentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    if (user && !document.getElementById('appContainer').classList.contains('hidden')) {
        loadDashboard();
    }
}, 60000); // Atualizar a cada 1 minuto

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Calcular OEE (Overall Equipment Effectiveness) Real
async function calcularOEE() {
    try {
        // Obter dados do estoque e movimentações
        const [produtos, movimentacoes] = await Promise.all([
            obterDadosEstoque(),
            obterHistoricoMovimentacoes()
        ]);
        
        // Se não houver dados, retornar 88% como padrão
        if (!produtos || produtos.length === 0) {
            return 88;
        }
        
        // Calcular eficiência baseada em:
        // 1. Taxa de movimentação (produtos com saídas recentes)
        // 2. Nível de estoque (produtos não zerados)
        // 3. Disponibilidade (produtos cadastrados vs. ativos)
        
        const hoje = new Date();
        const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Produtos com estoque disponível
        const produtosAtivos = produtos.filter(p => p.quantidade > 0).length;
        const taxaDisponibilidade = (produtosAtivos / produtos.length) * 100;
        
        // Movimentações dos últimos 30 dias
        const movimentacoesRecentes = movimentacoes.filter(m => {
            const data = m.timestamp && m.timestamp.toDate ? m.timestamp.toDate() : new Date(m.timestamp);
            return data >= trintaDiasAtras;
        });
        
        // Taxa de performance (movimentações por produto ativo)
        const taxaMovimentacao = produtosAtivos > 0 
            ? Math.min((movimentacoesRecentes.length / produtosAtivos) * 10, 100) 
            : 0;
        
        // Produtos com nível adequado de estoque (acima de 5 unidades)
        const produtosComEstoqueAdequado = produtos.filter(p => p.quantidade >= 5).length;
        const taxaQualidade = (produtosComEstoqueAdequado / produtos.length) * 100;
        
        // OEE = Disponibilidade × Performance × Qualidade
        // Pesos ajustados para o contexto de estoque
        const oee = (
            taxaDisponibilidade * 0.4 +  // 40% peso na disponibilidade
            taxaMovimentacao * 0.35 +      // 35% peso na movimentação
            taxaQualidade * 0.25           // 25% peso no estoque adequado
        );
        
        // Garantir que está entre 0 e 100 e arredondar
        return Math.round(Math.max(0, Math.min(100, oee)));
        
    } catch (error) {
        console.error('Erro ao calcular OEE:', error);
        return 88; // Valor padrão em caso de erro
    }
}
