// src\utils\bookCategories.ts

import { BookCategory } from "@/interfaces/BookCategory";

export const bookCategories: BookCategory[] = [
    { id: 1, key: "art", label: "Art", show: true },
    { id: 2, key: "biography", label: "Biography", show: true },
    { id: 3, key: "business", label: "Business", show: true },
    { id: 4, key: "computers", label: "Computers", show: true },
    { id: 5, key: "cooking", label: "Cooking", show: true },
    { id: 6, key: "education", label: "Education", show: true },
    { id: 7, key: "fiction", label: "Fiction", show: true },
    { id: 8, key: "health-fitness", label: "Health & Fitness", show: true },
    { id: 9, key: "history", label: "History", show: true },
    { id: 10, key: "humor", label: "Humor", show: true },
    { id: 11, key: "juvenile-fiction", label: "Juvenile Fiction", show: true },
    { id: 12, key: "juvenile-nonfiction", label: "Juvenile Non-Fiction", show: true },
    { id: 13, key: "language-arts-disciplines", label: "Language Arts & Disciplines", show: true },
    { id: 14, key: "law", label: "Law", show: true },
    { id: 15, key: "literary-collections", label: "Literary Collections", show: true },
    { id: 16, key: "medical", label: "Medical", show: true },
    { id: 17, key: "music", label: "Music", show: true },
    { id: 18, key: "nonfiction", label: "Non-Fiction", show: true },
    { id: 19, key: "performing-arts", label: "Performing Arts", show: true },
    { id: 20, key: "pets", label: "Pets", show: true },
    { id: 21, key: "philosophy", label: "Philosophy", show: true },
    { id: 22, key: "poetry", label: "Poetry", show: true },
    { id: 23, key: "political-science", label: "Political Science", show: true },
    { id: 24, key: "psychology", label: "Psychology", show: true },
    { id: 25, key: "reference", label: "Reference", show: true },
    { id: 26, key: "religion", label: "Religion", show: true },
    { id: 27, key: "science", label: "Science", show: true },
    { id: 28, key: "self-help", label: "Self-Help", show: true },
    { id: 29, key: "social-science", label: "Social Science", show: true },
    { id: 30, key: "sports-recreation", label: "Sports & Recreation", show: true },
    { id: 31, key: "technology-engineering", label: "Technology & Engineering", show: true },
    { id: 32, key: "travel", label: "Travel", show: true },
    { id: 33, key: "true-crime", label: "True Crime", show: true },
    { id: 34, key: "young-adult-nonfiction", label: "Young Adult Non-Fiction", show: true }
];

export const bookCategoryMap: Record<string, number> = bookCategories.reduce((acc, category) => {
    acc[category.key] = category.id;
    return acc;
}, {} as Record<string, number>);
