import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  tenant_id: string;
  order_id: string;
  payment_method: 'cash' | 'card' | 'digital';
  amount: number;
  received_amount?: number;
  change_amount: number;
  processed_by?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        toast.error('فشل في تحميل المدفوعات');
        return;
      }

      setPayments((data || []) as Payment[]);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('فشل في تحميل المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentData: Partial<Payment>) => {
    try {
      const insertData = {
        order_id: paymentData.order_id!,
        payment_method: paymentData.payment_method!,
        amount: paymentData.amount!,
        received_amount: paymentData.received_amount,
        change_amount: paymentData.change_amount || 0,
        processed_by: paymentData.processed_by,
        payment_status: paymentData.payment_status || 'completed',
        transaction_reference: paymentData.transaction_reference,
        notes: paymentData.notes,
        tenant_id: paymentData.tenant_id || '' // Get from context
      };

      const { data, error } = await supabase
        .from('payments')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error processing payment:', error);
        toast.error('فشل في معالجة الدفعة');
        return null;
      }

      toast.success('تم معالجة الدفعة بنجاح');
      await loadPayments();
      return data as Payment;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('فشل في معالجة الدفعة');
      return null;
    }
  };

  const refundPayment = async (id: string, refundAmount?: number) => {
    try {
      const payment = payments.find(p => p.id === id);
      if (!payment) {
        toast.error('الدفعة غير موجودة');
        return false;
      }

      const { data, error } = await supabase
        .from('payments')
        .update({
          payment_status: 'refunded',
          notes: `Refunded ${refundAmount || payment.amount} ${payment.notes ? '- ' + payment.notes : ''}`
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error refunding payment:', error);
        toast.error('فشل في استرداد الدفعة');
        return false;
      }

      toast.success('تم استرداد الدفعة بنجاح');
      await loadPayments();
      return true;
    } catch (error) {
      console.error('Error refunding payment:', error);
      toast.error('فشل في استرداد الدفعة');
      return false;
    }
  };

  useEffect(() => {
    loadPayments();
  }, [user]);

  return {
    payments,
    loading,
    loadPayments,
    processPayment,
    refundPayment,
  };
};