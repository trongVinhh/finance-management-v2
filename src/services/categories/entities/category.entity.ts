export interface Category {
    id: string
    name: string
    type: 'income' | 'expense' | 'saving' | 'suddenly'
    color?: string
    icon?: string
}