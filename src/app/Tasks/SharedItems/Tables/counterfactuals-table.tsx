import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import InfoIcon from "@mui/icons-material/Info"
import TableContainer from "@mui/material/TableContainer"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell, { tableCellClasses } from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import type { IPlotModel } from "../../../../shared/models/plotmodel.model"
import grey from "@mui/material/colors/grey"
// import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import { styled } from "@mui/material/styles"
import Modal from "@mui/material/Modal"
import { Dispatch, SetStateAction, useEffect } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../../../store/store"
import { fetchCounterfactuals } from "../../../../store/slices/explainabilitySlice"
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import CircularProgress from "@mui/material/CircularProgress"

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 1,
};

interface ITableComponent {
  children?: React.ReactNode
  point: any;
  handleClose: any;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const FixedTableCell = styled(TableCell)(({ theme }) => ({
  position: "sticky",
  right: 0,
  backgroundColor: theme.palette.customGrey.light,
  zIndex: 100,
  borderLeft: `1px solid ${grey[300]}`,
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.customGrey.light,
  },
}))

const CounterfactualsTable = (props: ITableComponent) => {
  const { point, handleClose } = props
  const { counterfactuals } = useAppSelector((state: RootState) => state.explainability)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCounterfactuals({
    explanationType:"hyperparameterExplanation",
    explanationMethod:"counterfactuals",
    model:"Ideko_model",
    modelId: 1,
    feature1: "",
    feature2: ""
    }))
  }, [])

  return (
    <>
    {console.log(counterfactuals)}
      <Modal
        open={point !== null}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
      <Paper
        className="Category-Item"
        elevation={2}
        sx={{
          borderRadius: 4,
          width: "90%",
          display: "flex",
          flexDirection: "column",
          rowGap: 0,
          minWidth: "300px",
          overflow: "hidden",
          ...style
        }}
      >
        <Box
          sx={{
            // px: 1.5,
            // py: 0.5,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${grey[400]}`,
          }}
        >
          <Typography fontSize={"1rem"} fontWeight={600}>
            {counterfactuals.data?.plotName || "Plot name"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={counterfactuals.data?.plotDescr || "This is a description"}>
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {props.children || null}
        <Box
          sx={{
            width: "99%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            p: 1,
          }}
        >
          {counterfactuals.loading ? <Box sx={{width: 650, height: 300, display: "flex", justifyContent: "center", alignItems: "center"}}>
            <CircularProgress sx={{fontSize: "2rem"}} />
          </Box> : 
          <TableContainer
            component={Paper}
            sx={{ width: "99%", overflowX: "auto" }}
          >
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="simple table"
              size="small"
            >
              <TableHead>
                <TableRow>
                  {Object.keys(counterfactuals.data?.tableContents || {}).map(
                    (key, index) => {
                      const orderedColumn = Object.entries(counterfactuals.data?.tableContents || {}).find(([key, value]) => (value.index === index + 1))
                      return(
                      <TableCell
                        key={`table-header-${key}-${index}`}
                        sx={{ fontWeight: 600 }}
                      >
                        {orderedColumn?.[0]}
                      </TableCell>
                      )
                    },
                  )}
                  <FixedTableCell
                    key="table-header-static"
                    sx={{ fontWeight: 600 }}
                    align="center"
                  >
                    Actions
                  </FixedTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {counterfactuals.data?.tableContents[
                  Object.keys(counterfactuals.data?.tableContents)[0]
                ].values.map((value: any, index: number) => {
                  return (
                    <StyledTableRow key={`table-row-${index}`}>
                      {Object.keys(counterfactuals.data?.tableContents || {}).map(
                        (key, idx) => {
                          const orderedColumn = Object.entries(counterfactuals.data?.tableContents || {}).find(([key, value]) => (value.index === idx + 1))
                          return(
                          <TableCell key={`table-cell-${key}-${index}`}>
                            {
                              orderedColumn?.[1].values[index]
                            }
                          </TableCell>
                        )},
                      )}
                      <FixedTableCell
                        key={`table-cell-static-${index}`}
                        align="center"
                      >
                        <Tooltip title="Save Configuration">
                          <IconButton color="primary">
                            <ModelTrainingIcon />
                          </IconButton>
                        </Tooltip>
                      </FixedTableCell>
                    </StyledTableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>}
        </Box>
      </Paper>
      </Modal>
    </>
  )
}

export default CounterfactualsTable
