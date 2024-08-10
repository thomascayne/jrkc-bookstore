// interfaces\BookCategory.ts - for the book_categories table

export interface BookCategory {
    id: number;
    key: string;
    label: string;
    show: boolean;
    show_on_landing_page ?: boolean;
}
