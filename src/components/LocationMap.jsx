import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import WebSocketInstance from '../services/websocket';
import { UserContext } from '../context/UserContext'; 

// Fix for Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMap = ({ selectedUsers, showHistory }) => {
  const { user } = useContext(UserContext);  
  const [locations, setLocations] = useState([]);
  const [historyData, setHistoryData] = useState({});
  const [mapCenter, setMapCenter] = useState([74.8, 12.8]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await api.getActiveLocations();
        if (data && data.features) {
          setLocations(data.features);

          if (data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates;
            setMapCenter([coords[1], coords[0]]);
          }
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();

    
    WebSocketInstance.connect();

    
    WebSocketInstance.addCallback('locationMap', (data) => handleLocationUpdate(data, user?.id));

    return () => {
      WebSocketInstance.removeCallback('locationMap');
      WebSocketInstance.disconnect();
    };
  }, [user?.id]);


  const handleLocationUpdate = (data, userId) => {
    if (!data || !data.geometry || !data.properties || !userId) return;

    data.properties.user = userId;

    setLocations((prevLocations) => {
      const userIndex = prevLocations.findIndex((loc) => loc.properties.user === userId);

      if (userIndex >= 0) {
        const newLocations = [...prevLocations];
        newLocations[userIndex] = data;
        return newLocations;
      } else {
        return [...prevLocations, data];
      }
    });
  };

  
  useEffect(() => {
    const fetchHistoryForUsers = async () => {
      if (!showHistory || selectedUsers.length === 0) {
        setHistoryData({});
        return;
      }

      try {
        const newHistoryData = {};

        for (const userId of selectedUsers) {
          const historyResponse = await api.getLocationHistory(userId);
          if (historyResponse && historyResponse.features) {
            newHistoryData[userId] = historyResponse.features;
          }
        }

        setHistoryData(newHistoryData);
      } catch (error) {
        console.error('Error fetching history data:', error);
      }
    };

    fetchHistoryForUsers();
  }, [selectedUsers, showHistory]);

  const filteredLocations = selectedUsers.length > 0
    ? locations.filter((loc) => selectedUsers.includes(loc.properties.user))
    : locations;

  const historyLines = Object.entries(historyData).map(([userId, historyPoints]) => {
    if (!historyPoints || historyPoints.length < 2) return null;

    const pathPoints = historyPoints.map((point) => {
      const coords = point.geometry.coordinates;
      return [coords[1], coords[0]];
    });

    const colors = ['blue', 'red', 'green', 'purple', 'orange'];
    const colorIndex = userId % colors.length;

    return (
      <Polyline
        key={`history-${userId}`}
        positions={pathPoints}
        color={colors[colorIndex]}
        weight={3}
        opacity={0.7}
      />
    );
  }).filter(Boolean);

  const generateKey = (prefix, props, fallback) => {
    return `${prefix}-${props?.id ?? props?.user ?? props?.username ?? fallback}`;
  };

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {filteredLocations.map((location) => {
        const coords = location.geometry.coordinates;
        const props = location.properties;

        return (
          <Marker
            key={generateKey('marker', props, Math.random())}
            position={[coords[1], coords[0]]}
          >
            <Popup>
              <div>
                <h3>{props.username}</h3>
                <p>Latitude: {coords[1].toFixed(6)}</p>
                <p>Longitude: {coords[0].toFixed(6)}</p>
                <p>Updated: {new Date(props.timestamp).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {showHistory && historyLines}

      {showHistory &&
        Object.entries(historyData)
          .map(([userId, historyPoints]) =>
            historyPoints.map((point, index) => {
              const coords = point.geometry.coordinates;
              const props = point.properties;

              if (index === 0) return null;

              return (
                <Marker
                  key={generateKey('history-marker', props, `${userId}-${index}`)}
                  position={[coords[1], coords[0]]}
                  opacity={0.6}
                >
                  <Popup>
                    <div>
                      <h3>{props.username}</h3>
                      <p>Historical Location</p>
                      <p>Timestamp: {new Date(props.timestamp).toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          )
          .flat()
          .filter(Boolean)}
    </MapContainer>
  );
};

export default LocationMap;
