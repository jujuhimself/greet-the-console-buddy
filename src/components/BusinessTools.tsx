import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaStore, FaBoxes, FaClipboardList, FaChartBar } from 'react-icons/fa';

const BusinessTools: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const tools = [
    {
      key: 'staff',
      label: 'Staff Management',
      icon: <FaUsers size={32} />,
      path: '/staff',
      roles: ['retail', 'wholesale'],
    },
    {
      key: 'credit',
      label: 'Credit/CRM',
      icon: <FaStore size={32} />,
      path: user && user.role === 'wholesale' ? '/wholesale/business-tools/credit' : '/credit',
      roles: ['retail', 'wholesale'],
    },
    {
      key: 'adjustments',
      label: 'Inventory Adjustments',
      icon: <FaBoxes size={32} />,
      path: '/inventory-adjustments',
      roles: ['retail', 'wholesale'],
    },
    {
      key: 'audit',
      label: 'Audit Reports',
      icon: <FaClipboardList size={32} />,
      path: '/audit',
      roles: ['retail', 'wholesale'],
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: <FaChartBar size={32} />,
      path: '/analytics',
      roles: ['retail', 'wholesale'],
    },
  ];

  const visibleTools = tools.filter(tool => tool.roles.includes(role));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Business Tools</h1>
      <p className="text-gray-600 mb-6">Enhanced tools to manage your healthcare business efficiently</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {visibleTools.map(tool => (
          <Card key={tool.key} className="flex flex-col items-center p-6 shadow hover:shadow-lg transition cursor-pointer" onClick={() => navigate(tool.path)}>
            <div className="mb-3 text-primary">{tool.icon}</div>
            <div className="font-semibold text-lg mb-1">{tool.label}</div>
            <Button variant="outline" className="mt-2" onClick={e => { e.stopPropagation(); navigate(tool.path); }}>
              Open
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BusinessTools; 