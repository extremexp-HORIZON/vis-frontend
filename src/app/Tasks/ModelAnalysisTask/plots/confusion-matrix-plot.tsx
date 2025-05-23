import { useParams } from 'react-router-dom';
import type { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useEffect, useState } from 'react';
import { fetchConfusionMatrix } from '../../../../store/slices/modelAnalysisSlice';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import Loader from '../../../../shared/components/loader';

const ConfusionMatrixPlot = () => {
  const dispatch = useAppDispatch();
  const { experimentId } = useParams();
  const { tab, isTabInitialized } = useAppSelector((state: RootState) => state.workflowPage);
  const [confusionMatrixData, setConfusionMatrixData] = useState<
        { actual: string; predicted: string; value: number }[]
    >([]);

  const confusionMatrix = tab?.workflowTasks.modelAnalysis?.modelConfusionMatrix;

  const transformConfusionMatrix = (labels: string[], matrix: number[][]) => {

    const data: { actual: string; predicted: string; value: number }[] = [];

    for (let actualIdx = 0; actualIdx < matrix.length; actualIdx++) {
      for (let predictedIdx = 0; predictedIdx < matrix[actualIdx].length; predictedIdx++) {
        data.push({
          actual: String(labels[actualIdx]),
          predicted: String(labels[predictedIdx]),
          value: matrix[actualIdx][predictedIdx],
        });
      }
    }

    return data;
  };

  useEffect(() => {
    if(tab) {
      dispatch(fetchConfusionMatrix({ experimentId: experimentId || '', runId: tab.workflowId || '' }));
    }
  }, [isTabInitialized]);

  useEffect(() => {
    if (confusionMatrix?.data?.labels && confusionMatrix?.data?.matrix) {
      const data = transformConfusionMatrix(
        confusionMatrix.data.labels,
        confusionMatrix.data.matrix
      );
      const maxValue = Math.max(...data.map(d => d.value));
      const dataWithMax = data.map(d => ({
        ...d,
        __max__: maxValue,
      }));

      setConfusionMatrixData(dataWithMax);
    }
  }, [confusionMatrix?.data]);

  const confusionMatrixSpec = {
    data: { values: confusionMatrixData },
    encoding: {
      x: {
        field: 'predicted',
        type: 'ordinal',
        axis: { title: 'Predicted Label', labelAngle: 0 }
      },
      y: {
        field: 'actual',
        type: 'ordinal',
        axis: { title: 'Actual Label' }
      },
      color: {
        field: 'value',
        type: 'quantitative',
        scale: {
          range: ['#ffffe0', '#08306b']
        },
        legend: { title: 'Count' }
      },
    },
    layer: [
      {
        mark: { type: 'rect', tooltip: true },
      },
      {
        mark: {
          type: 'text',
          align: 'center',
          baseline: 'middle',
          fontSize: 12,
          fontWeight: 'bold'
        },
        encoding: {
          text: { field: 'value', type: 'quantitative' },
          color: {
            condition: {
              test: 'datum.value > 0.4 * datum.__max__',
              value: 'white'
            },
            value: 'black'
          }
        }
      }
    ],
  };

  const loading = (
    <Loader/>
  );

  const error = (
    <InfoMessage
      message="Error fetching confusion matrix."
      type="info"
      icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
      fullHeight
    />
  );

  const shouldShowLoading = !!confusionMatrix?.loading;
  const shouldShowError = !!confusionMatrix?.error;

  return (
    <ResponsiveCardVegaLite
      spec={confusionMatrixSpec}
      actions={false}
      title={'Confusion Matrix'}
      aspectRatio={2}
      minHeight={250}
      maxHeight={400}
      showInfoMessage={ shouldShowLoading || shouldShowError}
      infoMessage={shouldShowLoading ? loading : shouldShowError ? error : <></>}
      isStatic={false}
    />
  );
};

export default ConfusionMatrixPlot;
