import api from '../lib/api';

export interface HealthRecord {
  id: string;
  userId: string;
  type: 'lab_result' | 'prescription' | 'visit_note' | 'imaging' | 'vaccination' | 'other';
  title: string;
  description?: string;
  date: string;
  provider?: string;
  fileUrl?: string;
  metadata?: {
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UploadRecordRequest {
  type: HealthRecord['type'];
  title: string;
  description?: string;
  date: string;
  provider?: string;
  file?: File;
  metadata?: { [key: string]: any };
}

export const healthRecordsService = {
  // Get all health records for current user
  async getRecords(): Promise<HealthRecord[]> {
    const response = await api.get('/api/records');
    return response.data;
  },

  // Get a specific health record
  async getRecord(id: string): Promise<HealthRecord> {
    const response = await api.get(`/api/records/${id}`);
    return response.data;
  },

  // Upload a new health record
  async uploadRecord(record: UploadRecordRequest): Promise<HealthRecord> {
    const formData = new FormData();
    formData.append('type', record.type);
    formData.append('title', record.title);
    formData.append('date', record.date);
    
    if (record.description) {
      formData.append('description', record.description);
    }
    
    if (record.provider) {
      formData.append('provider', record.provider);
    }
    
    if (record.metadata) {
      formData.append('metadata', JSON.stringify(record.metadata));
    }
    
    if (record.file) {
      formData.append('file', record.file);
    }

    const response = await api.post('/api/records', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Update a health record
  async updateRecord(id: string, updates: Partial<UploadRecordRequest>): Promise<HealthRecord> {
    const response = await api.patch(`/api/records/${id}`, updates);
    return response.data;
  },

  // Delete a health record
  async deleteRecord(id: string): Promise<void> {
    await api.delete(`/api/records/${id}`);
  },

  // Search health records
  async searchRecords(query: string, type?: HealthRecord['type']): Promise<HealthRecord[]> {
    const params = new URLSearchParams({ q: query });
    if (type) {
      params.append('type', type);
    }
    
    const response = await api.get(`/api/records/search?${params}`);
    return response.data;
  },

  // Get records by type
  async getRecordsByType(type: HealthRecord['type']): Promise<HealthRecord[]> {
    const response = await api.get(`/api/records/type/${type}`);
    return response.data;
  },

  // Download record file
  async downloadRecordFile(id: string): Promise<Blob> {
    const response = await api.get(`/api/records/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default healthRecordsService;