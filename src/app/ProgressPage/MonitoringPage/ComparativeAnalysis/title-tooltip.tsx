import type { RootState } from '../../../../store/store';
import { useAppSelector } from '../../../../store/store';
import {
  Box,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

const TitleTooltip = ({ workflowId }: {workflowId: string}) => {
  const { workflows } =
      useAppSelector((state: RootState) => state.progressPage);
  const workflowColors = useAppSelector(
    (state) => state.monitorPage.workflowsTable.workflowColors
  );
  const workflow = workflows.data?.find(workflow => workflow.id === workflowId);

  if(!workflow) return;

  return (
    <TableContainer sx={{ width: '100%', height: '100%' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>workflowId</TableCell>
            {workflow.params.map(p => (<TableCell>{p.name}</TableCell>))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Box
                sx={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: workflowColors[workflowId] || '#3f51b5',
                  marginRight: 2
                }}
              >
              </Box>
              {workflowId}
            </TableCell>
            {workflow.params.map(p => (<TableCell>{p.value}</TableCell>))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TitleTooltip;
