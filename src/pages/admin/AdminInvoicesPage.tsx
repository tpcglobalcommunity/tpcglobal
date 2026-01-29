import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Search
} from "lucide-react";
import { 
  getConfirmedInvoices,
  getAllInvoices,
  adminApproveInvoice,
  adminRejectInvoice,
  type AdminInvoiceResult,
  type ApproveInvoiceRequest,
  type RejectInvoiceRequest
} from "@/lib/rpc/admin";

const AdminInvoicesPage = () => {
  const { t } = useI18n();
  
  const [invoices, setInvoices] = useState<AdminInvoiceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("CONFIRMED");
  const [filterStage, setFilterStage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [processingInvoice, setProcessingInvoice] = useState<string | null>(null);
  
  // Approval/Rejection states
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; invoice: AdminInvoiceResult | null }>({ open: false, invoice: null });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; invoice: AdminInvoiceResult | null }>({ open: false, invoice: null });
  const [txHash, setTxHash] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");

  useEffect(() => {
    loadInvoices();
  }, [filterStatus, filterStage]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = filterStatus === "CONFIRMED" 
        ? await getConfirmedInvoices()
        : await getAllInvoices(filterStatus || undefined, filterStage || undefined);
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'CONFIRMED': return 'bg-blue-500';
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSolscanLink = (txHash: string) => {
    return `https://solscan.io/tx/${txHash}`;
  };

  const handleApprove = async () => {
    if (!approveDialog.invoice || !txHash.trim()) {
      toast.error("Transaction hash is required");
      return;
    }

    setProcessingInvoice(approveDialog.invoice.invoice_no);
    try {
      const request: ApproveInvoiceRequest = {
        invoice_no: approveDialog.invoice.invoice_no,
        tx_hash: txHash.trim(),
        admin_note: adminNote.trim() || undefined
      };

      const result = await adminApproveInvoice(request);
      if (result) {
        toast.success("Invoice approved successfully!");
        setApproveDialog({ open: false, invoice: null });
        setTxHash("");
        setAdminNote("");
        loadInvoices();
      } else {
        toast.error("Failed to approve invoice");
      }
    } catch (error) {
      console.error("Failed to approve invoice:", error);
      toast.error("Failed to approve invoice");
    } finally {
      setProcessingInvoice(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.invoice || !adminNote.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setProcessingInvoice(rejectDialog.invoice.invoice_no);
    try {
      const request: RejectInvoiceRequest = {
        invoice_no: rejectDialog.invoice.invoice_no,
        admin_note: adminNote.trim()
      };

      const result = await adminRejectInvoice(request);
      if (result) {
        toast.success("Invoice rejected successfully!");
        setRejectDialog({ open: false, invoice: null });
        setAdminNote("");
        loadInvoices();
      } else {
        toast.error("Failed to reject invoice");
      }
    } catch (error) {
      console.error("Failed to reject invoice:", error);
      toast.error("Failed to reject invoice");
    } finally {
      setProcessingInvoice(null);
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.buyer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold mb-2">Invoice Management</h1>
            <p className="text-muted-foreground">Manage and approve TPC purchase invoices</p>
          </div>
          <Button onClick={loadInvoices} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">Confirmed (Pending Approval)</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Stage</Label>
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stage1">Stage 1</SelectItem>
                    <SelectItem value="stage2">Stage 2</SelectItem>
                    <SelectItem value="">All stages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice number or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{invoice.invoice_no}</h3>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <Badge variant="outline">{invoice.stage.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.buyer_email}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">{invoice.tpc_amount.toLocaleString()} TPC</div>
                          <div className="text-sm text-muted-foreground">${invoice.total_usd}</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <div>{formatDate(invoice.created_at)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confirmed:</span>
                          <div>{formatDate(invoice.confirmed_at)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment Method:</span>
                          <div>{invoice.payment_method}</div>
                        </div>
                      </div>

                      {invoice.tx_hash && (
                        <div className="mb-4">
                          <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-sm bg-muted p-2 rounded flex-1">
                              {invoice.tx_hash}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={getSolscanLink(invoice.tx_hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {invoice.admin_note && (
                        <Alert className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Admin Note:</strong> {invoice.admin_note}
                          </AlertDescription>
                        </Alert>
                      )}

                      {invoice.status === 'CONFIRMED' && (
                        <div className="flex gap-2">
                          <Dialog open={approveDialog.open && approveDialog.invoice?.id === invoice.id} onOpenChange={(open) => setApproveDialog({ open, invoice: open ? invoice : null })}>
                            <DialogTrigger asChild>
                              <Button disabled={processingInvoice === invoice.invoice_no}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve Invoice {invoice.invoice_no}</DialogTitle>
                                <DialogDescription>
                                  Enter the transaction hash for the TPC transfer
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="tx-hash">Transaction Hash *</Label>
                                  <Input
                                    id="tx-hash"
                                    placeholder="Enter Solana transaction hash"
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="admin-note">Admin Note (Optional)</Label>
                                  <Textarea
                                    id="admin-note"
                                    placeholder="Add any notes about this approval"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleApprove} disabled={processingInvoice === invoice.invoice_no}>
                                    {processingInvoice === invoice.invoice_no ? "Processing..." : "Approve Invoice"}
                                  </Button>
                                  <Button variant="outline" onClick={() => setApproveDialog({ open: false, invoice: null })}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={rejectDialog.open && rejectDialog.invoice?.id === invoice.id} onOpenChange={(open) => setRejectDialog({ open, invoice: open ? invoice : null })}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" disabled={processingInvoice === invoice.invoice_no}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Invoice {invoice.invoice_no}</DialogTitle>
                                <DialogDescription>
                                  Provide a reason for rejecting this invoice
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reject-reason">Rejection Reason *</Label>
                                  <Textarea
                                    id="reject-reason"
                                    placeholder="Explain why this invoice is being rejected"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="destructive" onClick={handleReject} disabled={processingInvoice === invoice.invoice_no}>
                                    {processingInvoice === invoice.invoice_no ? "Processing..." : "Reject Invoice"}
                                  </Button>
                                  <Button variant="outline" onClick={() => setRejectDialog({ open: false, invoice: null })}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PremiumShell>
  );
};

export default AdminInvoicesPage;
