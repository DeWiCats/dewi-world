import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface ImageSlideProps {
  srcImports?: any[];
  srcURIs?: string[];
  imageSize?: number;
}

export default function ImageSlide({
  srcImports = [],
  srcURIs = [],
  imageSize = 100,
}: ImageSlideProps) {
  return (
    <ScrollView horizontal bounces snapToInterval={imageSize} snapToAlignment="start">
      {srcImports.map((photo, i) => (
        <Image
          key={'import' + i}
          width={imageSize}
          height={imageSize}
          source={photo}
          style={{ width: imageSize, height: imageSize }}
        ></Image>
      ))}
      {srcURIs.map((photo, i) => (
        <Image
          key={'URI' + i}
          width={imageSize}
          height={imageSize}
          source={{ uri: photo }}
          style={{ width: imageSize, height: imageSize }}
        ></Image>
      ))}
    </ScrollView>
  );
}
