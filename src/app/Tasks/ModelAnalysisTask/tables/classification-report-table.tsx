import { useAppSelector } from '../../../../store/store';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import ResponsiveCardTable from '../../../../shared/components/responsive-card-table';
import Loader from '../../../../shared/components/loader';

const format = (value: string | number): string =>
  typeof value === 'number' ? value.toFixed(3) : String(value);

const ClassificationReportTable = () => {
  const { tab } = useAppSelector((state) => state.workflowPage);
  const summary = tab?.workflowTasks?.modelAnalysis?.modelSummary;

  const classificationReport = summary?.data?.classificationReport ?? [];
  const overallMetrics = summary?.data?.overallMetrics ?? {};
  const totalSupport = classificationReport.reduce(
    (sum, row) => sum + Number(row.support ?? 0),
    0
  );

  const metricKeys = classificationReport.length
    ? Object.keys(classificationReport[0]).filter((k) => k !== 'label' && k !== 'support')
    : [];

  const computeAverage = (key: string, weighted = false): number => {
    if (weighted) {
      if (totalSupport === 0) return 0;

      return (
        classificationReport.reduce((sum, row) => {
          const val = Number(row[key] ?? 0);
          const support = Number(row.support ?? 0);

          return sum + val * support;
        }, 0) / totalSupport
      );
    }

    if (classificationReport.length === 0) return 0;

    return (
      classificationReport.reduce((sum, row) => sum + Number(row[key] ?? 0), 0) /
      classificationReport.length
    );
  };

  const handleExportCsv = () => {
    if (!classificationReport.length) return;

    const headers = ['label', ...metricKeys, 'support'];

    const rowsCsv = classificationReport.map(row =>
      headers
        .map(h => {
          const value = row[h];

          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value ?? '';
        })
        .join(',')
    );

    const accuracyRow = [
      'Accuracy',
      ...metricKeys.map((_, idx) =>
        idx === metricKeys.length - 1 ? overallMetrics.accuracy ?? '' : ''
      ),
      ''
    ];
    const macroAvgRow = ['Macro avg', ...metricKeys.map(k => computeAverage(k)), totalSupport];
    const weightedAvgRow = ['Weighted avg', ...metricKeys.map(k => computeAverage(k, true)), totalSupport];

    const csvContent = [
      headers.join(','),
      ...rowsCsv,
      accuracyRow.join(','),
      macroAvgRow.join(','),
      weightedAvgRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `classification-summary-${new Date().toISOString()
        .split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loading = summary?.loading;
  const error = summary?.error;

  const content = () => {
    if (loading)
      return (
        <Loader/>
      );
    if (error)
      return (
        <InfoMessage
          message="Error fetching classification summary."
          type="info"
          icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
          fullHeight
        />
      );

    if (!classificationReport.length && !loading && !error)
      return (
        <InfoMessage
          message="No classification report available."
          type="info"
          icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
          fullHeight
        />
      );

    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell/>
              {metricKeys.map((key) => (
                <TableCell align="right" key={key}>
                  <Typography variant="body2" fontWeight="bold">{key}</Typography>
                </TableCell>
              ))}
              <TableCell align="right"><b>Support</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classificationReport.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.label}</TableCell>
                {metricKeys.map((key) => (
                  <TableCell key={key} align="right">
                    {format(row[key] ?? '-')}
                  </TableCell>
                ))}
                <TableCell align="right">{row.support}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell><b>Accuracy</b></TableCell>
              {metricKeys.map((key, idx) => (
                <TableCell key={key} align="right">
                  {idx === metricKeys.length - 1
                    ? format(overallMetrics.accuracy ?? '-')
                    : null}
                </TableCell>
              ))}
              <TableCell align="right">{null}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Macro avg</b></TableCell>
              {metricKeys.map((key) => (
                <TableCell key={key} align="right">
                  {format(computeAverage(key))}
                </TableCell>
              ))}
              <TableCell align="right">{totalSupport}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Weighted avg</b></TableCell>
              {metricKeys.map((key) => (
                <TableCell key={key} align="right">
                  {format(computeAverage(key, true))}
                </TableCell>
              ))}
              <TableCell align="right">{totalSupport}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <Box>
      <ResponsiveCardTable
        title="Classification Report"
        showFullScreenButton
        onDownload={handleExportCsv}
        downloadLabel="Export as CSV"
        downloadSecondaryText="Download classification metrics"
        noPadding={true}
      >
        <Box
          sx={{
            height: 250,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {content()}
        </Box>
      </ResponsiveCardTable>
    </Box>
  );
};

export default ClassificationReportTable;
