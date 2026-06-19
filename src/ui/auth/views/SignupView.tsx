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
import { UserPlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

export function SignupView() {
  const { signUp } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password || !confirmPassword) {
      setError('Complete all fields to create your account.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await signUp(email, password);
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      formTitle="Create your account"
      formDescription="Start planning workouts and tracking what you train each week.">
      <View className="gap-4">
        {error ? <AuthFormMessage message={error} /> : null}

        <View className="gap-2">
          <Label nativeID="signup-email">Email</Label>
          <Input
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            nativeID="signup-email"
            placeholder="you@example.com"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="gap-2">
          <Label nativeID="signup-password">Password</Label>
          <PasswordInput
            nativeID="signup-password"
            placeholder="At least 6 characters"
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="gap-2">
          <Label nativeID="signup-confirm-password">Confirm password</Label>
          <PasswordInput
            nativeID="signup-confirm-password"
            placeholder="Re-enter your password"
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <FlowButton
          className="mt-2 w-full"
          disabled={submitting}
          icon={UserPlusIcon}
          label={submitting ? 'Creating account...' : 'Create account'}
          onPress={handleSubmit}
        />

        <View className="flex-row items-center justify-center gap-1 pt-2">
          <Text className="text-sm text-muted-foreground">Already have an account?</Text>
          <Link href="/(auth)/login">
            <Text className="text-sm font-medium text-primary">Sign in</Text>
          </Link>
        </View>
      </View>
    </AuthSplitLayout>
  );
}
