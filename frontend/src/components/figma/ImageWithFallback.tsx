import { useState } from 'react';

/**
 * Image component with fallback support
 */
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  return <img {...props} onError={handleError} />;
}
