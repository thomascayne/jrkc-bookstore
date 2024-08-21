// interfaces/IBook.ts - for the books table. as a minimal bookstore we don't have a complete inventory db

import { BookCategory } from "./BookCategory";

export interface IBookInventory {
    id: string;
    authors: string;
    available_quantity: number;
    average_rating: number;
    categoryId: number;
    category: BookCategory | null
    description: string;
    discount_percentage: number;
    etag: string;
    is_promotion: boolean;
    isbn10: string;
    isbn13: string;
    language: string;
    list_price: number;
    page_count: number;
    price: number;
    published_date: string;
    publisher: string;
    quantity: number;
    ratings_count: number;
    retail_price: number;
    section: string;
    self_link: string;
    shelf: string;
    small_thumbnail_image_link: string;
    subtitle: string;
    thumbnail_image_link: string;
    title: string;
    updatedAt?: string;
    category_id_check: number
    category_label_check: string
    is_featured?: boolean;
}