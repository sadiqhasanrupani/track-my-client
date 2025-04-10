import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Invoice } from "@/types/prisma";

interface RevenueByMonth {
  createdAt: Date;
  _sum: {
    total: number | null;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get total customers
    const totalCustomers = await prisma.customer.count();

    // Get total invoices and calculate revenue
    const invoices = await prisma.invoice.findMany({
      include: {
        items: true,
      },
    });

    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce(
      (sum: number, invoice: Invoice) => sum + Number(invoice.total),
      0
    );

    // Get outstanding invoices
    const outstandingInvoices = await prisma.invoice.count({
      where: {
        status: "pending",
      },
    });

    // Get revenue trend for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await prisma.invoice.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        total: true,
      },
    });

    const revenueTrend = revenueByMonth.map((item: RevenueByMonth) => ({
      month: new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      revenue: Number(item._sum.total),
    }));

    return NextResponse.json({
      totalCustomers,
      totalInvoices,
      totalRevenue,
      outstandingInvoices,
      revenueTrend,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 