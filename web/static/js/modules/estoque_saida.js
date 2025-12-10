// ============================================================================
// MÓDULO ESTOQUE SAÍDA
// ============================================================================

function loadEstoqueSaidaModule(container) {
    const html = `
        <div class="card modern-card">
            <div class="card-header modern-header">
                <div class="header-content">
                    <div class="header-icon">
                        <i class="fas fa-truck-loading"></i>
                    </div>
                    <div class="header-text">
                        <h3>Registrar Venda/Saída</h3>
                        <p class="subtitle">Controle de saída de produtos do estoque</p>
                    </div>
                </div>
            </div>
            
            <div class="card-body modern-body">
                <form id="formEstoqueSaida" onsubmit="venderProduto(event)">
                    <div class="form-group modern-form-group">
                        <label class="modern-label">
                            <i class="fas fa-search"></i>
                            <span>Nome do Produto</span>
                        </label>
                        <input type="text" id="nomeProduto" name="nomeProduto" 
                               class="modern-input" required 
                               placeholder="Digite o nome do produto">
                    </div>
                    
                    <div class="form-group modern-form-group">
                        <label class="modern-label">
                            <i class="fas fa-cubes"></i>
                            <span>Quantidade a Vender</span>
                        </label>
                        <input type="number" id="quantidadeVenda" name="quantidadeVenda" 
                               class="modern-input" required min="1" 
                               placeholder="Ex: 50">
                    </div>
                    
                    <button type="submit" class="btn btn-warning modern-btn-warning">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Registrar Venda</span>
                    </button>
                </form>
                
                <div id="resultadoVenda" class="mt-3 hidden"></div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

async function venderProduto(event) {
    event.preventDefault();
    
    const nomeProduto = document.getElementById('nomeProduto').value.trim();
    const quantidadeVenda = parseInt(document.getElementById('quantidadeVenda').value);
    
    if (!nomeProduto || quantidadeVenda <= 0) {
        showToast('Preencha todos os campos corretamente', 'error');
        return;
    }
    
    showLoading('Registrando venda...');
    
    try {
        // Buscar o produto
        const produtos = await obterDadosEstoque();
        
        const produto = produtos.find(p => p.nome.toLowerCase() === nomeProduto.toLowerCase());
        
        if (!produto) {
            showToast(` Produto "${nomeProduto}" não encontrado`, 'error');
            hideLoading();
            return;
        }
        
        if (produto.quantidade < quantidadeVenda) {
            showToast(` Estoque insuficiente. Disponível: ${produto.quantidade}`, 'warning');
            hideLoading();
            return;
        }
        
        // Registrar saída
        const valorVenda = produto.valor * 1.3; // Margem de 30%
        await registrarSaidaEstoque(produto.nome, quantidadeVenda, produto.id, valorVenda);
        
        // Exibir resultado
        exibirResultadoVenda({
            produto: produto.nome,
            quantidade: quantidadeVenda,
            valorUnitario: valorVenda,
            valorTotal: quantidadeVenda * valorVenda,
            estoqueAnterior: produto.quantidade,
            estoqueAtual: produto.quantidade - quantidadeVenda
        });
        
        showToast('Venda registrada com sucesso!', 'success');
        document.getElementById('formEstoqueSaida').reset();
        
        // Atualizar Dashboard automaticamente
        console.log('[OK] Saída registrada - Atualizando dashboard...');
        if (typeof loadDashboard === 'function') {
            setTimeout(() => loadDashboard(), 500);
        }
        
    } catch (error) {
        console.error('Erro ao vender:', error);
        showToast(error.message || 'Erro ao registrar venda', 'error');
    } finally {
        hideLoading();
    }
}

function exibirResultadoVenda(data) {
    const resultado = document.getElementById('resultadoVenda');
    
    const html = `
        <div class="results-section">
            <div class="success-banner">
                <i class="fas fa-check-circle"></i>
                <span>Venda Registrada com Sucesso!</span>
            </div>
            
            <div class="stats-grid grid-2">
                <div class="stat-card green">
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${formatNumber(data.quantidade)}</h3>
                        <p>Quantidade Vendida</p>
                    </div>
                </div>
                
                <div class="stat-card blue">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${formatCurrency(data.valorTotal)}</h3>
                        <p>Valor Total</p>
                    </div>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-tag"></i> Produto</span>
                    <span class="info-value">${data.produto}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-dollar-sign"></i> Valor Unitário</span>
                    <span class="info-value">${formatCurrency(data.valorUnitario)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-boxes"></i> Estoque Anterior</span>
                    <span class="info-value">${formatNumber(data.estoqueAnterior)} unidades</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><i class="fas fa-warehouse"></i> Estoque Atual</span>
                    <span class="info-value highlight">${formatNumber(data.estoqueAtual)} unidades</span>
                </div>
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
}
