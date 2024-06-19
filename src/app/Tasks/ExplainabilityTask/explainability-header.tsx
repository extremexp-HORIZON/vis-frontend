 import Grid from "@mui/material/Grid"
import grey from "@mui/material/colors/grey"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../store/store"
import Button from "@mui/material/Button"
import StarsIcon from "@mui/icons-material/Stars"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import red from "@mui/material/colors/red"
import { deleteTab } from "../../../store/slices/explainabilitySlice"
import IconButton from "@mui/material/IconButton"

interface IDashboardTitle {
  value: number
  setValue: Dispatch<SetStateAction<number>>
}

const ExplainabilityTaskHeader = (props: IDashboardTitle) => {
  const { explInitialization, tabs } = useAppSelector(
    state => state.explainability,
  )
  const { value, setValue } = props
  const dispatch = useAppDispatch()

  const handleChange = (newValue: number) => (event: React.SyntheticEvent) => {
    if (value === newValue) return
    setValue(newValue)
  }

  const handleRemoveTab = (tab: any, prevTab: number) => () => {
    // prevTab + 1 === value && setValue(prevTab)
    setValue(0)
    dispatch(deleteTab(tab.id))
  }

  return (
    <>
    <Grid
      className="dashboard-title"
      item
      xs={12}
      sx={{
        px: 2,
        pt: 1,
        bgcolor: grey[300],
        display: "flex",
        height: "3.5rem",
        columnGap: 0,
      }}
    >
      <Button
        variant="text"
        sx={{
          borderRadius: "20px 20px 0px 0px",
          px: 2,
          color: "black",
          bgcolor: value === 0 ? "white" : grey[300],
          border: value !== 0 ? `1px solid ${grey[400]}` : "none",
          borderBottom: "none",
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: value !== 0 ? grey[400] : "white" },
          boxShadow: "0 0 -25px 0 #001f3f",
          zIndex: value === 0 ? 100 : tabs.length + 2,
        }}
        size="small"
        disableRipple
        onClick={handleChange(0)}
      >
        Experiment Variant Analysis
      </Button>
      <Button
        sx={{
          borderRadius: "20px 20px 0px 0px",
          px: 2,
          color: "black",
          bgcolor: value === 1 ? "white" : grey[300],
          border: value !== 1 ? `1px solid ${grey[400]}` : "none",
          borderBottom: "none",
          fontSize: "0.8rem",
          textTransform: "none",
          ":hover": { bgcolor: value !== 1 ? grey[400] : "white" },
          marginLeft: -1,
          zIndex: value === 1 ? 100 : tabs.length + 1,
        }}
        startIcon={<StarsIcon />}
        size="small"
        disableRipple
        onClick={handleChange(1)}
      >
        Variant 71
      </Button>
      {tabs.map((tab, index) => (
        <Button
          key={`tab-${tab.id}`}
          sx={{
            borderRadius: "20px 20px 0px 0px",
            px: 2,
            color: "black",
            bgcolor: value === index + 2 ? "white" : grey[300],
            border: value !== index + 2 ? `1px solid ${grey[400]}` : "none",
            borderBottom: "none",
            fontSize: "0.8rem",
            textTransform: "none",
            ":hover": { bgcolor: value !== index + 2 ? grey[400] : "white" },
            marginLeft: -1,
            zIndex: value === index + 2 ? 100 : tabs.length - index,
          }}
          size="small"
          disableRipple
          onClick={handleChange(index + 2)}
          // endIcon={<HighlightOffIcon onClick={handleRemoveTab(tab, index+1, index)} sx={{"&:hover": { color: red[400]}}} />}
        >
          Variant {tab.id}
          <IconButton aria-label="delete" size="small" sx={{zIndex: 999}} onClick={handleRemoveTab(tab, index+1)}>
            <HighlightOffIcon fontSize="inherit" />
          </IconButton>
        </Button>
      ))}
    </Grid>
    </>
  )
}

export default ExplainabilityTaskHeader
