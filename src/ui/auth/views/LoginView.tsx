import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { AuthError } from '@/src/contexts/auth/domain/auth.model';
import {
  AuthFormMessage,
  AuthSplitLayout,
} from '@/src/ui/auth/components/AuthSplitLayout';
import { PasswordInput } from '@/src/ui/auth/components/PasswordInput';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { Link } from 'expo-router';
import { LogInIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

export function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);

    try {
      await signIn(email, password);
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      formTitle="Welcome back"
      formDescription="Sign in to access your workouts, library, and training plan.">
      <View className="gap-4">
        {error ? <AuthFormMessage message={error} /> : null}

        <View className="gap-2">
          <Label nativeID="login-email">Email</Label>
          <Input
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            nativeID="login-email"
            placeholder="you@example.com"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="gap-2">
          <Label nativeID="login-password">Password</Label>
          <PasswordInput
            nativeID="login-password"
            placeholder="Your password"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <FlowButton
          className="mt-2 w-full"
          disabled={submitting}
          icon={LogInIcon}
          label={submitting ? 'Signing in...' : 'Sign in'}
          onPress={handleSubmit}
        />

        <View className="flex-row items-center justify-center gap-1 pt-2">
          <Text className="text-sm text-muted-foreground">New to Flow?</Text>
          <Link href="/(auth)/signup">
            <Text className="text-sm font-medium text-primary">Create an account</Text>
          </Link>
        </View>
      </View>
    </AuthSplitLayout>
  );
}
