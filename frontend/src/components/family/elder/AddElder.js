// Fixed AddElder component - prevents auto-submit on step 4
// src/components/family/elder/AddElder.js (FIXED)
import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Heart, 
  FileText, 
  Pill, 
  AlertTriangle,
  CreditCard,
  Shield,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { elderService } from '../../../services/elder';
import toast from 'react-hot-toast';

const AddElder = ({ subscription, availableSubscriptions = [], onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(
    subscription?.id || (availableSubscriptions.length === 1 ? availableSubscriptions[0].id : '')
  );
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    emergencyContact: '',
    bloodType: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    chronicConditions: '',
    doctorName: '',
    doctorPhone: '',
    insuranceProvider: '',
    insuranceNumber: '',
    photo: null,
    // NEW: Authentication fields
    enableLogin: false,
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // DEBUG: Log initial state
  console.log('AddElder component initialized with:');
  console.log('subscription:', subscription);
  console.log('availableSubscriptions:', availableSubscriptions);
  console.log('selectedSubscriptionId:', selectedSubscriptionId);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !selectedSubscriptionId) {
      toast.error('Please select a subscription plan');
      return;
    }
    
    if (currentStep === 2) {
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    if (currentStep === 3) {
      const requiredFields = ['address', 'phone', 'emergencyContact'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    if (currentStep === 4 && formData.enableLogin) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all authentication fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 5)); // Updated to 5 steps
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // FIXED: Only handle form submission when explicitly called
  const handleFormSubmit = async () => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('selectedSubscriptionId:', selectedSubscriptionId);
    console.log('formData:', formData);
    
    if (!selectedSubscriptionId) {
      toast.error('Please select a subscription plan');
      return;
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'address', 'phone', 'emergencyContact'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate authentication fields if login is enabled
    if (formData.enableLogin) {
      if (!formData.email || !formData.password) {
        toast.error('Email and password are required for login access');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const elderDataToSend = {
        subscriptionId: selectedSubscriptionId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        bloodType: formData.bloodType || '',
        medicalHistory: formData.medicalHistory || '',
        currentMedications: formData.currentMedications || '',
        allergies: formData.allergies || '',
        chronicConditions: formData.chronicConditions || '',
        doctorName: formData.doctorName || '',
        doctorPhone: formData.doctorPhone || '',
        insuranceProvider: formData.insuranceProvider || '',
        insuranceNumber: formData.insuranceNumber || '',
        photo: formData.photo,
        // NEW: Include authentication data
        enableLogin: formData.enableLogin,
        email: formData.enableLogin ? formData.email : null,
        password: formData.enableLogin ? formData.password : null
      };

      console.log('🚀 Data being sent to elderService:', elderDataToSend);
      console.log('🔍 SubscriptionId specifically:', elderDataToSend.subscriptionId);
      
      const response = await elderService.addElderWithAuth(elderDataToSend);
      
      toast.success('Elder added successfully!');
      if (formData.enableLogin) {
        toast.success('Login credentials created for the elder');
      }
      onSuccess(response.elder);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const message = error.response?.data?.message || 'Failed to add elder';
      toast.error(message);
      
      // Show detailed error for debugging
      if (error.response?.data) {
        console.error('📋 Detailed error:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Prevent default form submission
  const handleFormEvent = (e) => {
    e.preventDefault();
    // Do nothing - we handle submission manually via button click
  };

  const steps = [
    { title: 'Select Plan', icon: CreditCard },
    { title: 'Personal Info', icon: User },
    { title: 'Contact & Address', icon: MapPin },
    { title: 'Medical Info', icon: Heart },
    { title: 'Login Access', icon: Shield } // NEW: Authentication step
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Select Subscription Plan</h3>
              <p className="text-gray-600">Choose which plan to assign this elder to</p>
            </div>

            {availableSubscriptions.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                  No Available Subscriptions
                </h4>
                <p className="text-yellow-700 mb-4">
                  You need an active subscription to add an elder. All your current subscriptions already have elders assigned.
                </p>
                <button
                  onClick={onCancel}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {availableSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSubscriptionId === sub.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSubscriptionId(sub.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="radio"
                        name="subscription"
                        value={sub.id}
                        checked={selectedSubscriptionId === sub.id}
                        onChange={(e) => setSelectedSubscriptionId(e.target.value)}
                        className="text-primary-500"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg capitalize">{sub.plan} Plan</h4>
                        <p className="text-gray-600">
                          ${sub.amount} - Active until {new Date(sub.endDate).toLocaleDateString()}
                        </p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Personal Information</h3>
              <p className="text-gray-600">Basic details about your loved one</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Contact & Address</h3>
              <p className="text-gray-600">Where can we reach them?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                placeholder="Street address, city, state, postal code"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact *
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Medical Information</h3>
              <p className="text-gray-600">Help us provide better care (all optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Doctor
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Doctor's name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                placeholder="Previous surgeries, major illnesses, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                placeholder="List all current medications and dosages"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="2"
                  placeholder="Food, drug, or environmental allergies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chronic Conditions
                </label>
                <textarea
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="2"
                  placeholder="Diabetes, hypertension, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Insurance company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Number
                </label>
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Insurance policy number"
                />
              </div>
            </div>
          </div>
        );

      case 5: // NEW: Authentication step
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Login Access</h3>
              <p className="text-gray-600">Enable your elder to access their own dashboard (optional)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-blue-500 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Login Access Benefits</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Elder can view their own health information</li>
                    <li>• Access to personal medication reminders</li>
                    <li>• Direct communication with care team</li>
                    <li>• View upcoming appointments and schedules</li>
                    <li>• Emergency contact information always available</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="enableLogin"
                  name="enableLogin"
                  checked={formData.enableLogin}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enableLogin" className="ml-3 text-lg font-medium text-gray-700">
                  Enable login access for {formData.firstName || 'this elder'}
                </label>
              </div>

              {formData.enableLogin && (
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <Key className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-800 font-medium">Creating Login Credentials</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      The elder will be able to log in with these credentials to access their personal dashboard.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="elder@example.com"
                      required={formData.enableLogin}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used as the username for login
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                        placeholder="Create a secure password"
                        required={formData.enableLogin}
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="Confirm the password"
                        required={formData.enableLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-amber-800 text-sm font-medium">Security Note</p>
                        <p className="text-amber-700 text-xs mt-1">
                          Please share these credentials securely with the elder. You can always disable access later from your family dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!formData.enableLogin && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">
                    No login access will be created. You can enable this later from your family dashboard if needed.
                  </p>
                </div>
              )}
            </div>

            {/* Final Summary */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary-800 mb-2">Final Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-primary-700"><strong>Elder:</strong> {formData.firstName} {formData.lastName}</p>
                  <p className="text-primary-700"><strong>Plan:</strong> {availableSubscriptions.find(s => s.id === selectedSubscriptionId)?.plan}</p>
                </div>
                <div>
                  <p className="text-primary-700">
                    <strong>Login Access:</strong> {formData.enableLogin ? 'Enabled' : 'Disabled'}
                  </p>
                  {formData.enableLogin && (
                    <p className="text-primary-700"><strong>Email:</strong> {formData.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary-500 mb-4">Add Elder Profile</h2>
        <p className="text-gray-600">Complete the information to create an elder profile</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 md:space-x-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;

            return (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${
                  isActive 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : isCompleted 
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <StepIcon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-1 md:mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center mt-4">
          <span className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleFormEvent}>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{loading ? 'Adding Elder...' : 'Add Elder'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddElder;