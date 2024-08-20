// interfaces/UserProfile.ts

export interface UserProfile {
    city?: string | null;
    country?: string | null;
    created_at?: string;
    emulating_role?: string | null;
    first_name?: string;
    id: string;
    is_deleted?: boolean | null;
    last_name?: string;
    phone?: string | null;
    email?: string;
    postal_code?: string | null;
    province?: string | null;
    shipping_city?: string | null;
    shipping_country?: string | null;
    shipping_first_name?: string | null;
    shipping_last_name?: string | null;
    shipping_phone?: string | null;
    shipping_postal_code?: string | null;
    shipping_province?: string | null;
    shipping_state?: string | null;
    shipping_street_address1?: string | null;
    shipping_street_address2?: string | null;
    shipping_zipcode?: string | null;
    state?: string | null;
    street_address1?: string | null;
    street_address2?: string | null;
    theme?: string | null;
    updated_at?: string;
    zipcode?: string | null;
  }
  