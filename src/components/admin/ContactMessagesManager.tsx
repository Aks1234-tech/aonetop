import { useState } from 'react';
import { Eye, Trash2, Loader2, Mail, Phone, MessageSquare, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    useAdminContactMessages,
    useMarkContactMessageAsRead,
    useDeleteContactMessage,
    ContactMessage,
} from '@/hooks/useContactMessages';

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

export function ContactMessagesManager() {
    const { data: messages, isLoading } = useAdminContactMessages();
    const markAsRead = useMarkContactMessageAsRead();
    const deleteMessage = useDeleteContactMessage();
    const { toast } = useToast();

    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleToggleRead = async (messageId: string, currentReadStatus: boolean) => {
        try {
            await markAsRead.mutateAsync({ messageId, isRead: !currentReadStatus });
            toast({
                title: currentReadStatus ? 'Marked as unread' : 'Marked as read',
            });
        } catch (error) {
            toast({ title: 'Failed to update message status', variant: 'destructive' });
        }
    };

    const handleViewDetails = (message: ContactMessage) => {
        setSelectedMessage(message);
        setIsDetailsOpen(true);

        // Auto-mark as read when viewing
        if (!message.is_read) {
            markAsRead.mutate({ messageId: message.id, isRead: true });
        }
    };

    const handleDelete = async (messageId: string, senderName: string) => {
        if (confirm(`Delete message from "${senderName}"?`)) {
            try {
                await deleteMessage.mutateAsync(messageId);
                toast({ title: 'Message deleted' });
                if (isDetailsOpen && selectedMessage?.id === messageId) {
                    setIsDetailsOpen(false);
                }
            } catch (error) {
                toast({ title: 'Failed to delete message', variant: 'destructive' });
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

    const unreadCount = messages?.filter(m => !m.is_read).length || 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                    Contact Messages
                </h2>
                <div className="flex items-center gap-4">
                    {unreadCount > 0 && (
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {unreadCount} unread
                        </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                        {messages?.length || 0} total messages
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-12"></th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages?.map((message) => (
                                <tr
                                    key={message.id}
                                    className={`border-b border-border last:border-0 hover:bg-muted/10 transition-colors ${!message.is_read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => handleToggleRead(message.id, message.is_read)}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                            title={message.is_read ? 'Mark as unread' : 'Mark as read'}
                                        >
                                            {message.is_read ? (
                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Circle className="h-5 w-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className={`font-medium ${!message.is_read ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                                            {message.name}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-muted-foreground">{message.email}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                                            {message.subject || <span className="italic">No subject</span>}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                        {formatDate(message.created_at)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewDetails(message)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(message.id, message.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {messages?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No contact messages found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Contact Message
                        </DialogTitle>
                    </DialogHeader>

                    {selectedMessage && (
                        <div className="space-y-5 py-4">
                            {/* Status and Date */}
                            <div className="flex items-center justify-between">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMessage.is_read
                                        ? 'bg-muted text-muted-foreground'
                                        : 'bg-primary/10 text-primary'
                                    }`}>
                                    {selectedMessage.is_read ? 'Read' : 'Unread'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatDate(selectedMessage.created_at)}
                                </div>
                            </div>

                            {/* Sender Info */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">From</Label>
                                <div className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-medium text-primary">
                                                {selectedMessage.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium">{selectedMessage.name}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`mailto:${selectedMessage.email}`}
                                                className="text-primary hover:underline"
                                            >
                                                {selectedMessage.email}
                                            </a>
                                        </div>
                                        {selectedMessage.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <a
                                                    href={`tel:${selectedMessage.phone}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {selectedMessage.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Subject */}
                            {selectedMessage.subject && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Subject</Label>
                                    <div className="p-3 bg-muted/30 rounded-lg text-sm font-medium">
                                        {selectedMessage.subject}
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Message</Label>
                                <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.is_read)}
                                    className="flex-1"
                                >
                                    {selectedMessage.is_read ? (
                                        <>
                                            <Circle className="mr-2 h-4 w-4" />
                                            Mark as Unread
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Mark as Read
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(selectedMessage.id, selectedMessage.name)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
