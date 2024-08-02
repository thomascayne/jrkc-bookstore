// src/IBook.ts

export interface IBook {
    id: string;
    authors: string;
    average_rating: number;
    categoryId: number;
    description: string;
    discount_percentage: number;
    etag: string;
    isbn10: string;
    isbn13: string;
    is_promotion: boolean;
    language: string;
    list_price: number;
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
}