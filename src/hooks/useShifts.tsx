import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

/**
 * @interface Shift
 * @property {string} id - The unique identifier for the shift.
 * @property {string} tenant_id - The ID of the tenant the shift belongs to.
 * @property {string} staff_user_id - The ID of the staff member who worked the shift.
 * @property {string} shift_start - The timestamp when the shift started.
 * @property {string} [shift_end] - The timestamp when the shift ended.
 * @property {number} opening_cash - The amount of cash at the start of the shift.
 * @property {number} [closing_cash] - The amount of cash at the end of the shift.
 * @property {number} total_sales - The total sales during the shift.
 * @property {number} total_orders - The total number of orders during the shift.
 * @property {number} cash_payments - The total amount of cash payments during the shift.
 * @property {number} card_payments - The total amount of card payments during the shift.
 * @property {number} discounts_given - The total amount of discounts given during the shift.
 * @property {string} [notes] - Any notes about the shift.
 * @property {'open' | 'closed'} status - The status of the shift.
 * @property {string} created_at - The timestamp when the shift was created.
 * @property {string} updated_at - The timestamp when the shift was last updated.
 */
export interface Shift {
  id: string;
  tenant_id: string;
  staff_user_id: string;
  shift_start: string;
  shift_end?: string;
  opening_cash: number;
  closing_cash?: number;
  total_sales: number;
  total_orders: number;
  cash_payments: number;
  card_payments: number;
  discounts_given: number;
  notes?: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

/**
 * A custom hook for managing staff shifts.
 * This hook provides functions to load, open, close, and update shifts.
 * @returns {{
 *   shifts: Shift[],
 *   currentShift: Shift | null,
 *   loading: boolean,
 *   loadShifts: () => Promise<void>,
 *   openShift: (staffUserId: string, openingCash: number) => Promise<Shift | null>,
 *   closeShift: (shiftId: string, closingCash: number, notes?: string) => Promise<boolean>,
 *   updateShiftStats: (shiftId: string, stats: Partial<Shift>) => Promise<boolean>
 * }} An object containing the shifts, current shift, loading state, and functions to manage shifts.
 */
export const useShifts = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  const loadShifts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user's tenant ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) return;
      
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('owner_id', profile.id)
        .single();
      
      if (!tenant) return;
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading shifts:', error);
        toast.error('فشل في تحميل الورديات');
        return;
      }

      const shiftsData = (data || []) as Shift[];
      setShifts(shiftsData);
      
      // Find current open shift
      const openShift = shiftsData.find(shift => shift.status === 'open');
      setCurrentShift(openShift || null);
    } catch (error) {
      console.error('Error loading shifts:', error);
      toast.error('فشل في تحميل الورديات');
    } finally {
      setLoading(false);
    }
  };

  const openShift = async (staffUserId: string, openingCash: number) => {
    try {
      // Check if there's already an open shift
      if (currentShift) {
        toast.error('يجب إغلاق الوردية الحالية أولاً');
        return null;
      }

      // Get user's tenant ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      
      if (!profile) {
        toast.error('فشل في العثور على ملف المستخدم');
        return null;
      }
      
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('owner_id', profile.id)
        .single();
      
      if (!tenant) {
        toast.error('فشل في العثور على بيانات المطعم');
        return null;
      }

      const insertData = {
        staff_user_id: staffUserId,
        opening_cash: openingCash,
        status: 'open' as const,
        tenant_id: tenant.id
      };

      const { data, error } = await supabase
        .from('shifts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error opening shift:', error);
        toast.error('فشل في فتح الوردية');
        return null;
      }

      toast.success('تم فتح الوردية بنجاح');
      await loadShifts();
      return data as Shift;
    } catch (error) {
      console.error('Error opening shift:', error);
      toast.error('فشل في فتح الوردية');
      return null;
    }
  };

  const closeShift = async (shiftId: string, closingCash: number, notes?: string) => {
    try {
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift) {
        toast.error('الوردية غير موجودة');
        return false;
      }

      const { data, error } = await supabase
        .from('shifts')
        .update({
          shift_end: new Date().toISOString(),
          closing_cash: closingCash,
          status: 'closed',
          notes: notes
        })
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        console.error('Error closing shift:', error);
        toast.error('فشل في إغلاق الوردية');
        return false;
      }

      toast.success('تم إغلاق الوردية بنجاح');
      await loadShifts();
      return true;
    } catch (error) {
      console.error('Error closing shift:', error);
      toast.error('فشل في إغلاق الوردية');
      return false;
    }
  };

  const updateShiftStats = async (shiftId: string, stats: Partial<Shift>) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .update(stats)
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        console.error('Error updating shift stats:', error);
        return false;
      }

      await loadShifts();
      return true;
    } catch (error) {
      console.error('Error updating shift stats:', error);
      return false;
    }
  };

  useEffect(() => {
    loadShifts();
  }, [user]);

  return {
    shifts,
    currentShift,
    loading,
    loadShifts,
    openShift,
    closeShift,
    updateShiftStats,
  };
};