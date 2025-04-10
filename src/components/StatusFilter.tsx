"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  return (
    <select
      name="status"
      value={currentStatus}
      onChange={handleStatusChange}
      className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="all">All Statuses</option>
      <option value="pending">Pending</option>
      <option value="paid">Paid</option>
      <option value="overdue">Overdue</option>
    </select>
  );
} 