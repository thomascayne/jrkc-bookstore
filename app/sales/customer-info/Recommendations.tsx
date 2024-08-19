// app/sales/customer-info/Recommendations.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

interface RecommendationsProps {
    customerId: string;
}

interface Recommendation {
    id: string;
    product_name: string;
}

const Recommendations = ({ customerId }: RecommendationsProps) => {
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
                setRecommendations(data || []);
            }
        };

        fetchRecommendations();
    }, [customerId]);

    if (recommendations.length === 0) {
        return <p>No recommendations found for this customer</p>;
    }

    return (
        <div>
            <h2>Recommended Products</h2>
            <ul>
                {recommendations.map((recommendation) => (
                    <li key={recommendation.id}>{recommendation.product_name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Recommendations;
