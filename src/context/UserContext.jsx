import React, { createContext, useState, useContext } from 'react';

// Create a UserContext
export const UserContext = createContext();

// Create a UserProvider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loginUser = (userData) => {
    setUser(userData); // Set the user data when logged in
  };

  const logoutUser = () => {
    setUser(null); // Clear user data when logged out
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use UserContext
export const useUser = () => useContext(UserContext);
