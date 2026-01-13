import { api } from '@/lib/api/client';

interface DistanceParams {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  driving?: boolean;
}

interface DistanceResult {
  straight_line_km: number;
  driving_km: number | null;
  driving_minutes: number | null;
}

export const GeoService = {
  async getDistance(params: DistanceParams): Promise<DistanceResult> {
    const query = new URLSearchParams({
      fromLat: String(params.fromLat),
      fromLng: String(params.fromLng),
      toLat: String(params.toLat),
      toLng: String(params.toLng),
      ...(params.driving ? { driving: 'true' } : {}),
    });
    const response = await api.get<{ data: DistanceResult }>(`/geo/distance?${query}`);
    return response.data;
  },
};
