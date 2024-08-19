// app\sales\dashboard\pages.tsx

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  FaBook,
  FaCalculator,
  FaCalendarAlt,
  FaChartBar,
  FaExchangeAlt,
  FaHistory,
  FaQuestionCircle,
  FaSearch,
  FaStar,
  FaTag,
} from 'react-icons/fa';

interface DashboardProps {
  // Add any props here if needed
}

const SalesDashboardPage = ({}: DashboardProps) => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/signin');
        return;
      }

      if (!session.user.app_metadata.roles.includes('SALES_ASSOCIATE')) {
        router.push('/unauthorized');
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sales Management Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dashboardItems.map((item, index) => (
          <Link href={item.href} key={index} className="block h-full">
            <Card
              radius="sm"
              className={`${item.bgColor} hover:shadow-all-sides transition-shadow cursor-pointer h-full`}
            >
              <CardBody className="flex flex-col justify-between h-full min-h-52 py-4 px-2">
                <div className="flex justify-center items-center flex-grow">
                  <div
                    className={`text-6xl sm:text-5xl md:text-6xl lg:text-7xl ${item.iconColor} drop-shadow-[0_10px_8px_rgba(0,0,0,0.4)] filter brightness-110 contrast-125
                              transition-all duration-300 ease-in-out hover:drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] hover:scale-110 relative `}
                  >
                    <div className="absolute inset-0 bg-white opacity-10 rounded-full blur-md"></div>
                    {item.icon}
                  </div>
                </div>
                <div className="flex flex-col items-center text-center mt-3">
                  <h2 className="text-lg sm:text-xl font-semibold drop-shadow-lg mb-1">
                    {item.title}
                  </h2>
                  <p className="text-sm drop-shadow-lg text-white">{item.description}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SalesDashboardPage;

const dashboardItems = [
  {
    bgColor: 'bg-blue-500',
    description: "Today's sales performance at a glance",
    href: '/sales/today-summary',
    icon: <FaChartBar />,
    iconColor: 'text-red-300',
    title: "Today's Sales Summary",
  },
  {
    bgColor: 'bg-green-500',
    description: 'Customer purchases and checkout',
    href: '/sales/point-of-sale',
    icon: <FaCalculator />,
    iconColor: 'text-purple-300',
    title: 'Point of Sale (POS)',
  },
  {
    bgColor: 'bg-purple-500',
    description: 'Manage recent sales transactions',
    href: '#',
    icon: <FaHistory />,
    iconColor: 'text-yellow-300',
    title: 'Recent Transactions',
  },
  {
    bgColor: 'bg-yellow-500',
    description: 'Check top-selling books and trends',
    href: '#',
    icon: <FaStar />,
    iconColor: 'text-blue-300',
    title: 'Bestsellers',
  },
  {
    bgColor: 'bg-red-500',
    description: 'Active promotions and apply discounts',
    href: '#',
    icon: <FaTag />,
    iconColor: 'text-indigo-300',
    title: 'Promotions & Discounts',
  },
  {
    bgColor: 'bg-indigo-500',
    description: 'Manage customer information',
    href: '#',
    icon: <FaSearch />,
    iconColor: 'text-emerald-300',
    title: 'Customer Lookup',
  },
  {
    bgColor: 'bg-pink-500',
    description: 'Process customer returns and exchanges',
    href: '#',
    icon: <FaExchangeAlt />,
    iconColor: 'text-teal-300',
    title: 'Returns & Exchanges',
  },
  {
    bgColor: 'bg-cyan-500',
    description: 'Quick access to book inventory status',
    href: '#',
    icon: <FaBook />,
    iconColor: 'text-orange-300',
    title: 'Inventory Check',
  },
  {
    bgColor: 'bg-teal-500',
    description: 'Daily sales targets and performance',
    href: '#',
    icon: <FaCalendarAlt />,
    iconColor: 'text-gray-600',
    title: 'Daily Goals',
  },
  {
    bgColor: 'bg-orange-500',
    description: 'Access guides and support resources',
    href: '#',
    icon: <FaQuestionCircle />,
    iconColor: 'text-rose-300',
    title: 'Help & Support',
  },
];
