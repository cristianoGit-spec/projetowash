// Modo Local/Demo - Banco de Dados Simulado
// Use este arquivo APENAS para testes locais sem Firebase

let localEstoque = [];
let localMovimentacoes = [];
let localFinanceiro = [];
let localFolhaPagamento = [];

// Carregar dados do localStorage
function loadLocalData() {
    const estoque = localStorage.getItem('localEstoque');
    if (estoque) localEstoque = JSON.parse(estoque);
    
    const movimentacoes = localStorage.getItem('localMovimentacoes');
    if (movimentacoes) localMovimentacoes = JSON.parse(movimentacoes);
    
    const financeiro = localStorage.getItem('localFinanceiro');
    if (financeiro) localFinanceiro = JSON.parse(financeiro);
    
    const folha = localStorage.getItem('localFolhaPagamento');
    if (folha) localFolhaPagamento = JSON.parse(folha);
}

// Salvar dados no localStorage
function saveLocalData() {
    localStorage.setItem('localEstoque', JSON.stringify(localEstoque));
    localStorage.setItem('localMovimentacoes', JSON.stringify(localMovimentacoes));
    localStorage.setItem('localFinanceiro', JSON.stringify(localFinanceiro));
    localStorage.setItem('localFolhaPagamento', JSON.stringify(localFolhaPagamento));
}

// Listar produtos
async function listarProdutosLocal() {
    if (localCurrentUser && localCurrentUser.companyId) {
        return localEstoque.filter(p => p.companyId === localCurrentUser.companyId);
    }
    return localEstoque;
}

// Obter dados do estoque (alias para compatibilidade com visualizar_estoque.js)
async function obterDadosEstoque() {
    return await listarProdutosLocal();
}

// Cadastrar produto
async function cadastrarProdutoFirestoreLocal(codigo, nome, quantidade, data, fornecedor, local, valor) {
    // Verificar duplicata (no contexto da empresa)
    const existente = localEstoque.find(p => p.codigo === codigo && 
        (localCurrentUser ? p.companyId === localCurrentUser.companyId : true));
        
    if (existente) {
        throw new Error('Ja existe um produto com este codigo');
    }
    
    const produto = {
        id: 'prod-' + Date.now(),
        companyId: localCurrentUser ? localCurrentUser.companyId : 'comp-default',
        codigo,
        nome,
        quantidade,
        data,
        fornecedor,
        local,
        valor,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    
    localEstoque.push(produto);
    
    // Registrar movimentacao
    localMovimentacoes.push({
        id: 'mov-' + Date.now(),
        companyId: localCurrentUser ? localCurrentUser.companyId : 'comp-default',
        tipo: 'entrada',
        subtipo: 'compra',
        produtoId: produto.id,
        produtoNome: nome,
        quantidade: quantidade,
        valorUnitario: valor,
        valorTotal: quantidade * valor,
        usuarioId: localCurrentUser?.uid || 'sistema',
        usuarioNome: localCurrentUser?.nome || 'Sistema',
        timestamp: new Date().toISOString()
    });
    
    saveLocalData();
    return produto;
}

// Registrar saida
async function registrarSaidaProdutoLocal(produtoId, quantidadeSaida, valorVenda) {
    const produto = localEstoque.find(p => p.id === produtoId);
    if (!produto) {
        throw new Error('Produto nao encontrado');
    }
    
    if (quantidadeSaida > produto.quantidade) {
        throw new Error('Quantidade insuficiente em estoque');
    }
    
    produto.quantidade -= quantidadeSaida;
    produto.atualizadoEm = new Date().toISOString();
    
    // Registrar movimentacao
    localMovimentacoes.push({
        id: 'mov-' + Date.now(),
        companyId: localCurrentUser ? localCurrentUser.companyId : 'comp-default',
        tipo: 'saida',
        subtipo: 'venda',
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: quantidadeSaida,
        valorUnitario: valorVenda,
        valorTotal: quantidadeSaida * valorVenda,
        usuarioId: localCurrentUser?.uid || 'sistema',
        usuarioNome: localCurrentUser?.nome || 'Sistema',
        timestamp: new Date().toISOString()
    });
    
    saveLocalData();
    return produto;
}

// Salvar calculo financeiro
async function salvarCalculoFinanceiroLocal(dados) {
    const calculo = {
        id: 'fin-' + Date.now(),
        companyId: localCurrentUser ? localCurrentUser.companyId : 'comp-default',
        ...dados,
        usuarioId: localCurrentUser?.uid || 'sistema',
        usuarioNome: localCurrentUser?.nome || 'Sistema',
        timestamp: new Date().toISOString()
    };
    
    localFinanceiro.push(calculo);
    saveLocalData();
    return calculo;
}

// Salvar folha de pagamento
async function salvarFolhaPagamentoLocal(dados) {
    const folha = {
        id: 'folha-' + Date.now(),
        companyId: localCurrentUser ? localCurrentUser.companyId : 'comp-default',
        ...dados,
        usuarioId: localCurrentUser?.uid || 'sistema',
        usuarioNome: localCurrentUser?.nome || 'Sistema',
        timestamp: new Date().toISOString()
    };
    
    localFolhaPagamento.push(folha);
    saveLocalData();
    return folha;
}

// Buscar estatisticas
async function buscarEstatisticasLocal() {
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Filtrar por empresa
    const estoqueFiltrado = localCurrentUser ? localEstoque.filter(p => p.companyId === localCurrentUser.companyId) : localEstoque;
    const movimentacoesFiltradas = localCurrentUser ? localMovimentacoes.filter(m => m.companyId === localCurrentUser.companyId) : localMovimentacoes;
    
    // Total de produtos únicos
    const totalProdutos = estoqueFiltrado.length;
    
    // Total de itens em estoque (soma de quantidades)
    const totalItens = estoqueFiltrado.reduce((sum, p) => sum + (p.quantidade || 0), 0);
    
    // Valor total em estoque
    const valorTotal = estoqueFiltrado.reduce((sum, p) => sum + ((p.quantidade || 0) * (p.valor || 0)), 0);
    
    // Vendas do mês atual (saídas)
    const vendasMes = movimentacoesFiltradas
        .filter(m => {
            const data = new Date(m.timestamp);
            return m.tipo === 'saida' && data >= inicioMes;
        })
        .reduce((sum, m) => sum + ((m.quantidade || m.quantidadeVendida || 0) * (m.valorVenda || m.valorUnitario || 0)), 0);
    
    // Movimentações dos últimos 7 dias
    const movimentacoesRecentes = movimentacoesFiltradas.filter(m => {
        const data = new Date(m.timestamp);
        return data >= seteDiasAtras;
    });
    
    const entradasRecentes = movimentacoesRecentes.filter(m => m.tipo === 'entrada').length;
    const saidasRecentes = movimentacoesRecentes.filter(m => m.tipo === 'saida').length;
    
    return {
        totalProdutos,
        totalItens,
        valorTotal,
        vendasMes,
        entradasRecentes,
        saidasRecentes,
        movimentacoes: movimentacoesFiltradas.slice(-10).reverse()
    };
}

// Buscar historico completo (para graficos)
async function buscarHistoricoLocal() {
    if (localCurrentUser) {
        return localMovimentacoes.filter(m => m.companyId === localCurrentUser.companyId);
    }
    return localMovimentacoes;
}

// Listar usuários da empresa (modo local)
function listarUsuariosDaEmpresaLocal() {
    if (!localCurrentUser || !localCurrentUser.companyId) {
        console.error('CompanyId não encontrado');
        return [];
    }
    
    // Filtrar usuários pela mesma empresa
    return localUsers.filter(user => user.companyId === localCurrentUser.companyId);
}

// Realizar backup
async function realizarBackupLocal() {
    const backup = {
        id: 'backup-' + Date.now(),
        estoque: localEstoque,
        movimentacoes: localMovimentacoes,
        financeiro: localFinanceiro,
        folhaPagamento: localFolhaPagamento,
        usuarios: localUsers,
        timestamp: new Date().toISOString(),
        usuarioId: localCurrentUser?.uid || 'sistema',
        usuarioNome: localCurrentUser?.nome || 'Sistema'
    };
    
    // Download como arquivo JSON
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    return backup;
}

// Inicializar
loadLocalData();

console.log('Modo Local/Demo - Banco de dados simulado ativado!');
