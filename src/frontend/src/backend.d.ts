import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: string;
    status: Status;
    transactionDate: string;
    clientName: string;
    createdAt: Time;
    reminderDate: string;
    amount: number;
    product: string;
}
export enum Status {
    pending = "pending",
    paid = "paid",
    overdue = "overdue"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTransaction(transaction: Transaction): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTransaction(id: string): Promise<void>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTotalBalance(): Promise<number>;
    getTotalTransactionsForClient(clientName: string): Promise<bigint>;
    getTransactionById(id: string): Promise<Transaction>;
    getTransactionsByClientName(clientName: string): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markTransactionAsPaid(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
