// Mock Locations Provider for Frontend Development
// This mirrors the API structure from packages/api

export interface LocationPost {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  address: string;
  deployable_hardware: string[];
  price: number;
  is_negotiable: boolean;
  gallery: string[];
  rating?: number;
  distance: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLocationRequest {
  title: string;
  description: string;
  address: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  deployable_hardware: string[];
  price: number;
  is_negotiable: boolean;
  gallery: string[];
  rating?: number;
}

export interface UpdateLocationRequest {
  title?: string;
  description?: string;
  address?: string;
  deployable_hardware?: string[];
  price?: number;
  is_negotiable?: boolean;
  gallery?: string[];
  rating?: number;
  distance?: number;
}

export interface LocationQueryParams {
  hardware?: string;
  min_price?: number;
  max_price?: number;
  negotiable?: boolean;
  limit?: number;
  offset?: number;
}

export interface LocationResponse {
  success: boolean;
  data: LocationPost | LocationPost[];
  message?: string;
  total?: number;
}

// Mock data matching the API structure
const mockLocations: LocationPost[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    owner_id: 'user-1',
    title: 'Peroní f5 - Premium Restaurant Location',
    description:
      'Power & Internet: Yes, stable fiber + 24/7 access to power\nHeight & View: 2nd story building with 360° unobstructed view, perfect for line-of-sight setups\nCost: $50/month or open to revenue share\nExtras: I can help with install, have a ladder and secure mount points\nWhy here? Dense foot traffic, great for mapping or coverage expansion',
    address: 'Brickell Bay Drive, Miami, Florida 33131, United States',
    deployable_hardware: ['5g', 'helium', 'wifi', 'lorawan', 'weather'],
    price: 100,
    is_negotiable: true,
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3',
    ],
    rating: 4.28,
    distance: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    owner_id: 'user-2',
    title: 'High-Rise Apartment with Rooftop Access',
    description:
      'Perfect downtown location with rooftop access for optimal signal coverage. Building management is cooperative with deployments. 24/7 security and maintenance available.',
    address: 'Downtown Miami, Florida 33131, United States',
    deployable_hardware: ['5g', 'air', 'wifi', 'marine'],
    price: 150,
    is_negotiable: false,
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3',
    ],
    rating: 4.5,
    distance: 1200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    owner_id: 'user-3',
    title: 'Waterfront Marina - Excellent Coverage',
    description:
      'Marina location with excellent water and land coverage. Power and internet infrastructure already in place. Great for marine and weather monitoring applications.',
    address: 'Miami Beach Marina, Florida 33139, United States',
    deployable_hardware: ['marine', 'weather', 'lorawan'],
    price: 75,
    is_negotiable: true,
    gallery: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3'],
    rating: 4.1,
    distance: 2500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock API class that simulates the backend API
export class MockLocationsAPI {
  private locations: LocationPost[] = [...mockLocations];
  private isLoading = false;

  // Simulate network delay
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET /locations
  async getLocations(params?: LocationQueryParams): Promise<LocationResponse> {
    this.isLoading = true;
    await this.delay();

    let filteredLocations = [...this.locations];

    // Apply filters
    if (params?.hardware) {
      filteredLocations = filteredLocations.filter(location =>
        location.deployable_hardware.includes(params.hardware!)
      );
    }

    if (params?.min_price !== undefined) {
      filteredLocations = filteredLocations.filter(location => location.price >= params.min_price!);
    }

    if (params?.max_price !== undefined) {
      filteredLocations = filteredLocations.filter(location => location.price <= params.max_price!);
    }

    if (params?.negotiable !== undefined) {
      filteredLocations = filteredLocations.filter(
        location => location.is_negotiable === params.negotiable
      );
    }

    // Apply pagination
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;
    const paginatedLocations = filteredLocations.slice(offset, offset + limit);

    this.isLoading = false;
    return {
      success: true,
      data: paginatedLocations,
      total: filteredLocations.length,
    };
  }

  // GET /locations/:id
  async getLocation(id: string): Promise<LocationResponse> {
    this.isLoading = true;
    await this.delay();

    const location = this.locations.find(loc => loc.id === id);

    this.isLoading = false;
    if (!location) {
      return {
        success: false,
        data: [],
        message: 'Location not found',
      };
    }

    return {
      success: true,
      data: location,
    };
  }

  // POST /locations
  async createLocation(locationData: CreateLocationRequest): Promise<LocationResponse> {
    this.isLoading = true;
    await this.delay();

    const now = new Date().toISOString();
    const newLocation: LocationPost = {
      id: `mock-${Date.now()}`,
      owner_id: 'mock-user-id',
      ...locationData,
      created_at: now,
      updated_at: now,
    };

    this.locations.push(newLocation);

    this.isLoading = false;
    return {
      success: true,
      data: newLocation,
      message: 'Location created successfully',
    };
  }

  // PUT /locations/:id
  async updateLocation(id: string, updateData: UpdateLocationRequest): Promise<LocationResponse> {
    this.isLoading = true;
    await this.delay();

    const locationIndex = this.locations.findIndex(loc => loc.id === id);

    if (locationIndex === -1) {
      this.isLoading = false;
      return {
        success: false,
        data: [],
        message: 'Location not found',
      };
    }

    const updatedLocation = {
      ...this.locations[locationIndex],
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    this.locations[locationIndex] = updatedLocation;

    this.isLoading = false;
    return {
      success: true,
      data: updatedLocation,
      message: 'Location updated successfully',
    };
  }

  // DELETE /locations/:id
  async deleteLocation(id: string): Promise<LocationResponse> {
    this.isLoading = true;
    await this.delay();

    const locationIndex = this.locations.findIndex(loc => loc.id === id);

    if (locationIndex === -1) {
      this.isLoading = false;
      return {
        success: false,
        data: [],
        message: 'Location not found',
      };
    }

    this.locations.splice(locationIndex, 1);

    this.isLoading = false;
    return {
      success: true,
      data: [],
      message: 'Location deleted successfully',
    };
  }

  // Helper method to check loading state
  get loading(): boolean {
    return this.isLoading;
  }

  // Helper method to reset mock data
  resetData(): void {
    this.locations = [...mockLocations];
  }
}

// Export singleton instance
export const mockLocationsAPI = new MockLocationsAPI();

// Export mock data for direct use
export { mockLocations };
