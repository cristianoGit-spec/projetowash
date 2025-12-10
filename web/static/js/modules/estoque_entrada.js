// ============================================================================
// MÓDULO ESTOQUE ENTRADA
// ============================================================================

function loadEstoqueEntradaModule(container) {
    const html = `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden;">
            <!-- Header -->
            <div style="padding: 1.25rem; border-bottom: 1px solid #f3f4f6;">
                <h3 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-box-open" style="color: #3b82f6; font-size: 0.875rem;"></i>
                    Cadastrar Produto no Estoque
                </h3>
            </div>
            
            <!-- Form -->
            <div style="padding: 1.5rem;">
                <form id="formEstoqueEntrada" onsubmit="cadastrarProduto(event)">
                    <!-- Código -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-barcode" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Código
                        </label>
                        <input type="number" id="codigo" name="codigo" required min="1" placeholder="Ex: 001"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Nome do Produto -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-tag" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Nome do Produto
                        </label>
                        <input type="text" id="nome" name="nome" required placeholder="Ex: Produto XYZ"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Quantidade -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-cubes" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Quantidade
                        </label>
                        <input type="number" id="quantidade" name="quantidade" required min="1" placeholder="Ex: 100"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Data de Fabricação -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-calendar" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Data de Fabricação
                        </label>
                        <input type="date" id="data" name="data" required
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Fornecedor -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-truck" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Fornecedor
                        </label>
                        <input type="text" id="fornecedor" name="fornecedor" required placeholder="Nome do fornecedor"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Local no Armazém -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-map-marker-alt" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Local no Armazém
                        </label>
                        <input type="text" id="local" name="local" required placeholder="Ex: Corredor A, Prateleira 3"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Valor Unitário -->
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                            <i class="fas fa-dollar-sign" style="color: #6b7280; font-size: 0.75rem;"></i>
                            Valor Unitário (R$)
                        </label>
                        <input type="number" id="valor" name="valor" required min="0" step="0.01" placeholder="Ex: 25.50"
                               style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; color: #0f172a; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                               onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Botão Submit -->
                    <button type="submit" class="btn btn-success" 
                            style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease;"
                            onmouseover="this.style.background='#059669'"
                            onmouseout="this.style.background='#10b981'">
                        <i class="fas fa-save"></i>
                        Cadastrar Produto
                    </button>
                </form>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

async function cadastrarProduto(event) {
    event.preventDefault();
    
    // Validação dos campos
    const codigo = document.getElementById('codigo').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const quantidade = document.getElementById('quantidade').value.trim();
    const data = document.getElementById('data').value.trim();
    const fornecedor = document.getElementById('fornecedor').value.trim();
    const local = document.getElementById('local').value.trim();
    const valor = document.getElementById('valor').value.trim();
    
    if (!codigo || !nome || !quantidade || !data || !fornecedor || !local || !valor) {
        showToast('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    showLoading('Cadastrando produto...');
    
    try {
        const formData = {
            codigo: parseInt(codigo),
            nome: nome,
            quantidade: parseInt(quantidade),
            data: data,
            fornecedor: fornecedor,
            local: local,
            valor: parseFloat(valor)
        };
        
        await salvarProdutoEstoque(formData);
        
        showToast('Produto cadastrado com sucesso!', 'success');
        document.getElementById('formEstoqueEntrada').reset();
        
        // Atualizar Dashboard automaticamente
        console.log('[OK] Produto cadastrado - Atualizando dashboard...');
        if (typeof loadDashboard === 'function') {
            setTimeout(() => loadDashboard(), 500);
        }
        
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        showToast(error.message || 'Erro ao cadastrar produto', 'error');
    } finally {
        hideLoading();
    }
}
