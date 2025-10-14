import { useState } from "react";
import { Settings, Share2, Grid, Bookmark, Users, Heart, ChefHat, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { RecipeCard, Recipe } from "./RecipeCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProfilePageProps {
  onBack: () => void;
  onRecipeClick: (recipe: Recipe) => void;
  onToggleFavorite: (id: string) => void;
  userRecipes: Recipe[];
  savedRecipes: Recipe[];
  favoriteRecipes: Recipe[];
}

interface Collection {
  id: string;
  name: string;
  recipeCount: number;
  coverImage: string;
  isPrivate: boolean;
}

export function ProfilePage({ 
  onBack, 
  onRecipeClick, 
  onToggleFavorite,
  userRecipes,
  savedRecipes,
  favoriteRecipes
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("created");

  // Mock user data
  const user = {
    name: "Анна Петрова",
    username: "@anna_chef",
    avatar: "https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYwMzUzNzMwfDA&ixlib=rb-4.1.0&q=80&w=400",
    bio: "Люблю готовить и делиться рецептами. Специализируюсь на здоровом питании и десертах 🍰",
    stats: {
      recipes: userRecipes.length,
      followers: 1243,
      following: 432,
      likes: 5847
    },
    joinDate: "Январь 2023"
  };

  // Mock collections
  const collections: Collection[] = [
    {
      id: "1",
      name: "Быстрые завтраки",
      recipeCount: 12,
      coverImage: savedRecipes[0]?.image || "",
      isPrivate: false
    },
    {
      id: "2",
      name: "Праздничные блюда",
      recipeCount: 8,
      coverImage: savedRecipes[1]?.image || "",
      isPrivate: false
    },
    {
      id: "3",
      name: "Десерты на выходные",
      recipeCount: 15,
      coverImage: savedRecipes[2]?.image || "",
      isPrivate: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="mb-1">{user.name}</h1>
                  <p className="text-muted-foreground">{user.username}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Поделиться
                  </Button>
                  <Button size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Редактировать профиль
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="font-semibold">{user.stats.recipes}</p>
                  <p className="text-sm text-muted-foreground">Рецептов</p>
                </div>
                <div className="text-center cursor-pointer hover:text-primary">
                  <p className="font-semibold">{user.stats.followers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Подписчиков</p>
                </div>
                <div className="text-center cursor-pointer hover:text-primary">
                  <p className="font-semibold">{user.stats.following}</p>
                  <p className="text-sm text-muted-foreground">Подписок</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.stats.likes.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Лайков</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-muted-foreground max-w-2xl">{user.bio}</p>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Присоединился {user.joinDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>Профессиональный повар</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Созданные</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Сохраненные</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Избранное</span>
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Коллекции</span>
            </TabsTrigger>
          </TabsList>

          {/* Created Recipes */}
          <TabsContent value="created" className="mt-0">
            {userRecipes.length === 0 ? (
              <div className="text-center py-12">
                <Grid className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-2">
                  У вас пока нет созданных рецептов
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Начните делиться своими кулинарными шедеврами
                </p>
                <Button>Создать первый рецепт</Button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {userRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onToggleFavorite={onToggleFavorite}
                    onViewRecipe={onRecipeClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved Recipes */}
          <TabsContent value="saved" className="mt-0">
            {savedRecipes.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-2">
                  Нет сохраненных рецептов
                </p>
                <p className="text-sm text-muted-foreground">
                  Сохраняйте понравившиеся рецепты для быстрого доступа
                </p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {savedRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onToggleFavorite={onToggleFavorite}
                    onViewRecipe={onRecipeClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorite Recipes */}
          <TabsContent value="favorites" className="mt-0">
            {favoriteRecipes.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-2">
                  Нет рецептов в избранном
                </p>
                <p className="text-sm text-muted-foreground">
                  Добавляйте рецепты в избранное, чтобы не потерять их
                </p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {favoriteRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onToggleFavorite={onToggleFavorite}
                    onViewRecipe={onRecipeClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Collections */}
          <TabsContent value="collections" className="mt-0">
            {collections.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-2">
                  Нет коллекций
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Организуйте свои рецепты в коллекции
                </p>
                <Button>Создать коллекцию</Button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {collections.map(collection => (
                  <Card key={collection.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] relative">
                      <ImageWithFallback
                        src={collection.coverImage}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                      {collection.isPrivate && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Приватная
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1">{collection.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {collection.recipeCount} {collection.recipeCount === 1 ? 'рецепт' : collection.recipeCount < 5 ? 'рецепта' : 'рецептов'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
