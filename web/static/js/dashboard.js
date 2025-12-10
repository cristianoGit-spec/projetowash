// Dashboard Functions

let chartMovimentacoes = null;
let chartTopProdutos = null;
let chartEficiencia = null;

// Carregar dashboard
async function loadDashboard() {
    try {
        console.log('[LOAD] Carregando dashboard...');
        showLoading('Carregando dashboard...');
        
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js não está carregado!');
            hideLoading();
            showToast('Erro: Biblioteca de gráficos não disponível. Recarregue a página.', 'error');
            return;
        }
        
        // Garantir que dados locais estão carregados
        if (typeof loadLocalData === 'function') {
            loadLocalData();
        }
        
        // Verificar se é a primeira vez que carrega com dados de exemplo
        const seedDataInitialized = localStorage.getItem('seedDataInitialized');
        if (seedDataInitialized === 'true') {
            // Remover flag para não mostrar novamente
            localStorage.removeItem('seedDataInitialized');
            
            // Mostrar mensagem informativa
            setTimeout(() => {
                showToast('🌱 Dados de exemplo carregados! Explore o sistema e depois cadastre seus próprios produtos.', 'success', 6000);
            }, 1000);
        }
        
        const stats = await obterEstatisticas();
        console.log('[DATA] Estatísticas obtidas:', stats);
        
        // Atualizar cards de estatisticas com animação
        const elements = {
            statTotalProdutos: stats.totalProdutos || 0,
            statTotalItens: stats.totalItens || 0,
            statValorTotal: formatCurrency(stats.valorTotal || 0),
            statVendasMes: formatCurrency(stats.vendasMes || 0)
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.opacity = '0';
                element.textContent = value;
                setTimeout(() => {
                    element.style.transition = 'opacity 0.5s ease';
                    element.style.opacity = '1';
                }, 50);
            }
        });
        
        console.log('[OK] Cards atualizados');
        
        // Carregar historico
        loadHistoricoRecente(stats.movimentacoes || []);
        
        // Carregar graficos e verificar estoque baixo
        await loadChartsAndAlerts();
        
        console.log('[OK] Dashboard carregado com sucesso');
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error('❌ Erro ao carregar dashboard:', error);
        showToast('Erro ao carregar dashboard. Verifique sua conexão.', 'error');
        
        // Mostrar estado de erro no dashboard
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #fee2e2; border-radius: 12px; border: 2px solid #fecaca;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 10px;"></i>
                    <h3 style="color: #dc2626; font-weight: 700;">Erro ao Carregar Dashboard</h3>
                    <p style="color: #4a5568; font-weight: 500;">Tente atualizar a página ou verificar sua conexão.</p>
                    <button onclick="loadDashboard()" class="btn btn-primary" style="margin-top: 15px;">
                        <i class="fas fa-sync-alt"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    }
}

// Carregar historico recente
function loadHistoricoRecente(movimentacoes) {
    const container = document.getElementById('historicoRecente');
    
    if (!container) {
        // Container não existe no layout atual - normal
        return;
    }
    
    if (!movimentacoes || movimentacoes.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 3rem 1.5rem; color: #6b7280;">
                <div style="width: 64px; height: 64px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: #9ca3af;"></i>
                </div>
                <h4 style="color: #0f172a; margin-bottom: 0.5rem; font-weight: 600; font-size: 1rem;">Nenhuma movimentação recente</h4>
                <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem;">Registre entradas ou saídas de produtos para visualizar o histórico</p>
                <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="showModule('estoque-entrada')" class="btn btn-success" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        <i class="fas fa-plus"></i> Nova Entrada
                    </button>
                    <button onclick="showModule('estoque-saida')" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        <i class="fas fa-minus"></i> Nova Saída
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const html = movimentacoes.map(mov => {
        const tipo = mov.tipo;
        const icon = tipo === 'entrada' ? 'arrow-down' : 'arrow-up';
        const quantidade = mov.quantidade || mov.quantidadeVendida || 0;
        const valor = mov.valorVenda || 0;
        const iconColor = tipo === 'entrada' ? '#10b981' : '#3b82f6';
        const iconBg = tipo === 'entrada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';
        
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: white; border: 1px solid #f3f4f6; border-radius: 0.5rem; margin-bottom: 0.75rem; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#e5e7eb'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'" onmouseout="this.style.borderColor='#f3f4f6'; this.style.boxShadow='none'">
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <div style="width: 40px; height: 40px; background: ${iconBg}; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: ${iconColor}; flex-shrink: 0;">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #0f172a; font-size: 0.9375rem; margin-bottom: 0.125rem;">${mov.produtoNome}</div>
                        <div style="font-size: 0.8125rem; color: #6b7280;">${tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${quantidade} unidade(s)</div>
                    </div>
                </div>
                <div style="font-weight: 600; color: #0f172a; font-size: 0.9375rem;">
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
        console.log('[CHART] Carregando gráficos e alertas...');
        
        const [produtos, movimentacoes] = await Promise.all([
            obterDadosEstoque(),
            obterHistoricoMovimentacoes()
        ]);
        
        console.log('[LOAD] Produtos obtidos:', produtos.length);
        console.log('[DATA] Movimentações obtidas:', movimentacoes.length);
        
        // Verificar estoque baixo
        checkLowStock(produtos);

        // Grafico de Movimentacoes
        loadChartMovimentacoes(movimentacoes);
        
        // Grafico de Top Produtos
        loadChartTopProdutos();

        // Grafico de Eficiencia (Gauge)
        loadChartEficiencia();
        
        console.log('[OK] Gráficos carregados');
        
    } catch (error) {
        console.error('❌ Erro ao carregar graficos:', error);
    }
}

// Verificar estoque baixo
function checkLowStock(produtos) {
    const container = document.getElementById('stockAlerts');
    
    if (!container) {
        // Container não existe no layout atual - normal
        return;
    }
    
    const threshold = 10; // Limite para alerta
    
    const lowStockItems = produtos.filter(p => p.quantidade <= threshold);
    
    if (lowStockItems.length > 0) {
        const itemsHtml = lowStockItems.map(p => `
            <li>
                <strong>${p.nome}</strong>: Restam apenas <span class="badge-danger">${p.quantidade}</span> unidades
            </li>
        `).join('');
        
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning" style="display: block; margin-bottom: 20px;">
                    <h4><i class="fas fa-exclamation-triangle"></i> Alerta de Estoque Baixo</h4>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        ${itemsHtml}
                    </ul>
                </div>
            `;
            if (container.classList) {
                container.classList.remove('hidden');
            } else {
                container.className = container.className.replace(/\bhidden\b/g, '');
            }
        }
    } else {
        if (container && container.classList) {
            container.classList.add('hidden');
        } else {
            container.className += ' hidden';
        }
        container.innerHTML = '';
    }
}

// Grafico de Movimentacoes
function loadChartMovimentacoes(movimentacoes) {
    const ctx = document.getElementById('chartMovimentacoes');
    
    if (!ctx) {
        // Canvas não existe no layout atual - normal
        return;
    }
    
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
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y + ' unidade(s)';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9',
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 11
                        },
                        padding: 8
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        padding: 8
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Grafico de Top Produtos
async function loadChartTopProdutos() {
    const ctx = document.getElementById('chartTopProdutos');
    
    if (!ctx) {
        // Canvas não existe no layout atual - isso é normal
        return;
    }
    
    // Buscar produtos atualizados
    const produtos = await obterDadosEstoque();
    
    // Se não há produtos, mostrar mensagem
    if (!produtos || produtos.length === 0) {
        const chartCard = ctx.closest('.chart-card');
        if (chartCard) {
            chartCard.innerHTML = `
                <h3 style="color: #1a1a1a; font-weight: 700;">Top 5 Produtos</h3>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px; color: #6b7280;">
                    <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3; color: #9ca3af;"></i>
                    <p style="text-align: center; font-size: 0.9rem; color: #6b7280; font-weight: 500;">Cadastre produtos para visualizar o ranking</p>
                </div>
            `;
        }
        return;
    }
    
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
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Estoque: ' + context.parsed.y + ' unidades';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9',
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 11
                        },
                        padding: 8
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        padding: 8,
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Grafico de Eficiencia (Gauge)
async function loadChartEficiencia() {
    const ctx = document.getElementById('chartEficiencia');
    
    if (!ctx) {
        // Canvas não existe no layout atual - normal
        return;
    }
    
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
