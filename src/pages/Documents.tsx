import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DocumentsHeader from '@/components/documents/DocumentsHeader';
import DocumentsActions from '@/components/documents/DocumentsActions';
import DocumentsList from '@/components/documents/DocumentsList';
import UploadDialog from '@/components/documents/UploadDialog';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import { getAllDocuments, saveDocument, deleteDocument } from '@/lib/db';
import { extractTextFromFile } from '@/lib/text-extraction';
import useActivityStore from '@/stores/activityStore';
import { createRegularSummary } from '@/stores/summarizerStore';
import { rewriteClearly } from '@/stores/rewriteStore';
import { autoTranslate } from '@/stores/languageStore';

// Type definition
export interface Document {
  id: number;
  name: string;
  size: number;
  lastModified: number;
  extractedText?: string;
  summary?: string;
  translation?: string;
  targetLanguage?: string;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const [processing, setProcessing] = useState({
    isProcessing: false,
    stage: '',
    progress: 0,
    error: '',
  });

  const [targetLanguage, setTargetLanguage] = useState('es');
  const { addDocumentActivity, documentActivity, removeDocumentActivity } = useActivityStore();

  useEffect(() => {
    (async () => {
      const docs = await getAllDocuments();
      setDocuments(docs.sort((a, b) => b.lastModified - a.lastModified));
    })();
  }, []);


  const filteredDocs = documents
    .filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : b.lastModified - a.lastModified
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <DocumentsHeader />
      <DocumentsActions
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onUpload={handleUpload}
      />
      <DocumentsList
        documents={filteredDocs}
        onView={(doc) => {
          setSelectedDoc(doc);
          setViewerDialogOpen(true);
        }}
        onDelete={handleDelete}
        onUpload={handleUpload}
      />

      {/* Upload progress dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        startRefining={handleRefineClick}
        setOpen={setUploadDialogOpen}
        processing={processing}
      />

      {/* Document viewer */}
      {selectedDoc && (
        <DocumentViewerDialog
          open={viewerDialogOpen}
          setOpen={setViewerDialogOpen}
          document={selectedDoc}
          processing={processing}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          onSummarize={handleSummarize}
          onTranslate={handleTranslate}
        />
      )}
    </div>
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
  
    Array.from(files).forEach(async (file) => {
      setUploadDialogOpen(true);
      setProcessing({ isProcessing: true, stage: 'extracting', progress: 20, error: '' });
  
      try {
        const text = await extractText(file);
        const newDoc: Document = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          extractedText: text,
        };

        const docId = await saveDocument(newDoc);

        // log activity
        addDocumentActivity(docId, file.name, 'Uploaded');

        setDocuments((prev) => [newDoc, ...prev]);
        toast.success(`Uploaded ${file.name}`);
        setProcessing({ isProcessing: false, stage: 'complete', progress: 100, error: '' });

      } catch (err: any) {
        console.error(err);
        setProcessing({ ...processing, isProcessing: false, error: 'Failed to process file' });
      }
    });
  }

  function handleRefineClick() {
    
  }
  
  async function extractText(file: File){
    const extractedText = await extractTextFromFile(file);
    return extractedText;
  }
  
  async function handleSummarize(doc: Document) {
    setProcessing({ isProcessing: true, stage: 'summarizing', progress: 30, error: '' });
  
    try {
      const summary = await createRegularSummary( doc?.extractedText );
      const updatedDoc = { ...doc, summary };
      await saveDocument(updatedDoc);

      // log activity
      addDocumentActivity(doc.id, doc.name, 'Summarized');

      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updatedDoc : d)));
      setSelectedDoc(updatedDoc);
      toast.success('Summary generated');

    } catch {
      toast.error('Failed to summarize');

    } finally {
      setProcessing({ isProcessing: false, stage: '', progress: 100, error: '' });
    }
  }
  
  async function handleTranslate(doc: Document, lang: string) {
    setProcessing({ isProcessing: true, stage: 'translating', progress: 40, error: '' });

    if (!doc?.extractedText) return
  
    try {
      const { translation } = await autoTranslate( doc.extractedText, lang );
      const updatedDoc = { ...doc, translation, targetLanguage: lang };
      await saveDocument(updatedDoc);

      // log activity
      addDocumentActivity(doc.id, doc.name, 'Transalated');

      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updatedDoc : d)));
      setSelectedDoc(updatedDoc);
      toast.success('Translation complete');

    } catch {
      toast.error('Failed to translate');

    } finally {
      setProcessing({ isProcessing: false, stage: '', progress: 100, error: '' });
    }
  }
  
  async function handleDelete(id: number) {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    // log activity
    if ( documentActivity?.docId === id ){
      removeDocumentActivity(id);
    }
    toast.success('Document deleted');
  }
  
};

export default DocumentsPage;
