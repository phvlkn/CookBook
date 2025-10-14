import { useState } from "react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

export interface FilterState {
  categories: string[];
  cookTime: number[];
  dietary: string[];
  difficulty: string[];
  ingredients: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const categories = [
    "Завтрак", "Обед", "Ужин", "Десерт", "Закуска", "Напитки"
  ];

  const dietaryOptions = [
    "Веганское", "Вегетарианское", "Без глютена", "Без лактозы", "Кето", "Палео"
  ];

  const difficultyLevels = [
    "Легко", "Средне", "Сложно"
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

  const addIngredient = (ingredient: string) => {
    if (!filters.ingredients.includes(ingredient)) {
      updateFilters('ingredients', [...filters.ingredients, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    updateFilters('ingredients', filters.ingredients.filter(item => item !== ingredient));
  };

  return (
    <div className="w-80 space-y-6">
      {/* Active Filters */}
      {(filters.categories.length > 0 || filters.dietary.length > 0 || filters.ingredients.length > 0) && (
        <Card className="p-4">
          <h3 className="mb-3">Активные фильтры</h3>
          <div className="space-y-2">
            {filters.categories.map(category => (
              <Badge key={category} variant="secondary" className="mr-1">
                {category}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleArrayFilter('categories', category)}
                />
              </Badge>
            ))}
            {filters.dietary.map(diet => (
              <Badge key={diet} variant="secondary" className="mr-1">
                {diet}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleArrayFilter('dietary', diet)}
                />
              </Badge>
            ))}
            {filters.ingredients.map(ingredient => (
              <Badge key={ingredient} variant="secondary" className="mr-1">
                {ingredient}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeIngredient(ingredient)}
                />
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Categories */}
      <Card className="p-4">
        <h3 className="mb-3">Категории</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleArrayFilter('categories', category)}
              />
              <label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Cook Time */}
      <Card className="p-4">
        <h3 className="mb-3">Время приготовления</h3>
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

      {/* Dietary Preferences */}
      <Card className="p-4">
        <h3 className="mb-3">Диета</h3>
        <div className="space-y-2">
          {dietaryOptions.map(diet => (
            <div key={diet} className="flex items-center space-x-2">
              <Checkbox
                id={diet}
                checked={filters.dietary.includes(diet)}
                onCheckedChange={() => toggleArrayFilter('dietary', diet)}
              />
              <label htmlFor={diet} className="text-sm cursor-pointer">
                {diet}
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Ingredients */}
      <Card className="p-4">
        <h3 className="mb-3">Ингредиенты</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Выберите ингредиенты, которые у вас есть дома
        </p>
        <div className="space-y-2">
          {popularIngredients.map(ingredient => (
            <div key={ingredient} className="flex items-center space-x-2">
              <Checkbox
                id={ingredient}
                checked={filters.ingredients.includes(ingredient)}
                onCheckedChange={() => 
                  filters.ingredients.includes(ingredient) 
                    ? removeIngredient(ingredient)
                    : addIngredient(ingredient)
                }
              />
              <label htmlFor={ingredient} className="text-sm cursor-pointer">
                {ingredient}
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Difficulty */}
      <Card className="p-4">
        <h3 className="mb-3">Сложность</h3>
        <div className="space-y-2">
          {difficultyLevels.map(level => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={level}
                checked={filters.difficulty.includes(level)}
                onCheckedChange={() => toggleArrayFilter('difficulty', level)}
              />
              <label htmlFor={level} className="text-sm cursor-pointer">
                {level}
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}