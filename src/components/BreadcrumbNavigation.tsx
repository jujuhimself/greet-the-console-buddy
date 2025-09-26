import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  '/': { label: 'Home' },
  '/pharmacy': { label: 'Dashboard' },
  '/individual': { label: 'Dashboard' },
  '/wholesale': { label: 'Dashboard' },
  '/admin': { label: 'Admin Panel' },
  '/products': { label: 'Products', parent: '/pharmacy' },
  '/cart': { label: 'Shopping Cart', parent: '/pharmacy' },
  '/orders': { label: 'Orders', parent: '/pharmacy' },
  '/inventory-management': { label: 'Inventory Management', parent: '/pharmacy' },
  '/prescription-management': { label: 'Prescription Management', parent: '/pharmacy' },
  '/credit-request': { label: 'Credit Request', parent: '/pharmacy' },
  '/credit-management': { label: 'Credit Management', parent: '/pharmacy' },
  '/business-center': { label: 'Business Center', parent: '/pharmacy' },
  '/business-tools': { label: 'Business Tools', parent: '/pharmacy' },
  '/wholesale-ordering': { label: 'Wholesale Ordering', parent: '/pharmacy' },
  '/staff': { label: 'Staff Management', parent: '/pharmacy' },
  '/credit': { label: 'Credit/CRM Management', parent: '/pharmacy' },
  '/inventory-adjustments': { label: 'Inventory Adjustments', parent: '/pharmacy' },
  '/audit': { label: 'Audit Reports', parent: '/pharmacy' },
  '/pharmacy-directory': { label: 'Find Pharmacies', parent: '/individual' },
  '/lab-directory': { label: 'Find Labs', parent: '/individual' },
  '/prescriptions': { label: 'My Prescriptions', parent: '/individual' },
  '/wholesale/inventory': { label: 'Inventory', parent: '/wholesale' },
  '/wholesale/orders': { label: 'Orders', parent: '/wholesale' },
  '/wholesale/retailers': { label: 'Retailers', parent: '/wholesale' },
  '/wholesale/analytics': { label: 'Analytics', parent: '/wholesale' },
};

export const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const buildBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentPath = '';
    
    // Always include home
    breadcrumbs.push({
      path: '/',
      label: 'Home',
      isLast: false
    });
    
    // Build path segments
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = breadcrumbConfig[currentPath];
      
      if (config) {
        breadcrumbs.push({
          path: currentPath,
          label: config.label,
          isLast: index === pathSegments.length - 1
        });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page only
  }

  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="font-medium">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={crumb.path}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      {index === 0 && <Home className="h-4 w-4" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
