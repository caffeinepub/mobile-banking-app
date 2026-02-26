import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    id: string;
    status: TransactionStatus;
    provider: string;
    userId: string;
    createdAt: bigint;
    recipient: string;
    txType: TransactionType;
    amount: number;
    slipData: string;
}
export interface SupportTicket {
    id: string;
    status: SupportTicketStatus;
    adminReply: string;
    subject: string;
    userId: string;
    createdAt: bigint;
    message: string;
}
export type Result = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface AppSettings {
    transactionSystemEnabled: boolean;
}
export interface NotificationWithRead {
    id: string;
    isGlobal: boolean;
    title: string;
    body: string;
    createdAt: bigint;
    isRead: boolean;
}
export interface UserProfile {
    name: string;
    mobile: string;
}
export enum SupportTicketStatus {
    closed = "closed",
    open = "open",
    replied = "replied"
}
export enum TransactionStatus {
    cancelled = "cancelled",
    completed = "completed",
    processing = "processing"
}
export enum TransactionType {
    cashOut = "cashOut",
    bankTransfer = "bankTransfer",
    addMoney = "addMoney",
    recharge = "recharge",
    savings = "savings",
    sendMoney = "sendMoney",
    payBill = "payBill"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveKYC(adminToken: string, userId: string): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelTransaction(adminToken: string, txId: string): Promise<Result>;
    changePIN(userId: string, oldPin: string, newPin: string): Promise<Result>;
    completeTransaction(adminToken: string, txId: string): Promise<Result>;
    createAnnouncement(adminToken: string, title: string, body: string): Promise<Result>;
    createSupportTicket(userId: string, subject: string, message: string): Promise<Result>;
    createTransaction(userId: string, txType: TransactionType, amount: number, recipient: string, provider: string): Promise<Result>;
    getAllTickets(adminToken: string): Promise<Array<SupportTicket>>;
    getAllTransactions(adminToken: string): Promise<Array<Transaction>>;
    getAppSettings(adminToken: string): Promise<AppSettings>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUser(userId: string): Promise<Result>;
    getUserNotifications(userId: string): Promise<Array<NotificationWithRead>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTickets(userId: string): Promise<Array<SupportTicket>>;
    getUserTransactions(userId: string): Promise<Array<Transaction>>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(mobile: string, pin: string, deviceId: string): Promise<Result>;
    markNotificationRead(userId: string, notificationId: string): Promise<Result>;
    registerUser(mobile: string, pin: string, name: string, deviceId: string): Promise<Result>;
    rejectKYC(adminToken: string, userId: string): Promise<Result>;
    replyToTicket(adminToken: string, ticketId: string, reply: string): Promise<Result>;
    resetUserDevice(adminToken: string, userId: string, newDeviceId: string): Promise<Result>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTransactionSystemEnabled(adminToken: string, enabled: boolean): Promise<Result>;
    setUserBalance(adminToken: string, userId: string, amount: number): Promise<Result>;
    submitKYC(userId: string, nid: string, fullName: string, address: string, photoUrl: string): Promise<Result>;
    updateDeviceId(adminToken: string, userId: string, newDeviceId: string): Promise<Result>;
}
