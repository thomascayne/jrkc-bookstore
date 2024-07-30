// utils/passwordChecker.ts

export interface PasswordValidationResult {
    isValid: boolean;
    message: string;
}

export function validatePassword(password: string, confirmPassword: string): PasswordValidationResult {
    console.log(password, confirmPassword)
    if (password !== confirmPassword) {
        return { isValid: false, message: "Passwords do not match!" };
    }

    if (password.length < 8) {
        return { isValid: false, message: "Password must be at least 8 characters!" };
    }

    if (password.search(/[a-z]/) < 0) {
        return { isValid: false, message: "Password must contain at least one lowercase letter!" };
    }

    if (password.search(/[A-Z]/) < 0) {
        return { isValid: false, message: "Password must contain at least one uppercase letter!" }
    }

    if (password.search(/[0-9]/) < 0) {
        return { isValid: false, message: "Password must contain at least one number!" };
    }

    if (password.search(/[^a-zA-Z0-9]/) < 0) {
        return { isValid: false, message: "Password must contain at least one special character!" };
    }

    if (password.search(/\s/) >= 0) {
        return { isValid: false, message: "Password must not contain any spaces!" };
    }

    // Password is valid
    return { isValid: true, message: "Password input valid. Go update your password, then sign in again." };
}