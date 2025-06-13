export type DataAssetRole = 'INPUT' | 'OUTPUT';

export interface IDataAsset {
  /** The name of the data asset. */
  name: string;

  /** The type of the data source (e.g., "http", "local"). */
  sourceType: string;

  /** The exact location of the asset. */
  source: string;

  /** Optional: The file format of the asset (e.g., "csv", "json"). */
  format?: string;

  /** Optional: Whether the asset is an INPUT dataset or an OUTPUT artifact. */
  role?: DataAssetRole;

  /** Optional: The task this asset is related to. */
  task?: string;

  folder: string | null;

  /** Optional: Additional metadata as key-value pairs. */
  tags?: Record<string, string>;
}
