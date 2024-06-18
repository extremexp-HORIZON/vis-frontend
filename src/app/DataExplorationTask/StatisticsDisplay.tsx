// import React from 'react';
// import { Box, Typography, Grid } from '@mui/material';

// interface StatisticsProps {
//     statistics: { [key: string]: { mean: number, median: number, min: number, max: number, stdDeviation: number } };
// }

// const StatisticsDisplay: React.FC<StatisticsProps> = ({ statistics }) => (
//     <Box sx={{ width: "100%", px: 1, py: 1 }}>
//         {Object.keys(statistics).map(column => (
//             <Box key={column} sx={{ mb: 2 }}>
//                 <Typography variant="h6" sx={{ mb: 1 }}>Statistics for {column}</Typography>
//                 <Grid container spacing={2}>
//                     {['mean', 'median', 'min', 'max', 'stdDeviation'].map(stat => (
//                         <Grid item xs={12} sm={2} key={stat}>
//                             <Typography variant="body2">{stat.charAt(0).toUpperCase() + stat.slice(1)}: {statistics[column][stat].toFixed(2)}</Typography>
//                         </Grid>
//                     ))}
//                 </Grid>
//             </Box>
//         ))}
//     </Box>
// );

// export default StatisticsDisplay;



import React from 'react';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

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