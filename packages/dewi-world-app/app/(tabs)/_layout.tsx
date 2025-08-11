import ServiceSheetLayout from '@/components/ServiceSheetLayout';
import TabsHeader from '@/components/TabsHeader';
import { darkTheme } from '@/constants/theme';
import { useSpacing } from '@/hooks/theme';
import { ThemeProvider } from '@shopify/restyle';

export default function TabsLayout() {
  const spacing = useSpacing();

  return (
    <ThemeProvider theme={darkTheme}>
      <TabsHeader position="absolute" top={spacing['4xl']} left={0} right={0} zIndex={1000} />
      <ServiceSheetLayout />
    </ThemeProvider>
  );
}
