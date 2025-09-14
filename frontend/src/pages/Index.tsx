import { DashboardLayout } from "@/components/DashboardLayout";
import { ApiFileUpload } from "@/components/ApiFileUpload";
import { DataTable } from "@/components/DataTable";
import { ApiBarcodeGenerator } from "@/components/ApiBarcodeGenerator";
import { ApiConnectionTest } from "@/components/ApiConnectionTest";
import { SecurityStatusCard } from "@/components/SecurityStatusCard";
import { AuthenticatedImagePreview, AuthenticatedPdfPreview } from "@/components/AuthenticatedImagePreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { BarChart3, Upload, FileSpreadsheet, Zap, Shield, Download, Eye, Database, Archive } from "lucide-react";
import { apiService } from "@/lib/api";
import { useBarcodeApi } from "@/hooks/useBarcodeApi";
import { toast } from "sonner";

const Index = () => {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [selectedDataForBarcodes, setSelectedDataForBarcodes] = useState<any[]>([]);
  const [directGenerationResults, setDirectGenerationResults] = useState<{
    files: string[];
    pdfFile?: string;
  } | null>(null);

  // Use the barcode API hook
  const { 
    databaseFiles, 
    archiveStatistics, 
    getDatabaseFiles, 
    getArchiveStatistics,
    isLoading: apiLoading 
  } = useBarcodeApi();

  // Load database data on component mount
  useEffect(() => {
    getDatabaseFiles();
    getArchiveStatistics();
  }, [getDatabaseFiles, getArchiveStatistics]);

  const handleFileUploaded = (data: any[]) => {
    setUploadedData(data);
    setSelectedDataForBarcodes([]);
    setDirectGenerationResults(null); // Clear direct generation results when uploading new file
  };

  const handleGenerateBarcodes = (selectedData: any[]) => {
    console.log('handleGenerateBarcodes called with:', selectedData);
    console.log('selectedData length:', selectedData.length);
    console.log('selectedData first item:', selectedData[0]);
    setSelectedDataForBarcodes(selectedData);
    setDirectGenerationResults(null); // Clear direct generation results when using normal flow
    console.log('selectedDataForBarcodes state updated');
  };

  const handleDirectGeneration = (files: string[], pdfFile?: string) => {
    console.log('Direct generation completed:', { files, pdfFile });
    console.log('Files length:', files?.length);
    console.log('PDF file:', pdfFile);
    setDirectGenerationResults({ files, pdfFile });
    setUploadedData([]); // Clear uploaded data when using direct generation
    setSelectedDataForBarcodes([]); // Clear selected data when using direct generation
  };

  const stats = [
    {
      title: "Total Records",
      value: uploadedData.length,
      icon: FileSpreadsheet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Selected for Barcodes",
      value: selectedDataForBarcodes.length,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Generated Barcodes",
      value: archiveStatistics?.total_files || 0,
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "PDF Collections",
      value: archiveStatistics?.pdf_count || 0,
      icon: Download,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 gradient-primary rounded-full animate-pulse-glow"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              BarcodeGen Pro
            </h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transform your Excel data into professional barcodes with our advanced generation system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className="shadow-card card-hover border-0 glass-effect"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground mb-1">
                      {stat.value.toLocaleString()}
                    </p>
                    <div className="h-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                        style={{ 
                          width: stat.value === 0 ? '0%' : 
                                 stat.title === 'Generated Barcodes' ? `${Math.min((stat.value / 1000) * 100, 100)}%` :
                                 stat.title === 'PDF Collections' ? `${Math.min((stat.value / 50) * 100, 100)}%` :
                                 `${Math.min((stat.value / 100) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl gradient-primary floating shadow-glow`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Security Status Card */}
          <Card className="shadow-card card-hover border-0 glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                    API Security
                  </p>
                  <p className="text-lg font-bold text-foreground mb-1">
                    Protected
                  </p>
                  <div className="h-1 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 w-full"></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-green-500 floating shadow-glow">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Statistics */}
        {archiveStatistics && (
          <Card className="shadow-card border-0 glass-effect mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Database Statistics
              </CardTitle>
              <CardDescription>
                Real-time statistics from the barcode generation database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{archiveStatistics.total_files}</div>
                  <div className="text-sm text-muted-foreground">Total Files</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{archiveStatistics.png_count}</div>
                  <div className="text-sm text-muted-foreground">PNG Files</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{archiveStatistics.pdf_count}</div>
                  <div className="text-sm text-muted-foreground">PDF Files</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{archiveStatistics.total_sessions}</div>
                  <div className="text-sm text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(archiveStatistics.total_size / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div className="text-sm text-muted-foreground">Total Size</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Database Files */}
        {databaseFiles.length > 0 && (
          <Card className="shadow-card border-0 glass-effect mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-primary" />
                Recent Generated Files
              </CardTitle>
              <CardDescription>
                Latest barcodes and PDFs from the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {databaseFiles.slice(0, 5).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={file.file_type === 'png' ? 'default' : 'destructive'}>
                        {file.file_type.toUpperCase()}
                      </Badge>
                      <div>
                        <div className="font-medium">{file.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.imei && `IMEI: ${file.imei}`}
                          {file.model && ` • Model: ${file.model}`}
                          {file.color && ` • Color: ${file.color}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(file.file_size / 1024).toFixed(1)}KB
                    </div>
                  </div>
                ))}
                {databaseFiles.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground">
                    And {databaseFiles.length - 5} more files...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Connection Test */}
        <ApiConnectionTest />

        {/* File Upload Section */}
        <ApiFileUpload 
          onFileUploaded={handleFileUploaded}
          onDirectGeneration={handleDirectGeneration}
        />

        {/* Direct Generation Results */}
        {directGenerationResults && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Direct Generation Results
              </CardTitle>
              <CardDescription>
                Your barcodes have been generated successfully via direct API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Generated Files Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">PNG Files</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{directGenerationResults.files.length}</p>
                  <p className="text-sm text-blue-700 mb-3">Individual barcode images</p>
                  <Button
                    onClick={async () => {
                      try {
                        // Download first PNG file as example
                        await apiService.downloadBarcodeFile(directGenerationResults.files[0]);
                        toast.success(`Downloaded ${directGenerationResults.files[0]}`);
                      } catch (error) {
                        toast.error(`Failed to download PNG: ${error}`);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download Sample PNG
                  </Button>
                </div>
                
                {directGenerationResults.pdfFile && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">PDF Collection</span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">{directGenerationResults.pdfFile}</p>
                    <Button
                      onClick={async () => {
                        try {
                          await apiService.downloadPdfFile(directGenerationResults.pdfFile!);
                          toast.success(`Downloaded ${directGenerationResults.pdfFile}`);
                        } catch (error) {
                          toast.error(`Failed to download PDF: ${error}`);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                )}
              </div>

              {/* PDF Preview */}
              {directGenerationResults.pdfFile && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">PDF Preview</Label>
                  <div className="h-[400px] w-full border rounded-md overflow-hidden bg-white">
                    <AuthenticatedPdfPreview
                      filename={directGenerationResults.pdfFile}
                      className="w-full h-full"
                      fallbackText="Loading PDF preview..."
                      onError={(error) => {
                        console.error('PDF preview error:', error);
                        toast.error(`Failed to load PDF preview: ${error.message}`);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Barcode Previews */}
              {directGenerationResults.files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <Label className="text-sm font-medium">Barcode Previews</Label>
                  </div>
                  
                  {/* First Barcode Preview (Large) */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">First Barcode (Large Preview)</Label>
                    <div className="border rounded-lg p-4 bg-white">
                      <AuthenticatedImagePreview
                        filename={directGenerationResults.files[0]}
                        alt={`Barcode preview: ${directGenerationResults.files[0]}`}
                        className="max-w-full max-h-64 object-contain mx-auto"
                        fallbackText="Loading barcode preview..."
                        onError={(error) => {
                          console.error('Barcode preview error:', error);
                          toast.error(`Failed to load barcode preview: ${error.message}`);
                        }}
                      />
                    </div>
                  </div>

                  {/* Multiple Barcode Previews (Grid) */}
                  {directGenerationResults.files.length > 1 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        All Generated Barcodes ({directGenerationResults.files.length} total)
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {directGenerationResults.files.slice(0, 8).map((filename, index) => (
                          <div key={filename} className="border rounded-lg p-2 bg-white">
                            <div className="text-xs text-muted-foreground mb-1">
                              #{index + 1}
                            </div>
                            <AuthenticatedImagePreview
                              filename={filename}
                              alt={`Barcode ${index + 1}: ${filename}`}
                              className="w-full h-24 object-contain"
                              fallbackText="Loading..."
                              onError={(error) => {
                                console.error(`Barcode ${index + 1} preview error:`, error);
                              }}
                            />
                          </div>
                        ))}
                        {directGenerationResults.files.length > 8 && (
                          <div className="border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
                            <div className="text-xs text-muted-foreground text-center">
                              +{directGenerationResults.files.length - 8} more
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Preview Section */}
        {uploadedData.length > 0 && (
          <>
            {/* Debug info */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
              <p className="text-sm text-yellow-700">Uploaded data length: {uploadedData.length}</p>
              <p className="text-sm text-yellow-700">First item: {JSON.stringify(uploadedData[0], null, 2)}</p>
            </div>
          <DataTable 
            data={uploadedData} 
            onGenerateBarcodes={handleGenerateBarcodes}
          />
          </>
        )}

        {/* Barcode Generation Section */}
        {selectedDataForBarcodes.length > 0 && (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Barcode Generation Section:</h3>
              <p className="text-sm text-green-700">selectedDataForBarcodes.length: {selectedDataForBarcodes.length}</p>
              <p className="text-sm text-green-700">First item: {JSON.stringify(selectedDataForBarcodes[0], null, 2)}</p>
            </div>
            <ApiBarcodeGenerator 
            data={selectedDataForBarcodes}
              onBarcodeGenerated={(files) => {
                console.log('Barcodes generated:', files.length);
            }}
          />
          </>
        )}

        {/* Getting Started Guide */}
        {uploadedData.length === 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Follow these simple steps to generate your barcodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-medium mb-2">Upload Excel File</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your Excel file containing the data you want to convert to barcodes
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center text-white mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-medium mb-2">Select Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Preview your data and select the rows you want to generate barcodes for
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-white mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-medium mb-2">Generate & Download</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure barcode settings and download your generated barcodes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
