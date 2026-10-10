export type Product = {
    id: number;
    name: string;
    short_description: string | null;
    description: string | null;
    regular_price: string;
    sale_price: string | null;
    sku: string;
    free_delivery: boolean;
    in_stock: boolean;
    variants: {
        id: number;
        size: string | null;
        stock: number;
        in_stock: boolean;
        price: string;
    }[];
};

export type ShippingArea = {
    id: number;
    name: string;
    charge: string;
};

export type Contact = {
    phone: string | null;
    whatsapp: string | null;
    facebookUrl: string | null;
};
