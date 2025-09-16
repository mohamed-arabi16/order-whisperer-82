import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

export const useStaff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStaff = async () => {
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
        .from('staff_users')
        .select('*')
        .eq('tenant_id', tenant.id)
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
    try {
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
        staff_name: staffData.staff_name!,
        role: staffData.role!,
        pin_code: staffData.pin_code,
        is_active: staffData.is_active ?? true,
        permissions: staffData.permissions || {},
        user_id: user!.id,
        tenant_id: tenant.id
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
  }, [user]);

  return {
    staff,
    loading,
    loadStaff,
    createStaff,
    updateStaff,
    deleteStaff,
  };
};