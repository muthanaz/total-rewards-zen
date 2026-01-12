import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  employee: 'Dashboard',
  employer: 'Dashboard',
  housing: 'Housing',
  schooling: 'Education',
  health: 'Health Insurance',
  transport: 'Transport & Mobility',
  wellbeing: 'Wellbeing',
  financial: 'Financial Planning',
  equity: 'Equity & Options',
  learning: 'Learning & Development',
  leave: 'Leave Management',
  marketplace: 'Perks & Partners',
  documents: 'HR Documents',
  'gov-connect': 'Gov Connect',
  profile: 'Smart Profile',
  spend: 'Spend Analytics',
  zombie: 'Zombie Spend',
  segments: 'Employee Segments',
  claims: 'Claims Management',
  policies: 'Policies',
  recommendations: 'Recommendations',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
    >
      <Link 
        to={`/${pathSegments[0]}`}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {breadcrumbs.slice(1).map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          {index === breadcrumbs.length - 2 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
