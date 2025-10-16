// backend/controllers/resourceController.js
const { MentalHealthResource, User } = require("../models");
const { Op } = require("sequelize");

// Create a new resource
const createResource = async (req, res) => {
  try {
    const uploadedBy = req.user.id;
    const {
      title,
      category,
      description,
      resourceType,
      fileUrl,
      fileSize,
      tags,
      targetAudience,
      difficulty,
      estimatedTime,
      author,
      featured,
    } = req.body;

    const resource = await MentalHealthResource.create({
      title,
      category,
      description,
      resourceType,
      fileUrl,
      fileSize,
      downloadCount: 0,
      tags: tags || [],
      targetAudience,
      difficulty: difficulty || "Beginner",
      estimatedTime,
      author,
      rating: 0.0,
      featured: featured || false,
      uploadedBy,
    });

    res.status(201).json({
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({
      message: "Error creating resource",
      error: error.message,
    });
  }
};

// Get all resources
const getAllResources = async (req, res) => {
  try {
    const { category, difficulty, featured, search } = req.query;

    const whereClause = {};

    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;
    if (featured) whereClause.featured = featured === "true";

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    const resources = await MentalHealthResource.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [
        ["featured", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({
      message: "Error fetching resources",
      error: error.message,
    });
  }
};

// Get single resource by ID
const getResourceById = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await MentalHealthResource.findByPk(resourceId, {
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["id", "firstName", "lastName", "specialization"],
        },
      ],
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({ resource });
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({
      message: "Error fetching resource",
      error: error.message,
    });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const resource = await MentalHealthResource.findByPk(resourceId);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Only the uploader can update
    if (resource.uploadedBy !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this resource",
      });
    }

    const allowedFields = [
      "title",
      "category",
      "description",
      "resourceType",
      "fileUrl",
      "fileSize",
      "tags",
      "targetAudience",
      "difficulty",
      "estimatedTime",
      "author",
      "featured",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        resource[field] = updates[field];
      }
    });

    await resource.save();

    res.status(200).json({
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({
      message: "Error updating resource",
      error: error.message,
    });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;

    const resource = await MentalHealthResource.findByPk(resourceId);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Only the uploader can delete
    if (resource.uploadedBy !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this resource",
      });
    }

    await resource.destroy();

    res.status(200).json({
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({
      message: "Error deleting resource",
      error: error.message,
    });
  }
};

// Increment download count
const incrementDownloadCount = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await MentalHealthResource.findByPk(resourceId);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    resource.downloadCount += 1;
    await resource.save();

    res.status(200).json({
      message: "Download count updated",
      downloadCount: resource.downloadCount,
    });
  } catch (error) {
    console.error("Error updating download count:", error);
    res.status(500).json({
      message: "Error updating download count",
      error: error.message,
    });
  }
};

// Rate resource
const rateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const resource = await MentalHealthResource.findByPk(resourceId);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Simple rating update (in production, you'd want to track individual ratings)
    resource.rating = rating;
    await resource.save();

    res.status(200).json({
      message: "Resource rated successfully",
      rating: resource.rating,
    });
  } catch (error) {
    console.error("Error rating resource:", error);
    res.status(500).json({
      message: "Error rating resource",
      error: error.message,
    });
  }
};

// Get resource statistics
const getResourceStatistics = async (req, res) => {
  try {
    const totalResources = await MentalHealthResource.count();

    const featuredResources = await MentalHealthResource.count({
      where: { featured: true },
    });

    const totalDownloads = await MentalHealthResource.sum("downloadCount");

    const resourcesByCategory = await MentalHealthResource.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["category"],
    });

    res.status(200).json({
      statistics: {
        totalResources,
        featuredResources,
        totalDownloads: totalDownloads || 0,
        resourcesByCategory,
      },
    });
  } catch (error) {
    console.error("Error fetching resource statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  incrementDownloadCount,
  rateResource,
  getResourceStatistics,
};
