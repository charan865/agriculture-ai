import { LocationInfo } from '../types';

const LOCATION_STORAGE_KEY = 'agri_user_location_v1';
const RECENT_LOCATIONS_STORAGE_KEY = 'agri_recent_locations_v1';

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
  message: string;
}


export const locationService = {
  // Check permission state if permissions API is available
  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!('geolocation' in navigator)) {
      return 'unsupported';
    }
    if ('permissions' in navigator && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state as LocationPermissionStatus;
      } catch {
        // Ignore and fallback to prompt
      }
    }
    return 'prompt';
  },

  // Listen to browser permission changes in real-time
  listenPermissionChange(onStatusChange: (status: LocationPermissionStatus) => void): () => void {
    if (!('permissions' in navigator && navigator.permissions.query)) {
      return () => {};
    }

    let active = true;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permissionStatus) => {
        if (!active) return;
        onStatusChange(permissionStatus.state as LocationPermissionStatus);
        permissionStatus.onchange = () => {
          if (!active) return;
          onStatusChange(permissionStatus.state as LocationPermissionStatus);
        };
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  },

  // Request browser geolocation coordinates
  getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        return reject({
          code: 'UNSUPPORTED',
          message: 'Browser geolocation is not supported on this device.'
        } as LocationError);
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0 // Fresh live coordinates from user device
      };


      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let code: LocationError['code'] = 'POSITION_UNAVAILABLE';
          let message = 'Unable to retrieve location coordinates.';

          if (error.code === error.PERMISSION_DENIED) {
            code = 'PERMISSION_DENIED';
            message = 'Location access is needed for local weather.';
          } else if (error.code === error.TIMEOUT) {
            code = 'TIMEOUT';
            message = 'Location request timed out. Please try again.';
          }

          reject({ code, message } as LocationError);
        },
        options
      );
    });
  },

  // Reverse geocode coordinates to human-readable city/region
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision;
        const country = data.countryName || data.countryCode;
        if (city && country) {
          return `${city}, ${country}`;
        }
        if (city) return city;
        if (country) return country;
      }
    } catch {
      // Fallback
    }

    // Secondary fallback via backend
    try {
      const res = await fetch(`/api/weather/current?location=${latitude},${longitude}`);
      if (res.ok) {
        const data = await res.json();
        if (data.location && !data.location.includes(',')) {
          return data.location;
        }
      }
    } catch {
      // Ignore
    }

    return `Lat ${latitude.toFixed(2)}°, Lon ${longitude.toFixed(2)}°`;
  },

  // Full method to get current user location with reverse geocoding
  async getCurrentLocation(): Promise<LocationInfo> {
    const coords = await this.getCurrentCoordinates();
    const displayName = await this.reverseGeocode(coords.latitude, coords.longitude);

    const locationInfo: LocationInfo = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      displayName,
      source: 'gps'
    };

    this.saveLocation(locationInfo);
    return locationInfo;
  },

  // Save location to localStorage and add to recent locations
  saveLocation(info: LocationInfo): void {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(info));
      this.addRecentLocation(info);
    } catch {
      // Ignore
    }
  },

  // Retrieve cached location from localStorage
  getCachedLocation(): LocationInfo | null {
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return null;
  },

  // Retrieve previously used locations list
  getRecentLocations(): LocationInfo[] {
    try {
      const stored = localStorage.getItem(RECENT_LOCATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return [];
  },

  // Add location to previously used locations list (up to 8 recent entries)
  addRecentLocation(info: LocationInfo): void {
    try {
      const recents = this.getRecentLocations();
      // Remove any existing entry matching the same display name
      const filtered = recents.filter(
        (loc) => loc.displayName.toLowerCase() !== info.displayName.toLowerCase()
      );
      const updated = [info, ...filtered].slice(0, 8);
      localStorage.setItem(RECENT_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  // Manual city search using Open-Meteo Geocoding
  async searchCities(query: string): Promise<LocationInfo[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const encoded = encodeURIComponent(query.trim());
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=6&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((r: any) => ({
            displayName: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
            city: r.name,
            region: r.admin1,
            country: r.country,
            latitude: r.latitude,
            longitude: r.longitude,
            source: 'manual' as const
          }));
        }
      }
    } catch {
      // Fallback: search previously used locations
    }

    const q = query.toLowerCase();
    return this.getRecentLocations().filter(
      (r) => r.displayName.toLowerCase().includes(q) || (r.city && r.city.toLowerCase().includes(q))
    );
  }
};

