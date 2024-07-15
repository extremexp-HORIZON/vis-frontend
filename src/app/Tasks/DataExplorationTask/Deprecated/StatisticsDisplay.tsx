
import React from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

interface StatisticsProps {
    statistics: { [key: string]: { mean: number, median: number, min: number, max: number, stdDeviation: number } };
}

const StatisticsDisplay: React.FC<StatisticsProps> = ({ statistics }) => (
    <Box sx={{ width: "50%", px: 1, py: 1 }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>-</TableCell>
                    <TableCell>Mean</TableCell>
                    <TableCell>Min</TableCell>
                    <TableCell>Max</TableCell>
                    <TableCell>Std Deviation</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Object.keys(statistics).map(column => (
                    <TableRow key={column}>
                        <TableCell component="th" scope="row">
                            {column}
                        </TableCell>
                        <TableCell>{statistics[column].mean.toFixed(2)}</TableCell>
                        <TableCell>{statistics[column].min.toFixed(2)}</TableCell>
                        <TableCell>{statistics[column].max.toFixed(2)}</TableCell>
                        <TableCell>{statistics[column].stdDeviation.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Box>
);

export default StatisticsDisplay;