// components/StarRating.tsx
"use client";

import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex text-sm">
      {[...Array(maxRating)].map((_, index) => {
        if (index < fullStars) {
          return <FaStar key={index} className="text-yellow-400" />;
        } else if (index === fullStars && hasHalfStar) {
          return <FaStarHalfAlt key={index} className="text-yellow-400" />;
        } else {
          return <FaRegStar key={index} className="text-yellow-400" />;
        }
      })}
    </div>
  );
};

export default StarRating;
