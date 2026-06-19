import fs from 'fs';
import path from 'path';

const UI_ROOT = path.join(process.cwd(), 'src/ui');
const APP_ROOT = path.join(process.cwd(), 'app');

function collectSourceFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(fullPath);
    }

    if (/\.(tsx|ts)$/.test(entry.name)) {
      return [fullPath];
    }

    return [];
  });
}

function readImports(source: string): string[] {
  const imports: string[] = [];
  const importPattern = /from ['"]([^'"]+)['"]/g;

  for (const match of source.matchAll(importPattern)) {
    imports.push(match[1] ?? '');
  }

  return imports;
}

describe('auth architecture', () => {
  it('keeps Firebase auth out of UI screens and route files', () => {
    const files = [...collectSourceFiles(UI_ROOT), ...collectSourceFiles(APP_ROOT)];
    const offenders = files.filter((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const imports = readImports(source);

      return imports.some(
        (importPath) =>
          importPath === 'firebase/auth' ||
          importPath.startsWith('firebase/auth/') ||
          importPath.includes('/firebaseAuth.repository')
      );
    });

    expect(offenders).toEqual([]);
  });

  it('routes auth UI through useAuth', () => {
    const authScreens = [
      path.join(UI_ROOT, 'auth/views/LoginView.tsx'),
      path.join(UI_ROOT, 'auth/views/SignupView.tsx'),
      path.join(UI_ROOT, 'shared/views/SettingsView.tsx'),
    ];

    authScreens.forEach((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');

      expect(source).toContain('useAuth');
      expect(source).not.toMatch(/from ['"]firebase\/auth['"]/);
    });
  });
});
