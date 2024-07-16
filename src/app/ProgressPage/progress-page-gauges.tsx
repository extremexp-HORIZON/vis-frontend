import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { GaugeContainer, GaugeValueArc, GaugeReferenceArc } from '@mui/x-charts/Gauge';
import workflows from '../../shared/data/workflows.json';

interface MetricGaugeProps {
  title: string;
  value: number;
  isTime?: boolean;
}

const MetricGauge: React.FC<MetricGaugeProps> = ({ title, value, isTime = false }) => {
  const displayValue = isTime ? `${value.toFixed(3)} sec` : `${(value).toFixed(3)}`;
  const maxValue = isTime ? 5 : 100; // Set max to 5 for time values and 100 for percentages
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
      <Typography variant="h6">Avg. {title} per Workflow</Typography>
      <GaugeContainer width={150} height={150} sx={{ alignSelf: "center" }} startAngle={-110} endAngle={110} value={isTime ? value : value * 100}>
        {/* <svg width="0" height="0">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#F4FAD4', stopOpacity: 1 }} />
              <stop offset="14.29%" style={{ stopColor: '#D7F1AC', stopOpacity: 1 }} />
              <stop offset="28.57%" style={{ stopColor: '#A9E3AF', stopOpacity: 1 }} />
              <stop offset="42.86%" style={{ stopColor: '#82CDBB', stopOpacity: 1 }} />
              <stop offset="57.14%" style={{ stopColor: '#63C1BF', stopOpacity: 1 }} />
              <stop offset="71.43%" style={{ stopColor: '#1DA8C9', stopOpacity: 1 }} />
              <stop offset="85.71%" style={{ stopColor: '#2367AC', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2B2D84', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg> */}
        <GaugeReferenceArc min={0} max={maxValue} />
        <GaugeValueArc style={{ fill: theme.palette.primary.main }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="20" fill={theme.palette.text.primary} fontWeight={600}>
          {displayValue}
        </text>
      </GaugeContainer>
    </Box>
  );
};


const RuntimeDisplay: React.FC<{ value: number }> = ({ value }) => {
    return (
        <Box sx={{ textAlign: 'center', display: "flex", flexDirection: 'column', alignItems: "center" }}>
            <Typography variant="h6">
                Avg. Runtime per Workflow
            </Typography>
            <Typography variant="h4" sx={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontWeight: 600,
                height: "100px",
                width: "100px",
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                flex: 1,
                color: theme => theme.palette.primary.main
            }}>
                {value.toFixed(2)}s
            </Typography>
        </Box>
    );
};


interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  runtime: number;
}

const ProgressPageGauges: React.FC = () => {
    const [metrics, setMetrics] = useState<Metrics>({
        accuracy: 0,
        precision: 0,
        recall: 0,
        runtime: 0
    });

    useEffect(() => {
        const completedWorkflows = workflows.filter(workflow => workflow.workflowInfo.status === "completed");
        const extractedMetrics = completedWorkflows.map(workflow => ({
            accuracy: workflow.metrics?.accuracy ?? 0,
            precision: workflow.metrics?.precision ?? 0,
            recall: workflow.metrics?.recall ?? 0,
            runtime: workflow.metrics?.runtime ?? 0
        }));

        const calculateAverage = (metric: keyof Metrics) => {
            const values = extractedMetrics.map(m => m[metric]);
            return values.length > 0 ? values.reduce((acc, cur) => acc + cur, 0) / values.length : 0;
        };

        setMetrics({
            accuracy: calculateAverage('accuracy'),
            precision: calculateAverage('precision'),
            recall: calculateAverage('recall'),
            runtime: calculateAverage('runtime')
        });
    }, []);

    return (
        <Box sx={{display: "flex", justifyContent: "center", columnGap: 5, flexWrap: "wrap"}}>
            <MetricGauge title="Accuracy" value={metrics.accuracy} />
            <MetricGauge title="Precision" value={metrics.precision} />
            <MetricGauge title="Recall" value={metrics.recall} />
            <RuntimeDisplay value={metrics.runtime} />
        </Box>
    );
};

export default ProgressPageGauges;
