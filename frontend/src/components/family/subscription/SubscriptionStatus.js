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
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-primary-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {PACKAGE_PLANS[subscription.plan]?.name || subscription.plan}
          </h3>
          <span className={`status-badge ${
            subscription.status === 'active' ? 'status-active' :
            subscription.status === 'expired' ? 'status-expired' :
            'status-canceled'
          }`}>
            {subscription.status}
          </span>
        </div>
        <div className="flex space-x-2">
          {!subscription.elder && subscription.status === 'active' && (
            <button
              onClick={() => onAddElder(subscription)}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Elder</span>
            </button>
          )}
          <button
            onClick={() => onManage(subscription)}
            className="btn-secondary text-sm py-2 px-4"
          >
            Manage
          </button>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 text-sm font-medium">
            Your subscription expires in {daysRemaining} days
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <Package className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Plan</p>
            <p className="font-semibold capitalize">{subscription.plan}</p>
          </div>
        </div>
        
        {/* <div className="flex items-center space-x-3">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-semibold">{formatCurrency(subscription.amount)}</p>
          </div>
        </div>
         */}
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Expires</p>
            <p className="font-semibold">{formatDate(subscription.endDate)}</p>
          </div>
        </div>
      </div>

      {subscription.elder ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Assigned Elder:</p>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {subscription.elder.photo ? (
                <>
                  <img
                    src={getElderPhotoUrl(subscription.elder.photo)}
                    alt={`${subscription.elder.firstName} ${subscription.elder.lastName}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Elder photo loaded in subscription status')}
                    onError={(e) => {
                      console.error('Elder photo failed to load in subscription:', getElderPhotoUrl(subscription.elder.photo));
                      // Hide broken image and show initials
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback initials */}
                  <span 
                    className="text-gray-600 font-semibold hidden items-center justify-center w-full h-full text-sm"
                    style={{ display: 'none' }}
                  >
                    {subscription.elder.firstName?.charAt(0)}{subscription.elder.lastName?.charAt(0)}
                  </span>
                </>
              ) : (
                <span className="text-gray-600 font-semibold text-sm">
                  {subscription.elder.firstName?.charAt(0)}{subscription.elder.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <span className="font-medium">
                {subscription.elder.firstName} {subscription.elder.lastName}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-blue-800 font-medium">No Elder Assigned</p>
              <p className="text-blue-600 text-sm">This subscription is ready for an elder</p>
            </div>
            {subscription.status === 'active' && (
              <button
                onClick={() => onAddElder(subscription)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
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