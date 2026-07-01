import React from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Button, Card, Divider, Icon, Text, } from "react-native-paper";
import { PageContainer } from "@/components/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { useUserInfo } from "@/hooks/useUserInfo";

export default function Profile() {
  const { logout } = useAuth();
  const { userInfo, loading, error } = useUserInfo();

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
            ) : error ? (
              <Text style={{ color: "red" }}>Fehler: {error}</Text>
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
