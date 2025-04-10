"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TableSkeleton } from '@/components/table/TableSkeleton';
import { useParams } from 'next/navigation';

// Create a client
const queryClient = new QueryClient();

// Define the invoice type
type Invoice = {
  id: string;
  total: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
};

// Define the columns
const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'total',
    header: 'Amount',
    cell: info => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(info.getValue() as number),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => {
      const status = info.getValue() as string;
      return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          status === 'paid' ? 'bg-green-100 text-green-800' : 
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: info => {
      const date = info.getValue() as string;
      return date ? new Date(date).toLocaleDateString() : '-';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: info => new Date(info.getValue() as string).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link 
          href={`/dashboard/invoices/${row.original.id}`} 
          className="text-blue-600 hover:text-blue-900"
          title="View"
        >
          View
        </Link>
        <Link 
          href={`/dashboard/invoices/${row.original.id}/edit`} 
          className="text-indigo-600 hover:text-indigo-900"
          title="Edit"
        >
          Edit
        </Link>
        <button 
          className="text-red-600 hover:text-red-900"
          title="Delete"
          onClick={() => {
            // In a real app, this would show a confirmation dialog
            alert(`Delete invoice #${row.original.id}?`);
          }}
        >
          Delete
        </button>
      </div>
    ),
  },
];

// Customer details component
function CustomerDetails() {
  const params = useParams();
  const customerId = params.id as string;
  const [globalFilter, setGlobalFilter] = useState('');

  // Fetch customer details
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  // Fetch customer's invoices
  const { data: invoices = [], isLoading: isLoadingInvoices, error } = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}/invoices`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoadingCustomer) return <div className="p-6">Loading customer details...</div>;
  if (!customer) return <div className="p-6 text-red-600">Customer not found</div>;

  return (
    <div className="p-6">
      {/* Customer Details Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">{customer.name}</h1>
          <div className="flex gap-2">
            <Link 
              href={`/dashboard/customers/${customerId}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FiEdit /> Edit Customer
            </Link>
            <button
              onClick={() => {
                // In a real app, this would show a confirmation dialog
                alert(`Delete customer ${customer.name}?`);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FiTrash2 /> Delete Customer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-black">{customer.email || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1 text-black">{customer.phone || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1 text-black">{customer.address || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
              <p className="mt-1 text-black">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Invoices</h2>
          <Link 
            href={`/dashboard/invoices/new?customerId=${customerId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiPlus /> New Invoice
          </Link>
        </div>

        <div className="mb-6 bg-white p-4 rounded-md shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow overflow-hidden">
          {isLoadingInvoices ? (
            <TableSkeleton columns={5} />
          ) : error ? (
            <div className="p-6 text-center text-red-600">Error loading invoices</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-black">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-black">
                      Showing{' '}
                      <span className="font-medium">
                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(
                          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                          table.getFilteredRowModel().rows.length
                        )}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function CustomerPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerDetails />
    </QueryClientProvider>
  );
} 