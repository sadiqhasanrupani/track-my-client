import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId: params.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer invoices" },
      { status: 500 }
    );
  }
} 