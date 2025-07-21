import ServiceSheetLayout from '@/components/ServiceSheetLayout';
import TabsHeader from '@/components/TabsHeader';
import { useSpacing } from '@/hooks/theme';
import React from 'react';

export default function TabsLayout() {
  const spacing = useSpacing();

  return (
    <>
      <TabsHeader position="absolute" top={spacing['4xl']} left={0} right={0} zIndex={1000} />
      <ServiceSheetLayout />
    </>
  );
}
