import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import Loader from '../../../../shared/components/loader';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import InfoMessage from '../../../../shared/components/InfoMessage';
import { Box, Grid } from '@mui/material';
import { logger } from '../../../../shared/utils/logger';

interface DataField {
  values: any[]
}

interface UmapComponentProps {
  data1: Record<string, DataField>
  data2: { appliedAffectedActions: Record<string, DataField> }
  colorField: string
}

const UmapComponent = ({ data1, data2, colorField }: UmapComponentProps) => {
  logger.log('colorField', colorField);
  const [umapResults, setUmapResults] = useState<{
    umap1: number[][] | null
    umap2: number[][] | null
  }>({
    umap1: null,
    umap2: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chosenAction = data1.Chosen_Action.values;

  // Memoized column names filtering
  const columnNamesFiltered = useMemo(
    () =>
      Object.keys(data1).filter(
        name =>
          !['Cluster', 'Chosen_Action'].includes(name) &&
          !/^Action\d*_Prediction$/.test(name),
      ),
    [data1],
  );

  const columnNamesFiltered2 = useMemo(
    () =>
      Object.keys(data2.appliedAffectedActions).filter(
        name =>
          !['Cluster', 'Chosen_Action'].includes(name) &&
          !/^Action\d*_Prediction$/.test(name),
      ),
    [data2],
  );

  // Prepare formatted payloads
  const formattedPayload1 = useMemo(
    () =>
      data1[columnNamesFiltered[0]].values.map((_, rowIndex) =>
        columnNamesFiltered.map(colName =>
          parseFloat(data1[colName].values[rowIndex]),
        ),
      ),
    [data1, columnNamesFiltered],
  );

  const formattedPayload2 = useMemo(
    () =>
      data2.appliedAffectedActions[columnNamesFiltered2[0]].values.map(
        (_, rowIndex) =>
          columnNamesFiltered2.map(colName =>
            parseFloat(data2.appliedAffectedActions[colName].values[rowIndex]),
          ),
      ),
    [data2, columnNamesFiltered2],
  );

  const api = axios.create({
    baseURL: '/api/data/', // Let Nginx handle the proxy
    withCredentials: true, // If authentication is needed
  });

  // Combined fetch function
  const fetchUmapData = async () => {
    try {
      setLoading(true);
      const [response1, response2] = await Promise.all([
        api.post<number[][]>('umap', formattedPayload1),
        api.post<number[][]>('umap', formattedPayload2),
      ]);

      setUmapResults({ umap1: response1.data, umap2: response2.data });
    } catch (err) {
      setError('Failed to fetch UMAP data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUmapData();
  }, []);

  // Prepare scatter plot data
  const createScatterData = (umapResult: number[][] | null) =>
    umapResult?.map((point, index) => ({
      x: point[0],
      y: point[1],
      action: chosenAction[index],
    })) || [];

  // Shared legend spec generator
  const sharedLegendSpec = (data1: any[], data2: any[]) => ({
    description: 'Two scatter plots with a shared legend',
    hconcat: [
      {
        title: 'Action Selection',
        width: 450,
        height: 450,
        data: { values: data1 },
        mark: { type: 'point', opacity: 0.8 },
        params: [
          {
            name: 'industry',
            select: { type: 'point', fields: ['action'] },
            bind: 'legend',
          },
        ],
        encoding: {
          x: { field: 'x', type: 'quantitative', title: 'UMAP Dimension 1' },
          y: { field: 'y', type: 'quantitative', title: 'UMAP Dimension 2' },
          color: { field: 'action', type: 'nominal', title: 'Chosen Action' },
          tooltip: [
            { field: 'action', type: 'nominal', title: 'Chosen Action' },
            { field: 'x', type: 'quantitative' },
            { field: 'y', type: 'quantitative' },
          ],
          opacity: {
            condition: { param: 'industry', value: 1 },
            value: 0.01,
          },
        },
      },
      {
        title: 'Post-Action Selection',
        data: { values: data2 },
        width: 450,
        height: 450,
        mark: { type: 'point', opacity: 0.8 },
        params: [
          {
            name: 'industry',
            select: { type: 'point', fields: ['action'] },
            bind: 'legend',
          },
        ],
        encoding: {
          x: { field: 'x', type: 'quantitative', title: 'UMAP Dimension 1' },
          y: { field: 'y', type: 'quantitative', title: 'UMAP Dimension 2' },
          color: { field: 'action', type: 'nominal', title: 'Chosen Action' },
          tooltip: [
            { field: 'action', type: 'nominal', title: 'Chosen Action' },
            { field: 'x', type: 'quantitative' },
            { field: 'y', type: 'quantitative' },
          ],
          opacity: {
            condition: { param: 'industry', value: 1 },
            value: 0.01,
          },
        },
      },
    ],
  });

  const specShared = sharedLegendSpec(
    createScatterData(umapResults.umap1),
    createScatterData(umapResults.umap2),
  );
  const predictionSpec = (umapResult: number[][] | null, colorData: any[]) => ({

    width: 450,
    height: 450,
    data: {
      values:
        umapResult?.map((point, index) => ({
          x: point[0],
          y: point[1],
          colorValue: colorData[index] === '0' ? '0' : '1', // Color based on prediction value
        })) || [],
    },
    mark: { type: 'point', opacity: 0.8 },
    params: [
      {
        name: 'industry',
        select: { type: 'point', fields: ['colorValue'] },
        bind: 'legend',
      },
    ],
    encoding: {
      x: { field: 'x', type: 'quantitative', title: 'UMAP Dimension 1' },
      y: { field: 'y', type: 'quantitative', title: 'UMAP Dimension 2' },
      color: {
        field: 'colorValue',
        type: 'nominal',
        title: 'Prediction Value',
        scale: { domain: ['0', '1'], range: ['red', 'green'] },
      },
      tooltip: [
        { field: 'colorValue', type: 'nominal', title: 'Prediction Value' },
        { field: 'x', type: 'quantitative' },
        { field: 'y', type: 'quantitative' },
      ],
      opacity: {
        condition: { param: 'industry', value: 1 },
        value: 0.01,
      },
    },
  });

  const spec = (data: { x: number; y: number; action: string }[]) => ({
    width: 450,
    height: 450,
    mark: { type: 'point', opacity: 0.8 },
    params: [
      {
        name: 'industry',
        select: { type: 'point', fields: ['action'] },
        bind: 'legend',
      },
    ],
    encoding: {
      x: { field: 'x', type: 'quantitative', title: 'UMAP Dimension 1' },
      y: { field: 'y', type: 'quantitative', title: 'UMAP Dimension 2' },
      color: {
        field: 'action',
        type: 'nominal',
        title: 'Chosen Action',
      },
      tooltip: [
        { field: 'action', type: 'nominal', title: 'Chosen Action' },
        { field: 'x', type: 'quantitative' },
        { field: 'y', type: 'quantitative' },
      ],
      opacity: {
        condition: { param: 'industry', value: 1 },
        value: 0.01,
      },
    },
    data: { values: data },
  });

  const spec1 = predictionSpec(
    umapResults.umap1,
    data1[colorField]?.values || [],
  );

  // i want to parse float the data1[colorField]?.values)
  if(loading) return <Loader />;

  if(error)
    return(
      <InfoMessage
        message={error}
        type="info"
        fullHeight
      />
    );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {umapResults.umap1 && umapResults.umap2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <ResponsiveCardVegaLite
              actions={false}
              title="Action Selection"
              details="UMAP projection before action"
              spec={spec(createScatterData(umapResults.umap1))}
              isStatic={false}
              maxHeight={400}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ResponsiveCardVegaLite
              actions={false}
              title="Post-Action Selection"
              details="UMAP projection after action"
              spec={spec(createScatterData(umapResults.umap2))}
              isStatic={false}
              maxHeight={400}
            />
          </Grid>
        </Grid>
      )}
      {umapResults.umap1 &&
        <Box>
          <ResponsiveCardVegaLite
            actions={false}
            spec={spec1}
            title={'Affected Clusters'}
            details={'UMAP plot colored by prediction values'}
            isStatic={false}
            maxHeight={400}
          />
        </Box>
      }
    </Box>
  );
};

export default UmapComponent;
