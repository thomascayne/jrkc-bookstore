// app/sales/customer-info/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import { UserProfile } from '@/interfaces/UserProfile';
import CustomerDetails from './CustomerDetails';

const CustomerInfoPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { openFullScreenModal } = useFullScreenModal();

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

    const loadCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        setCustomers(data || []);
      }
    };

    checkUser();
    loadCustomers();
  }, [router, supabase.auth]);

  const handleRowClick = (customer: UserProfile, e: React.MouseEvent) => {
    e.preventDefault();
    openFullScreenModal(
      <CustomerDetails customerId={customer.id} />,  // Pass only customerId
      `${customer.first_name} ${customer.last_name}`
    );
  };

  const pages = Math.ceil(customers.length / rowsPerPage);
  const items = customers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Customer Information</h1>

      <Table aria-label="Customer Info Table">
        <TableHeader>
          <TableColumn>Customer ID</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
          <TableColumn>Email</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((customer, index) => (
            <TableRow
              key={`${customer.id}-${customer.first_name}-${index}`}
              onClick={(e) => handleRowClick(customer, e)}
              className="cursor-pointer hover:bg-gray-200 transition-colors duration-250"
            >
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.first_name}</TableCell>
              <TableCell>{customer.last_name}</TableCell>
              <TableCell>{customer.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4">
        <Pagination total={pages} page={page} onChange={setPage} />
      </div>
    </div>
  );
};

export default CustomerInfoPage;
