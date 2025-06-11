export type DataAssetRole = 'INPUT' | 'OUTPUT';

export type DataAssetType = 'INTERNAL' | 'EXTERNAL';

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

  /**
   * Logical folder or catalog this data asset belongs to.
   * This field is used to group multiple file-level assets under a virtual
   * folder.
   * This does not imply that the data asset is a folder itself. If the asset
   * represents a real folder (e.g., a directory on the file system), this field
   * should be {@code null}.
   */
  folder: string | null;

  /**
  * The type of the data asset (e.g., "INTERNAL", "EXTERNAL").
   */
  type: DataAssetType;

  /** Optional: Additional metadata as key-value pairs. */
  tags?: Record<string, string>;
}
