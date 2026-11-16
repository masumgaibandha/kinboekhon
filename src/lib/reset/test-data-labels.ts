export interface TestDataCounts {
  orders: number;
  customers: number;
  callLogs: number;
  fraudChecks: number;
  adSpend: number;
  stockMoves: number;
  payments: number;
  incompleteOrders: number;
  productsWithStock: number;
}

export const TEST_DATA_LABELS: Record<keyof TestDataCounts, string> = {
  orders: "Orders",
  customers: "Customers",
  callLogs: "Call logs",
  fraudChecks: "Fraud checks",
  adSpend: "Ad spend entries",
  stockMoves: "Stock moves",
  payments: "Payments",
  incompleteOrders: "Incomplete orders",
  productsWithStock: "Products with stock",
};
