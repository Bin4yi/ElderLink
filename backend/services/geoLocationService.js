/**
 * Geo-location service for ambulance dispatch system
 * Provides distance calculations, ETA estimates, and location utilities
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate arrival time based on distance and average speed
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} averageSpeedKmh - Average speed in km/h (default: 60)
 * @returns {number} Estimated time in minutes
 */
function estimateArrivalTime(distanceKm, averageSpeedKmh = 60) {
  // Add 20% buffer for traffic and routing
  const adjustedDistance = distanceKm * 1.2;
  const timeInHours = adjustedDistance / averageSpeedKmh;
  const timeInMinutes = Math.round(timeInHours * 60);
  
  return timeInMinutes;
}

/**
 * Find the nearest ambulance to an emergency location
 * @param {Object} emergencyLocation - { latitude, longitude }
 * @param {Array} ambulances - Array of ambulance objects with currentLocation
 * @returns {Object|null} Nearest ambulance with distance
 */
function findNearestAmbulance(emergencyLocation, ambulances) {
  if (!ambulances || ambulances.length === 0) {
    return null;
  }

  let nearestAmbulance = null;
  let minDistance = Infinity;

  ambulances.forEach(ambulance => {
    if (
      ambulance.currentLocation &&
      ambulance.currentLocation.latitude &&
      ambulance.currentLocation.longitude
    ) {
      const distance = calculateDistance(
        emergencyLocation.latitude,
        emergencyLocation.longitude,
        ambulance.currentLocation.latitude,
        ambulance.currentLocation.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestAmbulance = {
          ...ambulance,
          distance,
          estimatedArrival: estimateArrivalTime(distance),
        };
      }
    }
  });

  return nearestAmbulance;
}

/**
 * Find N nearest ambulances to an emergency location
 * @param {Object} location - { latitude, longitude }
 * @param {Array} ambulances - Array of ambulance objects
 * @param {number} limit - Number of ambulances to return (default: 5)
 * @returns {Array} Sorted array of nearest ambulances with distances
 */
function findNearestAmbulances(location, ambulances, limit = 5) {
  if (!ambulances || ambulances.length === 0) {
    return [];
  }

  const ambulancesWithDistance = ambulances
    .map(ambulance => {
      if (
        !ambulance.currentLocation ||
        !ambulance.currentLocation.latitude ||
        !ambulance.currentLocation.longitude
      ) {
        return null;
      }

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        ambulance.currentLocation.latitude,
        ambulance.currentLocation.longitude
      );

      return {
        ...ambulance,
        distance,
        estimatedArrival: estimateArrivalTime(distance),
      };
    })
    .filter(a => a !== null)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return ambulancesWithDistance;
}

/**
 * Format location for display
 * @param {Object} location - { latitude, longitude, address }
 * @returns {string} Formatted location string
 */
function formatLocation(location) {
  if (!location) {
    return 'Unknown location';
  }

  if (location.address) {
    return location.address;
  }

  if (location.latitude && location.longitude) {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  return 'Unknown location';
}

module.exports = {
  calculateDistance,
  estimateArrivalTime,
  findNearestAmbulance,
  findNearestAmbulances,
  formatLocation,
  toRad,
};
