document.addEventListener("DOMContentLoaded", () => {
    // Vetor do carrinho de compras
    let carrinho = [];

    // Seletores de elementos do DOM
    const productListContainer = document.getElementById("product-list");
    const cartDropdown = document.getElementById("cart-dropdown");
    const cartCount = document.getElementById("cart-count");
    const pageTitle = document.getElementById("page-title");
    const searchForm = document.getElementById("form-pesquisa");
    const searchInput = document.getElementById("input-pesquisa");

    /**
     * ETAPA 2 e 6: Renderiza os produtos na tela
     * @param {Array} produtosParaRenderizar - A lista de produtos a ser exibida.
     */
    function renderizarProdutos(produtosParaRenderizar) {
        productListContainer.innerHTML = ""; // Limpa a lista de produtos existente
        produtosParaRenderizar.forEach(produto => {
            const card = document.createElement("div");
            card.className = "col";
            card.innerHTML = `
                <div class="card h-100">
                    ${produto.qtdEstoque === 0 ? '<div class="esgotado">ESGOTADO</div>' : ''}
                    <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">Estoque: ${produto.qtdEstoque}</p>
                        <p class="card-text fw-bold">R$ ${produto.valor.toFixed(2).replace('.',',')}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary w-100 add-to-cart-btn" 
                                data-id="${produto.id}" 
                                ${produto.qtdEstoque === 0 ? 'disabled' : ''}>
                            ${produto.qtdEstoque > 0 ? 'ADICIONAR' : 'Produto Indisponível'}
                        </button>
                    </div>
                </div>
            `;
            productListContainer.appendChild(card);
        });
    }

    /**
     * ETAPA 4: Renderiza os itens no dropdown do carrinho
     */
    function renderizarCarrinho() {
        cartDropdown.innerHTML = ""; // Limpa o dropdown

        if (carrinho.length === 0) {
            cartDropdown.innerHTML = '<p class="text-center p-2">Seu carrinho está vazio.</p>';
            cartCount.textContent = 0;
            return;
        }

        let total = 0;
        let totalItens = 0;

        carrinho.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'dropdown-item-text';
            itemDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${item.nome}</strong><br>
                        <small>Qtd: ${item.quantidade} | R$ ${item.valor.toFixed(2).replace('.',',')}</small>
                    </div>
                    <button class="btn btn-danger btn-sm remove-from-cart-btn" data-id="${item.id}">X</button>
                </div>
            `;
            cartDropdown.appendChild(itemDiv);
            total += item.valor * item.quantidade;
            totalItens += item.quantidade;
        });

        cartCount.textContent = totalItens;

        // Adiciona o total e o botão de finalizar
        cartDropdown.innerHTML += `
            <hr class="dropdown-divider">
            <div class="px-2">
                <p class="text-end fw-bold">Total: R$ ${total.toFixed(2).replace('.',',')}</p>
                <button class="btn btn-success w-100" id="finalizar-compra-btn">Finalizar Compra</button>
            </div>
        `;
    }

    /**
     * ETAPA 4 e 6: Adiciona um produto ao carrinho
     * @param {number} produtoId - O ID do produto a ser adicionado.
     */
    function adicionarAoCarrinho(produtoId) {
        const produto = produtos.find(p => p.id === produtoId);
        const itemNoCarrinho = carrinho.find(item => item.id === produtoId);

        // Verifica se o produto existe
        if (!produto) return;
        
        // Verifica se há estoque
        if (produto.qtdEstoque === 0) {
            alert("Desculpe, este produto está esgotado.");
            return;
        }

        if (itemNoCarrinho) {
            // Se o item já está no carrinho, verifica se pode adicionar mais um
            if (itemNoCarrinho.quantidade < produto.qtdEstoque) {
                itemNoCarrinho.quantidade++;
            } else {
                alert(`Você já adicionou a quantidade máxima em estoque para este produto (${produto.qtdEstoque}).`);
            }
        } else {
            // Adiciona o novo item ao carrinho
            carrinho.push({ ...produto, quantidade: 1 });
        }
        
        renderizarCarrinho();
    }
    
    /**
     * Remove um item do carrinho.
     * @param {number} produtoId - O ID do produto a ser removido.
     */
    function removerDoCarrinho(produtoId) {
        carrinho = carrinho.filter(item => item.id !== produtoId);
        renderizarCarrinho();
    }

    /**
     * ETAPA 5: Finaliza a compra
     */
    function finalizarCompra() {
        if(carrinho.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }
        alert("Compra finalizada com sucesso! Obrigado por comprar na PLKR.");
        carrinho = []; // Limpa o carrinho
        renderizarCarrinho(); // Atualiza a exibição do carrinho
        // A quantidade em estoque dos produtos não é resetada, conforme solicitado.
    }
    
    // --- LÓGICA DE EVENTOS E INICIALIZAÇÃO ---

    // Delegação de eventos para botões (adicionar, remover, finalizar)
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const produtoId = parseInt(event.target.dataset.id);
            adicionarAoCarrinho(produtoId);
        }
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const produtoId = parseInt(event.target.dataset.id);
            removerDoCarrinho(produtoId);
        }
        if (event.target.id === 'finalizar-compra-btn') {
            finalizarCompra();
        }
    });

    /**
     * ETAPA 8: Implementa a pesquisa de produtos
     */
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const termo = searchInput.value.toLowerCase();
        const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(termo));
        
        // Redireciona para a página inicial para mostrar os resultados da busca
        if(window.location.pathname.includes('categoria.html')) {
            window.location.href = `index.html?search=${encodeURIComponent(termo)}`;
        } else {
            renderizarProdutos(produtosFiltrados);
            pageTitle.textContent = `Resultados para: "${termo}"`;
        }
    });

    // Lógica para carregar a página correta (Todos, Categoria ou Busca)
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('cat');
    const termoBusca = urlParams.get('search');

    if (categoria) {
        // ETAPA 7: Filtra e exibe produtos por categoria
        const produtosFiltrados = produtos.filter(p => p.categoria === categoria);
        renderizarProdutos(produtosFiltrados);
        if (pageTitle) pageTitle.textContent = `Categoria: ${categoria}`;
    } else if (termoBusca) {
        // Trata a busca vinda da página de categoria
        const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()));
        renderizarProdutos(produtosFiltrados);
        if (pageTitle) pageTitle.textContent = `Resultados para: "${termoBusca}"`;
        searchInput.value = termoBusca;
    } else {
        // Página principal: exibe todos os produtos
        if (productListContainer) {
            renderizarProdutos(produtos);
        }
    }
    
    // Renderiza o estado inicial do carrinho
    renderizarCarrinho();
});