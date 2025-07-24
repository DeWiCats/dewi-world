export type GeoJSONFeature = {
  type: 'Feature';
  geometry: GeoJSON.Point;
  properties: {
    name: string;
    description: string;
    population: number;
    deployment_cost: string;
    extras: string[];
    address: string;
    category: string;
    photos: any[];
    depin_hardware: { name: string; Icon: FC<SvgProps> }[];
  };
};

import Logo5G from '@/assets/svgs/5g-logo.svg';
import AirLogo from '@/assets/svgs/air-logo.svg';
import HeliumLogo from '@/assets/svgs/helium-logo.svg';
import LorawanLogo from '@/assets/svgs/lorawan-logo.svg';
import MarineLogo from '@/assets/svgs/marine-logo.svg';
import WeatherLogo from '@/assets/svgs/weather-logo.svg';
import WifiLogo from '@/assets/svgs/wifi-logo.svg';
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';

export default {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-73.9857, 40.7484] },
      properties: {
        name: 'Empire State Building - Observation Deck',
        description:
          'Iconic skyscraper with high foot traffic and unobstructed city views. Offers stable high-speed internet and power access. Ideal for DePIN hardware due to visibility and dense urban coverage.',
        deployment_cost: '$200/month or 10% revenue share',
        extras: ['360° city views', 'Tourist hotspot', '24/7 security'],
        address: '20 W 34th St, New York, NY 10001, USA',
        photos: [
          require('@/assets/images/locations/empire/1.png'),
          require('@/assets/images/locations/empire/2.png'),
          require('@/assets/images/locations/empire/3.png'),
          require('@/assets/images/locations/empire/4.png'),
          require('@/assets/images/locations/empire/5.png'),
        ],
        depin_hardware: [
          { name: 'Helium Hotspot', icon: HeliumLogo },
          { name: 'WiFi Mesh Node', icon: WifiLogo },
        ],
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.3406, 34.1015] },
      properties: {
        name: 'The Grove Shopping Mall',
        description:
          'Upscale outdoor mall with excellent foot traffic and central LA location. Provides reliable power and fiber internet backbone. Rooftop access available for optimal signal distribution.',
        deployment_cost: '$150/month or 7% revenue share',
        extras: ['High consumer density', 'Entertainment district', 'Valet parking available'],
        address: '189 The Grove Dr, Los Angeles, CA 90036, USA',
        photos: [
          require('@/assets/images/locations/grove/1.png'),
          require('@/assets/images/locations/grove/2.png'),
          require('@/assets/images/locations/grove/3.png'),
          require('@/assets/images/locations/grove/4.png'),
          require('@/assets/images/locations/grove/5.png'),
        ],
        depin_hardware: [
          { name: '5G Small Cell', Icon: Logo5G },
          { name: 'LoRaWAN Gateway', Icon: LorawanLogo },
        ],
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6244, 41.8787] },
      properties: {
        name: 'Willis Tower Skydeck',
        description:
          'One of tallest buildings in Western Hemisphere with unparalleled elevation for coverage. Building management welcomes tech partnerships. Includes backup power generators.',
        deployment_cost: '$300/month or 12% revenue share',
        extras: ['Panoramic coverage potential', 'Business district location', 'ADA compliant'],
        address: '233 S Wacker Dr, Chicago, IL 60606, USA',
        photos: [
          require('@/assets/images/locations/willis/1.png'),
          require('@/assets/images/locations/willis/2.png'),
          require('@/assets/images/locations/willis/3.png'),
          require('@/assets/images/locations/willis/4.png'),
          require('@/assets/images/locations/willis/5.png'),
        ],
        depin_hardware: [
          { name: 'Weather Sensor Array', Icon: WeatherLogo },
          { name: 'Helium Hotspot', Icon: HeliumLogo },
        ],
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: {
        name: 'Westfield San Francisco Centre',
        description:
          'Premier downtown shopping destination with tech-savvy visitors. Building has dedicated IT infrastructure team and supports IoT deployments.',
        deployment_cost: '$175/month or 8% revenue share',
        extras: ['Public transit hub', 'Frequent tech events', 'Solar-powered sections'],
        address: '865 Market St, San Francisco, CA 94103, USA',
        photos: [
          require('@/assets/images/locations/westfield/1.png'),
          require('@/assets/images/locations/westfield/2.png'),
          require('@/assets/images/locations/westfield/3.png'),
          require('@/assets/images/locations/westfield/4.png'),
          require('@/assets/images/locations/westfield/5.png'),
        ],
        depin_hardware: [
          { name: 'Air Quality Monitor', Icon: AirLogo },
          { name: 'WiFi Analytics Beacon', Icon: WifiLogo },
        ],
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-80.1918, 25.7617] },
      properties: {
        name: 'Bayside Marketplace',
        description:
          'Waterfront retail complex with tourist traffic and marina views. Offers weatherproof enclosures for hardware and existing distributed antenna system.',
        deployment_cost: '$125/month or 5% revenue share',
        extras: ['Coastal location', 'Outdoor/indoor spaces', 'Cruise passenger access'],
        address: '401 Biscayne Blvd, Miami, FL 33132, USA',
        photos: [
          require('@/assets/images/locations/bayside/1.png'),
          require('@/assets/images/locations/bayside/2.png'),
          require('@/assets/images/locations/bayside/3.png'),
          require('@/assets/images/locations/bayside/4.png'),
        ],
        depin_hardware: [
          { name: 'Marine Traffic Monitor', Icon: MarineLogo },
          { name: 'Helium Hotspot', Icon: HeliumLogo },
        ],
      },
    },
  ],
} as {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
};
