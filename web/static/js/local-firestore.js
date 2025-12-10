// Modo Local/Demo - Banco de Dados Simulado
// Use este arquivo APENAS para testes locais sem Firebase

let localEstoque = [];
let localMovimentacoes = [];
let localFinanceiro = [];
let localFolhaPagamento = [];

// Inicializar dados de exemplo (seed data)
function initSeedData() {
    const hoje = new Date();
    const companyId = 'comp-default';
    
    // Produtos de exemplo
    const produtosExemplo = [
        { codigo: 'PROD001', nome: 'Sabão em Pó 1kg', quantidade: 50, valor: 8.50, fornecedor: 'Distribuidora ABC', local: 'Prateleira A1' },
        { codigo: 'PROD002', nome: 'Amaciante 2L', quantidade: 30, valor: 12.00, fornecedor: 'Fornecedor XYZ', local: 'Prateleira A2' },
        { codigo: 'PROD003', nome: 'Detergente 500ml', quantidade: 80, valor: 3.50, fornecedor: 'Distribuidora ABC', local: 'Prateleira B1' },
        { codigo: 'PROD004', nome: 'Alvejante 1L', quantidade: 40, valor: 6.00, fornecedor: 'Fornecedor XYZ', local: 'Prateleira B2' },
        { codigo: 'PROD005', nome: 'Esponja Multiuso', quantidade: 100, valor: 2.00, fornecedor: 'Distribuidora ABC', local: 'Prateleira C1' }
    ];
    
    localEstoque = produtosExemplo.map((p, index) => ({
        id: 'prod-seed-' + (index + 1),
        companyId,
        ...p,
        data: new Date(hoje.getTime() - (30 - index * 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        criadoEm: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        atualizadoEm: new Date().toISOString()
    }));
    
    // Movimentações de exemplo (entradas e saídas dos últimos 30 dias)
    localMovimentacoes = [];
    
    // Entradas (15 entradas nos últimos 30 dias)
    for (let i = 0; i < 15; i++) {
        const produtoIndex = Math.floor(Math.random() * produtosExemplo.length);
        const produto = produtosExemplo[produtoIndex];
        const diasAtras = Math.floor(Math.random() * 30);
        const quantidade = Math.floor(Math.random() * 30) + 10;
        
        localMovimentacoes.push({
            id: 'mov-entrada-' + i,
            companyId,
            tipo: 'entrada',
            produtoId: 'prod-seed-' + (produtoIndex + 1),
            codigo: produto.codigo,
            nome: produto.nome,
            quantidade,
            valorUnitario: produto.valor,
            fornecedor: produto.fornecedor,
            timestamp: new Date(hoje.getTime() - diasAtras * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    // Saídas (20 saídas nos últimos 30 dias)
    for (let i = 0; i < 20; i++) {
        const produtoIndex = Math.floor(Math.random() * produtosExemplo.length);
        const produto = produtosExemplo[produtoIndex];
        const diasAtras = Math.floor(Math.random() * 30);
        const quantidade = Math.floor(Math.random() * 10) + 1;
        const valorVenda = produto.valor * (1.3 + Math.random() * 0.5); // Margem de 30% a 80%
        
        localMovimentacoes.push({
            id: 'mov-saida-' + i,
            companyId,
            tipo: 'saida',
            produtoId: 'prod-seed-' + (produtoIndex + 1),
            codigo: produto.codigo,
            nome: produto.nome,
            quantidade,
            quantidadeVendida: quantidade,
            valorUnitario: produto.valor,
            valorVenda,
            timestamp: new Date(hoje.getTime() - diasAtras * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    // Ordenar por timestamp
    localMovimentacoes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    console.log('🌱 Dados de exemplo inicializados:', localEstoque.length, 'produtos,', localMovimentacoes.length, 'movimentações');
    saveLocalData();
}

// Carregar dados do localStorage
function loadLocalData() {
    const estoque = localStorage.getItem('localEstoque');
    if (estoque) {
        localEstoque = JSON.parse(estoque);
        console.log('📦 Estoque carregado:', localEstoque.length, 'produtos');
    } else {
        console.log('📦 Nenhum estoque encontrado no localStorage - Inicializando dados de exemplo...');
        initSeedData();
        return; // Retorna pois initSeedData já salva os dados
    }
    
    const movimentacoes = localStorage.getItem('localMovimentacoes');
    if (movimentacoes) {
        localMovimentacoes = JSON.parse(movimentacoes);
        console.log('📊 Movimentações carregadas:', localMovimentacoes.length);
    } else {
        console.log('📊 Nenhuma movimentação encontrada');
    }
    
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
    
    // Registrar movimentacao com campos consistentes
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
        usuario: localCurrentUser?.nome || 'Sistema', // Alias para compatibilidade
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
    
    // Calcular valor total
    const valorTotal = quantidadeSaida * valorVenda;
    
    // Registrar movimentacao com TODOS os campos necessários
    localMovimentacoes.push({
        id: 'mov-' + Date.now(),
        companyId: localCurrentUser ? localCurrentUser.companyId : 'comp-default',
        tipo: 'saida',
        subtipo: 'venda',
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: quantidadeSaida,
        quantidadeVendida: quantidadeSaida, // Alias para compatibilidade
        valorUnitario: valorVenda,
        valorVenda: valorVenda, // Campo principal para histórico
        valorTotal: valorTotal,
        usuarioId: localCurrentUser?.uid || 'sistema',
        usuarioNome: localCurrentUser?.nome || 'Sistema',
        usuario: localCurrentUser?.nome || 'Sistema', // Alias para compatibilidade
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
