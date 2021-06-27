import React, { createContext, useState } from 'react';

const NameContext = createContext();

const ContextProvider = ({ children }) => {
  const [globalName, setglobalName] = useState('');


  return (
    <NameContext.Provider value={{
      globalName,
      setglobalName,
    }}
    >
      {children}
    </NameContext.Provider>
  );
};

export { ContextProvider, NameContext };
