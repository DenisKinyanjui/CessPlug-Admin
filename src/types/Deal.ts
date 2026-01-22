// Deal.ts
import { Product } from './Product';

export interface FlashDeal extends Product {
  product: any;
  isFlashDeal: true;
  flashEndsAt: string;
  discount: number;
}

export interface FlashDealsResponse {
  success: boolean;
  data: {
    flashDeals: FlashDeal[];
  };
}

export interface CreateFlashDealData {
  productId: string;
  discount: number;
  endsAt: string;
}