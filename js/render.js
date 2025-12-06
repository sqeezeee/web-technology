const API_KEY = '5389748a-698c-479b-b876-cae54054c3ff';
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';

let dishes = [];

// Хранилище выбранных ID
// Структура в localStorage будет
const STORAGE_KEY = 'selectedDishes';
const selected = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null
};

// Варианты комбо (для валидации кнопки)
const VALID_COMBOS = [
    ['soup', 'main', 'salad', 'drink'],
    ['soup', 'main', 'drink'],
    ['soup', 'salad', 'drink'],
    ['main', 'salad', 'drink'],
    ['main', 'drink']
];

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            Object.keys(selected).forEach(key => {
                if (data[key]) selected[key] = data[key];
            });
        }
    } catch (e) {
        console.error('Ошибка чтения LocalStorage', e);
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
}

// Загрузка блюд
async function loadDishes() {
    try {
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Network response was not ok');
        dishes = await response.json();
        dishes.sort((a, b) => a.name.localeCompare(b.name));
        return true;
    } catch (error) {
        console.error('Ошибка загрузки блюд:', error);
        alert('Не удалось загрузить меню. Попробуйте обновить страницу.');
        return false;
    }
}

// Проверка валидности комбо
function isComboValid() {
    // Собираем массив категорий, которые выбраны (исключая десерт, он опционален)
    const currentCategories = [];
    if (selected.soup) currentCategories.push('soup');
    if (selected.main) currentCategories.push('main');
    if (selected.salad) currentCategories.push('salad');
    if (selected.drink) currentCategories.push('drink');

    // Сортируем для сравнения
    currentCategories.sort();

    // Проверяем, совпадает ли текущий набор с одним из валидных
    return VALID_COMBOS.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify(currentCategories);
    });
}

// Обновление Sticky Bar
function updateStickyBar() {
    const barWrapper = document.getElementById('order-bar-wrapper');
    const totalPriceEl = document.getElementById('order-total-price');
    const linkBtn = document.getElementById('order-link');

    // Считаем сумму
    let total = 0;
    let hasSelection = false;

    Object.values(selected).forEach(id => {
        if (id) {
            hasSelection = true;
            const dish = dishes.find(d => d.id === id);
            if (dish) total += dish.price;
        }
    });

    // Скрываем, если ничего не выбрано
    if (!hasSelection) {
        barWrapper.style.display = 'none';
        return;
    }

    barWrapper.style.display = 'flex';
    totalPriceEl.textContent = `${total}₽`;

    // Валидация ссылки
    if (isComboValid()) {
        linkBtn.classList.remove('disabled');
        linkBtn.removeAttribute('aria-disabled');
    } else {
        linkBtn.classList.add('disabled');
        linkBtn.setAttribute('aria-disabled', 'true');
    }
}

// Создание карточки
function createCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish';
    card.dataset.id = dish.id;
    card.dataset.kind = dish.kind;

    card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <p class="dish-price">${dish.price}₽</p>
        <p class="dish-name">${dish.name}</p>
        <p class="dish-weight">${dish.count}</p>
        <button class="dish-add">Добавить</button>
    `;

    // Обработчик клика
    card.addEventListener('click', () => {
        const category = dish.category === 'main-course' ? 'main' : dish.category;
        
        // Логика выбора: если уже выбран этот ID - ничего не меняем (или можно деселект), 
        // если выбран другой в этой категории - меняем.
        selected[category] = dish.id;
        
        saveToStorage();
        updateVisualSelection();
        updateStickyBar();
    });

    return card;
}

// Визуальное выделение карточек
function updateVisualSelection() {
    document.querySelectorAll('.dish').forEach(card => {
        const id = parseInt(card.dataset.id);
        // Проверяем, есть ли этот ID в values объекта selected
        const isSelected = Object.values(selected).includes(id);
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// Рендер по категориям
function renderDishes() {
    const categories = ['soup', 'main-course', 'salad', 'drink', 'dessert'];
    
    categories.forEach(cat => {
        const container = document.querySelector(`.dish-grid[data-category="${cat}"]`);
        if (!container) return;
        
        container.innerHTML = '';
        const categoryDishes = dishes.filter(d => d.category === cat);
        
        categoryDishes.forEach(dish => {
            container.appendChild(createCard(dish));
        });
    });
}

// Фильтры
function initFilters() {
    document.querySelectorAll('.filters').forEach(filterBlock => {
        filterBlock.addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;
            
            const btn = e.target;
            const isActive = btn.classList.contains('active');
            
            // Сброс всех кнопок в группе
            filterBlock.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            if (!isActive) {
                btn.classList.add('active');
                const kind = btn.dataset.kind;
                const category = filterBlock.dataset.for; // soup, main, etc.
                
                // Находим нужный грид
                // Т.к. main-course != main в data-category, делаем маппинг
                let gridSelector = `.dish-grid[data-category="${category}"]`;
                if (category === 'main') gridSelector = `.dish-grid[data-category="main-course"]`;
                
                const grid = document.querySelector(gridSelector);
                if (grid) {
                    Array.from(grid.children).forEach(card => {
                        if (card.dataset.kind === kind) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                }
            } else {
                // Если нажали на активную - сброс фильтра
                const category = filterBlock.dataset.for;
                let gridSelector = `.dish-grid[data-category="${category}"]`;
                if (category === 'main') gridSelector = `.dish-grid[data-category="main-course"]`;
                
                const grid = document.querySelector(gridSelector);
                if (grid) {
                    Array.from(grid.children).forEach(card => card.style.display = 'flex');
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    loadFromStorage();
    const loaded = await loadDishes();
    if (loaded) {
        renderDishes();
        updateVisualSelection();
        updateStickyBar();
        initFilters();
    }
});