import type { AccountType } from "../enum/account-type.enum";

export interface Account {
    id: string;
    name: string;
    key: string;
    logo: string;
    amount: number;
    userId: string;
    type: AccountType;
}