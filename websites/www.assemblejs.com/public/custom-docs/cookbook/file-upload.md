# File Upload & Processing

<iframe src="https://placeholder-for-assemblejs-file-upload-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

This guide provides comprehensive instructions for implementing file upload and processing capabilities in AssembleJS applications.

## Prerequisites

- Basic knowledge of AssembleJS
- Familiarity with FormData API
- Understanding of HTTP multipart requests
- Node.js environment set up for server-side processing

## Implementation

Let's build a complete file upload system including drag-and-drop support, progress tracking, and server-side processing.

### 1. Project Setup

First, create a new AssembleJS project for our file upload implementation:

```bash
# Use the AssembleJS interactive generator to create a new project
npx asm
# Select "Project" from the list
# Enter "file-upload" as the name
# Follow the prompts

# Navigate to the project and install dependencies
cd file-upload
npm install
```

### 2. Create a File Upload Service

Let's create a service to handle file uploads:

```bash
npx asmgen service upload
```

Edit the generated service file:

```typescript
// src/services/upload.service.ts
import { Service } from 'asmbl';

interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
  file: File;
}

interface UploadOptions {
  url: string;
  headers?: Record<string, string>;
  onProgress?: (event: UploadProgressEvent) => void;
  onError?: (error: Error) => void;
  onSuccess?: (response: any) => void;
}

/**
 * Service for handling file uploads with progress tracking
 */
export class UploadService extends Service {
  /**
   * Upload a single file with progress tracking
   */
  async uploadFile(file: File, options: UploadOptions): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.uploadData(formData, options);
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadFiles(files: File[], options: UploadOptions): Promise<any> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });
    
    return this.uploadData(formData, options);
  }

  /**
   * Upload FormData with progress tracking
   */
  private async uploadData(formData: FormData, options: UploadOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progressEvent: UploadProgressEvent = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
            file: formData.get('file') as File
          };
          
          options.onProgress(progressEvent);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          if (options.onSuccess) {
            options.onSuccess(response);
          }
          resolve(response);
        } else {
          const error = new Error(`Upload failed with status ${xhr.status}`);
          if (options.onError) {
            options.onError(error);
          }
          reject(error);
        }
      });
      
      xhr.addEventListener('error', () => {
        const error = new Error('Network error during upload');
        if (options.onError) {
          options.onError(error);
        }
        reject(error);
      });
      
      xhr.open('POST', options.url);
      
      // Add custom headers if provided
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }
      
      xhr.send(formData);
    });
  }

  /**
   * Validate file type and size
   */
  validateFile(file: File, allowedTypes: string[], maxSize: number): { valid: boolean; error?: string } {
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
      };
    }
    
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB` 
      };
    }
    
    return { valid: true };
  }
}
```

### 3. Create File Upload Component with React

Generate a file uploader component:

```bash
npx asmgen component fileUploader basic-uploader --template react
```

Edit the component's view file:

```jsx
// src/components/fileUploader/basic-uploader/basic-uploader.view.jsx
import React, { useState, useRef } from 'react';
import { hooks } from 'asmbl';

export default function BasicUploader({ context }) {
  const { uploadService } = hooks.useService();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    validateAndSetFiles(selectedFiles);
  };

  const validateAndSetFiles = (selectedFiles) => {
    const validFiles = [];
    const newErrors = [];

    selectedFiles.forEach(file => {
      const validation = uploadService.validateFile(file, allowedTypes, maxSize);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setErrors(newErrors);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      validateAndSetFiles(droppedFiles);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setProgress({});
    setUploadResults([]);
    setErrors([]);

    const uploadPromises = files.map(file => 
      uploadService.uploadFile(file, {
        url: '/api/upload',
        onProgress: (progressEvent) => {
          setProgress(prev => ({
            ...prev,
            [file.name]: progressEvent.percentage
          }));
        },
        onSuccess: (response) => {
          setUploadResults(prev => [...prev, { file: file.name, response }]);
        },
        onError: (error) => {
          setErrors(prev => [...prev, `${file.name}: ${error.message}`]);
        }
      })
    );

    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="file-uploader">
      <div 
        className="drop-zone" 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
      >
        <p>Drag files here or click to select</p>
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange} 
          ref={fileInputRef}
          accept={allowedTypes.join(',')}
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                {progress[file.name] !== undefined && (
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${progress[file.name]}%` }}
                    ></div>
                    <span>{progress[file.name]}%</span>
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button 
            type="button" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-list">
          <h3>Errors:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index} className="error">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="result-list">
          <h3>Upload Results:</h3>
          <ul>
            {uploadResults.map((result, index) => (
              <li key={index}>
                {result.file}: {result.response.success ? 'Success' : 'Failed'}
                {result.response.path && (
                  <span> - Path: {result.response.path}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

Update the component's client file:

```typescript
// src/components/fileUploader/basic-uploader/basic-uploader.client.ts
import { BlueprintClient } from 'asmbl';
import { UploadService } from '../../../services/upload.service';

export default class BasicUploaderClient extends BlueprintClient {
  async connect() {
    // Register the upload service
    this.registerService('uploadService', new UploadService());
  }
}
```

Add styles to the component:

```scss
// src/components/fileUploader/basic-uploader/basic-uploader.styles.scss
.file-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  
  .drop-zone {
    border: 2px dashed #3498db;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    margin-bottom: 20px;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(52, 152, 219, 0.05);
    }
    
    p {
      font-size: 18px;
      color: #666;
      margin-bottom: 15px;
    }
    
    input[type="file"] {
      display: block;
      width: 100%;
      margin-top: 10px;
      cursor: pointer;
    }
  }
  
  .file-list {
    margin-top: 20px;
    
    h3 {
      margin-bottom: 10px;
      font-size: 18px;
      font-weight: 500;
    }
    
    ul {
      list-style: none;
      padding: 0;
      
      li {
        background-color: #f8f9fa;
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-left: 4px solid #3498db;
        
        .progress-bar {
          height: 8px;
          width: 100px;
          background-color: #e2e2e2;
          border-radius: 4px;
          overflow: hidden;
          margin: 0 16px;
          position: relative;
          
          .progress {
            height: 100%;
            background-color: #2ecc71;
            transition: width 0.3s ease;
          }
          
          span {
            position: absolute;
            top: -1px;
            right: -25px;
            font-size: 12px;
          }
        }
        
        button {
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          
          &:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
          }
        }
      }
    }
    
    button {
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 16px;
      
      &:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
      }
      
      &:hover:not(:disabled) {
        background-color: #2980b9;
      }
    }
  }
  
  .error-list {
    margin-top: 20px;
    
    h3 {
      margin-bottom: 10px;
      font-size: 18px;
      font-weight: 500;
      color: #e74c3c;
    }
    
    ul {
      list-style: none;
      padding: 0;
      
      li.error {
        background-color: #fff3f3;
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 8px;
        border-left: 4px solid #e74c3c;
        color: #e74c3c;
      }
    }
  }
  
  .result-list {
    margin-top: 20px;
    
    h3 {
      margin-bottom: 10px;
      font-size: 18px;
      font-weight: 500;
    }
    
    ul {
      list-style: none;
      padding: 0;
      
      li {
        background-color: #f8f9fa;
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 8px;
        border-left: 4px solid #2ecc71;
      }
    }
  }
}
```

### 4. Create Advanced File Uploader with Image Preview

Generate an advanced uploader component:

```bash
npx asmgen component fileUploader advanced-uploader --template react
```

Edit the component's view file:

```jsx
// src/components/fileUploader/advanced-uploader/advanced-uploader.view.jsx
import React, { useState, useRef, useEffect } from 'react';
import { hooks } from 'asmbl';

export default function AdvancedUploader({ context }) {
  const { uploadService } = hooks.useService();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentChunk, setCurrentChunk] = useState({});
  const [totalChunks, setTotalChunks] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const dropZoneRef = useRef(null);
  
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunk size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  // Generate file previews when files change
  useEffect(() => {
    const newPreviews = {};
    
    files.forEach(file => {
      // Only generate previews for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews[file.name] = e.target.result;
          setPreviews(prev => ({ ...prev, [file.name]: e.target.result }));
        };
        reader.readAsDataURL(file);
      }
    });
    
    return () => {
      // Revoke object URLs to prevent memory leaks
      Object.values(previews).forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [files]);
  
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    validateAndAddFiles(selectedFiles);
  };
  
  const validateAndAddFiles = (selectedFiles) => {
    const validFiles = [];
    const newErrors = [];
    
    selectedFiles.forEach(file => {
      const validation = uploadService.validateFile(file, allowedTypes, maxSize);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
    }
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('active');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('active');
    }
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('active');
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('active');
    }
    
    if (e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const removeFile = (index) => {
    const fileToRemove = files[index];
    setFiles(files.filter((_, i) => i !== index));
    
    // Also remove preview if exists
    if (previews[fileToRemove.name]) {
      setPreviews(prev => {
        const updated = { ...prev };
        delete updated[fileToRemove.name];
        return updated;
      });
    }
  };
  
  const uploadChunk = async (file, start, chunkIndex, totalChunks) => {
    return new Promise((resolve, reject) => {
      const chunk = file.slice(start, start + CHUNK_SIZE);
      const formData = new FormData();
      
      formData.append('file', chunk);
      formData.append('fileName', file.name);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          // Calculate the overall progress for this file
          const chunkProgress = (e.loaded / e.total) * 100;
          const overallProgress = (
            ((chunkIndex - 1) / totalChunks * 100) + 
            (chunkProgress / totalChunks)
          );
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min(Math.round(overallProgress), 99) // Cap at 99% until complete
          }));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid server response'));
          }
        } else {
          reject(new Error(`Server returned ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });
      
      xhr.open('POST', '/api/upload/chunk');
      xhr.send(formData);
    });
  };
  
  const uploadFileInChunks = async (file) => {
    const fileSize = file.size;
    const chunks = Math.ceil(fileSize / CHUNK_SIZE);
    
    setTotalChunks(prev => ({ ...prev, [file.name]: chunks }));
    
    try {
      for (let i = 0; i < chunks; i++) {
        setCurrentChunk(prev => ({ ...prev, [file.name]: i + 1 }));
        
        const start = i * CHUNK_SIZE;
        await uploadChunk(file, start, i + 1, chunks);
      }
      
      // All chunks uploaded, tell the server to reassemble
      const finalizeFormData = new FormData();
      finalizeFormData.append('fileName', file.name);
      finalizeFormData.append('totalChunks', chunks.toString());
      
      const response = await fetch('/api/upload/finalize', {
        method: 'POST',
        body: finalizeFormData
      });
      
      if (!response.ok) {
        throw new Error('Failed to finalize upload');
      }
      
      const result = await response.json();
      
      // Set progress to 100%
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 100
      }));
      
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setErrors([]);
    setUploadResults([]);
    
    const results = [];
    
    for (const file of files) {
      try {
        let response;
        
        if (file.size > 5 * 1024 * 1024) { // If file is larger than 5MB, use chunked upload
          response = await uploadFileInChunks(file);
        } else {
          // Use regular upload for smaller files
          response = await uploadService.uploadFile(file, {
            url: '/api/upload',
            onProgress: (progressEvent) => {
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progressEvent.percentage
              }));
            }
          });
        }
        
        results.push({
          file: file.name,
          success: true,
          path: response.path || response.url
        });
      } catch (error) {
        setErrors(prev => [...prev, `${file.name}: ${error.message}`]);
        
        results.push({
          file: file.name,
          success: false,
          error: error.message
        });
      }
    }
    
    setUploadResults(results);
    setUploading(false);
    setFiles([]);
    setPreviews({});
  };
  
  return (
    <div className="advanced-uploader">
      <div 
        ref={dropZoneRef}
        className="drop-zone"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M12 12.586l4.243 4.242-1.415 1.415L13 16.415V22h-2v-5.587l-1.828 1.83-1.415-1.415L12 12.586zM12 2a7.001 7.001 0 0 1 6.954 6.194 5.5 5.5 0 0 1-.953 10.784v-2.014a3.5 3.5 0 1 0-1.112-6.91 5 5 0 1 0-9.777 0 3.5 3.5 0 0 0-1.292 6.88l.18.03v2.014a5.5 5.5 0 0 1-.954-10.784A7 7 0 0 1 12 2z" fill="currentColor"/>
          </svg>
        </div>
        <p>Drag & drop files here, or click to select files</p>
        <small>Supports: JPG, PNG, GIF, PDF, TXT (max 50MB)</small>
        <input 
          id="file-input" 
          type="file" 
          multiple 
          onChange={handleFileChange} 
          accept={allowedTypes.join(',')} 
          style={{ display: 'none' }}
        />
      </div>
      
      {files.length > 0 && (
        <div className="files-container">
          <h3>Selected Files ({files.length})</h3>
          
          <div className="file-grid">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-preview">
                  {file.type.startsWith('image/') && previews[file.name] ? (
                    <img src={previews[file.name]} alt={file.name} />
                  ) : (
                    <div className="file-icon">
                      {file.type.includes('pdf') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h3V8h2v5.5h1.5v-7h-7v7zm6 4.5H13v-2h-3v2H8.5v-4h7v4z"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                      )}
                    </div>
                  )}
                  
                  {uploadProgress[file.name] !== undefined && (
                    <div className="file-progress-overlay">
                      <div className="progress-circle">
                        <svg viewBox="0 0 36 36">
                          <path 
                            className="progress-circle-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            strokeDasharray="100, 100"
                          />
                          <path 
                            className="progress-circle-fill"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            strokeDasharray={`${uploadProgress[file.name]}, 100`}
                          />
                        </svg>
                        <span className="progress-text">{uploadProgress[file.name]}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="file-info">
                  <p className="file-name" title={file.name}>
                    {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                  </p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  
                  {totalChunks[file.name] && (
                    <p className="chunk-info">
                      Chunk {currentChunk[file.name] || 0}/{totalChunks[file.name]}
                    </p>
                  )}
                </div>
                
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  title="Remove file"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="message-container error">
          <h3>Errors</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {uploadResults.length > 0 && (
        <div className="message-container success">
          <h3>Upload Results</h3>
          <ul>
            {uploadResults.map((result, index) => (
              <li key={index} className={result.success ? 'success-item' : 'error-item'}>
                {result.file}: {result.success ? 'Uploaded successfully' : 'Failed'}
                {result.success && result.path && (
                  <span> - <a href={result.path} target="_blank" rel="noopener noreferrer">View file</a></span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

Add styles for the advanced uploader:

```scss
// src/components/fileUploader/advanced-uploader/advanced-uploader.styles.scss
.advanced-uploader {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  color: #333;
  
  .drop-zone {
    border: 2px dashed #3498db;
    border-radius: 10px;
    padding: 40px;
    text-align: center;
    transition: all 0.3s ease;
    background-color: rgba(52, 152, 219, 0.02);
    cursor: pointer;
    margin-bottom: 30px;
    
    &:hover, &.active {
      background-color: rgba(52, 152, 219, 0.1);
      border-color: #2980b9;
    }
    
    .icon {
      color: #3498db;
      margin-bottom: 15px;
    }
    
    p {
      font-size: 18px;
      margin-bottom: 8px;
      color: #555;
    }
    
    small {
      color: #888;
      font-size: 14px;
    }
  }
  
  .files-container {
    h3 {
      font-size: 18px;
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    .file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      
      .file-item {
        background-color: #f8f9fa;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        position: relative;
        
        .file-preview {
          height: 150px;
          background-color: #eee;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .file-icon {
            width: 64px;
            height: 64px;
            color: #7f8c8d;
            
            svg {
              width: 100%;
              height: 100%;
            }
          }
          
          .file-progress-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255,255,255,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            
            .progress-circle {
              width: 60px;
              height: 60px;
              position: relative;
              
              svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
                
                .progress-circle-bg {
                  fill: none;
                  stroke: #eee;
                  stroke-width: 3;
                }
                
                .progress-circle-fill {
                  fill: none;
                  stroke: #3498db;
                  stroke-width: 3;
                  stroke-linecap: round;
                  transition: stroke-dasharray 0.3s ease;
                }
              }
              
              .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 12px;
                font-weight: bold;
                color: #3498db;
              }
            }
          }
        }
        
        .file-info {
          padding: 10px;
          
          .file-name {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .file-size {
            margin: 4px 0 0;
            font-size: 12px;
            color: #7f8c8d;
          }
          
          .chunk-info {
            margin: 4px 0 0;
            font-size: 11px;
            color: #3498db;
          }
        }
        
        .remove-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: rgba(231, 76, 60, 0.8);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
          
          &:hover {
            background-color: #e74c3c;
          }
          
          &:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
          }
        }
        
        &:hover .remove-button {
          opacity: 1;
        }
      }
    }
    
    .upload-button {
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 12px 24px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover:not(:disabled) {
        background-color: #2980b9;
      }
      
      &:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
      }
    }
  }
  
  .message-container {
    margin-top: 24px;
    padding: 16px;
    border-radius: 8px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: 500;
    }
    
    ul {
      margin: 0;
      padding: 0 0 0 20px;
      
      li {
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        a {
          color: #3498db;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    
    &.error {
      background-color: rgba(231, 76, 60, 0.1);
      border-left: 4px solid #e74c3c;
      
      h3 {
        color: #e74c3c;
      }
    }
    
    &.success {
      background-color: rgba(46, 204, 113, 0.1);
      border-left: 4px solid #2ecc71;
      
      h3 {
        color: #27ae60;
      }
      
      .success-item {
        color: #27ae60;
      }
      
      .error-item {
        color: #e74c3c;
      }
    }
  }
}
```

### 5. Create an Upload Controller for Server-Side Processing

To handle file uploads on the server side, create a controller:

```bash
npx asmgen controller upload
```

Edit the controller file:

```typescript
// src/controllers/upload.controller.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BlueprintController } from 'asmbl';
import { ApiReply, ApiRequest } from 'asmbl/types';

interface UploadedChunk {
  path: string;
  index: number;
}

interface ChunkMap {
  [filename: string]: {
    chunks: UploadedChunk[];
    totalChunks: number;
  };
}

export class UploadController extends BlueprintController {
  private uploadDir: string;
  private tempDir: string;
  private chunkMap: ChunkMap = {};
  
  /**
   * Initialize upload controller with directories for file storage
   */
  constructor() {
    super();
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    this.tempDir = path.resolve(process.cwd(), 'uploads', 'temp');
    
    // Ensure directories exist
    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(this.tempDir);
  }
  
  /**
   * Ensure a directory exists, create it if it doesn't
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  
  /**
   * Generate a secure filename to prevent path traversal attacks
   */
  private generateSecureFilename(originalFilename: string): string {
    const fileExtension = path.extname(originalFilename);
    const randomHash = crypto.randomBytes(16).toString('hex');
    const safeFilename = path.basename(originalFilename, fileExtension)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    
    return `${safeFilename}-${randomHash}${fileExtension}`;
  }
  
  /**
   * Handle regular file uploads
   */
  async upload(request: ApiRequest, reply: ApiReply): Promise<void> {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }
      
      const { file, fields } = data;
      const secureFilename = this.generateSecureFilename(file.filename);
      const uploadPath = path.join(this.uploadDir, secureFilename);
      
      // Process uploaded file 
      await this.saveUploadedFile(file.file, uploadPath);
      
      // Return the file details
      reply.send({
        success: true,
        originalName: file.filename,
        savedAs: secureFilename,
        size: file.file.bytesRead,
        path: `/uploads/${secureFilename}`,
        type: file.mimetype
      });
    } catch (error) {
      console.error('Upload error:', error);
      reply.status(500).send({ 
        success: false,
        error: 'Failed to process uploaded file' 
      });
    }
  }
  
  /**
   * Handle chunked uploads
   */
  async uploadChunk(request: ApiRequest, reply: ApiReply): Promise<void> {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ error: 'No file chunk uploaded' });
      }
      
      const { file, fields } = data;
      const fileName = fields.fileName?.value;
      const chunkIndex = parseInt(fields.chunkIndex?.value || '0', 10);
      const totalChunks = parseInt(fields.totalChunks?.value || '0', 10);
      
      if (!fileName || isNaN(chunkIndex) || isNaN(totalChunks)) {
        return reply.status(400).send({ error: 'Missing chunk information' });
      }
      
      // Create a temporary file for the chunk
      const chunkFileName = `${fileName}.part${chunkIndex}`;
      const chunkPath = path.join(this.tempDir, chunkFileName);
      
      // Save the chunk
      await this.saveUploadedFile(file.file, chunkPath);
      
      // Keep track of this chunk
      if (!this.chunkMap[fileName]) {
        this.chunkMap[fileName] = {
          chunks: [],
          totalChunks
        };
      }
      
      this.chunkMap[fileName].chunks.push({
        path: chunkPath,
        index: chunkIndex
      });
      
      reply.send({
        success: true,
        fileName,
        chunkIndex,
        totalChunks,
        received: this.chunkMap[fileName].chunks.length
      });
    } catch (error) {
      console.error('Chunk upload error:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to process uploaded chunk'
      });
    }
  }
  
  /**
   * Finalize a chunked upload by combining all chunks
   */
  async finalizeUpload(request: ApiRequest, reply: ApiReply): Promise<void> {
    try {
      const { fileName, totalChunks } = await request.body as any;
      
      if (!fileName || !this.chunkMap[fileName]) {
        return reply.status(400).send({ error: 'Invalid or missing file information' });
      }
      
      const fileInfo = this.chunkMap[fileName];
      
      // Check if we have all chunks
      if (fileInfo.chunks.length !== fileInfo.totalChunks) {
        return reply.status(400).send({
          error: `Missing chunks. Received ${fileInfo.chunks.length} of ${fileInfo.totalChunks}`
        });
      }
      
      // Sort chunks by index
      const sortedChunks = [...fileInfo.chunks].sort((a, b) => a.index - b.index);
      
      // Create the final file
      const secureFilename = this.generateSecureFilename(fileName);
      const finalPath = path.join(this.uploadDir, secureFilename);
      const writeStream = fs.createWriteStream(finalPath);
      
      // Combine all chunks
      for (const chunk of sortedChunks) {
        await this.appendChunkToFile(chunk.path, writeStream);
        
        // Remove the chunk file after it's been appended
        fs.unlinkSync(chunk.path);
      }
      
      // Close the write stream
      writeStream.end();
      
      // Clean up the chunk tracking
      delete this.chunkMap[fileName];
      
      reply.send({
        success: true,
        originalName: fileName,
        savedAs: secureFilename,
        path: `/uploads/${secureFilename}`
      });
    } catch (error) {
      console.error('Finalize upload error:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to finalize upload'
      });
    }
  }
  
  /**
   * Append a chunk to the final file
   */
  private async appendChunkToFile(chunkPath: string, writeStream: fs.WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(chunkPath);
      
      readStream.on('error', reject);
      readStream.on('end', resolve);
      
      readStream.pipe(writeStream, { end: false });
    });
  }
  
  /**
   * Save uploaded file
   */
  private async saveUploadedFile(fileStream: any, destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(destination);
      
      fileStream.on('error', (error: Error) => {
        stream.close();
        reject(error);
      });
      
      stream.on('error', (error: Error) => {
        reject(error);
      });
      
      stream.on('finish', () => {
        resolve();
      });
      
      fileStream.pipe(stream);
    });
  }
  
  /**
   * Register routes for the upload controller
   */
  routes(): void {
    this.post('/api/upload', this.upload.bind(this));
    this.post('/api/upload/chunk', this.uploadChunk.bind(this));
    this.post('/api/upload/finalize', this.finalizeUpload.bind(this));
  }
}
```

### 6. Update Server.ts File to Integrate the Components

Update the server.ts file to include your file upload components and controller:

```typescript
// src/server.ts
import path from 'path';
import { createBlueprintServer } from 'asmbl';
import { UploadController } from './controllers/upload.controller';

// Initialize the server
void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'fileUploader',
        views: [
          {
            viewName: 'basic-uploader',
            templateFile: 'basic-uploader.view.jsx'
          },
          {
            viewName: 'advanced-uploader',
            templateFile: 'advanced-uploader.view.jsx'
          }
        ]
      }
    ],
    blueprints: [
      {
        path: 'uploads',
        views: [
          {
            viewName: 'basic',
            templateFile: 'basic.view.jsx',
            route: '/basic',
            components: [
              { name: 'fileUploader/basic-uploader' }
            ]
          },
          {
            viewName: 'advanced',
            templateFile: 'advanced.view.jsx',
            route: '/advanced',
            components: [
              { name: 'fileUploader/advanced-uploader' }
            ]
          }
        ]
      }
    ],
    controllers: [
      new UploadController()
    ],
    staticDirs: [
      {
        root: path.join(process.cwd(), 'public'),
        prefix: '/public/'
      },
      {
        root: path.join(process.cwd(), 'uploads'),
        prefix: '/uploads/'
      }
    ]
  }
});
```

## Advanced Topics

### Handling Different File Types

For different file types, you might want to implement specialized handling:

1. **Images**: Resize and compress before uploading
2. **PDFs**: Generate previews or extract text
3. **Videos**: Create thumbnails or transcode

Here's an example of client-side image processing before upload:

```javascript
// Image processing utility
const processImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width);
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round(width * maxHeight / height);
        height = maxHeight;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### Security Considerations

When implementing file uploads, consider these security measures:

1. **File Type Validation**: Always validate file types both client-side and server-side
2. **File Size Limits**: Implement maximum file size limits
3. **Malware Scanning**: Consider scanning uploaded files for malware
4. **Secure Storage**: Store files outside of web root if possible
5. **Randomized Filenames**: Use random file names to prevent predictable access
6. **Content-Disposition Headers**: Use appropriate headers when serving user-uploaded files
7. **CSRF Protection**: Ensure your upload endpoints are protected against CSRF attacks

### Handling Upload Failures

Implement robust error handling and retry mechanisms:

```javascript
// Retry upload with exponential backoff
const retryUpload = async (file, options, maxRetries = 3) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await uploadService.uploadFile(file, options);
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

## Conclusion

In this tutorial, you've learned how to implement comprehensive file upload functionality in AssembleJS applications. We've covered:

- Basic file uploads with progress tracking
- Advanced uploads with drag-and-drop and image previews
- Chunked uploads for large files
- Server-side handling and processing of uploads
- Security considerations and best practices

You can extend this implementation with additional features like:

- Direct uploads to cloud storage (S3, Azure Blob Storage, etc.)
- Server-side image processing with libraries like Sharp
- Virus scanning integration
- File conversion workflows

By following the patterns demonstrated in this tutorial, you can create robust and user-friendly file upload experiences in your AssembleJS applications.