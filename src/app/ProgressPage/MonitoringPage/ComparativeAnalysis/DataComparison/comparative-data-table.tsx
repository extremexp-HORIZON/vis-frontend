import { Box, Typography } from '@mui/material';
import type { IDataAsset } from '../../../../../shared/models/experiment/data-asset.model';
import Histogram from './comparative-data-histogram';
import { useAppSelector } from '../../../../../store/store';
import type { RootState } from '../../../../../store/store';

export interface SummaryTableProps {
  dataset: IDataAsset;
  workflowId: string;
  title?: string;
  scrollRef?: (el: HTMLDivElement | null) => void;
}

const SummaryTable = ({ dataset, workflowId, title, scrollRef }: SummaryTableProps) => {
  const selectedColumns = useAppSelector(
    (state: RootState) =>
      state.monitorPage.comparativeDataExploration.dataAssetsControlPanel[dataset.name]?.selectedColumns ?? []
  );

  const workflowColors = useAppSelector(
    (state) => state.monitorPage.workflowsTable.workflowColors
  );

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ pl: 2 }}>
          {title}
        </Typography>
      )}

      <Box ref={scrollRef} sx={{ p: 2, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {selectedColumns.map((col) => (
            <Box key={col} sx={{ minWidth: 200, flexShrink: 0 }}>
              <Histogram
                columnName={col}
                dataset={dataset}
                workflowId={workflowId}
                color={workflowColors[workflowId]}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryTable;
