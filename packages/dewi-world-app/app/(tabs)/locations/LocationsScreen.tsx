import CircleLoader from '@/components/CircleLoader';
import LocationCard from '@/components/LocationCard';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useLocations } from '@/hooks/useLocations';
import { LocationPost } from '@/lib/api';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import AddIcon from '@assets/svgs/add.svg';
import { useNavigation, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, TextInput } from 'react-native';
import { TabsContext } from '../context';
import DetailScreen from './DetailScreen';
import { LocationsStackNavigationProp } from './LocationsNavigator';

export default function LocationsScreen() {
  const context = useContext(TabsContext);
  const nav = useNavigation<LocationsStackNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, session, hydrated } = useAuthStore();
  const { mockMode, setMockMode } = useAppStore();
  const { locations, loading, error, refreshLocations } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<null | LocationPost>();
  const router = useRouter();

  // Debug auth state when component mounts
  useEffect(() => {
    console.log('📍 LocationsScreen - Auth Debug:', {
      hydrated,
      hasUser: !!user,
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: user?.email,
      mockMode,
      loading,
      error,
    });
  }, [hydrated, user, session, mockMode, loading, error]);

  // Filter locations based on search
  const filteredLocations = locations.filter(location => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      location.title.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query) ||
      location.deployable_hardware.some(hw => hw.toLowerCase().includes(query))
    );
  });

  const handleExitDetail = () => {
    context.showHeader();
    context.showTabBar();
    setSelectedLocation(null);
  };

  const handleCreateLocation = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to create a location.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/WelcomeScreen' as any) },
      ]);
      return;
    }
    nav.push('create');
  };

  const handleLocationPress = (location: LocationPost) => {
    // Handle location press (navigate to detail or messaging)
    console.log('Location pressed:', location.title);
    context.hideHeader();
    context.hideTabBar();
    setSelectedLocation(location);
  };

  const toggleMockMode = () => {
    console.log('🔄 Toggling mock mode from', mockMode, 'to', !mockMode);
    setMockMode(!mockMode);
    refreshLocations();
  };

  const renderHeader = () => (
    <Box paddingHorizontal="4" paddingTop="4" paddingBottom="2">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="4">
        <Box>
          <Text variant="textXlBold" color="primaryText">
            My Locations
          </Text>
          <Pressable onPress={toggleMockMode}>
            <Text variant="textSmRegular" color="blue.500">
              {mockMode ? 'Mock Mode' : 'Live Mode'} • Tap to toggle
            </Text>
          </Pressable>
          {/* Auth debug info */}
          <Text variant="textXsRegular" color="secondaryText">
            Auth: {hydrated ? (user ? '✅ Signed In' : '❌ Not Signed In') : '⏳ Loading...'}
          </Text>
        </Box>
        <Pressable onPress={handleCreateLocation}>
          <Box
            width={44}
            height={44}
            borderRadius="full"
            backgroundColor="blue.500"
            alignItems="center"
            justifyContent="center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <AddIcon width={24} height={24} color="white" />
          </Box>
        </Pressable>
      </Box>

      <Box
        backgroundColor="inputBackground"
        borderRadius="xl"
        paddingHorizontal="4"
        paddingVertical="3"
        marginBottom="4"
      >
        <TextInput
          placeholder="Filter Locations"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            fontSize: 16,
            color: '#ffffff',
            fontFamily: 'Figtree',
          }}
        />
      </Box>
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="8"
      style={{ marginTop: 100 }}
    >
      {error ? (
        <>
          <Text
            variant="textLgBold"
            style={{ color: '#ef4444' }}
            textAlign="center"
            marginBottom="4"
          >
            ⚠️ Error Loading Locations
          </Text>
          <Text variant="textMdRegular" color="secondaryText" textAlign="center" marginBottom="6">
            {error}
          </Text>
          <Pressable
            onPress={refreshLocations}
            style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text variant="textMdBold" color="primaryBackground">
              Try Again
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text variant="textLgBold" color="primaryText" textAlign="center" marginBottom="2">
            📍 No locations yet
          </Text>
          <Text variant="textMdRegular" color="secondaryText" textAlign="center" marginBottom="6">
            Create your first location to get started
          </Text>
          <Pressable
            onPress={handleCreateLocation}
            style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text variant="textMdBold" color="primaryBackground">
              Create Location
            </Text>
          </Pressable>
        </>
      )}
    </Box>
  );

  // Show loading state if not hydrated yet
  if (!hydrated) {
    return (
      <Box flex={1} backgroundColor="primaryBackground" alignItems="center" justifyContent="center">
        <CircleLoader />
        <Text variant="textMdRegular" color="secondaryText" marginTop="4">
          Loading auth state...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="primaryBackground" paddingTop="7xl">
      {selectedLocation ? (
        <DetailScreen onExit={handleExitDetail} location={selectedLocation} />
      ) : (
        <FlatList
          data={filteredLocations}
          renderItem={({ item }) => (
            <LocationCard location={item} onPress={() => handleLocationPress(item)} />
          )}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            loading ? (
              <Box alignItems="center" paddingVertical="8">
                <CircleLoader />
                <Text variant="textMdRegular" color="secondaryText" marginTop="4">
                  Loading locations...
                </Text>
              </Box>
            ) : (
              renderEmptyState
            )
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
            paddingTop: 120,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshLocations}
        />
      )}
    </Box>
  );
}
