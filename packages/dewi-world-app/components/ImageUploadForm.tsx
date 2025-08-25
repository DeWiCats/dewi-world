import { ImagePickerAsset } from 'expo-image-picker';
import { Image, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Box from './ui/Box';
import Text from './ui/Text';

interface ImageUploadFormProps {
  selectedImages: ImagePickerAsset[];
  handleImagePicker: () => void;
  removeImage: (index: number) => void;
  isLoading: boolean;
  uploadProgress: { completed: number; total: number };
  imageLimit: number;
}

export default function ImageUploadForm({
  selectedImages,
  handleImagePicker,
  removeImage,
  isLoading,
  uploadProgress,
  imageLimit,
}: ImageUploadFormProps) {
  return (
    <Box>
      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <Box marginBottom="4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              justifyContent="center"
              flexDirection="row"
              gap="3"
              paddingHorizontal="2"
              paddingVertical="2"
            >
              {selectedImages.map((image, index) => (
                <Box key={index} position="relative">
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 16,
                    }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#ef4444',
                      borderRadius: 16,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="textMdBold" color="primaryBackground">
                      ×
                    </Text>
                  </Pressable>
                </Box>
              ))}
            </Box>
          </ScrollView>
        </Box>
      )}

      {/* Add Photos Button */}
      {selectedImages.length < imageLimit && (
        <Pressable onPress={handleImagePicker} disabled={isLoading}>
          <Box
            backgroundColor="gray.700"
            borderRadius="xl"
            borderWidth={3}
            borderStyle="dashed"
            padding="6"
            alignItems="center"
            justifyContent="center"
            minHeight={150}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 40 }} marginBottom="2">
              📸
            </Text>
            <Text variant="textLgBold" color="blue.500" marginBottom="1">
              {selectedImages.length === 0 ? 'Add Photos' : 'Add More Photos'}
            </Text>
            <Text variant="textMdRegular" color="secondaryText" textAlign="center">
              {selectedImages.length}/{imageLimit} selected
            </Text>
          </Box>
        </Pressable>
      )}

      {/* Upload Progress */}
      {isLoading && uploadProgress.total > 0 && (
        <Box marginTop="4" padding="4" backgroundColor="inputBackground" borderRadius="xl">
          <Text variant="textMdRegular" color="primaryText" marginBottom="3" textAlign="center">
            Uploading images... {uploadProgress.completed}/{uploadProgress.total}
          </Text>
          <Box backgroundColor="secondaryText" height={6} borderRadius="xs" overflow="hidden">
            <Box
              backgroundColor="blue.500"
              height="100%"
              width={`${(uploadProgress.completed / uploadProgress.total) * 100}%`}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
