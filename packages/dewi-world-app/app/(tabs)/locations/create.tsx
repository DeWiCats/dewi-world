import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useLocations } from '@/hooks/useLocations';
import { CreateLocationRequest } from '@/lib/api';
import { pickImages, uploadMultipleImages } from '@/lib/imageUpload';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Switch, TextInput } from 'react-native';

// Import hardware icons for selection
import Icon5G from '@assets/svgs/5g-logo.svg';
import IconAir from '@assets/svgs/air-logo.svg';
import IconHelium from '@assets/svgs/helium-logo.svg';
import IconLorawan from '@assets/svgs/lorawan-logo.svg';
import IconMarine from '@assets/svgs/marine-logo.svg';
import IconWeather from '@assets/svgs/weather-logo.svg';
import IconWifi from '@assets/svgs/wifi-logo.svg';

const hardwareOptions = [
  { id: '5g', name: '5G', Icon: Icon5G },
  { id: 'helium', name: 'Helium', Icon: IconHelium },
  { id: 'wifi', name: 'WiFi', Icon: IconWifi },
  { id: 'lorawan', name: 'LoRaWAN', Icon: IconLorawan },
  { id: 'weather', name: 'Weather', Icon: IconWeather },
  { id: 'air', name: 'Air Quality', Icon: IconAir },
  { id: 'marine', name: 'Marine', Icon: IconMarine },
];

export default function CreateLocationScreen() {
  const router = useRouter();
  const { createLocation, refreshLocations } = useLocations();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    is_negotiable: true,
    deployable_hardware: [] as string[],
    gallery: [] as string[],
    rating: undefined as number | undefined,
    distance: 0, // Will be calculated client-side
  });

  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });

  const handleHardwareToggle = (hardwareId: string) => {
    setFormData(prev => ({
      ...prev,
      deployable_hardware: prev.deployable_hardware.includes(hardwareId)
        ? prev.deployable_hardware.filter(id => id !== hardwareId)
        : [...prev.deployable_hardware, hardwareId],
    }));
  };

  const handleImagePicker = async () => {
    try {
      const result = await pickImages(5 - selectedImages.length);

      if (result.success && result.images) {
        setSelectedImages(prev => [...prev, ...result.images!].slice(0, 5));
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your location.');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter an address for your location.');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }
    if (formData.deployable_hardware.length === 0) {
      Alert.alert('Error', 'Please select at least one deployable hardware type.');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one image of your location.');
      return;
    }

    try {
      setLoading(true);

      // Upload images first
      const uploadResult = await uploadMultipleImages(
        selectedImages,
        'locations',
        (completed, total) => {
          setUploadProgress({ completed, total });
        }
      );

      if (!uploadResult.success || uploadResult.urls.length === 0) {
        Alert.alert('Error', 'Failed to upload images. Please try again.');
        return;
      }

      // Show any upload errors but continue if at least one image uploaded
      if (uploadResult.errors.length > 0) {
        console.warn('Some images failed to upload:', uploadResult.errors);
      }

      const locationData: CreateLocationRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        price: Number(formData.price),
        is_negotiable: formData.is_negotiable,
        deployable_hardware: formData.deployable_hardware,
        gallery: uploadResult.urls,
        rating: formData.rating,
        distance: formData.distance,
      };

      await createLocation(locationData);

      // Refresh the locations list to show the new location
      await refreshLocations();

      Alert.alert('Success', 'Your location has been created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create location. Please try again.'
      );
    } finally {
      setLoading(false);
      setUploadProgress({ completed: 0, total: 0 });
    }
  };

  const renderHardwareOptions = () => (
    <Box>
      <Text variant="textMdMedium" color="primaryText" marginBottom="3">
        Deployable Hardware *
      </Text>
      <Box flexDirection="row" flexWrap="wrap" gap="3">
        {hardwareOptions.map(hardware => {
          const isSelected = formData.deployable_hardware.includes(hardware.id);
          return (
            <Pressable key={hardware.id} onPress={() => handleHardwareToggle(hardware.id)}>
              <Box
                borderRadius="xl"
                borderWidth={2}
                borderColor={isSelected ? 'blue.500' : 'inputBackground'}
                backgroundColor={isSelected ? 'blue.500' : 'inputBackground'}
                paddingHorizontal="4"
                paddingVertical="3"
                flexDirection="row"
                alignItems="center"
              >
                <Box marginRight="2">
                  <hardware.Icon width={20} height={20} />
                </Box>
                <Text
                  variant="textSmMedium"
                  color={isSelected ? 'primaryBackground' : 'primaryText'}
                >
                  {hardware.name}
                </Text>
              </Box>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );

  const renderImagePreviews = () => (
    <Box>
      <Text variant="textMdMedium" color="primaryText" marginBottom="3">
        Photos * (At least 1 required)
      </Text>

      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <Box marginBottom="3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Box flexDirection="row" gap="3" paddingRight="4">
              {selectedImages.map((image, index) => (
                <Box key={index} position="relative">
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#ef4444',
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="textSmBold" color="primaryBackground">
                      ×
                    </Text>
                  </Pressable>
                </Box>
              ))}
            </Box>
          </ScrollView>
        </Box>
      )}

      {/* Add Images Button */}
      {selectedImages.length < 5 && (
        <Pressable onPress={handleImagePicker} disabled={loading}>
          <Box
            backgroundColor="inputBackground"
            borderRadius="xl"
            borderWidth={2}
            borderStyle="dashed"
            borderColor="blue.500"
            padding="4"
            alignItems="center"
            justifyContent="center"
            minHeight={100}
          >
            <Text variant="textLgBold" color="blue.500" marginBottom="1">
              +
            </Text>
            <Text variant="textMdRegular" color="blue.500" textAlign="center">
              {selectedImages.length === 0 ? 'Add Photos' : 'Add More Photos'}
            </Text>
            <Text variant="textSmRegular" color="secondaryText" textAlign="center" marginTop="1">
              {selectedImages.length}/5 selected
            </Text>
          </Box>
        </Pressable>
      )}

      {/* Upload Progress */}
      {loading && uploadProgress.total > 0 && (
        <Box marginTop="3" padding="3" backgroundColor="inputBackground" borderRadius="xl">
          <Text variant="textSmRegular" color="primaryText" marginBottom="2">
            Uploading images... {uploadProgress.completed}/{uploadProgress.total}
          </Text>
          <Box backgroundColor="secondaryText" height={4} borderRadius="xs" overflow="hidden">
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

  return (
    <Box
      flex={1}
      backgroundColor="primaryBackground"
      style={{
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      {/* Header */}
      <Box
        paddingHorizontal="4"
        paddingTop="4"
        paddingBottom="2"
        borderBottomWidth={1}
        borderBottomColor="inputBackground"
      >
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Pressable onPress={() => router.back()} disabled={loading}>
            <Text variant="textMdRegular" color={loading ? 'secondaryText' : 'blue.500'}>
              Cancel
            </Text>
          </Pressable>

          <Text variant="textLgBold" color="primaryText">
            Create Location
          </Text>

          <Pressable onPress={handleSubmit} disabled={loading}>
            <Box flexDirection="row" alignItems="center">
              {loading && (
                <Box marginRight="2" width={16} height={16}>
                  <CircleLoader />
                </Box>
              )}
              <Text variant="textMdMedium" color={loading ? 'secondaryText' : 'blue.500'}>
                {loading ? 'Creating...' : 'Create'}
              </Text>
            </Box>
          </Pressable>
        </Box>
      </Box>

      {/* Form */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Box marginBottom="4">
          <Text variant="textMdMedium" color="primaryText" marginBottom="2">
            Title *
          </Text>
          <Box
            backgroundColor="inputBackground"
            borderRadius="xl"
            paddingHorizontal="4"
            paddingVertical="3"
          >
            <TextInput
              placeholder="Enter location title"
              placeholderTextColor="#888"
              value={formData.title}
              onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
              style={{
                fontSize: 16,
                color: '#ffffff',
                fontFamily: 'Figtree',
              }}
              maxLength={200}
              editable={!loading}
            />
          </Box>
        </Box>

        {/* Address */}
        <Box marginBottom="4">
          <Text variant="textMdMedium" color="primaryText" marginBottom="2">
            Address *
          </Text>
          <Box
            backgroundColor="inputBackground"
            borderRadius="xl"
            paddingHorizontal="4"
            paddingVertical="3"
          >
            <TextInput
              placeholder="Enter full address"
              placeholderTextColor="#888"
              value={formData.address}
              onChangeText={text => setFormData(prev => ({ ...prev, address: text }))}
              style={{
                fontSize: 16,
                color: '#ffffff',
                fontFamily: 'Figtree',
              }}
              maxLength={500}
              editable={!loading}
            />
          </Box>
        </Box>

        {/* Description */}
        <Box marginBottom="4">
          <Text variant="textMdMedium" color="primaryText" marginBottom="2">
            Description
          </Text>
          <Box
            backgroundColor="inputBackground"
            borderRadius="xl"
            paddingHorizontal="4"
            paddingVertical="3"
          >
            <TextInput
              placeholder="Describe your location, power, internet, access details..."
              placeholderTextColor="#888"
              value={formData.description}
              onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
              style={{
                fontSize: 16,
                color: '#ffffff',
                fontFamily: 'Figtree',
                minHeight: 100,
              }}
              multiline
              textAlignVertical="top"
              maxLength={2000}
              editable={!loading}
            />
          </Box>
        </Box>

        {/* Price and Negotiable */}
        <Box flexDirection="row" marginBottom="4" gap="4">
          <Box flex={1}>
            <Text variant="textMdMedium" color="primaryText" marginBottom="2">
              Price per Month ($) *
            </Text>
            <Box
              backgroundColor="inputBackground"
              borderRadius="xl"
              paddingHorizontal="4"
              paddingVertical="3"
            >
              <TextInput
                placeholder="0"
                placeholderTextColor="#888"
                value={formData.price}
                onChangeText={text => setFormData(prev => ({ ...prev, price: text }))}
                style={{
                  fontSize: 16,
                  color: '#ffffff',
                  fontFamily: 'Figtree',
                }}
                keyboardType="numeric"
                editable={!loading}
              />
            </Box>
          </Box>

          <Box justifyContent="flex-end" paddingBottom="3">
            <Box flexDirection="row" alignItems="center">
              <Text variant="textMdMedium" color="primaryText" marginRight="2">
                Negotiable
              </Text>
              <Switch
                value={formData.is_negotiable}
                onValueChange={value => setFormData(prev => ({ ...prev, is_negotiable: value }))}
                trackColor={{ false: '#555', true: '#2563eb' }}
                thumbColor="#ffffff"
                disabled={loading}
              />
            </Box>
          </Box>
        </Box>

        {/* Hardware Selection */}
        <Box marginBottom="6">{renderHardwareOptions()}</Box>

        {/* Image Gallery */}
        <Box marginBottom="6">{renderImagePreviews()}</Box>

        {/* Bottom spacing */}
        <Box height={32} />
      </ScrollView>
    </Box>
  );
}
