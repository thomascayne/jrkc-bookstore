'use client';

import { useEffect, useState } from 'react'; // React hooks for managing state and side effects
import { UserProfile } from '@/interfaces/UserProfile'; // Importing UserProfile interface
import { fetchCustomersServerSide } from '@/utils/supabase/fetchCustomers'; // Function to fetch customers from Supabase

// Main component for the Customer Information page
const CustomerInfoPage = () => {
  // State variables
  const [customers, setCustomers] = useState<UserProfile[]>([]); // Array to store customer data
  const [loading, setLoading] = useState(true); // Boolean to track loading state
  const [error, setError] = useState<string | null>(null); // String to store any error message

  // useEffect hook to fetch customers when the component is mounted
  useEffect(() => {
    console.log('Fetching customers...'); // Debugging log to indicate data fetching process

    // Async function to fetch customers
    const getCustomers = async () => {
      try {
        const data = await fetchCustomersServerSide(); // Fetch customers from Supabase
        console.log('Fetched Customers:', data); // Debugging log to show fetched data

        // Check if data is available and has customers
        if (data && data.length > 0) {
          setCustomers(data); // Update state with customer data
        } else {
          console.error('No customers found or data is empty'); // Log an error if no customers found
          setError('No customers found'); // Update error state if no customers are found
        }
      } catch (err) {
        console.error('Error fetching customers:', err); // Log any errors caught during fetching
        setError('Failed to fetch customers'); // Update error state in case of failure
      }
      setLoading(false); // Mark loading as complete
    };

    // Call the async function to fetch customers
    getCustomers();
  }, []); // Empty dependency array ensures this effect only runs once after the component mounts

  // Conditional rendering: Display loading message while fetching data
  if (loading) {
    return <div>Loading customers...</div>;
  }

  // Conditional rendering: Display error message if there's an error
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Rendering the main content: Display table of customers if data is available
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Customer Information</h1>

      {/* If no customers are found, display a message */}
      {customers.length === 0 ? (
        <div>No customers found.</div>
      ) : (
        // Table displaying customer information
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Customer ID</th>
              <th className="px-4 py-2">First Name</th>
              <th className="px-4 py-2">Last Name</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {/* Map through the customers array and display each customer */}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="border px-4 py-2">{customer.id}</td>
                <td className="border px-4 py-2">{customer.first_name}</td>
                <td className="border px-4 py-2">{customer.last_name}</td>
                <td className="border px-4 py-2">{customer.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerInfoPage;
