export interface CatalogRequest {
  filename?: string;
  use_case?: string;
  project_id?: string[]; // List<String> maps to string[]
  created_from?: string;
  created_to?: string;
  useId?: string;
  file_type?: string;
  parent_files?: string;
  size_from?: string;
  size_to?: string;
  sort?: string;     // default is "id.asc"
  page?: string;     // default is "1"
  perPage?: string;  // default is "1000"
}
