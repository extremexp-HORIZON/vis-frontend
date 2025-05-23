import { useMemo } from 'react';
import type { RootState } from '../../../store/store';
import { useAppSelector } from '../../../store/store';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { setCache } from '../../../shared/utils/localStorageCache';
import { DetailsCard, DetailsCardItem } from '../../../shared/components/details-card';

const WorkflowParameter = () => {
  const { workflows } = useAppSelector((state: RootState) => state.progressPage);
  const { tab } = useAppSelector(state => state.workflowPage);
  const selectedParam = tab?.dataTaskTable.selectedItem?.data;
  const { experimentId } = useParams();

  const filteredWorkflows = workflows.data
    ?.filter(w => w.status !== 'SCHEDULED')
    .filter(w =>
      w.params.find(
        param => param.name === selectedParam?.param?.name && param.value === selectedParam?.param?.value
      )
    );

  const allParams = workflows?.data
    ?.filter(w => w.status !== 'SCHEDULED')
    ?.flatMap(w => w.params?.filter(p => p.name === selectedParam?.param?.name) ?? []) ?? [];

  const paramValueCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const param of allParams) {
      const key = String(param.value);

      counts[key] = (counts[key] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  }, [allParams]);

  const compareKey = useMemo(() => `compare-${Date.now()}`, []);
  const handleClick = () => {
    const workflowIds = filteredWorkflows?.map(workflow => workflow.id);

    setCache(compareKey, { workflowIds }, 5 * 60 * 1000);
  };

  const maxCount = Math.max(...paramValueCounts.map(d => d.count));

  return (
    <DetailsCard title="Parameter Details">
      <DetailsCardItem
        label={selectedParam?.param?.name ? selectedParam.param.name : ''}
        value={selectedParam?.param?.value}
      />
      <DetailsCardItem
        label="Used in task"
        value={
          <>
            {selectedParam?.param?.task}
            { selectedParam?.variant && <Chip size="small" color="primary" label={selectedParam?.variant} sx={{ ml: 1 }} />}
          </>
        }
      />

      <Typography sx={{ mt: 2 }}>
        Value Distribution Across Workflows
      </Typography>

      <Box mt={1}>
        {paramValueCounts.map(({ value, count }) => (
          <Box key={value} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 60 }}>
              <Typography variant="body2">{value}</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, mx: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(count / maxCount) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: value === String(selectedParam?.param?.value) ? 'primary' : '#bdbdbd',
                  },
                }}
              />
            </Box>
            <Box sx={{ width: 100, textAlign: 'right' }}>
              <Typography variant="caption">{count} workflow{count > 1 && 's'} </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box mt={2}>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          component="a"
          href={`/${experimentId}/monitoring?tab=1&compareId=${compareKey}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          View workflows using this value
        </Typography>
      </Box>
    </DetailsCard>
  );
};

export default WorkflowParameter;
