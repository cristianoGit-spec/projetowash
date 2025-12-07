// ============================================================================
// MODULES LOADER - Carregador Modular de Módulos
// Arquivo: modules.js
// Versão: 2.0 (Refatorado - Sem Duplicação)
// ============================================================================
// Este arquivo APENAS carrega os módulos individuais dinamicamente
// Cada módulo está em seu próprio arquivo em /static/js/modules/
// ============================================================================

console.log('📦 Modules Loader v2.0 - Carregando módulos individuais...');

// ============================================================================
// CONFIGURAÇÃO DE MÓDULOS DISPONÍVEIS
// ============================================================================
const AVAILABLE_MODULES = {
    'dashboard': {
        path: './static/js/dashboard.js',
        loadFunction: 'loadDashboard',
        isSpecial: true // Dashboard não usa modal, renderiza na seção principal
    },
    'operacional': {
        path: './static/js/modules/operacional.js',
        loadFunction: 'loadOperacionalModule'
    },
    'estoque-entrada': {
        path: './static/js/modules/estoque_entrada.js',
        loadFunction: 'loadEstoqueEntradaModule'
    },
    'estoque-saida': {
        path: './static/js/modules/estoque_saida.js',
        loadFunction: 'loadEstoqueSaidaModule'
    },
    'financeiro': {
        path: './static/js/modules/financeiro.js',
        loadFunction: 'loadFinanceiroModule'
    },
    'rh': {
        path: './static/js/modules/rh.js',
        loadFunction: 'loadRHModule'
    },
    'visualizar': {
        path: './static/js/modules/visualizar_estoque.js',
        loadFunction: 'loadVisualizarModule'
    },
    'historico': {
        path: './static/js/modules/historico.js',
        loadFunction: 'loadHistoricoModule'
    }
};

// Cache de módulos já carregados para evitar recarregar
const loadedModules = new Set();

// ============================================================================
// FUNÇÃO DE CARREGAMENTO DINÂMICO
// ============================================================================
/**
 * Carrega um módulo dinamicamente se ainda não estiver carregado
 * @param {string} moduleName - Nome do módulo (ex: 'operacional', 'rh')
 * @returns {Promise<void>}
 */
async function loadModule(moduleName) {
    // Se já carregou, não recarrega
    if (loadedModules.has(moduleName)) {
        console.log(`✅ Módulo ${moduleName} já carregado (cache)`);
        return Promise.resolve();
    }

    const moduleConfig = AVAILABLE_MODULES[moduleName];

    if (!moduleConfig) {
        console.error(`❌ Módulo ${moduleName} não encontrado!`);
        return Promise.reject(new Error(`Módulo ${moduleName} não existe`));
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = moduleConfig.path + '?v=16'; // Cache bust v16 - FIX: RH Híbrido Firebase+LocalStorage
        script.async = false; // Carrega em ordem

        script.onload = () => {
            loadedModules.add(moduleName);
            console.log(`✅ Módulo ${moduleName} carregado com sucesso`);
            resolve();
        };

        script.onerror = () => {
            console.error(`❌ Erro ao carregar módulo ${moduleName}`);
            reject(new Error(`Falha ao carregar ${moduleName}`));
        };

        document.head.appendChild(script);
    });
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE ROTEAMENTO
// ============================================================================
/**
 * Carrega o módulo apropriado baseado no nome
 * Chamado por app.js quando o usuário navega
 * @param {string} moduleName - Nome do módulo
 * @param {HTMLElement} container - Container onde renderizar
 */
async function loadModuleContent(moduleName, container) {
    try {
        showLoading(`Carregando módulo ${moduleName}...`);

        // Carregar script do módulo se necessário
        await loadModule(moduleName);

        // Obter função de carregamento do módulo
        const moduleConfig = AVAILABLE_MODULES[moduleName];
        const loadFunction = moduleConfig.loadFunction;

        if (typeof window[loadFunction] === 'function') {
            window[loadFunction](container);
            console.log(`✅ Conteúdo do módulo ${moduleName} renderizado`);
        } else {
            console.warn(`⚠️ Função ${loadFunction} não encontrada`);
            container.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Módulo ${moduleName} ainda não implementado.
                </div>
            `;
        }

        hideLoading();
    } catch (error) {
        console.error(`❌ Erro ao carregar módulo ${moduleName}:`, error);
        hideLoading();

        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle"></i>
                Erro ao carregar módulo. Tente novamente.
            </div>
        `;
    }
}
// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================
/**
 * Pré-carrega módulos mais usados em background
 */
function preloadPopularModules() {
    const popularModules = ['operacional', 'rh', 'visualizar'];

    setTimeout(() => {
        popularModules.forEach(module => {
            loadModule(module).catch(() => {
                // Silenciosamente ignora erros de pré-carga
            });
        });
        console.log('🚀 Módulos populares pré-carregados');
    }, 2000); // Após 2s da página carregar
}

// Executar pré-carga quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadPopularModules);
} else {
    preloadPopularModules();
}

// Expor funções globalmente para uso em app.js
window.loadModuleContent = loadModuleContent;
window.loadModule = loadModule;

console.log('✅ Modules Loader pronto!');

