
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  Truck,
  ClipboardCheck,
  User,
  Calendar
} from "lucide-react";

const InventoryWorkflow = () => {
  const [activeWorkflows, setActiveWorkflows] = useState([
    {
      id: 'wf-001',
      type: 'Purchase Order',
      product: 'Paracetamol 500mg',
      status: 'pending-approval',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-01-20',
      steps: [
        { name: 'Create PO', status: 'completed', assignee: 'Admin' },
        { name: 'Manager Approval', status: 'in-progress', assignee: 'Manager' },
        { name: 'Supplier Confirmation', status: 'pending', assignee: 'Supplier' },
        { name: 'Receive Goods', status: 'pending', assignee: 'Warehouse' },
        { name: 'Update Inventory', status: 'pending', assignee: 'System' }
      ]
    },
    {
      id: 'wf-002',
      type: 'Stock Adjustment',
      product: 'Ibuprofen 200mg',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Jane Smith',
      dueDate: '2024-01-18',
      steps: [
        { name: 'Physical Count', status: 'completed', assignee: 'Staff' },
        { name: 'Verify Discrepancy', status: 'in-progress', assignee: 'Supervisor' },
        { name: 'Manager Approval', status: 'pending', assignee: 'Manager' },
        { name: 'Update System', status: 'pending', assignee: 'Admin' }
      ]
    },
    {
      id: 'wf-003',
      type: 'Low Stock Alert',
      product: 'Antibiotics Mix',
      status: 'new',
      priority: 'urgent',
      assignee: 'Unassigned',
      dueDate: '2024-01-16',
      steps: [
        { name: 'Check Stock Level', status: 'completed', assignee: 'System' },
        { name: 'Generate Alert', status: 'completed', assignee: 'System' },
        { name: 'Review Requirement', status: 'pending', assignee: 'Manager' },
        { name: 'Place Order', status: 'pending', assignee: 'Procurement' }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Inventory Workflows</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{activeWorkflows.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeWorkflows.filter(w => w.status === 'pending-approval').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <ClipboardCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeWorkflows.filter(w => w.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeWorkflows.filter(w => w.priority === 'urgent').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeWorkflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{workflow.type}</CardTitle>
                      <p className="text-sm text-gray-600">{workflow.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(workflow.priority)}>
                      {workflow.priority}
                    </Badge>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Workflow Progress</h4>
                    <div className="space-y-3">
                      {workflow.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {getStatusIcon(step.status)}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{step.name}</p>
                            <p className="text-xs text-gray-600">Assigned to: {step.assignee}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Workflow Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Assignee:</span>
                        <span>{workflow.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Due Date:</span>
                        <span>{workflow.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Workflow className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">ID:</span>
                        <span>{workflow.id}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No completed workflows to display.</p>
            <p className="text-sm">Completed workflows will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Purchase Order Workflow', description: 'Standard PO approval process', icon: Package },
              { name: 'Stock Adjustment', description: 'Inventory count reconciliation', icon: ClipboardCheck },
              { name: 'Low Stock Alert', description: 'Automated reorder process', icon: AlertCircle },
              { name: 'Expiry Management', description: 'Product expiry tracking', icon: Calendar },
              { name: 'Supplier Onboarding', description: 'New supplier setup', icon: Truck },
              { name: 'Quality Check', description: 'Product quality assurance', icon: CheckCircle }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <template.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <Button size="sm" variant="outline" className="mt-3">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryWorkflow;
