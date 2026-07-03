import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from "react-native";

type ImageFallbackProps = {
  imageUrl: string;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  fallbackStyle?: ViewStyle;
};

export default function ImageFallback({
  imageUrl,
  style,
  imageStyle,
  fallbackStyle,
}: ImageFallbackProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageError = () => {
    setImageLoadError(true);
  };

  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);

  const isImageValid: boolean = imageUrl.trim() !== "";

  return (
    <View style={style}>
      {isImageValid && !imageLoadError ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <View style={[styles.fallback, fallbackStyle]}>
          <MaterialIcons name="image-not-supported" size={64} color="#757575" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
