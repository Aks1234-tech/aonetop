
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Address } from '@/hooks/useAddresses';
import { Edit2, Trash2, MapPin, Check } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string, type: 'billing' | 'shipping') => void;
    isDeleting?: boolean;
    isSettingDefault?: boolean;
}

export const AddressCard = ({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isDeleting,
    isSettingDefault
}: AddressCardProps) => {
    return (
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${address.is_default ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${address.type === 'billing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                            {address.type}
                        </span>
                        {address.is_default && (
                            <Badge variant="default" className="gap-1 pl-1.5">
                                <Check className="w-3 h-3" />
                                Default
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!address.is_default && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-muted-foreground hover:text-primary"
                                onClick={() => onSetDefault(address.id, address.type)}
                                disabled={isSettingDefault}
                            >
                                Set Default
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => onEdit(address)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this address? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(address.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="space-y-1">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {address.name}
                    </h4>
                    <div className="pl-6 text-sm text-muted-foreground space-y-0.5">
                        <p>{address.phone}</p>
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                        <p>{address.country}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
