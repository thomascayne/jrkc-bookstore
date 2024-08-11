// app\sales\dashboard\pages.tsx

"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface DashboardProps {
  // Add any props here if needed
}

const SalesDashboardPage = ({}: DashboardProps) => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || userData.role !== 'sales_associate') {
        router.push('/unauthorized');
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sales Management Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dashboardItems.map((item, index) => (
          <Link href={item.href} key={index}>
            <Card
              className={`bg-${item.color}-100 hover:shadow-lg transition-shadow cursor-pointer`}
            >
              <CardBody>
                <div className="flex items-center mb-2">
                  <svg
                    className={`w-6 h-6 mr-2 text-${item.color}-500`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={item.icon}
                    ></path>
                  </svg>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SalesDashboardPage;

export const dashboardItems = [
  {
    title: "Today's Sales Summary",
    description: "View today's sales performance at a glance",
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'blue',
    href: '/sales/summary',
  },
  {
    title: 'Point of Sale (POS)',
    description: 'Process customer purchases and checkout',
    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    color: 'green',
    href: '/sales/pos',
  },
  {
    title: 'Recent Transactions',
    description: 'View and manage recent sales transactions',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    color: 'purple',
    href: '/sales/transactions',
  },
  {
    title: 'Bestsellers',
    description: 'Check top-selling books and trends',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    color: 'yellow',
    href: '/sales/bestsellers',
  },
  {
    title: 'Promotions & Discounts',
    description: 'View active promotions and apply discounts',
    icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
    color: 'red',
    href: '/sales/promotions',
  },
  {
    title: 'Customer Lookup',
    description: 'Search and manage customer information',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    color: 'indigo',
    href: '/sales/customers',
  },
  {
    title: 'Returns & Exchanges',
    description: 'Process customer returns and exchanges',
    icon: 'M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z',
    color: 'pink',
    href: '/sales/returns',
  },
  {
    title: 'Inventory Check',
    description: 'Quick access to book inventory status',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    color: 'gray',
    href: '/sales/inventory',
  },
  {
    title: 'Daily Goals',
    description: 'Track your daily sales targets and performance',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'teal',
    href: '/sales/goals',
  },
  {
    title: 'Help & Support',
    description: 'Access guides and support resources',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    color: 'orange',
    href: '/sales/support',
  },
];
