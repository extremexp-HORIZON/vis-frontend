import type { RootState } from '../../store';
import type { AnyAction, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
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
import ngeohash from 'ngeohash';
import type { MapLayer } from '../../../shared/models/exploring/dataset.model';

export type ActiveRect = 'viewRect' | 'drawnRect' | 'selectedGeohash';

interface MapState {
  zoom: number;
  viewRect: IRectangle | null;
  drawnRect: IRectangle | null;
  activeRect: ActiveRect;
  clusters: ICluster[];
  clustersLoading: boolean;
  facets: IFacet;
  queryInfo: IQueryInfo | null;
  selectedGeohash: {
    string: string | null;
    rect: IRectangle | null;
  };
  mapLayer: MapLayer;
}

const initialState: MapState = {
  zoom: 8,
  viewRect: null,
  drawnRect: null,
  activeRect: 'viewRect',
  clusters: [],
  clustersLoading: false,
  facets: {},
  queryInfo: null,
  selectedGeohash: {
    string: null,
    rect: null,
  },
  mapLayer: 'cluster',
};

const handleRectUpdate = async (
  dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
  state: RootState,
) => {
  const { zoom, viewRect, selectedGeohash, activeRect, drawnRect } = state.map;
  const { categoricalFilters, timeRange, dataset } = state.dataset;
  const { groupByCols, measureCol, aggType } = state.chart;

  let rectToUse: IRectangle | null;

  if (activeRect === 'drawnRect') {
    rectToUse = drawnRect;
  } else if (activeRect === 'selectedGeohash') {
    rectToUse = selectedGeohash.rect;
  } else {
    rectToUse = viewRect;
  }

  const queryBody = {
    rect: rectToUse,
    zoom,
    categoricalFilters,
    groupByCols,
    measureCol,
    aggType,
    from: timeRange.from,
    to: timeRange.to,
  };

  try {
    const action2 = await dispatch(executeQuery({ body: queryBody }));

    if (executeQuery.fulfilled.match(action2)) {
      const result = action2.payload as IVisQueryResults;

      dispatch(
        updateAnalysisResults({
          rectStats: result.rectStats,
          series: result.series,
        }),
      );
      if (dataset.timeColumn) {
        dispatch(updateTimeSeries());
      }
    }
  } catch (error) {
    // Handle error silently or log to a proper logging service
  }
};

export const updateClusters = createAsyncThunk(
  'map/updateClusters',
  async (datasetId: string, thunkApi) => {
    const state = thunkApi.getState() as RootState;

    const { zoom, viewRect, drawnRect, selectedGeohash } = state.map;
    const { dataset, categoricalFilters, timeRange } = state.dataset;
    const { groupByCols, measureCol, aggType } = state.chart;

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
    const action = await thunkApi.dispatch(executeQuery({ body }));

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
      // if no rect is selected, update the analysis results
      if (drawnRect == null && selectedGeohash.rect == null) {
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
  name: 'map',
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
      bounds
        ? (state.activeRect = 'drawnRect')
        : state.selectedGeohash.rect
          ? (state.activeRect = 'selectedGeohash')
          : (state.activeRect = 'viewRect');
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
      const bounds = action.payload
        ? ngeohash.decode_bbox(action.payload)
        : null;

      state.selectedGeohash = {
        string: action.payload,
        rect: bounds
          ? {
            lat: [bounds[0], bounds[2]],
            lon: [bounds[1], bounds[3]],
          }
          : null,
      };
      bounds
        ? (state.activeRect = 'selectedGeohash')
        : state.drawnRect
          ? (state.activeRect = 'drawnRect')
          : (state.activeRect = 'viewRect');
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
    setMapLayer: (state, action: PayloadAction<MapLayer>) => {
      state.mapLayer = action.payload;
    },
    setActiveRect: (state, action: PayloadAction<ActiveRect>) => {
      state.activeRect = action.payload;
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
    effect: async (_, { dispatch, getState }) => {
      const state = getState() as RootState;

      await handleRectUpdate(dispatch, state);
    },
  });

  // setSelectedGeohashListener
  startAppListening({
    actionCreator: setSelectedGeohash,
    effect: async (_, { dispatch, getState }) => {
      const state = getState() as RootState;
      const { zone } = state.zone;
      const { predictionDisplay } = state.prediction;

      if (zone.id && predictionDisplay) {
        dispatch(setActiveRect('drawnRect'));
      } else {
        await handleRectUpdate(dispatch, state);
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
  updateMapBounds,
  setMapLayer,
  setActiveRect,
} = mapSlice.actions;
