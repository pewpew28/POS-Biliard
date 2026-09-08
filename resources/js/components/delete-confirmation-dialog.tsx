import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    itemName,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    onConfirm: (password: string) => void;
}) {
    const [password, setPassword] = useState('');

    const close = () => {
        setPassword('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(value) => value || close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive size-5" />
                        Konfirmasi penghapusan
                    </DialogTitle>
                    <DialogDescription>
                        Data <strong>{itemName}</strong> akan dihapus permanen. Masukkan password Anda untuk melanjutkan.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="delete-password">Password</Label>
                    <Input
                        id="delete-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={close}>Batal</Button>
                    <Button
                        variant="destructive"
                        disabled={!password}
                        onClick={() => {
                            onConfirm(password);
                            close();
                        }}
                    >
                        Hapus Permanen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
