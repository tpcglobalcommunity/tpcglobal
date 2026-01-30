import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Shield, Users } from "lucide-react";
import { listAdminWhitelist, addAdminToWhitelist, removeAdminFromWhitelist, AdminWhitelistEntry } from "@/lib/rpc/adminWhitelist";
import { logger } from "@/lib/logger";

const AdminSettingsPage = () => {
  const { t } = useI18n();
  const [adminList, setAdminList] = useState<AdminWhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load admin whitelist
  const loadAdminList = async () => {
    try {
      setLoading(true);
      const admins = await listAdminWhitelist();
      setAdminList(admins);
    } catch (error) {
      logger.error("Failed to load admin whitelist", error);
      toast.error("Failed to load admin whitelist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminList();
  }, []);

  // Add admin to whitelist
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserId.trim()) {
      toast.error("User ID is required");
      return;
    }

    try {
      setSubmitting(true);
      await addAdminToWhitelist(newUserId.trim(), newNote.trim() || undefined);
      
      toast.success("Admin added to whitelist successfully");
      setNewUserId("");
      setNewNote("");
      await loadAdminList();
    } catch (error) {
      logger.error("Failed to add admin", error);
      toast.error("Failed to add admin to whitelist");
    } finally {
      setSubmitting(false);
    }
  };

  // Remove admin from whitelist
  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this admin from the whitelist?")) {
      return;
    }

    try {
      setSubmitting(true);
      await removeAdminFromWhitelist(userId);
      
      toast.success("Admin removed from whitelist successfully");
      await loadAdminList();
    } catch (error) {
      logger.error("Failed to remove admin", error);
      toast.error("Failed to remove admin from whitelist");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app section-spacing">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-gold">Admin Settings</h1>
        </div>

        {/* Admin Whitelist Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin Whitelist Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Admin Form */}
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium mb-2">
                    User UUID
                  </label>
                  <Input
                    id="userId"
                    type="text"
                    placeholder="Enter user UUID"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="note" className="block text-sm font-medium mb-2">
                    Note (Optional)
                  </label>
                  <Input
                    id="note"
                    type="text"
                    placeholder="Admin role or note"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    disabled={submitting || !newUserId.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {submitting ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Admin List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Admin Whitelist</h3>
              
              {loading ? (
                <div className="text-center py-8">Loading admin list...</div>
              ) : adminList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No admins in whitelist
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User UUID</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Added Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminList.map((admin) => (
                        <TableRow key={admin.user_id}>
                          <TableCell className="font-mono text-xs">
                            {admin.user_id}
                          </TableCell>
                          <TableCell>
                            {admin.note || <span className="text-muted-foreground">No note</span>}
                          </TableCell>
                          <TableCell>
                            {new Date(admin.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveAdmin(admin.user_id)}
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enter the user UUID to add them to the admin whitelist</li>
                <li>• All admin actions are logged for audit purposes</li>
                <li>• Admins cannot remove themselves from the whitelist</li>
                <li>• Changes take effect immediately</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
