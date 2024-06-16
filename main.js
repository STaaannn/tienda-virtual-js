const db = {
    methods: {
        find: (id) => {
            return db.items.find(item => item.id === id);
        },
        remove: (items) => {
            items.forEach(item => {
                const product = db.methods.find(item.id);
                if (product.qty >= item.qty) {
                    product.qty -= item.qty;
                } else {
                    alert(`No hay suficiente inventario para ${product.title}`);
                }
            });
        },
    },
    items: [
        { id: 0, title: 'Gta 6', price: 100, qty: 20 },
        { id: 2, title: 'Red Dead Redemption 2', price: 60, qty: 20 },
        { id: 3, title: 'Dark & Darker', price: 25, qty: 20 },
        { id: 4, title: 'Chivalry 2', price: 40, qty: 20 },
        { id: 5, title: 'The Witcher 3', price: 30, qty: 15 },
        { id: 6, title: 'Cyberpunk 2077', price: 50, qty: 10 },
        { id: 7, title: 'Hades', price: 20, qty: 25 },
        { id: 8, title: 'Stardew Valley', price: 15, qty: 30 },
        { id: 9, title: 'Elden Ring', price: 70, qty: 8 },
        { id: 10, title: 'Resident Evil Village', price: 45, qty: 12 },
        { id: 11, title: 'Assassin\'s Creed Valhalla', price: 60, qty: 10 },
        { id: 12, title: 'Doom Eternal', price: 50, qty: 15 },
        { id: 13, title: 'Horizon Zero Dawn', price: 40, qty: 20 },
        { id: 14, title: 'Ghost of Tsushima', price: 60, qty: 10 },
        { id: 15, title: 'Death Stranding', price: 45, qty: 5 },
        { id: 16, title: 'Control', price: 30, qty: 18 },
        { id: 17, title: 'Sekiro: Shadows Die Twice', price: 55, qty: 8 },
        { id: 18, title: 'The Last of Us Part II', price: 60, qty: 6 },
        { id: 19, title: 'Spider-Man: Miles Morales', price: 50, qty: 10 },
        { id: 20, title: 'Final Fantasy VII Remake', price: 60, qty: 12 },
    ]
};

function renderFilteredProducts() {
    const searchInput = document.querySelector('#searchInput').value.trim().toLowerCase();
    const categoryFilter = document.querySelector('#categoryFilter').value.toLowerCase();

    
    const filteredProducts = db.items.filter(item => {
        const titleMatches = item.title.toLowerCase().includes(searchInput);
        const categoryMatches = categoryFilter === '' || item.category.toLowerCase() === categoryFilter;
        return titleMatches && categoryMatches;
    });

    renderStore(filteredProducts);
}


document.querySelector('#searchButton').addEventListener('click', renderFilteredProducts);

document.querySelector('#searchInput').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        renderFilteredProducts();
    }
});

document.querySelector('#categoryFilter').addEventListener('change', renderFilteredProducts);

const shoppingCart = {
    items: [],
    methods: {
        add: (id, qty) => {
            const cartItem = shoppingCart.methods.get(id);
            const dbItem = db.methods.find(id);

            if (cartItem) {
                if (shoppingCart.methods.hasInventory(id, qty + cartItem.qty)) {
                    cartItem.qty += qty;
                } else {
                    alert('No tenemos suficiente inventario');
                }
            } else {
                shoppingCart.items.push({ id, qty });
            }
        },
        remove: (id, qty) => {
            const cartItem = shoppingCart.methods.get(id);
            if (cartItem) {
                if (cartItem.qty - qty > 0) {
                    cartItem.qty -= qty;
                } else {
                    shoppingCart.items = shoppingCart.items.filter(item => item.id !== id);
                }
            }
        },
        count: () => {
            return shoppingCart.items.reduce((acc, item) => acc + item.qty, 0);
        },
        get: (id) => {
            return shoppingCart.items.find(item => item.id === id) || null;
        },
        getTotal: () => {
            return shoppingCart.items.reduce((acc, item) => {
                const found = db.methods.find(item.id);
                return acc + (found.price * item.qty);
            }, 0);
        },
        hasInventory: (id, qty) => {
            const dbItem = db.methods.find(id);
            return dbItem && (dbItem.qty >= qty);
        },
        purchase: () => {
            db.methods.remove(shoppingCart.items);
            shoppingCart.items = [];

            alert('¡Gracias por su compra!');

            renderStore();
            renderShoppingCart();
        },
    },
};

renderStore();

function renderStore(items = db.items) {
    const rows = [];
    for (let i = 0; i < items.length; i += 5) {
        rows.push(items.slice(i, i + 5));
    }

    const html = rows.map(row => `
        <div class="row">
            ${row.map(item => `
                <div class="item">
                    <div class="title">${item.title}</div>
                    <div class="price">${numberToCurrency(item.price)}</div>
                    <div class="qty">${item.qty} units</div>
                    <div class="actions">
                        <button class="add" data-id="${item.id}">Add to Shopping Cart</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');

    document.querySelector("#store-container").innerHTML = html;

    document.querySelectorAll('.item .actions .add').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            const item = db.methods.find(id);

            if (item && item.qty > 0) {
                shoppingCart.methods.add(id, 1);
                renderShoppingCart();
            } else {
                console.log('No hay suficiente inventario');
            }
        });
    });
}

function renderShoppingCart() {
    const html = shoppingCart.items.map(item => {
        const dbItem = db.methods.find(item.id);
        return `
            <div class="item">
                <div class="title">${dbItem.title}</div>
                <div class="price">${numberToCurrency(dbItem.price)}</div>
                <div class="qty">${item.qty} units</div>
                <div class="subtotal">Subtotal: ${numberToCurrency(item.qty * dbItem.price)}</div>
                <div class="actions">
                    <button class="addOne" data-id="${item.id}">+</button>
                    <button class="removeOne" data-id="${item.id}">-</button>
                </div>
            </div>
        `;
    });

    const closeButton = '<div class="cart-header"><button class="bClose">Close</button></div>';
    const purchaseButton = shoppingCart.items.length > 0 ? '<div class="cart-actions"><button class="bPurchase">Purchase</button></div>' : '';
    const total = shoppingCart.methods.getTotal();
    const totalContainer = `<div class="total">Total: ${numberToCurrency(total)}</div>`;

    const shoppingCartContainer = document.querySelector('#shopping-cart-container');
    shoppingCartContainer.classList.remove('hide');
    shoppingCartContainer.classList.add('show');
    shoppingCartContainer.innerHTML = closeButton + html.join('') + totalContainer + purchaseButton;

    document.querySelectorAll('.addOne').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            shoppingCart.methods.add(id, 1);
            renderShoppingCart();
        });
    });

    document.querySelectorAll('.removeOne').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            shoppingCart.methods.remove(id, 1);
            renderShoppingCart();
        });
    });

    document.querySelector('.bClose').addEventListener('click', () => {
        shoppingCartContainer.classList.remove('show');
        shoppingCartContainer.classList.add('hide');
    });

    const bPurchase = document.querySelector('.bPurchase');
    if (bPurchase) {
        bPurchase.addEventListener('click', () => {
            shoppingCart.methods.purchase();
            renderStore();
            renderShoppingCart();
        });
    }
}

function numberToCurrency(n) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumSignificantDigits: 2
    }).format(n);
}