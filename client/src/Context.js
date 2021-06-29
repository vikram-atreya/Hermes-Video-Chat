import React, { createContext, useState } from 'react';

const NameContext = createContext();

const ContextProvider = ({ children }) => {
  const [globalName, setglobalName] = useState('');
  const [chatDrawerOpen, setChatDraweropen] = useState(false);


  return (
    <NameContext.Provider value={{
      globalName,
      setglobalName,
      chatDrawerOpen,
      setChatDraweropen,
    }}
    >
      {children}
    </NameContext.Provider>
  );
};

export { ContextProvider, NameContext };
