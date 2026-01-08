
export interface Order {
    id: number;
    orderTime: string;
    totalAmount: number;
    status: string;
    tableName: string;
    items: {
        productId: number;
        productName: string;
        quantity: number;
        price: number;
    }[];
}