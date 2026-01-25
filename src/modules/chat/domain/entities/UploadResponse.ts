export interface UploadResponse {
  file_uri: string;
  filename: string;
  mime_type: string;
  display_name?: string;
  size_bytes: number;
  token_count: number;
}
