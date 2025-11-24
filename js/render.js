// сортировка перед выводом
dishes.sort((a, b) => a.name.localeCompare(b.name));

const grids = {
    soup: document.querySelector('[data-category="soup"]'),
    main: document.querySelector('[data-category="main"]'),
    drink: document.querySelector('[data-category="drink"]')
};

function createDishCard(dish) {
    const div = document.createElement("div");
    div.className = "dish";
    div.dataset.dish = dish.keyword;

    div.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <p class="dish-price">${dish.price}₽</p>
        <p class="dish-name">${dish.name}</p>
        <p class="dish-weight">${dish.count}</p>
        <button class="dish-add">Добавить</button>
    `;
    return div;
}

// вывод карточек
dishes.forEach(dish => {
    const card = createDishCard(dish);
    grids[dish.category].appendChild(card);
});

// информация о заказе
const orderSummary = document.getElementById("order-summary");
const totalBlock = document.getElementById("order-total-block");
const totalPriceEl = document.getElementById("order-total");

let selected = {
    soup: null,
    main: null,
    drink: null
};

function updateOrder() {
    const { soup, main, drink } = selected;

    // если ничего не выбрано
    if (!soup && !main && !drink) {
        orderSummary.innerHTML = `<p class="empty-summary">Ничего не выбрано</p>`;
        totalBlock.style.display = "none";
        return;
    }

    let html = "";

    // категория суп
    html += `<h4>Суп</h4>`;
    html += soup
        ? `<p>${soup.name} ${soup.price}₽</p>`
        : `<p class="empty">Блюдо не выбрано</p>`;

    // главное блюдо
    html += `<h4>Главное блюдо</h4>`;
    html += main
        ? `<p>${main.name} ${main.price}₽</p>`
        : `<p class="empty">Блюдо не выбрано</p>`;

    // напиток
    html += `<h4>Напиток</h4>`;
    html += drink
        ? `<p>${drink.name} ${drink.price}₽</p>`
        : `<p class="empty">Напиток не выбран</p>`;

    // итоговая стоимость
    const total =
        (soup?.price || 0) +
        (main?.price || 0) +
        (drink?.price || 0);

    orderSummary.innerHTML = html;

    if (total > 0) {
        totalBlock.style.display = "block";
        totalPriceEl.textContent = total + "₽";
    } else {
        totalBlock.style.display = "none";
    }
}

// клики по карточкам
document.body.addEventListener("click", e => {
    const btn = e.target.closest(".dish-add");
    if (!btn) return;

    const dishCard = btn.closest(".dish");
    const keyword = dishCard.dataset.dish;

    const dish = dishes.find(d => d.keyword === keyword);
    selected[dish.category] = dish;

    updateOrder();
});
