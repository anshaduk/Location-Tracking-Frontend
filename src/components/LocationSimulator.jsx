import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import api from '../services/api';

const LocationSimulator = ({ users }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [latitude, setLatitude] = useState('10.0'); 
  const [longitude, setLongitude] = useState('76.5'); 
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!selectedUser) {
        setStatus({ message: 'Please select a user', type: 'error' });
        return;
      }

      const user = users.find(u => u.username === selectedUser);
      if (!user) {
        setStatus({ message: 'User not found', type: 'error' });
        return;
      }
    
      
      await api.updateLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        user.id
      );

      setStatus({
        message: `Location updated for user ${selectedUser}!`,
        type: 'success'
      });

      setTimeout(() => {
        setStatus({ message: '', type: '' });
      }, 3000);

    } catch (error) {
      setStatus({
        message: `Error: ${error.response?.data?.error || error.message}`,
        type: 'error'
      });
    }
  };

  const randomizeLocation = () => {
    const newLat = (8.3 + Math.random() * (12.8 - 8.3)).toFixed(6);
    const newLng = (74.8 + Math.random() * (77.2 - 74.8)).toFixed(6);

    setLatitude(newLat);
    setLongitude(newLng);
  };

  return (
    <Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Location Simulator
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="user-select-label">Select User</InputLabel>
          <Select
            labelId="user-select-label"
            value={selectedUser}
            label="Select User"
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users.map(user => (
              <MenuItem key={user.id} value={user.username}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
          <TextField
            label="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            type="number"
            inputProps={{ step: 0.000001 }}
          />

          <TextField
            label="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            type="number"
            inputProps={{ step: 0.000001 }}
          />

          <Button
            variant="outlined"
            onClick={randomizeLocation}
            sx={{ ml: 'auto' }}
          >
            Randomize
          </Button>
        </Box>

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Update Location
        </Button>
      </form>

      {status.message && (
        <Alert severity={status.type} sx={{ mt: 2 }}>
          {status.message}
        </Alert>
      )}
    </Box>
  );
};

export default LocationSimulator;