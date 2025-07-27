import { GeoJSONFeature } from '@/geojson';
import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface FeatureImageSlideProps {
  location: GeoJSONFeature;
  imageSize?: number;
}

export default function FeatureImageSlide({ location, imageSize = 100 }: FeatureImageSlideProps) {
  return (
    <ScrollView horizontal bounces snapToInterval={imageSize} snapToAlignment="start">
      {location.properties.photos.map((photo, i) => (
        <Image
          key={location.properties.address + i}
          width={imageSize}
          height={imageSize}
          source={photo}
          style={{ width: imageSize, height: imageSize }}
        ></Image>
      ))}
    </ScrollView>
  );
}
