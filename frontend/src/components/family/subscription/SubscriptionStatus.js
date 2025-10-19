// src/components/family/subscription/SubscriptionStatus.js
import React from 'react';
import { Calendar, DollarSign, Package, AlertCircle, Plus } from 'lucide-react';
import { formatCurrency, formatDate, getDaysRemaining } from '../../../utils/helpers';
import { PACKAGE_PLANS } from '../../../utils/constants';

const SubscriptionStatus = ({ subscription, onManage, onAddElder }) => {
  const daysRemaining = getDaysRemaining(subscription.endDate);
  const isExpiringSoon = daysRemaining <= 7 && subscription.status === 'active';

  const getElderPhotoUrl = (photoFilename) => {
    if (!photoFilename) return null;
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const photoUrl = `${baseUrl}/uploads/elders/${photoFilename}`;
    
    console.log('Elder photo URL in subscription:', photoUrl);
    return photoUrl;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4" style={{ borderLeftWidth: '4px', borderLeftColor: '#ef4444' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {PACKAGE_PLANS[subscription.plan]?.name || subscription.plan}
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block mt-1 ${
            subscription.status === 'active' ? 'bg-red-50 text-red-600' :
            subscription.status === 'expired' ? 'bg-gray-100 text-gray-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {subscription.status}
          </span>
        </div>
        <div className="flex space-x-2">
          {!subscription.elder && subscription.status === 'active' && (
            <button
              onClick={() => onAddElder(subscription)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 text-sm rounded-lg hover:from-red-600 hover:to-pink-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Elder</span>
            </button>
          )}
        </div>
      </div>

      {isExpiringSoon && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-800 text-sm font-medium">
            Expires in {daysRemaining} days
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-xs text-gray-600">Plan</p>
            <p className="font-semibold text-sm capitalize text-gray-900">{subscription.plan}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-pink-400" />
          <div>
            <p className="text-xs text-gray-600">Expires</p>
            <p className="font-semibold text-sm text-gray-900">{formatDate(subscription.endDate)}</p>
          </div>
        </div>
      </div>

      {subscription.elder ? (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Assigned Elder:</p>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-red-200">
              {subscription.elder.photo ? (
                <>
                  <img
                    src={getElderPhotoUrl(subscription.elder.photo)}
                    alt={`${subscription.elder.firstName} ${subscription.elder.lastName}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Elder photo loaded in subscription status')}
                    onError={(e) => {
                      console.error('Elder photo failed to load in subscription:', getElderPhotoUrl(subscription.elder.photo));
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span 
                    className="text-red-500 font-semibold hidden items-center justify-center w-full h-full text-xs"
                    style={{ display: 'none' }}
                  >
                    {subscription.elder.firstName?.charAt(0)}{subscription.elder.lastName?.charAt(0)}
                  </span>
                </>
              ) : (
                <span className="text-red-500 font-semibold text-xs">
                  {subscription.elder.firstName?.charAt(0)}{subscription.elder.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <span className="font-medium text-sm text-gray-900">
                {subscription.elder.firstName} {subscription.elder.lastName}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium text-sm">No Elder Assigned</p>
              <p className="text-red-600 text-xs">This subscription is ready for an elder</p>
            </div>
            {subscription.status === 'active' && (
              <button
                onClick={() => onAddElder(subscription)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-lg text-xs hover:from-red-600 hover:to-pink-600 transition-all"
              >
                Add Elder
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;