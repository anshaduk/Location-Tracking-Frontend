import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  FormControlLabel,
  Switch
} from '@mui/material';
import api from '../services/api';

const UserSelection = ({ onUserSelectionChange, onShowHistoryChange }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await api.getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserChange = (event) => {
    const { value } = event.target;
    setSelectedUserIds(value);
    onUserSelectionChange(value);
  };

  const handleHistoryToggle = (event) => {
    setShowHistory(event.target.checked);
    onShowHistoryChange(event.target.checked);
  };

  return (
    <Box sx={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControl sx={{ minWidth: 300 }}>
        <InputLabel id="user-selection-label">Select Users</InputLabel>
        <Select
          labelId="user-selection-label"
          id="user-selection"
          multiple
          value={selectedUserIds}
          onChange={handleUserChange}
          input={<OutlinedInput label="Select Users" />}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <em>All Users</em>;
            }
            
            return selected
              .map(id => users.find(user => user.id === id)?.username)
              .filter(Boolean)
              .join(', ');
          }}
        >
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              <Checkbox checked={selectedUserIds.indexOf(user.id) > -1} />
              <ListItemText primary={user.username} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControlLabel
        control={
          <Switch
            checked={showHistory}
            onChange={handleHistoryToggle}
            color="primary"
          />
        }
        label="Show Location History"
      />
    </Box>
  );
};

export default UserSelection;