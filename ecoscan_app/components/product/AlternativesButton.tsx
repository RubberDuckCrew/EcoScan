import { Button } from "react-native-paper";
import { Product } from "@/types/product";
import { useRouter } from "expo-router";

export interface AlternativesButtonProps {
  product?: Product;
}

export default function AlternativesButton({
  product,
}: AlternativesButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/alternatives/",
    });
  };

  const isPrimary =
    product && product.score !== undefined && product.score < 50;
  return (
    <Button
      mode={isPrimary ? "contained" : "outlined"}
      icon="directions-fork"
      disabled={!product}
      onPress={handlePress}
    >
      Alternativen
    </Button>
  );
}
