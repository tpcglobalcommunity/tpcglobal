import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function AdminHomePage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gold mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">0</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">0</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">0</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
