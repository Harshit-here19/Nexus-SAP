import { createContext, useContext, useState, useCallback } from "react";

const ActionContext = createContext();

export const ActionProvider = ({ children }) => {

  // Store active handlers
  const [handlers, setHandlers] = useState({});

  // Register action (SAVE, DELETE, etc.)
  const registerAction = useCallback((actionName, handler) => {
    setHandlers((prev) => ({
      ...prev,
      [actionName]: handler,
    }));
  }, []);

  // Clear action when screen unmounts
  const clearAction = useCallback((actionName) => {
    setHandlers((prev) => {
      const updated = { ...prev };
      delete updated[actionName];
      return updated;
    });
  }, []);

  // Trigger action globally
  const triggerAction = useCallback(
    (actionName) => {
      if (handlers[actionName]) {
        handlers[actionName]();
      } else {
        console.warn(`No handler registered for ${actionName}`);
      }
    },
    [handlers],
  );

  return (
    <ActionContext.Provider
      value={{
        registerAction,
        clearAction,
        triggerAction,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
};

export const useAction = () => useContext(ActionContext);
