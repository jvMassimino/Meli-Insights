// Declarações Globais
const campoDetalhes = document.querySelector('.product-details');
let currentProducts = new Set();
const containerPesquisa = document.querySelector('.container-pesquisa');
const campoTags = document.querySelector('.tags-container');

const produtos = [ //lista de anuncios a serem abertos
    { MLB: 'MLB5028365426' },
    { MLB: 'MLB5028417312' },
    { MLB: 'MLB1957162209' },
];

const Dadosprodutos = { // o ideal é usar um bando de dados, VALORES SIMBÓLICOS
    'MLB1957162209': { SKU: 'SKU1', CUSTO: '50', FRETE: '10' },
    'MLB5028365426': { SKU: 'SKU2', CUSTO: '60', FRETE: '15' },
    'MLB5028417312': { SKU: 'SKU3', CUSTO: '20', FRETE: '20' }
};

const goodTags = { // define se é ou não uma tag positiva
    "extended_warranty_eligible": true,
    "good_quality_thumbnail": true,
    "immediate_payment": true,
    "cart_eligible": true,
    "catalog_forewarning": false,
    "catalog_listing_eligible": true,
    "incomplete_technical_specs": false,
    "good_quality_picture": true,
    "shipping_discount_item": true,
    "loyalty_discount_eligible": true
};

const Tagstranlation = { // tradução para as tags
    "extended_warranty_eligible": "Garantia estendida",
    "good_quality_thumbnail": "Imagem de boa qualidade",
    "good_quality_picture": "Imagem de boa qualidade",
    "immediate_payment": "Pagamento imediato",
    "cart_eligible": "Elegível para compra",
    "catalog_forewarning": "Aviso de catalogo",
    "catalog_listing_eligible": "Elegível para catalogo",
    "incomplete_technical_specs": "Características do Produto incompletas",
    "shipping_discount_item": "Item com desconto de envio",
    "loyalty_discount_eligible": "Elegível para desconto de fidelidade"
};

const TipoDeAnuncio = { // Todo: Terminar lista de anuncios
    "gold_special": "Clássico",
    "gold_pro": "Premium",
}

// exibe o container de pesquisa
document.addEventListener('mousemove', (event) => { 
    if (event.clientY < 500) {
        containerPesquisa.classList.add("on");
    } else {
        containerPesquisa.classList.remove("on");
    }
});

// função para redirecionar para a página de edição do produto no Mercado livre
function redirecionarProduto(id) { 
    const url = `https://www.mercadolivre.com.br/anuncios/${id}/modificar/`;
    window.open(url, '_blank');
}

// Funções para consumir a Api no Mercado Livre
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        showAlert(`Erro ao buscar dados | ${error}:`);
        return null; // Retorna null em caso de erro
    }
}

async function consultar(MLB) {
    const url = `https://api.mercadolibre.com/items/${MLB}`;
    const data = await fetchData(url);
    if (data) {
        currentProducts.add(data);
    }
    return data; 
}

async function consultarSelerId(id) {
    const url = `https://api.mercadolibre.com/users/${id}`;
    return await fetchData(url);
}

//
async function gerarCampoVendedor(data) {
    const seller_id = data.seller_id;

    try {
        const dataSeller = await consultarSelerId(seller_id);

        if (!dataSeller) {
            console.error("Vendedor não encontrado.");
            return;
        }

        // niveis de Mercado Lider
        const mLider = {
            gold: "Gold",
            null: "Não",
            platinum: "Platinum",
            silver: "Silver"
        };

        // imagens dos níveis
        // ToDo: Exibir imagem ao lado do texto nos detalhes do produto
        const mLiderImg = {
            gold: "../img/MLiderGold.png",
            null: "../img/MLider.png",
            platinum: "../img/MLiderPlatinum.png",
            silver: "../img/MLider.png"
        }

        // Níveis de reputação
        const nivel = {
            "1_red": "Vermelho",
            "2_orange": "Laranja",
            "3_yellow": "Amarelo",
            "4_light_green": "Verde Claro",
            "5_green": "Verde",
            null: "Sem Nível"
        }

        const reputacaoText = dataSeller.seller_reputation.power_seller_status;
        const reputacao = mLider[reputacaoText] || "Desconhecido";
        const nivelRep = nivel[dataSeller.seller_reputation.level_id] || "Desconhecido";
        const p = document.createElement("p");

        p.innerHTML = `
        <div class="title"><b>Vendedor</b></div>
        <hr>
        <p><b>Vendido por</b> <i>${dataSeller.nickname}</i></p>
        <p><b>Endereço:</b> ${dataSeller.address.city || "Não disponível"}, ${dataSeller.address.state || "Não disponível"}</p>
        <p><b>Tipo de Usuário:</b> ${dataSeller.user_type || "Não disponível"}</p>
        <p><b>Perfil:</b> <a href="${dataSeller.permalink}">Acessar</a></p>
        <hr>
        <p><b>Reputação:</b> ${nivelRep || "Não disponível"}</p>
        <p><b>Mercado Lider:</b> ${reputacao}</p>
        <p><b>Vendas:</b> ${dataSeller.seller_reputation.transactions.total || "Não disponível"}</p>
    `;
        return p;
    } catch (error) {
        console.error("Erro ao consultar dados do vendedor:", error);
    }
}

function gerarTagsHTML(tags) {
    return tags.map(tag => {
        const traducao = Tagstranlation[tag] || tag;
        const isGood = goodTags[tag] ? ' <span class="good"></span>' : ' <span class="bad"></span>';
        return `<p>${isGood} ${traducao}</p>`;
    }).join('');
}

function gerarTagsObj(tags) {
    const tagsObj = new Set();

    tags.forEach(tag => {
        const traducao = Tagstranlation[tag] || tag;
        tagsObj.add(traducao);
    });
    console.log(tagsObj);
    return tagsObj;
}

// Função para exibir os detalhes
// Todo: implementar a exibição do lucro
async function mostrarDetalhes(li, toggleBtn, data) {
    toggleBtn.textContent = 'Menos detalhes';
    const detalhesDiv = document.createElement('div');
    const custo = parseInt(Dadosprodutos[data.id]?.CUSTO || 0);
    const preco = parseInt(data.price);
    const frete = parseInt(Dadosprodutos[data.id]?.FRETE || 0);
    console.log(custo, preco, frete);
    detalhesDiv.classList.add('detalhes');
    campoVendedor = await gerarCampoVendedor(data);
    detalhesDiv.innerHTML = `
    <div class="pEditar">
        <button id="btnEditar">Editar no Mercado Livre</button>
    </div>
    <div class="pHealth${data.id}" title="Indicador de saúde do Anúncio ${data.id}">
        <p><b>Qualidade do Anúncio</b></p>
    </div>
    <p class="pId"><b>ID:</b> ${data.id}</p>
    <p class="pName"><b>Nome:</b> ${data.title}</p>
    <p class="pSku"><b>SKU:</b> ${Dadosprodutos[data.id]?.SKU || 'Não disponível'}</p>
    <p class="pCusto"><b>Custo:</b> ${formatBRL(custo)}</p>
    <p class="pLucroP"><b>Lucro:</b></p>
    <p class="pPreco"><b>Preço:</b> ${formatBRL(preco)}</p>
    <hr>
    <div class="title" title="Super importante\nPode conter indicação de bloqueios">
        <b>Tags:</b>
    </div>
    <ul>${gerarTagsHTML(data.tags)}</ul>
`;

    li.appendChild(detalhesDiv);
    detalhesDiv.appendChild(campoVendedor);

    document.getElementById("btnEditar").addEventListener("click", () => {
        redirecionarProduto(data.id);
    });

    // Adiciona o evento de clique ao ID
    const pId = detalhesDiv.querySelector('.pId');
    pId.addEventListener("click", () => {
        navigator.clipboard.writeText(data.id).then(() => {
            showAlert('ID copiado: ' + data.id);
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
        });
    });

    const element = document.querySelector(`.pHealth${data.id}`);
    gerarGraficoHealth(data, element);
}

async function buscarProdutos() {
    limparResultado();
    const lista = campoDetalhes;

    for (const produto of produtos) {
        const data = await consultar(produto.MLB);
        exibirProduto(lista, data.title, data);
    }

    showAlert(`${contarAnuncios()} Produtos Carregados!`, 2000);

    coletarTags();
}

function isCatalog(data) { return data.catalog_listing; } // catalog_listing é boolean}

function exibirProduto(lista, nome, data) {
    const maxLength = 50;
    const title = nome.length > maxLength ? data.title.substring(0, maxLength) + '...' : data.title;
    const li = document.createElement('li');
    li.classList.add("anuncio", `${data.id}`, "noselect")
    const liHeader = document.createElement('div');
    liHeader.classList.add('header-produto');
    const div = document.createElement('div');
    const span = document.createElement('span');
    const img = document.createElement('img');
    const span2 = document.createElement('span');
    const liHeaderTop = document.createElement('div');
    liHeaderTop.classList.add("liHeaderTop");
    const liHederContent = document.createElement('div');
    liHederContent.classList.add("liHederContent");

    // etiquetas
    liHeaderTop.appendChild(gerarEtiquetas(data, 1));
    liHeaderTop.appendChild(gerarEtiquetas(data, 2));
    liHeaderTop.appendChild(gerarEtiquetas(data, 0));


    span2.classList.add("isCatalog")
    if (isCatalog(data)) { span2.textContent = "Catálogo"; liHeader.appendChild(span2); };
    img.src = data.thumbnail;
    img.style.width = "50px";
    div.classList = "produtName";
    div.textContent = title;

    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add("btnExibir");
    toggleBtn.textContent = 'Mais detalhes';
    toggleBtn.onclick = () => {
        const detalhes = li.querySelector('.detalhes');
        if (detalhes) {
            detalhes.remove();
            toggleBtn.textContent = 'Mais detalhes';
        } else {
            mostrarDetalhes(li, toggleBtn, data);
        }
    };
    span.appendChild(img);

    liHeader.appendChild(span);
    liHeader.appendChild(div);
    liHeader.appendChild(toggleBtn);
    liHederContent.appendChild(liHeader);
    li.appendChild(liHeaderTop)
    li.appendChild(liHederContent);
    lista.appendChild(li);
}

const formatBRL = (price) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);
};

function limparResultado() {
    campoDetalhes.innerHTML = ""; 
}

document.getElementById('expandAllBtn').addEventListener('click', async () => {
    const botoes = document.querySelectorAll('.btnExibir');

    botoes.forEach(botao => {
        if (botao.innerText === "Mais detalhes") {
            botao.click();
        }
    });
});

document.getElementById('recolAllBtn').addEventListener('click', async () => {
    const botoes = document.querySelectorAll('.btnExibir');

    botoes.forEach(botao => {
        if (botao.innerText === "Menos detalhes") {
            botao.click();
        }
    });
});

function showAlert(text , time = 1000, time2 = 500) {
    const div = document.createElement('div');
    div.innerHTML = text;
    div.style.position = 'fixed';
    div.style.bottom = '-100px'; // Inicia fora da tela
    div.style.left = '50%';
    div.style.transform = 'translate(-50%, 0)';
    div.style.width = '90%';
    div.style.maxWidth = '400px';
    div.style.padding = '20px';
    div.style.backgroundColor = '#fff';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    div.style.zIndex = '1000';
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    div.style.textAlign = 'center';
    document.body.appendChild(div);

    setTimeout(() => div.remove(), time);

    requestAnimationFrame(() => {
        div.style.opacity = '1';
        div.style.bottom = '20px';
        div.style.transform = 'translate(-50%, 0) scale(1.05)';
    });

    div.addEventListener('click', () => {
        div.style.opacity = '0';
        div.style.bottom = '-100px'; // Move para fora da tela
        div.style.transform = 'translate(-50%, 0) scale(0.95)';
        setTimeout(() => div.remove(), time2); // Remove após a transição
    });
}

function coletarTags() {
    const tagsCount = {};

    currentProducts.forEach(data => {
        data.tags.forEach(tag => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1;
        });
    });

    exibirTags(tagsCount);
}

function exibirTags(tagsCount) {
    campoTags.innerHTML = ''; 

    Object.entries(tagsCount).forEach(([tag, count]) => {
        const tagElement = document.createElement('div');
        tagElement.classList.add('tag');
        tagElement.textContent = `${Tagstranlation[tag] || tag} (${count})`;

        tagElement.onclick = () => filtrarProdutosPorTag(tag);

        campoTags.appendChild(tagElement);
    });
}

function filtrarProdutosPorTag(tag) {
    limparResultado(); 
    produtos.forEach(async produto => {
        const data = await consultar(produto.MLB);
        if (data.tags.includes(tag)) {
            exibirProduto(campoDetalhes, data.title, data);
        }
    });

    showAlert(`Produtos filtrados pela tag: ${Tagstranlation[tag] || tag}`);
}

function contarAnuncios(){
const anuncios = document.querySelectorAll('.anuncio');
return anuncios.length;
}

function limparFiltroDeTags() {
    limparResultado();
    currentProducts.clear();
    buscarProdutos(); 
}

document.getElementById('limparFiltroBtn').addEventListener('click', () => {
    limparFiltroDeTags();
});

function filtrarPorId(id) {
    limparResultado(); 

    const produtoEncontrado = produtos.find(produto => produto.MLB === id);

    if (produtoEncontrado) {
        consultar(produtoEncontrado.MLB).then(data => {
            exibirProduto(campoDetalhes, data.title, data);
            showAlert(`Produto encontrado: ${data.title}`);
        });
    } else {
        showAlert('Produto não encontrado!');
    }
}

document.getElementById('filtrarBtn').addEventListener('click', () => {
    const idInput = document.getElementById('idInput').value.trim();
    if (idInput) {
        filtrarPorId(idInput);
    } else {
        showAlert('Por favor, digite um ID.');
    }
});

function calcularLucro(custo, preco, frete) { //ToDo
    const embalagem = 0.75; // R$ 0,75
    const imposto = 0.08; // 8% em formato decimal
    const custoTotal = custo + frete + embalagem;
    const custoComImposto = custoTotal * (1 + imposto);
    const lucro = preco - custoComImposto;
    console.log(lucro);
    return lucro;
}
function gerarGraficoHealth(data, element) {
    const saude = data.health; // valor máximo 1
    const porcentagem = saude * 100; // Converte para porcentagem
    const posicaoX = porcentagem * 2.2; // 220px é a largura total da linha
    const saudePorCentagem = (saude * 100) 

    const graficoUI = `
    <div class="pontuacao">
    <span>${saudePorCentagem}%</span>
        <div class="line">
            <div class="point" style="left: ${posicaoX}px;"></div>
        </div>
    </div>
    `;

    element.innerHTML += graficoUI;
}

function formatarLucro(value) {
    const numValue = parseFloat(value);
    return `${numValue.toFixed(2)}%`;
}

function gerarTagsObj(tags) {
    const tagsObj = new Set();

    tags.forEach(tag => {
        const traducao = Tagstranlation[tag] || tag;
        tagsObj.add(traducao);
    });
    return tagsObj; // Retorna o conjunto de tags
}

function gerarEtiquetas(data, value) {
    const fragment = document.createDocumentFragment(); // Usamos um fragmento para adicionar múltiplos spans de forma eficiente
    const conteudo = {
        1: {
            content: TipoDeAnuncio[data.listing_type_id] || "Desconhecido",
            class: TipoDeAnuncio[data.listing_type_id] === "Clássico" ? "classico" : "premium"
        },
        2: {
            content: data.attributes.find(attr => attr.id === "ITEM_CONDITION")?.value_name || "Desconhecido",
            class: "novo"
        },
        0: {
            content: Array.from(gerarTagsObj(data.tags)), // Converte o Set em Array
            class: "tags"
        }
    };

    if (!conteudo[value]) {
        console.error("Valor inválido para gerar etiquetas:", value);
        return fragment; // Retorna o fragmento vazio
    }

    if (value === 0) {
        // Para o caso 0, cria um span para cada tag
        conteudo[value].content.forEach(tag => {
            const span = document.createElement('span');
            span.classList.add("etiqueta", conteudo[value].class); // Adiciona as classes
            span.textContent = tag; // Define o conteúdo do span como a tag
            fragment.appendChild(span); // Adiciona o span ao fragmento
        });
    } else { // Para os outros valores, cria um único span
        const span = document.createElement('span');
        span.classList.add("etiqueta", conteudo[value].class);
        span.textContent = conteudo[value].content; // Adiciona o conteúdo ao span
        fragment.appendChild(span); // Adiciona o span ao fragmento
    }
    return fragment; // Retorna o fragmento com os spans
}

window.addEventListener('load', buscarProdutos);