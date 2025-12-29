import { useState } from 'react';
import { Eye, Trash2, Loader2, Building2, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    useAdminInquiries,
    useUpdateInquiryStatus,
    useDeleteInquiry,
    BulkInquiry,
    INQUIRY_STATUSES
} from '@/hooks/useInquiries';

// Format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export function InquiriesManager() {
    const { data: inquiries, isLoading } = useAdminInquiries();
    const updateStatus = useUpdateInquiryStatus();
    const deleteInquiry = useDeleteInquiry();
    const { toast } = useToast();

    const [selectedInquiry, setSelectedInquiry] = useState<BulkInquiry | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const getStatusInfo = (status: string) => {
        return INQUIRY_STATUSES.find(s => s.value === status) || INQUIRY_STATUSES[0];
    };

    const handleStatusChange = async (inquiryId: string, newStatus: string) => {
        try {
            await updateStatus.mutateAsync({ inquiryId, status: newStatus });
            toast({ title: `Inquiry status updated to ${newStatus}` });
        } catch (error) {
            toast({ title: 'Failed to update inquiry status', variant: 'destructive' });
        }
    };

    const handleViewDetails = (inquiry: BulkInquiry) => {
        setSelectedInquiry(inquiry);
        setIsDetailsOpen(true);
    };

    const handleDelete = async (inquiryId: string, companyName: string) => {
        if (confirm(`Delete inquiry from "${companyName}"?`)) {
            try {
                await deleteInquiry.mutateAsync(inquiryId);
                toast({ title: 'Inquiry deleted' });
            } catch (error) {
                toast({ title: 'Failed to delete inquiry', variant: 'destructive' });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                    Bulk Order Inquiries
                </h2>
                <div className="text-sm text-muted-foreground">
                    {inquiries?.length || 0} total inquiries
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Volume</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries?.map((inquiry) => {
                                const statusInfo = getStatusInfo(inquiry.status);
                                return (
                                    <tr key={inquiry.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium text-foreground">{inquiry.company_name}</div>
                                                <div className="text-xs text-muted-foreground">{inquiry.business_type}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium text-foreground">{inquiry.contact_name}</div>
                                                <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {inquiry.estimated_volume || 'Not specified'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Select
                                                value={inquiry.status}
                                                onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                                            >
                                                <SelectTrigger className={`w-32 h-8 text-xs ${statusInfo.color}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {INQUIRY_STATUSES.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                            {formatDate(inquiry.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(inquiry)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(inquiry.id, inquiry.company_name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {inquiries?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No bulk inquiries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inquiry Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {selectedInquiry?.company_name}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInquiry && (
                        <div className="space-y-5 py-4">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedInquiry.status).color}`}>
                                    {getStatusInfo(selectedInquiry.status).label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatDate(selectedInquiry.created_at)}
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Company Name</Label>
                                        <div className="font-medium">{selectedInquiry.company_name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Business Type</Label>
                                        <div className="font-medium">{selectedInquiry.business_type || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Contact Details</Label>
                                <div className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-primary">
                                                {selectedInquiry.contact_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium">{selectedInquiry.contact_name}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                                                {selectedInquiry.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">
                                                {selectedInquiry.phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Inquiry Details */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Inquiry Details</Label>
                                <div className="p-4 border rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Estimated Volume</Label>
                                            <div className="font-medium">{selectedInquiry.estimated_volume || 'Not specified'}</div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Products Interested</Label>
                                            <div className="font-medium">{selectedInquiry.products_interested || 'Not specified'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            {selectedInquiry.message && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Message
                                    </Label>
                                    <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                                        {selectedInquiry.message}
                                    </div>
                                </div>
                            )}

                            {/* Update Status */}
                            <div className="flex items-center gap-4 pt-4 border-t">
                                <Label>Update Status:</Label>
                                <Select
                                    value={selectedInquiry.status}
                                    onValueChange={(value) => {
                                        handleStatusChange(selectedInquiry.id, value);
                                        setSelectedInquiry({ ...selectedInquiry, status: value });
                                    }}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INQUIRY_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
