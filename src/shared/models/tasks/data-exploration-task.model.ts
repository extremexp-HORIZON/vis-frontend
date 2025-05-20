import type {
  IDataExplorationMetaDataResponse,
  IDataExplorationResponse,
  IFilter,
  VisualColumn,
} from '../dataexploration.model';
export interface IDataExploration {
  multipleTimeSeries: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  dataTable: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  lineChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  barChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  scatterChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  mapChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  heatChart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  
  metaData: {
    data: IDataExplorationMetaDataResponse | null
    loading: boolean
    error: string | null
  }
  controlPanel: {
    chartType: string
    selectedColumns: VisualColumn[]
    filters: IFilter[]
    viewMode: 'overlay' | 'stacked'
    selectedDataset: string
    currentPage: number
    pageSize: number
    queryItems: number
    totalPages: number
    timestampField: string | null

    //Line
    xAxis: VisualColumn
    yAxis: VisualColumn[]
    //Bar
    barGroupBy: string[]
    barAggregation: any
    selectedMeasureColumn: null,

    //Scatter
    xAxisScatter: VisualColumn
    yAxisScatter: VisualColumn[]
    colorBy: VisualColumn
    umap: boolean
    //Heatmap
    barGroupByHeat: string[]
    barAggregationHeat: any
    selectedMeasureColumnHeat: null,

    //Map
    colorByMap: string
    segmentBy: string[]
    lat: string
    lon: string
    heatmap: boolean
    tripsMode: boolean
    selectedColumnsMap: string[]

  }
  chart: {
    data: IDataExplorationResponse | null
    loading: boolean
    error: string | null
  }
  umap: {
    data: any | null
    loading: boolean
    error: string | null
  }
}

// Define the initial state of the slice
export const dataExplorationDefault: IDataExploration = {
  multipleTimeSeries: {
    data: null,
    loading: false,
    error: null,
  },

  dataTable: {
    data: null,
    loading: false,
    error: null,
  },
  lineChart: {
    data: null,
    loading: false,
    error: null,
  },
  barChart: {
    data: null,
    loading: false,
    error: null,
  },
  heatChart: {
    data: null,
    loading: false,
    error: null,
  },
  scatterChart: {
    data: null,
    loading: false,
    error: null,
  },
  mapChart: {
    data: null,
    loading: false,
    error: null,
  },
  metaData: {
    data: null,
    loading: false,
    error: null,
  },
  controlPanel: {
    chartType: 'datatable',
    selectedColumns: [],
    filters: [],
    xAxis: { name: '', type: '' },
    xAxisScatter: { name: '', type: '' },
    yAxis: [],
    yAxisScatter: [],
    barGroupBy: [],
    barAggregation: {},
    viewMode: 'overlay',
    colorBy: { name: '', type: '' },
    colorByMap: 'None',
    tripsMode: false,
    selectedColumnsMap: [],
    selectedDataset: '',
    lat: '',
    lon: '',
    umap: false,
    segmentBy: [],
    timestampField: null,
    selectedMeasureColumn: null,
    heatmap: false,
    barGroupByHeat: [],
    barAggregationHeat: {},
    selectedMeasureColumnHeat: null,
    currentPage: 1,
    pageSize: 100,
    queryItems: 0,
    totalPages: 0,
    
  },
  
  chart: {
    data: null,
    loading: false,
    error: null,
  },
  umap: {
    data: null,
    loading: false,
    error: null,
  },
};