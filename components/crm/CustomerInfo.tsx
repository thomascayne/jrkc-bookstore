<<<<<<< HEAD
// components/crm/CustomerInfo.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchCustomers } from '@/utils/supabase/customerApi'; // Import the API method
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  shipping_street_address1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zipcode: string;
}

export default function CustomerInfo() {
  const [customers, setCustomers] = useState<Customer[]>([]);
=======
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client'; // Import your Supabase client
import CustomerDetailsModal from '@/components/crm/CustomerDetailsModal';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function CustomerInfo() {
  const [profile, setProfile] = useState<UserProfile | null>(null); // Expecting a single user profile or null
>>>>>>> c6ce44c (Customer info partially working)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers from the API
  useEffect(() => {
<<<<<<< HEAD
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
=======
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      // Replace 'user_id' with the actual user ID logic (if applicable)
      const userId = 'your-user-id'; // You might be getting this from the session or props

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId); // Fetching based on the user's ID

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setProfile(data[0]); // Set the first item in the array to the state
        } else {
          setProfile(null); // No profile found
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error.message);
        setError('Error fetching user profile');
>>>>>>> c6ce44c (Customer info partially working)
      } finally {
        setIsLoading(false);
      }
    };
<<<<<<< HEAD
    loadCustomers();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="customer-info">
      <h2 className="text-2xl font-bold">Customer Information</h2>
      <Table aria-label="Customer Details Table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
          <TableColumn>Phone</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Shipping Address</TableColumn>
          <TableColumn>City</TableColumn>
          <TableColumn>State</TableColumn>
          <TableColumn>Zip Code</TableColumn>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.first_name}</TableCell>
              <TableCell>{customer.last_name}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.shipping_street_address1}</TableCell>
              <TableCell>{customer.shipping_city}</TableCell>
              <TableCell>{customer.shipping_state}</TableCell>
              <TableCell>{customer.shipping_zipcode}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
=======

    fetchProfile();
  }, []); // Run once on mount

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!profile) {
    return <p>No user profile found.</p>;
  }

  return (
    <div className="customer-info-page">
      <h1 className="text-2xl font-bold">Customer Information</h1>
      <ul>
        <li>ID: {profile.id}</li>
        <li>First Name: {profile.first_name}</li>
        <li>Last Name: {profile.last_name}</li>
        <li>Email: {profile.email}</li>
      </ul>

      {/* Example of using the modal to show more customer details */}
      <CustomerDetailsModal
        isOpen={!!profile}
        onClose={() => setProfile(null)}
        customer={profile}
      />
>>>>>>> c6ce44c (Customer info partially working)
    </div>
  );
}
