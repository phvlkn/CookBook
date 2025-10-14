import { Search, Plus, Heart, User, ShoppingCart, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onShowProfile: () => void;
  onShowCart: () => void;
  onAddRecipe: () => void;
  onSearchStateChange: (isSearching: boolean) => void;
  searchQuery: string;
}

export function Header({
  onSearch,
  onShowProfile,
  onShowCart,
  onAddRecipe,
  onSearchStateChange,
  searchQuery
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isSearchActive = isSearchFocused || searchQuery.length > 0;

  useEffect(() => {
    onSearchStateChange(isSearchActive);
  }, [isSearchActive, onSearchStateChange]);

  const handleClearSearch = () => {
    onSearch("");
    setIsSearchFocused(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Recipes</span>
        </div>

        {/* Search Bar */}
        <div className={`transition-all duration-300 ${isSearchActive ? 'flex-1 mx-8 max-w-2xl' : 'flex-1 mx-8 max-w-md'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Поиск рецептов, ингредиентов..."
              className="pl-9 pr-10"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                if (searchQuery.length === 0) {
                  setIsSearchFocused(false);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onAddRecipe}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить рецепт
          </Button>
          <Button variant="ghost" size="icon" onClick={onShowCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onShowProfile}>
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
