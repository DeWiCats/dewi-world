import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import React, { useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface PlaceAutocompleteProps {
  onPlaceSelected: (place: {
    description: string;
    placeId: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
}

export default function PlaceAutocomplete({
  onPlaceSelected,
  placeholder = 'Search for an address...',
  disabled = false,
}: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [showFallback, setShowFallback] = useState(false);

  // Check if Google Places API key is available
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey || showFallback) {
    // Fallback to simple text input if Google Places fails
    return (
      <Box>
        <Text variant="textMdMedium" color="primaryText" marginBottom="2">
          Address *
        </Text>
        {!apiKey && (
          <Text variant="textSmRegular" color="orange.500" marginBottom="2">
            ⚠️ Google Places API key not configured - using manual input
          </Text>
        )}
        <Box
          backgroundColor="inputBackground"
          borderRadius="xl"
          paddingHorizontal="4"
          paddingVertical="3"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <TextInput
            placeholder="Enter your full address"
            placeholderTextColor="#888"
            value={inputValue}
            onChangeText={setInputValue}
            onBlur={() => {
              if (inputValue.trim()) {
                onPlaceSelected({
                  description: inputValue.trim(),
                  placeId: `manual-${Date.now()}`,
                  coordinates: undefined,
                });
              }
            }}
            style={{
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'Figtree',
            }}
            editable={!disabled}
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="words"
          />
        </Box>
        <Text variant="textSmRegular" color="secondaryText" marginTop="2">
          💡 Enter your complete address manually
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text variant="textMdMedium" color="primaryText" marginBottom="2">
        Address *
      </Text>
      <Box
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          zIndex: 1000,
        }}
      >
        <GooglePlacesAutocomplete
          placeholder={placeholder}
          onPress={(data, details = null) => {
            try {
              const place = {
                description: data.description,
                placeId: data.place_id,
                coordinates: details?.geometry?.location
                  ? {
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    }
                  : undefined,
              };
              onPlaceSelected(place);
            } catch (error) {
              console.error('Error selecting place:', error);
              Alert.alert('Error', 'Failed to select address. Please try again.');
            }
          }}
          onFail={error => {
            console.error('Google Places error:', error);
            setShowFallback(true);
          }}
          query={{
            key: apiKey,
            language: 'en',
            types: 'address',
            rankby: 'distance',
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          debounce={400}
          minLength={3}
          timeout={20000}
          keepResultsAfterBlur={false}
          predefinedPlaces={[]}
          nearbyPlacesAPI="GooglePlacesSearch"
          styles={{
            container: {
              flex: 0,
              zIndex: 1000,
            },
            textInputContainer: {
              backgroundColor: '#1a1a1a',
              borderRadius: 16,
              borderWidth: 0,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 0,
            },
            textInput: {
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontSize: 16,
              fontFamily: 'Figtree',
              height: 20,
              paddingVertical: 0,
              marginTop: 0,
              marginBottom: 0,
            },
            listView: {
              backgroundColor: '#1a1a1a',
              borderRadius: 16,
              marginTop: 8,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              maxHeight: 250,
              zIndex: 1001,
            },
            row: {
              backgroundColor: 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            },
            description: {
              color: '#ffffff',
              fontSize: 14,
              fontFamily: 'Figtree',
              lineHeight: 20,
            },
            separator: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              height: 1,
            },
          }}
          textInputProps={{
            placeholderTextColor: '#888888',
            editable: !disabled,
            returnKeyType: 'search',
            autoCorrect: false,
            autoCapitalize: 'words',
          }}
        />
      </Box>

      <Text variant="textSmRegular" color="secondaryText" marginTop="2">
        💡 Start typing an address to see suggestions
      </Text>
    </Box>
  );
}
