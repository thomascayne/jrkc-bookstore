// app/sales/customer-info/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { supabase } from '@/utils/supabase/client';
import { fetchCustomers } from '@/utils/supabase/customerApi'; // Adjust the path to customerApi.ts accordingly
import CustomerList from './CustomerList';
import CustomerDetails from './CustomerDetails';
import PurchaseHistory from './PurchaseHistory';
import Recommendations from './Recommendations';
import { UserProfile } from '@/interfaces/UserProfile'; // Import the UserProfile interface

const CustomerInfoPage = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);

    const handleCustomerSelect = (customer: UserProfile) => {
        setSelectedCustomer(customer);
    };

    const router = useRouter(); // Instantiate router

    const checkUserRole = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
      
        if (session) {
          console.log("User's roles:", session.user.app_metadata.roles);
          return session.user;
        } else {
          console.error("No user signed in", error);
          return null;
        }
      };
      
      useEffect(() => {
        const loadUser = async () => {
          const user = await checkUserRole();
          if (!user) {
            // If no user is signed in, redirect to login page
            router.push('/signin');
          } else {
            // Proceed with fetching customer data
            fetchCustomers();
          }
        };
      
        loadUser();
      }, []);
    
    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Customer Information</h1>
            <CustomerList onSelectCustomer={handleCustomerSelect} />

            {selectedCustomer && (
                <div>
                    <CustomerDetails customer={selectedCustomer} />
                    <PurchaseHistory customerId={selectedCustomer.id} />
                    <Recommendations customerId={selectedCustomer.id} />
                </div>
            )}
        </div>
    );
};

export default CustomerInfoPage;
