// utils/bookCategoriesApi.ts

import { BookCategory } from "@/interfaces/BookCategory";
import { createClient } from "@/utils/supabase/client";


export async function fetchBookCategories(): Promise<BookCategory[]> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('book_categories')
            .select('id, key, label, show')
            .is('show', true)
            .order('key', { ascending: true });

        if (error) {
            console.error('fetch catergories - Error fetching book categories:', error);
            throw error;
        }

        return data as BookCategory[];
    } catch (error) {
        console.error(' fetch catergories in catch - Error fetching book categories:', error);
        throw error;
    }
}