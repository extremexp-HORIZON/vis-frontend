import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import { useEffect, useMemo, useState } from 'react';
import type { RootState } from '../../../../store/store';
import { useAppSelector } from '../../../../store/store';
import theme from '../../../../mui-theme';

import WorkflowDetailsAccordion from './WorkflowDetailsAccordition';
import ModelInsightsAccordion from './ModelInsightsAccordition';

export default function WorkflowTreeView() {
  const { tab } = useAppSelector((s: RootState) => s.workflowPage);

  const hasExplainability = useMemo(() => {
    const tasks = tab?.workflowConfiguration.tasks;

    if (!tasks) return true;

    return tasks.some(t => typeof t.name === 'string' && /explainability/i.test(t.name));
  }, [tab?.workflowConfiguration.tasks]);

  const [workflowExpanded, setWorkflowExpanded] = useState(true);
  const [modelExpanded, setModelExpanded] = useState<boolean>(hasExplainability);

  useEffect(() => setModelExpanded(hasExplainability), [hasExplainability]);

  if (!tab?.workflowConfiguration) return null;

  return (
    <Box sx={{ overflow: 'auto' }}>
      {/* Workflow Details */}
      <Accordion
        expanded={workflowExpanded}
        disableGutters
        sx={{ boxShadow: 'none', '&::before': { display: 'none' } }}
      >
        <AccordionSummary
          onClick={(e) => e.stopPropagation()}
          sx={{ borderBottom: '1px solid #ccc', pointerEvents: 'none' }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%', pointerEvents: 'auto', cursor: 'default' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTreeIcon color="primary" />
              <Typography fontWeight={600}>Workflow Details</Typography>
            </Box>
            <Box
              onClick={(e) => { e.stopPropagation(); setWorkflowExpanded(p => !p); }}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <ExpandMoreIcon />
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <WorkflowDetailsAccordion />
        </AccordionDetails>
      </Accordion>

      {/* Model Insights */}
      <Accordion
        expanded={modelExpanded}
        disableGutters
        sx={{ boxShadow: 'none', '&::before': { display: 'none' } }}
      >
        <AccordionSummary
          disabled={!hasExplainability}
          onClick={(e) => e.stopPropagation()}
          sx={{ borderBottom: '1px solid #ccc', pointerEvents: 'none' }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%', pointerEvents: 'auto', cursor: 'default' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyAltRoundedIcon color="primary" />
              <Typography fontWeight={600} sx={{ color: hasExplainability ? 'inherit' : theme.palette.text.disabled }}>
                Model Insights
              </Typography>
            </Box>
            <Box
              onClick={(e) => { e.stopPropagation(); if (hasExplainability) setModelExpanded(p => !p); }}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <ExpandMoreIcon />
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <ModelInsightsAccordion />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
