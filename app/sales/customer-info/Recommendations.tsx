import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

interface Recommendation {
  id: string;
  product_name: string;
}

export default function Recommendations({ customerId }: { customerId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]); // Explicitly typing the state

  useEffect(() => {
    const fetchRecommendations = async () => {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error fetching recommendations:', error);
      } else {
        setRecommendations(data || []); // TypeScript now knows this is an array of Recommendation
      }
    };

    fetchRecommendations();
  }, [customerId]);

  return (
    <div>
      <h4>Personalized Recommendations</h4>
      {recommendations.map((recommendation) => (
        <div key={recommendation.id}>
          {recommendation.product_name}
        </div>
      ))}
    </div>
  );
}