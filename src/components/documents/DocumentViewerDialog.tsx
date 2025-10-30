import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Eye,
  FileDown,
  Languages,
  Loader2,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Document } from '@/pages/Documents';

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  document: Document;
  processing: { isProcessing: boolean };
  targetLanguage: string;
  setTargetLanguage: (v: string) => void;
  onSummarize: (doc: Document) => void;
  onTranslate: (doc: Document, lang: string) => void;
}

const formatFileSize = (bytes: number): string =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString();

const DocumentViewerDialog: React.FC<Props> = ({
  open,
  setOpen,
  document,
  processing,
  targetLanguage,
  setTargetLanguage,
  onSummarize,
  onTranslate,
}) => {
  const [activeTab, setActiveTab] = useState<'original' | 'summary' | 'translation'>('original');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className='montserrat-font'>{document.name}</DialogTitle>
          <DialogDescription>
            {formatFileSize(document.size)} • Last modified {formatDate(document.lastModified)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2 border-b border-foreground/10">
            {['original', 'summary', 'translation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium montserrat-font transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {tab === 'original' && <Eye className="h-4 w-4 inline mr-2" />}
                {tab === 'summary' && <FileDown className="h-4 w-4 inline mr-2" />}
                {tab === 'translation' && <Languages className="h-4 w-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'summary' && document.summary && ' ✓'}
                {tab === 'translation' && document.translation && ' ✓'}
              </button>
            ))}
          </div>

          <div className="bg-background/50 rounded-lg p-6 max-h-96 overflow-y-auto">
            {activeTab === 'original' && (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {document.extractedText || 'No text extracted.'}
              </p>
            )}

            {activeTab === 'summary' && (
              document.summary ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">{document.summary}</p>
              ) : (
                <div className="text-center py-8">
                  <FileDown className="h-12 w-12 mx-auto mb-3 text-foreground/20" />
                  <p className="text-foreground/60 mb-4">No summary yet</p>
                  <Button
                    onClick={() => onSummarize(document)}
                    disabled={processing.isProcessing}
                  >
                    {processing.isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Summarizing...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4 mr-2" /> Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              )
            )}

            {activeTab === 'translation' && (
              document.translation ? (
                <div>
                  <div className="mb-4 text-xs text-foreground/60">
                    Translated to: {document.targetLanguage?.toUpperCase()}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {document.translation}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Languages className="h-12 w-12 mx-auto mb-3 text-foreground/20" />
                  <p className="text-foreground/60 mb-4">No translation available yet</p>
                  <div className="flex items-center justify-center gap-3">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => onTranslate(document, targetLanguage)}
                      disabled={processing.isProcessing}
                    >
                      {processing.isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Translating...
                        </>
                      ) : (
                        <>
                          <Languages className="h-4 w-4 mr-2" /> Translate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>

          {activeTab === 'original' && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => onSummarize(document)}
                disabled={processing.isProcessing || !document.extractedText}
              >
                <FileDown className="h-4 w-4 mr-2" /> Summarize
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('translation')}
                disabled={processing.isProcessing || !document.extractedText}
              >
                <Languages className="h-4 w-4 mr-2" /> Translate
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
