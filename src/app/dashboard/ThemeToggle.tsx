'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './dashboard.module.css';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark-dashboard');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark-dashboard');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark-dashboard');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Dark Mode">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
