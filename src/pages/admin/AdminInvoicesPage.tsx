import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function AdminInvoicesPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gold mb-8">Admin Invoices</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">Invoice management system coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
