import { Box, Typography } from "@mui/material";
import PlaylistRemoveRoundedIcon from '@mui/icons-material/PlaylistRemoveRounded';

interface INoRowsOverlayProps {
    title: string
}

 const NoRowsOverlay = (props: INoRowsOverlayProps) => {
    const {title} = props
    return (
        <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
        >
        <PlaylistRemoveRoundedIcon fontSize="large" />
        <Typography variant="body2">{title}</Typography>
      </Box>
    
    )
}

const NoRowsOverlayWrapper = (props: any) => {
    return <NoRowsOverlay title={props?.title} />;
  };
  

export default NoRowsOverlayWrapper