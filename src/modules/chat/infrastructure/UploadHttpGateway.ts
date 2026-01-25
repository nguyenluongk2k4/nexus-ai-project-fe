import { UploadResponse } from '../domain/entities/UploadResponse';

export class UploadHttpGateway {
  private readonly baseUrl = 'http://localhost:8000/api/upload';

  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(this.baseUrl, {
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
