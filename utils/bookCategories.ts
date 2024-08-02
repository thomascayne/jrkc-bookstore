// src\utils\bookCategories.ts

import { BookCategory } from "@/interfaces/BookCategory";

export const bookCategories: BookCategory[] = [
    { id: 1, key: "art", label: "Art" },
    { id: 2, key: "biography", label: "Biography" },
    { id: 3, key: "business", label: "Business" },
    { id: 4, key: "computers", label: "Computers" },
    { id: 5, key: "cooking", label: "Cooking" },
    { id: 6, key: "education", label: "Education" },
    { id: 7, key: "fiction", label: "Fiction" },
    { id: 8, key: "health-fitness", label: "Health & Fitness" },
    { id: 9, key: "history", label: "History" },
    { id: 10, key: "humor", label: "Humor" },
    { id: 11, key: "juvenile-fiction", label: "Juvenile Fiction" },
    { id: 12, key: "juvenile-nonfiction", label: "Juvenile Non-Fiction" },
    { id: 13, key: "language-arts-disciplines", label: "Language Arts & Disciplines" },
    { id: 14, key: "law", label: "Law" },
    { id: 15, key: "literary-collections", label: "Literary Collections" },
    { id: 16, key: "medical", label: "Medical" },
    { id: 17, key: "music", label: "Music" },
    { id: 18, key: "nonfiction", label: "Non-Fiction" },
    { id: 19, key: "performing-arts", label: "Performing Arts" },
    { id: 20, key: "pets", label: "Pets" },
    { id: 21, key: "philosophy", label: "Philosophy" },
    { id: 22, key: "poetry", label: "Poetry" },
    { id: 23, key: "political-science", label: "Political Science" },
    { id: 24, key: "psychology", label: "Psychology" },
    { id: 25, key: "reference", label: "Reference" },
    { id: 26, key: "religion", label: "Religion" },
    { id: 27, key: "science", label: "Science" },
    { id: 28, key: "self-help", label: "Self-Help" },
    { id: 29, key: "social-science", label: "Social Science" },
    { id: 30, key: "sports-recreation", label: "Sports & Recreation" },
    { id: 31, key: "technology-engineering", label: "Technology & Engineering" },
    { id: 32, key: "travel", label: "Travel" },
    { id: 33, key: "true-crime", label: "True Crime" },
    { id: 34, key: "young-adult-nonfiction", label: "Young Adult Non-Fiction" }
];

export const bookCategoryMap: Record<string, number> = bookCategories.reduce((acc, category) => {
    acc[category.key] = category.id;
    return acc;
}, {} as Record<string, number>);
