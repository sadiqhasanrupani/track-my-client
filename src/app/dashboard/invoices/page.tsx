"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { Eye, Pencil, Trash2 } from 'lucide-react';
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

// Create a client
const queryClient = new QueryClient();

// Define the invoice type
type Invoice = {
  id: string;
  customerId: string;
  total: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  customer: {
    name: string;
  };
};

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  invoice 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  invoice: Invoice | null;
}) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" />
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Delete Invoice
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this invoice? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Invoice Actions Component
function InvoiceActions({ 
  invoice,
  onDeleteClick 
}: { 
  invoice: Invoice;
  onDeleteClick: (invoice: Invoice) => void;
}) {
  return (
    <div className="flex space-x-2">
      <Link
        href={`/dashboard/invoices/${invoice.id}`}
        className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
        title="View Invoice"
      >
        <Eye className="h-3 w-3 mr-1" />
        View
      </Link>
      <Link
        href={`/dashboard/invoices/${invoice.id}/edit`}
        className="inline-flex items-center rounded-md bg-yellow-600 px-2 py-1 text-xs font-medium text-white hover:bg-yellow-700"
        title="Edit Invoice"
      >
        <Pencil className="h-3 w-3 mr-1" />
        Edit
      </Link>
      <button
        onClick={() => onDeleteClick(invoice)}
        className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
        title="Delete Invoice"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Delete
      </button>
    </div>
  );
}

// Invoices table component
function InvoicesTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  // Define the columns
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: info => info.getValue(),
    },
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
      cell: ({ row }) => {
        const invoice = row.original;
        return <InvoiceActions invoice={invoice} onDeleteClick={(invoice) => {
          setSelectedInvoice(invoice);
          setDeleteModalOpen(true);
        }} />;
      },
    },
  ];

  // Fetch invoices using TanStack Query
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

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

  if (isLoading) return <TableSkeleton columns={5} />;
  if (error) return <div className="p-6 text-center text-red-600">Error loading invoices</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-black">Invoices</h1>
        <Link href="/dashboard/invoices/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded-md"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="px-3 py-1 border rounded-md"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="px-3 py-1 border rounded-md"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="px-3 py-1 border rounded-md"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        invoice={selectedInvoice}
      />
    </div>
  );
}

// Main page component
export default function InvoicesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InvoicesTable />
    </QueryClientProvider>
  );
}

