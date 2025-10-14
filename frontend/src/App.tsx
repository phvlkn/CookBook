import { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { FilterState } from "./components/FilterSidebar";
import { SearchFilters } from "./components/SearchFilters";
import { RecipeCard, Recipe } from "./components/RecipeCard";
import { RecipeModal } from "./components/RecipeModal";
import { ShoppingCartModal } from "./components/ShoppingCartModal";
import { ProfilePage } from "./components/ProfilePage";
import { Button } from "./components/ui/button";
import { Grid, List } from "lucide-react";

// Mock data for recipes
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Паста Карбонара",
    description: "Классическая итальянская паста с беконом, яйцами и сыром пармезан",
    image: "https://images.unsplash.com/photo-1711539137930-3fa2ae6cec60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzU5NDg1OTIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    cookTime: 25,
    servings: 4,
    rating: 4.8,
    reviewCount: 156,
    tags: ["Ужин", "Итальянская кухня", "Быстро"],
    author: {
      name: "Мария Волкова",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c963ed09?w=100&h=100&fit=crop&crop=face"
    },
    ingredients: [
      "Спагетти - 400г",
      "Бекон - 200г", 
      "Яйца - 3 шт",
      "Сыр пармезан - 100г",
      "Черный перец - по вкусу",
      "Соль - по вкусу"
    ]
  },
  {
    id: "2",
    title: "Домашняя Пицца Маргарита",
    description: "Хрустящая пицца с томатным соусом, моцареллой и свежим базиликом",
    image: "https://images.unsplash.com/photo-1734774421809-48eac182a5cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMHBpenphfGVufDF8fHx8MTc1OTQ4NTkyMXww&ixlib=rb-4.1.0&q=80&w=1080",
    cookTime: 45,
    servings: 2,
    rating: 4.9,
    reviewCount: 203,
    tags: ["Обед", "Ужин", "Итальянская кухня"],
    author: {
      name: "Алексей Петров",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    ingredients: [
      "Мука - 300г",
      "Дрожжи сухие - 7г",
      "Томаты - 400г",
      "Моцарелла - 200г",
      "Базилик свежий - 10г",
      "Оливковое масло - 3 ст.л."
    ]
  },
  {
    id: "3",
    title: "Свежий Греческий Салат",
    description: "Легкий и освежающий салат с овощами, сыром фета и оливками",
    image: "https://images.unsplash.com/photo-1620019989479-d52fcedd99fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkJTIwYm93bHxlbnwxfHx8fDE3NTk0NTk1Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cookTime: 15,
    servings: 4,
    rating: 4.6,
    reviewCount: 89,
    tags: ["Закуска", "Легко", "Вегетарианское"],
    author: {
      name: "София Николаева",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
    },
    ingredients: [
      "Помидоры - 3 шт",
      "Огурцы - 2 шт",
      "Красный лук - 1 шт",
      "Сыр фета - 150г",
      "Оливки - 100г",
      "Оливковое масло - 2 ст.л."
    ]
  },
  {
    id: "4",
    title: "Шоколадный Торт",
    description: "Влажный шоколадный торт с ганашем и ягодами",
    image: "https://images.unsplash.com/photo-1644158776192-2d24ce35da1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlJTIwZGVzc2VydHxlbnwxfHx8fDE3NTk0NDQ5OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cookTime: 90,
    servings: 8,
    rating: 4.9,
    reviewCount: 312,
    tags: ["Десерт", "Шоколад", "Праздник"],
    author: {
      name: "Екатерина Белова",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
    },
    ingredients: [
      "Мука - 200г",
      "Какао - 50г",
      "Сахар - 150г",
      "Яйца - 3 шт",
      "Сливки 35% - 300мл",
      "Темный шоколад - 200г"
    ]
  },
  {
    id: "5",
    title: "Пушистые Панкейки",
    description: "Американские панкейки с кленовым сиропом и ягодами",
    image: "https://images.unsplash.com/photo-1636743713732-125909a35dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBwYW5jYWtlc3xlbnwxfHx8fDE3NTk0Mjg1MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cookTime: 20,
    servings: 3,
    rating: 4.7,
    reviewCount: 178,
    tags: ["Завтрак", "Сладкое", "Быстро"],
    author: {
      name: "Дмитрий Козлов",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    ingredients: [
      "Мука - 200г",
      "Молоко - 250мл",
      "Яйца - 2 шт",
      "Сахар - 2 ст.л.",
      "Разрыхлитель - 1 ч.л.",
      "Масло сливочное - 30г"
    ]
  },
  {
    id: "6",
    title: "Суши Роллы",
    description: "Домашние суши роллы с лососем и авокадо",
    image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJvbGxzfGVufDF8fHx8MTc1OTQzMjI5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    cookTime: 60,
    servings: 4,
    rating: 4.5,
    reviewCount: 134,
    tags: ["Обед", "Ужин", "Японская кухня"],
    author: {
      name: "Анна Морозова",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    ingredients: [
      "Рис для суши - 300г",
      "Нори - 6 листов",
      "Лосось - 200г",
      "Авокадо - 2 шт",
      "Огурец - 1 шт",
      "Рисовый уксус - 3 ст.л."
    ]
  }
];

// Shopping cart items interface
interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isChecked: boolean;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isShoppingCartOpen, setIsShoppingCartOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    cookTime: [5, 180],
    dietary: [],
    difficulty: [],
    ingredients: []
  });

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    let recipesToShow = mockRecipes;

    // If not searching, show all recipes
    if (!isSearching && !searchQuery) {
      return recipesToShow.map(recipe => ({
        ...recipe,
        isFavorite: favorites.includes(recipe.id)
      }));
    }

    // Apply search and filters when searching
    return recipesToShow.filter(recipe => {
      // Search filter
      if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && 
          !filters.categories.some(cat => recipe.tags.includes(cat))) {
        return false;
      }

      // Cook time filter
      if (recipe.cookTime < filters.cookTime[0] || recipe.cookTime > filters.cookTime[1]) {
        return false;
      }

      // Dietary filter
      if (filters.dietary.length > 0 && 
          !filters.dietary.some(diet => recipe.tags.includes(diet))) {
        return false;
      }

      // Ingredients filter (recipes that contain the selected ingredients)
      if (filters.ingredients.length > 0) {
        const hasIngredients = filters.ingredients.some(ingredient =>
          recipe.ingredients.some(recipeIngredient =>
            recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
          )
        );
        if (!hasIngredients) return false;
      }

      return true;
    }).map(recipe => ({
      ...recipe,
      isFavorite: favorites.includes(recipe.id)
    }));
  }, [searchQuery, filters, favorites, isSearching]);

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const handleAddToCart = (ingredients: string[]) => {
    const newItems: ShoppingItem[] = ingredients.map((ingredient, index) => {
      const [name, quantity] = ingredient.split(' - ');
      return {
        id: `${Date.now()}-${index}`,
        name: name || ingredient,
        quantity: quantity || '',
        category: getCategoryFromIngredient(name || ingredient),
        isChecked: false
      };
    });

    setShoppingItems(prev => {
      const existingItems = new Map(prev.map(item => [item.name, item]));
      const mergedItems = [...prev];

      newItems.forEach(newItem => {
        if (!existingItems.has(newItem.name)) {
          mergedItems.push(newItem);
        }
      });

      return mergedItems;
    });

    setIsShoppingCartOpen(true);
  };

  const getCategoryFromIngredient = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase();
    if (lowerIngredient.includes('мясо') || lowerIngredient.includes('курица') || 
        lowerIngredient.includes('говядина') || lowerIngredient.includes('бекон')) {
      return 'Мясо и птица';
    }
    if (lowerIngredient.includes('молоко') || lowerIngredient.includes('сыр') || 
        lowerIngredient.includes('сливки') || lowerIngredient.includes('яйца')) {
      return 'Молочные продукты';
    }
    if (lowerIngredient.includes('помидор') || lowerIngredient.includes('огурец') || 
        lowerIngredient.includes('лук') || lowerIngredient.includes('морковь')) {
      return 'Овощи';
    }
    if (lowerIngredient.includes('мука') || lowerIngredient.includes('рис') || 
        lowerIngredient.includes('макароны') || lowerIngredient.includes('хлеб')) {
      return 'Крупы и хлеб';
    }
    return 'Прочее';
  };

  const handleUpdateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setShoppingItems([]);
  };

  const handleAddToCollection = (recipeId: string) => {
    // В реальном приложении здесь была бы логика добавления в коллекцию
    console.log('Add to collection:', recipeId);
  };

  // Get favorite recipes (recipes that are in favorites array)
  const favoriteRecipes = useMemo(() => {
    return mockRecipes
      .filter(recipe => favorites.includes(recipe.id))
      .map(recipe => ({ ...recipe, isFavorite: true }));
  }, [favorites]);

  // Mock user recipes (first 3 recipes for demo)
  const userRecipes = useMemo(() => {
    return mockRecipes.slice(0, 3).map(recipe => ({
      ...recipe,
      isFavorite: favorites.includes(recipe.id)
    }));
  }, [favorites]);

  // Mock saved recipes (different selection)
  const savedRecipes = useMemo(() => {
    return mockRecipes.slice(2, 7).map(recipe => ({
      ...recipe,
      isFavorite: favorites.includes(recipe.id)
    }));
  }, [favorites]);

  if (showProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onSearch={setSearchQuery}
          onShowProfile={() => setShowProfile(!showProfile)}
          onShowCart={() => setIsShoppingCartOpen(true)}
          onAddRecipe={() => console.log('Add recipe')}
          onSearchStateChange={setIsSearching}
          searchQuery={searchQuery}
        />
        
        <ProfilePage
          onBack={() => setShowProfile(false)}
          onRecipeClick={handleViewRecipe}
          onToggleFavorite={handleToggleFavorite}
          userRecipes={userRecipes}
          savedRecipes={savedRecipes}
          favoriteRecipes={favoriteRecipes}
        />

        {/* Modals */}
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onAddToCollection={handleAddToCollection}
        />
        
        <ShoppingCartModal
          isOpen={isShoppingCartOpen}
          onClose={() => setIsShoppingCartOpen(false)}
          items={shoppingItems}
          onUpdateItem={handleUpdateShoppingItem}
          onRemoveItem={handleRemoveShoppingItem}
          onClearCart={handleClearCart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={setSearchQuery}
        onShowProfile={() => setShowProfile(true)}
        onShowCart={() => setIsShoppingCartOpen(true)}
        onAddRecipe={() => console.log('Add recipe')}
        onSearchStateChange={setIsSearching}
        searchQuery={searchQuery}
      />

      {/* Search Filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        isVisible={isSearching}
        resultCount={filteredRecipes.length}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Header for main feed */}
        {!isSearching && (
          <div className="mb-8">
            <h1 className="mb-2">Рекомендуемые рецепты</h1>
            <p className="text-muted-foreground">
              Откройте для себя новые кулинарные идеи от наших авторов
            </p>
          </div>
        )}

        {/* Controls */}
        {isSearching && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Все рецепты'}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 && isSearching ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-2">
              Рецепты не найдены
            </p>
            <p className="text-sm text-muted-foreground">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
              : 'grid-cols-1'
          }`}>
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleFavorite={handleToggleFavorite}
                onViewRecipe={handleViewRecipe}
              />
            ))}
          </div>
        )}
      </main>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        onAddToCollection={handleAddToCollection}
      />

      {/* Shopping Cart Modal */}
      <ShoppingCartModal
        isOpen={isShoppingCartOpen}
        onClose={() => setIsShoppingCartOpen(false)}
        items={shoppingItems}
        onUpdateItem={handleUpdateShoppingItem}
        onRemoveItem={handleRemoveShoppingItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}