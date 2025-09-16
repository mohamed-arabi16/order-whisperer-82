import React, { useState } from 'react';
import { useStaff, StaffUser } from '@/hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const StaffManagement: React.FC = () => {
  const { t } = useTranslation();
  const { staff, loading, createStaff, updateStaff, deleteStaff } = useStaff();
  const [isOpen, setIsOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState({
    staff_name: '',
    role: 'cashier' as StaffUser['role'],
    pin_code: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff) {
      await updateStaff(editingStaff.id, formData);
    } else {
      await createStaff(formData);
    }
    
    setIsOpen(false);
    setEditingStaff(null);
    setFormData({
      staff_name: '',
      role: 'cashier',
      pin_code: '',
      is_active: true
    });
  };

  const handleEdit = (staffMember: StaffUser) => {
    setEditingStaff(staffMember);
    setFormData({
      staff_name: staffMember.staff_name,
      role: staffMember.role,
      pin_code: staffMember.pin_code || '',
      is_active: staffMember.is_active
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      await deleteStaff(id);
    }
  };

  const getRoleBadgeColor = (role: StaffUser['role']) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'cashier': return 'bg-blue-100 text-blue-800';
      case 'waiter': return 'bg-green-100 text-green-800';
      case 'kitchen': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: StaffUser['role']) => {
    switch (role) {
      case 'manager': return 'مدير';
      case 'cashier': return 'أمين صندوق';
      case 'waiter': return 'نادل';
      case 'kitchen': return 'مطبخ';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">إدارة الموظفين</h2>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إضافة موظف
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? 'تعديل موظف' : 'إضافة موظف جديد'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="staff_name">اسم الموظف</Label>
                <Input
                  id="staff_name"
                  value={formData.staff_name}
                  onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                  placeholder="أدخل اسم الموظف"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">المنصب</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: StaffUser['role']) => 
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنصب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">أمين صندوق</SelectItem>
                    <SelectItem value="waiter">نادل</SelectItem>
                    <SelectItem value="kitchen">مطبخ</SelectItem>
                    <SelectItem value="manager">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="pin_code">رمز PIN (اختياري)</Label>
                <Input
                  id="pin_code"
                  type="password"
                  value={formData.pin_code}
                  onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                  placeholder="أدخل رمز PIN مكون من 4 أرقام"
                  maxLength={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingStaff ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((staffMember) => (
          <Card key={staffMember.id} className={!staffMember.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{staffMember.staff_name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(staffMember)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(staffMember.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={getRoleBadgeColor(staffMember.role)}>
                  {getRoleText(staffMember.role)}
                </Badge>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>الحالة:</span>
                  <Badge variant={staffMember.is_active ? 'default' : 'secondary'}>
                    {staffMember.is_active ? 'نشط' : 'معطل'}
                  </Badge>
                </div>
                
                {staffMember.pin_code && (
                  <div className="text-sm text-muted-foreground">
                    رمز PIN: ****
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  تم الإنشاء: {new Date(staffMember.created_at).toLocaleDateString('ar-EG')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {staff.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا يوجد موظفين بعد</p>
          <p className="text-sm text-muted-foreground">انقر على "إضافة موظف" لإضافة أول موظف</p>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;