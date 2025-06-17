// src/components/family/elder/ElderList.js
import React from 'react';
import { User, Calendar, MapPin, Heart } from 'lucide-react';
import { calculateAge } from '../../../utils/helpers';

const ElderList = ({ elders, onSelectElder }) => {
  // Debug logging
  console.log('ElderList received elders:', elders);
  elders?.forEach((elder, index) => {
    console.log(`Elder ${index}:`, {
      id: elder.id,
      name: `${elder.firstName} ${elder.lastName}`,
      photo: elder.photo,
      hasPhoto: !!elder.photo
    });
  });

  if (elders.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Elders Added</h3>
        <p className="text-gray-500">Add an elder profile to get started</p>
      </div>
    );
  }

  const getPhotoUrl = (photoFilename) => {
    if (!photoFilename) return null;
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const photoUrl = `${baseUrl}/uploads/elders/${photoFilename}`;
    
    console.log('Photo URL constructed:', photoUrl);
    return photoUrl;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {elders.map((elder) => {
        const photoUrl = getPhotoUrl(elder.photo);
        const age = calculateAge(elder.dateOfBirth);
        
        return (
          <div
            key={elder.id}
            className="elder-card cursor-pointer transform hover:scale-105 transition-transform duration-200"
            onClick={() => onSelectElder(elder)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${elder.firstName} ${elder.lastName}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Image loaded successfully:', photoUrl)}
                    onError={(e) => {
                      console.error('Image failed to load:', photoUrl);
                      console.error('Error details:', e);
                      // Hide the broken image and show initials instead
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Fallback initials - always present but hidden if image loads */}
                <span 
                  className={`text-xl font-bold text-gray-600 ${photoUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                  style={{ display: photoUrl ? 'none' : 'flex' }}
                >
                  {elder.firstName?.charAt(0)}{elder.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {elder.firstName} {elder.lastName}
                </h3>
                <p className="text-gray-600">{age} years old • {elder.gender}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{elder.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Born: {new Date(elder.dateOfBirth).toLocaleDateString()}</span>
              </div>
              {elder.chronicConditions && (
                <div className="flex items-center text-sm text-gray-600">
                  <Heart className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{elder.chronicConditions}</span>
                </div>
              )}
            </div>

            {elder.subscription && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className={`status-badge ${
                    elder.subscription.status === 'active' ? 'status-active' : 'status-expired'
                  }`}>
                    {elder.subscription.plan}
                  </span>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default ElderList;