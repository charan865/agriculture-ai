import { MarketRate } from '../types';

const mockMarketRates: MarketRate[] = [
  {
    id: 'm1',
    cropName: 'Tomato',
    price: 2350,
    unit: 'quintal',
    change: 4.2
  },
  {
    id: 'm2',
    cropName: 'Rice (Paddy)',
    price: 2180,
    unit: 'quintal',
    change: 2.1
  },
  {
    id: 'm3',
    cropName: 'Cotton',
    price: 6120,
    unit: 'quintal',
    change: -1.3
  }
];

export const marketService = {
  async getMarketRates(): Promise<MarketRate[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...mockMarketRates];
  }
};
