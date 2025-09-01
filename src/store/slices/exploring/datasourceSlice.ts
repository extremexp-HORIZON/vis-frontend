import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../../app/api/api';
import type { IDataSource } from '../../../shared/models/dataexploration.model';
import { showError, showSuccess } from '../../../shared/utils/toast';

export interface IDataSourceState {
  dataSource: IDataSource | null;
  dataSources: IDataSource[];
  loading: { fetch: boolean; upload: boolean; delete: boolean };
  error: { fetch: string | null; upload: string | null; delete: string | null };
}

const initialState: IDataSourceState = {
  dataSource: null,
  dataSources: [],
  loading: { fetch: false, upload: false, delete: false },
  error: { fetch: null, upload: null, delete: null },
};

export const getDataSource = createAsyncThunk<
  IDataSource,
  { datasetId: string },
  { rejectValue: string }
>('api/getDataSource', async ({ datasetId }, { rejectWithValue }) => {
  try {
    const response = await api.get<IDataSource>(`/datasources/${datasetId}`);

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

export const getDataSourceList = createAsyncThunk<
  IDataSource[],
  void,
  { rejectValue: string }
>('api/getDataSourceList', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<IDataSource[]>('/datasources');

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

export const deleteDataSource = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('api/deleteDataSource', async (fileName, { rejectWithValue }) => {
  try {
    const response = await api.delete<string>(`/datasources/${fileName}`);

    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return rejectWithValue(errorMessage);
  }
});

export interface UploadDataSourceParams {
  file: File;
  fileName?: string;
  source?: string;
  format?: string;
  sourceType?: string;
  measure0?: string;
  measure1?: string;
}

export const uploadDataSource = createAsyncThunk<
  IDataSource,
  UploadDataSourceParams,
  { rejectValue: string }
>(
  'api/uploadDataSource',
  async (
    { file, fileName, source, format = 'csv', sourceType = 'local', measure0, measure1 },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();

      formData.append('file', file);

      if (fileName) {
        formData.append('fileName', fileName);
      }

      if (source) {
        formData.append('source', source);
      }

      formData.append('format', format);

      formData.append('sourceType', sourceType);

      if (measure0) {
        formData.append('measure0', measure0);
      }

      if (measure1) {
        formData.append('measure1', measure1);
      }

      const response = await api.post<IDataSource>(
        '/datasources/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return rejectWithValue(errorMessage);
    }
  },
);

export const dataSourceSlice = createSlice({
  name: 'dataSource',
  initialState,
  extraReducers: builder => {
    // Get Data Source
    builder.addCase(getDataSource.fulfilled, (state, action) => {
      state.loading.fetch = false;
      state.dataSource = action.payload;
      showSuccess(`${action.payload.fileName} data source loaded!`);
    });
    builder.addCase(getDataSource.pending, state => {
      state.loading.fetch = true;
      state.error.fetch = null;
    });
    builder.addCase(
      getDataSource.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload || 'Failed to fetch data source';
        showError(action.payload || 'Failed to fetch data source');
      },
    );
    // Get Data Source List
    builder.addCase(getDataSourceList.fulfilled, (state, action) => {
      state.loading.fetch = false;
      state.dataSources = action.payload;
      showSuccess(`${action.payload.length} data sources loaded!`);
    });
    builder.addCase(getDataSourceList.pending, state => {
      state.loading.fetch = true;
      state.error.fetch = null;
    });
    builder.addCase(
      getDataSourceList.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload || 'Failed to fetch data sources';
        showError(action.payload || 'Failed to fetch data sources');
      },
    );
    // Upload Data Source
    builder.addCase(uploadDataSource.fulfilled, (state, action) => {
      state.loading.upload = false;
      state.dataSource = action.payload;
      state.dataSources.push(action.payload);
      showSuccess(`${action.payload.fileName} data source uploaded!`);
    });
    builder.addCase(uploadDataSource.pending, state => {
      state.loading.upload = true;
      state.error.upload = null;
    });
    builder.addCase(
      uploadDataSource.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.loading.upload = false;
        state.error.upload = action.payload || 'Failed to upload data source';
        showError(action.payload || 'Failed to upload data source');
      },
    );
    // Delete Data Source
    builder.addCase(deleteDataSource.fulfilled, (state, action) => {
      state.loading.delete = false;
      state.dataSources = state.dataSources.filter(dataSource => dataSource.fileName !== action.meta.arg);
      showSuccess(`${action.meta.arg} data source deleted!`);
    });
    builder.addCase(deleteDataSource.pending, state => {
      state.loading.delete = true;
      state.error.delete = null;
    });
    builder.addCase(deleteDataSource.rejected, (state, action: PayloadAction<string | undefined>) => {
      state.loading.delete = false;
      state.error.delete = action.payload || 'Failed to delete data source';
      showError(action.payload || 'Failed to delete data source');
    });
  },
  reducers: {
    resetDataSourceState: () => {
      return initialState;
    },
    setDataSource: (state, action: PayloadAction<IDataSource>) => {
      state.dataSource = action.payload;
    },
  },
});

export const { setDataSource, resetDataSourceState } = dataSourceSlice.actions;
