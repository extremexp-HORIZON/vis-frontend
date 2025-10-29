// import ResponsiveCardTable from "../../shared/components/responsive-card-table"
// import { Box } from "@mui/material"

// interface UserInteractiveTaskProps {
//   url: string
// }

// const UserInteractiveTask = (props: UserInteractiveTaskProps) => {
//   const { url } = props
//    const proxiedUrl = url.startsWith("http://146.124.106.171:5000")
//     ? url.replace(/^http:\/\/146\.124\.106\.171:5000/, "/human-in-the-loop")
//     : url;

//   // Normalize relative URLs for iframe
//   const normalizedUrl =
//     proxiedUrl.startsWith("http://") || proxiedUrl.startsWith("https://")
//       ? proxiedUrl
//       : `${window.location.origin}${proxiedUrl}`;
//   return (
//     <Box sx={{ height: 500, width: '100%' }}>
//     <ResponsiveCardTable title="User Interactive Task">
//       <Box style={{height: '100%', width: '100%'}}>
//         <iframe src={normalizedUrl} height='100%' width='100%'/>
//       </Box>
//     </ResponsiveCardTable>
//     </Box>
//   )
// }

// export default UserInteractiveTask






import ResponsiveCardTable from "../../shared/components/responsive-card-table"
import { Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";


interface UserInteractiveTaskProps {
  url: string
}
const UserInteractiveTask = (props: UserInteractiveTaskProps) => {
  const { url } = props;
  const [customUrl, setCustomUrl] = useState(url);
  const [validatedUrl, setValidatedUrl] = useState("");

  const isSecure = customUrl.startsWith("https://");

  const handleOpenInNewTab = () => {
    // Normalize the URL: add http if missing
    const normalized = customUrl.startsWith("http://") || customUrl.startsWith("https://")
      ? customUrl
      : `http://${customUrl}`;
    window.open(normalized, "_blank");
  };


 return (
    <Box sx={{ height: 500, width: "100%" }}>
      <ResponsiveCardTable title="User Interactive Task">
        {isSecure ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Button variant="contained" onClick={handleOpenInNewTab}>
              Open Secure URL in New Tab
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 2,
              p: 2,
            }}
          >
            <Typography color="error" variant="body1" align="center">
              The URL is not secure (HTTPS). Please update the URL to navigate safely.
            </Typography>
            <TextField
              label="Enter a valid URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleOpenInNewTab}>
              Open URL in New Tab
            </Button>
          </Box>
        )}
      </ResponsiveCardTable>
    </Box>
  );
};

export default UserInteractiveTask;