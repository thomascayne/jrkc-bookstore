import type { IPaymentMethod } from '@/interfaces/IPaymentMethod';
import { apiRequest } from '@/utils/apiClient';

export const userStore = {
  async addPaymentMethod(paymentMethod: IPaymentMethod) {
    try {
      await apiRequest('/api/payment-methods', {
        body: JSON.stringify(paymentMethod),
        method: 'POST',
      });
      return true;
    } catch {
      return false;
    }
  },

  async getUserPaymentMethods(): Promise<IPaymentMethod[]> {
    try {
      const { methods } = await apiRequest<{ methods: IPaymentMethod[] }>(
        '/api/payment-methods',
      );
      return methods;
    } catch {
      return [];
    }
  },

  async setDefaultPaymentMethod(paymentMethodId: string) {
    try {
      await apiRequest('/api/payment-methods', {
        body: JSON.stringify({ id: paymentMethodId }),
        method: 'PATCH',
      });
      return true;
    } catch {
      return false;
    }
  },
};
