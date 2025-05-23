import { useRef, useState } from 'react';
import { Box } from '@mui/material';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useAppSelector } from '../../../../store/store';
import { logger } from '../../../../shared/utils/logger';
import Loader from '../../../../shared/components/loader';

const ImageCard = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const selectedImage = useAppSelector(
    state =>
      state.workflowPage?.tab?.dataTaskTable?.selectedItem?.data?.dataset,
  );

  const handleDownload = async () => {
    if(!selectedImage?.source) return;
    try {
      const response = await fetch(selectedImage?.source, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = `${selectedImage?.name || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke blob URL to free memory
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      logger.error('Image download failed:', error);
    }
  };

  if (!selectedImage?.source || hasError) {
    return (
      <InfoMessage
        message="Failed to load image. Please check the source or format."
        type="error"
        icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
        fullHeight
      />
    );
  }

  return (
    <Box sx={{ height: '99%' }}>
      <ResponsiveCardTable
        title={selectedImage?.name}
        showDownloadButton={true}
        showFullScreenButton={true}
        onDownload={handleDownload}
        downloadLabel="Download Image"
        downloadSecondaryText="Save image to your device"
        additionalMenuItems={null}
        noPadding={true}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
            ref={imageRef}
          >
            {!loaded && (
              <Loader/>
            )}
            <img
              src={selectedImage.source}
              alt="Preview"
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
        </Box>
      </ResponsiveCardTable>
    </Box>
  );
};

export default ImageCard;
