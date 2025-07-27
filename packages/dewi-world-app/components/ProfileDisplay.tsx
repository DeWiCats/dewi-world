import Star from '@/assets/svgs/star.svg';
import Box from './ui/Box';
import ImageBox from './ui/ImageBox';
import Text from './ui/Text';

export default function ProfileDisplay() {
  return (
    <Box flexDirection={'row'} alignItems={'center'} justifyContent={'flex-start'} gap="sm">
      <ImageBox
        source={require('@/assets/images/profile-pic.png')}
        width={40}
        height={40}
        borderRadius={'full'}
      />
      <Box justifyContent={'center'} alignItems={'flex-start'}>
        <Text variant="textLgLight" color="text.white">
          Peronif5
        </Text>
        <Box justifyContent={'center'} alignItems={'center'} flexDirection={'row'} gap="0.5">
          <Star width={15} height={15} />
          <Text variant="textSmLight" color="text.white">
            4.28
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
