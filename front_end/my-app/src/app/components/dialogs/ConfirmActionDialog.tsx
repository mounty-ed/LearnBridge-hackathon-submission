'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  content?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmColor?: 'primary' | 'secondary' | 'error';
}

export default function ConfirmActionDialog({
  open,
  title,
  content,
  onClose,
  onConfirm,
  confirmColor = 'error',
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      {content && (
        <DialogContent>
          <DialogContentText>
            {content}
          </DialogContentText>
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={confirmColor}
        >
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
