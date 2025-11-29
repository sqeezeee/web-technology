// Ожидаем полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем наличие массива dishes в data.js
  if (typeof dishes === 'undefined' || !Array.isArray(dishes)) {
    console.error('Массив dishes не найден в data.js');
    return;
  }

  // Сортируем блюда по алфавиту
  dishes.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  // Создаем объект для хранения ссылок на гриды по категориям
  const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];
  const grids = {};
  categories.forEach(cat => {
    grids[cat] = document.querySelector(`.dish-grid[data-category="${cat}"]`);
  });

  // Функция создания карточки блюда
  function makeCard(d) {
    const card = document.createElement('div');
    card.className = 'dish';
    card.setAttribute('data-dish', d.keyword); // Уникальный идентификатор
    card.setAttribute('data-kind', d.kind || ''); // Тип блюда для фильтрации
    card.innerHTML = `
      <img src="${d.image}" alt="${d.name}">
      <p class="dish-price">${d.price}₽</p>
      <p class="dish-name">${d.name}</p>
      <p class="dish-weight">${d.count}</p>
      <button class="dish-add" type="button">Добавить</button>
    `;
    return card;
  }

  // Вставляем карточки блюд в соответствующие гриды
  dishes.forEach(d => {
    const grid = grids[d.category];
    if (!grid) return; // Пропускаем если грид не найден
    const card = makeCard(d);
    grid.appendChild(card);
  });

  // Логика работы фильтров
  const filterContainers = document.querySelectorAll('.filters');
  filterContainers.forEach(container => {
    const cat = container.getAttribute('data-for'); // Получаем категорию фильтра
    
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      
      // Переключаем активное состояние кнопки фильтра
      const kind = btn.dataset.kind;
      btn.classList.toggle('active');
      
      // Получаем список активных фильтров
      const activeBtns = Array.from(container.querySelectorAll('.filter-btn.active'));
      const activeKinds = activeBtns.map(b => b.dataset.kind);

      const grid = document.querySelector(`.dish-grid[data-category="${cat}"]`);
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('.dish'));

      // Применяем фильтрацию
      if (activeKinds.length === 0) {
        // Если нет активных фильтров - показываем все карточки
        cards.forEach(c => c.style.display = '');
      } else {
        // Показываем только карточки соответствующие активным фильтрам
        cards.forEach(c => {
          const k = c.dataset.kind;
          if (activeKinds.includes(k)) c.style.display = '';
          else c.style.display = 'none';
        });
      }
    });
  });

  // Элементы для отображения заказа
  const orderSummary = document.getElementById('order-summary');
  const orderTotalBlock = document.getElementById('order-total-block');
  const orderTotalEl = document.getElementById('order-total');

  // Объект для хранения выбранных блюд по категориям
  const selected = {
    soup: null,
    main: null,
    salad: null, 
    drink: null,
    dessert: null
  };

  // Вспомогательная функция для поиска блюда по ключевому слову
  function findDishByKeyword(keyword) {
    return dishes.find(d => d.keyword === keyword) || null;
  }

  // Функция обновления сводки заказа
  function updateSummary() {
    // Проверяем есть ли выбранные блюда
    const anySelected = Object.values(selected).some(v => v);
    if (!anySelected) {
      orderSummary.innerHTML = `<p class="empty-summary">Ничего не выбрано</p>`;
      orderTotalBlock.style.display = 'none';
      return;
    }

    // Структура категорий для отображения в заказе
    const orderCats = [
      { key: 'soup', title: 'Суп' },
      { key: 'main', title: 'Главное блюдо' },
      { key: 'salad', title: 'Салат/стартер' },
      { key: 'drink', title: 'Напиток' },
      { key: 'dessert', title: 'Десерт' }
    ];

    orderSummary.innerHTML = '';
    let total = 0;
    
    // Строим сводку заказа
    orderCats.forEach(c => {
      // Добавляем заголовок категории
      const heading = document.createElement('div');
      heading.className = 'category-title';
      heading.textContent = c.title;
      orderSummary.appendChild(heading);

      if (selected[c.key]) {
        // Если блюдо выбрано - отображаем его
        const dish = findDishByKeyword(selected[c.key]);
        if (dish) {
          const line = document.createElement('div');
          line.className = 'item-line';
          line.textContent = `${dish.name} — ${dish.price}₽`;
          orderSummary.appendChild(line);
          total += Number(dish.price);
        } else {
          // Если блюдо не найдено (ошибка)
          const line = document.createElement('div');
          line.className = 'item-line empty';
          line.textContent = 'Блюдо не выбрано';
          orderSummary.appendChild(line);
        }
      } else {
        // Если блюдо не выбрано в категории
        const line = document.createElement('div');
        line.className = 'item-line empty';
        line.textContent = 'Блюдо не выбрано';
        orderSummary.appendChild(line);
      }
    });

    // Обновляем общую сумму
    if (total > 0) {
      orderTotalBlock.style.display = '';
      orderTotalEl.textContent = total + '₽';
    } else {
      orderTotalBlock.style.display = 'none';
    }
  }

  // Обработчик клика на кнопку "Добавить"
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.dish-add');
    if (!btn) return;
    
    const card = btn.closest('.dish');
    if (!card) return;
    
    const keyword = card.dataset.dish;
    const dish = findDishByKeyword(keyword);
    if (!dish) return;

    // Сохраняем выбранное блюдо
    selected[dish.category] = dish.keyword;

    // Обновляем визуальное выделение карточек
    document.querySelectorAll(`.dish[data-dish]`).forEach(c => {
      const k = c.dataset.dish;
      const d = findDishByKeyword(k);
      if (!d) return;
      // Выделяем только выбранное блюдо в категории
      if (d.category === dish.category) {
        c.classList.toggle('selected', k === dish.keyword);
      }
    });

    updateSummary();
  });

  // Обработчик клика на карточку (кроме кнопки "Добавить")
  document.body.addEventListener('click', (e) => {
    const card = e.target.closest('.dish');
    if (!card) return;
    if (e.target.closest('.dish-add')) return; // Игнорируем клики на кнопку
    
    const keyword = card.dataset.dish;
    const dish = findDishByKeyword(keyword);
    if (!dish) return;
    
    selected[dish.category] = dish.keyword;
    
    // Обновляем выделение карточек
    document.querySelectorAll(`.dish[data-dish]`).forEach(c => {
      const k = c.dataset.dish;
      const d = findDishByKeyword(k);
      if (!d) return;
      if (d.category === dish.category) {
        c.classList.toggle('selected', k === dish.keyword);
      }
    });
    
    updateSummary();
  });

  // Обработчик сброса формы
  const form = document.getElementById('order-form');
  form.addEventListener('reset', () => {
    // Очищаем выбранные блюда
    Object.keys(selected).forEach(k => selected[k] = null);
    // Снимаем выделение со всех карточек
    document.querySelectorAll('.dish.selected').forEach(el => el.classList.remove('selected'));
    // Обновляем сводку (с задержкой для гарантии выполнения после сброса)
    setTimeout(updateSummary, 0);
  });

  // Инициализация сводки заказа
  updateSummary();

  // Добавляем поддержку клавиатуры для кнопок фильтров
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click(); // Активируем фильтр по клавише Enter или Space
      }
    });
  });
});