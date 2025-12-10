// ============================================================================
// MÓDULO ESTOQUE SAÍDA - v40.14
// Layout Profissional e Responsivo
// ============================================================================

function loadEstoqueSaidaModule(container) {
    const html = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <!-- Card Principal -->
            <div style="background: white; border: 2px solid #f3f4f6; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <!-- Header com Gradiente -->
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-truck-loading" style="color: white; font-size: 1.75rem;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.5rem; font-weight: 600; color: white; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                                Registrar Venda/Saída
                            </h3>
                            <p style="color: rgba(255,255,255,0.9); font-size: 0.875rem; margin: 0.25rem 0 0 0;">Controle de saída de produtos do estoque</p>
                        </div>
                    </div>
                </div>
                
                <!-- Form Section -->
                <div style="padding: 2rem;">
                    <form id="formEstoqueSaida" onsubmit="venderProduto(event)">
                        <div style="display: grid; gap: 1.5rem;">
                            <!-- Nome do Produto -->
                            <div>
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #0f172a; margin-bottom: 0.625rem;">
                                    <i class="fas fa-search" style="color: #f59e0b; font-size: 0.875rem;"></i>
                                    Nome do Produto
                                </label>
                                <div style="position: relative;">
                                    <input type="text" 
                                           id="nomeProduto" 
                                           name="nomeProduto" 
                                           required 
                                           placeholder="Digite o nome do produto"
                                           list="produtos-list"
                                           style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9375rem; color: #0f172a; transition: all 0.2s ease; background: #f9fafb;"
                                           onfocus="this.style.borderColor='#f59e0b'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(245, 158, 11, 0.1)'"
                                           onblur="this.style.borderColor='#e5e7eb'; this.style.background='#f9fafb'; this.style.boxShadow='none'">
                                    <i class="fas fa-box" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.875rem;"></i>
                                    <datalist id="produtos-list">
                                        <!-- Preenchido dinamicamente -->
                                    </datalist>
                                </div>
                                <p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.375rem; margin-left: 0.25rem;">
                                    <i class="fas fa-info-circle" style="font-size: 0.625rem; margin-right: 0.25rem;"></i>
                                    Comece a digitar para buscar produtos
                                </p>
                            </div>
                            
                            <!-- Quantidade a Vender -->
                            <div>
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #0f172a; margin-bottom: 0.625rem;">
                                    <i class="fas fa-cubes" style="color: #f59e0b; font-size: 0.875rem;"></i>
                                    Quantidade a Vender
                                </label>
                                <div style="position: relative;">
                                    <input type="number" 
                                           id="quantidadeVenda" 
                                           name="quantidadeVenda" 
                                           required 
                                           min="1" 
                                           placeholder="Ex: 50"
                                           style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9375rem; color: #0f172a; transition: all 0.2s ease; background: #f9fafb;"
                                           onfocus="this.style.borderColor='#f59e0b'; this.style.background='white'; this.style.boxShadow='0 0 0 3px rgba(245, 158, 11, 0.1)'"
                                           onblur="this.style.borderColor='#e5e7eb'; this.style.background='#f9fafb'; this.style.boxShadow='none'">
                                    <i class="fas fa-hashtag" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.875rem;"></i>
                                </div>
                            </div>
                            
                            <!-- Botões de Ação -->
                            <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                                <button type="button" 
                                        onclick="document.getElementById('formEstoqueSaida').reset()"
                                        style="flex: 1; padding: 0.875rem 1.5rem; background: #f3f4f6; color: #374151; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease;"
                                        onmouseover="this.style.background='#e5e7eb'; this.style.borderColor='#d1d5db'"
                                        onmouseout="this.style.background='#f3f4f6'; this.style.borderColor='#e5e7eb'">
                                    <i class="fas fa-redo"></i>
                                    Limpar
                                </button>
                                <button type="submit" 
                                        style="flex: 2; padding: 0.875rem 1.5rem; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; border-radius: 8px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);"
                                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px -2px rgba(245, 158, 11, 0.4)'"
                                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(245, 158, 11, 0.3)'">
                                    <i class="fas fa-shopping-cart"></i>
                                    Registrar Venda
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    <!-- Resultado da Venda -->
                    <div id="resultadoVenda" class="hidden" style="margin-top: 2rem;"></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Carregar produtos para autocomplete
    carregarProdutosAutocomplete();
}

async function carregarProdutosAutocomplete() {
    try {
        const produtos = await obterDadosEstoque();
        const datalist = document.getElementById('produtos-list');
        
        if (datalist && produtos.length > 0) {
            datalist.innerHTML = produtos.map(p => 
                `<option value="${p.nome}">${p.nome} - Disponível: ${p.quantidade} un.</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

async function venderProduto(event) {
    event.preventDefault();
    
    const nomeProduto = document.getElementById('nomeProduto').value.trim();
    const quantidadeVenda = parseInt(document.getElementById('quantidadeVenda').value);
    
    if (!nomeProduto || quantidadeVenda <= 0) {
        showToast('❌ Preencha todos os campos corretamente', 'error');
        return;
    }
    
    showLoading('Registrando venda...');
    
    try {
        // Buscar o produto
        const produtos = await obterDadosEstoque();
        
        const produto = produtos.find(p => p.nome.toLowerCase() === nomeProduto.toLowerCase());
        
        if (!produto) {
            showToast(`❌ Produto "${nomeProduto}" não encontrado`, 'error');
            hideLoading();
            return;
        }
        
        if (produto.quantidade < quantidadeVenda) {
            showToast(`⚠️ Estoque insuficiente. Disponível: ${produto.quantidade}`, 'warning');
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
        
        showToast('✅ Venda registrada com sucesso!', 'success');
        document.getElementById('formEstoqueSaida').reset();
        
        // Atualizar Dashboard automaticamente
        console.log('[OK] Saída registrada - Atualizando dashboard...');
        if (typeof loadDashboard === 'function') {
            setTimeout(() => loadDashboard(), 500);
        }
        
    } catch (error) {
        console.error('Erro ao vender:', error);
        showToast(error.message || '❌ Erro ao registrar venda', 'error');
    } finally {
        hideLoading();
    }
}

function exibirResultadoVenda(data) {
    const resultado = document.getElementById('resultadoVenda');
    
    const html = `
        <!-- Banner de Sucesso -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-check-circle" style="color: white; font-size: 1.5rem;"></i>
                </div>
                <div>
                    <h4 style="color: white; font-size: 1.125rem; font-weight: 600; margin: 0;">Venda Registrada com Sucesso!</h4>
                    <p style="color: rgba(255,255,255,0.9); font-size: 0.875rem; margin: 0.25rem 0 0 0;">Produto: ${data.produto}</p>
                </div>
            </div>
        </div>
        
        <!-- Cards de Estatísticas -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <!-- Quantidade Vendida -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-box" style="color: white; font-size: 1.25rem;"></i>
                        </div>
                        <span style="color: rgba(255,255,255,0.9); font-size: 0.875rem; font-weight: 500;">Quantidade Vendida</span>
                    </div>
                    <h3 style="color: white; font-size: 2rem; font-weight: 700; margin: 0;">${formatNumber(data.quantidade)}</h3>
                    <p style="color: rgba(255,255,255,0.8); font-size: 0.8125rem; margin: 0.25rem 0 0 0;">unidades</p>
                </div>
            </div>
            
            <!-- Valor Total -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-money-bill-wave" style="color: white; font-size: 1.25rem;"></i>
                        </div>
                        <span style="color: rgba(255,255,255,0.9); font-size: 0.875rem; font-weight: 500;">Valor Total</span>
                    </div>
                    <h3 style="color: white; font-size: 2rem; font-weight: 700; margin: 0;">${formatCurrency(data.valorTotal)}</h3>
                    <p style="color: rgba(255,255,255,0.8); font-size: 0.8125rem; margin: 0.25rem 0 0 0;">${formatCurrency(data.valorUnitario)} / unidade</p>
                </div>
            </div>
        </div>
        
        <!-- Detalhes da Transação -->
        <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
            <h4 style="color: #0f172a; font-size: 0.9375rem; font-weight: 600; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                Detalhes da Transação
            </h4>
            
            <div style="display: grid; gap: 0.75rem;">
                <!-- Produto -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 8px;">
                    <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-tag" style="color: #f59e0b; font-size: 0.75rem;"></i>
                        Produto
                    </span>
                    <span style="color: #0f172a; font-size: 0.875rem; font-weight: 600;">${data.produto}</span>
                </div>
                
                <!-- Valor Unitário -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 8px;">
                    <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-dollar-sign" style="color: #f59e0b; font-size: 0.75rem;"></i>
                        Valor Unitário
                    </span>
                    <span style="color: #0f172a; font-size: 0.875rem; font-weight: 600;">${formatCurrency(data.valorUnitario)}</span>
                </div>
                
                <!-- Estoque Anterior -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 8px;">
                    <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-boxes" style="color: #f59e0b; font-size: 0.75rem;"></i>
                        Estoque Anterior
                    </span>
                    <span style="color: #0f172a; font-size: 0.875rem; font-weight: 600;">${formatNumber(data.estoqueAnterior)} unidades</span>
                </div>
                
                <!-- Estoque Atual -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border: 2px solid #fbbf24;">
                    <span style="color: #92400e; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-warehouse" style="font-size: 0.75rem;"></i>
                        Estoque Atual
                    </span>
                    <span style="color: #92400e; font-size: 1rem; font-weight: 700;">${formatNumber(data.estoqueAtual)} unidades</span>
                </div>
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
    
    // Scroll suave até o resultado
    setTimeout(() => {
        resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}
