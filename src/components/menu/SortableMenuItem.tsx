import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, GripVertical } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category_id: string;
  display_order: number;
  created_at: string;
}

interface SortableMenuItemProps {
  item: MenuItem;
  getCategoryName: (categoryId: string) => string;
  formatPrice: (price: number) => string;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export const SortableMenuItem: React.FC<SortableMenuItemProps> = ({
  item,
  getCategoryName,
  formatPrice,
  onToggleAvailability,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="shadow-card relative">
      <CardContent className="p-4">
        {/* Drag Handle */}
        <div
          className="absolute top-2 left-2 cursor-grab active:cursor-grabbing z-10 p-1 rounded hover:bg-muted/50"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-32 object-cover rounded-lg mb-3"
          />
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg pr-6">{item.name}</h3>
            <Badge variant={item.is_available ? "default" : "secondary"}>
              {item.is_available ? "متوفر" : "غير متوفر"}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {getCategoryName(item.category_id)}
          </p>
          
          {item.description && (
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          
          <p className="text-lg font-bold text-primary">
            {formatPrice(item.price)}
          </p>
          
          <div className="flex items-center justify-between pt-2 gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`item-${item.id}`} className="text-sm">
                {item.is_available ? 'متوفر' : 'غير متوفر'}
              </Label>
              <Switch
                id={`item-${item.id}`}
                checked={item.is_available}
                onCheckedChange={(checked) => onToggleAvailability(item.id, checked)}
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
              >
                <Edit2 className="h-4 w-4 ml-1" />
                تعديل
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-4 w-4 ml-1" />
                حذف
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};