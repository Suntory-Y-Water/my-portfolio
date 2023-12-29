import React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  cancelText: string;
}

const AlertDialogComponent: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  description,
  cancelText,
}) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onClose()}>{cancelText}</AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default AlertDialogComponent;
