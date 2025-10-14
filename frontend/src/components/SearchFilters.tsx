import { FilterState } from "./FilterSidebar";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { X, Filter } from "lucide-react";
import { Button } from "./ui/button";

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isVisible: boolean;
  resultCount: number;
}

export function SearchFilters({ filters, onFiltersChange, isVisible, resultCount }: SearchFiltersProps) {
  if (!isVisible) return null;

  const categories = [
    "Завтрак", "Обед", "Ужин", "Десерт", "Закуска", "Напитки"
  ];

  const dietaryOptions = [
    "Веганское", "Вегетарианское", "Без глютена", "Без лактозы", "Кето", "Палео"
  ];

  const popularIngredients = [
    "Курица", "Говядина", "Рыба", "Овощи", "Рис", "Макароны", 
    "Картофель", "Сыр", "Яйца", "Томаты", "Лук", "Чеснок"
  ];

  const updateFilters = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      cookTime: [5, 180],
      dietary: [],
      difficulty: [],
      ingredients: []
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.dietary.length > 0 || 
    filters.ingredients.length > 0 ||
    filters.cookTime[0] !== 5 || 
    filters.cookTime[1] !== 180;

  return (
    <div className="border-b bg-muted/30 py-4">
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Фильтры</span>
              <span className="text-sm text-muted-foreground">
                ({resultCount} {resultCount === 1 ? 'рецепт' : resultCount < 5 ? 'рецепта' : 'рецептов'})
              </span>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Очистить всё
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="cursor-pointer">
                  {category}
                  <X 
                    className="h-3 w-3 ml-1" 
                    onClick={() => toggleArrayFilter('categories', category)}
                  />
                </Badge>
              ))}
              {filters.dietary.map(diet => (
                <Badge key={diet} variant="secondary" className="cursor-pointer">
                  {diet}
                  <X 
                    className="h-3 w-3 ml-1" 
                    onClick={() => toggleArrayFilter('dietary', diet)}
                  />
                </Badge>
              ))}
              {filters.ingredients.map(ingredient => (
                <Badge key={ingredient} variant="secondary" className="cursor-pointer">
                  {ingredient}
                  <X 
                    className="h-3 w-3 ml-1" 
                    onClick={() => toggleArrayFilter('ingredients', ingredient)}
                  />
                </Badge>
              ))}
              {(filters.cookTime[0] !== 5 || filters.cookTime[1] !== 180) && (
                <Badge variant="secondary" className="cursor-pointer">
                  {filters.cookTime[0]}-{filters.cookTime[1]} мин
                  <X 
                    className="h-3 w-3 ml-1" 
                    onClick={() => updateFilters('cookTime', [5, 180])}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categories */}
            <Card className="p-4">
              <h4 className="mb-3">Категории</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleArrayFilter('categories', category)}
                    />
                    <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cook Time */}
            <Card className="p-4">
              <h4 className="mb-3">Время приготовления</h4>
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={filters.cookTime}
                    onValueChange={(value) => updateFilters('cookTime', value)}
                    max={180}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.cookTime[0]} мин</span>
                  <span>{filters.cookTime[1]} мин</span>
                </div>
              </div>
            </Card>

            {/* Dietary */}
            <Card className="p-4">
              <h4 className="mb-3">Диета</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {dietaryOptions.map(diet => (
                  <div key={diet} className="flex items-center space-x-2">
                    <Checkbox
                      id={`diet-${diet}`}
                      checked={filters.dietary.includes(diet)}
                      onCheckedChange={() => toggleArrayFilter('dietary', diet)}
                    />
                    <label htmlFor={`diet-${diet}`} className="text-sm cursor-pointer">
                      {diet}
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ingredients */}
            <Card className="p-4">
              <h4 className="mb-3">Ингредиенты</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Что у вас есть дома?
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {popularIngredients.map(ingredient => (
                  <div key={ingredient} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ing-${ingredient}`}
                      checked={filters.ingredients.includes(ingredient)}
                      onCheckedChange={() => 
                        filters.ingredients.includes(ingredient) 
                          ? toggleArrayFilter('ingredients', ingredient)
                          : toggleArrayFilter('ingredients', ingredient)
                      }
                    />
                    <label htmlFor={`ing-${ingredient}`} className="text-sm cursor-pointer">
                      {ingredient}
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}