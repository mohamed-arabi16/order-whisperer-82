import { useState } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { SortableCategoryItem } from "./SortableCategoryItem";

/**
 * Represents a menu category.
 */
interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Props for the CategoryManager component.
 */
interface CategoryManagerProps {
  /**
   * An array of category objects.
   */
  categories: Category[];
  /**
   * The ID of the tenant.
   */
  tenantId: string;
  /**
   * Callback function to be called when the categories are updated.
   * @param categories - The updated array of categories.
   */
  onCategoriesChange: (categories: Category[]) => void;
}

/**
 * A component for managing menu categories.
 * It allows creating, editing, and toggling the active status of categories.
 *
 * @param {CategoryManagerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered category manager component.
 */
const CategoryManager = ({
  categories,
  tenantId,
  onCategoriesChange,
}: CategoryManagerProps): JSX.Element => {
  const { toast } = useToast();
  const { t, isRTL } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: t('common.error'),
        description: t('menu.categoryName') + ' ' + t('common.required'),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Adding category with tenantId:', tenantId);
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          tenant_id: tenantId,
          name: categoryName.trim(),
          display_order: categories.length,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }

      const updatedCategories = [...categories, data];
      onCategoriesChange(updatedCategories);
      
      toast({
        title: t('common.success'),
        description: t('menu.categoryCreated'),
      });

      setCategoryName('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: t('common.error'),
        description: t('common.genericError'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ name: categoryName.trim() })
        .eq('id', editingCategory.id);

      if (error) throw error;

      const updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, name: categoryName.trim() }
          : cat
      );
      onCategoriesChange(updatedCategories);

      toast({
        title: t('common.success'),
        description: t('menu.categoryUpdated'),
      });

      setEditingCategory(null);
      setCategoryName('');
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: t('common.error'),
        description: t('common.genericError'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (categoryId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ is_active: isActive })
        .eq('id', categoryId);

      if (error) throw error;

      const updatedCategories = categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, is_active: isActive }
          : cat
      );
      onCategoriesChange(updatedCategories);

      toast({
        title: t('common.success'),
        description: `${t('common.category')} ${isActive ? t('common.activated') : t('common.deactivated')}`,
      });
    } catch (error) {
      console.error('Error toggling category:', error);
      toast({
        title: t('common.error'),
        description: t('common.genericError'),
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over.id);
      
      const reorderedCategories = arrayMove(categories, oldIndex, newIndex).map((category, index) => ({
        ...category,
        display_order: index
      }));

      onCategoriesChange(reorderedCategories);

      // Update display orders in database
      try {
        const updates = reorderedCategories.map((category, index) => ({
          id: category.id,
          display_order: index
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from('menu_categories')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
          if (error) throw error;
        }

        toast({
          title: t('common.success'),
          description: t('menu.categoriesReordered'),
        });
      } catch (error) {
        console.error('Error updating display order:', error);
        toast({
          title: t('common.error'),
          description: t('common.genericError'),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mx-2" />
            {t('menu.addCategory')}
          </Button>
        </DialogTrigger>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('menu.addCategory')}</DialogTitle>
            <DialogDescription>
              {t('menu.categoryDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">{t('menu.categoryName')}</Label>
              <Input
                id="category-name"
                placeholder={t('menu.categoryPlaceholder')}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={saving}
              >
                {saving ? t('common.saving') : t('menu.addCategory')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('menu.editCategory')}</DialogTitle>
            <DialogDescription>
              {t('menu.editCategoryDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">{t('menu.categoryName')}</Label>
              <Input
                id="edit-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setEditingCategory(null)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleEditCategory}
                disabled={saving}
              >
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Menu className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t('menu.noCategories')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('menu.createFirstCategory')}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mx-2" />
                {t('menu.addCategory')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map(cat => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((category, index) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  index={index}
                  onToggle={handleToggleCategory}
                  onEdit={(category) => {
                    setEditingCategory(category);
                    setCategoryName(category.name);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;