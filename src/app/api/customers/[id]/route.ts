import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
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
    const { name, email, phone, address, externalCustomerId } = body;

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        address,
        externalCustomerId,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete the customer (this will cascade delete invoices and invoice items)
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
} 