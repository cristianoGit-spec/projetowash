// ============================================================================
// MÓDULO ESTOQUE SAÍDA
// ============================================================================

function loadEstoqueSaidaModule(container) {
    const html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 1.25rem; border-bottom: 1px solid #f3f4f6;">
                <h3 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-truck-loading" style="color: #f59e0b; font-size: 0.875rem;"></i>
                    Registrar Venda/Saída
                </h3>
                <p style="color: #6b7280; font-size: 0.8125rem; margin: 0.375rem 0 0 1.375rem;">Controle de saída de produtos do estoque</p>
            </div>
            
            <!-- Form -->
            <div style="padding: 1.5rem;">
                <form id="formEstoqueSaida" onsubmit="venderProduto(event)">
                    <!-- Nome do Produto -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-search" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Nome do Produto
                        </label>
                        <input type="text" id="nomeProduto" name="nomeProduto" required placeholder="Digite o nome do produto"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Quantidade a Vender -->
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-cubes" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Quantidade a Vender
                        </label>
                        <input type="number" id="quantidadeVenda" name="quantidadeVenda" required min="1" placeholder="Ex: 50"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Botão Submit -->
                    <button type="submit" 
                            style="width: 100%; padding: 0.75rem; background: #f59e0b; color: white; border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease;"
                            onmouseover="this.style.background='#d97706'"
                            onmouseout="this.style.background='#f59e0b'">
                        <i class="fas fa-shopping-cart"></i>
                        Registrar Venda
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
