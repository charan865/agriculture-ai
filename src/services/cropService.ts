import { Crop, Field } from '../types';

const STORAGE_KEY = 'agri_ai_user_crops_v1';

export const cropService = {
  // Load crops from SQLite API with localStorage fallback
  async getCrops(): Promise<Crop[]> {
    try {
      const res = await fetch('/api/crops');
      if (res.ok) {
        const data = await res.json();
        // Keep localStorage in sync as backup
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Ignore
        }
        return data;
      }
    } catch {
      // API offline - use fallback
    }

    // LocalStorage fallback
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore
    }
    return [];
  },

  async addCrop(cropData: Omit<Crop, 'id'>): Promise<Crop> {
    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropData)
      });
      if (res.ok) {
        const newCrop = await res.json();
        return newCrop;
      }
    } catch {
      // API offline - fallback to local creation
    }

    const current = await this.getCrops();
    const fallbackCrop: Crop = {
      ...cropData,
      id: `crop_${Date.now()}`
    };
    const updated = [fallbackCrop, ...current];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return fallbackCrop;
  },

  async removeCrop(id: string): Promise<Crop[]> {
    try {
      await fetch(`/api/crops/${id}`, { method: 'DELETE' });
    } catch {
      // API offline
    }

    const current = await this.getCrops();
    const updated = current.filter((c) => c.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return updated;
  },

  async loadDemoCrops(): Promise<Crop[]> {
    try {
      const res = await fetch('/api/crops/demo', { method: 'POST' });
      if (res.ok) {
        return this.getCrops();
      }
    } catch {
      // API offline
    }

    // Fallback demo crops
    const sampleCrops: Crop[] = [
      { id: 'crop-1', name: 'Tomato', fieldName: 'North Plot A', area: 2.5, plantingDate: '2026-08-10', growthStage: 'Fruiting', irrigationMethod: 'Drip', soilType: 'Red Soil', health: 92, status: 'Healthy' },
      { id: 'crop-2', name: 'Rice', fieldName: 'Paddy Valley', area: 3.0, plantingDate: '2026-07-25', growthStage: 'Vegetative', irrigationMethod: 'Flood', soilType: 'Alluvial', health: 88, status: 'Healthy' },
      { id: 'crop-3', name: 'Cotton', fieldName: 'East Ridge', area: 1.8, plantingDate: '2026-08-01', growthStage: 'Flowering', irrigationMethod: 'Sprinkler', soilType: 'Black Soil', health: 64, status: 'At Risk' },
      { id: 'crop-4', name: 'Chilli', fieldName: 'South Garden', area: 1.2, plantingDate: '2026-08-15', growthStage: 'Vegetative', irrigationMethod: 'Drip', soilType: 'Sandy Loam', health: 95, status: 'Healthy' }
    ];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCrops));
    } catch {
      // Ignore
    }
    return sampleCrops;
  },

  async clearCrops(): Promise<Crop[]> {
    try {
      await fetch('/api/crops', { method: 'DELETE' });
    } catch {
      // API offline
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      // Ignore
    }
    return [];
  },

  calculateCropHealth(items: (Crop | Field)[]) {
    if (!items || items.length === 0) {
      return { overallHealth: 0, healthy: 0, atRisk: 0, critical: 0, totalAcres: 0 };
    }

    const totalAcres = items.reduce((sum, f) => sum + f.area, 0);
    if (totalAcres === 0) {
      return { overallHealth: 0, healthy: 0, atRisk: 0, critical: 0, totalAcres: 0 };
    }

    const weightedHealthSum = items.reduce((sum, f) => sum + (f.health * f.area), 0);
    const overallHealth = Math.round(weightedHealthSum / totalAcres);

    let healthyAcres = 0;
    let atRiskAcres = 0;
    let criticalAcres = 0;

    items.forEach((f) => {
      if (f.health >= 80) {
        healthyAcres += f.area;
      } else if (f.health >= 50) {
        atRiskAcres += f.area;
      } else {
        criticalAcres += f.area;
      }
    });

    return {
      overallHealth: Math.min(Math.max(overallHealth, 0), 100),
      healthy: Math.round((healthyAcres / totalAcres) * 100),
      atRisk: Math.round((atRiskAcres / totalAcres) * 100),
      critical: Math.round((criticalAcres / totalAcres) * 100),
      totalAcres: Number(totalAcres.toFixed(1))
    };
  }
};
