import React, { useState } from 'react';
import { useShifts, Shift } from '@/hooks/useShifts';
import { useStaff } from '@/hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, DollarSign, Users, CalendarDays, Play, Square } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * A component for managing staff shifts, including opening, closing, and viewing shift history.
 */
export const ShiftManagement: React.FC = () => {
  const { t } = useTranslation();
  const { shifts, currentShift, loading, openShift, closeShift } = useShifts();
  const { staff } = useStaff();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff || !openingCash) return;
    
    const result = await openShift(selectedStaff, parseFloat(openingCash));
    if (result) {
      setIsOpenDialogOpen(false);
      setOpeningCash('');
      setSelectedStaff('');
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentShift || !closingCash) return;
    
    const result = await closeShift(currentShift.id, parseFloat(closingCash), notes);
    if (result) {
      setIsCloseDialogOpen(false);
      setClosingCash('');
      setNotes('');
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${t('common.currency')}`;
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
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
          <Clock className="h-6 w-6" />
          <h2 className="text-2xl font-bold">إدارة الورديات</h2>
        </div>
        
        <div className="flex gap-2">
          {!currentShift ? (
            <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  فتح وردية جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>فتح وردية جديدة</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleOpenShift} className="space-y-4">
                  <div>
                    <Label htmlFor="staff">الموظف</Label>
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.filter(s => s.is_active).map((staffMember) => (
                          <SelectItem key={staffMember.id} value={staffMember.id}>
                            {staffMember.staff_name} - {staffMember.role === 'cashier' ? 'أمين صندوق' : 
                             staffMember.role === 'manager' ? 'مدير' : staffMember.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="opening_cash">المبلغ الافتتاحي</Label>
                    <Input
                      id="opening_cash"
                      type="number"
                      value={openingCash}
                      onChange={(e) => setOpeningCash(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={!selectedStaff || !openingCash}>
                      فتح الوردية
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  إغلاق الوردية
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إغلاق الوردية</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCloseShift} className="space-y-4">
                  <div>
                    <Label htmlFor="closing_cash">المبلغ الختامي</Label>
                    <Input
                      id="closing_cash"
                      type="number"
                      value={closingCash}
                      onChange={(e) => setClosingCash(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي ملاحظات حول الوردية..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" variant="destructive" className="flex-1" disabled={!closingCash}>
                      إغلاق الوردية
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Current Shift Status */}
      {currentShift && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-800">الوردية الحالية</CardTitle>
              <Badge className="bg-green-500 text-white">نشطة</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm text-green-700">مدة الوردية</div>
                  <div className="font-medium">{formatDuration(currentShift.shift_start)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm text-green-700">المبلغ الافتتاحي</div>
                  <div className="font-medium">{formatCurrency(currentShift.opening_cash)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm text-green-700">عدد الطلبات</div>
                  <div className="font-medium">{currentShift.total_orders}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm text-green-700">إجمالي المبيعات</div>
                  <div className="font-medium">{formatCurrency(currentShift.total_sales)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Shifts History */}
      <Card>
        <CardHeader>
          <CardTitle>تاريخ الورديات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>لا توجد ورديات بعد</p>
                <p className="text-sm">انقر على "فتح وردية جديدة" لبدء أول وردية</p>
              </div>
            ) : (
              shifts.map((shift) => (
                <div key={shift.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={shift.status === 'open' ? 'default' : 'secondary'}>
                        {shift.status === 'open' ? 'نشطة' : 'مغلقة'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        بدأت: {new Date(shift.shift_start).toLocaleString('ar-EG')}
                      </span>
                      {shift.shift_end && (
                        <span className="text-sm text-muted-foreground">
                          انتهت: {new Date(shift.shift_end).toLocaleString('ar-EG')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      المدة: {formatDuration(shift.shift_start, shift.shift_end)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">افتتاحي</div>
                      <div className="font-medium">{formatCurrency(shift.opening_cash)}</div>
                    </div>
                    
                    {shift.closing_cash && (
                      <div>
                        <div className="text-muted-foreground">ختامي</div>
                        <div className="font-medium">{formatCurrency(shift.closing_cash)}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-muted-foreground">المبيعات</div>
                      <div className="font-medium">{formatCurrency(shift.total_sales)}</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground">الطلبات</div>
                      <div className="font-medium">{shift.total_orders}</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground">نقدي</div>
                      <div className="font-medium">{formatCurrency(shift.cash_payments)}</div>
                    </div>
                  </div>
                  
                  {shift.notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>ملاحظات:</strong> {shift.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftManagement;