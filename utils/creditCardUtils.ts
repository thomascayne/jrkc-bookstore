// utils/creditCardUtils.ts

export const cardTypes = ["Visa", "Mastercard", "Amex", "Discover", "Diners", "JCB", "Maestro", "UnionPay", "Mir", "Elo", "Alipay", "Hiper", "Hipercard"] as const;

export type CardType = typeof cardTypes[number] | "" | null;

export const detectCardType = (cardNumber: string): CardType => {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    if (/^4/.test(cleanNumber)) return "Visa";
    if (/^5[1-5]/.test(cleanNumber)) return "Mastercard";
    if (/^3[47]/.test(cleanNumber)) return "Amex";
    if (/^6(?:011|5)/.test(cleanNumber)) return "Discover";
    if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return "Diners";
    if (/^35/.test(cleanNumber)) return "JCB";
    if (/^(5018|5020|5038|6304|6759|6761|6763)/.test(cleanNumber)) return "Maestro";
    if (/^62/.test(cleanNumber)) return "UnionPay";
    if (/^2/.test(cleanNumber)) return "Mir";
    if (/^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|(506699|5067[0-6]\d|50677[0-8])|(50900\d|5090[1-9]\d|509[1-9]\d{2})|65003[1-3]|65003[5-9]|65004\d|65005[0-1]|65040[5-9]|6504[1-3]\d|65048[5-9]|65049\d|65050[0-4]|65050[6-9]|65051\d|65052[0-9]|6505[3-8]|65059[0-8]|65070\d|65071[0-8]|65072[0-7]|65090[1-9]|65091\d|650920|65092[2-9]|6509[3-6]\d|65097[0-8]|65098[1-9]|65099\d)/.test(cleanNumber)) return "Elo";
    if (/^(637095|637599|637609|637612)/.test(cleanNumber)) return "Hiper";
    if (/^(606282\d{10}(\d{3})?)|(3841\d{15})/.test(cleanNumber)) return "Hipercard";

    return "";
};

export const formatCardNumber = (number: string, cardType: CardType): string => {
    const cleanNumber = number.replace(/\D/g, '');

    if (cardType === "Amex") {
        return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    } else {
        return cleanNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
};

export const generateMockCreditCard = (): { cardType: Exclude<CardType, "" | null>, cardNumber: string, expirationMonth: string, expirationYear: string } => {
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    let cardNumber: string;

    switch (cardType) {
        case "Visa":
            cardNumber = "4" + Math.random().toString().slice(2, 17);
            break;
        case "Mastercard":
            cardNumber = "5" + (Math.floor(Math.random() * 5) + 1).toString() + Math.random().toString().slice(2, 17);
            break;
        case "Amex":
            cardNumber = "3" + (Math.random() > 0.5 ? "4" : "7") + Math.random().toString().slice(2, 16);
            break;
        case "Discover":
            cardNumber = "6011" + Math.random().toString().slice(2, 17);
            break;
        default:
            cardNumber = Math.random().toString().slice(2, 18);
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    let expirationYear = currentYear + Math.floor(Math.random() * 8);
    let expirationMonth = Math.floor(Math.random() * 12) + 1;

    if (expirationYear === currentYear && expirationMonth < currentMonth) {
        expirationMonth = currentMonth;
    }

    return {
        cardType,
        cardNumber,
        expirationMonth: expirationMonth.toString().padStart(2, "0"),
        expirationYear: expirationYear.toString(),
    };
};