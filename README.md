# Основы веб-технологий Набиуллин Артур 241-326

<form id="place-order-form" class="order-form">
              <div class="order-columns">
                <div class="order-block">
                  <h3>Ваш заказ</h3>

                                <div id="order-summary" class="order-summary">
                                    <p class="empty-summary">Ничего не выбрано</p>
                                </div>

                                <div id="order-total-block" style="display:none; margin-top:12px;">
                                    <h4>Стоимость заказа:</h4>
                                    <p id="order-total" style="font-weight:bold; font-size:18px;"></p>
                                </div>

                                <label for="comment">Комментарий</label>
                                <textarea id="comment" name="comment" rows="4"></textarea>
                            </div>

                            <!-- БЛОК 2 — ДАННЫЕ КЛИЕНТА -->
                            <div class="order-block">
                                <h3>Данные клиента</h3>

                                <label for="name">Имя*</label>
                                <input id="name" name="name" type="text" required>

                                <label for="email">Email*</label>
                                <input id="email" name="email" type="email" required>

                                <label class="checkbox-label">
                                    <input id="subscribe" name="subscribe" type="checkbox" checked>
                                    <span>Получать новости и акции</span>
                                </label>

                                <label for="phone">Телефон*</label>
                                <input id="phone" name="phone" type="tel" required>

                                <label for="address">Адрес*</label>
                                <input id="address" name="address" type="text" required>
                                <em>Доставка осуществляется только по Москве</em>

                                <p class="radio-title">Выберите время доставки*</p>
                                <label class="radio-label">
                                    <input id="delivery_asap" type="radio" name="delivery_type" value="asap" required>
                                    <span>Как можно скорее</span>
                                </label>

                                <label class="radio-label">
                                    <input id="delivery_settime" type="radio" name="delivery_type" value="set_time" required>
                                    <span>Выбрать время</span>
                                </label>

                                <label for="delivery_time">Время доставки</label>
                                <input id="delivery_time" name="delivery_time" type="time"
                                       min="07:00" max="23:00" step="300">
                                <em>Доступное время для доставки с 7:00 до 23:00</em>

                                <div class="order-buttons">
                                    <button type="reset" class="reset-btn">Сбросить</button>
                                    <button type="submit" class="submit-btn">Отправить</button>
                                </div>
                            </div>
              </div>
                </div>

              </div>
            </form>