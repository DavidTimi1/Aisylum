import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangleIcon, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  processing: {
    isProcessing: boolean;
    stage: string;
    progress: number;
    error?: string;
  };
}

const UploadDialog: React.FC<Props> = ({ open, setOpen, processing }) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Processing Document</DialogTitle>
        <DialogDescription>
          Please wait while we extract and process your document
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {processing.error ? (
            <div className="border-red-700 bg-red-400 text-red-700 text-sm flex gap-2 items-center rounded-lg">
                <AlertTriangleIcon className="h-5 w-5" />
                <span>{processing.error}</span>
            </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {processing.stage === 'complete' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              <span className="text-sm font-medium">
                {processing.stage === 'uploading' && 'Uploading file...'}
                {processing.stage === 'extracting' && 'Extracting text...'}
                {processing.stage === 'complete' && 'Complete!'}
              </span>
            </div>

            <div className="w-full bg-foreground/10 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${processing.progress}%` }}
              />
            </div>
          </>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default UploadDialog;
