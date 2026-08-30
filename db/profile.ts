import type { UserProfile } from '@/interfaces/UserProfile';
import type { profiles } from '@/db/schema';

type ProfileRecord = typeof profiles.$inferSelect;

export function serializeProfile(profile: ProfileRecord): UserProfile {
  return {
    city: profile.city,
    country: profile.country,
    created_at: profile.createdAt.toISOString(),
    emulating_role: profile.emulatingRole,
    first_name: profile.firstName ?? undefined,
    id: profile.userId,
    last_name: profile.lastName ?? undefined,
    phone: profile.phone,
    postal_code: profile.postalCode,
    province: profile.province,
    shipping_city: profile.shippingCity,
    shipping_country: profile.shippingCountry,
    shipping_first_name: profile.shippingFirstName,
    shipping_last_name: profile.shippingLastName,
    shipping_phone: profile.shippingPhone,
    shipping_postal_code: profile.shippingPostalCode,
    shipping_province: profile.shippingProvince,
    shipping_state: profile.shippingState,
    shipping_street_address1: profile.shippingStreetAddress1,
    shipping_street_address2: profile.shippingStreetAddress2,
    shipping_zipcode: profile.shippingZipcode,
    state: profile.state,
    street_address1: profile.streetAddress1,
    street_address2: profile.streetAddress2,
    theme: profile.theme,
    updated_at: profile.updatedAt.toISOString(),
    zipcode: profile.zipcode,
  };
}

export function profileUpdates(body: Record<string, unknown>) {
  const allowedFields = {
    city: 'city',
    country: 'country',
    first_name: 'firstName',
    last_name: 'lastName',
    phone: 'phone',
    postal_code: 'postalCode',
    province: 'province',
    shipping_city: 'shippingCity',
    shipping_country: 'shippingCountry',
    shipping_first_name: 'shippingFirstName',
    shipping_last_name: 'shippingLastName',
    shipping_phone: 'shippingPhone',
    shipping_postal_code: 'shippingPostalCode',
    shipping_province: 'shippingProvince',
    shipping_state: 'shippingState',
    shipping_street_address1: 'shippingStreetAddress1',
    shipping_street_address2: 'shippingStreetAddress2',
    shipping_zipcode: 'shippingZipcode',
    state: 'state',
    street_address1: 'streetAddress1',
    street_address2: 'streetAddress2',
    theme: 'theme',
    zipcode: 'zipcode',
  } as const;
  const updates: Record<string, string | null | Date> = {
    updatedAt: new Date(),
  };

  for (const [requestField, databaseField] of Object.entries(allowedFields)) {
    const value = body[requestField];
    if (typeof value === 'string' || value === null) {
      updates[databaseField] = value;
    }
  }

  return updates;
}
