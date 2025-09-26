
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'page' | 'card' | 'inline';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'inline',
  className
}) => {
  const content = (
    <div className="text-center py-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );

  if (variant === 'page') {
    return (
      <div className={cn("min-h-screen flex items-center justify-center bg-gray-50", className)}>
        <div className="max-w-md mx-auto">
          {content}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(className)}>
      {content}
    </div>
  );
};

export default EmptyState;
