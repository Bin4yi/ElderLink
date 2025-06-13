// frontend/src/components/subscription/PackageSelection.js
import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { PACKAGE_PLANS, DURATION_OPTIONS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import PaymentForm from './PaymentForm';

const PackageSelection = ({ onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [selectedDuration, setSelectedDuration] = useState('6_months');
  const [showPayment, setShowPayment] = useState(false);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  const handleProceedToPayment = () => {
    setShowPayment(true);
  };

  const getCurrentPrice = () => {
    return PACKAGE_PLANS[selectedPlan].prices[selectedDuration];
  };

  const getMonthlyPrice = () => {
    const totalPrice = getCurrentPrice();
    const months = selectedDuration === '1_month' ? 1 : selectedDuration === '6_months' ? 6 : 12;
    return totalPrice / months;
  };

  const getSavings = () => {
    const monthlyPrice = PACKAGE_PLANS[selectedPlan].prices['1_month'];
    const months = selectedDuration === '1_month' ? 1 : selectedDuration === '6_months' ? 6 : 12;
    const regularTotal = monthlyPrice * months;
    const currentTotal = getCurrentPrice();
    return regularTotal - currentTotal;
  };

  if (showPayment) {
    return (
      <PaymentForm
        plan={selectedPlan}
        duration={selectedDuration}
        amount={getCurrentPrice()}
        onSuccess={onSubscribe}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold gradient-text mb-4">Choose Your Care Package</h2>
        <p className="text-xl text-gray-600">Select the perfect plan for your loved one's needs</p>
      </div>

      {/* Duration Selection */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-center mb-6">Select Duration</h3>
        <div className="flex justify-center space-x-4">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDurationSelect(option.value)}
              className={`px-6 py-3 rounded-lg border-2 transition-all ${
                selectedDuration === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">{option.label}</div>
                {option.discount > 0 && (
                  <div className="text-sm text-green-600">Save {option.discount}%</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {Object.entries(PACKAGE_PLANS).map(([planKey, plan]) => (
          <div
            key={planKey}
            className={`package-card ${planKey === 'premium' ? 'popular' : ''} ${
              selectedPlan === planKey ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => handlePlanSelect(planKey)}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold gradient-text mb-2">
                {formatCurrency(getMonthlyPrice())}
              </div>
              <p className="text-gray-500">per month</p>
              {selectedDuration !== '1_month' && (
                <p className="text-sm text-green-600 font-semibold mt-2">
                  Save {formatCurrency(getSavings())} total
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanSelect(planKey)}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                selectedPlan === planKey
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              {selectedPlan === planKey ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Summary and Proceed */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-center">Order Summary</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Plan:</span>
            <span className="font-semibold">{PACKAGE_PLANS[selectedPlan].name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold">
              {DURATION_OPTIONS.find(d => d.value === selectedDuration)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Cost:</span>
            <span className="font-semibold">{formatCurrency(getMonthlyPrice())}</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total Amount:</span>
              <span className="gradient-text">{formatCurrency(getCurrentPrice())}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleProceedToPayment}
          className="w-full btn-primary text-lg py-4"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default PackageSelection;