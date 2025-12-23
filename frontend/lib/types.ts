export interface Item {
    id: number;
    name: string;
    category: string;
    stock: number;
    min_stock: number;
    location?: string;
    description?: string;
    image_url?: string;
    manufacturer_part_number?: string;
    attachments?: string[];
    qr_code_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    item_id: number;
    user_id: number;
    transaction_type: string;
    amount: number;
    timestamp: string;
    notes?: string;
    user_name?: string;
    item_name?: string;
}

