'use client';

import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from '@/utils/supabase/customerApi';
import Loading from '@/components/Loading';

interface RecommendationsProps {
  customerId: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
}

export default function Recommendations({
  customerId,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerRecommendations = async () => {
      try {
        setIsLoading(true);

        const data = await fetchRecommendations(customerId); // Using the correct function
        setRecommendations(data || []);
      } catch (error: any) {
        console.error('Error fetching recommendations:', error.message);
        setError('Error fetching recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerRecommendations();
  }, [customerId]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!recommendations.length) {
    return <p>No recommendations found.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Recommendations</h2>
      <ul>
        {recommendations.map((recommendation) => (
          <li key={recommendation.id}>
            <strong>Title:</strong> {recommendation.title}
            <br />
            <strong>Description:</strong> {recommendation.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
