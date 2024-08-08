// interfaces/IStripePaymentMethod.ts

/**
 * Interface for Stripe payment methods 
 */
export interface IStripePaymentMethod {
    id: string;
    object?: string;
    billing_details: {
        address: {
            city: string | null;
            country: string | null;
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null;
        };
        email: string | null;
        name: string | null;
        phone: string | null;
    };
    card: {
        brand: string;
        exp_month: number;
        exp_year: number;
        last4: string;
        funding: string;
        country: string;
    };
    created?: number;
    customer: string | null;
    livemode: boolean;
    type: string;
}