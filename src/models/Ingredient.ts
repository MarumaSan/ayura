export interface IngredientRow {
    id: string; // 'ing-xxx'
    name: string;
    name_english: string;
    category: 'ผัก' | 'สมุนไพร' | 'ผลไม้' | 'โปรตีน' | 'ธัญพืช';
    image: string;
    community: string;
    price_per_100g: number;
    in_stock: number;
    note?: string;
    calories_100g: number;
    protein_100g: number;
    carbs_100g: number;
    fat_100g: number;
    created_at: string;
    updated_at: string;
}

