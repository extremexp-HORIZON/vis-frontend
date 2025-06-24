import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
// import _ from 'lodash';
import { InputLabel, Switch, useMediaQuery, useTheme } from '@mui/material';
import ResponsiveCardVegaLite from '../../../../shared/components/responsive-card-vegalite';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InstanceClassificationUmap from './instance-classification-umap';
import type { TestInstance } from '../../../../shared/models/tasks/model-analysis.model';
import type { View, Item, ScenegraphEvent } from 'vega';
import InfoMessage from '../../../../shared/components/InfoMessage';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import Loader from '../../../../shared/components/loader';

interface ControlPanelProps {
  xAxisOption: string
  yAxisOption: string
  setXAxisOption: (val: string) => void
  setYAxisOption: (val: string) => void
  showMisclassifiedOnly: boolean
  options: string[]
  plotData: {
    data: TestInstance[] | null
    loading: boolean
    error: string | null
  } | null
  useUmap: boolean
  setUseUmap: Dispatch<SetStateAction<boolean>>
}

const ControlPanel = ({
  xAxisOption,
  yAxisOption,
  setXAxisOption,
  setYAxisOption,
  options,
  plotData,
  useUmap,
  setUseUmap
}: ControlPanelProps) => {
  const handleAxisSelection =
    (axis: 'x' | 'y') => (e: { target: { value: string } }) => {
      if (axis === 'x') setXAxisOption(e.target.value);
      else setYAxisOption(e.target.value);
    };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, px: 1.5 }}>
        {/* X-Axis Selector */}
        <FormControl fullWidth>
          <InputLabel id="x-axis-select-label">
            <Box display="flex" alignItems="center" gap={1}>
              <ShowChartIcon fontSize="small" />
                X-Axis
            </Box>
          </InputLabel>
          <Select
            labelId="x-axis-select-label"
            label="X-Axis-----"
            disabled={plotData?.loading || !plotData?.data}
            value={xAxisOption}
            onChange={handleAxisSelection('x')}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {options
              .filter(option => option !== yAxisOption)
              .map((feature, idx) => (
                <MenuItem key={`xAxis-${feature}-${idx}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="y-axis-select-label">
            <Box display="flex" alignItems="center" gap={1}>
              <ShowChartIcon fontSize="small" />
                Y-Axis
            </Box>
          </InputLabel>
          <Select
            labelId="y-axis-select-label"
            label="Y-Axis-----"
            disabled={plotData?.loading || !plotData?.data}
            value={yAxisOption}
            onChange={handleAxisSelection('y')}
            MenuProps={{
              PaperProps: { style: { maxHeight: 224, width: 250 } },
            }}
          >
            {options
              .filter(option => option !== xAxisOption)
              .map((feature, idx) => (
                <MenuItem key={`yAxis-${feature}-${idx}`} value={feature}>
                  {feature}
                </MenuItem>
              ))}

            {options.filter(option => option !== xAxisOption).length === 0 && (
              <MenuItem disabled value="">
                No available options
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,

          }}
        >
                UMAP
        </Typography>

        <Switch
          checked={useUmap}
          onChange={(e) => setUseUmap(e.target.checked)}
          color="primary"
        />

      </Box>

    </>
  );
};

interface IInstanceClassification {
  plotData: {
    data: TestInstance[] | null
    loading: boolean
    error: string | null
  } | null
  point: { id: string; data: TestInstance } | null
  showMisclassifiedOnly: boolean
  setPoint: Dispatch<SetStateAction<{ id: string; data: TestInstance } | null>>
  hashRow: (row: TestInstance) => string
}

const InstanceClassification = (props: IInstanceClassification) => {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));
  const { plotData, setPoint, point, showMisclassifiedOnly, hashRow } = props;
  const [options, setOptions] = useState<string[]>([]);
  const [xAxisOption, setXAxisOption] = useState<string>('');
  const [yAxisOption, setYAxisOption] = useState<string>('');
  const [useUmap, setUseUmap] = useState(false);

  const inferFieldType = (data: TestInstance[], field: string): 'quantitative' | 'nominal' => {
    const sample = data.find(d => d[field] !== undefined)?.[field];

    if (typeof sample === 'number') return 'quantitative';

    return 'nominal';
  };

  // const getVegaData = (data: any) => {
  //   let newData: any[] = _.cloneDeep(data)
  //   if (checkbox) {
  //     newData = newData.filter(d => d.actual !== d.predicted)
  //   }
  //   return newData
  // }
  const getVegaData = (data: TestInstance[]) => {
    return data.map((originalRow: TestInstance) => {
      const id = hashRow(originalRow);
      const isMisclassified = originalRow.actual !== originalRow.predicted;

      return {
        ...originalRow,
        isMisclassified,
        id,
      };
    });
  };

  useEffect(() => {
    if (plotData && plotData.data) {
      setOptions(Object.keys(plotData.data[0]));
    }
  }, [plotData]);

  useEffect(() => {
    if (options.length > 1) {
      setXAxisOption(options[0]);
      const yOption = options.find(opt => opt !== options[0]);

      if (yOption) setYAxisOption(yOption);
    }
  }, [options]);

  const handleNewView = (view: View) => {
    view.addEventListener('click', (event: ScenegraphEvent, item: Item | null | undefined) => {
      const datum = item?.datum as (Partial<TestInstance> & { id: string; isMisclassified?: boolean }) | undefined;

      if (datum?.isMisclassified) {
        const { id, ...dataWithoutId } = datum;

        const cleanedData = Object.fromEntries(
          Object.entries(dataWithoutId).filter(([_, v]) => v !== undefined)
        ) as TestInstance;

        setPoint({ id, data: cleanedData });
      } else {
        setPoint(null);
      }
    });
  };

  const xFieldType = plotData?.data ? inferFieldType(plotData.data, xAxisOption) : 'nominal';
  const yFieldType = plotData?.data ? inferFieldType(plotData.data, yAxisOption) : 'nominal';

  const info = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      {
        plotData?.loading ? (
          <Loader />
        ) : (
          <InfoMessage
            message="No Data Available."
            type="info"
            icon={<ReportProblemRoundedIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            fullHeight
          />
        )
      }
    </Box>
  );
  const shouldShowInfoMessage = plotData?.loading || !plotData?.data;

  return (
    useUmap ? (
      <InstanceClassificationUmap
        point={point}
        showMisclassifiedOnly={showMisclassifiedOnly}
        setPoint={setPoint}
        hashRow={hashRow}
        useUmap={useUmap}
        setuseUmap={setUseUmap }
      />
    ) : (
      <ResponsiveCardVegaLite
        spec={{
          width: 'container',
          height: 'container',
          autosize: { type: 'fit', contains: 'padding', resize: true },
          data: {
            values: getVegaData(plotData?.data ?? []),
          },
          params: [
            {
              name: 'pts',
              select: { type: 'point', toggle: false },
              bind: 'legend',
            },
            {
              name: 'highlight',
              select: { type: 'point', on: 'click', clear: 'clickoff',    fields: ['isMisclassified'],
              },
              value: { isMisclassified: true }

            },
            {
              name: 'panZoom',
              select: 'interval',
              bind: 'scales',
            },
          ],
          mark: {
            type: 'point',
            filled: true,
            size: 100,
          },

          encoding: {
            x: {
              field: xAxisOption || 'xAxis default',
              type: xFieldType,
            },
            y: {
              field: yAxisOption || 'yAxis default',
              type: yFieldType,
            },
            color: showMisclassifiedOnly
              ? {
                field: 'isMisclassified',
                type: 'nominal',
                scale: {
                  domain: [false, true],
                  range: ['#cccccc', '#ff0000'],
                },
                legend: {
                  title: 'Misclassified',
                  labelExpr: 'datum.label === \'true\' ? \'Misclassified\' : \'Correct\'',
                },
              }
              : {
                field: 'predicted',
                type: 'nominal',
                scale: {
                  range: ['#1f77b4', '#2ca02c'],
                },
                legend: {
                  title: 'Predicted Class',
                },
              },
            opacity: showMisclassifiedOnly
              ? {
                field: 'isMisclassified',
                type: 'nominal',
                scale: {
                  domain: [false, true],
                  range: [0.45, 1.0],
                },
              }
              : {
                value: 0.8,
              },
            size: showMisclassifiedOnly ? {
              field: 'isMisclassified',
              type: 'nominal',
              scale: {
                domain: [false, true],
                range: [60, 200],
                legend: false
              },
            } :
              {
                value: 100,
              },
            // stroke: {
            //   condition: {
            //     param: "highlight",
            //     empty: false,
            //     value: "black",
            //   },
            //   value: "transparent"
            // },
            // strokeWidth: {
            //   condition: {
            //     param: "highlight",
            //     empty: false,
            //     value: 2
            //   },
            //   value: 0
            // },
            tooltip: [
              { field: 'actual', type: 'nominal', title: 'Actual' },
              { field: 'predicted', type: 'nominal', title: 'Predicted' },
              { field: xAxisOption || 'xAxis default', type: 'quantitative', title: xAxisOption },
              { field: yAxisOption || 'yAxis default', type: 'quantitative', title: yAxisOption },
            ]
          },
        }}

        title={'Instance Classification Chart'}
        actions={false}
        controlPanel={
          <ControlPanel
            xAxisOption={xAxisOption}
            yAxisOption={yAxisOption}
            setXAxisOption={setXAxisOption}
            setYAxisOption={setYAxisOption}
            showMisclassifiedOnly={showMisclassifiedOnly}
            options={options}
            plotData={plotData}
            useUmap={useUmap}
            setUseUmap={setUseUmap}
          />
        }
        onNewView={handleNewView}
        infoMessage={info}
        showInfoMessage={shouldShowInfoMessage}
        aspectRatio={isSmallScreen ? 2.8 : 1.8}
        maxHeight={480}
        isStatic={true}
      />
    )

  );
};

export default InstanceClassification;
