import { useState, useRef } from 'react';
import ProgressBar from './ProgressBar';
import styles from './FileUpload.module.css';

export default function FileUpload({
  onUploadComplete,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  endpoint = '/api/upload/advertisement',
  label = 'Valj fil'
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(`Filen ar for stor. Max ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return;
    }

    // Validate file type
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      setError('Filtypen stods inte.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    // Upload with XMLHttpRequest to track progress
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('image', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        setProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          setProgress(100);
          if (onUploadComplete) {
            onUploadComplete(response);
          }
        } catch (err) {
          setError('Kunde inte tolka serversvaret.');
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setError(response.error || 'Uppladdningen misslyckades.');
        } catch {
          setError('Uppladdningen misslyckades.');
        }
      }
    });

    xhr.addEventListener('error', () => {
      setUploading(false);
      setError('Natverksfel vid uppladdning.');
    });

    xhr.addEventListener('abort', () => {
      setUploading(false);
      setError('Uppladdningen avbröts.');
    });

    xhr.open('POST', endpoint);
    xhr.withCredentials = true;
    xhr.send(formData);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        className={styles.hiddenInput}
        disabled={uploading}
      />

      {preview ? (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Preview" className={styles.preview} />
          <button
            type="button"
            onClick={clearPreview}
            className={styles.clearBtn}
            disabled={uploading}
          >
            X
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={styles.selectBtn}
          disabled={uploading}
        >
          {label}
        </button>
      )}

      {uploading && (
        <ProgressBar
          progress={progress}
          label="Laddar upp..."
          showPercentage={true}
        />
      )}

      {!uploading && progress === 100 && (
        <div className={styles.success} role="status" aria-live="polite">
          Uppladdning klar!
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert" aria-live="assertive">
          {error}
        </div>
      )}
    </div>
  );
}
