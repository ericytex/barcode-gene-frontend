/**
 * API service for connecting to the Barcode Generator API
 */

// Function to get API configuration with robust fallbacks
function getApiConfig() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const envApiKey = import.meta.env.VITE_API_KEY;
  
  // Debug all environment variables
  console.log('🔧 Environment Variables:', {
    VITE_API_BASE_URL: envBaseUrl,
    VITE_API_KEY: envApiKey,
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    allEnv: import.meta.env
  });
  
  // Determine the correct base URL with multiple fallback strategies
  let baseUrl: string;
  
  // Strategy 1: Use environment variable if it exists and is valid
  if (envBaseUrl && envBaseUrl.startsWith('http')) {
    baseUrl = envBaseUrl;
    console.log('✅ Using environment VITE_API_BASE_URL:', baseUrl);
  } else {
    // Strategy 2: Detect environment and use appropriate fallback
    const isProduction = import.meta.env.PROD || 
                       window.location.hostname.includes('vercel.app') ||
                       window.location.hostname.includes('barcode-gene-frontend');
    
    if (isProduction) {
      baseUrl = 'https://194.163.134.129:8034';
      console.log('🏭 Production fallback (detected via hostname):', baseUrl);
    } else {
      baseUrl = 'https://194.163.134.129:8034';
      console.log('💻 Development fallback:', baseUrl);
    }
  }
  
  const apiKey = envApiKey || 'frontend-api-key-12345';
  
  console.log('🎯 Final API Configuration:', {
    baseUrl,
    apiKey,
    source: envBaseUrl && envBaseUrl.startsWith('http') ? 'environment' : 'fallback',
    hostname: window.location.hostname
  });
  
  return { baseUrl, apiKey };
}

const { baseUrl: API_BASE_URL, apiKey: API_KEY } = getApiConfig();

export interface BarcodeItem {
  imei: string;
  box_id?: string;
  model: string;
  product?: string;
  color?: string;
  dn?: string;
}

export interface BarcodeGenerationRequest {
  items: BarcodeItem[];
  create_pdf?: boolean;
  pdf_grid_cols?: number;
  pdf_grid_rows?: number;
  auto_generate_second_imei?: boolean;
}

export interface BarcodeGenerationResponse {
  success: boolean;
  message: string;
  generated_files: string[];
  pdf_file?: string;
  total_items: number;
  timestamp: string;
}

export interface FileInfo {
  filename: string;
  size: number;
  created: string;
  modified: string;
  mime_type: string;
}

export interface DatabaseFileInfo {
  id: number;
  filename: string;
  file_path: string;
  archive_path: string;
  file_type: 'png' | 'pdf';
  file_size: number;
  created_at: string;
  archived_at: string;
  generation_session: string;
  imei?: string;
  box_id?: string;
  model?: string;
  product?: string;
  color?: string;
  dn?: string;
  created_timestamp: string;
}

export interface DatabaseFilesResponse {
  success: boolean;
  files: DatabaseFileInfo[];
  total_count: number;
}

export interface ArchiveSession {
  id: number;
  session_id: string;
  created_at: string;
  total_files: number;
  png_count: number;
  pdf_count: number;
  total_size: number;
  excel_filename?: string;
  notes?: string;
  created_timestamp: string;
}

export interface ArchiveSessionsResponse {
  success: boolean;
  sessions: ArchiveSession[];
}

export interface ArchiveStatistics {
  total_files: number;
  png_count: number;
  pdf_count: number;
  total_size: number;
  total_sessions: number;
}

export interface ArchiveStatsResponse {
  success: boolean;
  statistics: ArchiveStatistics;
}

export interface FileListResponse {
  success: boolean;
  files: FileInfo[];
  total_count: number;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = API_BASE_URL, apiKey: string = API_KEY) {
    console.log('🏗️ ApiService Constructor:', {
      passedBaseUrl: baseUrl,
      API_BASE_URL: API_BASE_URL,
      passedApiKey: apiKey,
      API_KEY: API_KEY
    });
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    console.log('✅ ApiService initialized with baseUrl:', this.baseUrl);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Debug URL construction
    console.log('🔗 URL Construction:', {
      baseUrl: this.baseUrl,
      endpoint: endpoint,
      finalUrl: url
    });
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    };

    // Log requests in development
    if (import.meta.env.VITE_LOG_REQUESTS === 'true') {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
    }

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific security errors
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        throw new Error(errorData.detail || 'Invalid request. Please check your data.');
      }
      
      throw new Error(
        errorData.detail || errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    try {
      const jsonResponse = await response.json();
      console.log('🔍 Parsed JSON response:', jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error('❌ Failed to parse JSON response:', error);
      console.error('❌ Response text:', await response.text());
      throw new Error('Failed to parse server response');
    }
  }

  /**
   * Generate barcodes from JSON data
   */
  async generateBarcodes(request: BarcodeGenerationRequest): Promise<BarcodeGenerationResponse> {
    return this.request<BarcodeGenerationResponse>('/barcodes/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Upload Excel file and generate barcodes
   */
  async uploadExcelAndGenerate(
    file: File,
    createPdf: boolean = true,
    pdfGridCols: number = 5,
    pdfGridRows: number = 12,
    autoGenerateSecondImei: boolean = true
  ): Promise<BarcodeGenerationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('create_pdf', createPdf.toString());
    formData.append('pdf_grid_cols', pdfGridCols.toString());
    formData.append('pdf_grid_rows', pdfGridRows.toString());
    formData.append('auto_generate_second_imei', autoGenerateSecondImei.toString());

    console.log('📤 Uploading Excel file:', file.name);
    console.log('📤 FormData contents:', {
      createPdf,
      pdfGridCols,
      pdfGridRows,
      autoGenerateSecondImei
    });

    const response = await this.request<BarcodeGenerationResponse>('/barcodes/upload-excel', {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        // Don't set Content-Type, let browser set it for FormData
      },
      body: formData,
    });

    console.log('📥 Upload response:', response);
    console.log('📥 Response type:', typeof response);
    console.log('📥 Response keys:', response ? Object.keys(response) : 'undefined');
    return response;
  }

  /**
   * List all generated files (legacy file system)
   */
  async listFiles(): Promise<FileListResponse> {
    return this.request<FileListResponse>('/barcodes/list');
  }

  /**
   * Get all files from database with metadata
   */
  async getDatabaseFiles(): Promise<DatabaseFilesResponse> {
    return this.request<DatabaseFilesResponse>('/database/files');
  }

  /**
   * Get files from a specific archive session
   */
  async getSessionFiles(sessionId: string): Promise<DatabaseFilesResponse> {
    return this.request<DatabaseFilesResponse>(`/archive/session/${sessionId}/files`);
  }

  /**
   * Get recent archive sessions
   */
  async getArchiveSessions(limit: number = 10): Promise<ArchiveSessionsResponse> {
    return this.request<ArchiveSessionsResponse>(`/archive/sessions?limit=${limit}`);
  }

  /**
   * Get archive statistics
   */
  async getArchiveStatistics(): Promise<ArchiveStatsResponse> {
    return this.request<ArchiveStatsResponse>('/archive/statistics');
  }

  /**
   * Get specific file by filename
   */
  async getFileByName(filename: string): Promise<{ success: boolean; file: DatabaseFileInfo }> {
    return this.request<{ success: boolean; file: DatabaseFileInfo }>(`/database/file/${filename}`);
  }

  /**
   * Download a PNG file
   */
  async downloadBarcodeFile(filename: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/barcodes/download/${filename}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your API key.');
      }
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    return response.blob();
  }

  /**
   * Download a PDF file
   */
  async downloadPdfFile(filename: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/barcodes/download-pdf/${filename}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your API key.');
      }
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    
    return response.blob();
  }

  /**
   * Get a direct URL for viewing a PDF in-browser
   * Note: This won't work with API key authentication in browser
   * Use downloadPdfFile() method instead for authenticated downloads
   */
  getPdfUrl(filename: string): string {
    return `${this.baseUrl}/barcodes/download-pdf/${filename}`;
  }

  /**
   * Get a direct URL for viewing/downloading a PNG in-browser
   * Note: This won't work with API key authentication in browser
   * Use downloadBarcodeFile() method instead for authenticated downloads
   */
  getPngUrl(filename: string): string {
    return `${this.baseUrl}/barcodes/download/${filename}`;
  }

  /**
   * Create an authenticated image URL for preview
   * This creates a blob URL from the authenticated download
   */
  async getAuthenticatedImageUrl(filename: string): Promise<string> {
    try {
      const blob = await this.downloadBarcodeFile(filename);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to create authenticated image URL:', error);
      throw error;
    }
  }

  /**
   * Create an authenticated PDF URL for preview
   * This creates a blob URL from the authenticated download
   */
  async getAuthenticatedPdfUrl(filename: string): Promise<string> {
    try {
      const blob = await this.downloadPdfFile(filename);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to create authenticated PDF URL:', error);
      throw error;
    }
  }

  /**
   * Create PDF from existing barcodes
   */
  async createPdfFromExisting(
    gridCols: number = 5,
    gridRows: number = 12,
    pdfFilename?: string
  ): Promise<BarcodeGenerationResponse> {
    const params = new URLSearchParams({
      grid_cols: gridCols.toString(),
      grid_rows: gridRows.toString(),
    });

    if (pdfFilename) {
      params.append('pdf_filename', pdfFilename);
    }

    return this.request<BarcodeGenerationResponse>(`/barcodes/create-pdf?${params}`, {
      method: 'POST',
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; version: string; uptime: string }> {
    return this.request('/health');
  }

  /**
   * Download file and trigger browser download
   */
  async downloadFile(filename: string, isPdf: boolean = false): Promise<void> {
    try {
      const blob = isPdf 
        ? await this.downloadPdfFile(filename)
        : await this.downloadBarcodeFile(filename);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export the class for testing
export { ApiService };

// Force cache refresh
