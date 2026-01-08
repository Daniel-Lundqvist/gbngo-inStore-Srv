import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// Theme definitions with CSS variable values
const themes = {
  default: {
    name: 'Standard',
    colors: {
      '--color-primary': '#E31E24',
      '--color-primary-dark': '#B91C22',
      '--color-primary-light': '#FF4B50',
      '--color-secondary': '#FFFFFF',
      '--color-background': '#F5F5F5',
      '--color-surface': '#FFFFFF',
      '--color-text': '#333333',
      '--color-text-light': '#666666',
      '--color-accent': '#FFD700',
      '--color-success': '#28A745',
      '--color-error': '#DC3545',
      '--color-warning': '#FFC107'
    }
  },
  winter: {
    name: 'Vinter',
    colors: {
      '--color-primary': '#4A90D9',
      '--color-primary-dark': '#2E6BB0',
      '--color-primary-light': '#7AB8FF',
      '--color-secondary': '#FFFFFF',
      '--color-background': '#E8F4FC',
      '--color-surface': '#FFFFFF',
      '--color-text': '#1A3A5C',
      '--color-text-light': '#5A7A9C',
      '--color-accent': '#00D4FF',
      '--color-success': '#28A745',
      '--color-error': '#DC3545',
      '--color-warning': '#FFC107'
    }
  },
  easter: {
    name: 'Pask',
    colors: {
      '--color-primary': '#9B59B6',
      '--color-primary-dark': '#7D3C98',
      '--color-primary-light': '#BB8FCE',
      '--color-secondary': '#FFFFFF',
      '--color-background': '#FDF2FF',
      '--color-surface': '#FFFFFF',
      '--color-text': '#4A235A',
      '--color-text-light': '#7D5A8A',
      '--color-accent': '#FFB6C1',
      '--color-success': '#58D68D',
      '--color-error': '#E74C3C',
      '--color-warning': '#F4D03F'
    }
  },
  western: {
    name: 'Western',
    colors: {
      '--color-primary': '#8B4513',
      '--color-primary-dark': '#5D2E0D',
      '--color-primary-light': '#CD853F',
      '--color-secondary': '#FFF8DC',
      '--color-background': '#F5E6D3',
      '--color-surface': '#FFF8DC',
      '--color-text': '#3D2914',
      '--color-text-light': '#6B4C2A',
      '--color-accent': '#DAA520',
      '--color-success': '#6B8E23',
      '--color-error': '#8B0000',
      '--color-warning': '#FF8C00'
    }
  },
  summer: {
    name: 'Sommar',
    colors: {
      '--color-primary': '#FF6B35',
      '--color-primary-dark': '#E55A2B',
      '--color-primary-light': '#FF8C5A',
      '--color-secondary': '#FFFFFF',
      '--color-background': '#FFFEF0',
      '--color-surface': '#FFFFFF',
      '--color-text': '#2D3436',
      '--color-text-light': '#636E72',
      '--color-accent': '#00CEC9',
      '--color-success': '#00B894',
      '--color-error': '#D63031',
      '--color-warning': '#FDCB6E'
    }
  },
  retro: {
    name: 'Retro GameBoy',
    colors: {
      '--color-primary': '#8BAC0F',
      '--color-primary-dark': '#306230',
      '--color-primary-light': '#9BBC0F',
      '--color-secondary': '#0F380F',
      '--color-background': '#9BBC0F',
      '--color-surface': '#8BAC0F',
      '--color-text': '#0F380F',
      '--color-text-light': '#306230',
      '--color-accent': '#E0F8CF',
      '--color-success': '#306230',
      '--color-error': '#0F380F',
      '--color-warning': '#0F380F'
    }
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    // Load theme from API or localStorage
    loadTheme();
  }, []);

  useEffect(() => {
    // Apply theme CSS variables
    const themeColors = themes[theme]?.colors || themes.default.colors;
    const root = document.documentElement;

    for (const [property, value] of Object.entries(themeColors)) {
      root.style.setProperty(property, value);
    }

    // Add theme class to body
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const loadTheme = async () => {
    try {
      const response = await fetch('/api/settings/public');
      const data = await response.json();
      if (data.theme && themes[data.theme]) {
        setTheme(data.theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      // Use stored theme or default
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme && themes[storedTheme]) {
        setTheme(storedTheme);
      }
    }
  };

  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  const value = {
    theme,
    themes,
    changeTheme,
    currentTheme: themes[theme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
