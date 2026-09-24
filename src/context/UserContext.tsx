import React, { createContext, useContext, useState } from 'react';

const USER_NAME_STORAGE_KEY = 'agri_ai_user_name_v1';
export const DEFAULT_USER_NAME = 'Farmer';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  userInitials: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserNameState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(USER_NAME_STORAGE_KEY);
      if (saved && saved.trim()) {
        return saved.trim();
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USER_NAME;
  });

  const setUserName = (newName: string) => {
    const cleanName = newName.trim() || DEFAULT_USER_NAME;
    setUserNameState(cleanName);
    try {
      localStorage.setItem(USER_NAME_STORAGE_KEY, cleanName);
    } catch {
      // Ignore
    }
  };

  // Derive initials dynamically:
  // "Farmer" -> "F"
  // "Ravi" -> "R"
  // "Ravi Kumar" -> "RK"
  const userInitials = (() => {
    const trimmed = userName.trim();
    if (!trimmed) return 'F';
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  })();

  return (
    <UserContext.Provider value={{ userName, setUserName, userInitials }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
