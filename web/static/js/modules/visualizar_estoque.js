// ============================================================================
// MÓDULO VISUALIZAR ESTOQUE - v39
// ============================================================================

console.log('[MODULE] Módulo Visualizar Estoque v39 carregado');

async function loadVisualizarModule(container) {
    showLoading('Carregando estoque...');
    
    try {
        const produtos = await obterDadosEstoque();
        
        if (produtos && produtos.length > 0) {
            let totalItens = 0;
            let totalValor = 0;
            
            produtos.forEach((produto) => {
                const valorTotal = produto.quantidade * produto.valor;
                totalItens += produto.quantidade;
                totalValor += valorTotal;
            });
            
            const html = `
                <div class="visualizar-module">
                    <!-- Header Moderno -->
                    <div class="modern-header">
                        <div class="header-content">
                            <div class="header-icon">
                                <i class="fas fa-warehouse"></i>
                            </div>
                            <div>
                                <h2>Visualizar Estoque Completo</h2>
                                <p>Gestão e visualização de produtos</p>
                            </div>
                        </div>
                    </div>

                    <!-- Resumo e Ação -->
                    <div class="modern-card" style="margin-bottom: 30px;">
                        <div class="modern-body">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 25px;">
                                <h3 style="display: flex; align-items: center; gap: 10px; margin: 0; color: #1e40af;">
                                    <i class="fas fa-box"></i>
                                    Estoque Completo
                                </h3>
                                <button onclick="exportarEstoquePDF()" class="btn btn-danger" 
                                        style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-file-pdf"></i> Exportar PDF
                                </button>
                            </div>

                            <!-- Estatísticas -->
                            <div class="info-grid" style="margin-bottom: 25px;">
                                <div class="info-row">
                                    <span class="info-label"><i class="fas fa-boxes" style="color: #3b82f6;"></i> Total de Produtos:</span>
                                    <span class="info-value" style="color: #3b82f6; font-weight: 700; font-size: 18px;">${produtos.length}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label"><i class="fas fa-cubes" style="color: #10b981;"></i> Total de Itens:</span>
                                    <span class="info-value" style="color: #10b981; font-weight: 700; font-size: 18px;">${formatNumber(totalItens)}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label"><i class="fas fa-dollar-sign" style="color: #8b5cf6;"></i> Valor Total:</span>
                                    <span class="info-value" style="color: #8b5cf6; font-weight: 700; font-size: 18px;">${formatCurrency(totalValor)}</span>
                                </div>
                            </div>

                            <!-- Lista de Produtos -->
                            <div id="listaProdutos">
                                ${gerarListaProdutos(produtos)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Editar Produto -->
                <div id="modalEditarProduto" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3><i class="fas fa-edit"></i> Editar Produto</h3>
                            <button onclick="fecharModalEditar()" class="modal-close">&times;</button>
                        </div>
                        <form id="formEditarProduto" onsubmit="salvarEdicaoProduto(event)">
                            <div class="modal-body">
                                <input type="hidden" id="editProdutoId">
                                <div class="form-group">
                                    <label><i class="fas fa-barcode"></i> Código</label>
                                    <input type="text" id="editCodigo" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-tag"></i> Nome do Produto</label>
                                    <input type="text" id="editNome" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label><i class="fas fa-boxes"></i> Quantidade</label>
                                        <input type="number" id="editQuantidade" min="0" required>
                                    </div>
                                    <div class="form-group">
                                        <label><i class="fas fa-dollar-sign"></i> Valor Unitário</label>
                                        <input type="number" id="editValor" step="0.01" min="0" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label><i class="fas fa-map-marker-alt"></i> Local</label>
                                        <input type="text" id="editLocal" required>
                                    </div>
                                    <div class="form-group">
                                        <label><i class="fas fa-truck"></i> Fornecedor</label>
                                        <input type="text" id="editFornecedor" required>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" onclick="fecharModalEditar()" class="btn btn-secondary">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="modern-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-warehouse"></i>
                        </div>
                        <div>
                            <h2>Visualizar Estoque Completo</h2>
                            <p>Gestão e visualização de produtos</p>
                        </div>
                    </div>
                </div>
                <div class="modern-card">
                    <div class="modern-body" style="text-align: center; padding: 60px 20px;">
                        <i class="fas fa-box-open" style="font-size: 80px; color: #e5e7eb; margin-bottom: 20px;"></i>
                        <h3 style="color: #6b7280; margin: 15px 0;">Estoque Vazio</h3>
                        <p style="color: #9ca3af; margin: 0 0 20px 0;">Nenhum produto cadastrado ainda.</p>
                        <button onclick="loadModule('estoque_entrada')" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Cadastrar Primeiro Produto
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('[ERROR] Erro ao carregar estoque:', error);
        showToast('Erro ao carregar estoque', 'error');
        container.innerHTML = `
            <div class="simple-alert" style="background: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b;">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <span>Erro ao carregar estoque. Tente novamente.</span>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

function gerarListaProdutos(produtos) {
    return `
        <div style="display: grid; gap: 15px;">
            ${produtos.map((produto, idx) => {
                const valorTotal = produto.quantidade * produto.valor;
                return `
                    <div class="info-row" style="padding: 20px; border-radius: 12px; background: #f9fafb; border: 1px solid #e5e7eb; display: grid; grid-template-columns: auto 1fr auto; gap: 20px; align-items: center;">
                        <!-- Número -->
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
                            ${idx + 1}
                        </div>
                        
                        <!-- Informações -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                    <i class="fas fa-barcode"></i> Código
                                </div>
                                <div style="font-weight: 600; color: #1f2937;">${produto.codigo}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                    <i class="fas fa-tag"></i> Nome
                                </div>
                                <div style="font-weight: 600; color: #1f2937;">${produto.nome}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                    <i class="fas fa-boxes"></i> Quantidade
                                </div>
                                <div style="font-weight: 600; color: #10b981;">${formatNumber(produto.quantidade)}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                    <i class="fas fa-dollar-sign"></i> Valor Unit.
                                </div>
                                <div style="font-weight: 600; color: #3b82f6;">${formatCurrency(produto.valor)}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                    <i class="fas fa-calculator"></i> Valor Total
                                </div>
                                <div style="font-weight: 700; color: #8b5cf6; font-size: 16px;">${formatCurrency(valorTotal)}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                    <i class="fas fa-map-marker-alt"></i> Local
                                </div>
                                <div style="font-weight: 600; color: #1f2937;">${produto.local}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                                    <i class="fas fa-truck"></i> Fornecedor
                                </div>
                                <div style="font-weight: 600; color: #1f2937;">${produto.fornecedor}</div>
                            </div>
                        </div>
                        
                        <!-- Ações -->
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button onclick="abrirModalEditar(${idx})" 
                                    style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button onclick="excluirProduto(${idx})" 
                                    style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function abrirModalEditar(index) {
    const produtos = await obterDadosEstoque();
    const produto = produtos[index];
    
    if (!produto) return;
    
    document.getElementById('editProdutoId').value = index;
    document.getElementById('editCodigo').value = produto.codigo;
    document.getElementById('editNome').value = produto.nome;
    document.getElementById('editQuantidade').value = produto.quantidade;
    document.getElementById('editValor').value = produto.valor;
    document.getElementById('editLocal').value = produto.local;
    document.getElementById('editFornecedor').value = produto.fornecedor;
    
    document.getElementById('modalEditarProduto').classList.remove('hidden');
}

function fecharModalEditar() {
    document.getElementById('modalEditarProduto').classList.add('hidden');
    document.getElementById('formEditarProduto').reset();
}

async function salvarEdicaoProduto(event) {
    event.preventDefault();
    
    const index = parseInt(document.getElementById('editProdutoId').value);
    const produtoEditado = {
        codigo: document.getElementById('editCodigo').value,
        nome: document.getElementById('editNome').value,
        quantidade: parseInt(document.getElementById('editQuantidade').value),
        valor: parseFloat(document.getElementById('editValor').value),
        local: document.getElementById('editLocal').value,
        fornecedor: document.getElementById('editFornecedor').value
    };
    
    try {
        let produtos = await obterDadosEstoque();
        produtos[index] = produtoEditado;
        
        localStorage.setItem('estoque_produtos', JSON.stringify(produtos));
        
        console.log('[OK] Produto editado:', produtoEditado);
        
        showToast('Produto atualizado com sucesso!', 'success');
        fecharModalEditar();
        
        // Recarregar módulo
        const container = document.querySelector('.content-container');
        loadVisualizarModule(container);
        
    } catch (error) {
        console.error('[ERROR] Erro ao editar produto:', error);
        showToast('Erro ao editar produto', 'error');
    }
}

async function excluirProduto(index) {
    const produtos = await obterDadosEstoque();
    const produto = produtos[index];
    
    if (!confirm(`Deseja realmente excluir o produto "${produto.nome}"?`)) {
        return;
    }
    
    try {
        produtos.splice(index, 1);
        localStorage.setItem('estoque_produtos', JSON.stringify(produtos));
        
        console.log('[OK] Produto excluído:', produto.nome);
        
        showToast('Produto excluído com sucesso!', 'success');
        
        // Recarregar módulo
        const container = document.querySelector('.content-container');
        loadVisualizarModule(container);
        
    } catch (error) {
        console.error('[ERROR] Erro ao excluir produto:', error);
        showToast('Erro ao excluir produto', 'error');
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
        doc.setTextColor(37, 99, 235);
        doc.text('Quatro Cantos', 14, 22);
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Relatório de Estoque Completo', 14, 32);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 40);
        
        // Tabela
        const tableColumn = ["Código", "Produto", "Qtd", "Valor Unit.", "Total", "Local"];
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
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 3
            },
            headStyles: { 
                fillColor: [37, 99, 235],
                textColor: 255,
                fontStyle: 'bold'
            }
        });
        
        // Resumo
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFillColor(37, 99, 235);
        doc.rect(14, finalY, 182, 20, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(`Total de Produtos: ${produtos.length}`, 20, finalY + 8);
        doc.text(`Total de Itens: ${totalItens}`, 20, finalY + 14);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`Valor Total em Estoque: ${formatCurrency(valorTotalEstoque)}`, 110, finalY + 11);
        
        // Rodapé
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Sistema de Gestão Quatro Cantos - Gerado automaticamente', 14, 285);
        
        const filename = `Estoque_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}_${Date.now()}.pdf`;
        doc.save(filename);
        
        console.log('[OK] PDF exportado:', filename);
        showToast('PDF gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('[ERROR] Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF', 'error');
    } finally {
        hideLoading();
    }
}

// Expor funções globalmente
window.loadVisualizarModule = loadVisualizarModule;
window.abrirModalEditar = abrirModalEditar;
window.fecharModalEditar = fecharModalEditar;
window.salvarEdicaoProduto = salvarEdicaoProduto;
window.excluirProduto = excluirProduto;
window.exportarEstoquePDF = exportarEstoquePDF;

console.log('[OK] Módulo Visualizar Estoque pronto!');

