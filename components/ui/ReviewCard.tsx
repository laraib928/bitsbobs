import React from 'react';
import { CustomerReview } from '@/lib/data/types';
import { StarIcon } from './Icons';

interface ReviewCardProps {
  review: CustomerReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <figure className="m-0 border border-line rounded-[18px] sm:rounded-[20px] p-5 sm:p-7 flex flex-col gap-4 bg-white w-full h-full">
      <div
        role="img"
        aria-label={`${review.rating} out of 5 stars`}
        className="flex gap-1 text-[#F5B700]"
      >
        {Array.from({ length: review.rating }).map((_, i) => (
          <StarIcon key={i} size={18} className="sm:w-5 sm:h-5" />
        ))}
      </div>
      <blockquote className="m-0 text-[15px] sm:text-[18px] leading-[1.55] text-text-2">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <figcaption className="text-[14px] sm:text-[15px] mt-auto pt-2">
        <strong className="block text-ink">{review.author}</strong>
        <span className="block text-muted">{review.kind}</span>
      </figcaption>
    </figure>
  );
}

