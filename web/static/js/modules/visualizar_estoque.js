// ============================================================================
// MÓDULO VISUALIZAR ESTOQUE
// ============================================================================

async function loadVisualizarModule(container) {
    showLoading('Carregando estoque...');
    
    try {
        const produtos = await obterDadosEstoque();
        
        if (produtos && produtos.length > 0) {
            let tabelaHTML = '';
            let totalItens = 0;
            let totalValor = 0;
            
            produtos.forEach((produto, idx) => {
                const valorTotal = produto.quantidade * produto.valor;
                totalItens += produto.quantidade;
                totalValor += valorTotal;
                
                tabelaHTML += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${produto.codigo}</td>
                        <td>${produto.nome}</td>
                        <td>${formatNumber(produto.quantidade)}</td>
                        <td>${formatCurrency(produto.valor)}</td>
                        <td>${formatCurrency(valorTotal)}</td>
                        <td>${produto.local}</td>
                        <td>${produto.fornecedor}</td>
                    </tr>
                `;
            });
            
            const html = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0;"><i class="fas fa-warehouse"></i> Estoque Completo</h4>
                        <button class="btn btn-danger btn-sm" onclick="exportarEstoquePDF()">
                            <i class="fas fa-file-pdf"></i> Exportar PDF
                        </button>
                    </div>
                    
                    <div class="stats-row">
                        <div class="stat-item">
                            <strong>Total de Produtos:</strong>
                            <span>${produtos.length}</span>
                        </div>
                        <div class="stat-item">
                            <strong>Total de Itens:</strong>
                            <span>${formatNumber(totalItens)}</span>
                        </div>
                        <div class="stat-item">
                            <strong>Valor Total:</strong>
                            <span>${formatCurrency(totalValor)}</span>
                        </div>
                    </div>
                    
                    <div class="table-container mt-3">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>Quantidade</th>
                                    <th>Valor Unit.</th>
                                    <th>Valor Total</th>
                                    <th>Local</th>
                                    <th>Fornecedor</th>
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
                    <i class="fas fa-box-open" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>Estoque Vazio</h3>
                    <p>Nenhum produto cadastrado ainda. Use o módulo de Entrada de Estoque para começar.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar estoque:', error);
        showToast('Erro ao carregar estoque', 'error');
        container.innerHTML = `<div class="card alert alert-error"><p>Erro ao carregar estoque</p></div>`;
    } finally {
        hideLoading();
    }
}

async function exportarEstoquePDF() {
    showLoading('Gerando PDF...');
    
    try {
        const produtos = await obterDadosEstoque();
        
        if (produtos.length === 0) {
            showToast('Estoque vazio', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(18);
        doc.text('Quatro Cantos', 14, 22);
        doc.setFontSize(14);
        doc.text('Relatório de Estoque', 14, 32);
        doc.setFontSize(10);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 40);
        
        // Tabela
        const tableColumn = ["Cód", "Produto", "Qtd", "Valor Unit.", "Total", "Local"];
        const tableRows = [];
        
        let valorTotalEstoque = 0;
        let totalItens = 0;

        produtos.forEach(prod => {
            const total = prod.quantidade * prod.valor;
            valorTotalEstoque += total;
            totalItens += prod.quantidade;
            
            const row = [
                prod.codigo,
                prod.nome,
                prod.quantidade,
                formatCurrency(prod.valor),
                formatCurrency(total),
                prod.local
            ];
            tableRows.push(row);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [39, 174, 96] }
        });
        
        // Totais
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Total de Itens: ${totalItens}`, 14, finalY);
        doc.text(`Valor Total em Estoque: ${formatCurrency(valorTotalEstoque)}`, 14, finalY + 6);
        
        doc.save('relatorio_estoque.pdf');
        showToast('PDF gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF', 'error');
    } finally {
        hideLoading();
    }
}
