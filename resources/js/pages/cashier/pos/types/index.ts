export type BilliardTable = {
    id: number;
    name: string;
    type: string;
};

export type Rate = {
    id: number;
    name: string;
    hourly_rate: number;
};

export type Package = {
    id: number;
    name: string;
    duration_minutes: number;
    price: number;
};

export type SessionData = {
    id: number;
    customer_name: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    total_amount: number;
    billiard_table: BilliardTable;
    rate: Rate | null;
    package: Package | null;
    closed_session_id?: number;
};

export type CurrentShift = {
    id: number;
    opened_at: string;
    initial_balance: number;
    current_balance: number;
    total_sales: number;
    total_transactions: number;
} | null;

export type ReceiptData = {
    no: string;
    transactionDate: string;
    cashierName: string;
    shiftId: number;
    customer: string;
    tableName: string;
    tableType: string;
    rateName: string;
    rateHourly: number;
    isPackage: boolean;
    packageName?: string;
    startedAt: string;
    endedAt: string;
    durationMinutes: number;
    subtotal: number;
    paymentAmount: number;
    change: number;
};
