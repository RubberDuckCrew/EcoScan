import { Linking } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

type LocationNeededPortalProps = {
  visible: boolean;
  onDismiss: () => void;
};

export default function LocationNeededPortal({
  visible,
  onDismiss,
}: LocationNeededPortalProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Standort benötigt</Dialog.Title>
        <Dialog.Content>
          <Text>
            Für Supermärkte in deiner Nähe wird dein Standort benötigt.{"\n"}
            Bitte erlaube den Zugriff in den Einstellungen.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Abbrechen</Button>
          <Button onPress={() => Linking.openSettings()}>Einstellungen</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
