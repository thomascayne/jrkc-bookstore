// interfaces\BookWithThumbnail.ts

import { IBookInventory } from "@/interfaces/IBookInventory";

export interface BookWithThumbnail extends IBookInventory {
    thumbnail: string;
    discountPercentage: number;
    isPromotion: boolean;
  }