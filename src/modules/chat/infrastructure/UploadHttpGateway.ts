import { UploadResponse } from '../domain/entities/UploadResponse';
import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/api/upload`;

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
