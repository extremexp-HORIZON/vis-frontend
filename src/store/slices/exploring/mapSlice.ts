import type { RootState } from '../../store';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ICluster } from '../../../shared/models/exploring/cluster.model';
import type { IFacet } from '../../../shared/models/exploring/facet.model';
import type { IQueryInfo } from '../../../shared/models/exploring/query-info.model';
import type { IRectangle } from '../../../shared/models/exploring/rectangle.model';
import { prepareSupercluster } from '../../../shared/utils/clusterUtils';
import type { IVisQueryResults } from '../../../shared/models/exploring/vis-query-results.model';
import { executeQuery } from './datasetSlice';
import type { AppStartListening } from '../../listenerMiddleware';
import { updateAnalysisResults } from './statsSlice';
import { updateTimeSeries } from './timeSeriesSlice';

interface MapState {
  zoom: number;
  viewRect: IRectangle | null;
  drawnRect: IRectangle | null;
  clusters: ICluster[];
  clustersLoading: boolean;
  facets: IFacet;
  queryInfo: IQueryInfo | null;
  selectedGeohash: string | null;
}

const initialState: MapState = {
  zoom: 14,
  viewRect: null,
  drawnRect: null,
  clusters: [],
  clustersLoading: false,
  facets: {},
  queryInfo: null,
  selectedGeohash: null,
};

export const updateClusters = createAsyncThunk(
  'map/updateClusters',
  async (datasetId: string, thunkApi) => {
    const state = thunkApi.getState() as RootState;

    const { zoom, viewRect, drawnRect } = state.map;
    const { dataset, categoricalFilters, timeRange } = state.dataset;
    const { groupByCols, measureCol, aggType } = state.chart;

    // Accessing dataset from the apiSlice's state
    // const dataset = (await thunkApi.dispatch(apiSlice.endpoints.getDataset.initiate(datasetId))).data;
    //   const dataset = (
    //     await thunkApi.dispatch(
    //       apiSlice.endpoints.postFileMeta.initiate({
    //         body: {
    //           sourceType: 'local',
    //           format: 'rawvis',
    //           source: `/opt/experiments/${datasetId}/dataset/${datasetId}.csv`,
    //           fileName: datasetId,
    //         },
    //       }),
    //     )
    //   ).data;

    if (!viewRect || !dataset) return thunkApi.rejectWithValue('Missing data');

    const body = {
      rect: viewRect,
      zoom,
      categoricalFilters,
      groupByCols,
      measureCol,
      aggType,
      from: timeRange.from,
      to: timeRange.to,
    };

    const requestTime = Date.now();
    const action = await thunkApi.dispatch(
      executeQuery({ id: datasetId, body }),
    );

    if (executeQuery.fulfilled.match(action)) {
      const result = action.payload as IVisQueryResults;

      thunkApi.dispatch(setFacets(result.facets));
      const responseTime = Date.now();
      const queryInfo: IQueryInfo = {
        executionTime: responseTime - requestTime,
        fullyContainedTileCount: result.fullyContainedTileCount,
        tileCount: result.tileCount,
        pointCount: result.pointCount,
        ioCount: result.ioCount,
        totalTileCount: result.totalTileCount,
        totalPointCount: result.totalPointCount,
      };

      thunkApi.dispatch(setQueryInfo(queryInfo));
      if (drawnRect == null) {
        thunkApi.dispatch(
          updateAnalysisResults({
            rectStats: result.rectStats,
            series: result.series,
          }),
        );
      }
      const points = result.points || [];
      const supercluster = prepareSupercluster(
        points,
        dataset.measure0!,
        dataset.measure1!,
        dataset.dimensions!,
      );
      const clusters = supercluster.getClusters([-180, -85, 180, 85], zoom);

      return clusters;
    } else {
      // Handle error
      return thunkApi.rejectWithValue('Query failed');
    }
  },
);

export const mapSlice = createSlice({
  name: 'exploringMapSlice',
  initialState,
  reducers: {
    resetMapState: () => {
      return initialState;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setViewRect: (state, action: PayloadAction<IRectangle | null>) => {
      state.viewRect = action.payload;
    },
    setDrawnRect: (
      state,
      action: PayloadAction<{
        id: string;
        bounds: {
          south: number;
          west: number;
          north: number;
          east: number;
        } | null;
      }>,
    ) => {
      const { bounds } = action.payload;
      const drawnRect =
        bounds &&
        ({
          lat: [bounds.south, bounds.north],
          lon: [bounds.west, bounds.east],
        } as IRectangle);

      state.drawnRect = drawnRect;
    },
    setClusters: (state, action: PayloadAction<ICluster[]>) => {
      state.clusters = action.payload;
    },
    setFacets: (state, action: PayloadAction<IFacet>) => {
      state.facets = action.payload;
    },
    setQueryInfo: (state, action: PayloadAction<IQueryInfo | null>) => {
      state.queryInfo = action.payload;
    },
    setSelectedGeohash: (state, action: PayloadAction<string | null>) => {
      state.selectedGeohash = action.payload;
    },
    resetSelectedGeohash: state => {
      state.selectedGeohash = null;
    },
    updateMapBounds: (
      state,
      action: PayloadAction<{
        id: string;
        bounds: { south: number; west: number; north: number; east: number };
        zoom: number;
      }>,
    ) => {
      const { bounds, zoom } = action.payload;

      state.zoom = zoom;
      state.viewRect = {
        lat: [bounds.south, bounds.north],
        lon: [bounds.west, bounds.east],
      };
    },
  },
  extraReducers: builder => {
    builder.addCase(updateClusters.pending, state => {
      // console.log('pending state', state);
      state.clustersLoading = true;
    });
    builder.addCase(updateClusters.fulfilled, (state, action) => {
      // console.log('fulfilled state', state, 'action', action);
      // @ts-expect-error issue converting from custom ISuperclusterFeatureProperties to ICluster
      state.clusters = action.payload;
      state.clustersLoading = false;
    });
    builder.addCase(updateClusters.rejected, (state, action) => {
      // Handle rejection silently or log to a proper logging service
      state.clustersLoading = false;
    });
  },
});

export const mapListeners = (startAppListening: AppStartListening) => {
  // updateMapBoundsListener
  startAppListening({
    actionCreator: updateMapBounds,
    effect: async (action, listenerApi) => {
      const { id } = action.payload;

      // Dispatch the updateClusters action
      await listenerApi.dispatch(updateClusters(id));
    },
  });

  // setDrawnRectListener
  startAppListening({
    actionCreator: setDrawnRect,
    effect: async (action, { dispatch, getState }) => {
      const { id } = action.payload;
      const state = getState() as RootState;
      const { zoom, drawnRect, viewRect } = state.map;
      const { categoricalFilters, timeRange } = state.dataset;
      const { groupByCols, measureCol, aggType } = state.chart;

      const queryBody = {
        rect: drawnRect || viewRect,
        zoom,
        categoricalFilters,
        groupByCols,
        measureCol,
        aggType,
        from: timeRange.from,
        to: timeRange.to,
      };

      try {
        const action2 = await dispatch(executeQuery({ id, body: queryBody }));

        if (executeQuery.fulfilled.match(action2)) {
          const result = action2.payload as IVisQueryResults;

          dispatch(
            updateAnalysisResults({
              rectStats: result.rectStats,
              series: result.series,
            }),
          );
          dispatch(updateTimeSeries());
        }
      } catch (error) {
        // Handle error silently or log to a proper logging service
      }
    },
  });
};

export const {
  resetMapState,
  setZoom,
  setViewRect,
  setDrawnRect,
  setClusters,
  setFacets,
  setQueryInfo,
  setSelectedGeohash,
  resetSelectedGeohash,
  updateMapBounds,
} = mapSlice.actions;
