import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import ResponsiveCardTable from '../../../../../shared/components/responsive-card-table';
import InfoMessage from '../../../../../shared/components/InfoMessage';
import Loader from '../../../../../shared/components/loader';
import { getToken } from '../../../../../store/slices/authSlice';

type PreviewImageCardProps = {
  title: string;
  fileNames: string | string[] | undefined;
};

export default function PreviewImageCard({ title, fileNames }: PreviewImageCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const baseApi = '/api/data/file?path=';

  const path = Array.isArray(fileNames) ? fileNames[0] : fileNames;

  useEffect(() => {
    setLoaded(false);
    setHasError(false);

    // Revoke any previous blob URL before fetching a new one
    setImageUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (!path) return;

    const fetchImage = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${baseApi}${path}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Failed to load image: ${res.status}`);

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageUrl(blobUrl);

        const img = imageRef.current;
        if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          setLoaded(true);
        }
      } catch (e) {
        setHasError(true);
      }
    };

    fetchImage();

    // Cleanup on unmount or when path changes
    return () => {
      setImageUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [path]);

    const handleDownload = async () => {
    if (!path) return;
    try {
      const token = getToken();
      const res = await fetch(`${baseApi}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // keep original extension if your backend sets Content-Disposition; otherwise leave as-is
      a.download = `${title || 'image'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setHasError(true);
    }
  };

  return (
    <Box sx={{ height: '100%' }}>
      <ResponsiveCardTable
        title={title}
        showDownloadButton
        showFullScreenButton
        onDownload={handleDownload}
        downloadLabel="Download Image"
        downloadSecondaryText="Save image to your device"
        additionalMenuItems={null}
        noPadding
        maxHeight={400}
        minHeight={400}
      >
        {!path || hasError ? (
          <InfoMessage
            message="Failed to load image. Please check the source or format."
            type="error"
            icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            fullHeight
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!loaded && (
              <Box
                sx={{
                  flexGrow: 1,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f9f9f9',
                  p: 2,
                }}
              >
                <Loader />
              </Box>
            )}
            <img
              key={imageUrl}
              ref={imageRef}
              src={imageUrl || ''}
              alt={title || 'Preview'}
              onLoad={() => setLoaded(true)}
              onError={() => setHasError(true)}
              style={{
                display: loaded ? 'block' : 'none',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
          </Box>
        )}
      </ResponsiveCardTable>
    </Box>
  );
}
