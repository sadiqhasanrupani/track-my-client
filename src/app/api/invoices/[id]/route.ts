import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { items, status, dueDate } = body;

    // First update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        items: true,
      },
    });

    // Delete existing items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: params.id },
    });

    // Create new items
    if (items && items.length > 0) {
      await prisma.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: params.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      });
    }

    // Recalculate total
    const newItems = await prisma.invoiceItem.findMany({
      where: { invoiceId: params.id },
    });

    const total = newItems.reduce((sum, item) => sum + Number(item.amount), 0);

    // Update total
    const finalInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { total },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(finalInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Delete the invoice (this will cascade delete invoice items)
    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
} 