import React, { useState, useEffect } from "react";
import {
  Heart,
  Book,
  Video,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  BookOpen,
  Play,
  FileText,
  Link,
  Globe,
  Phone,
  Upload,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout"; // Add this import for sidebar layout

const MentalHealthResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  // Mock data
  const mockResources = [
    {
      id: 1,
      title: "Cognitive Behavioral Therapy Workbook",
      category: "workbook",
      description:
        "Comprehensive workbook for CBT techniques and exercises for anxiety and depression management.",
      type: "PDF Document",
      size: "2.5 MB",
      downloadCount: 245,
      lastUpdated: "2025-01-08",
      tags: ["CBT", "Anxiety", "Depression", "Self-help"],
      targetAudience: "Clients with anxiety and depression",
      difficulty: "Beginner",
      estimatedTime: "2-3 weeks",
      author: "Dr. Sarah Mitchell",
      rating: 4.8,
      featured: true,
    },
    {
      id: 2,
      title: "Mindfulness Meditation for Seniors",
      category: "video",
      description:
        "Guided meditation sessions specifically designed for elderly clients to reduce stress and improve mental wellbeing.",
      type: "Video Series",
      duration: "45 minutes",
      downloadCount: 189,
      lastUpdated: "2025-01-05",
      tags: ["Mindfulness", "Meditation", "Stress Relief", "Seniors"],
      targetAudience: "Elderly clients",
      difficulty: "Beginner",
      estimatedTime: "Daily practice",
      author: "Mindfulness Institute",
      rating: 4.9,
      featured: true,
    },
    {
      id: 3,
      title: "Crisis Intervention Guidelines",
      category: "guideline",
      description:
        "Professional guidelines for handling mental health crises and emergency interventions.",
      type: "Professional Guide",
      size: "1.8 MB",
      downloadCount: 156,
      lastUpdated: "2025-01-10",
      tags: ["Crisis", "Emergency", "Professional", "Safety"],
      targetAudience: "Mental health professionals",
      difficulty: "Advanced",
      estimatedTime: "2 hours",
      author: "Mental Health Association",
      rating: 4.7,
      featured: false,
    },
    {
      id: 4,
      title: "Social Isolation Recovery Program",
      category: "program",
      description:
        "Structured program to help elderly clients overcome social isolation and build meaningful connections.",
      type: "Program Guide",
      size: "3.2 MB",
      downloadCount: 98,
      lastUpdated: "2025-01-03",
      tags: ["Social Isolation", "Community", "Elderly", "Support"],
      targetAudience: "Isolated elderly clients",
      difficulty: "Intermediate",
      estimatedTime: "8-12 weeks",
      author: "Elder Care Network",
      rating: 4.6,
      featured: false,
    },
    {
      id: 5,
      title: "Family Support Toolkit",
      category: "toolkit",
      description:
        "Resources and tools for family members to better support their elderly relatives with mental health challenges.",
      type: "Toolkit",
      size: "4.1 MB",
      downloadCount: 213,
      lastUpdated: "2024-12-28",
      tags: ["Family", "Support", "Education", "Caregiving"],
      targetAudience: "Family members and caregivers",
      difficulty: "Beginner",
      estimatedTime: "1-2 weeks",
      author: "Family Care Institute",
      rating: 4.5,
      featured: true,
    },
    {
      id: 6,
      title: "PTSD Treatment Resources",
      category: "clinical",
      description:
        "Evidence-based treatment resources and protocols for PTSD in elderly populations.",
      type: "Clinical Guide",
      size: "2.9 MB",
      downloadCount: 134,
      lastUpdated: "2025-01-07",
      tags: ["PTSD", "Trauma", "Treatment", "Evidence-based"],
      targetAudience: "Mental health professionals",
      difficulty: "Advanced",
      estimatedTime: "4-6 hours",
      author: "PTSD Research Center",
      rating: 4.8,
      featured: false,
    },
  ];

  const categories = [
    { value: "all", label: "All Resources", icon: Heart },
    { value: "workbook", label: "Workbooks", icon: Book },
    { value: "video", label: "Videos", icon: Video },
    { value: "guideline", label: "Guidelines", icon: FileText },
    { value: "program", label: "Programs", icon: BookOpen },
    { value: "toolkit", label: "Toolkits", icon: Download },
    { value: "clinical", label: "Clinical Resources", icon: Heart },
  ];

  const emergencyContacts = [
    {
      name: "National Suicide Prevention Lifeline",
      phone: "988",
      description: "24/7 crisis support",
      type: "Crisis Hotline",
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "Text-based crisis support",
      type: "Text Support",
    },
    {
      name: "Elder Abuse Hotline",
      phone: "1-800-677-1116",
      description: "Elder abuse reporting and support",
      type: "Elder Support",
    },
    {
      name: "SAMHSA National Helpline",
      phone: "1-800-662-4357",
      description: "Mental health and substance abuse",
      type: "General Support",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setResources(mockResources);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter((resource) => resource.featured);

  const getCategoryIcon = (category) => {
    const categoryObj = categories.find((cat) => cat.value === category);
    return categoryObj ? categoryObj.icon : FileText;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <RoleLayout active="resources">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Heart className="w-8 h-8 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading resources...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout active="resources">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mental Health Resources
              </h1>
              <p className="text-gray-600">
                Access educational materials, tools, and support resources
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddResourceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Emergency Contacts
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-red-200"
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {contact.name}
                </h3>
                <p className="text-red-600 font-bold mb-1">{contact.phone}</p>
                <p className="text-sm text-gray-600 mb-1">
                  {contact.description}
                </p>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {contact.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Resources
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Downloads
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-gray-900">
                  {featuredResources.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length - 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources by title, description, or tags..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource) => {
                const IconComponent = getCategoryIcon(resource.category);
                return (
                  <div
                    key={resource.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600">{resource.type}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        ⭐ {resource.rating}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                          resource.difficulty
                        )}`}
                      >
                        {resource.difficulty}
                      </span>
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Resources
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredResources.map((resource) => {
              const IconComponent = getCategoryIcon(resource.category);
              return (
                <div
                  key={resource.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {resource.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span>{resource.type}</span>
                            <span>{resource.size || resource.duration}</span>
                            <span>{resource.downloadCount} downloads</span>
                            <div className="flex items-center gap-1 text-yellow-600">
                              ⭐ {resource.rating}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Link className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-4 mb-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                            resource.difficulty
                          )}`}
                        >
                          {resource.difficulty}
                        </span>
                        <span className="text-sm text-gray-600">
                          Target: {resource.targetAudience}
                        </span>
                        <span className="text-sm text-gray-600">
                          Duration: {resource.estimatedTime}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {resource.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {resource.author}</span>
                        <span>Updated: {resource.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Resource Modal */}
        {showAddResourceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Resource
                </h2>
                <button
                  onClick={() => setShowAddResourceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter resource title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      {categories.slice(1).map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the resource and its purpose..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="guide">Guide</option>
                      <option value="toolkit">Toolkit</option>
                      <option value="workbook">Workbook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 2 weeks, 30 minutes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Elderly clients, Professionals"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Resource author or organization"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., CBT, Anxiety, Depression, Self-help"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop your file here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, MP4, MP3 files up to 10MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    Mark as featured resource
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowAddResourceModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Add Resource
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default MentalHealthResources;
