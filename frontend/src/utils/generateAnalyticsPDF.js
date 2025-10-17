// frontend/src/utils/generateAnalyticsPDF.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate comprehensive analytics PDF report
 * @param {Object} data - Analytics data from all tabs
 * @param {Object} data.overview - Overview statistics
 * @param {Object} data.userStats - User statistics
 * @param {Object} data.subscriptionStats - Subscription statistics
 * @param {Object} data.revenueStats - Revenue statistics
 */
const generateAnalyticsPDF = (data) => {
  const { overview, userStats, subscriptionStats, revenueStats } = data;

  // Create new PDF document with autoTable plugin
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace = 40) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to add section title
  const addSectionTitle = (title) => {
    checkPageBreak(15);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 58, 138); // Blue color
    doc.text(title, 14, yPosition);
    yPosition += 10;
  };

  // Helper function to add subsection title
  const addSubsectionTitle = (title) => {
    checkPageBreak(10);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(55, 65, 81); // Gray color
    doc.text(title, 14, yPosition);
    yPosition += 8;
  };

  // === HEADER ===
  doc.setFillColor(37, 99, 235); // Blue background
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("ElderLink System Analytics Report", pageWidth / 2, 15, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 25, {
    align: "center",
  });

  yPosition = 45;

  // === EXECUTIVE SUMMARY ===
  if (overview) {
    addSectionTitle("Executive Summary");

    const summaryData = [
      ["Total Users", (overview.overview?.totalUsers || 0).toLocaleString()],
      ["Active Users", (overview.overview?.activeUsers || 0).toLocaleString()],
      [
        "Inactive Users",
        (overview.overview?.inactiveUsers || 0).toLocaleString(),
      ],
      ["Total Elders", (overview.overview?.totalElders || 0).toLocaleString()],
      [
        "Active Subscriptions",
        (overview.overview?.activeSubscriptions || 0).toLocaleString(),
      ],
      [
        "Total Revenue",
        `$${(overview.overview?.totalRevenue || 0).toLocaleString()}`,
      ],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Recent Activity
    if (overview.recentActivity) {
      addSubsectionTitle("Recent Activity (Last 7 Days)");

      const recentActivityData = [
        ["New Users", overview.recentActivity.newUsers?.toString() || "0"],
        [
          "New Subscriptions",
          overview.recentActivity.newSubscriptions?.toString() || "0",
        ],
        [
          "Expiring Soon",
          overview.recentActivity.expiringSoon?.toString() || "0",
        ],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [["Activity", "Count"]],
        body: recentActivityData,
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }
  }

  // === USER STATISTICS ===
  if (userStats) {
    checkPageBreak(60);
    addSectionTitle("User Statistics");

    // User Overview
    const userOverviewData = [
      ["Total Users", (userStats.overview?.totalUsers || 0).toLocaleString()],
      ["Active Users", (userStats.overview?.activeUsers || 0).toLocaleString()],
      [
        "Inactive Users",
        (userStats.overview?.inactiveUsers || 0).toLocaleString(),
      ],
      [
        "Recent Registrations (30 days)",
        (userStats.overview?.recentRegistrations || 0).toLocaleString(),
      ],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Category", "Count"]],
      body: userOverviewData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 12;

    // Active Users by Role
    if (userStats.byRole?.active && userStats.byRole.active.length > 0) {
      addSubsectionTitle("Active Users by Role");

      const roleData = userStats.byRole.active.map((role) => [
        role.role.charAt(0).toUpperCase() +
          role.role.slice(1).replace("_", " "),
        role.count?.toString() || "0",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Role", "Count"]],
        body: roleData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 12;
    }

    // User Details Table
    if (userStats.users?.data && userStats.users.data.length > 0) {
      checkPageBreak(60);
      addSubsectionTitle("Recent User Registrations");

      const userData = userStats.users.data
        .slice(0, 10)
        .map((user) => [
          `${user.firstName} ${user.lastName}`,
          user.email,
          user.role,
          user.isActive ? "Active" : "Inactive",
          new Date(user.createdAt).toLocaleDateString(),
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Name", "Email", "Role", "Status", "Joined"]],
        body: userData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }
  }

  // === SUBSCRIPTION STATISTICS ===
  if (subscriptionStats) {
    checkPageBreak(60);
    doc.addPage();
    yPosition = 20;

    addSectionTitle("Subscription Statistics");

    // Subscription Overview
    const subOverviewData = [
      [
        "Total Subscriptions",
        (subscriptionStats.overview?.totalSubscriptions || 0).toLocaleString(),
      ],
      [
        "Active",
        (subscriptionStats.overview?.activeSubscriptions || 0).toLocaleString(),
      ],
      [
        "Canceled",
        (
          subscriptionStats.overview?.canceledSubscriptions || 0
        ).toLocaleString(),
      ],
      [
        "Expired",
        (
          subscriptionStats.overview?.expiredSubscriptions || 0
        ).toLocaleString(),
      ],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Status", "Count"]],
      body: subOverviewData,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246], textColor: 255 },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 12;

    // Subscriptions by Plan
    if (subscriptionStats.byPlan && subscriptionStats.byPlan.length > 0) {
      addSubsectionTitle("Active Subscriptions by Plan");

      const planData = subscriptionStats.byPlan.map((plan) => [
        plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1),
        plan.count?.toString() || "0",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Plan", "Count"]],
        body: planData,
        theme: "striped",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 12;
    }

    // Subscriptions by Duration
    if (
      subscriptionStats.byDuration &&
      subscriptionStats.byDuration.length > 0
    ) {
      addSubsectionTitle("Subscriptions by Duration");

      const durationData = subscriptionStats.byDuration.map((dur) => [
        dur.duration.replace("_", " "),
        dur.count?.toString() || "0",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Duration", "Count"]],
        body: durationData,
        theme: "striped",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 12;
    }

    // Recent Subscriptions
    if (
      subscriptionStats.subscriptions?.data &&
      subscriptionStats.subscriptions.data.length > 0
    ) {
      checkPageBreak(60);
      addSubsectionTitle("Recent Subscriptions");

      const subscriptionData = subscriptionStats.subscriptions.data
        .slice(0, 10)
        .map((sub) => [
          sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "N/A",
          sub.plan,
          sub.status,
          `$${parseFloat(sub.amount).toFixed(2)}`,
          new Date(sub.endDate).toLocaleDateString(),
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["User", "Plan", "Status", "Amount", "End Date"]],
        body: subscriptionData,
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }
  }

  // === REVENUE STATISTICS ===
  if (revenueStats) {
    checkPageBreak(60);
    doc.addPage();
    yPosition = 20;

    addSectionTitle("Revenue Statistics");

    // Revenue Overview
    const revenueOverviewData = [
      [
        "Total Revenue (All Time)",
        `$${revenueStats.overview?.totalRevenue || "0.00"}`,
      ],
      ["Active Revenue", `$${revenueStats.overview?.activeRevenue || "0.00"}`],
      [
        "Average per Subscription",
        `$${revenueStats.overview?.averagePerSubscription || "0.00"}`,
      ],
      [
        "Projected Annual Revenue",
        `$${revenueStats.overview?.projectedAnnualRevenue || "0.00"}`,
      ],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Amount"]],
      body: revenueOverviewData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 12;

    // Revenue by Plan
    if (revenueStats.byPlan && revenueStats.byPlan.length > 0) {
      addSubsectionTitle("Revenue Breakdown by Plan");

      const revenuePlanData = revenueStats.byPlan.map((plan) => [
        plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1),
        plan.subscriptions?.toString() || "0",
        `$${plan.revenue || "0.00"}`,
        `$${(parseFloat(plan.revenue || 0) / (plan.subscriptions || 1)).toFixed(
          2
        )}`,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Plan", "Subscriptions", "Total Revenue", "Avg per Sub"]],
        body: revenuePlanData,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }
  }

  // === FOOTER ===
  const totalPages = doc.internal.pages.length - 1; // Subtract the first empty page
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
    doc.text("© 2025 ElderLink - Confidential", 14, pageHeight - 10);
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `ElderLink_Analytics_Report_${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);

  return filename;
};

export default generateAnalyticsPDF;
