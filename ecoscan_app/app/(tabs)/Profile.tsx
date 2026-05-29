import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Button, Card, Divider, Icon, Text } from "react-native-paper";
import { PageContainer } from "@/components/PageContainer";
import { useAuth } from "@/context/AuthContext";
import * as AuthSession from "expo-auth-session";
import { AUTH_CONFIG } from "@/utils/authConfig";

export default function Profile() {
  const { accessToken, logout } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const discovery = await AuthSession.fetchDiscoveryAsync(
          AUTH_CONFIG.issuer,
        );
        const userInfoEndpoint = discovery.userInfoEndpoint;
        if (!userInfoEndpoint) {
          console.error(
            "UserInfo endpoint is not available in discovery document.",
          );
          return;
        }

        const response = await fetch(userInfoEndpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setUserInfo(data);
      } catch (e) {
        console.error("Failed to fetch user info:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [accessToken]);

  return (
    <PageContainer>
      <ScrollView>
        <Card style={{ margin: 16 }}>
          <Card.Title
            title="Profil"
            left={(props) => <Icon {...props} source="account" />}
          />
          <Card.Content>
            {loading ? (
              <ActivityIndicator />
            ) : userInfo ? (
              <View>
                <Text variant="titleMedium">
                  Name: {userInfo.name || userInfo.preferred_username}
                </Text>
                <Text variant="bodyMedium">Email: {userInfo.email}</Text>
                <Divider style={{ marginVertical: 10 }} />
                <Text variant="labelLarge">UserInfo Rohdaten:</Text>
                <Text variant="bodySmall" style={{ fontFamily: "monospace" }}>
                  {JSON.stringify(userInfo, null, 2)}
                </Text>
              </View>
            ) : (
              <Text>Keine Benutzerinformationen verfügbar.</Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={logout} style={{ marginTop: 10 }}>
              Abmelden
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </PageContainer>
  );
}
