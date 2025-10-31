import React from 'react';
import { Clock, FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Document } from '@/pages/Documents';

interface Props {
  documents: Document[];
  onView: (doc: Document) => void;
  onDelete: (id: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const DocumentsList: React.FC<Props> = ({ documents, onView, onDelete, onUpload }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16 bg-background/50 rounded-xl border border-foreground/10">
        <FileText className="h-16 w-16 mx-auto mb-4 text-foreground/20" />
        <h3 className="text-xl font-semibold text-foreground montserrat-font mb-2">No documents yet</h3>
        <p className="text-foreground/60 mb-6">Upload your first document to get started</p>
        <label htmlFor="file-upload-empty">
          <Button asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </span>
          </Button>
        </label>
        <input
          id="file-upload-empty"
          type="file"
          multiple
          accept=".pdf,.txt,.docx,image/*"
          onChange={onUpload}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-background/50 rounded-xl border border-foreground/10 p-4 hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => onView(doc)}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1 truncate">{doc.name}</h3>
              <p className="text-sm text-foreground/60 line-clamp-2 mb-2">
                {doc.extractedText
                  ? doc.extractedText.substring(0, 150) + '...'
                  : 'No text extracted'}
              </p>
              <div className="flex items-center gap-4 text-xs text-foreground/50">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(doc.lastModified)}
                </span>
                <span>{formatFileSize(doc.size)}</span>
                {doc.summary && <span className="text-primary">• Summarized</span>}
                {doc.translation && <span className="text-primary">• Translated</span>}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              className="text-foreground/40 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsList;
