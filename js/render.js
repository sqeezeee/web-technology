// js/render.js
document.addEventListener('DOMContentLoaded', () => {
  if (typeof dishes === 'undefined' || !Array.isArray(dishes)) {
    console.error('Массив dishes не найден в data.js');
    return;
  }

  // Сортируем алфавитно по name (локаль ru)
  dishes.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  // Найдём все гриды по категориям (включая новые)
  const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];
  const grids = {};
  categories.forEach(cat => {
    grids[cat] = document.querySelector(`.dish-grid[data-category="${cat}"]`);
  });

  // Создание карточки
  function makeCard(d) {
    const card = document.createElement('div');
    card.className = 'dish';
    card.setAttribute('data-dish', d.keyword);
    card.setAttribute('data-kind', d.kind || '');
    card.innerHTML = `
      <img src="${d.image}" alt="${d.name}">
      <p class="dish-price">${d.price}₽</p>
      <p class="dish-name">${d.name}</p>
      <p class="dish-weight">${d.count}</p>
      <button class="dish-add" type="button">Добавить</button>
    `;
    return card;
  }

  // Вставляем карточки в соответствующие контейнеры
  dishes.forEach(d => {
    const grid = grids[d.category];
    if (!grid) return;
    const card = makeCard(d);
    grid.appendChild(card);
  });

  // --- Фильтры: логика ---
  // Для каждой секции найдём блок фильтров и повесим обработчик
  const filterContainers = document.querySelectorAll('.filters');
  filterContainers.forEach(container => {
    const cat = container.getAttribute('data-for'); // example: 'soup'
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const kind = btn.dataset.kind;
      // toggle active
      btn.classList.toggle('active');
      // compute active kinds for this category
      const activeBtns = Array.from(container.querySelectorAll('.filter-btn.active'));
      const activeKinds = activeBtns.map(b => b.dataset.kind);

      // find all cards in this category
      const grid = document.querySelector(`.dish-grid[data-category="${cat}"]`);
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('.dish'));

      if (activeKinds.length === 0) {
        // show all
        cards.forEach(c => c.style.display = '');
      } else {
        cards.forEach(c => {
          const k = c.dataset.kind;
          if (activeKinds.includes(k)) c.style.display = '';
          else c.style.display = 'none';
        });
      }
    });
  });

  // --- ORDER logic (clicking on .dish-add adds item to order summary) ---
  const orderSummary = document.getElementById('order-summary');
  const orderTotalBlock = document.getElementById('order-total-block');
  const orderTotalEl = document.getElementById('order-total');

  // selected items state: store keyword or null per category
  const selected = {
    soup: null,
    main: null,
    salad: null, // note: salads are separate category; we won't include salads into required three for order total unless you want — spec earlier used soup/main/drink only; keep adding salads to order too (makes sense)
    drink: null,
    dessert: null
  };

  // In original task order comprised soup/main/drink, but now user added categories.
  // We'll show all chosen categories in summary and sum all chosen prices.

  function findDishByKeyword(keyword) {
    return dishes.find(d => d.keyword === keyword) || null;
  }

  function updateSummary() {
    // build summary: if nothing selected -> "Ничего не выбрано"
    const anySelected = Object.values(selected).some(v => v);
    if (!anySelected) {
      orderSummary.innerHTML = `<p class="empty-summary">Ничего не выбрано</p>`;
      orderTotalBlock.style.display = 'none';
      return;
    }

    // For readability, show categories in desired order: soup, main, salad, drink, dessert
    const orderCats = [
      { key: 'soup', title: 'Суп' },
      { key: 'main', title: 'Главное блюдо' },
      { key: 'salad', title: 'Салат/стартер' },
      { key: 'drink', title: 'Напиток' },
      { key: 'dessert', title: 'Десерт' }
    ];

    orderSummary.innerHTML = '';
    let total = 0;
    orderCats.forEach(c => {
      const heading = document.createElement('div');
      heading.className = 'category-title';
      heading.textContent = c.title;
      orderSummary.appendChild(heading);

      if (selected[c.key]) {
        const dish = findDishByKeyword(selected[c.key]);
        if (dish) {
          const line = document.createElement('div');
          line.className = 'item-line';
          line.textContent = `${dish.name} — ${dish.price}₽`;
          orderSummary.appendChild(line);
          total += Number(dish.price);
        } else {
          const line = document.createElement('div');
          line.className = 'item-line empty';
          line.textContent = 'Блюдо не выбрано';
          orderSummary.appendChild(line);
        }
      } else {
        const line = document.createElement('div');
        line.className = 'item-line empty';
        line.textContent = 'Блюдо не выбрано';
        orderSummary.appendChild(line);
      }
    });

    if (total > 0) {
      orderTotalBlock.style.display = '';
      orderTotalEl.textContent = total + '₽';
    } else {
      orderTotalBlock.style.display = 'none';
    }
  }

  // Add click listeners to .dish-add buttons (event delegation)
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.dish-add');
    if (!btn) return;
    const card = btn.closest('.dish');
    if (!card) return;
    const keyword = card.dataset.dish;
    const dish = findDishByKeyword(keyword);
    if (!dish) return;

    // toggle selection for that category: if clicking same dish again, keep it selected (not toggling off)
    selected[dish.category] = dish.keyword;

    // mark cards visually: selected within same category only
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

  // Also support clicking whole card to add
  document.body.addEventListener('click', (e) => {
    const card = e.target.closest('.dish');
    if (!card) return;
    // if click on button already handled above, ignore to avoid double
    if (e.target.closest('.dish-add')) return;
    const keyword = card.dataset.dish;
    const dish = findDishByKeyword(keyword);
    if (!dish) return;
    selected[dish.category] = dish.keyword;
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

  // Reset button clears selections
  const form = document.getElementById('order-form');
  form.addEventListener('reset', () => {
    // clear selected
    Object.keys(selected).forEach(k => selected[k] = null);
    document.querySelectorAll('.dish.selected').forEach(el => el.classList.remove('selected'));
    // slight delay to allow native reset actions
    setTimeout(updateSummary, 0);
  });

  // Initialize summary
  updateSummary();

  // Accessibility: keyboard filtering - Enter toggles button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
});
