// components/crm/Recommendations.tsx

import React, { useState, useEffect } from 'react';
import { fetchRecommendations } from '@/utils/supabase/customerApi'; // Correct import for fetching recommendations
import Loading from '@/components/Loading';

interface RecommendationsProps {
  customerId: string;
}

const Recommendations: React.FC<RecommendationsProps> = ({ customerId }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await fetchRecommendations(customerId);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [customerId]);

  if (isLoading) {
    return <Loading />;
  }

  if (recommendations.length === 0) {
    return <p>No recommendations available.</p>;
  }

  return (
    <div className="recommendations">
      <h2 className="text-xl font-bold">Recommendations</h2>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>
            <p><strong>Product:</strong> {rec.product_name}</p>
            <p><strong>Category:</strong> {rec.category}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
