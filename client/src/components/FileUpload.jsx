
import { useState } from 'react';

export default function FileUpload({ files, onFileChange, onShowResults }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(file => 
        file.type === 'application/pdf' || 
        file.name.endsWith('.docx') || 
        file.name.endsWith('.doc')
      );
      
      if (validFiles.length > 0) {
        // Create a synthetic event to match the expected format
        const syntheticEvent = {
          target: {
            files: validFiles
          }
        };
        onFileChange(syntheticEvent);
        
        // Show results immediately if onShowResults is provided
        if (onShowResults) {
          onShowResults(validFiles);
        }
      }
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    onFileChange(e);
    
    // Show results immediately if onShowResults is provided
    if (onShowResults && selectedFiles.length > 0) {
      onShowResults(selectedFiles);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="text-3xl">📄</div>
        <div>
          <h2 className="text-2xl font-bold text-white">Upload Resumes</h2>
          <p className="text-gray-400 text-sm">Upload PDF or Word documents for analysis</p>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-400/10 scale-105'
            : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.docx,.doc"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="text-6xl opacity-50">📁</div>
          
          <div>
            <label 
              htmlFor="file-input" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl cursor-pointer font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span>📎</span>
              <span>Choose Files</span>
            </label>
          </div>
          
          <p className="text-gray-400 text-sm">
            or drag and drop your files here
          </p>
          
          <p className="text-gray-500 text-xs">
            Supports PDF, DOC, DOCX files • Max 10MB per file
          </p>
        </div>
      </div>

      {/* File List */}
      {files && files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <span>📋</span>
            <span>Selected Files ({files.length})</span>
          </h3>
          
          <div className="space-y-3">
            {files.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {file.type === 'application/pdf' ? '📄' : '📝'}
                  </div>
                  <div>
                    <p className="text-white font-medium truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
