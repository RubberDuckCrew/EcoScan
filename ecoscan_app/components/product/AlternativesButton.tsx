import { Button } from "react-native-paper";
import { TouchableOpacity } from "react-native";
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
    if (product === undefined) {
      return;
    }
    router.push({
      pathname: "/alternatives/",
    });
  };

  return (
    <>
      <TouchableOpacity>
        <Button
          mode={"contained"}
          icon={"directions-fork"}
          disabled={!product}
          onPress={handlePress}
        >
          Alternativen
        </Button>
      </TouchableOpacity>
    </>
  );
}
