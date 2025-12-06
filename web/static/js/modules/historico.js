// ============================================================================
// MÓDULO HISTÓRICO
// ============================================================================

async function loadHistoricoModule(container) {
    showLoading('Carregando histórico...');
    
    try {
        const movimentacoes = await obterHistoricoMovimentacoes();
        
        if (movimentacoes && movimentacoes.length > 0) {
            // Ordenar por data (mais recente primeiro)
            movimentacoes.sort((a, b) => {
                const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return dateB - dateA;
            });
            
            let tabelaHTML = '';
            
            movimentacoes.forEach((mov, idx) => {
                const dataFormatada = formatDateTime(mov.timestamp);
                const tipoBadge = mov.tipo === 'entrada' 
                    ? '<span class="status-badge active">Entrada</span>' 
                    : '<span class="status-badge inactive">Saída</span>';
                
                const quantidade = mov.quantidade || mov.quantidadeVendida || 0;
                const valor = mov.valorVenda ? formatCurrency(mov.valorVenda) : '-';
                
                tabelaHTML += `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${tipoBadge}</td>
                        <td>${mov.produtoNome}</td>
                        <td>${quantidade}</td>
                        <td>${valor}</td>
                        <td>${mov.usuario || 'Sistema'}</td>
                    </tr>
                `;
            });
            
            const html = `
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-history"></i> Histórico de Movimentações
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Tipo</th>
                                    <th>Produto</th>
                                    <th>Qtd</th>
                                    <th>Valor Venda</th>
                                    <th>Usuário</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tabelaHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="card text-center">
                    <i class="fas fa-history" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>Sem Histórico</h3>
                    <p>Nenhuma movimentação registrada ainda.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        showToast('Erro ao carregar histórico', 'error');
        container.innerHTML = `<div class="card alert alert-error"><p>Erro ao carregar histórico</p></div>`;
    } finally {
        hideLoading();
    }
}
