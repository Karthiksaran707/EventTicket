import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-card hover:bg-muted transition-colors"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-foreground" />
      ) : (
        <Moon className="w-4 h-4 text-foreground" />
      )}
    </button>
  );
}