// ============================================================================
// MÓDULO ESTOQUE ENTRADA
// ============================================================================

function loadEstoqueEntradaModule(container) {
    const html = `
        <div class="card">
            <div class="card-header">
                <i class="fas fa-box-open"></i> Cadastrar Produto no Estoque
            </div>
            
            <form id="formEstoqueEntrada" onsubmit="cadastrarProduto(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="codigo"><i class="fas fa-barcode"></i> Código</label>
                        <input type="number" id="codigo" name="codigo" required min="1" placeholder="Ex: 001">
                    </div>
                    
                    <div class="form-group">
                        <label for="nome"><i class="fas fa-tag"></i> Nome do Produto</label>
                        <input type="text" id="nome" name="nome" required placeholder="Ex: Produto XYZ">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="quantidade"><i class="fas fa-cubes"></i> Quantidade</label>
                        <input type="number" id="quantidade" name="quantidade" required min="1" placeholder="Ex: 100">
                    </div>
                    
                    <div class="form-group">
                        <label for="data"><i class="fas fa-calendar"></i> Data de Fabricação</label>
                        <input type="date" id="data" name="data" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="fornecedor"><i class="fas fa-truck"></i> Fornecedor</label>
                        <input type="text" id="fornecedor" name="fornecedor" required placeholder="Nome do fornecedor">
                    </div>
                    
                    <div class="form-group">
                        <label for="local"><i class="fas fa-map-marker-alt"></i> Local no Armazém</label>
                        <input type="text" id="local" name="local" required placeholder="Ex: Corredor A, Prateleira 3">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="valor"><i class="fas fa-dollar-sign"></i> Valor Unitário (R$)</label>
                    <input type="number" id="valor" name="valor" required min="0" step="0.01" placeholder="Ex: 25.50">
                </div>
                
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-save"></i> Cadastrar Produto
                </button>
            </form>
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
        console.log('✅ Produto cadastrado - Atualizando dashboard...');
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
