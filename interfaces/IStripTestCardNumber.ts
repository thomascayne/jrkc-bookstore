
// utils\stripe-test-cards.ts

export interface IStripTestCardNumber {
    brand: string
    number: string
    expMonth: number
    expYear: number
    cvc: string
    funding: string
    last4: string
    country: string
    token: string
}