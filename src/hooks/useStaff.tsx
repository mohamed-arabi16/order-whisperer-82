import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

/**
 * @interface StaffUser
 * @property {string} id - The unique identifier for the staff member.
 * @property {string} tenant_id - The ID of the tenant the staff member belongs to.
 * @property {string} user_id - The ID of the user who created the staff member.
 * @property {string} staff_name - The name of the staff member.
 * @property {'cashier' | 'waiter' | 'kitchen' | 'manager'} role - The role of the staff member.
 * @property {string} [pin_code] - A PIN code for the staff member to log in.
 * @property {Record<string, boolean>} permissions - The permissions of the staff member.
 * @property {boolean} is_active - Whether the staff member is active.
 * @property {string} created_at - The timestamp when the staff member was created.
 * @property {string} updated_at - The timestamp when the staff member was last updated.
 */
export interface StaffUser {
  id: string;
  tenant_id: string;
  user_id: string;
  staff_name: string;
  role: 'cashier' | 'waiter' | 'kitchen' | 'manager';
  pin_code?: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * A custom hook for managing staff members.
 * This hook provides functions to load, create, update, and delete staff members.
 * @returns {{
 *   staff: StaffUser[],
 *   loading: boolean,
 *   loadStaff: () => Promise<void>,
 *   createStaff: (staffData: Partial<StaffUser>) => Promise<StaffUser | null>,
 *   updateStaff: (id: string, updates: Partial<StaffUser>) => Promise<StaffUser | null>,
 *   deleteStaff: (id: string) => Promise<boolean>
 * }} An object containing the staff members, loading state, and functions to manage them.
 */
export const useStaff = () => {
  const { user, tenantId } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStaff = async () => {
    if (!tenantId) {
      setStaff([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading staff:', error);
        toast.error('فشل في تحميل الموظفين');
        return;
      }

      setStaff((data || []) as StaffUser[]);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('فشل في تحميل الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (staffData: Partial<StaffUser>) => {
    if (!tenantId || !user) {
      toast.error('لا يمكن إنشاء موظف بدون مطعم أو مستخدم نشط.');
      return null;
    }

    try {
      const insertData = {
        staff_name: staffData.staff_name!,
        role: staffData.role!,
        pin_code: staffData.pin_code,
        is_active: staffData.is_active ?? true,
        permissions: staffData.permissions || {},
        user_id: user.id,
        tenant_id: tenantId
      };

      const { data, error } = await supabase
        .from('staff_users')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating staff:', error);
        toast.error('فشل في إضافة الموظف');
        return null;
      }

      toast.success('تم إضافة الموظف بنجاح');
      await loadStaff();
      return data as StaffUser;
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error('فشل في إضافة الموظف');
      return null;
    }
  };

  const updateStaff = async (id: string, updates: Partial<StaffUser>) => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating staff:', error);
        toast.error('فشل في تحديث الموظف');
        return null;
      }

      toast.success('تم تحديث الموظف بنجاح');
      await loadStaff();
      return data as StaffUser;
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('فشل في تحديث الموظف');
      return null;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting staff:', error);
        toast.error('فشل في حذف الموظف');
        return false;
      }

      toast.success('تم حذف الموظف بنجاح');
      await loadStaff();
      return true;
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('فشل في حذف الموظف');
      return false;
    }
  };

  useEffect(() => {
    loadStaff();
  }, [tenantId]);

  return {
    staff,
    loading,
    loadStaff,
    createStaff,
    updateStaff,
    deleteStaff,
  };
};