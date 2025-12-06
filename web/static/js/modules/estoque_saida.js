// ============================================================================
// MÓDULO ESTOQUE SAÍDA
// ============================================================================

function loadEstoqueSaidaModule(container) {
    const html = `
        <div class="card">
            <div class="card-header">
                <i class="fas fa-truck-loading"></i> Registrar Venda/Saída
            </div>
            
            <form id="formEstoqueSaida" onsubmit="venderProduto(event)">
                <div class="form-group">
                    <label for="nomeProduto"><i class="fas fa-search"></i> Nome do Produto</label>
                    <input type="text" id="nomeProduto" name="nomeProduto" required placeholder="Digite o nome do produto">
                </div>
                
                <div class="form-group">
                    <label for="quantidadeVenda"><i class="fas fa-cubes"></i> Quantidade a Vender</label>
                    <input type="number" id="quantidadeVenda" name="quantidadeVenda" required min="1" placeholder="Ex: 50">
                </div>
                
                <button type="submit" class="btn btn-warning">
                    <i class="fas fa-shopping-cart"></i> Registrar Venda
                </button>
            </form>
            
            <div id="resultadoVenda" class="mt-3 hidden"></div>
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
        
        // Atualizar visualização se estiver na tela de estoque
        console.log('Saída registrada - Dashboard será recarregado automaticamente');
        
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
        <div class="card alert alert-success">
            <h4><i class="fas fa-check-circle"></i> Venda Registrada com Sucesso!</h4>
            
            <div class="table-container">
                <table>
                    <tr>
                        <td><strong>Produto:</strong></td>
                        <td>${data.produto}</td>
                    </tr>
                    <tr>
                        <td><strong>Quantidade Vendida:</strong></td>
                        <td>${formatNumber(data.quantidade)} unidades</td>
                    </tr>
                    <tr>
                        <td><strong>Valor Unitário:</strong></td>
                        <td>${formatCurrency(data.valorUnitario)}</td>
                    </tr>
                    <tr>
                        <td><strong>Valor Total:</strong></td>
                        <td><strong>${formatCurrency(data.valorTotal)}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Estoque Anterior:</strong></td>
                        <td>${formatNumber(data.estoqueAnterior)}</td>
                    </tr>
                    <tr>
                        <td><strong>Estoque Atual:</strong></td>
                        <td>${formatNumber(data.estoqueAtual)}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    
    resultado.innerHTML = html;
    resultado.classList.remove('hidden');
}
