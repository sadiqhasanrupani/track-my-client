import { useState, useEffect } from "react";
import Link from "next/link";
import { Customer } from "@/types/prisma";

interface CustomerListProps {
  customers: Customer[];
  onDelete?: (customerId: string) => void;
}

export default function CustomerList({ customers, onDelete }: CustomerListProps) {
  const [currentCustomers, setCurrentCustomers] = useState<Customer[]>(customers);

  useEffect(() => {
    setCurrentCustomers(customers);
  }, [customers]);

  const handleDelete = async (customerId: string) => {
    if (onDelete) {
      onDelete(customerId);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {currentCustomers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <Link
                  href={`/customer/${customer.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                >
                  {customer.name}
                </Link>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900">{customer.email || "-"}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900">{customer.phone || "-"}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <div className="flex space-x-2">
                  <Link
                    href={`/customer/${customer.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 