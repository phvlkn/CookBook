import { X, Clock, Users, Star, Heart, ShoppingCart, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Recipe } from "./RecipeCard";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (ingredients: string[]) => void;
  onAddToCollection: (recipeId: string) => void;
}

export function RecipeModal({ 
  recipe, 
  isOpen, 
  onClose, 
  onToggleFavorite, 
  onAddToCart,
  onAddToCollection 
}: RecipeModalProps) {
  if (!recipe) return null;

  const steps = [
    "Подготовьте все ингредиенты. Нарежьте овощи и подготовьте специи.",
    "Разогрейте сковороду на среднем огне. Добавьте растительное масло.",
    "Обжарьте основные ингредиенты до золотистого цвета (5-7 минут).",
    "Добавьте специи и перемешайте. Готовьте еще 2-3 минуты.",
    "Подавайте горячим, украсив зеленью по вкусу."
  ];

  const reviews = [
    {
      id: 1,
      author: "Анна К.",
      rating: 5,
      comment: "Потрясающий рецепт! Готовила для всей семьи, все остались довольны.",
      date: "2 дня назад"
    },
    {
      id: 2,
      author: "Михаил П.",
      rating: 4,
      comment: "Очень вкусно получилось. В следующий раз добавлю больше специй.",
      date: "неделю назад"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1 pr-8">
            <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{recipe.description}</DialogDescription>
            
            {/* Recipe Stats */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{recipe.cookTime} мин</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">{recipe.servings} порций</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{recipe.rating} ({recipe.reviewCount} отзывов)</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-4">
            <div className="relative">
              <ImageWithFallback
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleFavorite(recipe.id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      recipe.isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onAddToCollection(recipe.id)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <ImageWithFallback
                src={recipe.author.avatar}
                alt={recipe.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{recipe.author.name}</p>
                <p className="text-sm text-muted-foreground">Автор рецепта</p>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3>Ингредиенты</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddToCart(recipe.ingredients)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  В список покупок
                </Button>
              </div>
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <span className="text-sm">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Instructions and Reviews */}
          <div className="space-y-6">
            {/* Cooking Steps */}
            <div className="space-y-3">
              <h3>Пошаговый рецепт</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div className="space-y-4">
              <h3>Отзывы</h3>
              
              {/* Add Review */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h4 className="text-sm">Оставить отзыв</h4>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 cursor-pointer hover:fill-yellow-400 hover:text-yellow-400"
                    />
                  ))}
                </div>
                <Textarea placeholder="Поделите��ь своими впечатлениями..." className="min-h-[80px]" />
                <Button size="sm">Отправить отзыв</Button>
              </div>

              {/* Existing Reviews */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.author}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}