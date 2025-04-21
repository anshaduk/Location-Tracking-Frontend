import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = {
    getUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}/users/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching users: ",error);
            throw error;
        }
        
    },

    
    getActiveLocations: async () => {
        try {
            const response = await axios.get(`${API_URL}/active-locations/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching active locations:",error);
            throw error;
        }
    },


    getLocationHistory: async (userId,limit=100) => {
        try {
            const response = await axios.get(`${API_URL}/location-history/${userId}/?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching location history:",error);
            throw error;
        }

    },

    
    updateLocation: async (latitude, longitude, userId, token = null) => {
        try {
          const headers = {};
          
          if (token) {
            headers.Authorization = `Token ${token}`;
          }
          
          const response = await axios.post(
            `${API_URL}/update-location/`,
            { 
              latitude, 
              longitude,
              user_id: userId  
            },
            { headers: Object.keys(headers).length > 0 ? headers : undefined }
          );
          return response.data;
        } catch (error) {
          console.error('Error updating location:', error);
          throw error;
        }
    }
};

export default api;