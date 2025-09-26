
import { Loader2, Package, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner = ({ size = "md", text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export const PageLoading = ({ title = "Loading", description = "Please wait while we load your data..." }: PageLoadingProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-3 rounded-2xl">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-2">{description}</p>
            </div>
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

export const TableLoading = ({ rows = 5, columns = 4 }: TableLoadingProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState = ({ 
  title = "Something went wrong", 
  description = "We encountered an error while loading your data.", 
  onRetry,
  showRetry = true 
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="bg-red-100 p-3 rounded-full">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const EmptyState = ({ title, description, action, icon }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {icon && <div className="text-gray-400">{icon}</div>}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const ButtonLoading = ({ children, isLoading, ...props }: any) => (
  <Button disabled={isLoading} {...props}>
    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </Button>
);
