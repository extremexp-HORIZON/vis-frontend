import { Box } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { logger } from "vega";
import InfoMessage from "../../../../shared/components/InfoMessage";
import Loader from "../../../../shared/components/loader";
import ResponsiveCardTable from "../../../../shared/components/responsive-card-table";
import { getToken } from "../../../../store/slices/authSlice";
import { useAppSelector } from "../../../../store/store";

const ImageCard = () => {
  const { tab } = useAppSelector(state => state.workflowPage);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const selectedImage = useAppSelector(
    state =>
      state.workflowPage?.tab?.dataTaskTable?.selectedItem?.data?.dataset
  );

  const baseApi = '/api/data/file?path=';

  // Fetch the image with Bearer token
  useEffect(() => {
    if (!selectedImage?.source) return;

    const fetchImage = async () => {
      const token = getToken();
      const filePath = tab?.workflowTasks.dataExploration?.metaData.data?.fileNames;

      if (!filePath) return;

      try {
        const response = await fetch(`${baseApi}${(tab?.workflowTasks.dataExploration?.metaData.data?.fileNames || '')}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to load image: ${response.status}`);

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageUrl(blobUrl);
      } catch (error) {
        logger.error('Image fetch failed:', error);
        setHasError(true);
      }
    };

    fetchImage();

    // cleanup blob URL on unmount
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [selectedImage, tab]);

  const handleDownload = async () => {
    if (!selectedImage?.source) return;
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
        downloadLabel="Download Image"
        onDownload={handleDownload}
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
            {!loaded && <Loader />}
            {imageUrl && (
              <img
                src={imageUrl}
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
            )}
          </Box>
        </Box>
      </ResponsiveCardTable>
    </Box>
  );
};

export default ImageCard;
