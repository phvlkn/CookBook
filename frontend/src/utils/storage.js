const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEYS = {
  TOKEN: 'cookbook_api_token',
  USER: 'cookbook_api_user',
};

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);
const setToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
};

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cookbook-auth-changed'));
  }
};

const getStoredUser = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored user', error);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
};

const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
  notifyAuthChange();
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponse = async (response) => {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }
  }
  if (!response.ok) {
    const message = data?.detail ?? data?.message ?? response.statusText;
    throw new Error(message);
  }
  return data;
};

const request = async (path, { method = 'GET', body, form, headers = {} } = {}) => {
  const hasJson = body !== undefined && body !== null;
  const requestHeaders = { ...headers, ...authHeaders() };
  const options = { method, headers: requestHeaders };

  if (form) {
    options.body = form;
    delete options.headers['Content-Type'];
  } else if (hasJson) {
    options.headers = { ...requestHeaders, ...jsonHeaders };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  return parseResponse(response);
};

export const ApiAuth = {
  getToken,
  getCurrentUser: getStoredUser,
  logout() {
    setToken(null);
    setStoredUser(null);
  },
};

export const ApiClient = {
  async login(email, password) {
    const { access_token } = await request('/auth/token', {
      method: 'POST',
      body: { email, password },
    });
    setToken(access_token);
    return this.fetchCurrentUser();
  },

  async register(userData) {
    return request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  async fetchCurrentUser() {
    const user = await request('/auth/me');
    setStoredUser(user);
    return user;
  },

  async fetchRecipes({ skip = 0, limit = 50 } = {}) {
    return request(`/recipes/all?skip=${skip}&limit=${limit}`);
  },

  async fetchRecipe(recipeId) {
    return request(`/recipes/${recipeId}`);
  },

  async fetchUserById(userId) {
    return request(`/users/${userId}`);
  },

  async fetchReviews(recipeId) {
    return request(`/recipes/${recipeId}/reviews`);
  },

  async createRecipe(recipeData) {
    return request('/recipes', {
      method: 'POST',
      body: recipeData,
    });
  },

  async uploadRecipe(recipeData, imageFile) {
    const form = new FormData();
    form.append('recipe_json', JSON.stringify(recipeData));
    if (imageFile) {
      form.append('image', imageFile);
    }
    return request('/recipes/upload', {
      method: 'POST',
      form,
    });
  },

  async deleteRecipe(recipeId) {
    return request(`/recipes/${recipeId}`, { method: 'DELETE' });
  },

  async addReview(recipeId, review) {
    return request(`/recipes/${recipeId}/reviews`, {
      method: 'POST',
      body: review,
    });
  },

  async searchRecipes(query, { skip = 0, limit = 50 } = {}) {
    return request(`/recipes/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`);
  },

  async fetchUserRecipes(userId, { skip = 0, limit = 50 } = {}) {
    return request(`/users/${userId}/recipes?skip=${skip}&limit=${limit}`);
  },

  async uploadAvatar(avatarFile) {
    const form = new FormData();
    form.append('avatar', avatarFile);
    return request('/uploads/avatar', { method: 'POST', form });
  },
};

// Compatibility helpers that mimic the old localStorage-based API while migration continues
const LOCAL_USERS_KEY = 'cookbook_users';
const LOCAL_RECIPES_KEY = 'cookbook_recipes';
const LOCAL_LOGGED_USER_KEY = 'cookbook_loggedInUser';

const readArray = (key) => {
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Corrupted data for', key, error);
    return [];
  }
};

const writeArray = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const UserStorage = {
  getUsers() {
    return readArray(LOCAL_USERS_KEY);
  },

  getCurrentUser() {
    const data = localStorage.getItem(LOCAL_LOGGED_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  registerUser(email, password, username, avatar = null) {
    const users = this.getUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error('Email уже зарегистрирован');
    }
    const newUser = {
      id: Date.now(),
      email,
      password,
      username,
      avatar: avatar || '/default-avatar.png',
      bio: '',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeArray(LOCAL_USERS_KEY, users);
    return newUser;
  },

  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Неверный email или пароль');
    }
    localStorage.setItem(LOCAL_LOGGED_USER_KEY, JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem(LOCAL_LOGGED_USER_KEY);
  },

  updateUser(userId, updates) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...updates };
    writeArray(LOCAL_USERS_KEY, users);
    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(LOCAL_LOGGED_USER_KEY, JSON.stringify(users[idx]));
    }
    return users[idx];
  },

  getUserById(userId) {
    const users = this.getUsers();
    return users.find((u) => u.id === userId);
  },
};

export const RecipeStorage = {
  getRecipes() {
    return readArray(LOCAL_RECIPES_KEY);
  },

  getRecipesByUser(userId) {
    return this.getRecipes().filter((r) => r.authorId === userId);
  },

  getRecipeById(recipeId) {
    return this.getRecipes().find((r) => r.id === recipeId);
  },

  createRecipe(title, description, cookTime, category, ingredients, steps, image = null, authorId = null) {
    const recipes = this.getRecipes();
    const newRecipe = {
      id: Date.now(),
      title,
      description,
      cookTime,
      category,
      ingredients,
      steps,
      image,
      authorId,
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
    };
    recipes.push(newRecipe);
    writeArray(LOCAL_RECIPES_KEY, recipes);
    return newRecipe;
  },

  deleteRecipe(recipeId) {
    const recipes = this.getRecipes();
    const remaining = recipes.filter((r) => r.id !== recipeId);
    writeArray(LOCAL_RECIPES_KEY, remaining);
    return remaining;
  },

  addReview(recipeId, userId, rating, comment = '') {
    const recipes = this.getRecipes();
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) throw new Error('Recipe not found');
    const review = {
      id: Date.now(),
      userId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    recipe.reviews.push(review);
    const avgRating = recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / recipe.reviews.length;
    recipe.rating = avgRating;
    writeArray(LOCAL_RECIPES_KEY, recipes);
    return review;
  },

  searchRecipes(query) {
    const q = query.toLowerCase();
    return this.getRecipes().filter((r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
    );
  },
};

export const seedInitialData = () => {
  const existing = localStorage.getItem(LOCAL_RECIPES_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return;
      }
    } catch (error) {
      console.warn('Corrupted recipe data, reseeding...');
    }
  }
  const sampleRecipes = [];
  writeArray(LOCAL_RECIPES_KEY, sampleRecipes);
};
