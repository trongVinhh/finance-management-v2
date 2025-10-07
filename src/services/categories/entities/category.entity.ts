export interface Category {
    id: string
    name: string
    type: 'income' | 'expense' | 'saving' | 'suddenly',
    group: string;
    color?: string
    icon?: string
}