import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBarcodeApi } from "@/hooks/useBarcodeApi";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ApiFileUploadProps {
  onFileUploaded: (data: any[]) => void;
  onDirectGeneration?: (files: string[], pdfFile?: string) => void;
}

export function ApiFileUpload({ onFileUploaded, onDirectGeneration }: ApiFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [useDirectGeneration, setUseDirectGeneration] = useState(false);
  const [pdfGridCols, setPdfGridCols] = useState(5);
  const [pdfGridRows, setPdfGridRows] = useState(12);

  const {
    isLoading: isGenerating,
    uploadExcelAndGenerate,
    generatedFiles,
    pdfFile,
  } = useBarcodeApi();

  const processExcelFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Process the data
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];
      
      const processedData = rows.map((row, index) => {
        const obj: any = { id: index + 1 };
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        return obj;
      }).filter(obj => Object.values(obj).some(value => value !== '' && value !== null));

      setUploadedFileName(file.name);
      setUploadStatus('success');
      onFileUploaded(processedData);
      
      toast.success(`Successfully processed ${processedData.length} records from ${file.name}`);
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus('error');
      toast.error('Failed to process Excel file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFileUploaded]);

  const handleDirectGeneration = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      console.log('🚀 Starting direct generation for file:', file.name);
      const response = await uploadExcelAndGenerate(file, {
        createPdf: true,
        pdfGridCols,
        pdfGridRows,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedFileName(file.name);
      setUploadStatus('success');
      
      console.log('✅ Direct generation response:', response);
      toast.success(`Successfully generated barcodes from ${file.name}`);
      
      // Use the response data directly instead of the hook state
      if (response && response.generated_files) {
        onDirectGeneration?.(response.generated_files, response.pdf_file || undefined);
      } else {
        console.error('❌ Invalid response structure:', response);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Error generating barcodes:', error);
      setUploadStatus('error');
      toast.error(`Failed to generate barcodes: ${error.message || error}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [uploadExcelAndGenerate, pdfGridCols, pdfGridRows, onDirectGeneration]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (useDirectGeneration) {
      handleDirectGeneration(file);
    } else {
      processExcelFile(file);
    }
  }, [useDirectGeneration, handleDirectGeneration, processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadedFileName('');
    setUploadProgress(0);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Excel File Upload
        </CardTitle>
        <CardDescription>
          Upload your Excel file to process data or generate barcodes directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Mode Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="direct-generation"
              checked={useDirectGeneration}
              onCheckedChange={setUseDirectGeneration}
            />
            <Label htmlFor="direct-generation">Direct Barcode Generation</Label>
          </div>
          
          {useDirectGeneration && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Direct Generation Mode</span>
              </div>
              <p className="text-sm text-blue-700">
                Upload Excel file and generate barcodes directly via API. No data preview needed.
              </p>
            </div>
          )}

          {!useDirectGeneration && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Data Preview Mode</span>
              </div>
              <p className="text-sm text-green-700">
                Upload Excel file to preview data and select which records to generate barcodes for.
              </p>
            </div>
          )}
        </div>

        {/* PDF Settings for Direct Generation */}
        {useDirectGeneration && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">PDF Grid Settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-cols" className="text-xs">Columns</Label>
                <Input
                  id="pdf-cols"
                  type="number"
                  min="1"
                  max="10"
                  value={pdfGridCols}
                  onChange={(e) => setPdfGridCols(parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf-rows" className="text-xs">Rows</Label>
                <Input
                  id="pdf-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={pdfGridRows}
                  onChange={(e) => setPdfGridRows(parseInt(e.target.value) || 12)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : uploadStatus === 'success' 
                ? 'border-green-300 bg-green-50' 
                : uploadStatus === 'error'
                  ? 'border-red-300 bg-red-50'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {useDirectGeneration ? 'Generating barcodes...' : 'Processing file...'}
                </p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-800">
                  {useDirectGeneration ? 'Barcodes generated successfully!' : 'File processed successfully!'}
                </p>
                <p className="text-xs text-green-600">{uploadedFileName}</p>
                {useDirectGeneration && (
                  <div className="flex justify-center gap-2">
                    <Badge variant="secondary">{generatedFiles.length} PNG files</Badge>
                    {pdfFile && <Badge variant="secondary">1 PDF file</Badge>}
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={resetUpload}>
                  Upload Another File
                </Button>
              </div>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800">Upload failed</p>
                <p className="text-xs text-red-600">Please try again</p>
                <Button size="sm" variant="outline" onClick={resetUpload}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive 
                    ? 'Drop your Excel file here' 
                    : 'Drag & drop your Excel file here, or click to select'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .xlsx and .xls files
                </p>
                {useDirectGeneration && (
                  <p className="text-xs text-blue-600 font-medium">
                    Will generate barcodes directly via API
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* File Requirements */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Expected columns:</strong> imei, box_id, model, product, color, dn</p>
          <p><strong>Note:</strong> The 'product' column will be used to automatically extract colors</p>
        </div>
      </CardContent>
    </Card>
  );
}
