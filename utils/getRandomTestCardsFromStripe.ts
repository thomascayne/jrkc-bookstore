// utils/generateRandomTestCardFromStripe.ts

import { IStripTestCardNumber } from '@/interfaces/IStripTestCardNumber';
import { stripeTestCards } from '@/utils/stripe-test-cards';

export function generateRandomTestCardFromStripe(excludeIds: number[] = []): IStripTestCardNumber {
    const availableCards = stripeTestCards.filter(card => !excludeIds.includes(card.internalId));
    return availableCards[Math.floor(Math.random() * availableCards.length)];
}
