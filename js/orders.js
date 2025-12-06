const API_KEY = '5389748a-698c-479b-b876-cae54054c3ff';
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api';

// Глобальные переменные для хранения данных
let allOrders = [];
let allDishes = [];
let currentOrderId = null; // ID заказа, с которым работаем в данный момент (редактирование/удаление)

const ICONS = {
    eye: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    edit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`
};

// --- ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ ---

// Загрузка блюд (нужна для получения названий и цен по ID)
async function loadDishes() {
    try {
        const response = await fetch(`${API_URL}/dishes?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Ошибка загрузки блюд');
        allDishes = await response.json();
    } catch (err) {
        showNotification(err.message);
    }
}

// Загрузка заказов
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Ошибка загрузки заказов');
        allOrders = await response.json();
        
        // Сортировка по дате (сначала новые)
        allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        renderOrdersTable();
    } catch (err) {
        showNotification(err.message);
    }
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Форматирование даты: "23.11.2024 20:01"
function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${d}.${m}.${y} ${hours}:${mins}`;
}

// Получение списка объектов блюд для конкретного заказа
function getOrderDishes(order) {
    // Поля в объекте заказа, содержащие ID блюд
    const fields = ['soup_id', 'main_course_id', 'salad_id', 'drink_id', 'dessert_id'];
    const result = [];
    
    fields.forEach(field => {
        const id = order[field];
        if (id) {
            const dish = allDishes.find(d => d.id === id);
            if (dish) result.push(dish);
        }
    });
    return result;
}

// Подсчет стоимости заказа
function calculateCost(order) {
    const dishes = getOrderDishes(order);
    return dishes.reduce((sum, dish) => sum + dish.price, 0);
}

// Формирование строки состава заказа (через запятую)
function getCompositionString(order) {
    const dishes = getOrderDishes(order);
    return dishes.map(d => d.name).join(', ');
}

// Уведомление (всплывашка)
function showNotification(text) {
    let box = document.querySelector('.notification');
    if (!box) {
        box = document.createElement('div');
        box.className = 'notification';
        document.body.appendChild(box);
    }
    box.textContent = text;
    box.classList.add('show');
    setTimeout(() => {
        box.classList.remove('show');
    }, 3000);
}

// --- РЕНДЕРИНГ ТАБЛИЦЫ ---

function renderOrdersTable() {
    const tbody = document.getElementById('orders-tbody');
    const noMsg = document.getElementById('no-orders-msg');
    
    tbody.innerHTML = '';
    
    if (allOrders.length === 0) {
        noMsg.style.display = 'block';
        return;
    } else {
        noMsg.style.display = 'none';
    }

    allOrders.forEach((order, index) => {
        const tr = document.createElement('tr');
        
        // Время доставки для отображения
        let deliveryText = order.delivery_time;
        if (order.delivery_type === 'now') {
            deliveryText = 'В течение дня (с 07:00 до 23:00)';
        }
        
        const cost = calculateCost(order);
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDate(order.created_at)}</td>
            <td style="max-width: 300px;">${getCompositionString(order)}</td>
            <td>${cost}₽</td>
            <td>${deliveryText}</td>
            <td>
                <div class="actions">
                    <button class="action-btn btn-view" title="Подробнее" data-id="${order.id}">${ICONS.eye}</button>
                    <button class="action-btn btn-edit" title="Редактировать" data-id="${order.id}">${ICONS.edit}</button>
                    <button class="action-btn btn-delete" title="Удалить" data-id="${order.id}">${ICONS.trash}</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Навешиваем обработчики на новые кнопки
    document.querySelectorAll('.btn-view').forEach(btn => 
        btn.addEventListener('click', () => openViewModal(btn.dataset.id))
    );
    document.querySelectorAll('.btn-edit').forEach(btn => 
        btn.addEventListener('click', () => openEditModal(btn.dataset.id))
    );
    document.querySelectorAll('.btn-delete').forEach(btn => 
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id))
    );
}

// --- РАБОТА С МОДАЛЬНЫМИ ОКНАМИ ---

// Открытие модалки по ID
function showModal(modalId) {
    document.getElementById(modalId).classList.add('open');
    document.body.style.overflow = 'hidden'; // Блокировка прокрутки фона
}

// Закрытие модалки
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
    document.body.style.overflow = '';
}

// 1. ПРОСМОТР ЗАКАЗА
function openViewModal(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    if (!order) return;

    // Заполнение полей
    document.getElementById('view-date').textContent = formatDate(order.created_at);
    document.getElementById('view-name').textContent = order.full_name;
    document.getElementById('view-address').textContent = order.delivery_address;
    document.getElementById('view-phone').textContent = order.phone;
    document.getElementById('view-email').textContent = order.email;
    document.getElementById('view-comment').textContent = order.comment || 'Нет комментария';
    
    // Время
    if (order.delivery_type === 'now') {
        document.getElementById('view-time').textContent = 'Как можно скорее (07:00 - 23:00)';
    } else {
        document.getElementById('view-time').textContent = order.delivery_time;
    }

    // Состав и цена
    const dishes = getOrderDishes(order);
    const compDiv = document.getElementById('view-composition');
    compDiv.innerHTML = '';
    dishes.forEach(d => {
        const line = document.createElement('div');
        line.style.display = 'flex';
        line.style.justifyContent = 'space-between';
        line.style.marginBottom = '4px';
        line.innerHTML = `<span>${d.name}</span><span>${d.price}₽</span>`;
        compDiv.appendChild(line);
    });
    
    const cost = calculateCost(order);
    document.getElementById('view-total').textContent = `${cost}₽`;

    showModal('modal-view');
}

// 2. РЕДАКТИРОВАНИЕ ЗАКАЗА
function openEditModal(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    if (!order) return;
    currentOrderId = order.id;

    // Заполнение формы текущими значениями
    document.getElementById('edit-date-display').textContent = formatDate(order.created_at);
    document.getElementById('edit-name').value = order.full_name;
    document.getElementById('edit-address').value = order.delivery_address;
    document.getElementById('edit-phone').value = order.phone;
    document.getElementById('edit-email').value = order.email;
    document.getElementById('edit-comment').value = order.comment || '';
    
    // Радиокнопки
    if (order.delivery_type === 'by_time') {
        document.getElementById('edit-type-time').checked = true;
        document.getElementById('edit-time').disabled = false;
        document.getElementById('edit-time').value = order.delivery_time; // Формат HH:MM совпадает с input type=time
    } else {
        document.getElementById('edit-type-now').checked = true;
        document.getElementById('edit-time').disabled = true;
        document.getElementById('edit-time').value = '';
    }

    // Состав (только для чтения)
    const dishes = getOrderDishes(order);
    const compDiv = document.getElementById('edit-composition-display');
    compDiv.innerHTML = '';
    dishes.forEach(d => {
        const line = document.createElement('div');
        line.textContent = `${d.name} (${d.price}₽)`;
        compDiv.appendChild(line);
    });
    document.getElementById('edit-total-display').textContent = calculateCost(order) + '₽';

    showModal('modal-edit');
}

// Логика переключения типа доставки в форме редактирования
document.getElementById('edit-type-now').addEventListener('change', () => {
    const timeInput = document.getElementById('edit-time');
    timeInput.disabled = true;
    timeInput.value = '';
    timeInput.required = false;
});
document.getElementById('edit-type-time').addEventListener('change', () => {
    const timeInput = document.getElementById('edit-time');
    timeInput.disabled = false;
    timeInput.required = true;
});

// Сохранение изменений
document.getElementById('save-edit-btn').addEventListener('click', async () => {
    const form = document.getElementById('edit-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Сбор данных формы
    const formData = new FormData(form);
    
    // В API метод PUT требует только изменяемые поля.
    // FormData автоматически соберет name/address/phone/email/comment/delivery_type/delivery_time
    
    try {
        const response = await fetch(`${API_URL}/orders/${currentOrderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Ошибка при сохранении');
        }

        showNotification('Заказ успешно изменён');
        closeModal('modal-edit');
        loadOrders(); // Обновляем список
    } catch (err) {
        showNotification(err.message);
    }
});

// 3. УДАЛЕНИЕ ЗАКАЗА
function openDeleteModal(orderId) {
    currentOrderId = orderId;
    showModal('modal-delete');
}

document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!currentOrderId) return;
    
    try {
        const response = await fetch(`${API_URL}/orders/${currentOrderId}?api_key=${API_KEY}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Ошибка удаления');
        }

        showNotification('Заказ успешно удалён');
        closeModal('modal-delete');
        loadOrders(); // Обновляем список
    } catch (err) {
        showNotification(err.message);
    }
});

// --- ОБЩАЯ ИНИЦИАЛИЗАЦИЯ ---

// Закрытие модалок по крестику и кнопкам
document.querySelectorAll('.modal-close, .modal-close-btn').forEach(el => {
    el.addEventListener('click', function() {
        const targetId = this.dataset.target;
        closeModal(targetId);
    });
});

// Закрытие по клику вне контента
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Старт
document.addEventListener('DOMContentLoaded', async () => {
    await loadDishes(); // Сначала блюда (для названий)
    await loadOrders(); // Потом заказы
});