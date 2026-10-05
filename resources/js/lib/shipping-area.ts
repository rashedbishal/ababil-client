// Shipping area names are stored and administered in English (CMS, courier
// integration, order history all read it that way). The storefront is
// Bangla-only, so known area names get a display-only Bangla label here;
// anything not in this map (e.g. an area added later with no translation
// yet) just falls back to its English name rather than showing nothing.
const SHIPPING_AREA_LABELS_BN: Record<string, string> = {
    'Inside Dhaka City Corporation': 'ঢাকা সিটি কর্পোরেশনের ভিতরে',
    'Outside Dhaka City Corporation': 'ঢাকা সিটি কর্পোরেশনের বাইরে',
};

export function shippingAreaLabel(name: string): string {
    return SHIPPING_AREA_LABELS_BN[name] ?? name;
}
