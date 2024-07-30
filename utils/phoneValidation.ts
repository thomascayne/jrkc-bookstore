// utils/phoneValidation.ts

import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export interface PhoneValidationResult {
    isValid?: boolean;
    formattedNumber?: string;
    text?: string;
}

export const validateAndFormatPhone = (
    phoneNumber: string,
    country: CountryCode = 'US'
): PhoneValidationResult => {
    if (!phoneNumber) {
        return { isValid: false, text: 'Phone number is required.' };
    }

    try {
        // Remove any non-digit characters except '+' for consistency
        const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');

        if (isValidPhoneNumber(cleanedNumber, country)) {
            const parsedPhone = parsePhoneNumber(cleanedNumber, country);
            return {
                isValid: true,
                formattedNumber: parsedPhone.format('E.164')
            };
        }
        return {
            isValid: false,
            text: 'Invalid phone number format for the specified country.'
        };
    } catch (error) {
        console.error('Phone validation text:', error);
        return {
            isValid: false,
            text: 'An error occurred while validating the phone number.'
        };
    }
};

export const formatPhoneForDisplay = (
    phoneNumber: string,
    country: CountryCode = 'US'
): string => {
    if (!phoneNumber) {
        return ''; // Return empty string if phone number is not provided
    }

    try {
        const parsedPhone = parsePhoneNumber(phoneNumber, country);
        return parsedPhone.formatNational();
    } catch (error) {
        console.error('Phone formatting text:', error);
        return phoneNumber; // Return original number if formatting fails
    }
};

// Optional: Add more utility functions as needed
export const getCountryCodeFromPhone = (
    phoneNumber: string
): CountryCode | null => {
    if (!phoneNumber) {
        return null; // Return null if phone number is not provided
    }

    try {
        const parsedPhone = parsePhoneNumber(phoneNumber);
        return parsedPhone.country || null;
    } catch {
        return null;
    }
};