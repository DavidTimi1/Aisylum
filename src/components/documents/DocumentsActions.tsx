import React from 'react';
import { Filter, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortBy: 'date' | 'name';
  setSortBy: (v: 'date' | 'name') => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DocumentsActions: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onUpload,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'name')}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Recent First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>

        <label htmlFor="file-upload">
          <Button asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </span>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.txt,.docx,image/*"
          onChange={onUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default DocumentsActions;
