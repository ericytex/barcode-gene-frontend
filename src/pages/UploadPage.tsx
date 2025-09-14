import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useBarcodeApi } from "@/hooks/useBarcodeApi";
import { toast } from "sonner";

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { uploadExcelAndGenerate, isLoading, error } = useBarcodeApi();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadExcelAndGenerate(uploadedFile, {
        createPdf: true,
        pdfGridCols: 5,
        pdfGridRows: 12,
        autoGenerateSecondImei: true
      });
      
      toast.success(`Successfully processed ${uploadedFile.name}! Generated ${result.generated_files.length} barcodes.`);
      setUploadedFile(null);
    } catch (error) {
      toast.error(`Failed to process file: ${error}`);
    } finally {
      setUploading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Upload Excel Files</h1>
          <p className="text-muted-foreground">
            Upload your Excel files to generate barcode labels automatically
          </p>
        </div>

        {/* Upload Section */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              File Upload
            </CardTitle>
            <CardDescription>
              Upload Excel files containing IMEI data and product information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : uploadedFile 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              
              {uploadedFile ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-700">File Selected!</h3>
                  <p className="text-green-600 mb-4">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isDragActive ? 'Drop your Excel file here' : 'Drop your Excel file here'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Supported formats: .xlsx, .xls
                  </p>
                </div>
              )}
              
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (uploadedFile) {
                    handleUpload();
                  }
                }}
                disabled={!uploadedFile || uploading || isLoading}
                className="mt-4"
              >
                {uploading || isLoading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : uploadedFile ? (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Generate Barcodes
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Excel File Requirements
            </CardTitle>
            <CardDescription>
              Ensure your Excel file contains the required columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Required Columns:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• IMEI/SN - Device serial numbers</li>
                  <li>• Model - Device model information</li>
                  <li>• Product - Product description with color</li>
                  <li>• D/N - Drawing number</li>
                  <li>• Box ID - Box identification</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Optional Columns:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Color - Specific color information</li>
                  <li>• Additional metadata</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
