import { Box, Checkbox, styled, TableCell, tableCellClasses, TableHead, TableRow, TableSortLabel } from "@mui/material";
import type { Data, Order } from './workflow-table';
import type { Column } from './workflow-table';
import { visuallyHidden } from '@mui/utils';
import { grey } from "@mui/material/colors";


interface EnhancedTableProps {
  columns: Column[];
  parametersLength: number;
  metricsLength: number;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

const FixedTableCell = styled(TableCell)(({ theme }) => ({
  position: "sticky",
  right: 0,
  // backgroundColor: theme.palette.customGrey.light,
  zIndex: 100,
  borderLeft: `1px solid ${grey[300]}`,
  [`&.${tableCellClasses.head}`]: {
    // backgroundColor: theme.palette.customGrey.light,
  },
}))

export default function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, columns, order, orderBy, numSelected, rowCount, onRequestSort, parametersLength, metricsLength } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };
  return (
    <TableHead>
      <TableRow sx={{
        "& th": {
          backgroundColor: theme => theme.palette.customGrey.main
        }
      }}>
        <TableCell align="right" colSpan={1} sx={{zIndex: 100}} />
        <TableCell align="right" colSpan={1} sx={{zIndex: 100}}/>
        {/* <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.light}`, zIndex: 100 }} align="center" colSpan={1}>
          Task Variant
        </TableCell> */}
        <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.dark}`, zIndex: 100 }} align="center" colSpan={parametersLength}>
          Parameters
        </TableCell>
        <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.light}`, zIndex: 100 }} align="center" colSpan={metricsLength}>
          Metrics
        </TableCell>
        <TableCell align="right" colSpan={1} />
        <TableCell align="right" colSpan={1} />
        {/* <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.light}`, zIndex: 100 }} align="center" colSpan={1}>
          Constraints
        </TableCell> */}
        <FixedTableCell align="right" colSpan={1} sx={{zIndex: 100}} />
      </TableRow>
      <TableRow
        sx={{
          "& th": {
            backgroundColor: theme => theme.palette.customGrey.main
          }
        }}
      >
        <TableCell
          padding='checkbox'
          key={"checkbox-cell"}
          // align={"center"}
          style={{ top: 57, minWidth: "50" }}
        >
          <Checkbox
            sx={{color: theme => theme.palette.primary.main}}
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all workflows',
            }}
          />
        </TableCell>
        {columns.map((headCell) => (
          headCell.id === "action" ?
          <FixedTableCell
            key={headCell.id}
            align={headCell.align}
            sx={{ top: 57, minWidth: headCell.minWidth }}
            // align={headCell.numeric ? 'right' : 'left'}
            // padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </FixedTableCell> :
          <TableCell
          key={headCell.id}
          align={headCell.align}
          sx={{ top: 57, minWidth: headCell.minWidth }}
          // align={headCell.numeric ? 'right' : 'left'}
          // padding={headCell.disablePadding ? 'none' : 'normal'}
          sortDirection={orderBy === headCell.id ? order : false}
        >
          <TableSortLabel
            active={headCell.sortable}
            direction={orderBy === headCell.id ? order : 'asc'}
            onClick={createSortHandler(headCell.id)}
            sx={{"& .MuiTableSortLabel-icon": {color: theme => `${theme.palette.primary.main} !important`}}}
          >
            {headCell.label}
            {/* {orderBy === headCell.id ? ( */}
            {headCell.sortable &&
              <Box component="span" sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>}
            {/* ) : null} */}
          </TableSortLabel>
        </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}