import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Key, Shield, Palette, Database, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

export default function SettingsPage() {
  const [environmentConfig, setEnvironmentConfig] = useState(apiService.getEnvironmentConfig());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    // Update environment config when component mounts
    setEnvironmentConfig(apiService.getEnvironmentConfig());
  }, []);

  const handleEnvironmentChange = (newEnvironment: string) => {
    if (newEnvironment === 'development') {
      apiService.switchToDevelopment();
    } else if (newEnvironment === 'production') {
      apiService.switchToProduction();
    }
    setEnvironmentConfig(apiService.getEnvironmentConfig());
    setConnectionStatus('disconnected'); // Reset connection status when switching
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    
    try {
      await apiService.healthCheck();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Connection test failed:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };
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
            {/* Environment Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Environment</label>
              <Select value={environmentConfig.environment} onValueChange={handleEnvironmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Development (localhost:8034)
                    </div>
                  </SelectItem>
                  <SelectItem value="production">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Production (194.163.134.129:8034)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Base URL</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={environmentConfig.baseUrl} 
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                    readOnly
                  />
                  {getConnectionBadge()}
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
                  <Badge variant={environmentConfig.isProduction ? "default" : "secondary"}>
                    {environmentConfig.isProduction ? "Production" : "Development"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {getConnectionIcon()}
              <span className="text-sm">
                {connectionStatus === 'connected' ? 'API is reachable' : 
                 connectionStatus === 'testing' ? 'Testing connection...' : 
                 'API connection not tested'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
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

