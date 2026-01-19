import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactPlayer from 'react-player';
import mammoth from 'mammoth';
import { IPCFile } from '@tinder-clear/shared';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface MediaViewerProps {
  file: IPCFile;
  fileObject?: File | null; // File object from File System Access API
  fileUrl?: string; // Object URL for file
}

const MediaViewer: React.FC<MediaViewerProps> = ({ file, fileObject, fileUrl }) => {
  const [imageError, setImageError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [docxContent, setDocxContent] = useState<string>('');
  const [docxError, setDocxError] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [txtContent, setTxtContent] = useState<string>('');
  const [txtError, setTxtError] = useState(false);
  const [txtLoading, setTxtLoading] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Create object URL for file if provided
  useEffect(() => {
    if (fileObject) {
      const url = URL.createObjectURL(fileObject);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    } else if (fileUrl) {
      setObjectUrl(fileUrl);
    }
  }, [fileObject, fileUrl]);

  // Memoize PDF options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), []);

  // Reset PDF state when file changes
  useEffect(() => {
    if (file.media_type === 'document' && file.filepath.endsWith('.pdf')) {
      setPdfError(false);
      setNumPages(0);
    }
  }, [file.filepath, file.media_type]);

  // Load DOCX content when file changes
  useEffect(() => {
    if (file.media_type === 'document' && file.filepath.endsWith('.docx') && fileObject) {
      setDocxLoading(true);
      setDocxError(false);
      
      fileObject.arrayBuffer()
        .then((arrayBuffer) => mammoth.convertToHtml({ arrayBuffer }))
        .then((result) => {
          setDocxContent(result.value);
          setDocxLoading(false);
        })
        .catch((error) => {
          console.error('Error loading DOCX:', error);
          setDocxError(true);
          setDocxLoading(false);
        });
    } else if (file.media_type === 'document' && file.filepath.endsWith('.docx')) {
      setDocxError(true);
      setDocxLoading(false);
    } else {
      setDocxContent('');
    }
  }, [file.filepath, file.media_type, fileObject]);

  // Load TXT content when file changes
  useEffect(() => {
    if (file.media_type === 'document' && file.filepath.endsWith('.txt') && fileObject) {
      setTxtLoading(true);
      setTxtError(false);
      
      fileObject.text()
        .then((content) => {
          setTxtContent(content);
          setTxtLoading(false);
        })
        .catch((error) => {
          console.error('Error loading TXT:', error);
          setTxtError(true);
          setTxtLoading(false);
        });
    } else if (file.media_type === 'document' && file.filepath.endsWith('.txt')) {
      setTxtError(true);
      setTxtLoading(false);
    } else {
      setTxtContent('');
    }
  }, [file.filepath, file.media_type, fileObject]);

  const renderContent = () => {
    const mediaUrl = objectUrl || fileUrl;
    const hasMediaUrl = !!mediaUrl;

    switch (file.media_type) {
      case 'image':
        if (imageError || !hasMediaUrl) {
          return (
            <div className="media-error">
              <div className="error-icon">📷</div>
              <p>Unable to load image</p>
            </div>
          );
        }
        return (
          <div className="media-image-wrapper">
            <img
              src={mediaUrl!}
              alt={file.filepath}
              className="media-image"
              onError={() => setImageError(true)}
            />
          </div>
        );

      case 'document':
        if (file.filepath.endsWith('.pdf')) {
          if (pdfError || !hasMediaUrl) {
            return (
              <div className="media-error">
                <div className="error-icon">📄</div>
                <p>Unable to load PDF</p>
              </div>
            );
          }
          return (
            <div className="media-pdf">
              <Document
                file={mediaUrl!}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);
                }}
                onLoadError={(error) => {
                  console.error('PDF load error:', error);
                  setPdfError(true);
                }}
                loading={<div className="loading">Loading PDF...</div>}
                options={pdfOptions}
              >
                {numPages > 0 && (
                  <div className="pdf-pages-container">
                    {Array.from(new Array(numPages), (el, index) => (
                      <div key={`page_wrapper_${index + 1}`} className="pdf-page-wrapper">
                        <Page
                          pageNumber={index + 1}
                          width={800}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          loading={<div className="loading">Loading page {index + 1}...</div>}
                        />
                        {numPages > 1 && (
                          <div className="pdf-page-label">Page {index + 1} of {numPages}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Document>
            </div>
          );
        }
        if (file.filepath.endsWith('.txt')) {
          if (txtError) {
            return (
              <div className="media-error">
                <div className="error-icon">📄</div>
                <p>Unable to load TXT file</p>
              </div>
            );
          }
          if (txtLoading) {
            return (
              <div className="media-loading">
                <div className="loading">Loading text file...</div>
              </div>
            );
          }
          return (
            <div className="media-txt">
              <pre className="txt-content">{txtContent}</pre>
            </div>
          );
        }
        if (file.filepath.endsWith('.docx')) {
          if (docxError) {
            return (
              <div className="media-error">
                <div className="error-icon">📄</div>
                <p>Unable to load DOCX file</p>
              </div>
            );
          }
          if (docxLoading) {
            return (
              <div className="media-loading">
                <div className="loading">Loading document...</div>
              </div>
            );
          }
          return (
            <div className="media-docx">
              <div 
                className="docx-content" 
                dangerouslySetInnerHTML={{ __html: docxContent }} 
              />
            </div>
          );
        }
        // Handle other document types (PPTX, XLSX, etc.)
        const ext = file.filepath.split('.').pop()?.toLowerCase();
        let icon = '📄';
        let message = 'Document preview not available';
        
        if (ext === 'pptx' || ext === 'ppt') {
          icon = '📊';
          message = 'PowerPoint files cannot be previewed. Use the filename to review.';
        } else if (ext === 'xlsx' || ext === 'xls') {
          icon = '📈';
          message = 'Excel files cannot be previewed. Use the filename to review.';
        } else if (ext === 'rtf' || ext === 'odt' || ext === 'ods') {
          icon = '📄';
          message = 'Document format not previewable. Use the filename to review.';
        }
        
        return (
          <div className="media-document">
            <div className="document-icon">{icon}</div>
            <p className="document-name">{file.filepath.split(/[/\\]/).pop()}</p>
            <p className="document-message">{message}</p>
          </div>
        );

      case 'video':
        if (!hasMediaUrl) {
          return (
            <div className="media-error">
              <div className="error-icon">🎬</div>
              <p>Unable to load video</p>
            </div>
          );
        }
        return (
          <div className="media-video">
            <ReactPlayer url={mediaUrl!} controls width="100%" height="100%" playing={false} />
          </div>
        );

      case 'audio':
        if (!hasMediaUrl) {
          return (
            <div className="media-error">
              <div className="error-icon">🎵</div>
              <p>Unable to load audio</p>
            </div>
          );
        }
        return (
          <div className="media-audio">
            <div className="audio-icon">🎵</div>
            <ReactPlayer url={mediaUrl!} controls width="100%" />
            <p className="audio-name">{file.filepath.split(/[/\\]/).pop()}</p>
          </div>
        );

      default:
        return (
          <div className="media-unknown">
            <div className="unknown-icon">📎</div>
            <p>Unknown media type</p>
          </div>
        );
    }
  };

  return (
    <div className="media-card">
      <div className="media-content">{renderContent()}</div>
      <div className="media-filename">{file.filepath.split(/[/\\]/).pop()}</div>
    </div>
  );
};

export default MediaViewer;
