import { UploadResponse } from '../domain/entities/UploadResponse';
import { apiConfig } from "@/shared/config/api.config";

const API_URL = apiConfig.getHttpUrl('/upload/');

export class UploadHttpGateway {
  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const uploadGateway = new UploadHttpGateway();
