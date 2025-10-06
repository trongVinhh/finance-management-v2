export const CATEGORY_TEMPLATES = [
  { name: "Ăn uống", type: "expense", color: "red"},
  { name: "Nhà ở", type: "expense", color: "red"},
  { name: "Sinh hoạt", type: "expense", color: "red"},
  { name: "Giải trí, giao lưu", type: "expense", color: "red"},
  { name: "Mua sắm", type: "expense", color: "red"},
  { name: "Hóa đơn cố định", type: "expense", color: "red"},
  { name: "Khác", type: "expense", color: "red"},
  { name: "Lương", type: "income", color: "green"},
  { name: "Thưởng", type: "income", color: "green"},
  { name: "Vay Mượn", type: "income", color: "green"},
  { name: "Bất ngờ", type: "suddenly", color: "cyan"},
];

export function getDefaultCategories(userId: string) {
  return CATEGORY_TEMPLATES.map(cat => ({
    ...cat,
    user_id: userId,
  }));
}

export const currencyUnits = [
  { label: "VND", value: "VND" },
  { label: "JPY", value: "JPY" },
  { label: "USD", value: "USD" },
];
