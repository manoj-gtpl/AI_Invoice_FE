'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DocumentUpload } from '../Components/documents_upload';
import { Button } from '../Components/ui/button';
import { Card } from '../Components/ui/card';
import { FileSpreadsheet, Loader2, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
// import * as XLSX from 'xlsx';

interface ProcessedData {
  fileName: string;
  data: any[];
}

export default function Home() {
  const [allDocFiles, setAllDocFiles] = useState<File[]>([]);
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);

  const handleFilesAdded = (files: File[], section: 'all' | 'excel') => {
    if (section === 'all') {
      setAllDocFiles((prev) => [...prev, ...files]);
      toast.success(`${files.length} file(s) added to All Documents`);
    } else {
      const validExcelFiles = files.filter((file) => {
        const isValid =
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls') ||
          file.name.endsWith('.csv');
        if (!isValid) {
          toast.error(`${file.name} is not a valid Excel file`);
        }
        return isValid;
      });
      if (validExcelFiles.length > 0) {
        setExcelFiles((prev) => [...prev, ...validExcelFiles]);
        toast.success(`${validExcelFiles.length} Excel file(s) added`);
      }
    }
  };

  const removeFile = (index: number, section: 'all' | 'excel') => {
    if (section === 'all') {
      setAllDocFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setExcelFiles((prev) => prev.filter((_, i) => i !== index));
    }
    toast.info('File removed');
  };


  const processDocuments = async () => {
    if (allDocFiles.length === 0 && excelFiles.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    if (excelFiles.length === 0) {
      toast.error('Please upload at least one Excel file to fill the data');
      return;
    }

    setIsProcessing(true);
    const processed: ProcessedData[] = [];

    try {
      const formData = new FormData();
      allDocFiles.forEach((file) => formData.append("invoice", file));
      // excelFiles.forEach((file) => formData.append("excel", file)); // send only first one ideally
      if (excelFiles.length > 0) {
        formData.append("excel", excelFiles[0]);
      }

      const res = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Server error while processing documents");
        return;
      }
      
      toast.success(result.message);

      // Auto-download updated Excel
      if (result.updated_excel_path) {
        const a = document.createElement("a");
        a.href = result.updated_excel_path;
        a.download = "Updated_Invoice_Data.xlsx";
        a.click();
      }

      toast.success('Documents processed and Excel file updated!');
    } catch (error) {
      toast.error('Error processing documents');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  

  const totalFiles = allDocFiles.length + excelFiles.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Image
                src="/moneyverse_logo.svg"
                alt="Moneyverse.ai Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <h1 className="text-3xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Moneyverse.ai
              </h1>
            </div>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Transform your documents into structured data effortlessly. Upload files from multiple sources, process them instantly, and get a comprehensive Excel report with all your data organized in one place.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <DocumentUpload
              title="All Documents"
              description="Upload any type of document (.pdf, .doc, .txt, .xlsx, etc.)"
              acceptedTypes="*"
              section="all"
              onFilesAdded={handleFilesAdded}
              files={allDocFiles}
              onRemoveFile={(index) => removeFile(index, 'all')}
            />

            <DocumentUpload
              title="Excel Files"
              description="Upload Excel files where data will be consolidated (.xlsx, .xls, .csv)"
              acceptedTypes=".xlsx,.xls,.csv"
              section="excel"
              onFilesAdded={handleFilesAdded}
              files={excelFiles}
              onRemoveFile={(index) => removeFile(index, 'excel')}
            />
          </div>

          {totalFiles > 0 && (
            <Card className="p-6 mb-8 bg-white/90 backdrop-blur-xl shadow-xl border-2 border-indigo-100">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                    <FileSpreadsheet className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-slate-900">
                      {totalFiles} {totalFiles === 1 ? 'file' : 'files'} ready
                    </p>
                    <p className="text-sm text-slate-600">
                      {allDocFiles.length} documents • {excelFiles.length} Excel file{excelFiles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={processDocuments}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full lg:w-auto bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Process Documents
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {totalFiles === 0 && (
            <Card className="p-16 text-center bg-white/80 backdrop-blur-xl shadow-xl border-2 border-slate-200">
              <div className="max-w-md mx-auto">
                <div className="bg-linear-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileSpreadsheet className="w-12 h-12 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Ready to Process Documents</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Upload your documents to get started. Add files to both sections and click Process to consolidate everything into a single Excel file.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
