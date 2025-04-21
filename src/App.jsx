import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import LocationMap from './components/LocationMap';
import UserSelection from './components/UserSelection';
import LocationSimulator from './components/LocationSimulator';
import api from './services/api';
import { UserProvider } from './context/UserContext'; // Import UserProvider

function App() {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userList = await api.getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleUserSelectionChange = (selectedIds) => {
    setSelectedUsers(selectedIds);
  };

  const handleShowHistoryChange = (show) => {
    setShowHistory(show);
  };

  return (
    <UserProvider> {/* Wrap the app with UserProvider */}
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Live Location Tracking
          </Typography>
          
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <UserSelection 
              onUserSelectionChange={handleUserSelectionChange}
              onShowHistoryChange={handleShowHistoryChange}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <LocationMap 
              selectedUsers={selectedUsers} 
              showHistory={showHistory}
            />
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3 }}>
            <LocationSimulator users={users} />
          </Paper>
        </Box>
      </Container>
    </UserProvider>
  );
}

export default App;
