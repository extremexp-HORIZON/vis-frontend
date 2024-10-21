// Import necessary modules
import { grey } from "@mui/material/colors"
import { createTheme } from "@mui/material/styles"

// Extend the existing palette interface to include custom properties
declare module "@mui/material/styles" {
  interface Palette {
    customGradient: {
      main: string
    }
    customGrey: {
      main: string
      dark: string
      light: string
      text: string
    }
  }
  interface PaletteOptions {
    customGradient?: {
      main: string
    }
    customGrey?: {
      main: string
      dark: string
      light: string
      text: string
    }
  }
}

// Create the theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3766AF",
    },
    secondary: {
      main: "#6BBC8C",
    },
    customGradient: {
      main: "linear-gradient(45deg, #6BBC8C 30%, #3766AF 90%)",
    },
    customGrey: {
      main: grey[100],
      dark: grey[400],
      light: grey[50],
      text: grey[700]
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0E1021",
      secondary: "#0E1021",
    },
  },
  typography: {
    fontFamily: '"All Round Gothic Bold", Arial, sans-serif',
    allVariants: {
      color: "#0E1021",
    },
  },
})

export default theme
