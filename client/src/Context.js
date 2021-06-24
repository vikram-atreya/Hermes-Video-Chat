import React, { createContext, useState } from 'react';

const NameContext = createContext();

const ContextProvider = ({ children }) => {
  const [name, setName] = useState('');


  return (
    <NameContext.Provider value={{
      name,
      setName,
    }}
    >
      {children}
    </NameContext.Provider>
  );
};

export { ContextProvider, NameContext };
