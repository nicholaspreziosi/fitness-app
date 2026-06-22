import { Text } from '@/components/ui/text';
import { FlowLogo } from '@/src/ui/shared/components/FlowLogo';
import { useKeyboardInset } from '@/src/ui/shared/hooks/useKeyboardInset';
import { cn } from '@/lib/utils';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_POINTS = [
  'Exercise library and reusable template blocks',
  'Weekly planning with workout checklists',
  'Progress tracking and training coverage',
];

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  formTitle: string;
  formDescription: string;
};

function AuthFormSection({
  formTitle,
  formDescription,
  children,
}: {
  formTitle: string;
  formDescription: string;
  children: React.ReactNode;
}) {
  return (
    <View className="px-6 md:px-12 md:py-12">
      <View className="w-full md:max-w-md md:self-center">
        <Text className="text-2xl font-semibold tracking-tight text-foreground">{formTitle}</Text>
        <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">{formDescription}</Text>
        <View className="mt-8">{children}</View>
      </View>
    </View>
  );
}

function AuthBrandPanel() {
  return (
    <View
      className={cn(
        'hidden w-[46%] flex-col items-center justify-center border-r border-auth-brand-border bg-auth-brand px-12 py-12',
        'md:flex'
      )}>
      <FlowLogo variant="auth-desktop" />

      <View className="mt-10 w-full max-w-md">
        <Text className="text-lg leading-7 text-auth-brand-muted">
          What should I train this week, what did I complete, and am I neglecting any important
          area?
        </Text>

        <View className="mt-8 gap-3">
          {BRAND_POINTS.map((point) => (
            <View key={point} className="flex-row items-start gap-3">
              <View className="mt-2 size-1.5 rounded-full bg-brand" />
              <Text className="flex-1 text-sm leading-6 text-auth-brand-muted">{point}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function AuthSplitLayout({ children, formTitle, formDescription }: AuthSplitLayoutProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardInset();

  const layout = (
    <View className="flex-1 bg-background md:flex-row" style={{ paddingTop: insets.top }}>
      <AuthBrandPanel />

      <ScrollView
        className="flex-1 bg-background md:w-[54%]"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerClassName="flex-grow md:justify-center"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom:
            Math.max(insets.bottom, 24) + (Platform.OS === 'android' ? keyboardHeight : 0),
        }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        testID="auth-mobile-scroll">
        <View
          className="min-h-[24vh] items-center justify-center px-6 py-10 md:hidden"
          testID="auth-mobile-logo">
          <FlowLogo variant="auth-mobile" />
        </View>

        <AuthFormSection formDescription={formDescription} formTitle={formTitle}>
          {children}
        </AuthFormSection>
      </ScrollView>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior="padding"
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}>
        {layout}
      </KeyboardAvoidingView>
    );
  }

  return layout;
}

export function AuthFormMessage({
  message,
  tone = 'error',
}: {
  message: string;
  tone?: 'error' | 'success';
}) {
  return (
    <View
      className={cn(
        'rounded-lg border px-3 py-2.5',
        tone === 'error' ? 'border-destructive/20 bg-destructive/5' : 'border-success/20 bg-success/5'
      )}>
      <Text className={cn('text-sm', tone === 'error' ? 'text-destructive' : 'text-success')}>
        {message}
      </Text>
    </View>
  );
}

export function AuthFormLoading() {
  return (
    <View className="items-center py-6">
      <ActivityIndicator />
    </View>
  );
}
