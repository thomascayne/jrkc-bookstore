// app/interfaces/Books.ts

export interface Book {
    id: string;
    etag: string;
    selfLink: string;
    volumeInfo: {
        title: string;
        subtitle?: string;
        authors?: string[];
        publisher?: string;
        publishedDate?: string;
        description?: string;
        industryIdentifiers?: Array<{
            type: string;
            identifier: string;
        }>;
        pageCount?: number;
        categories?: string[];
        averageRating?: number;
        ratingsCount?: number;
        maturityRating?: string;
        language?: string;
        imageLinks?: {
            smallThumbnail?: string;
            thumbnail?: string;
            small?: string;
            medium?: string;
            large?: string;
            extraLarge?: string;
        };
        previewLink?: string;
        infoLink?: string;
        canonicalVolumeLink?: string;
    };
    saleInfo?: {
        country?: string;
        saleability?: string;
        isEbook?: boolean;
        listPrice?: {
            amount: number;
            currencyCode: string;
        };
        retailPrice?: {
            amount: number;
            currencyCode: string;
        };
        buyLink?: string;
    };
    accessInfo?: {
        country?: string;
        viewability?: string;
        embeddable?: boolean;
        publicDomain?: boolean;
        textToSpeechPermission?: string;
        epub?: {
            isAvailable: boolean;
            acsTokenLink?: string;
        };
        pdf?: {
            isAvailable: boolean;
            acsTokenLink?: string;
        };
        webReaderLink?: string;
        accessViewStatus?: string;
        quoteSharingAllowed?: boolean;
    };
    searchInfo?: {
        textSnippet?: string;
    };
}