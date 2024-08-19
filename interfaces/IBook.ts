// src/IBook.ts - for the books table. as a minimal bookstore we don't have a complete inventory db

export interface IBook {
    id: string;
    authors: string;
    available_quantity: number;
    average_rating: number;
    categoryId: number;
    createdAt: string;
    description: string;
    discount_percentage: number;
    etag: string;
    is_promotion: boolean;
    isbn10: string;
    isbn13: string;
    language: string;
    list_price: number;
    price: number;
    page_count: number;
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
    updatedAt: string;
}