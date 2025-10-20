// backend/controllers/progressReportController.js
const { ProgressReport, Elder, User } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const PDFDocument = require("pdfkit");

// Create a new progress report
const createProgressReport = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const {
      elderId,
      reportType,
      period,
      overallProgress,
      mentalHealthScore,
      previousScore,
      keyMetrics,
      highlights,
      concerns,
      recommendations,
      nextReview,
    } = req.body;

    // Verify elder is assigned to this specialist
    const { MentalHealthAssignment } = require("../models");
    const assignment = await MentalHealthAssignment.findOne({
      where: {
        elderId,
        specialistId,
        status: "active",
      },
    });

    if (!assignment) {
      return res.status(403).json({
        message: "Elder is not assigned to you",
      });
    }

    const progressReport = await ProgressReport.create({
      elderId,
      specialistId,
      reportType,
      period,
      status: "completed",
      dateCreated: new Date(),
      overallProgress: overallProgress || 0,
      mentalHealthScore,
      previousScore,
      keyMetrics: keyMetrics || {},
      highlights: highlights || [],
      concerns: concerns || [],
      recommendations: recommendations || [],
      nextReview,
    });

    const completeReport = await ProgressReport.findByPk(progressReport.id, {
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(201).json({
      message: "Progress report created successfully",
      progressReport: completeReport,
    });
  } catch (error) {
    console.error("Error creating progress report:", error);
    res.status(500).json({
      message: "Error creating progress report",
      error: error.message,
    });
  }
};

// Get all progress reports for a specialist
const getSpecialistProgressReports = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { status, elderId, reportType } = req.query;

    const whereClause = { specialistId };

    if (status) whereClause.status = status;
    if (elderId) whereClause.elderId = elderId;
    if (reportType) whereClause.reportType = { [Op.like]: `%${reportType}%` };

    const progressReports = await ProgressReport.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
      order: [["dateCreated", "DESC"]],
    });

    res.status(200).json({
      count: progressReports.length,
      progressReports,
    });
  } catch (error) {
    console.error("Error fetching progress reports:", error);
    res.status(500).json({
      message: "Error fetching progress reports",
      error: error.message,
    });
  }
};

// Get single progress report by ID
const getProgressReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const specialistId = req.user.id;

    const progressReport = await ProgressReport.findOne({
      where: { id: reportId, specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "dateOfBirth", "photo"],
        },
        {
          model: User,
          as: "specialist",
          attributes: ["id", "firstName", "lastName", "specialization"],
        },
      ],
    });

    if (!progressReport) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    res.status(200).json({ progressReport });
  } catch (error) {
    console.error("Error fetching progress report:", error);
    res.status(500).json({
      message: "Error fetching progress report",
      error: error.message,
    });
  }
};

// Update progress report
const updateProgressReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const specialistId = req.user.id;
    const updates = req.body;

    const progressReport = await ProgressReport.findOne({
      where: { id: reportId, specialistId },
    });

    if (!progressReport) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    // Update allowed fields
    const allowedFields = [
      "reportType",
      "period",
      "status",
      "overallProgress",
      "mentalHealthScore",
      "previousScore",
      "keyMetrics",
      "highlights",
      "concerns",
      "recommendations",
      "nextReview",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        progressReport[field] = updates[field];
      }
    });

    await progressReport.save();

    res.status(200).json({
      message: "Progress report updated successfully",
      progressReport,
    });
  } catch (error) {
    console.error("Error updating progress report:", error);
    res.status(500).json({
      message: "Error updating progress report",
      error: error.message,
    });
  }
};

// Delete progress report
const deleteProgressReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const specialistId = req.user.id;

    const progressReport = await ProgressReport.findOne({
      where: { id: reportId, specialistId },
    });

    if (!progressReport) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    await progressReport.destroy();

    res.status(200).json({
      message: "Progress report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting progress report:", error);
    res.status(500).json({
      message: "Error deleting progress report",
      error: error.message,
    });
  }
};

// Get progress report statistics
const getProgressReportStatistics = async (req, res) => {
  try {
    const specialistId = req.user.id;

    const totalReports = await ProgressReport.count({
      where: { specialistId },
    });

    const improvingClients = await ProgressReport.count({
      where: {
        specialistId,
        mentalHealthScore: { [Op.gt]: sequelize.col("previousScore") },
      },
    });

    const stableClients = await ProgressReport.count({
      where: {
        specialistId,
        mentalHealthScore: sequelize.col("previousScore"),
      },
    });

    const urgentReports = await ProgressReport.count({
      where: { specialistId, status: "urgent" },
    });

    res.status(200).json({
      statistics: {
        totalReports,
        improvingClients,
        stableClients,
        urgentReports,
      },
    });
  } catch (error) {
    console.error("Error fetching progress report statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// Download progress report as PDF
const downloadProgressReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const specialistId = req.user.id;

    // Fetch the complete report with all associations
    const progressReport = await ProgressReport.findOne({
      where: { id: reportId, specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "dateOfBirth"],
        },
        {
          model: User,
          as: "specialist",
          attributes: ["id", "firstName", "lastName", "specialization"],
        },
      ],
    });

    if (!progressReport) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=progress-report-${reportId}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Helper function to draw a horizontal line
    const drawLine = (y) => {
      doc.moveTo(50, y).lineTo(545, y).stroke("#e5e7eb");
    };

    // Header with gradient-like effect
    doc.rect(0, 0, 612, 120).fillAndStroke("#8b5cf6", "#7c3aed");

    doc
      .fillColor("#ffffff")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("Progress Report", 50, 30);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Report ID: ${progressReport.id}`, 50, 70)
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        50,
        88
      );

    // Move to content area
    let yPos = 150;

    // Client Information Section
    doc
      .fillColor("#374151")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Client Information", 50, yPos);

    yPos += 25;
    drawLine(yPos);
    yPos += 15;

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Client Name:", 50, yPos)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(
        `${progressReport.elder.firstName} ${progressReport.elder.lastName}`,
        180,
        yPos
      );

    yPos += 20;
    doc
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Specialist:", 50, yPos)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(
        `${progressReport.specialist.firstName} ${progressReport.specialist.lastName}`,
        180,
        yPos
      );

    if (progressReport.specialist.specialization) {
      doc
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(` (${progressReport.specialist.specialization})`, {
          continued: true,
        });
    }

    yPos += 20;
    doc
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Report Period:", 50, yPos)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(progressReport.period, 180, yPos);

    yPos += 20;
    doc
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Report Type:", 50, yPos)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(
        progressReport.reportType.charAt(0).toUpperCase() +
          progressReport.reportType.slice(1),
        180,
        yPos
      );

    yPos += 20;
    doc
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Date Created:", 50, yPos)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(
        new Date(progressReport.dateCreated).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        180,
        yPos
      );

    yPos += 30;

    // Progress Metrics Section
    doc
      .fillColor("#374151")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Progress Metrics", 50, yPos);

    yPos += 25;
    drawLine(yPos);
    yPos += 15;

    // Overall Progress
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Overall Progress:", 50, yPos);

    doc
      .fillColor("#8b5cf6")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(`${progressReport.overallProgress}%`, 180, yPos - 5);

    // Progress bar
    const barWidth = 200;
    const barHeight = 10;
    const barX = 280;
    const barY = yPos + 5;

    doc
      .rect(barX, barY, barWidth, barHeight)
      .fillAndStroke("#e5e7eb", "#d1d5db");

    const fillWidth = (progressReport.overallProgress / 100) * barWidth;
    doc
      .rect(barX, barY, fillWidth, barHeight)
      .fillAndStroke("#8b5cf6", "#7c3aed");

    yPos += 30;

    // Mental Health Score
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text("Mental Health Score:", 50, yPos);

    doc
      .fillColor("#3b82f6")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(progressReport.mentalHealthScore, 180, yPos - 5);

    if (progressReport.previousScore) {
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(`(Previous: ${progressReport.previousScore})`, 220, yPos + 5);
    }

    yPos += 35;

    // Key Metrics (if available)
    if (
      progressReport.keyMetrics &&
      Object.keys(progressReport.keyMetrics).length > 0
    ) {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      doc
        .fillColor("#374151")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Key Metrics", 50, yPos);

      yPos += 25;
      drawLine(yPos);
      yPos += 15;

      Object.entries(progressReport.keyMetrics).forEach(([key, value]) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .trim()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text(`${formattedKey}:`, 50, yPos)
          .fillColor("#111827")
          .font("Helvetica-Bold")
          .text(value, 250, yPos);

        yPos += 20;
      });

      yPos += 10;
    }

    // Highlights Section
    if (progressReport.highlights && progressReport.highlights.length > 0) {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      doc
        .fillColor("#374151")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Key Highlights", 50, yPos);

      yPos += 25;
      drawLine(yPos);
      yPos += 15;

      progressReport.highlights.forEach((highlight, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#10b981")
          .text("✓", 50, yPos)
          .fillColor("#374151")
          .text(highlight, 70, yPos, { width: 475, align: "left" });

        yPos += doc.heightOfString(highlight, { width: 475 }) + 10;
      });

      yPos += 10;
    }

    // Concerns Section
    if (progressReport.concerns && progressReport.concerns.length > 0) {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      doc
        .fillColor("#374151")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Areas of Concern", 50, yPos);

      yPos += 25;
      drawLine(yPos);
      yPos += 15;

      progressReport.concerns.forEach((concern, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#f59e0b")
          .text("⚠", 50, yPos)
          .fillColor("#374151")
          .text(concern, 70, yPos, { width: 475, align: "left" });

        yPos += doc.heightOfString(concern, { width: 475 }) + 10;
      });

      yPos += 10;
    }

    // Recommendations Section
    if (
      progressReport.recommendations &&
      progressReport.recommendations.length > 0
    ) {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      doc
        .fillColor("#374151")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Recommendations", 50, yPos);

      yPos += 25;
      drawLine(yPos);
      yPos += 15;

      progressReport.recommendations.forEach((recommendation, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#3b82f6")
          .text("→", 50, yPos)
          .fillColor("#374151")
          .text(recommendation, 70, yPos, { width: 475, align: "left" });

        yPos += doc.heightOfString(recommendation, { width: 475 }) + 10;
      });

      yPos += 10;
    }

    // Next Review Section
    if (progressReport.nextReview) {
      if (yPos > 720) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 10;
      doc
        .fillColor("#374151")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Next Review", 50, yPos);

      yPos += 25;
      drawLine(yPos);
      yPos += 15;

      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text("Scheduled for:", 50, yPos)
        .fillColor("#8b5cf6")
        .font("Helvetica-Bold")
        .text(
          new Date(progressReport.nextReview).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          180,
          yPos
        );
    }

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(9)
        .fillColor("#9ca3af")
        .text(
          `ElderLink Mental Health Services | Page ${i + 1} of ${pageCount}`,
          50,
          750,
          { align: "center" }
        );
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

module.exports = {
  createProgressReport,
  getSpecialistProgressReports,
  getProgressReportById,
  updateProgressReport,
  deleteProgressReport,
  getProgressReportStatistics,
  downloadProgressReportPDF,
};
