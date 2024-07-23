import React, { useState } from 'react';
import { Vega, VisualizationSpec } from 'react-vega';
import { Paper, Box, Typography, IconButton, Tooltip, FormControl, Select, MenuItem } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useAppSelector, useAppDispatch, RootState } from '../../../../store/store';
 
interface Props {
    workflowIds?: number[];
}
 
const CompletedMetricCorrelation: React.FC<Props> = ({ workflowIds }) => {
    const { workflows  } = useAppSelector(
        (state: RootState) => state.progressPage,
      )
    const dispatch = useAppDispatch();
    let filteredWorkflows = workflows.data.filter(wf => wf.workflowInfo.status === "completed");
    if (workflowIds && workflowIds.length > 0) {
        filteredWorkflows = filteredWorkflows.filter(wf => workflowIds.includes(wf.workflowId));
    }
    
    const availableMetrics = ['accuracy', 'precision', 'recall', 'f1_score', 'f1_macro', 'false_negatives', 'false_positives', 'true_negatives', 'true_positives', 'runtime'];
 
    const [xMetric, setXMetric] = useState<string>("precision");
    const [yMetric, setYMetric] = useState<string>("accuracy");
 
    const handleAxisSelection = (axis: string) => (event: any) => {
        const value = event.target.value as string;
        if (axis === "x") {
            setXMetric(value);
        } else {
            setYMetric(value);
        }
    };
 
    const showLegend = filteredWorkflows.length < 9;
 
    const spec: VisualizationSpec = {
        width: 400,
        height: 400,
        padding: 5,
        data: [
            {
                name: "table",
                values: filteredWorkflows.map((wf: any) => ({
                    x: wf.metrics[xMetric],
                    y: wf.metrics[yMetric],
                    category: `Workflow ${wf.workflowId}`
                }))
            }
        ],
        scales: [
            { name: "x", type: "linear", range: "width", zero: false, domain: { data: "table", field: "x" } },
            { name: "y", type: "linear", range: "height", zero: false, domain: { data: "table", field: "y" } },
            { name: "color", type: "ordinal", domain: { data: "table", field: "category" }, range: { scheme: "category10" } }
        ],
        axes: [
            { orient: "bottom", scale: "x", title: xMetric },
            { orient: "left", scale: "y", title: yMetric }
        ],
        marks: [
            {
                type: "symbol",
                from: { data: "table" },
                encode: {
                    enter: {
                        x: { scale: "x", field: "x" },
                        y: { scale: "y", field: "y" },
                        fill: { scale: "color", field: "category" },
                        size: { value: 100 },
                        tooltip: { signal: `{'${xMetric}': format(datum.x, '.2f'), '${yMetric}': format(datum.y, '.2f'), 'Category': datum.category}` }
                    }
                }
            }
        ],
        legends: showLegend ? [
            {
                fill: "color",
                orient: "bottom",
                title: "Workflow ID",
                direction: "horizontal",
                encode: {
                    symbols: {
                        update: {
                            shape: { value: "circle" },
                            stroke: { value: "transparent" }
                        }
                    },
                    labels: {
                        update: {
                            fontSize: { value: 10 }  // Adjust label size as needed
                        }
                    }
                }
            }
        ] : []
    };
 
    return (
        <Paper
            elevation={2}
            sx={{
                borderRadius: 4,
                width: "inherit",
                display: "flex",
                flexDirection: "column",
                rowGap: 0,
                minWidth: "300px",
                height: "100%",
            }}
        >
            <Box
                sx={{
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: 1,
                    borderColor: 'grey.400'
                }}
            >
                <Typography fontSize={"1rem"} fontWeight={600}>
                    Metric Correlation
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Description not available.">
                    <IconButton>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", p: 1.5 }}>
                {['x', 'y'].map(axis => (
                    <Box key={axis} sx={{ display: "flex", alignItems: "center", px: 1.5 }}>
                        <Typography fontSize={"0.8rem"}>{`${axis}-axis:`}</Typography>
                        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                            <Select
                                value={axis === 'x' ? xMetric : yMetric}
                                onChange={handleAxisSelection(axis)}
                                sx={{ fontSize: "0.8rem" }}
                            >
                                {availableMetrics.map(metric => (
                                    <MenuItem key={metric} value={metric}>
                                        {metric}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                ))}
            </Box>
            <Box sx={{ width: "100%", px: 1 }}>
                <Vega spec={spec} actions={false} />
            </Box>
        </Paper>
    );
};
 
export default CompletedMetricCorrelation;