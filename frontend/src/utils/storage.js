// Storage utilities for local user/recipe management

// ===== USER STORAGE =====
export const UserStorage = {
  // Get all users
  getUsers() {
    const data = localStorage.getItem('cookbook_users');
    return data ? JSON.parse(data) : [];
  },

  // Register a new user
  registerUser(email, password, username, avatar = null) {
    const users = this.getUsers();
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      throw new Error('Email уже зарегистрирован');
    }

    const newUser = {
      id: Date.now(), // simple ID generation
      email,
      password, // Note: in real app, hash password! This is for demo only.
      username,
      avatar: avatar || `/default-avatar.png`,
      bio: '',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('cookbook_users', JSON.stringify(users));
    return newUser;
  },

  // Login user
  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Store logged-in user
    localStorage.setItem('cookbook_loggedInUser', JSON.stringify(user));
    return user;
  },

  // Get current logged-in user
  getCurrentUser() {
    const data = localStorage.getItem('cookbook_loggedInUser');
    return data ? JSON.parse(data) : null;
  },

  // Logout
  logout() {
    localStorage.removeItem('cookbook_loggedInUser');
  },

  // Update user
  updateUser(userId, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem('cookbook_users', JSON.stringify(users));

    // If it's the logged-in user, update that too
    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem('cookbook_loggedInUser', JSON.stringify(users[idx]));
    }

    return users[idx];
  },

  // Get user by ID (for displaying in reviews)
  getUserById(userId) {
    const users = this.getUsers();
    return users.find(u => u.id === userId);
  },
};

// ===== RECIPE STORAGE =====
export const RecipeStorage = {
  // Get all recipes
  getRecipes() {
    const data = localStorage.getItem('cookbook_recipes');
    return data ? JSON.parse(data) : [];
  },

  // Get recipes by user ID
  getRecipesByUser(userId) {
    const recipes = this.getRecipes();
    return recipes.filter(r => r.authorId === userId);
  },

  // Create recipe
  createRecipe(title, description, cookTime, category, ingredients, steps, image = null, authorId = null) {
    const recipes = this.getRecipes();
    
    const newRecipe = {
      id: Date.now(),
      title,
      description,
      cookTime,
      category,
      ingredients, // Array of { name, quantity, unit }
      steps, // Array of { order, text }
      image, // URL or local path
      authorId: authorId || UserStorage.getCurrentUser()?.id,
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    recipes.push(newRecipe);
    localStorage.setItem('cookbook_recipes', JSON.stringify(recipes));
    return newRecipe;
  },

  // Get recipe by ID
  getRecipeById(recipeId) {
    const recipes = this.getRecipes();
    return recipes.find(r => r.id === recipeId);
  },

  // Delete recipe
  deleteRecipe(recipeId) {
    let recipes = this.getRecipes();
    recipes = recipes.filter(r => r.id !== recipeId);
    localStorage.setItem('cookbook_recipes', JSON.stringify(recipes));
  },

  // Add review to recipe
  addReview(recipeId, userId, rating, comment = '') {
    const recipes = this.getRecipes();
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const review = {
      id: Date.now(),
      userId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    recipe.reviews.push(review);
    
    // Update average rating
    const avgRating = recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / recipe.reviews.length;
    recipe.rating = avgRating;

    localStorage.setItem('cookbook_recipes', JSON.stringify(recipes));
    return review;
  },

  // Search recipes
  searchRecipes(query) {
    const recipes = this.getRecipes();
    const q = query.toLowerCase();
    return recipes.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.ingredients.some(ing => ing.name.toLowerCase().includes(q))
    );
  },
};

// ===== SEED DATA =====
export const seedInitialData = () => {
  const existing = localStorage.getItem('cookbook_recipes');
  
  // Only seed if truly no data exists (and has valid data)
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('✅ Data already exists, skipping seed. Count:', parsed.length);
        return; // Already seeded properly
      }
    } catch (e) {
      console.warn('Corrupted data, reseeding...');
    }
  }
  
  console.log('🌱 Seeding initial recipes...');

  const sampleRecipes = [
    {
      id: 1,
      title: 'Паста Карбонара',
      description: 'Классическое итальянское блюдо с беконом, яйцом и пармезаном',
      cookTime: 20,
      category: 'Паста',
      ingredients: [
        { name: 'Спагетти', quantity: 400, unit: 'г' },
        { name: 'Бекон', quantity: 200, unit: 'г' },
        { name: 'Яйца', quantity: 4, unit: 'шт' },
        { name: 'Пармезан', quantity: 100, unit: 'г' },
        { name: 'Чёрный перец', quantity: 1, unit: 'щепотка' },
      ],
      steps: [
        { order: 1, text: 'Варить спагетти в подсолённой воде 10-12 минут' },
        { order: 2, text: 'Нарезать и обжарить бекон' },
        { order: 3, text: 'Взбить яйца с пармезаном' },
        { order: 4, text: 'Смешать горячую пасту с беконом и яично-сыромолочной смесью' },
        { order: 5, text: 'Подавать с чёрным перцем' },
      ],
      image: 'https://cooklikemary.ru/sites/default/files/styles/width_700/public/img_1357-2.jpg',
      authorId: null,
      rating: 4.8,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Цезарь салат',
      description: 'Свежий салат с курицей, пармезаном и сухариками',
      cookTime: 15,
      category: 'Салат',
      ingredients: [
        { name: 'Салат Романо', quantity: 300, unit: 'г' },
        { name: 'Курица отварная', quantity: 300, unit: 'г' },
        { name: 'Пармезан', quantity: 80, unit: 'г' },
        { name: 'Сухарики', quantity: 100, unit: 'г' },
        { name: 'Оливковое масло', quantity: 50, unit: 'мл' },
        { name: 'Лимонный сок', quantity: 30, unit: 'мл' },
      ],
      steps: [
        { order: 1, text: 'Разрезать салат на кусочки' },
        { order: 2, text: 'Нарезать кубиками отварную курицу' },
        { order: 3, text: 'Смешать оливковое масло и лимонный сок' },
        { order: 4, text: 'Собрать салат, добавить пармезан и сухарики' },
        { order: 5, text: 'Полить заправкой' },
      ],
      image: 'https://tsx.x5static.net/i/800x800-fit/xdelivery/files/15/xd/9c3d37b044d3c190be134307a717.jpg',
      authorId: null,
      rating: 4.5,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Борщ украинский',
      description: 'Традиционный борщ с мясом и свежей зеленью',
      cookTime: 90,
      category: 'Суп',
      ingredients: [
        { name: 'Говядина', quantity: 500, unit: 'г' },
        { name: 'Свёкла', quantity: 2, unit: 'шт' },
        { name: 'Капуста', quantity: 300, unit: 'г' },
        { name: 'Картофель', quantity: 3, unit: 'шт' },
        { name: 'Морковь', quantity: 1, unit: 'шт' },
        { name: 'Помидоры', quantity: 2, unit: 'шт' },
        { name: 'Укроп', quantity: 20, unit: 'г' },
      ],
      steps: [
        { order: 1, text: 'Отварить мясо в подсолённой воде 30 минут' },
        { order: 2, text: 'Нарезать и добавить овощи' },
        { order: 3, text: 'Варить до готовности овощей' },
        { order: 4, text: 'Добавить уксус для кислоты' },
        { order: 5, text: 'Подавать со свежей зеленью' },
      ],
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm-97AmbQKbx-_8rUi-zjz6nLDVG2j0fELhQ&s',
      authorId: null,
      rating: 4.7,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      title: 'Куриные крылышки в соусе терияки',
      description: 'Хрустящие крылышки в сладко-солёном соусе',
      cookTime: 40,
      category: 'Мясо',
      ingredients: [
        { name: 'Куриные крылья', quantity: 1, unit: 'кг' },
        { name: 'Соевый соус', quantity: 50, unit: 'мл' },
        { name: 'Мёд', quantity: 30, unit: 'мл' },
        { name: 'Чеснок', quantity: 3, unit: 'зубцов' },
        { name: 'Имбирь', quantity: 10, unit: 'г' },
        { name: 'Кунжут', quantity: 20, unit: 'г' },
      ],
      steps: [
        { order: 1, text: 'Смешать соевый соус, мёд, чеснок и имбирь' },
        { order: 2, text: 'Замариновать крылья на 30 минут' },
        { order: 3, text: 'Запечь при 200°C 35 минут' },
        { order: 4, text: 'Посыпать кунжутом' },
      ],
      image: 'https://aidigo-shop.ru/upload/resize_cache/webp/upload/iblock/cf0/cf0c3f1c320e937f8a66a661ef710925.webp',
      authorId: null,
      rating: 4.6,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      title: 'Маргарита пицца',
      description: 'Классическая пицца с моцареллой и томатами',
      cookTime: 25,
      category: 'Пицца',
      ingredients: [
        { name: 'Тесто пиццы', quantity: 400, unit: 'г' },
        { name: 'Соус томатный', quantity: 150, unit: 'мл' },
        { name: 'Моцарелла', quantity: 250, unit: 'г' },
        { name: 'Помидоры', quantity: 2, unit: 'шт' },
        { name: 'Базилик', quantity: 10, unit: 'г' },
        { name: 'Оливковое масло', quantity: 30, unit: 'мл' },
      ],
      steps: [
        { order: 1, text: 'Раскатать тесто' },
        { order: 2, text: 'Смазать соусом томатным' },
        { order: 3, text: 'Выложить моцареллу и помидоры' },
        { order: 4, text: 'Запечь при 220°C 15-20 минут' },
        { order: 5, text: 'Украсить базиликом' },
      ],
      image: 'https://lh3.googleusercontent.com/-F7-f2RyixFJ_0-MIGehlz7lp08CkWuy7Y64qDx8zcSrAyHA_uWVnJx1XOVAHg_qoFD7fW34aWScKlOz7tlHx8LeBxDoB64vaZ6LCKKMAPPnr8-QTpPpQVVK-xGPWFZomSVkVZXW',
      authorId: null,
      rating: 4.9,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 6,
      title: 'Омлет с грибами',
      description: 'Пушистый омлет с лесными грибами и сыром',
      cookTime: 10,
      category: 'Завтрак',
      ingredients: [
        { name: 'Яйца', quantity: 3, unit: 'шт' },
        { name: 'Грибы', quantity: 200, unit: 'г' },
        { name: 'Сыр', quantity: 50, unit: 'г' },
        { name: 'Масло сливочное', quantity: 30, unit: 'г' },
        { name: 'Соль и перец', quantity: 1, unit: 'по вкусу' },
      ],
      steps: [
        { order: 1, text: 'Нарезать и обжарить грибы' },
        { order: 2, text: 'Взбить яйца с солью и перцем' },
        { order: 3, text: 'Вылить яйца на сковороду с маслом' },
        { order: 4, text: 'Добавить грибы и сыр' },
        { order: 5, text: 'Сложить пополам' },
      ],
      image: 'https://static.1000.menu/img/content-v2/ff/39/26799/omlet-s-gribami-i-syrom-na-skovorode-na-zavtrak_1637821343_5_max.jpg',
      authorId: null,
      rating: 4.4,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 7,
      title: 'Тирамису',
      description: 'Итальянский десерт с маскарпоне и какао',
      cookTime: 30,
      category: 'Десерт',
      ingredients: [
        { name: 'Печенье Ладифингер', quantity: 24, unit: 'шт' },
        { name: 'Маскарпоне', quantity: 500, unit: 'г' },
        { name: 'Эспрессо', quantity: 150, unit: 'мл' },
        { name: 'Какао порошок', quantity: 30, unit: 'г' },
        { name: 'Сахар', quantity: 100, unit: 'г' },
        { name: 'Яйца', quantity: 2, unit: 'шт' },
      ],
      steps: [
        { order: 1, text: 'Взбить яйца с сахаром' },
        { order: 2, text: 'Смешать с маскарпоне' },
        { order: 3, text: 'Обмакнуть печенье в эспрессо' },
        { order: 4, text: 'Выложить слои печенья и крема' },
        { order: 5, text: 'Посыпать какао и охладить 4 часа' },
      ],
      image: 'https://e1.edimdoma.ru/data/photos/0016/0292/160292-ed4_wide.jpg',
      authorId: null,
      rating: 4.8,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 8,
      title: 'Том Ям',
      description: 'Острый тайский суп с морепродуктами',
      cookTime: 35,
      category: 'Суп',
      ingredients: [
        { name: 'Креветки', quantity: 300, unit: 'г' },
        { name: 'Кокосовое молоко', quantity: 400, unit: 'мл' },
        { name: 'Лемонграсс', quantity: 2, unit: 'стебля' },
        { name: 'Галангал', quantity: 20, unit: 'г' },
        { name: 'Лайм', quantity: 2, unit: 'шт' },
        { name: 'Чили', quantity: 2, unit: 'шт' },
      ],
      steps: [
        { order: 1, text: 'Сварить бульон с лемонграссом и галангалом' },
        { order: 2, text: 'Добавить кокосовое молоко' },
        { order: 3, text: 'Положить креветки' },
        { order: 4, text: 'Добавить сок лайма и чили' },
        { order: 5, text: 'Варить до готовности креветок' },
      ],
      image: 'https://tc-imgproxy-prod.fssoft.ru/7Pc2RiVZOrxpk9QBkRF9AioKxP3doINn9loUvHPyk0w/rs:auto:650:650/q:80/f:webp/sm:1/plain/s3:/media-bucket/news/2025/02/1911800520tomyamkura.jpg',
      authorId: null,
      rating: 4.7,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 9,
      title: 'Греческий салат',
      description: 'Свежий салат с фетой и маслинами',
      cookTime: 10,
      category: 'Салат',
      ingredients: [
        { name: 'Помидоры', quantity: 3, unit: 'шт' },
        { name: 'Огурцы', quantity: 2, unit: 'шт' },
        { name: 'Фета', quantity: 250, unit: 'г' },
        { name: 'Маслины', quantity: 100, unit: 'г' },
        { name: 'Лук красный', quantity: 1, unit: 'шт' },
        { name: 'Оливковое масло', quantity: 50, unit: 'мл' },
      ],
      steps: [
        { order: 1, text: 'Нарезать помидоры и огурцы кубиками' },
        { order: 2, text: 'Нарезать лук полукольцами' },
        { order: 3, text: 'Смешать овощи и маслины' },
        { order: 4, text: 'Добавить кубики феты' },
        { order: 5, text: 'Полить оливковым маслом' },
      ],
      image: 'https://art-lunch.ru/content/uploads/2018/07/Greek_salad_01.jpg',
      authorId: null,
      rating: 4.6,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 10,
      title: 'Паста Болоньезе',
      description: 'Классическая итальянская паста с мясным соусом',
      cookTime: 60,
      category: 'Паста',
      ingredients: [
        { name: 'Паста', quantity: 400, unit: 'г' },
        { name: 'Говяжий фарш', quantity: 500, unit: 'г' },
        { name: 'Помидоры консервированные', quantity: 400, unit: 'г' },
        { name: 'Лук', quantity: 1, unit: 'шт' },
        { name: 'Чеснок', quantity: 2, unit: 'зубцов' },
        { name: 'Оливковое масло', quantity: 50, unit: 'мл' },
      ],
      steps: [
        { order: 1, text: 'Обжарить лук и чеснок' },
        { order: 2, text: 'Добавить говяжий фарш' },
        { order: 3, text: 'Влить помидоры и томатную пасту' },
        { order: 4, text: 'Варить 45-50 минут на слабом огне' },
        { order: 5, text: 'Подать с отварной пастой' },
      ],
      image: 'https://primebeef.ru/images/cms/data/blog/284716036_6_1000x700_combino-spaghetti-1-kg-spagetti-barilla-1kg-barilla-n-5-v-nalichii-_rev023.jpg',
      authorId: null,
      rating: 4.8,
      reviews: [],
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem('cookbook_recipes', JSON.stringify(sampleRecipes));
  console.log('✅ Successfully seeded', sampleRecipes.length, 'recipes');
  console.log('First recipe:', sampleRecipes[0].title);
};
