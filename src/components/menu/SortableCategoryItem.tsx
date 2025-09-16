import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GripVertical, Edit2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface SortableCategoryItemProps {
  category: Category;
  index: number;
  onToggle: (categoryId: string, isActive: boolean) => void;
  onEdit: (category: Category) => void;
}

export const SortableCategoryItem = ({ 
  category, 
  index, 
  onToggle, 
  onEdit 
}: SortableCategoryItemProps) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`shadow-card ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {t('menu.displayOrder')}: {index + 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor={`category-${category.id}`} className="text-sm text-foreground">
                {category.is_active ? t('common.active') : t('common.inactive')}
              </Label>
              <Switch
                id={`category-${category.id}`}
                checked={category.is_active}
                onCheckedChange={(checked) => onToggle(category.id, checked)}
              />
            </div>
            <Badge variant={category.is_active ? "default" : "secondary"}>
              {category.is_active ? t('common.active') : t('common.inactive')}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
            >
              <Edit2 className="h-4 w-4 mx-1" />
              {t('common.edit')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};