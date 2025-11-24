const dishes = [
  // --- SOUPS (fish 2, meat 2, veg 2) ---
  { keyword: "norwegian", name: "Норвежский суп", price: 270, category: "soup", kind: "fish", count: "330 мл", image: "img/dishes/soups/norwegian_soup.jpg" },
  { keyword: "ramen", name: "Рамен с морепродуктами", price: 290, category: "soup", kind: "fish", count: "350 мл", image: "img/dishes/soups/ramen.jpg" },
  { keyword: "chicken", name: "Куриный суп", price: 220, category: "soup", kind: "meat", count: "350 мл", image: "img/dishes/soups/chicken.jpg" },
  { keyword: "tomyum", name: "Том-Ям", price: 260, category: "soup", kind: "meat", count: "350 мл", image: "img/dishes/soups/tomyum.jpg" },
  { keyword: "gaspacho", name: "Гаспачо", price: 195, category: "soup", kind: "veg", count: "350 мл", image: "img/dishes/soups/gazpacho.jpg" },
  { keyword: "mushroom", name: "Грибной суп-пюре", price: 185, category: "soup", kind: "veg", count: "330 мл", image: "img/dishes/soups/mushroom_soup.jpg" },

  // --- MAINS (fish 2, meat 2, veg 2) ---
  { keyword: "fishrice", name: "Рис с рыбой", price: 320, category: "main", kind: "fish", count: "320 г", image: "img/dishes/main_course/fishrice.jpg" },
  { keyword: "shrimppasta", name: "Паста с креветками", price: 350, category: "main", kind: "fish", count: "300 г", image: "img/dishes/main_course/shrimppasta.jpg" },
  { keyword: "cutlets", name: "Котлеты из курицы с картофельным пюре", price: 225, category: "main", kind: "meat", count: "280 г", image: "img/dishes/main_course/chickencutletsandmashedpotatoes.jpg" },
  { keyword: "lasagna", name: "Лазанья", price: 385, category: "main", kind: "meat", count: "310 г", image: "img/dishes/main_course/lasagna.jpg" },
  { keyword: "potatoes", name: "Жареная картошка с грибами", price: 150, category: "main", kind: "veg", count: "250 г", image: "img/dishes/main_course/friedpotatoeswithmushrooms1.jpg" },
  { keyword: "pizza", name: "Вегетарианская пицца", price: 330, category: "main", kind: "veg", count: "350 г", image: "img/dishes/main_course/pizza.jpg" },

  // --- SALADS / STARTERS (fish1, meat1, veg4) ---
  { keyword: "tunasalad", name: "Салат с тунцом", price: 280, category: "salad", kind: "fish", count: "220 г", image: "img/dishes/salads_starters/tunasalad.jpg" },
  { keyword: "caesar", name: "Цезарь с курицей", price: 260, category: "salad", kind: "meat", count: "200 г", image: "img/dishes/salads_starters/caesar.jpg" },
  { keyword: "caprese", name: "Капрезе с моцареллой", price: 240, category: "salad", kind: "veg", count: "180 г", image: "img/dishes/salads_starters/caprese.jpg" },
  { keyword: "frenchfries1", name: "Фри с соусом Цезарь", price: 150, category: "salad", kind: "veg", count: "200 г", image: "img/dishes/salads_starters/frenchfries1.jpg" },
  { keyword: "frenchfries2", name: "Фри с кетчупом", price: 130, category: "salad", kind: "veg", count: "180 г", image: "img/dishes/salads_starters/frenchfries2.jpg" },
  { keyword: "saladwithegg", name: "Салат с яйцом", price: 200, category: "salad", kind: "veg", count: "170 г", image: "img/dishes/salads_starters/saladwithegg.jpg" },

  // --- DRINKS (cold3, hot3) ---
  { keyword: "orange", name: "Апельсиновый сок", price: 120, category: "drink", kind: "cold", count: "300 мл", image: "img/dishes/beverages/orangejuice.jpg" },
  { keyword: "apple", name: "Яблочный сок", price: 90, category: "drink", kind: "cold", count: "300 мл", image: "img/dishes/beverages/applejuice.jpg" },
  { keyword: "carrot", name: "Морковный сок", price: 110, category: "drink", kind: "cold", count: "300 мл", image: "img/dishes/beverages/carrotjuice.jpg" },
  { keyword: "cappuccino", name: "Капучино", price: 160, category: "drink", kind: "hot", count: "200 мл", image: "img/dishes/beverages/cappuccino.jpg" },
  { keyword: "greentea", name: "Зелёный чай", price: 100, category: "drink", kind: "hot", count: "250 мл", image: "img/dishes/beverages/greentea.jpg" },
  { keyword: "tea", name: "Чай чёрный", price: 80, category: "drink", kind: "hot", count: "250 мл", image: "img/dishes/beverages/tea.jpg" },

  // --- DESSERTS (small3, medium2, large1) ---
  { keyword: "baklava", name: "Пахлава", price: 120, category: "dessert", kind: "small", count: "300 г", image: "img/dishes/desserts/baklava.jpg" },
  { keyword: "checheesecake", name: "Чизкейк", price: 140, category: "dessert", kind: "small", count: "125 г", image: "img/dishes/desserts/checheesecake.jpg" },
  { keyword: "donuts2", name: "Пончики — 3 шт", price: 110, category: "dessert", kind: "small", count: "350 г", image: "img/dishes/desserts/donuts2.jpg" },
  { keyword: "chocolatecake", name: "Шоколадный торт", price: 260, category: "dessert", kind: "medium", count: "140 г", image: "img/dishes/desserts/chocolatecake.jpg" },
  { keyword: "chocolatecheesecake", name: "Шоколадный чизкейк", price: 300, category: "dessert", kind: "medium", count: "125 г", image: "img/dishes/desserts/chocolatecheesecake.jpg" },
  { keyword: "donuts", name: "Пончики — 6 шт", price: 200, category: "dessert", kind: "large", count: "700 г", image: "img/dishes/desserts/donuts.jpg" }
];
