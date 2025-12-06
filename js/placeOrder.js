const API_KEY = '5389748a-698c-479b-b876-cae54054c3ff';
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
const ORDER_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';

let allDishes = [];
let selected = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null
};

// Загрузка ID из Storage
function loadFromStorage() {
    const raw = localStorage.getItem('selectedDishes');
    if (raw) {
        try {
            const data = JSON.parse(raw);
            ['soup','main','salad','drink','dessert'].forEach(key => {
                selected[key] = data[key] || null;
            });
        } catch(e) { console.error(e); }
    }
}

// Загрузка всех блюд для отображения деталей
async function loadDishes() {
    try {
        const res = await fetch(`${API_URL}?api_key=${API_KEY}`);
        if(!res.ok) throw new Error();
        allDishes = await res.json();
    } catch (e) {
        showModal('Ошибка загрузки меню. Проверьте соединение.');
    }
}

// Показ уведомления
function showModal(message, reload = false) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box">
            <p>${message}</p>
            <button class="modal-btn">ОК</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('button').addEventListener('click', () => {
        overlay.remove();
        if (reload) window.location.href = 'index.html';
    });
}

// Рендер левой части формы (Состав) и грида
function renderPage() {
    const grid = document.getElementById('order-items');
    const emptyMsg = document.getElementById('empty-order');
    const summaryContainer = document.getElementById('order-summary');
    const totalEl = document.getElementById('order-total');
    
    // Очистка
    grid.innerHTML = '';
    summaryContainer.innerHTML = '';
    
    let total = 0;
    let hasItems = false;
    
    // Категории для перебора в правильном порядке
    const map = [
        { key: 'soup', label: 'Суп' },
        { key: 'main', label: 'Главное блюдо' },
        { key: 'salad', label: 'Салат/стартер' },
        { key: 'drink', label: 'Напиток' },
        { key: 'dessert', label: 'Десерт' }
    ];

    map.forEach(cat => {
        const dishId = selected[cat.key];
        
        // 1. Заполнение левой колонки формы
        const row = document.createElement('div');
        row.style.marginBottom = '8px';
        
        const label = document.createElement('div');
        label.style.fontWeight = '600';
        label.textContent = cat.label;
        row.appendChild(label);
        
        const value = document.createElement('div');
        
        if (dishId) {
            hasItems = true;
            const dish = allDishes.find(d => d.id === dishId);
            if (dish) {
                // Добавляем цену в сумму
                total += dish.price;
                
                // Текст в форме: "Борщ 120₽"
                value.textContent = `${dish.name} ${dish.price}₽`;
                
                // 2. Создание карточки в гриде "Состав заказа"
                const card = document.createElement('div');
                card.className = 'dish';
                card.innerHTML = `
                    <img src="${dish.image}" alt="${dish.name}">
                    <p class="dish-price">${dish.price}₽</p>
                    <p class="dish-name">${dish.name}</p>
                    <p class="dish-weight">${dish.count}</p>
                    <button class="delete-btn" type="button">Удалить</button>
                `;
                // Обработчик удаления
                card.querySelector('.delete-btn').addEventListener('click', () => {
                    selected[cat.key] = null;
                    localStorage.setItem('selectedDishes', JSON.stringify(selected));
                    renderPage();
                });
                grid.appendChild(card);
            } else {
                value.textContent = 'Ошибка данных';
            }
        } else {
            // Если не выбрано
            value.textContent = (cat.key === 'main') ? 'Не выбрано' : 'Не выбран';
            value.style.color = '#777';
        }
        
        row.appendChild(value);
        summaryContainer.appendChild(row);
    });

    // Итого
    totalEl.textContent = `${total}₽`;

    // Отображение "Ничего не выбрано"
    if (!hasItems) {
        emptyMsg.style.display = 'block';
        document.querySelector('.order-form').style.opacity = '0.5';
        document.querySelector('.submit-btn').disabled = true;
    } else {
        emptyMsg.style.display = 'none';
        document.querySelector('.order-form').style.opacity = '1';
        document.querySelector('.submit-btn').disabled = false;
    }
}

// Валидация перед отправкой (та же логика, что в make_lunch)
function validateCombo() {
    const currentCats = [];
    if (selected.soup) currentCats.push('soup');
    if (selected.main) currentCats.push('main');
    if (selected.salad) currentCats.push('salad');
    if (selected.drink) currentCats.push('drink');
    currentCats.sort();

    const VALID_COMBOS = [
        ['soup', 'main', 'salad', 'drink'],
        ['soup', 'main', 'drink'],
        ['soup', 'salad', 'drink'],
        ['main', 'salad', 'drink'],
        ['main', 'drink']
    ];

    return VALID_COMBOS.some(combo => {
        return JSON.stringify(combo.sort()) === JSON.stringify(currentCats);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    loadFromStorage();
    await loadDishes();
    renderPage();

    const form = document.getElementById('place-order-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Проверка комбо
        if (!validateCombo()) {
            showModal('Состав заказа неполный! Убедитесь, что выбран напиток и основное блюдо (или суп/салат).');
            return;
        }

        // 2. Сбор данных
        const formData = new FormData(form);
        
        // Добавляем ID блюд
        if (selected.soup) formData.append('soup_id', selected.soup);
        if (selected.main) formData.append('main_course_id', selected.main);
        if (selected.salad) formData.append('salad_id', selected.salad);
        if (selected.drink) formData.append('drink_id', selected.drink);
        if (selected.dessert) formData.append('dessert_id', selected.dessert);

        // 3. Отправка
        try {
            const res = await fetch(`${ORDER_URL}?api_key=${API_KEY}`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                // Успешно
                localStorage.removeItem('selectedDishes');
                showModal('Заказ успешно оформлен!', true);
            } else {
                const err = await res.json();
                showModal((err.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            showModal('Ошибка сети. Попробуйте позже.');
        }
    });
});