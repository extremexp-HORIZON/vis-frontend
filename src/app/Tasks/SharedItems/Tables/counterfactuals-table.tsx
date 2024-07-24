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
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import { styled } from "@mui/material/styles"
import Modal from "@mui/material/Modal"
import { Dispatch, SetStateAction } from "react"

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
  plotModel: IPlotModel | null
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
  const { plotModel, point, handleClose } = props

  return (
    <>
      {console.log("counterfactuals", plotModel)}
      <Modal
        open={point}
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
            {plotModel?.plotName || "Plot name"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={plotModel?.plotDescr || "This is a description"}>
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
                  {Object.keys(plotModel?.tableContents || {}).map(
                    (key, index) => (
                      <TableCell
                        key={`table-header-${key}-${index}`}
                        sx={{ fontWeight: 600 }}
                      >
                        {key}
                      </TableCell>
                    ),
                  )}
                  <FixedTableCell
                    key="table-header-static"
                    sx={{ fontWeight: 600 }}
                  >
                    Actions
                  </FixedTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plotModel?.tableContents[
                  Object.keys(plotModel.tableContents)[0]
                ].values.map((value, index) => {
                  return (
                    <StyledTableRow key={`table-row-${index}`}>
                      {Object.keys(plotModel?.tableContents || {}).map(
                        (key, idx) => (
                          <TableCell key={`table-cell-${key}-${index}`}>
                            {
                              plotModel?.tableContents[
                                Object.keys(plotModel.tableContents)[idx]
                              ].values[index]
                            }
                          </TableCell>
                        ),
                      )}
                      <FixedTableCell
                        key={`table-cell-static-${index}`}
                        align="center"
                      >
                        <Tooltip title="Save Configuration">
                          <IconButton color="primary">
                            <ThumbUpIcon />
                          </IconButton>
                        </Tooltip>
                      </FixedTableCell>
                    </StyledTableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      </Modal>
    </>
  )
}

export default CounterfactualsTable
