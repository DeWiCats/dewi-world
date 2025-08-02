import CircleLoader from '@/components/CircleLoader';
import LocationCard from '@/components/LocationCard';
import { LocationSkeletonList } from '@/components/LocationSkeleton';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useLocations } from '@/hooks/useLocations';
import { LocationPost } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStepperStore } from '@/stores/useStepperStore';
import AddIcon from '@assets/svgs/add.svg';
import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, TextInput } from 'react-native';
import { TabsContext } from '../context';
import DetailScreen from './DetailScreen';
import { LocationsStackNavigationProp } from './LocationsNavigator';

export default function LocationsScreen() {
  const context = useContext(TabsContext);
  const nav = useNavigation<LocationsStackNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, session, hydrated } = useAuthStore();
  const { locations, loading, error, refreshLocations } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<null | LocationPost>();
  const router = useRouter();

  const { showStepper, hideStepper } = useStepperStore();

  // Memoized callbacks for delete operations to prevent Reanimated crashes
  const handleDeleteStart = useCallback((locationId: string) => {
    console.log('🗑️ Starting optimistic delete for:', locationId);
  }, []);

  const handleDeleteComplete = useCallback((locationId: string) => {
    console.log('✅ Delete completed for:', locationId);
    // The useLocations hook should already handle state updates
  }, []);

  const handleDeleteError = useCallback((locationId: string, error: Error) => {
    console.error('❌ Delete failed for:', locationId, error.message);
  }, []);

  // Debug auth state when component mounts
  useEffect(() => {
    console.log('📍 LocationsScreen - Auth Debug:', {
      hydrated,
      hasUser: !!user,
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: user?.email,
      loading,
      error,
    });
  }, [hydrated, user, session, loading, error]);

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
    showStepper();
  };

  const handleLocationPress = (location: LocationPost) => {
    // Handle location press (navigate to detail or messaging)
    console.log('Location pressed:', location.title);
    context.hideHeader();
    context.hideTabBar();
    setSelectedLocation(location);
  };

  const renderHeader = () => (
    <Box paddingHorizontal="4" paddingTop="4" paddingBottom="2">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="4">
        <Box>
          <Text variant="textXlBold" color="primaryText">
            My Locations
          </Text>
          <Text variant="textSmRegular" color="secondaryText">
            {hydrated
              ? user
                ? `Welcome back, ${user.email?.split('@')[0]}`
                : 'Please sign in to continue'
              : 'Loading...'}
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
            <LocationCard
              location={item}
              onPress={() => handleLocationPress(item)}
              onDeleteStart={handleDeleteStart}
              onDeleteComplete={handleDeleteComplete}
              onDeleteError={handleDeleteError}
            />
          )}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={loading ? <LocationSkeletonList count={3} /> : renderEmptyState}
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
