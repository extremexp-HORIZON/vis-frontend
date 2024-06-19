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
import { IPlotModel } from "../../../../shared/models/plotmodel.model"
import { styled } from "@mui/styles"
import grey from "@mui/material/colors/grey"

interface ITableComponent {
  plotModel: IPlotModel | null
  children?: React.ReactNode;
}

const CounterfactualsTable = (props: ITableComponent) => {
  const { plotModel } = props


  return (
    <>
    {console.log("counterfactuals", plotModel)}
    <Paper
      className="Category-Item"
      elevation={2}
      sx={{
        borderRadius: 4,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        rowGap: 0,
        minWidth: "300px",
        overflow: "hidden"
      }}
    >
      <Box sx={{ px: 1.5,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${grey[400]}` }}>
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
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <TableContainer component={Paper} sx={{width: "99%"}}>
          <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {Object.keys(plotModel?.tableContents || {}).map(
                  (key, index) => (
                    <TableCell key={`table-header-${key}-${index}`}>
                      {key}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {plotModel?.tableContents[Object.keys(plotModel.tableContents)[0]].values.map(
                (value, index) => {
                  return (
                    <TableRow key={`table-row-${index}`}>
                      {Object.keys(plotModel?.tableContents || {}).map(
                        (key, idx) => (
                          <TableCell key={`table-cell-${key}-${index}`}>
                            {plotModel?.tableContents[Object.keys(plotModel.tableContents)[idx]].values[index]}
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  )
                },
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
    </>
  )
}
export default CounterfactualsTable
