import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Card, Icon, Text } from "react-native-paper";
import { PageContainer } from "@/components/PageContainer";
import { useApiClient } from "@/utils/apiClient";

export default function History() {
  const api = useApiClient();
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.get("/history");
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Fehler beim Laden der Daten");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  return (
    <PageContainer>
      <View style={{ padding: 16 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
          Backend Test
        </Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Card style={{ backgroundColor: "#fee" }}>
            <Card.Content>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon source="alert-circle" color="red" size={24} />
                <Text style={{ marginLeft: 8, color: "red" }}>{error}</Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card>
            <Card.Title
              title="Antwort vom Server"
              left={(props) => <Icon {...props} source="server" />}
            />
            <Card.Content>
              <Text variant="bodyLarge">{data}</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </PageContainer>
  );
}
