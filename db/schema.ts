import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const orderStatusEnum = pgEnum('order_status', [
  'cancelled',
  'damaged',
  'delivered',
  'paid',
  'pending',
  'processing',
  'refunded',
  'removed',
  'shipped',
]);

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'STORE_MANAGER',
  'INVENTORY_MANAGER',
  'SALES_ASSOCIATE',
  'USER',
]);

const auditTimestamps = {
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    emailVerifiedAt: timestamp('email_verified_at', {
      mode: 'date',
      withTimezone: true,
    }),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    passwordHash: text('password_hash').notNull(),
    ...auditTimestamps,
  },
  (table) => [
    uniqueIndex('users_email_lower_unique').on(sql`lower(${table.email})`),
  ],
);

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  city: text('city'),
  country: text('country'),
  emulatingRole: userRoleEnum('emulating_role'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  postalCode: text('postal_code'),
  province: text('province'),
  shippingCity: text('shipping_city'),
  shippingCountry: text('shipping_country'),
  shippingFirstName: text('shipping_first_name'),
  shippingLastName: text('shipping_last_name'),
  shippingPhone: text('shipping_phone'),
  shippingPostalCode: text('shipping_postal_code'),
  shippingProvince: text('shipping_province'),
  shippingState: text('shipping_state'),
  shippingStreetAddress1: text('shipping_street_address1'),
  shippingStreetAddress2: text('shipping_street_address2'),
  shippingZipcode: text('shipping_zipcode'),
  state: text('state'),
  streetAddress1: text('street_address1'),
  streetAddress2: text('street_address2'),
  theme: text('theme').default('system').notNull(),
  zipcode: text('zipcode'),
  ...auditTimestamps,
});

export const userRoles = pgTable(
  'user_roles',
  {
    role: userRoleEnum('role').default('USER').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.role] })],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true })
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    tokenHash: text('token_hash').notNull(),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('sessions_expires_at_index').on(table.expiresAt),
    uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),
    index('sessions_user_id_index').on(table.userId),
  ],
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true })
      .notNull(),
    tokenHash: text('token_hash').notNull(),
    usedAt: timestamp('used_at', { mode: 'date', withTimezone: true }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('password_reset_tokens_expires_at_index').on(table.expiresAt),
    uniqueIndex('password_reset_tokens_hash_unique').on(table.tokenHash),
  ],
);

export const authenticationAttempts = pgTable(
  'authentication_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    ipAddress: text('ip_address'),
    succeeded: boolean('succeeded').default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('authentication_attempts_email_created_index').on(
      table.email,
      table.createdAt,
    ),
  ],
);

export const bookCategories = pgTable('book_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  show: boolean('show').default(true).notNull(),
  showOnLandingPage: boolean('show_on_landing_page').default(false).notNull(),
  ...auditTimestamps,
});

export const books = pgTable(
  'books',
  {
    id: text('id').primaryKey(),
    authors: text('authors').default('').notNull(),
    availableQuantity: integer('available_quantity').default(0).notNull(),
    averageRating: numeric('average_rating', {
      mode: 'number',
      precision: 4,
      scale: 2,
    }).default(0).notNull(),
    categoryId: integer('category_id').references(() => bookCategories.id, {
      onDelete: 'set null',
    }),
    description: text('description').default('').notNull(),
    discountPercentage: numeric('discount_percentage', {
      mode: 'number',
      precision: 5,
      scale: 2,
    }).default(0).notNull(),
    etag: text('etag').default('').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    isPromotion: boolean('is_promotion').default(false).notNull(),
    isbn10: text('isbn10').default('').notNull(),
    isbn13: text('isbn13').default('').notNull(),
    language: text('language').default('en').notNull(),
    listPrice: numeric('list_price', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).default(0).notNull(),
    pageCount: integer('page_count').default(0).notNull(),
    price: numeric('price', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).default(0).notNull(),
    publishedDate: text('published_date').default('').notNull(),
    publisher: text('publisher').default('').notNull(),
    quantity: integer('quantity').default(0).notNull(),
    ratingsCount: integer('ratings_count').default(0).notNull(),
    retailPrice: numeric('retail_price', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).default(0).notNull(),
    section: text('section').default('').notNull(),
    selfLink: text('self_link').default('').notNull(),
    shelf: text('shelf').default('').notNull(),
    smallThumbnailImageLink: text('small_thumbnail_image_link')
      .default('')
      .notNull(),
    subtitle: text('subtitle').default('').notNull(),
    thumbnailImageLink: text('thumbnail_image_link').default('').notNull(),
    title: text('title').notNull(),
    ...auditTimestamps,
  },
  (table) => [
    check('books_available_quantity_nonnegative', sql`${table.availableQuantity} >= 0`),
    index('books_category_id_index').on(table.categoryId),
    index('books_featured_index').on(table.isFeatured),
    index('books_title_index').on(table.title),
    check('books_quantity_nonnegative', sql`${table.quantity} >= 0`),
  ],
);

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ...auditTimestamps,
  },
  (table) => [uniqueIndex('carts_user_id_unique').on(table.userId)],
);

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    currentPrice: numeric('current_price', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).notNull(),
    quantity: integer('quantity').default(1).notNull(),
    ...auditTimestamps,
  },
  (table) => [
    uniqueIndex('cart_items_cart_book_unique').on(table.cartId, table.bookId),
    check('cart_items_quantity_positive', sql`${table.quantity} > 0`),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone'),
    notes: text('notes'),
    orderDate: timestamp('order_date', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    orderDiscountPercentage: numeric('order_discount_percentage', {
      mode: 'number',
      precision: 5,
      scale: 2,
    }).default(0).notNull(),
    paymentMethod: text('payment_method'),
    salesPersonId: uuid('sales_person_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    shippingAddress: jsonb('shipping_address').$type<Record<string, string>>(),
    status: orderStatusEnum('status').default('pending').notNull(),
    subtotal: numeric('subtotal', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).default(0).notNull(),
    taxAmount: numeric('tax_amount', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).default(0).notNull(),
    totalAmount: numeric('total_amount', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).default(0).notNull(),
    transactionId: text('transaction_id'),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    ...auditTimestamps,
  },
  (table) => [
    index('orders_order_date_index').on(table.orderDate),
    index('orders_sales_person_id_index').on(table.salesPersonId),
    index('orders_status_index').on(table.status),
    index('orders_user_id_index').on(table.userId),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bookId: text('book_id').references(() => books.id, {
      onDelete: 'set null',
    }),
    bookSnapshot: jsonb('book_snapshot').$type<Record<string, unknown>>(),
    categoryId: integer('category_id'),
    discountPercentage: numeric('discount_percentage', {
      mode: 'number',
      precision: 5,
      scale: 2,
    }).default(0).notNull(),
    finalPrice: numeric('final_price', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).notNull(),
    isPromotion: boolean('is_promotion').default(false).notNull(),
    isbn13: text('isbn13'),
    notes: text('notes'),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    originalPrice: numeric('original_price', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).notNull(),
    quantity: integer('quantity').notNull(),
    status: orderStatusEnum('status').default('pending').notNull(),
    subtotal: numeric('subtotal', {
      mode: 'number',
      precision: 12,
      scale: 2,
    }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('order_items_order_id_index').on(table.orderId),
    check('order_items_quantity_positive', sql`${table.quantity} > 0`),
  ],
);

export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cardBrand: text('card_brand').notNull(),
    cardExpMonth: integer('card_exp_month').notNull(),
    cardExpYear: integer('card_exp_year').notNull(),
    cardLast4: text('card_last4').notNull(),
    cardType: text('card_type').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    nameOnCard: text('name_on_card').notNull(),
    paymentProcessor: text('payment_processor').notNull(),
    providerReference: text('provider_reference').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ...auditTimestamps,
  },
  (table) => [index('payment_methods_user_id_index').on(table.userId)],
);

export type AuthenticatedUserRecord = typeof users.$inferSelect;
export type BookRecord = typeof books.$inferSelect;
export type ProfileRecord = typeof profiles.$inferSelect;
