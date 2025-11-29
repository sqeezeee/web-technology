// Ожидаем полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем наличие массива dishes в data.js
  if (typeof dishes === 'undefined' || !Array.isArray(dishes)) {
    console.error('Массив dishes не найден в data.js');
    return;
  }

  // Сортируем блюда по алфавиту (русская локаль)
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
    // Проверяем есть ли выбранные блюда (за исключением dessert — он не обязателен)
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
          // добавляем цену (dessert тоже учитываем)
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

    // Сохраняем выбранное блюдо (по категории оставляем только один выбор)
    selected[dish.category] = dish.keyword;

    // Обновляем визуальное выделение карточек — выделяем только выбранную карточку в категории
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

  // Обработчик клика на карточку (кроме кнопки "Добавить") — выбирает блюдо в категории
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

  /* ---------------------------------------
     НОВЫЕ ФУНКЦИИ: проверка комбо при отправке формы
     ---------------------------------------
     Логика:
     - игнорируем dessert при проверке (его можно добавлять к любому комбо)
     - набор выбранных категорий (без dessert) должен совпадать с одним из допустимых вариантов:
        V1 = [soup, main, salad, drink]
        V2 = [soup, main, drink]
        V3 = [soup, salad, drink]
        V4 = [main, salad, drink]
        V5 = [main, drink]
     - если набор пуст -> сообщение "Ничего не выбрано..."
     - если набор равен вариации минус drink -> "Выберите напиток"
     - если выбран только суп, но нет main/salad -> "Выберите главное блюдо/салат/стартер"
     - если выбран салат(и) без soup/main -> "Выберите суп или главное блюдо"
     - если выбраны только напиток/десерт без main -> "Выберите главное блюдо"
     - в остальных случаях показываем универсальное сообщение (без отправки)
  */

  // Перечисляем все допустимые наборы (массивы строк)
  const VARIANTS = [
    ['soup', 'main', 'salad', 'drink'], // V1
    ['soup', 'main', 'drink'],          // V2
    ['soup', 'salad', 'drink'],         // V3
    ['main', 'salad', 'drink'],         // V4
    ['main', 'drink']                   // V5
  ];

  // Вспомог.: возвращает отсортированный массив уникальных ключей
  function normalizeSet(arr) {
    return Array.from(new Set(arr)).sort();
  }

  // проверка: совпадает ли chosen (массив) с каким-либо вариантом (игнорируя order)
  function isExactVariant(chosenArr) {
    const norm = normalizeSet(chosenArr);
    return VARIANTS.some(v => JSON.stringify(normalizeSet(v)) === JSON.stringify(norm));
  }

  // Проверка: существует ли вариант, для которого chosen === variant без 'drink'
  function isMissingOnlyDrink(chosenArr) {
    const norm = normalizeSet(chosenArr);
    return VARIANTS.some(v => {
      if (!v.includes('drink')) return false;
      const copy = v.filter(x => x !== 'drink');
      return JSON.stringify(normalizeSet(copy)) === JSON.stringify(norm);
    });
  }

  // Создаёт и показывает overlay-уведомление с текстом и иконкой.
  // iconKey может быть 'drink','main','soup','salad' или 'default' (мы из маппинга делаем путь).
  function showNotification(message, iconKey = 'default') {
    // mapping iconKey -> path
    const iconMap = {
      'drink': 'img/icons/drink.png',
      'main': 'img/icons/main.png',
      'soup': 'img/icons/soup.png',
      'salad': 'img/icons/salad.png',
      'dessert': 'img/icons/desert.png',
      'default': 'img/icons/main.png'
    };

    // Создаём overlay
    const overlay = document.createElement('div');
    overlay.className = 'notify-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    // затемнённый фон
    const backdrop = document.createElement('div');
    backdrop.className = 'notify-backdrop';
    overlay.appendChild(backdrop);

    // карточка уведомления
    const box = document.createElement('div');
    box.className = 'notify-box';

    // иконка (если есть путь)
    const img = document.createElement('img');
    img.src = iconMap[iconKey] || iconMap['default'];
    img.alt = '';
    box.appendChild(img);

    // текст
    const text = document.createElement('div');
    text.className = 'notify-text';
    text.textContent = message;
    box.appendChild(text);

    // кнопка OK
    const ok = document.createElement('button');
    ok.className = 'notify-ok';
    ok.type = 'button';
    ok.textContent = 'Окей 👌';
    box.appendChild(ok);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // центрируем и предотвращаем прокрутку фона (необязательно, но удобно)
    document.body.style.overflow = 'hidden';

    // клик по кнопке — удаляем overlay
    ok.addEventListener('click', () => {
      document.body.style.overflow = '';
      overlay.remove();
    });

    // клик по фону тоже закрывает
    backdrop.addEventListener('click', () => {
      document.body.style.overflow = '';
      overlay.remove();
    });
  }

  // Функция, выполняющая проверку набора выбранных категорий при отправке формы.
  function validateComboOnSubmit(evt) {
    // Формируем набор выбранных категорий, игнорируем dessert при проверке совпадения
    const chosenCats = Object.keys(selected).filter(k => selected[k] && k !== 'dessert');

    // Если совсем ничего не выбрано
    if (chosenCats.length === 0) {
      evt.preventDefault();
      showNotification('Ничего не выбрано. Выберите блюда для заказа', 'soup');
      return;
    }

    // Если набор точно соответствует одному из вариантов — разрешаем отправку (форму отпарвляем)
    if (isExactVariant(chosenCats)) {
      // валидный набор — форма отправится (не мешаем)
      return;
    }

    // Если пользователь выбрал все необходимые блюда, кроме напитка (т.е. существует вариант, где
    // variant \ {drink} === chosenCats), то просим выбрать напиток
    if (isMissingOnlyDrink(chosenCats)) {
      evt.preventDefault();
      showNotification('Выберите напиток', 'drink');
      return;
    }

    // Специфические проверки для прочих ситуаций (соответствуют требованиям задания):

    // 1) Выбран суп, но нет ни main, ни salad
    if (chosenCats.includes('soup') && !chosenCats.includes('main') && !chosenCats.includes('salad')) {
      evt.preventDefault();
      showNotification('Выберите главное блюдо/салат/стартер', 'main');
      return;
    }

    // 2) Выбран салат/стартер, но не выбран ни суп, ни главное блюдо
    if (chosenCats.includes('salad') && !chosenCats.includes('soup') && !chosenCats.includes('main')) {
      evt.preventDefault();
      showNotification('Выберите суп или главное блюдо', 'soup');
      return;
    }

    // 3) Выбран только напиток/десерт (или набор без main)
    // Если в выбранных есть только drink (и/или dessert), но нет main => просим выбрать главное блюдо
    const hasOnlyDrinkLike = chosenCats.every(c => c === 'drink');
    if (hasOnlyDrinkLike || (chosenCats.includes('drink') && !chosenCats.includes('main') && !chosenCats.includes('soup') && !chosenCats.includes('salad'))) {
      evt.preventDefault();
      showNotification('Выберите главное блюдо', 'main');
      return;
    }

    // Если ни одно из условий не сработало — универсальное сообщение (не даём отправлять)
    evt.preventDefault();
    showNotification('Состав заказа не соответствует доступным вариантам. Проверьте набор блюд', 'main');
  }

  // Привязываем проверку к событию отправки формы
  form.addEventListener('submit', validateComboOnSubmit);

});
