import type { GridColDef } from '@mui/x-data-grid';

export type CustomGridColDef = GridColDef & {
  field: string
  minWidth?: number
  flex?: number
  align?: 'left' | 'right' | 'center'
  headerAlign?: 'left' | 'right' | 'center'
}
