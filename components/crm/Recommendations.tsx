// components/crm/Recommendations.tsx

import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from '@/utils/supabase/customerApi'; // Corrected import for fetching recommendations
import Loading from '@/components/Loading'; // Corrected import for Loading component

interface RecommendationsProps {
  customerId: string; // Explicitly typed customerId
}

/**
 * Recommendations component fetches and displays product recommendations for a customer.
 * @param {RecommendationsProps} props - The props for this component, including the customerId.
 */
const Recommendations: React.FC<RecommendationsProps> = ({ customerId }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]); // Storing recommendations
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getRecommendations = async () => {
      try {
        const recommendationData = await fetchRecommendations(customerId); // Fetching recommendations using customerId
        setRecommendations(recommendationData || []); // Ensuring recommendations is never null
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getRecommendations();
  }, [customerId]);

  if (isLoading) {
    return <Loading containerClass="w-full h-full" />;
  }

  if (!recommendations.length) {
    return <p>No recommendations available.</p>;
  }

  return (
    <div className="recommendations">
      <h2 className="text-lg font-bold">Product Recommendations</h2>
      <ul>
        {recommendations.map((rec: any) => ( // Explicitly typing rec
          <li key={rec.id} className="mb-2">
            <p><strong>Product:</strong> {rec.product_name}</p>
            <p><strong>Price:</strong> ${rec.price.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
