'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  title: string;
  description: string;
  acceptedTypes: string;
  section: 'all' | 'excel';
  onFilesAdded: (files: File[], section: 'all' | 'excel') => void;
  files: File[];
  onRemoveFile: (index: number) => void;
}

export function DocumentUpload({
  title,
  description,
  acceptedTypes,
  section,
  onFilesAdded,
  files,
  onRemoveFile,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesAdded(droppedFiles, section);
    },
    [onFilesAdded, section]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        onFilesAdded(selectedFiles, section);
      }
    },
    [onFilesAdded, section]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="h-full bg-white/90 backdrop-blur shadow-lg border-2 border-indigo-100 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</CardTitle>
        <CardDescription className="text-slate-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-105'
              : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/30'
          )}
        >
          <input
            type="file"
            id={`file-upload-${section}`}
            className="hidden"
            onChange={handleFileInput}
            accept={acceptedTypes}
            multiple
          />
          <label htmlFor={`file-upload-${section}`} className="cursor-pointer block">
            <div className="bg-linear-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-base font-semibold mb-2 text-slate-900">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500">
              {acceptedTypes === '.xlsx,.xls,.csv' ? 'Excel files only (.xlsx, .xls, .csv)' : 'All document types supported'}
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Uploaded Files ({files.length})</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg group hover:shadow-md transition-all border border-indigo-100"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-sm">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
