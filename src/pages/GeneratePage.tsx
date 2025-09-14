import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Play, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GeneratePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Generate Barcodes</h1>
          <p className="text-muted-foreground">
            Generate barcode labels from your validated data
          </p>
        </div>

        {/* Generation Controls */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Barcode Generation
            </CardTitle>
            <CardDescription>
              Configure and start the barcode generation process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Generation Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Generation Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-generate second IMEI</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Create PDF collection</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PDF Grid Layout</span>
                    <Button variant="outline" size="sm">5x12</Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Output Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Individual PNG files</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PDF collection</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High resolution</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button size="lg" className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Generation
              </Button>
              <Button variant="outline" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generation Status */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Generation Status</CardTitle>
            <CardDescription>
              Monitor the progress of your barcode generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground">
                Upload and validate your data to begin barcode generation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Generations */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Recent Generations
            </CardTitle>
            <CardDescription>
              View and download your recently generated barcode collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recent Generations</h3>
              <p className="text-muted-foreground">
                Your generated barcode collections will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
