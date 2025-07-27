import { supabase } from '@/utils/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImagePickerResult {
  success: boolean;
  images?: ImagePicker.ImagePickerAsset[];
  error?: string;
}

// Request permissions for image picker with platform-specific handling
export async function requestImagePermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      // iOS requires different permission requests
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library in Settings to upload images for location posts.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Settings',
              onPress: () => {
                // On iOS, we can't directly open settings, but user can navigate manually
                Alert.alert(
                  'Open Settings',
                  'Go to Settings > Privacy & Security > Photos > DEWI World and enable access.'
                );
              },
            },
          ]
        );
        return false;
      }
      return true;
    } else {
      // Android permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload images for location posts.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Try Again',
              onPress: async () => {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
              },
            },
          ]
        );
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('Error requesting permissions:', error);
    Alert.alert(
      'Permission Error',
      'Unable to request photo permissions. Please check your device settings.'
    );
    return false;
  }
}

// Pick images from gallery with improved error handling
export async function pickImages(maxImages: number = 5): Promise<ImagePickerResult> {
  try {
    // Check permissions first
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Photo library permission is required to select images',
      };
    }

    // Launch image picker with platform-optimized settings
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [16, 9],
      allowsEditing: false,
      selectionLimit: maxImages,
      // Optimize for iOS
      ...(Platform.OS === 'ios' && {
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
      }),
    });

    if (result.canceled) {
      return {
        success: false,
        error: 'Image selection was cancelled',
      };
    }

    if (!result.assets || result.assets.length === 0) {
      return {
        success: false,
        error: 'No images were selected',
      };
    }

    // Validate selected images
    const validImages = result.assets.filter(asset => {
      // Check file size (max 10MB per image)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (asset.fileSize && asset.fileSize > maxSize) {
        console.warn(
          `Image ${asset.fileName} is too large (${Math.round(asset.fileSize / 1024 / 1024)}MB)`
        );
        return false;
      }
      return true;
    });

    if (validImages.length === 0) {
      return {
        success: false,
        error: 'Selected images are too large. Please choose images under 10MB each.',
      };
    }

    if (validImages.length < result.assets.length) {
      Alert.alert(
        'Some Images Skipped',
        `${result.assets.length - validImages.length} image(s) were too large and skipped. Maximum size is 10MB per image.`
      );
    }

    return {
      success: true,
      images: validImages,
    };
  } catch (error) {
    console.error('Error picking images:', error);

    // Provide helpful error messages based on the error
    let errorMessage = 'Failed to select images';
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        errorMessage = 'Photo library permission denied. Please enable in device settings.';
      } else if (error.message.includes('cancelled')) {
        errorMessage = 'Image selection was cancelled';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Upload a single image to Supabase Storage with improved error handling
export async function uploadImageToSupabase(
  uri: string,
  fileName: string,
  bucket: string = 'locations'
): Promise<ImageUploadResult> {
  try {
    // Fetch the image data
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();

    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error('Invalid image data');
    }

    // Convert blob to ArrayBuffer for Supabase
    const arrayBuffer = await blob.arrayBuffer();

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `${bucket}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, arrayBuffer, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Supabase upload error:', error);

      // Provide specific error messages
      let errorMessage = 'Upload failed';
      if (error.message.includes('bucket')) {
        errorMessage = 'Storage bucket not found. Please contact support.';
      } else if (error.message.includes('policy')) {
        errorMessage = 'Upload permission denied. Please sign in again.';
      } else if (error.message.includes('size')) {
        errorMessage = 'Image file too large. Please choose a smaller image.';
      } else {
        errorMessage = `Upload failed: ${error.message}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading image:', error);

    let errorMessage = 'Failed to upload image';
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Upload multiple images and return their URLs with improved progress tracking
export async function uploadMultipleImages(
  images: ImagePicker.ImagePickerAsset[],
  bucket: string = 'locations',
  onProgress?: (completed: number, total: number) => void
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  if (!images || images.length === 0) {
    return {
      success: false,
      urls: [],
      errors: ['No images to upload'],
    };
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const fileName = image.fileName || `image_${i + 1}.jpg`;

    try {
      const result = await uploadImageToSupabase(image.uri, fileName, bucket);

      if (result.success && result.url) {
        urls.push(result.url);
      } else {
        const errorMsg = result.error || `Failed to upload image ${i + 1}`;
        errors.push(errorMsg);
        console.warn(`Upload failed for image ${i + 1}:`, errorMsg);
      }
    } catch (error) {
      const errorMsg = `Unexpected error uploading image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }

    // Report progress
    if (onProgress) {
      onProgress(i + 1, images.length);
    }
  }

  return {
    success: urls.length > 0,
    urls,
    errors,
  };
}
