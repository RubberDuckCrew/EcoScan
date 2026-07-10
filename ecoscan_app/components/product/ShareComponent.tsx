import { View, StyleSheet } from "react-native";
import ProductCard from "@/components/product/sections/ProductCard";
import ScoreCard from "@/components/product/sections/ScoreCard";

type Props = {
  ean: string;
  name: string;
  imageUrl: string;
  score: number;
};

export default function ShareComponent({ ean, name, imageUrl, score }: Props) {
  return (
    <View style={styles.container}>
      <ProductCard
        ean={ean}
        name={name}
        imageUrl={imageUrl}
        description=""
        showDescription={false}
      />
      <ScoreCard score={score} onShare={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "white",
  },
});
