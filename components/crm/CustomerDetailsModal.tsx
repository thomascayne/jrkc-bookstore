// components/crm/CustomerDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { fetchPurchaseHistory, fetchRecommendations } from '@/utils/supabase/customerApi'; // Import fetch functions

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

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose, customer }) => {
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      // Fetch purchase history and recommendations
      const fetchDetails = async () => {
        setLoading(true);

        try {
          // Fetch both purchase history and recommendations
          const [purchaseHistoryData, recommendationsData] = await Promise.all([
            fetchPurchaseHistory(customer.id),  // Fetch purchase history using customer ID
            fetchRecommendations(customer.id),  // Fetch recommendations using customer ID
          ]);

          // Update state with fetched data
          setPurchaseHistory(purchaseHistoryData);
          setRecommendations(recommendationsData);
        } catch (error) {
          console.error('Error fetching data:', error); // Log any error for debugging
        } finally {
          setLoading(false);  // Set loading to false once data is fetched
        }
      };

      fetchDetails();
    }
  }, [customer]);

  // Return null if modal is not open or customer is null
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
            {/* Display customer information */}
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
