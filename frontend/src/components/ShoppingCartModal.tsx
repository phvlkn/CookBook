import { X, Trash2, Download, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { useState } from "react";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isChecked: boolean;
}

interface ShoppingCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  onUpdateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function ShoppingCartModal({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onRemoveItem,
  onClearCart
}: ShoppingCartModalProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  
  const categories = [...new Set(items.map(item => item.category))];
  
  const toggleItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      onUpdateItem(id, { isChecked: !item.isChecked });
    }
  };

  const exportToPDF = () => {
    // В реальном приложении здесь была бы генерация PDF
    const content = items.map(item => 
      `${item.isChecked ? '✓' : '☐'} ${item.name} - ${item.quantity}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendByEmail = () => {
    const subject = 'Список покупок из КулинарияHub';
    const body = items.map(item => 
      `${item.isChecked ? '✓' : '☐'} ${item.name} - ${item.quantity}`
    ).join('\n');
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const checkedCount = items.filter(item => item.isChecked).length;
  const totalCount = items.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle>Список покупок</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {checkedCount} из {totalCount} позиций отмечено
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Ваш список покупок пуст</p>
            <p className="text-sm text-muted-foreground mt-1">
              Добавьте ингредиенты из рецептов
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Скачать
              </Button>
              <Button variant="outline" size="sm" onClick={sendByEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Отправить
              </Button>
              <Button variant="outline" size="sm" onClick={onClearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить
              </Button>
            </div>

            <Separator />

            {/* Shopping List by Categories */}
            <div className="space-y-6">
              {categories.map(category => {
                const categoryItems = items.filter(item => item.category === category);
                return (
                  <div key={category} className="space-y-3">
                    <h3 className="font-medium text-primary">{category}</h3>
                    <div className="space-y-2">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                            item.isChecked ? 'bg-muted/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={item.isChecked}
                              onCheckedChange={() => toggleItem(item.id)}
                            />
                            <div className={`flex-1 ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {item.quantity}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Прогресс покупок</span>
                <span className="text-sm font-medium">{Math.round((checkedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}