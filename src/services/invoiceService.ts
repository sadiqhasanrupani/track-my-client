import { InvoiceItem } from "../types/invoice";

interface CreateInvoiceData {
  customerId: string;
  items: InvoiceItem[];
  dueDate: string;
}

export async function createInvoice(data: CreateInvoiceData) {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create invoice");
  }

  return response.json();
} 