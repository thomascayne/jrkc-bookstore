<<<<<<< HEAD
// components/crm/Recommendations.tsx

import React, { useState, useEffect } from 'react';
import { fetchRecommendations } from '@/utils/supabase/customerApi'; // Correct import for fetching recommendations
=======
'use client';

import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from '@/utils/supabase/customerApi';
>>>>>>> c6ce44c (Customer info partially working)
import Loading from '@/components/Loading';

interface RecommendationsProps {
  customerId: string;
}

<<<<<<< HEAD
const Recommendations: React.FC<RecommendationsProps> = ({ customerId }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
=======
interface Recommendation {
  id: string;
  title: string;
  description: string;
}

export default function Recommendations({
  customerId,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
>>>>>>> c6ce44c (Customer info partially working)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await fetchRecommendations(customerId);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
=======
    const fetchCustomerRecommendations = async () => {
      try {
        setIsLoading(true);

        const data = await fetchRecommendations(customerId); // Using the correct function
        setRecommendations(data || []);
      } catch (error: any) {
        console.error('Error fetching recommendations:', error.message);
        setError('Error fetching recommendations');
>>>>>>> c6ce44c (Customer info partially working)
      } finally {
        setIsLoading(false);
      }
    };

<<<<<<< HEAD
    loadRecommendations();
=======
    fetchCustomerRecommendations();
>>>>>>> c6ce44c (Customer info partially working)
  }, [customerId]);

  if (isLoading) {
    return <Loading />;
<<<<<<< HEAD
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
=======
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
>>>>>>> c6ce44c (Customer info partially working)
          </li>
        ))}
      </ul>
    </div>
  );
}
