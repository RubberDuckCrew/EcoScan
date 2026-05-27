import { Surface, SurfaceProps } from "react-native-paper";
import { ReactNode } from "react";
import { StyleSheet } from "react-native";

type PageContainerProps = SurfaceProps & {
  children: ReactNode;
};

export default function PageContainer({
  children,
  style,
  ...props
}: PageContainerProps) {
  return (
    <Surface style={[styles.surface, style]} {...props}>
      {children}
    </Surface>
  );
}
const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
});
