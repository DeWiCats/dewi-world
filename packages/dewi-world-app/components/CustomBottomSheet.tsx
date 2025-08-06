import { Theme } from '@/constants/theme';
import { useColors } from '@/hooks/theme';
import { wh, ww } from '@/utils/layout';
import BottomSheet, { BottomSheetProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useTheme } from '@shopify/restyle';
import { PropsWithChildren, RefObject } from 'react';

type CustomBottomSheetProps = PropsWithChildren<{
  ref?: RefObject<BottomSheetMethods | null>;
  sheetProps?: Omit<BottomSheetProps, 'children'>;
  sheetViewProps?: Omit<BottomSheetViewProps, 'children'>;
}>;

export default function CustomBottomSheet({
  ref,
  sheetProps,
  sheetViewProps,
  children,
}: CustomBottomSheetProps) {
  const colors = useColors();
  const { borderRadii } = useTheme<Theme>();

  return (
    <BottomSheet
      snapPoints={[150, wh - ww + 65, wh - 110]}
      index={0}
      role="alert"
      ref={ref}
      maxDynamicContentSize={wh - 110}
      handleIndicatorStyle={{ width: 100, backgroundColor: colors['gray.700'] }}
      backgroundStyle={{
        
        borderTopRightRadius: borderRadii.full,
        borderTopLeftRadius: borderRadii.full,
      }}
      handleStyle={{
        backgroundColor: colors['primaryBackground'],
        borderTopRightRadius: borderRadii.full,
        borderTopLeftRadius: borderRadii.full,
      }}
      {...sheetProps}
    >
      <BottomSheetView
        style={{
          backgroundColor: colors['primaryBackground'],
          flex: 1,
          alignItems: 'center',
          height: wh - 110,
        }}
        {...sheetViewProps}
      >
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}
