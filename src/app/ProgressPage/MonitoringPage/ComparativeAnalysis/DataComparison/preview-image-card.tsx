import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import ResponsiveCardTable from '../../../../../shared/components/responsive-card-table';
import InfoMessage from '../../../../../shared/components/InfoMessage';
import Loader from '../../../../../shared/components/loader';

const normalizePath = (path?: string | string[]): string => {
  if (!path) return '';
  const s = Array.isArray(path) ? path.join(',') : path;
  return s.replace(/\\/g, '/');
};

type PreviewImageCardProps = {
  title: React.ReactNode;
  fileNames: string | string[] | undefined;
};

export default function PreviewImageCard({ title, fileNames }: PreviewImageCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const baseApi = 'http://localhost:8080/api/data/file?path=';

  const fileName = normalizePath(fileNames);
  const imageSrc = fileName ? `${baseApi}${fileName}` : '';

  useEffect(() => {
    setLoaded(false);
    setHasError(false);
    const img = imageRef.current;
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setLoaded(true);
    }
  }, [imageSrc]);


  return (
    <Box sx={{ height: '100%' }}>
      <ResponsiveCardTable
        title={title}
        showDownloadButton
        showFullScreenButton
        onDownload={async () => {
          if (!imageSrc) return;
          const res = await fetch(imageSrc, { mode: 'cors' });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title || 'image'}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
        downloadLabel="Download Image"
        downloadSecondaryText="Save image to your device"
        additionalMenuItems={null}
        noPadding
        maxHeight={400}
        minHeight={400}
      >
        {!imageSrc || hasError ? (
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
              key={imageSrc}
              ref={imageRef}
              src={imageSrc}
              alt={'Preview'}
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
