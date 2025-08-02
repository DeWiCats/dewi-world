import Box from '@/components/ui/Box';
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function LocationSkeleton() {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({
    width,
    height,
    borderRadius = 8,
  }: {
    width: number | string;
    height: number;
    borderRadius?: number;
  }) => (
    <Animated.View
      style={[
        {
          height,
          borderRadius,
          backgroundColor: '#2a2a2a',
        },
        { width: width as any },
        { opacity: shimmerOpacity },
      ]}
    />
  );

  return (
    <Box
      backgroundColor="cardBackground"
      borderRadius="xl"
      marginBottom="4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* Image skeleton */}
      <SkeletonBox width="100%" height={200} borderRadius={16} />

      {/* Content skeleton */}
      <Box padding="4">
        {/* Address line skeleton */}
        <Box marginBottom="2">
          <SkeletonBox width="80%" height={16} />
        </Box>

        {/* Distance skeleton */}
        <Box marginBottom="3">
          <SkeletonBox width="60%" height={14} />
        </Box>

        {/* Hardware icons row skeleton */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box flexDirection="row" alignItems="center" gap="2">
            <SkeletonBox width={32} height={32} borderRadius={16} />
            <SkeletonBox width={32} height={32} borderRadius={16} />
            <SkeletonBox width={32} height={32} borderRadius={16} />
          </Box>

          {/* Arrow skeleton */}
          <SkeletonBox width={24} height={24} borderRadius={4} />
        </Box>
      </Box>
    </Box>
  );
}

export function LocationSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <Box paddingHorizontal="4" paddingBottom="8">
      {Array.from({ length: count }).map((_, index) => (
        <LocationSkeleton key={index} />
      ))}
    </Box>
  );
}
