'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout } from './DashboardLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if this is a customer route (excluding customers management)
  const isCustomerRoute = (pathname?.startsWith('/customer') && !pathname?.startsWith('/customers')) || 
                         pathname === '/customer-login' || 
                         pathname === '/customer-login-success';

  // If it's a customer route, don't apply the main dashboard layout
  if (isCustomerRoute) {
    return <>{children}</>;
  }

  // For all other routes, apply the main dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
}
