
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    label: string;
  };
  description?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  description,
  className,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50'
  };

  const iconStyles = {
    default: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600'
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-xs text-gray-500">
                {description}
              </p>
            )}
            {change && (
              <div className="flex items-center mt-2">
                {change.value > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  change.value > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {change.value > 0 ? '+' : ''}{change.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {change.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            iconStyles[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
