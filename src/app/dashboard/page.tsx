"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CustomerList from "@/components/CustomerList";
import { Customer } from "@/types/prisma";

interface DashboardStats {
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: number;
  outstandingInvoices: number;
  revenueTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, customersResponse] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/customers"),
        ]);

        if (!statsResponse.ok || !customersResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [statsData, customersData] = await Promise.all([
          statsResponse.json(),
          customersResponse.json(),
        ]);

        setStats(statsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers(customers.filter((customer) => customer.id !== customerId));
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalCustomers}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Invoices</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.totalInvoices}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              ${stats?.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Outstanding Invoices
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.outstandingInvoices}
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer List */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Customers</h2>
            <Link
              href="/customer/new"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Customer
            </Link>
          </div>
          <div className="mt-4">
            <CustomerList
              customers={customers}
              onDelete={handleDeleteCustomer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

