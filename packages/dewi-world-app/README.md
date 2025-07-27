# DEWI World - Location Management Setup

This guide covers setting up the complete location management system with real image uploads and Supabase integration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd packages/dewi-world-app
npm install
```

### 2. Set up Supabase Storage

#### Create the Storage Bucket

1. Go to your Supabase Dashboard → Storage
2. Create a new bucket called `locations`
3. Make it **Public** (check the public checkbox)

#### Set up Storage Policies

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create locations storage bucket (if not created via UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('locations', 'locations', true);

-- Public read access for all images
CREATE POLICY "Public read access for locations bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'locations');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload to locations bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'locations'
  AND auth.role() = 'authenticated'
);

-- Users can update/delete their own images
CREATE POLICY "Users can update their own files in locations bucket"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'locations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files in locations bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'locations' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Environment Variables

Ensure your `.env` file has:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3006  # Your API server URL
```

## 📱 Features

### ✅ Locations List

- View all user's location posts
- Search/filter by address and title
- Toggle between mock mode (development) and live mode (production)
- Pull-to-refresh functionality
- Empty states and error handling

### ✅ Create Location

- **Real Image Upload**: Select up to 5 images from gallery
- **Supabase Storage**: Images uploaded to `locations/` bucket
- **Form Validation**: All required fields with proper error messages
- **Hardware Selection**: Multi-select deployable hardware types
- **Upload Progress**: Real-time progress indicator
- **Auto-refresh**: Location list updates immediately after creation

### ✅ Delete Locations

- **Owner-only**: Delete button only appears for owned locations
- **Confirmation Modal**: Prevents accidental deletions
- **Auto-refresh**: List updates immediately after deletion

### ✅ Image Management

- **Permissions**: Automatic photo library permission requests
- **Preview**: Selected images shown before upload
- **Remove**: Remove individual images before submitting
- **Optimized**: Images compressed to 0.8 quality for faster uploads
- **Error Handling**: Graceful handling of upload failures

## 🔧 Technical Architecture

### Mock vs Live Mode

```typescript
// Toggle between development and production
const { mockMode, setMockMode } = useAppStore();

// API automatically switches based on mode
if (mockMode) {
  return mockLocationsAPI.getLocations(params);
} else {
  return realAPI.getLocations(userParams);
}
```

### Image Upload Flow

```typescript
// 1. Pick images from gallery
const result = await pickImages(5);

// 2. Upload to Supabase Storage
const uploadResult = await uploadMultipleImages(selectedImages, 'locations', (completed, total) =>
  setProgress({ completed, total })
);

// 3. Store URLs in location data
const locationData = {
  // ... other fields
  gallery: uploadResult.urls,
};
```

### Authentication Integration

```typescript
// Uses existing Zustand auth store
const { user } = useAuthStore();

// Real API calls include Bearer token
const headers = {
  Authorization: `Bearer ${session.access_token}`,
  'Content-Type': 'application/json',
};
```

## 🎯 User Experience

### Creating a Location

1. **Tap "+" button** in locations tab header
2. **Fill required fields**: Title, address, price, hardware types
3. **Add photos**: Tap to select up to 5 images from gallery
4. **Preview images**: Remove unwanted images before submit
5. **Submit**: Images upload with progress indicator
6. **Success**: Automatically returns to list with new location

### Managing Locations

1. **View list**: All user's locations with images and details
2. **Search**: Filter by address or title
3. **Delete**: Tap red × button on owned locations
4. **Confirm**: Modal prevents accidental deletion
5. **Refresh**: Pull down to refresh or toggle mock/live mode

## 🛡️ Security & Permissions

### Image Upload Security

- **User Authentication**: Only authenticated users can upload
- **File Validation**: Images only, with size/type checks
- **Unique Filenames**: Timestamp + random string prevents conflicts
- **Public URLs**: Images are publicly accessible once uploaded

### Photo Permissions

```json
// app.json
[
  "expo-image-picker",
  {
    "photosPermission": "The app accesses your photos to let you share location images.",
    "cameraPermission": "The app accesses your camera to let you take photos of locations."
  }
]
```

### Row Level Security

- **Ownership Checks**: Users can only edit/delete their own locations
- **API Filtering**: Real API automatically filters by `owner_id`
- **Frontend Guards**: Delete buttons only shown for owned locations

## 🔄 API Integration

### Endpoints Used

- `GET /api/v1/locations` - Fetch user's locations
- `POST /api/v1/locations` - Create new location with image URLs
- `DELETE /api/v1/locations/:id` - Delete owned location

### Mock vs Real API

```typescript
// Development: Uses mock data
mockLocationsAPI.getLocations();

// Production: Uses real Supabase API
realAPI.getLocations(); // with Bearer auth
```

## 🎨 UI Components

### LocationCard

- **Image Display**: First gallery image as card thumbnail
- **Hardware Icons**: Overlapping circular icons showing deployable types
- **Delete Button**: Red × button overlay for owned locations
- **Mobile Optimized**: Touch-friendly with proper shadows/spacing

### CreateLocationScreen

- **Form Validation**: Real-time validation with error states
- **Image Picker**: Gallery selection with previews
- **Progress Tracking**: Upload progress bar during submission
- **Hardware Selection**: Visual toggle buttons for hardware types

## 🐛 Troubleshooting

### Image Upload Issues

1. **Check Supabase Storage bucket exists and is public**
2. **Verify storage policies are set correctly**
3. **Ensure user is authenticated with valid session**
4. **Check image permissions are granted**

### API Connection Issues

1. **Verify API server is running on correct port**
2. **Check environment variables are set**
3. **Toggle to mock mode for development**
4. **Check network connectivity**

### Permission Issues

1. **Grant photo library access when prompted**
2. **Check device settings if permission denied**
3. **Restart app after granting permissions**

## 🎉 Ready to Use!

The locations system is now fully functional with:

- ✅ Real image uploads to Supabase Storage
- ✅ Complete CRUD operations
- ✅ Authentication integration
- ✅ Mock/live mode switching
- ✅ Mobile-first responsive design
- ✅ Proper error handling and validation

Users can now create, view, and manage location posts with real image uploads! 🚀
