import Star from '@/assets/svgs/star.svg';
import { Profile } from '@/lib/usersAPI';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useMemo, useState } from 'react';
import CircleLoader from './CircleLoader';
import Box from './ui/Box';
import ImageBox from './ui/ImageBox';
import Text from './ui/Text';

type ProfileDisplayProps = {
  name?: string;
  rating?: number;
  userId?: string;
  fetchProfile?: boolean;
};

export default function ProfileDisplay({
  name,
  rating,
  userId,
  fetchProfile,
}: ProfileDisplayProps) {
  // Programatically fetch user profile if the fetch profile flag is true
  const [profile, setProfile] = useState<null | Profile>(null);
  // If user ID was provided, initialize loading state to true
  const [loading, setLoading] = useState(!!userId);
  const { getProfileById } = useAuthStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // If profile ID was not provided, stop fetching profile
      if (!userId) return setLoading(false);

      new Promise(async () => {
        if (fetchProfile && !profile) {
          try {
            setLoading(true);

            const profile = await getProfileById(userId);
            setProfile(profile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          } finally {
            setLoading(false);
          }
        }
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [fetchProfile, profile, userId]);

  const avatarSource = useMemo(() => {
    if (profile) return { uri: profile.avatar };
    return require('@/assets/images/profile-pic.png');
  }, [profile]);

  const profileName = useMemo(() => {
    // If profile is available return username, otherwise fallback to provided name
    if (profile) return profile.username;
    return name;
  }, [profile]);

  return (
    <>
      {loading ? (
        <Box justifyContent={'flex-start'} flexDirection={'row'}>
          <CircleLoader />
        </Box>
      ) : (
        <Box flexDirection={'row'} alignItems={'center'} justifyContent={'flex-start'} gap="sm">
          <ImageBox source={avatarSource} width={40} height={40} borderRadius={'full'} />
          <Box justifyContent={'center'} alignItems={'flex-start'}>
            <Text variant="textLgLight" color="text.white">
              {profileName}
            </Text>
            <Box justifyContent={'center'} alignItems={'center'} flexDirection={'row'} gap="0.5">
              <Star width={15} height={15} />
              <Text variant="textSmLight" color="text.white">
                {rating || '-'}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
