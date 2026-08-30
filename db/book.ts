import type { BookCategory } from '@/interfaces/BookCategory';
import type { IBookInventory } from '@/interfaces/IBookInventory';
import type { bookCategories, books } from '@/db/schema';

type BookRecord = typeof books.$inferSelect;
type CategoryRecord = typeof bookCategories.$inferSelect;

export function serializeCategory(category: CategoryRecord): BookCategory {
  return {
    id: category.id,
    key: category.key,
    label: category.label,
    show: category.show,
    show_on_landing_page: category.showOnLandingPage,
  };
}

export function serializeBook(
  book: BookRecord,
  category: CategoryRecord | null,
): IBookInventory {
  return {
    authors: book.authors,
    available_quantity: book.availableQuantity,
    average_rating: book.averageRating,
    catalog_source: 'database',
    category: category ? serializeCategory(category) : null,
    category_id_check: book.categoryId ?? 0,
    category_label_check: category?.label ?? '',
    categoryId: book.categoryId ?? 0,
    description: book.description,
    discount_percentage: book.discountPercentage,
    etag: book.etag,
    id: book.id,
    is_featured: book.isFeatured,
    is_promotion: book.isPromotion,
    isbn10: book.isbn10,
    isbn13: book.isbn13,
    language: book.language,
    list_price: book.listPrice,
    page_count: book.pageCount,
    price: book.price,
    published_date: book.publishedDate,
    publisher: book.publisher,
    quantity: book.quantity,
    ratings_count: book.ratingsCount,
    retail_price: book.retailPrice,
    section: book.section,
    self_link: book.selfLink,
    shelf: book.shelf,
    small_thumbnail_image_link: book.smallThumbnailImageLink,
    subtitle: book.subtitle,
    thumbnail_image_link: book.thumbnailImageLink,
    title: book.title,
    updatedAt: book.updatedAt.toISOString(),
  };
}
