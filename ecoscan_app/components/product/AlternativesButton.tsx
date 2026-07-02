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

  return (
    <Button
      mode="contained"
      icon="directions-fork"
      disabled={!product}
      onPress={handlePress}
    >
      Alternativen
    </Button>
  );
}
