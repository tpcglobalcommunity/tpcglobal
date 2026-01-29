import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gold mb-8">Admin Settings</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">Admin settings panel coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
