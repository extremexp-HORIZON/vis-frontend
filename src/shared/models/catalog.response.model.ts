export interface CatalogResponse {
  data: CatalogDataItem[];
  total: number;
  page: number;
  perPage: number;
  filtered_total: number;
}

export interface CatalogDataItem {
  id: string;
  filename: string;
  upload_filename: string;
  description: string;
  use_case: string[];
  path: string;
  user_id: string;
  created: string;
  parent_files: string;
  project_id: string;
  file_size: string;
  file_type: string;
  recdeleted: boolean;
}
