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
                
                // Buscar valor de diferentes propriedades possíveis
                let valorDisplay = '-';
                if (mov.tipo === 'saida') {
                    const valorVenda = mov.valorVenda || mov.valorTotal || mov.valorUnitario;
                    if (valorVenda && valorVenda > 0) {
                        valorDisplay = formatCurrency(valorVenda);
                    }
                } else {
                    valorDisplay = '-';
                }
                
                // Buscar usuário de diferentes propriedades
                const usuario = mov.usuario || mov.usuarioNome || 'Sistema';
                
                tabelaHTML += `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${tipoBadge}</td>
                        <td><strong>${mov.produtoNome}</strong></td>
                        <td class="text-center">${quantidade}</td>
                        <td class="text-right">${valorDisplay}</td>
                        <td>${usuario}</td>
                    </tr>
                `;
            });
            
            const html = `
                <div class="card">
                    <div class="card-header">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <i class="fas fa-history"></i> Histórico de Movimentações
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <span class="badge" style="background: #10b981; color: white; padding: 5px 10px; border-radius: 5px;">
                                    <i class="fas fa-check-circle"></i> ${movimentacoes.length} registros
                                </span>
                                <button class="btn btn-sm" onclick="loadHistoricoModule(document.getElementById('modalBody'))" title="Atualizar">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-container" style="overflow-x: auto;">
                        <table style="min-width: 800px;">
                            <thead>
                                <tr>
                                    <th style="min-width: 150px;"><i class="fas fa-calendar"></i> Data/Hora</th>
                                    <th style="min-width: 100px;"><i class="fas fa-tag"></i> Tipo</th>
                                    <th style="min-width: 200px;"><i class="fas fa-box"></i> Produto</th>
                                    <th style="min-width: 80px; text-align: center;"><i class="fas fa-cubes"></i> Qtd</th>
                                    <th style="min-width: 120px; text-align: right;"><i class="fas fa-dollar-sign"></i> Valor Venda</th>
                                    <th style="min-width: 120px;"><i class="fas fa-user"></i> Usuário</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tabelaHTML}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="card-footer" style="padding: 15px; background: #f8f9fa; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <small style="color: #64748b;">
                            <i class="fas fa-info-circle"></i> Mostrando todas as movimentações da empresa
                        </small>
                        <div style="display: flex; gap: 10px;">
                            <span class="status-badge active" style="cursor: default;">
                                <i class="fas fa-box-open"></i> Entradas
                            </span>
                            <span class="status-badge inactive" style="cursor: default;">
                                <i class="fas fa-truck-loading"></i> Saídas
                            </span>
                        </div>
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
