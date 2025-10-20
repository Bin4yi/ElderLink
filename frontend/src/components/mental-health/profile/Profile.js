// frontend/src/components/mental-health/profile/profile.js
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Clock,
  FileText,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Award,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout";
import mentalHealthService from "../../../services/mentalHealthService";
import toast from "react-hot-toast";

const MentalHealthProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    activeClients: 0,
    sessionsThisMonth: 0,
    reportsGenerated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load profile
      const profileResponse = await mentalHealthService.getSpecialistProfile();
      console.log("Profile loaded:", profileResponse.profile);
      console.log("Profile image:", profileResponse.profile?.profileImage);
      setProfile(profileResponse.profile);
      setForm(profileResponse.profile);

      // Load statistics
      const statsResponse = await mentalHealthService.getProfileStatistics();
      setStats(statsResponse.statistics);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setForm(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(profile);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await mentalHealthService.updateSpecialistProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        specialization: form.specialization,
        experience: form.experience,
        licenseNumber: form.licenseNumber,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      loadProfileData(); // Reload to get updated data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result;
          await mentalHealthService.updateProfileImage(base64String);
          toast.success("Profile image updated!");
          loadProfileData();
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error(
            error.response?.data?.message || "Failed to upload image"
          );
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await mentalHealthService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) {
    return (
      <RoleLayout active="profile">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <User className="w-8 h-8 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  if (!profile) {
    return (
      <RoleLayout active="profile">
        <div className="text-center py-16">
          <User className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-500">Unable to load profile information</p>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout active="profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600">
                Manage your professional profile and contact information
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Change Password
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {(profile.profileImage || profile.photo) ? (
                    <img
                      src={profile.profileImage || profile.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Error loading profile image");
                        // Hide image and show default icon
                        const parent = e.target.parentElement;
                        e.target.style.display = 'none';
                        const icon = document.createElement('div');
                        icon.innerHTML = '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                        parent.appendChild(icon.firstChild);
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-purple-100 mb-1">{profile.specialization}</p>
                <p className="text-purple-200 text-sm">
                  License: {profile.licenseNumber}
                </p>
                {profile.experience && (
                  <p className="text-purple-200 text-sm mt-1">
                    {profile.experience} years experience
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={form.specialization || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={form.experience || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={form.licenseNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Email
                        </p>
                        <p className="text-gray-900">{profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Phone
                        </p>
                        <p className="text-gray-900">
                          {profile.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Specialization
                        </p>
                        <p className="text-gray-900">
                          {profile.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Experience
                        </p>
                        <p className="text-gray-900">
                          {profile.experience}{" "}
                          {profile.experience === 1 ? "year" : "years"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          License Number
                        </p>
                        <p className="text-gray-900">{profile.licenseNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Member Since
                        </p>
                        <p className="text-gray-900">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Clients
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeClients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Sessions This Month
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.sessionsThisMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Reports Generated
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.reportsGenerated}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Change Password
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    minLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default MentalHealthProfile;
