
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'page' | 'card' | 'inline' | 'table';
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'inline',
  message = 'Loading...',
  className
}) => {
  if (variant === 'page') {
    return (
      <div className={cn("min-h-screen flex items-center justify-center bg-gray-50", className)}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-gray-600">{message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
