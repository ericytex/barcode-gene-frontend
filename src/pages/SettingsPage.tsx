import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Key, Shield, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your barcode generation preferences and system settings
          </p>
        </div>

        {/* API Settings */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Manage your API connection and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Base URL</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value="http://localhost:8000" 
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                    readOnly
                  />
                  <Badge variant="secondary">Connected</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key Status</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="password" 
                    value="••••••••••••••••" 
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                    readOnly
                  />
                  <Badge variant="secondary">Valid</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
              <Button variant="outline" size="sm">
                Reset API Key
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and privacy options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">File Upload Security</h4>
                  <p className="text-sm text-muted-foreground">Validate uploaded files</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">CORS Protection</h4>
                  <p className="text-sm text-muted-foreground">Control cross-origin requests</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barcode Settings */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Barcode Generation Settings
            </CardTitle>
            <CardDescription>
              Customize default barcode generation options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Default PDF Grid</span>
                  <Button variant="outline" size="sm">5x12</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-generate IMEI2</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Resolution</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Default Font Size</span>
                  <Button variant="outline" size="sm">Medium</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Barcode Style</span>
                  <Button variant="outline" size="sm">Standard</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Color Scheme</span>
                  <Button variant="outline" size="sm">Default</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your data and storage settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Auto-cleanup Generated Files</h4>
                  <p className="text-sm text-muted-foreground">Remove old files automatically</p>
                </div>
                <Button variant="outline" size="sm">7 days</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Backup Generated Files</h4>
                  <p className="text-sm text-muted-foreground">Keep copies of generated files</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Log Generation History</h4>
                  <p className="text-sm text-muted-foreground">Track all generation activities</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                Clear Cache
              </Button>
              <Button variant="outline" size="sm">
                Export Settings
              </Button>
              <Button variant="outline" size="sm">
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
