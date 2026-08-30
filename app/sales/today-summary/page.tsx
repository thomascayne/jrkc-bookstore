// app/sales/dashboard/today-summary/page.tsx

'use client';

import { Line } from 'react-chartjs-2';
import { BookWithThumbnail } from '@/interfaces/BookWithThumbnail';
import { Card, CardHeader, CardBody, Divider } from '@heroui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import { apiRequest } from '@/utils/apiClient';
import { motion } from 'framer-motion';
import Loading from '@/components/Loading';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
);

const TodaySalesSummaryPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [todaySales, setTodaySales] = useState<number>(0);
  const [todayOrders, setTodayOrders] = useState<number>(0);
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0);
  const [topSellingBooks, setTopSellingBooks] = useState<BookWithThumbnail[]>(
    [],
  );
  const [salesByHour, setSalesByHour] = useState<
    { hour: number; sales: number }[]
  >([]);
  const [comparisonToYesterday, setComparisonToYesterday] = useState<number>(0);

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  const fetchTodaySummary = async () => {
    setIsLoading(true);

    const summary = await apiRequest<{
      averageOrderValue: number;
      comparisonToYesterday: number;
      salesByHour: Array<{ hour: number; sales: number }>;
      todayOrders: number;
      todaySales: number;
      topSellingBooks: BookWithThumbnail[];
    }>('/api/sales/summary');
    setTodaySales(summary.todaySales);
    setTodayOrders(summary.todayOrders);
    setAverageOrderValue(summary.averageOrderValue);
    setComparisonToYesterday(summary.comparisonToYesterday);
    setTopSellingBooks(summary.topSellingBooks);
    setSalesByHour(summary.salesByHour);

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 my-6 text-center">
       {` Today's Sales Summary`}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Sales"
          value={`$${(todaySales ?? 0).toFixed(2)}`}
          comparison={comparisonToYesterday}
        />
        <SummaryCard
          title="Total Orders"
          value={(todayOrders ?? 0).toString()}
        />
        <SummaryCard
          title="Average Order Value"
          value={`$${(averageOrderValue ?? 0).toFixed(2)}`}
        />
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesByHour} />
        <TopSellingBooks books={topSellingBooks} />
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{
  title: string;
  value: string;
  comparison?: number;
}> = ({ title, value, comparison }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full h-full" shadow='lg'>
        <CardHeader className="flex flex-col items-start">
          <h2 className="text-2xl font-semibold">{title}</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-4xl font-bold">{value}</span>
            {comparison !== undefined && (
              <span
                className={`mt-2 ${comparison >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {comparison >= 0 ? '↑' : '↓'} {Math.abs(comparison)}% vs
                yesterday
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

const SalesChart: React.FC<{ data: { hour: number; sales: number }[] }> = ({
  data,
}) => {
  const chartData = {
    labels: data.map((item) => `${item.hour}:00`),
    datasets: [
      {
        label: 'Sales',
        data: data.map((item) => item.sales),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <Card className="w-full h-full" shadow='lg'>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Sales by Hour</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="h-80">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Hourly Sales',
                },
              },
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

const TopSellingBooks: React.FC<{ books: BookWithThumbnail[] }> = ({
  books,
}) => {
  return (
    <Card className="w-full h-full" shadow='lg'>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Top Selling Books</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-4 flex flex-col">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-16 relative">
                <Image
                  src={book.thumbnail}
                  alt={book.title}
                  className="object-cover rounded"
                  fill
                  objectFit='cover'
                />
              </div>
              <div>
                <h3 className="font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.authors}</p>
                <p className="text-sm font-medium">
                  ${(book.price ?? 0).toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default TodaySalesSummaryPage;
