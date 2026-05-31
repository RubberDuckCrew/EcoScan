import { PageContainer } from "@/components/PageContainer";
import { Text } from "react-native-paper";
import ProductCard from "@/components/product/ProductCard";
import ScoreCard from "@/components/product/ScoreCard";
import { useGreenScore } from "@/hooks/useGreenScore";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function Product() {
  const { loading, product, fetchGreenScore, fetchProduct } = useGreenScore();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const normalizedId = Array.isArray(id) ? id[0] : id;

    if (normalizedId) {
      fetchProduct(normalizedId).then((product) => {
        fetchGreenScore(normalizedId);
      });
    }
  }, [id, fetchGreenScore, fetchProduct]);
  return (
    <PageContainer>
      {product && (
        <>
          <ProductCard
            name={product.name || "Unbekanntes Produkt"}
            barcode={product.barcode || "Kein Barcode"}
            description={product.description || "Keine Beschreibung verfügbar."}
            imageUrl={product.imageUrl || "https://via.placeholder.com/150"}
          />
          {product.score !== undefined && <ScoreCard score={product.score} />}
        </>
      )}
      {loading && (
        <>
          <LoadingIndicator />
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            KI analysiert Produkt...
          </Text>
        </>
      )}
    </PageContainer>
  );
}
