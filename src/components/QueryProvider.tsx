'use client';

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/services/global-http";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 