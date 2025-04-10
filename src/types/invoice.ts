export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  items: InvoiceItem[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
} 