// app/sales/customer-info/Recommendations.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

interface Recommendation {
  id: string;
  product_name: string;
}

export default function Recommendations({ customerId }: { customerId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error fetching recommendations:', error);
      } else {
        setRecommendations(data);
      }
    };

    fetchRecommendations();
  }, [customerId]);

  return (
    <div>
      <h3>Recommended Products</h3>
      {recommendations.length > 0 ? (
        <ul>
          {recommendations.map((recommendation) => (
            <li key={recommendation.id}>
              {recommendation.product_name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No recommendations available.</p>
      )}
    </div>
  );
}
