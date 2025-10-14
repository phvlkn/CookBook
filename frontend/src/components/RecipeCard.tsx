import { Heart, Clock, Star, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  servings: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  ingredients: string[];
  isFavorite?: boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onViewRecipe: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onToggleFavorite, onViewRecipe }: RecipeCardProps) {
  return (
    <Card className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden" onClick={() => onViewRecipe(recipe)}>
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
        >
          <Heart
            className={`h-4 w-4 ${
              recipe.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </Button>

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {recipe.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-white/90">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-4" onClick={() => onViewRecipe(recipe)}>
        <h3 className="mb-2 line-clamp-2">{recipe.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {recipe.description}
        </p>

        {/* Recipe Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{recipe.cookTime} мин</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{recipe.servings} порций</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{recipe.rating}</span>
            <span className="text-xs">({recipe.reviewCount})</span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <ImageWithFallback
            src={recipe.author.avatar}
            alt={recipe.author.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-muted-foreground">{recipe.author.name}</span>
        </div>
      </div>
    </Card>
  );
}