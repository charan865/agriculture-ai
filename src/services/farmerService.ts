export interface FarmerProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  phone?: string;
  email?: string;
}

export const farmerService = {
  async getFarmerProfile(): Promise<FarmerProfile> {
    try {
      const res = await fetch('/api/farmer');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      id: 'farmer_1',
      name: 'Farmer',
      role: 'Farmer',
      location: 'Hyderabad, India',
      phone: '+91 98765 43210',
      email: 'charan.farmer@agriai.org'
    };
  },

  async updateFarmerProfile(updates: Partial<FarmerProfile>): Promise<FarmerProfile> {
    try {
      const res = await fetch('/api/farmer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      id: 'farmer_1',
      name: updates.name || 'Farmer',
      role: 'Farmer',
      location: updates.location || 'Hyderabad, India',
      phone: updates.phone,
      email: updates.email
    };
  }
};
