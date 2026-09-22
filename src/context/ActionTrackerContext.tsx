import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserAction {
  timestamp: string;
  action: string;
  section: string;
}

interface ActionTrackerContextType {
  actions: UserAction[];
  currentSection: string;
  logAction: (actionName: string, sectionName?: string) => void;
  setCurrentSection: (section: string) => void;
}

const ActionTrackerContext = createContext<ActionTrackerContextType | undefined>(undefined);

export const ActionTrackerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSection, setCurrentSectionState] = useState<string>('Кабинет');
  const [actions, setActions] = useState<UserAction[]>([]);

  const logAction = (actionName: string, sectionName?: string) => {
    const targetSection = sectionName || currentSection;
    const newAction: UserAction = {
      timestamp: new Date().toISOString(),
      action: actionName,
      section: targetSection,
    };
    setActions((prev) => {
      const updated = [...prev, newAction];
      // Slice from the end to keep the last 10 elements
      return updated.slice(-10);
    });
  };

  const setCurrentSection = (section: string) => {
    setCurrentSectionState(section);
  };

  // Automatically log when currentSection changes
  useEffect(() => {
    logAction(`Переход в раздел: ${currentSection}`, currentSection);
  }, [currentSection]);

  return (
    <ActionTrackerContext.Provider value={{ actions, currentSection, logAction, setCurrentSection }}>
      {children}
    </ActionTrackerContext.Provider>
  );
};

export const useActionTracker = () => {
  const context = useContext(ActionTrackerContext);
  if (context === undefined) {
    throw new Error('useActionTracker must be used within an ActionTrackerProvider');
  }
  return context;
};
