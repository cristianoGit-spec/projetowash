// ============================================================================
// CONFIGURAÇÁO DE SEGMENTOS E TIPOS DE MATERIAIS
// ============================================================================
// Define categorias e tipos de materiais baseados no segmento da empresa

const SEGMENTOS_EMPRESARIAIS = {
    construcao: {
        nome: "Construção Civil",
        icon: "fa-building",
        cor: "#d97706",
        categorias: [
            "Cimentos e Argamassas",
            "Tijolos e Blocos",
            "Areia e Brita",
            "Ferro e Aço",
            "Madeiras",
            "Telhas e Coberturas",
            "Pisos e Revestimentos",
            "Tintas e Vernizes",
            "Ferramentas",
            "Hidráulica",
            "Elétrica"
        ],
        unidades: ["SC", "M³", "M²", "M", "UN", "KG", "L", "GL"]
    },
    automotivo: {
        nome: "Automotivo",
        icon: "fa-car",
        cor: "#dc2626",
        categorias: [
            "Peças de Motor",
            "Suspensão e Freios",
            "Elétrica Automotiva",
            "Filtros",
            "Óleos e Lubrificantes",
            "Pneus e Rodas",
            "Lanternas e Faróis",
            "Bateria e Ignição",
            "Escapamento",
            "Acessórios"
        ],
        unidades: ["UN", "L", "KG", "JG", "PC"]
    },
    industrial: {
        nome: "Industrial",
        icon: "fa-industry",
        cor: "#059669",
        categorias: [
            "Máquinas e Equipamentos",
            "Ferramentas Industriais",
            "Componentes Eletrônicos",
            "Matéria-Prima",
            "Equipamentos de Segurança",
            "Rolamentos e Transmissão",
            "Válvulas e Conexões",
            "Instrumentação",
            "Motores Elétricos",
            "Automação"
        ],
        unidades: ["UN", "KG", "M", "PC", "CX", "RL"]
    },
    alimenticio: {
        nome: "Alimentício",
        icon: "fa-utensils",
        cor: "#16a34a",
        categorias: [
            "Grãos e Cereais",
            "Laticínios",
            "Carnes e Frios",
            "Frutas e Verduras",
            "Bebidas",
            "Temperos e Condimentos",
            "Massas",
            "Enlatados",
            "Doces e Sobremesas",
            "Produtos de Limpeza"
        ],
        unidades: ["KG", "L", "UN", "CX", "PCT", "FD"]
    },
    farmaceutico: {
        nome: "Farmacêutico",
        icon: "fa-pills",
        cor: "#2563eb",
        categorias: [
            "Medicamentos",
            "Antibióticos",
            "Anti-inflamatórios",
            "Vitaminas e Suplementos",
            "Cosméticos",
            "Higiene Pessoal",
            "Equipamentos Médicos",
            "Primeiros Socorros",
            "Dermocosméticos",
            "Genéricos"
        ],
        unidades: ["UN", "CX", "FR", "TB", "BS"]
    },
    eletroeletronico: {
        nome: "Eletroeletrônico",
        icon: "fa-microchip",
        cor: "#7c3aed",
        categorias: [
            "Componentes Eletrônicos",
            "Cabos e Conectores",
            "Placas de Circuito",
            "Baterias e Fontes",
            "Sensores",
            "Displays e LED",
            "Resistores e Capacitores",
            "Ferramentas Eletrônicas",
            "Equipamentos de Teste",
            "Acessórios"
        ],
        unidades: ["UN", "PC", "M", "RL", "CJ"]
    },
    textil: {
        nome: "Têxtil e Confecção",
        icon: "fa-shirt",
        cor: "#ec4899",
        categorias: [
            "Tecidos",
            "Linhas e Fios",
            "Aviamentos",
            "Botões e Zíperes",
            "Elásticos",
            "Rendas e Fitas",
            "Entretelas",
            "Etiquetas",
            "Embalagens",
            "Acessórios"
        ],
        unidades: ["M", "RL", "UN", "PCT", "CX", "GR"]
    },
    agricola: {
        nome: "Agrícola",
        icon: "fa-tractor",
        cor: "#65a30d",
        categorias: [
            "Sementes",
            "Fertilizantes",
            "Defensivos Agrícolas",
            "Ferramentas Agrícolas",
            "Irrigação",
            "Adubos",
            "Rações",
            "Equipamentos",
            "Mudas e Plantas",
            "Suplementos"
        ],
        unidades: ["KG", "L", "SC", "UN", "PCT", "M"]
    },
    quimico: {
        nome: "Químico",
        icon: "fa-flask",
        cor: "#0891b2",
        categorias: [
            "Produtos Químicos",
            "Solventes",
            "Ácidos e Bases",
            "Reagentes",
            "Catalisadores",
            "Pigmentos",
            "Resinas",
            "Aditivos",
            "Embalagens Químicas",
            "EPI Químico"
        ],
        unidades: ["L", "KG", "UN", "GL", "TB"]
    },
    papelaria: {
        nome: "Papelaria e Escritório",
        icon: "fa-pen",
        cor: "#f59e0b",
        categorias: [
            "Papéis e Cadernos",
            "Canetas e Lápis",
            "Pastas e Arquivos",
            "Materiais de Arte",
            "Informática",
            "Calculadoras",
            "Agendas",
            "Envelopes",
            "Etiquetas",
            "Acessórios"
        ],
        unidades: ["UN", "CX", "PCT", "RL", "RS"]
    }
};

// Tipos de materiais genéricos (aplicáveis a qualquer segmento)
const TIPOS_MATERIAL = [
    { value: "materia_prima", label: "Matéria-Prima", icon: "fa-cubes" },
    { value: "semi_acabado", label: "Semi-Acabado", icon: "fa-cog" },
    { value: "produto_acabado", label: "Produto Acabado", icon: "fa-box" },
    { value: "mro", label: "MRO (Manutenção)", icon: "fa-wrench" },
    { value: "consumivel", label: "Consumível", icon: "fa-shopping-cart" },
    { value: "embalagem", label: "Embalagem", icon: "fa-box-open" },
    { value: "ferramenta", label: "Ferramenta", icon: "fa-hammer" },
    { value: "epi", label: "EPI", icon: "fa-hard-hat" },
    { value: "componente", label: "Componente", icon: "fa-puzzle-piece" },
    { value: "acessorio", label: "Acessório", icon: "fa-plug" }
];

// Unidades de medida padrão
const UNIDADES_MEDIDA = [
    { value: "UN", label: "Unidade" },
    { value: "KG", label: "Quilograma" },
    { value: "G", label: "Grama" },
    { value: "L", label: "Litro" },
    { value: "ML", label: "Mililitro" },
    { value: "M", label: "Metro" },
    { value: "M²", label: "Metro Quadrado" },
    { value: "M³", label: "Metro Cúbico" },
    { value: "CM", label: "Centímetro" },
    { value: "PC", label: "Peça" },
    { value: "CX", label: "Caixa" },
    { value: "PCT", label: "Pacote" },
    { value: "FD", label: "Fardo" },
    { value: "SC", label: "Saco" },
    { value: "GL", label: "Galão" },
    { value: "RL", label: "Rolo" },
    { value: "TB", label: "Tubo" },
    { value: "FR", label: "Frasco" },
    { value: "BS", label: "Bisnaga" },
    { value: "JG", label: "Jogo" },
    { value: "CJ", label: "Conjunto" },
    { value: "RS", label: "Resma" },
    { value: "T", label: "Tonelada" }
];

// Função para obter configuração do segmento
function getSegmentoConfig(segmentoId) {
    return SEGMENTOS_EMPRESARIAIS[segmentoId] || null;
}

// Função para popular select de segmentos
function popularSelectSegmento(selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione o segmento</option>';
    
    Object.keys(SEGMENTOS_EMPRESARIAIS).forEach(key => {
        const segmento = SEGMENTOS_EMPRESARIAIS[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = segmento.nome;
        option.setAttribute('data-icon', segmento.icon);
        option.setAttribute('data-cor', segmento.cor);
        select.appendChild(option);
    });
}

// Função para popular select de categorias baseado no segmento
function popularSelectCategoria(segmentoId, selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;
    
    const segmento = getSegmentoConfig(segmentoId);
    
    select.innerHTML = '<option value="">Selecione a categoria</option>';
    
    if (segmento && segmento.categorias) {
        segmento.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            select.appendChild(option);
        });
    }
}

// Função para popular select de tipos de material
function popularSelectTipoMaterial(selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione o tipo</option>';
    
    TIPOS_MATERIAL.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.value;
        option.textContent = tipo.label;
        option.setAttribute('data-icon', tipo.icon);
        select.appendChild(option);
    });
}

// Função para popular select de unidades de medida
function popularSelectUnidadeMedida(selectElementId, segmentoId = null) {
    const select = document.getElementById(selectElementId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione a unidade</option>';
    
    // Se tiver segmento, usar unidades específicas
    if (segmentoId) {
        const segmento = getSegmentoConfig(segmentoId);
        if (segmento && segmento.unidades) {
            segmento.unidades.forEach(unidade => {
                const unidadeObj = UNIDADES_MEDIDA.find(u => u.value === unidade);
                if (unidadeObj) {
                    const option = document.createElement('option');
                    option.value = unidadeObj.value;
                    option.textContent = `${unidadeObj.value} - ${unidadeObj.label}`;
                    select.appendChild(option);
                }
            });
            return;
        }
    }
    
    // Caso contrário, mostrar todas
    UNIDADES_MEDIDA.forEach(unidade => {
        const option = document.createElement('option');
        option.value = unidade.value;
        option.textContent = `${unidade.value} - ${unidade.label}`;
        select.appendChild(option);
    });
}

// Função para aplicar tema do segmento
function aplicarTemaSegmento(segmentoId) {
    const segmento = getSegmentoConfig(segmentoId);
    if (!segmento) return;
    
    // Atualizar cor tema
    document.documentElement.style.setProperty('--primary-color', segmento.cor);
    
    // Salvar no localStorage
    localStorage.setItem('segmento_empresa', segmentoId);
    localStorage.setItem('tema_cor', segmento.cor);
}

// Função para carregar tema salvo
function carregarTemaSalvo() {
    const segmentoSalvo = localStorage.getItem('segmento_empresa');
    const corSalva = localStorage.getItem('tema_cor');
    
    if (corSalva) {
        document.documentElement.style.setProperty('--primary-color', corSalva);
    }
    
    return segmentoSalvo;
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarTemaSalvo();
});

console.log("Módulo de segmentos carregado com sucesso!");
