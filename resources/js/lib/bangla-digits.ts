const BANGLA_TO_ENGLISH: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
};

/**
 * Converts Bangla-Indic digits (০-৯) to their Western Arabic equivalents, so
 * a customer typing their phone number in Bangla still matches the
 * `01[3-9][0-9]{8}` format the input's own pattern requires.
 */
export function toEnglishDigits(value: string): string {
    return value.replace(/[০-৯]/g, (digit) => BANGLA_TO_ENGLISH[digit]);
}

/**
 * Normalizes phone number input so the backend always receives a raw
 * 11-digit local number: converts Bangla digits, strips hyphens users
 * paste in from formatted numbers, and drops a leading "+88"/"88"
 * country code if present.
 */
export function sanitizePhoneInput(value: string): string {
    return toEnglishDigits(value)
        .replace(/-/g, '')
        .replace(/^\+?88/, '');
}
