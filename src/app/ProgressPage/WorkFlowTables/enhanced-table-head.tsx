import { Box, Checkbox, TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";
import type { Data, Order } from './workflow-table';
import type { Column } from './workflow-table';
import { visuallyHidden } from '@mui/utils';


interface EnhancedTableProps {
  columns: Column[];
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export default function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, columns, order, orderBy, numSelected, rowCount, onRequestSort } =
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
        <TableCell align="right" colSpan={1} />
        <TableCell align="right" colSpan={1} />
        <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.light}` }} align="center" colSpan={1}>
          Task Variant
        </TableCell>
        <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.dark}` }} align="center" colSpan={3}>
          Parameters
        </TableCell>
        <TableCell align="right" colSpan={1} />
        <TableCell sx={{ borderBottom: theme => `2px solid ${theme.palette.primary.light}` }} align="center" colSpan={1}>
          Constraints
        </TableCell>
        <TableCell align="right" colSpan={1} />
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
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sx={{ top: 57, minWidth: headCell.minWidth }}
            // align={headCell.numeric ? 'right' : 'left'}
            // padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          > {headCell.id === 'action' ? headCell.label
            :
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
            </TableSortLabel>}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}