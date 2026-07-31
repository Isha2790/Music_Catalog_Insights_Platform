'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 16 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(star)}
          onClick={() => !readOnly && onChange?.(star === value ? null : star)}
          className={`transition-transform ${readOnly ? '' : 'hover:scale-125 cursor-pointer'}`}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            width={size}
            height={size}
            className={display >= star ? 'fill-amber text-amber' : 'fill-none text-ink-faint'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
