import { Field } from '../types';

const initialFields: Field[] = [
  {
    id: 'f1',
    name: 'Wheat Field',
    area: 2.5,
    health: 85,
    status: 'Healthy',
    cropType: 'Wheat'
  },
  {
    id: 'f2',
    name: 'Cotton Field',
    area: 1.8,
    health: 40,
    status: 'At Risk',
    cropType: 'Cotton'
  },
  {
    id: 'f3',
    name: 'Paddy Field',
    area: 3.2,
    health: 90,
    status: 'Healthy',
    cropType: 'Rice'
  }
];

export const fieldService = {
  getInitialFields(): Field[] {
    return [...initialFields];
  },

  createField(name: string, area: number, health: number, cropType: string): Field {
    let status: 'Healthy' | 'At Risk' | 'Critical' = 'Healthy';
    if (health < 40) {
      status = 'Critical';
    } else if (health < 80) {
      status = 'At Risk';
    }

    return {
      id: `f-${Date.now()}`,
      name,
      area,
      health,
      status,
      cropType
    };
  }
};
