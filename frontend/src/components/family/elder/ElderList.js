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
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Elders Added</h3>
        <p className="text-gray-600">Add an elder profile to get started</p>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {elders.map((elder) => {
        const photoUrl = getPhotoUrl(elder.photo);
        const age = calculateAge(elder.dateOfBirth);
        
        return (
          <div
            key={elder.id}
            className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-5 group hover:bg-white"
            onClick={() => onSelectElder(elder)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center overflow-hidden border-2 border-red-200 flex-shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${elder.firstName} ${elder.lastName}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Image loaded successfully:', photoUrl)}
                    onError={(e) => {
                      console.error('Image failed to load:', photoUrl);
                      console.error('Error details:', e);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className={`text-xl font-bold text-red-500 ${photoUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                  style={{ display: photoUrl ? 'none' : 'flex' }}
                >
                  {elder.firstName?.charAt(0)}{elder.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                  {elder.firstName} {elder.lastName}
                </h3>
                <p className="text-sm text-gray-600">{age} years old • {elder.gender}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-red-400" />
                <span className="line-clamp-1">{elder.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-pink-400" />
                <span>Born: {new Date(elder.dateOfBirth).toLocaleDateString()}</span>
              </div>
              {elder.chronicConditions && (
                <div className="flex items-start text-sm text-gray-600">
                  <Heart className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="line-clamp-1">{elder.chronicConditions}</span>
                </div>
              )}
            </div>

            {elder.subscription && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Plan:</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    elder.subscription.status === 'active' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-100 text-gray-600'
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