import { LoadingIndicator } from "@/components/LoadingIndicator";
import { PageContainer } from "@/components/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { theme } from "@/theme";
import { OidcUserInfo } from "@/types/userInfo";
import Constants from "expo-constants";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Icon,
  Surface,
  Text,
} from "react-native-paper";

function getInitials(userInfo: OidcUserInfo | null): string {
  const given = userInfo?.given_name || "";
  const family = userInfo?.family_name || "";
  if (given && family) return `${given[0]}${family[0]}`.toUpperCase();
  const name = userInfo?.name || userInfo?.preferred_username;
  return name ? name[0].toUpperCase() : "?";
}

export default function Profile() {
  const { logout } = useAuth();
  const { userInfo, loading, error } = useUserInfo();
  const c = theme.colors;

  const givenName = userInfo?.given_name;
  const familyName = userInfo?.family_name;
  const displayName =
    [givenName, familyName].filter(Boolean).join(" ") ||
    userInfo?.name ||
    userInfo?.preferred_username;
  const email = userInfo?.email;
  const initials = getInitials(userInfo);
  const appVersion = Constants.expoConfig?.version || "0.0.0";

  if (loading) {
    return (
      <PageContainer>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LoadingIndicator />
        </ScrollView>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContent}>
            <Icon source="alert-circle-outline" size={56} color={c.error} />
            <Text
              variant="titleMedium"
              style={{ color: c.error, marginTop: 12 }}
            >
              Fehler beim Laden
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: c.muted, marginTop: 8, textAlign: "center" }}
            >
              Bitte versuche es später erneut.
            </Text>
          </View>
        </ScrollView>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ padding: 0 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.headerCard}>
          <Avatar.Text
            size={84}
            label={initials}
            color="#FFFFFF"
            style={{ backgroundColor: c.primary }}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {displayName || "Unbekannt"}
          </Text>
          {email && (
            <View style={styles.emailRow}>
              <Icon source="email-outline" size={16} color={c.muted} />
              <Text variant="bodyLarge" style={styles.email}>
                {email}
              </Text>
            </View>
          )}
        </Surface>

        <Card style={styles.card}>
          <Card.Title
            title="Konto"
            left={(props) => <Icon {...props} source="badge-account-outline" />}
          />
          <Divider style={styles.divider} />
          <Card.Content style={styles.cardContent}>
            <Row icon="account-outline" label="Vorname" value={givenName} />
            <Row icon="account-outline" label="Nachname" value={familyName} />
            <Row icon="email-outline" label="E-Mail" value={email} />
            <Row
              icon="at"
              label="Benutzername"
              value={userInfo?.preferred_username}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="App"
            left={(props) => <Icon {...props} source="information-outline" />}
          />
          <Divider style={styles.divider} />
          <Card.Content style={styles.cardContent}>
            <Row
              icon="cellphone"
              label="Version"
              value={`EcoScan v${appVersion}`}
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          icon="logout"
          buttonColor={c.error}
          textColor="#FFFFFF"
        >
          Abmelden
        </Button>
      </ScrollView>
    </PageContainer>
  );
}

function Row({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value?: string | null;
  valueColor?: string;
}) {
  if (value == null || value === "") return null;
  return (
    <View style={styles.row}>
      <Icon source={icon} size={18} color={theme.colors.lightMuted} />
      <Text variant="bodyLarge" style={styles.rowLabel}>
        {label}
      </Text>
      <Text
        variant="bodyLarge"
        style={[
          styles.rowValue,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 16,
    marginHorizontal: 16,
    gap: 16,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  headerCard: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    marginTop: 0,
  },
  name: {
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  email: {
    color: theme.colors.muted,
  },
  card: {
    borderRadius: 16,
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.outline,
  },
  cardContent: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  rowLabel: {
    color: theme.colors.muted,
    flex: 1,
  },
  rowValue: {
    fontWeight: "500",
    textAlign: "right",
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  logoutButtonContent: {
    paddingVertical: 6,
  },
});
