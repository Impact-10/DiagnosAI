// src/services/diagnosisService.ts
import api from '../lib/api';

export interface DiagnosisRequest {
  symptoms: string;
  images?: File[];
  health_records?: any;
  severity?: string;
}

export interface DiagnosisResponse {
  diagnosis: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  followUp?: string;
}

export interface HealthInfoRequest {
  query: string;
}

export interface HealthInfoResponse {
  source: string;
  data: any;
}

export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy';
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  distance?: number;
  isOpen?: boolean;
  hours?: string;
  services?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ReferralRequest {
  location: { lat: number; lng: number };  // Changed from tuple to object
  diagnosis: string;
  preferences?: {
    urgency?: 'normal' | 'emergency';
    insurance?: string;
    specialty?: string;
    maxDistance?: number;
  };
}

export const diagnosisService = {
  // Get AI diagnosis based on symptoms
  async getDiagnosis(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    const formData = new FormData();
    formData.append('symptoms', request.symptoms);

    if (request.health_records) {
      formData.append('health_records', JSON.stringify(request.health_records));
    }

    if (request.severity) {
      formData.append('severity', request.severity);
    }

    if (request.images && request.images.length > 0) {
      request.images.forEach((image) => {
        formData.append(`images`, image);
      });
    }

    const response = await api.post('/api/diagnosis/diagnose', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get health information from CDC/WHO
  async getHealthInfo(query: string): Promise<HealthInfoResponse> {
    const response = await api.get(`/api/healthdata/health-info/${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get emergency contacts and nearby facilities
  async getEmergencyInfo(location?: { lat: number; lng: number }) {
    const params = location ? { lat: location.lat, lng: location.lng } : {};
    const response = await api.get('/api/emergency/contacts', { params });
    return response.data;
  },
async getNearbyFacilities(request: ReferralRequest): Promise<Facility[]> {
  const response = await api.post('/api/referral/find', request);
  return response.data.recommended as Facility[];
},


  // Legacy method for backward compatibility
  async getNearbyFacilitiesLegacy(location: { lat: number; lng: number }, type?: 'hospital' | 'clinic' | 'pharmacy') {
    const params = {
      lat: location.lat,
      lng: location.lng,
      ...(type && { type }),
    };
    const response = await api.get('/api/facilities/nearby', { params });
    return response.data;
  },
};

export default diagnosisService;
