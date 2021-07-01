import React, { createContext, useState } from "react";

const NameContext = createContext();

const ContextProvider = ({ children }) => {
  const [globalName, setglobalName] = useState("");
  const [chatDrawerOpen, setChatDraweropen] = useState(false);
  const [peopleDrawerOpen, setPeopleDraweropen] = useState(false);

  return (
    <NameContext.Provider
      value={{
        globalName,
        setglobalName,
        chatDrawerOpen,
        setChatDraweropen,
        peopleDrawerOpen,
        setPeopleDraweropen,
      }}
    >
      {children}
    </NameContext.Provider>
  );
};

export { ContextProvider, NameContext };
