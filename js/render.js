// ЗАГРУЗКА ДАННЫХ ЧЕРЕЗ API
async function loadDishes() {
  try {
    const url = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Ошибка загрузки данных с API");
    }

    const data = await response.json();

    // Сохраняем глобально
    dishes = data;

    // Сортировка по алфавиту
    dishes.sort((a, b) => a.name.localeCompare(b.name, "ru"));

    return true;
  } catch (err) {
    console.error("loadDishes() error:", err);
    return false;
  }
}

// ОСНОВНОЙ СКРИПТ
document.addEventListener("DOMContentLoaded", async () => {
  // Загружаем блюда
  const ok = await loadDishes();
  if (!ok || dishes.length === 0) {
    alert("Ошибка загрузки блюд. Попробуйте обновить страницу.");
    return;
  }

  // Все категории
  const categories = ["soup", "main-course", "salad", "drink", "dessert"];
  const grids = {};

  // Находим гриды на странице
  categories.forEach((cat) => {
    const el = document.querySelector(`.dish-grid[data-category="${cat}"]`);
    grids[cat] = el;
  });

  // Создание карточки
  function makeCard(d) {
    const card = document.createElement("div");
    card.className = "dish";
    card.dataset.dish = d.keyword;
    card.dataset.kind = d.kind || "";

    card.innerHTML = `
      <img src="${d.image}" alt="${d.name}">
      <p class="dish-price">${d.price}₽</p>
      <p class="dish-name">${d.name}</p>
      <p class="dish-weight">${d.count}</p>
      <button class="dish-add" type="button">Добавить</button>
    `;

    return card;
  }

  // Рендер карточек
  dishes.forEach((d) => {
    if (!grids[d.category]) {
      console.warn("Нет грида для категории:", d.category);
      return;
    }
    grids[d.category].appendChild(makeCard(d));
  });

  // ФИЛЬТРЫ

  const filterContainers = document.querySelectorAll(".filters");

  filterContainers.forEach((container) => {
    const cat = container.dataset.for;

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      btn.classList.toggle("active");

      const activeKinds = [
        ...container.querySelectorAll(".filter-btn.active"),
      ].map((b) => b.dataset.kind);

      const grid = document.querySelector(`.dish-grid[data-category="${cat}"]`);
      if (!grid) return;

      const cards = [...grid.querySelectorAll(".dish")];

      if (activeKinds.length === 0) {
        cards.forEach((c) => (c.style.display = ""));
      } else {
        cards.forEach((c) => {
          c.style.display = activeKinds.includes(c.dataset.kind) ? "" : "none";
        });
      }
    });
  });

  // ВЫБОР БЛЮД

  const selected = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null,
  };

  function findDishByKeyword(k) {
    return dishes.find((d) => d.keyword === k);
  }

  // СВОДКА ЗАКАЗА

  const orderSummary = document.getElementById("order-summary");
  const orderTotalBlock = document.getElementById("order-total-block");
  const orderTotalEl = document.getElementById("order-total");

  function updateSummary() {
    const any = Object.values(selected).some((v) => v);

    if (!any) {
      orderSummary.innerHTML = `<p class="empty-summary">Ничего не выбрано</p>`;
      orderTotalBlock.style.display = "none";
      return;
    }

    const orderCats = [
      { key: "soup", title: "Суп" },
      { key: "main-course", title: "Главное блюдо" },
      { key: "salad", title: "Салат / Стартер" },
      { key: "drink", title: "Напиток" },
      { key: "dessert", title: "Десерт" },
    ];

    orderSummary.innerHTML = "";
    let total = 0;

    orderCats.forEach((c) => {
      const block = document.createElement("div");
      block.className = "category-title";
      block.textContent = c.title;
      orderSummary.appendChild(block);

      if (selected[c.key]) {
        const d = findDishByKeyword(selected[c.key]);
        const line = document.createElement("div");
        line.className = "item-line";
        line.textContent = `${d.name} — ${d.price}₽`;
        orderSummary.appendChild(line);
        total += d.price;
      } else {
        const line = document.createElement("div");
        line.className = "item-line empty";
        line.textContent = `Блюдо не выбрано`;
        orderSummary.appendChild(line);
      }
    });

    if (total > 0) {
      orderTotalBlock.style.display = "";
      orderTotalEl.textContent = total + "₽";
    } else {
      orderTotalBlock.style.display = "none";
    }
  }

  // Выбор блюда (клик по кнопке или карточке)
  document.body.addEventListener("click", (e) => {
    const card = e.target.closest(".dish");
    if (!card) return;

    const keyword = card.dataset.dish;
    const dish = findDishByKeyword(keyword);
    if (!dish) return;

    selected[dish.category] = dish.keyword;

    document.querySelectorAll(".dish").forEach((c) => {
      const d = findDishByKeyword(c.dataset.dish);
      if (d.category === dish.category) {
        c.classList.toggle("selected", c.dataset.dish === dish.keyword);
      }
    });

    updateSummary();
  });

  // СБРОС

  const form = document.getElementById("order-form");

  form.addEventListener("reset", () => {
    Object.keys(selected).forEach((k) => (selected[k] = null));
    document
      .querySelectorAll(".dish.selected")
      .forEach((el) => el.classList.remove("selected"));
    setTimeout(updateSummary, 0);
  });

  updateSummary();

  // ПРОВЕРКА КОМБО

  const VARIANTS = [
    ["soup", "main-course", "salad", "drink"],
    ["soup", "main-course", "drink"],
    ["soup", "salad", "drink"],
    ["main-course", "salad", "drink"],
    ["main-course", "drink"],
  ];

  function norm(a) {
    return [...new Set(a)].sort();
  }

  function isExactVariant(a) {
    return VARIANTS.some(
      (v) => JSON.stringify(norm(v)) === JSON.stringify(norm(a))
    );
  }

  function isMissingOnlyDrink(a) {
    return VARIANTS.some((v) => {
      if (!v.includes("drink")) return false;
      const base = v.filter((x) => x !== "drink");
      return JSON.stringify(norm(base)) === JSON.stringify(norm(a));
    });
  }

  function showNotification(text, iconKey = "main") {
    const overlay = document.createElement("div");
    overlay.className = "notify-overlay";

    overlay.innerHTML = `
      <div class="notify-backdrop"></div>
      <div class="notify-box">
        <img src="img/icons/${iconKey}.png">
        <div class="notify-text">${text}</div>
        <button class="notify-ok" type="button">Окей 👌</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    function close() {
      document.body.style.overflow = "";
      overlay.remove();
    }

    overlay.querySelector(".notify-ok").addEventListener("click", close);
    overlay.querySelector(".notify-backdrop").addEventListener("click", close);
  }

  // Функция, выполняющая проверку набора выбранных категорий при отправке формы.
  function validateComboOnSubmit(evt) {
    // Формируем набор выбранных категорий, игнорируем dessert при проверке совпадения
    const chosenCats = Object.keys(selected).filter(
      (k) => selected[k] && k !== "dessert"
    );
    // Если совсем ничего не выбрано
    if (chosenCats.length === 0) {
      evt.preventDefault();
      showNotification("Ничего не выбрано. Выберите блюда для заказа", "soup");
      return;
    }
    // Если набор точно соответствует одному из вариантов — разрешаем отправку
    if (isExactVariant(chosenCats)) {
      return;
    }
    // Если пользователь выбрал все необходимые блюда, кроме напитка, то просим выбрать напиток
    if (isMissingOnlyDrink(chosenCats)) {
      evt.preventDefault();
      showNotification("Выберите напиток", "drink");
      return;
    }
    // Специфические проверки для прочих ситуаций: // 1) Выбран суп, но нет ни main, ни salad
    if (
      chosenCats.includes("soup") &&
      !chosenCats.includes("main") &&
      !chosenCats.includes("salad")
    ) {
      evt.preventDefault();
      showNotification("Выберите главное блюдо/салат/стартер", "main");
      return;
    }
    // 2) Выбран салат/стартер, но не выбран ни суп, ни главное блюдо
    if (
      chosenCats.includes("salad") &&
      !chosenCats.includes("soup") &&
      !chosenCats.includes("main")
    ) {
      evt.preventDefault();
      showNotification("Выберите суп или главное блюдо", "soup");
      return;
    }
    // 3) Выбран только напиток/десерт (или набор без main)
    // Если в выбранных есть только drink (и/или dessert), но нет main => просим выбрать главное блюдо
    const hasOnlyDrinkLike = chosenCats.every((c) => c === "drink");
    if (
      hasOnlyDrinkLike ||
      (chosenCats.includes("drink") &&
        !chosenCats.includes("main") &&
        !chosenCats.includes("soup") &&
        !chosenCats.includes("salad"))
    ) {
      evt.preventDefault();
      showNotification("Выберите главное блюдо", "main");
      return;
    }
    // Если ни одно из условий не сработало — универсальное сообщение (не даём отправлять)
    evt.preventDefault();
    showNotification(
      "Состав заказа не соответствует доступным вариантам. Проверьте набор блюд",
      "main"
    );
  }
  // Привязываем проверку к событию отправки формы
  form.addEventListener("submit", validateComboOnSubmit);
});
