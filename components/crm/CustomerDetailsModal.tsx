// Directory: components/crm/CustomerDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { fetchPurchaseHistory, fetchRecommendations } from '@/utils/supabase/customerApi'; // Import the appropriate API calls

// Define the structure of the Customer and Purchase History interfaces
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

interface PurchaseHistory {
  id: string;
  title: string;
  purchase_date: string;
  price: number;
}

interface Recommendation {
  id: string;
  recommendation: string;
}

// Define the props for the CustomerDetailsModal component
interface CustomerDetailsModalProps {
  isOpen: boolean; // Determines if the modal is open
  onClose: () => void; // Function to close the modal
  customer: Customer | null; // The selected customer details
}

// The CustomerDetailsModal component displays customer details, purchase history, and recommendations
const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose, customer }) => {
  // State to store the fetched purchase history and recommendations
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true); // Loading state

  // useEffect to fetch customer details when the modal opens and a customer is selected
  useEffect(() => {
    if (customer) {
      const fetchDetails = async () => {
        setLoading(true); // Set loading state to true

        try {
          // Fetch both purchase history and recommendations in parallel
          const [purchaseHistoryData, recommendationsData] = await Promise.all([
            fetchPurchaseHistory(customer.id), // Fetch purchase history using customer ID and .rpc protocol
            fetchRecommendations(customer.id), // Fetch recommendations using customer ID and .rpc protocol
          ]);

          // Update state with the fetched data
          setPurchaseHistory(purchaseHistoryData);
          setRecommendations(recommendationsData);
        } catch (error) {
          console.error('Error fetching data:', error); // Log any errors that occur
        } finally {
          setLoading(false); // Stop loading once the data is fetched
        }
      };

      fetchDetails(); // Fetch customer details
    }
  }, [customer]); // Re-run the effect if the customer changes

  // If the modal is not open or no customer is selected, return null
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-lg relative w-3/4 h-3/4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
        <button className="absolute top-4 right-4 text-red-500" onClick={onClose}>
          Close
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Display customer details */}
            <p><strong>First Name:</strong> {customer.first_name}</p>
            <p><strong>Last Name:</strong> {customer.last_name}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Shipping Address:</strong> {customer.shipping_street_address1}</p>
            <p><strong>City:</strong> {customer.shipping_city}</p>
            <p><strong>State:</strong> {customer.shipping_state}</p>
            <p><strong>Zip Code:</strong> {customer.shipping_zipcode}</p>

            {/* Display purchase history */}
            <h3 className="mt-6 text-xl font-semibold">Purchase History</h3>
            {purchaseHistory.length > 0 ? (
              <ul className="list-disc pl-5">
                {purchaseHistory.map((purchase) => (
                  <li key={purchase.id}>
                    {purchase.title} - {new Date(purchase.purchase_date).toLocaleDateString()} - ${purchase.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No purchase history available.</p>
            )}

            {/* Display recommendations */}
            <h3 className="mt-6 text-xl font-semibold">Recommendations</h3>
            {recommendations.length > 0 ? (
              <ul className="list-disc pl-5">
                {recommendations.map((rec) => (
                  <li key={rec.id}>{rec.recommendation}</li>
                ))}
              </ul>
            ) : (
              <p>No recommendations available.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
