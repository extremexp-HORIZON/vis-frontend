import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { grey } from "@mui/material/colors";
import { useEffect, useRef, useState } from "react";

interface IProgressPageTabs {
  value: number;
  handleChange: (newValue: number) => (event: React.SyntheticEvent) => void;
}

const ProgressPageTabs = (props: IProgressPageTabs) => {
  const { value, handleChange } = props;
  const progressPageTabsRef = useRef<HTMLDivElement>(null);
  const initialOffsetTopRef = useRef<number>(0);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (progressPageTabsRef.current) {
      initialOffsetTopRef.current = progressPageTabsRef.current.offsetTop;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Compare scrollY with the initial offsetTop value
      if (scrollY >= initialOffsetTopRef.current) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Grid
      ref={progressPageTabsRef}
      item
      xs={12}
      sx={{
        px: 2,
        bgcolor: grey[400],
        display: "flex",
        height: "3.5rem",
        columnGap: 1,
        alignItems: "center",
        transition: "top 0.3s ease-in-out",
        position: isSticky ? "fixed" : "relative",
        top: isSticky ? 0 : "auto",
        width: "100%",
        zIndex: isSticky ? 1000 : "auto",
      }}
    >
      <Button
        variant="text"
        sx={{
          borderRadius: 20,
          px: 2,
          py: 1,
          color: "black",
          bgcolor: value === 0 ? "white" : grey[300],
          border: value !== 0 ? `1px solid ${grey[400]}` : "none",
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: value !== 0 ? grey[400] : "white" },
          boxShadow: "0 0 -25px 0 #001f3f",
        }}
        size="small"
        disableRipple
        onClick={handleChange(0)}
      >
        Experiment Overview
      </Button>
      <Button
        sx={{
          borderRadius: 20,
          px: 2,
          py: 1,
          color: "black",
          bgcolor: value === 1 ? "white" : grey[300],
          border: value !== 1 ? `1px solid ${grey[400]}` : "none",
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: value !== 1 ? grey[400] : "white" },
        }}
        size="small"
        disableRipple
        onClick={handleChange(1)}
      >
        Workflow1
      </Button>
    </Grid>
  );
};

export default ProgressPageTabs;
