// stores/userStore.ts
import { createClient } from '@/utils/supabase/client';
import { IPaymentMethod } from '@/interfaces/IPaymentMethod';

const supabase = createClient();

export const userStore = {
  async getUserPaymentMethods(): Promise<IPaymentMethod[]> {
    const { data, error } = await supabase
      .rpc('get_user_payment_methods')
      .returns<IPaymentMethod[]>();

    if (error) {
      console.error('Error fetching user payment methods:', error);
      return [];
    }

    return data || [];
  },

  async addPaymentMethod(paymentMethod: IPaymentMethod): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('add_payment_method', {
        p_payment_method: {
          type: paymentMethod.card_type,
          card_last4: paymentMethod.card_last4,
          card_brand: paymentMethod.card_brand,
          exp_month: paymentMethod.card_exp_month,
          exp_year: paymentMethod.card_exp_year,
          is_default: paymentMethod.is_default,
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding payment method:', error)
      return false
    }
  },

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<boolean> {
    // First, set all payment methods to non-default
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .neq('id', paymentMethodId);

    // Then set the selected payment method as default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId);

    if (error) {
      console.error('Error setting default payment method:', error);
      return false;
    }

    return true;
  },
};