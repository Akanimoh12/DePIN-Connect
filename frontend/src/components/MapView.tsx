import { useEffect, useState, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Import marker images - remove icon references since we use custom divIcons anyway
// const markerIcon = 'data:image/svg+xml;base64,...'; // Not needed with custom divIcons

// Custom icon for active devices (green)
const activeIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="relative">
    <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
    <div class="relative bg-green-500 rounded-full w-6 h-6 border-2 border-white shadow-lg flex items-center justify-center">
      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6c0 4.314 6 10 6 10s6-5.686 6-10a6 6 0 00-6-6z"/>
      </svg>
    </div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom icon for inactive devices (gray)
const inactiveIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="relative">
    <div class="relative bg-gray-500 rounded-full w-6 h-6 border-2 border-white shadow-lg flex items-center justify-center">
      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6c0 4.314 6 10 6 10s6-5.686 6-10a6 6 0 00-6-6z"/>
      </svg>
    </div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Device {
  deviceId: string;
  owner: string;
  dataSchema: string;
  isActive: boolean;
  registeredAt: number;
  coordinates: [number, number];
  activeSubscribers?: number;
  price?: string;
}

interface MapViewProps {
  devices: Device[];
  isLoading: boolean;
  onDeviceClick?: (device: Device) => void;
  selectedDevice?: Device | null;
}

// Component to handle map updates when device is selected
const MapUpdater = ({ device }: { device: Device | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (device) {
      map.flyTo(device.coordinates, 8, {
        duration: 1.5,
      });
    }
  }, [device, map]);
  
  return null;
};

// Helper function to generate random coordinates for demo
export const getRandomCoordinates = (): [number, number] => {
  const lat = (Math.random() * 160) - 80; // -80 to 80
  const lng = (Math.random() * 360) - 180; // -180 to 180
  return [lat, lng];
};

// Helper function to format price
const formatPrice = (priceWei: string): string => {
  try {
    // Convert wei to CRO (assuming 1e15 wei = 0.001 CRO/sec)
    const croPerSec = parseFloat(priceWei) / 1e18;
    return `${croPerSec.toFixed(6)} CRO/sec`;
  } catch {
    return '0.001 CRO/sec';
  }
};

// Helper function to calculate hourly cost
const calculateHourlyCost = (priceWei: string): string => {
  try {
    const croPerSec = parseFloat(priceWei) / 1e18;
    const croPerHour = croPerSec * 3600;
    return `~${croPerHour.toFixed(2)} CRO/hour`;
  } catch {
    return '~3.6 CRO/hour';
  }
};

export const MapView = ({ 
  devices, 
  isLoading, 
  onDeviceClick,
  selectedDevice 
}: MapViewProps) => {
  const [mapReady, setMapReady] = useState(false);

  // Memoize devices with coordinates
  const devicesWithCoords = useMemo(() => {
    return devices.map((device: Device) => ({
      ...device,
      coordinates: device.coordinates || getRandomCoordinates(),
      price: device.price || '1000000000000000', // Default 0.001 CRO/sec in wei
      activeSubscribers: device.activeSubscribers || 0,
    }));
  }, [devices]);

  useEffect(() => {
    // Ensure map is ready after component mounts
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 animate-fade-in">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        className="h-[400px] lg:h-[600px] w-full z-0"
        scrollWheelZoom={true}
        style={{ background: '#1f2937' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapReady && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {devicesWithCoords.map((device: Device, index: number) => (
              <Marker
                key={`${device.deviceId}-${index}`}
                position={device.coordinates}
                icon={device.isActive ? activeIcon : inactiveIcon}
                eventHandlers={{
                  click: () => onDeviceClick?.(device),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[250px]">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">
                        {device.deviceId}
                      </h3>
                      <Badge variant={device.isActive ? 'success' : 'neutral'}>
                        {device.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-semibold">Provider:</span>{' '}
                        <span className="font-mono text-xs">
                          {device.owner.slice(0, 6)}...{device.owner.slice(-4)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-semibold">Data Schema:</span>
                        <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono overflow-hidden">
                          {device.dataSchema.slice(0, 50)}
                          {device.dataSchema.length > 50 && '...'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div>
                          <div className="text-xs text-gray-500">Price</div>
                          <div className="font-bold text-indigo-600">
                            {formatPrice(device.price || '1000000000000000')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculateHourlyCost(device.price || '1000000000000000')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Subscribers</div>
                          <div className="font-bold text-lg">
                            {device.activeSubscribers}
                          </div>
                        </div>
                      </div>
                      
                      {device.isActive && (
                        <button
                          onClick={() => onDeviceClick?.(device)}
                          className="w-full mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
        
        {selectedDevice && <MapUpdater device={selectedDevice} />}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Device Status</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export memoized version for better performance
export default memo(MapView);
