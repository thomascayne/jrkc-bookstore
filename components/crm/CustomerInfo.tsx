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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

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
    </div>
  );
}
