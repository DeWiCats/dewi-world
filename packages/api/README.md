# DEWI World API

> Fastify & TypeScript backend API for DEWI World location management platform.

## Features

- ✅ Location posts CRUD API
- ✅ Fastify schema validation
- ✅ Authentication middleware (stubbed)
- ✅ TypeScript support
- ✅ Clean, typed responses

## API Endpoints

### Locations

All location endpoints require Authorization header: `Bearer <token>`

- `GET /api/v1/locations` - Get all locations with filtering
- `GET /api/v1/locations/:id` - Get single location
- `POST /api/v1/locations` - Create new location
- `PUT /api/v1/locations/:id` - Update location (owner only)
- `DELETE /api/v1/locations/:id` - Delete location (owner only)

#### Query Parameters for GET /api/v1/locations

- `hardware` - Filter by hardware tag (string)
- `min_price` - Minimum price filter (number)
- `max_price` - Maximum price filter (number)
- `negotiable` - Filter by negotiable status (boolean)
- `limit` - Results per page (number, default: 20, max: 100)
- `offset` - Results offset for pagination (number, default: 0)

#### Location Object Structure

```typescript
{
  id: string;           // UUID
  owner_id: string;     // Supabase user ID
  title: string;
  description: string;
  address: string;
  deployable_hardware: string[];  // Array of tags/icons
  price: number;
  is_negotiable: boolean;
  gallery: string[];    // Array of image URLs
  rating?: number;      // Optional, 0-5 scale
  distance: number;     // Mocked client-side
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

## Installation

```bash
cd packages/api
npm install
```

## Usage

### Development

```bash
# Required: typescript watch compilation
npm run watch

# Required: development server with hot reload (nodemon)
npm run dev

# Format with prettier
npm run format
```

### Production

```bash
# build for production
npm run build

# start production app
npm run start
```

## Project Structure

```
src/
├── controller/
│   ├── indexController.ts
│   ├── locationController.ts    # Main locations CRUD
│   └── userController.ts
├── middleware/
│   └── auth.ts                  # Authentication middleware (stubbed)
├── schemas/
│   └── location.ts              # Fastify validation schemas
├── types/
│   └── location.ts              # TypeScript interfaces
├── app.ts                       # Fastify app setup
├── index.ts                     # Server entry point
└── router.ts                    # Route registration
```

## Database Integration

Uses Supabase PostgreSQL database for data persistence. The API connects using the service role key for server-side operations.

### Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `schema.sql` in your Supabase SQL editor
3. Create a `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FASTIFY_PORT=3006
NODE_ENV=development
```

## Authentication

Currently uses a stubbed authentication middleware that extracts user ID from the Authorization header. In production, replace with proper Supabase JWT validation.

## Frontend Integration

A corresponding mock API is available in `packages/dewi-world-app/utils/mockLocations.ts` for frontend development without hitting the real API.

Example usage:

```typescript
import { mockLocationsAPI } from '../utils/mockLocations';

// Get all locations
const response = await mockLocationsAPI.getLocations();

// Get filtered locations
const filtered = await mockLocationsAPI.getLocations({
  hardware: 'helium',
  min_price: 50,
  max_price: 200,
});
```

## Testing API

### Get all locations

```bash
curl -H "Authorization: Bearer test-token" \
  http://localhost:3006/api/v1/locations
```

### Create location

```bash
curl -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Location",
    "description": "A test location",
    "address": "123 Test St",
    "deployable_hardware": ["wifi", "5g"],
    "price": 100,
    "is_negotiable": true,
    "gallery": [],
    "distance": 500
  }' \
  http://localhost:3006/api/v1/locations
```

## Database Schema

The `locations` table includes:

- Row Level Security (RLS) policies for user ownership
- Automatic `updated_at` timestamps via triggers
- Optimized indexes for filtering and sorting
- Foreign key constraint to `auth.users`

## TODO

- [ ] Replace stubbed auth with real Supabase JWT validation
- [x] Add database integration (✅ Supabase integrated)
- [ ] Add rate limiting
- [ ] Add logging middleware
- [ ] Add image upload endpoints for gallery
- [ ] Add location search by coordinates/radius
