'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Buildings,
  MapPin,
  ShoppingCart,
  Receipt,
  CreditCard,
  Wallet,
  CalendarBlank,
  CaretDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Clock,
  DotsThreeVertical,
} from '@phosphor-icons/react';
import { useSession } from '../providers';

export function Dashboard() {
  const { user } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<number | null>(null);

  // 1. Top 6 KPI Stat Cards Data from Screenshot
  const kpiCards = [
    {
      id: 'projects',
      title: 'Total Projects',
      value: '12',
      trend: '2 this month',
      trendUp: true,
      icon: Buildings,
      iconBg: '#6366f1',
      cardHref: '/organisation/projects',
    },
    {
      id: 'sites',
      title: 'Active Sites',
      value: '18',
      trend: '3 this month',
      trendUp: true,
      icon: MapPin,
      iconBg: '#0ea5e9',
      cardHref: '/inventory/stock',
    },
    {
      id: 'purchase',
      title: 'Total Purchase',
      value: '₹ 48,75,000',
      trend: '12% from last month',
      trendUp: true,
      icon: ShoppingCart,
      iconBg: '#22c55e',
      cardHref: '/purchasing/orders',
    },
    {
      id: 'billing',
      title: 'Total Sales/Billing',
      value: '₹ 1,22,50,000',
      trend: '18% from last month',
      trendUp: true,
      icon: Receipt,
      iconBg: '#f97316',
      cardHref: '/contractors/bills',
    },
    {
      id: 'payments',
      title: 'Payments Made',
      value: '₹ 65,20,000',
      trend: '10% from last month',
      trendUp: true,
      icon: CreditCard,
      iconBg: '#ef4444',
      cardHref: '/finance/day-book',
    },
    {
      id: 'outstanding',
      title: 'Project Outstanding',
      value: '₹ 57,30,000',
      trend: '5% from last month',
      trendUp: false,
      icon: Wallet,
      iconBg: '#8b5cf6',
      cardHref: '/finance/vouchers',
    },
  ];

  // 2. Project Progress Bar Chart Data (Jan - Oct)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const progressData = [
    { month: 'Jan', planned: 20, actual: 30 },
    { month: 'Feb', planned: 45, actual: 53 },
    { month: 'Mar', planned: 40, actual: 47 },
    { month: 'Apr', planned: 55, actual: 61 },
    { month: 'May', planned: 50, actual: 71 },
    { month: 'Jun', planned: 56, actual: 39 },
    { month: 'Jul', planned: 68, actual: 57 },
    { month: 'Aug', planned: 54, actual: 47 },
    { month: 'Sep', planned: 72, actual: 52 },
    { month: 'Oct', planned: 84, actual: 76 },
  ];

  // 3. Expense vs Billing Curve Chart Data (Jan - Oct)
  // Values mapped to 0 to 1.5 Cr (in Lakhs: 150 = 1.5Cr)
  const expenseBillingData = [
    { month: 'Jan', expense: 18, billing: 38 },
    { month: 'Feb', expense: 32, billing: 52 },
    { month: 'Mar', expense: 28, billing: 50 },
    { month: 'Apr', expense: 45, billing: 68 },
    { month: 'May', expense: 52, billing: 88 },
    { month: 'Jun', expense: 50, billing: 82 },
    { month: 'Jul', expense: 62, billing: 102 },
    { month: 'Aug', expense: 65, billing: 108 },
    { month: 'Sep', expense: 70, billing: 118 },
    { month: 'Oct', expense: 75, billing: 132 },
  ];

  // 4. Material Stock Value Donut Segments
  const donutSegments = [
    { label: 'Cement', pct: 35, color: '#3b82f6', amount: '₹ 9,94,000' },
    { label: 'TMT Steel', pct: 25, color: '#10b981', amount: '₹ 7,10,000' },
    { label: 'Bricks', pct: 15, color: '#f97316', amount: '₹ 4,26,000' },
    { label: 'Sand & Aggregate', pct: 15, color: '#8b5cf6', amount: '₹ 4,26,000' },
    { label: 'Others', pct: 10, color: '#eab308', amount: '₹ 2,84,000' },
  ];

  // 5. Ongoing Projects Data
  const ongoingProjects = [
    {
      id: 'PRJ-001',
      name: 'Green Valley Residency',
      location: 'Lucknow',
      progress: 78,
      status: 'On Track',
      statusClass: 'status-ontrack',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'PRJ-002',
      name: 'City Mall Construction',
      location: 'Kanpur',
      progress: 45,
      status: 'Delayed',
      statusClass: 'status-delayed',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'PRJ-003',
      name: 'Riverside Apartments',
      location: 'Varanasi',
      progress: 62,
      status: 'On Track',
      statusClass: 'status-ontrack',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'PRJ-004',
      name: 'Metro Office Complex',
      location: 'Lucknow',
      progress: 30,
      status: 'At Risk',
      statusClass: 'status-atrisk',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'PRJ-005',
      name: 'Industrial Warehouse',
      location: 'Noida',
      progress: 85,
      status: 'On Track',
      statusClass: 'status-ontrack',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=80',
    },
  ];

  // 6. Recent Material Requests Table Data
  const recentMaterialRequests = [
    {
      id: 'MR-001',
      site: 'Site A - Green Valley',
      material: 'Cement',
      qty: '50 Bags',
      status: 'Pending',
      statusClass: 'badge-amber',
    },
    {
      id: 'MR-002',
      site: 'Site B - City Mall',
      material: 'TMT Steel',
      qty: '2 Ton',
      status: 'Approved',
      statusClass: 'badge-emerald',
    },
    {
      id: 'MR-003',
      site: 'Site A - Green Valley',
      material: 'Bricks',
      qty: '5,000 Pcs',
      status: 'Pending',
      statusClass: 'badge-amber',
    },
    {
      id: 'MR-004',
      site: 'Site C - Riverside',
      material: 'Sand',
      qty: '3 Truck',
      status: 'Approved',
      statusClass: 'badge-emerald',
    },
    {
      id: 'MR-005',
      site: 'Site D - Metro Office',
      material: 'Cement',
      qty: '100 Bags',
      status: 'Rejected',
      statusClass: 'badge-rose',
    },
  ];

  // 7. Pending Approvals Table Data
  const pendingApprovals = [
    {
      type: 'Purchase Order',
      refNo: 'PO-001',
      amount: '₹ 5,20,000',
      submittedBy: 'Ravi Sharma',
    },
    {
      type: 'Purchase Bill',
      refNo: 'PB-015',
      amount: '₹ 8,75,000',
      submittedBy: 'Amit Verma',
    },
    {
      type: 'Material Request',
      refNo: 'MR-001',
      amount: '₹ 45,000',
      submittedBy: 'Suresh Kumar',
    },
    {
      type: 'Running Bill',
      refNo: 'RB-003',
      amount: '₹ 12,50,000',
      submittedBy: 'ABC Constructions',
    },
    {
      type: 'Payment Request',
      refNo: 'PAY-018',
      amount: '₹ 3,20,000',
      submittedBy: 'Neha Singh',
    },
  ];

  // 8. Recent Contractor Running Bills Data
  const runningBills = [
    {
      contractor: 'ABC Constructions',
      project: 'Green Valley',
      billNo: 'RB-003',
      amount: '₹ 12,50,000',
      status: 'Pending',
      statusClass: 'badge-amber',
    },
    {
      contractor: 'Sharma Infra',
      project: 'City Mall',
      billNo: 'RB-002',
      amount: '₹ 8,75,000',
      status: 'Approved',
      statusClass: 'badge-emerald',
    },
    {
      contractor: 'Khan Builders',
      project: 'Riverside',
      billNo: 'RB-001',
      amount: '₹ 5,20,000',
      status: 'Paid',
      statusClass: 'badge-teal',
    },
    {
      contractor: 'Metro Works',
      project: 'Metro Office',
      billNo: 'RB-004',
      amount: '₹ 15,00,000',
      status: 'Pending',
      statusClass: 'badge-amber',
    },
  ];

  // 9. Site Photo Updates (GPS) Data
  const sitePhotos = [
    {
      id: 'photo-1',
      title: 'Site A - Foundation Work',
      time: 'Today, 10:30 AM',
      location: 'Lucknow, UP',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=360&auto=format&fit=crop&q=80',
    },
    {
      id: 'photo-2',
      title: 'Material Delivery',
      time: 'Today, 12:15 PM',
      location: 'Kanpur, UP',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=360&auto=format&fit=crop&q=80',
    },
    {
      id: 'photo-3',
      title: 'Slab Work',
      time: 'Today, 03:45 PM',
      location: 'Varanasi, UP',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=360&auto=format&fit=crop&q=80',
    },
    {
      id: 'photo-4',
      title: 'Steel Work',
      time: 'Yesterday, 05:20 PM',
      location: 'Noida, UP',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=360&auto=format&fit=crop&q=80',
    },
  ];

  // 10. Team Activity Data
  const teamActivities = [
    {
      id: 'act-1',
      user: 'Ravi Sharma',
      text: 'created Purchase Order PO-001',
      time: '2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
      initials: 'RS',
    },
    {
      id: 'act-2',
      user: 'Suresh Kumar',
      text: 'submitted Material Request MR-001',
      time: '4 hours ago',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80',
      initials: 'SK',
    },
    {
      id: 'act-3',
      user: 'Amit Verma',
      text: 'approved Running Bill RB-002',
      time: '5 hours ago',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=80',
      initials: 'AV',
    },
    {
      id: 'act-4',
      user: 'Neha Singh',
      text: 'added site photo at Site B',
      time: '6 hours ago',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      initials: 'NS',
    },
    {
      id: 'act-5',
      user: 'System',
      text: 'generated Stock Report for September',
      time: '8 hours ago',
      isSystem: true,
      initials: 'SYS',
    },
  ];

  // SVG Chart Dimensions & Math
  // Bar Chart Math (viewBox: 0 0 380 200)
  const barChartW = 380;
  const barChartH = 190;
  const barPadLeft = 32;
  const barPadRight = 10;
  const barPadTop = 15;
  const barPadBottom = 26;
  const barInnerW = barChartW - barPadLeft - barPadRight;
  const barInnerH = barChartH - barPadTop - barPadBottom;
  const barGroupWidth = barInnerW / months.length;

  // Expense vs Billing Curve Math (viewBox: 0 0 380 200)
  const lineChartW = 380;
  const lineChartH = 190;
  const linePadLeft = 36;
  const linePadRight = 12;
  const linePadTop = 15;
  const linePadBottom = 26;
  const lineInnerW = lineChartW - linePadLeft - linePadRight;
  const lineInnerH = lineChartH - linePadTop - linePadBottom;
  const maxExpenseBilling = 150; // 1.5 Cr in Lakhs

  const expensePoints = expenseBillingData.map((d, i) => {
    const x = linePadLeft + (i / (expenseBillingData.length - 1)) * lineInnerW;
    const y = linePadTop + (1 - d.expense / maxExpenseBilling) * lineInnerH;
    return { x, y, ...d };
  });

  const billingPoints = expenseBillingData.map((d, i) => {
    const x = linePadLeft + (i / (expenseBillingData.length - 1)) * lineInnerW;
    const y = linePadTop + (1 - d.billing / maxExpenseBilling) * lineInnerH;
    return { x, y, ...d };
  });

  const makeCurvePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const prev = pts[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpX2 = cpX1;
      d += ` C ${cpX1} ${prev.y}, ${cpX2} ${p.y}, ${p.x} ${p.y}`;
    }
    return d;
  };

  const expenseLinePath = makeCurvePath(expensePoints);
  const billingLinePath = makeCurvePath(billingPoints);

  const baselineLineY = linePadTop + lineInnerH;
  const expenseAreaPath = `${expenseLinePath} L ${expensePoints[expensePoints.length - 1].x} ${baselineLineY} L ${expensePoints[0].x} ${baselineLineY} Z`;
  const billingAreaPath = `${billingLinePath} L ${billingPoints[billingPoints.length - 1].x} ${baselineLineY} L ${billingPoints[0].x} ${baselineLineY} Z`;

  // Donut SVG Math (Circumference & Offsets)
  const donutR = 52;
  const donutCircum = 2 * Math.PI * donutR;
  let runningDonutOffset = 0;
  const computedDonutSegments = donutSegments.map((s) => {
    const strokeDasharray = `${(s.pct / 100) * donutCircum} ${donutCircum}`;
    const strokeDashoffset = -runningDonutOffset;
    runningDonutOffset += (s.pct / 100) * donutCircum;
    return {
      ...s,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="erp-overview-container">
      {/* 1. Greeting & Date/Filter Bar */}
      <div className="erp-overview-header anim-fade-in">
        <div className="greeting-block">
          <h1 className="greeting-title">
            {(() => {
              const hour = new Date().getHours();
              const period = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
              const firstName = (user?.name || 'Guest').split(' ')[0] || 'Guest';
              return (
                <>
                  <span>
                    {period}, {firstName}
                  </span>
                  <span className="greeting-wave" role="img" aria-label="wave">
                    👋
                  </span>
                </>
              );
            })()}
          </h1>
          <p className="greeting-subtitle">
            Here&apos;s what&apos;s happening across your construction projects today.
          </p>
        </div>

        <div className="header-controls-block">
          <div className="date-display-pill">
            <CalendarBlank size={16} weight="regular" className="date-pill-icon" />
            <span className="date-pill-text">Wed, 15 Oct 2026</span>
          </div>

          <div className="period-dropdown-wrap">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-dropdown-select"
              aria-label="Select period"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
            </select>
            <CaretDown size={13} weight="bold" className="dropdown-caret-icon" />
          </div>
        </div>
      </div>

      {/* 2. Top 6 KPI Stat Cards Grid */}
      <section className="kpi-cards-grid" aria-label="Key Performance Indicators">
        {kpiCards.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <Link
              key={kpi.id}
              href={kpi.cardHref}
              className="kpi-card-item anim-card-in"
              style={{ animationDelay: `${idx * 0.05 + 0.05}s` }}
            >
              <div className="kpi-card-top">
                <div className="kpi-icon-box" style={{ backgroundColor: kpi.iconBg }}>
                  <IconComponent size={22} weight="fill" color="#ffffff" />
                </div>
                <div className="kpi-metric-info">
                  <span className="kpi-title">{kpi.title}</span>
                  <strong className="kpi-value">{kpi.value}</strong>
                </div>
              </div>

              <div className="kpi-trend-row">
                {kpi.trendUp ? (
                  <span className="kpi-trend-text trend-positive">
                    <ArrowUp size={12} weight="bold" />
                    <span>{kpi.trend}</span>
                  </span>
                ) : (
                  <span className="kpi-trend-text trend-negative">
                    <ArrowDown size={12} weight="bold" />
                    <span>{kpi.trend}</span>
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </section>

      {/* 3. Middle 3 Visual Analytics Cards */}
      <section className="analytics-tri-grid" aria-label="Visual Analytics">
        {/* Card 1: Project Progress (Bar Chart) */}
        <div className="analytics-card anim-panel-in" style={{ animationDelay: '0.18s' }}>
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">Project Progress</h2>
            <div className="chart-legend-box">
              <span className="legend-item">
                <span className="legend-sq planned-sq" />
                <span>Planned</span>
              </span>
              <span className="legend-item">
                <span className="legend-sq actual-sq" />
                <span>Actual</span>
              </span>
            </div>
          </div>

          <div className="chart-svg-container">
            <svg viewBox={`0 0 ${barChartW} ${barChartH}`} className="chart-svg" aria-label="Project progress bar chart">
              {/* Horizontal Gridlines & Y-Axis */}
              {[100, 80, 60, 40, 20, 0].map((val, idx) => {
                const y = barPadTop + (idx / 5) * barInnerH;
                return (
                  <g key={val}>
                    <line x1={barPadLeft} y1={y} x2={barChartW - barPadRight} y2={y} className="chart-grid-line" />
                    <text x={barPadLeft - 6} y={y + 3.5} textAnchor="end" className="chart-y-label">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Paired Vertical Bars */}
              {progressData.map((d, i) => {
                const groupX = barPadLeft + i * barGroupWidth;
                const barWidth = 7;
                const spacing = 3;
                const plannedH = (d.planned / 100) * barInnerH;
                const actualH = (d.actual / 100) * barInnerH;
                const baseY = barPadTop + barInnerH;

                const isHovered = hoveredBarIndex === i;

                return (
                  <g
                    key={d.month}
                    className="bar-group"
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Planned Bar (Light Blue) */}
                    <rect
                      x={groupX + barGroupWidth / 2 - barWidth - spacing / 2}
                      y={baseY - plannedH}
                      width={barWidth}
                      height={plannedH}
                      rx={2}
                      className="bar-rect planned-bar"
                    />

                    {/* Actual Bar (Vibrant Primary Blue) */}
                    <rect
                      x={groupX + barGroupWidth / 2 + spacing / 2}
                      y={baseY - actualH}
                      width={barWidth}
                      height={actualH}
                      rx={2}
                      className="bar-rect actual-bar"
                    />

                    {/* X-Axis Month Label */}
                    <text
                      x={groupX + barGroupWidth / 2}
                      y={barChartH - 8}
                      textAnchor="middle"
                      className={`chart-x-label ${isHovered ? 'is-active' : ''}`}
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Card 2: Expense vs Billing (Dual Line Chart) */}
        <div className="analytics-card anim-panel-in" style={{ animationDelay: '0.24s' }}>
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">Expense vs Billing</h2>
            <div className="chart-legend-box">
              <span className="legend-item">
                <span className="legend-dot expense-dot" />
                <span>Purchase/Expense</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot billing-dot" />
                <span>Sales/Billing</span>
              </span>
            </div>
          </div>

          <div className="chart-svg-container">
            <svg viewBox={`0 0 ${lineChartW} ${lineChartH}`} className="chart-svg" aria-label="Expense vs billing line chart">
              <defs>
                <linearGradient id="billingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines for 1.5Cr, 1Cr, 50L, 0 */}
              {[
                { label: '1.5Cr', ratio: 0 },
                { label: '1Cr', ratio: 0.333 },
                { label: '50L', ratio: 0.666 },
                { label: '0', ratio: 1 },
              ].map((g) => {
                const y = linePadTop + g.ratio * lineInnerH;
                return (
                  <g key={g.label}>
                    <line x1={linePadLeft} y1={y} x2={lineChartW - linePadRight} y2={y} className="chart-grid-line" />
                    <text x={linePadLeft - 6} y={y + 3.5} textAnchor="end" className="chart-y-label">
                      {g.label}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Areas */}
              <path d={billingAreaPath} fill="url(#billingGrad)" />
              <path d={expenseAreaPath} fill="url(#expenseGrad)" />

              {/* Curved Strokes */}
              <path d={billingLinePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
              <path d={expenseLinePath} fill="none" stroke="#ef4444" strokeWidth="2.5" />

              {/* Data Node Dots */}
              {billingPoints.map((pt, i) => (
                <circle key={`bill-dot-${i}`} cx={pt.x} cy={pt.y} r={3} fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              ))}
              {expensePoints.map((pt, i) => (
                <circle key={`exp-dot-${i}`} cx={pt.x} cy={pt.y} r={3} fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              ))}

              {/* X-Axis Month Labels */}
              {months.map((m, idx) => {
                const x = linePadLeft + (idx / (months.length - 1)) * lineInnerW;
                return (
                  <text key={m} x={x} y={lineChartH - 8} textAnchor="middle" className="chart-x-label">
                    {m}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Card 3: Material Stock Value (Donut Chart) */}
        <div className="analytics-card anim-panel-in" style={{ animationDelay: '0.30s' }}>
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">Material Stock Value</h2>
          </div>

          <div className="donut-and-legend-layout">
            <div className="donut-visual-box">
              <svg viewBox="0 0 140 140" className="donut-chart-svg" aria-label="Stock value breakdown donut chart">
                <circle cx="70" cy="70" r={donutR} fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                {computedDonutSegments.map((seg, idx) => (
                  <circle
                    key={seg.label}
                    cx="70"
                    cy="70"
                    r={donutR}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={hoveredDonutSegment === idx ? 23 : 20}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="donut-arc-slice"
                    onMouseEnter={() => setHoveredDonutSegment(idx)}
                    onMouseLeave={() => setHoveredDonutSegment(null)}
                    transform="rotate(-90 70 70)"
                  />
                ))}
              </svg>

              <div className="donut-center-overlay">
                <strong className="donut-center-amount">₹ 28,40,000</strong>
                <span className="donut-center-caption">Total Value</span>
              </div>
            </div>

            <div className="donut-legend-stack">
              {donutSegments.map((seg, idx) => (
                <div
                  key={seg.label}
                  className={`donut-legend-row ${hoveredDonutSegment === idx ? 'is-active' : ''}`}
                  onMouseEnter={() => setHoveredDonutSegment(idx)}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                >
                  <span className="legend-indicator-dot" style={{ backgroundColor: seg.color }} />
                  <span className="legend-item-name">{seg.label}</span>
                  <strong className="legend-item-pct">{seg.pct}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Row 4 (3 Columns: Ongoing Projects, Recent Material Requests, Pending Approvals) */}
      <section className="table-tri-grid">
        {/* Col 1: Ongoing Projects */}
        <div className="section-panel-box anim-panel-in" style={{ animationDelay: '0.28s' }}>
          <div className="panel-box-header">
            <h2 className="panel-box-title">Ongoing Projects</h2>
            <Link href="/organisation/projects" className="panel-view-all-link">
              View All
            </Link>
          </div>

          <div className="ongoing-projects-list">
            {ongoingProjects.map((proj) => (
              <div key={proj.id} className="ongoing-project-item">
                <img
                  src={proj.image}
                  alt={proj.name}
                  className="project-thumb-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="project-detail-meta">
                  <strong className="project-name-text">{proj.name}</strong>
                  <span className="project-sub-code">
                    {proj.id} | {proj.location}
                  </span>
                </div>

                <div className="project-progress-meter">
                  <div className="progress-bar-bg">
                    <span className="progress-bar-fill" style={{ width: `${proj.progress}%` }} />
                  </div>
                  <span className="progress-num-text">{proj.progress}%</span>
                </div>

                <span className={`project-status-pill ${proj.statusClass}`}>{proj.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Recent Material Requests */}
        <div className="section-panel-box anim-panel-in" style={{ animationDelay: '0.34s' }}>
          <div className="panel-box-header">
            <h2 className="panel-box-title">Recent Material Requests</h2>
            <Link href="/requests" className="panel-view-all-link">
              View All
            </Link>
          </div>

          <div className="panel-table-wrapper">
            <table className="mini-data-table">
              <thead>
                <tr>
                  <th className="th-id">ID</th>
                  <th className="th-site">Site</th>
                  <th className="th-mat">Material</th>
                  <th className="th-qty">Qty</th>
                  <th className="th-status text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMaterialRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="font-semibold text-slate-800">{req.id}</td>
                    <td className="text-slate-600">{req.site}</td>
                    <td className="text-slate-700 font-medium">{req.material}</td>
                    <td className="text-slate-600">{req.qty}</td>
                    <td className="text-right">
                      <span className={`table-badge-tag ${req.statusClass}`}>{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 3: Pending Approvals */}
        <div className="section-panel-box anim-panel-in" style={{ animationDelay: '0.40s' }}>
          <div className="panel-box-header">
            <h2 className="panel-box-title">Pending Approvals</h2>
            <Link href="/approvals" className="panel-view-all-link">
              View All
            </Link>
          </div>

          <div className="panel-table-wrapper">
            <table className="mini-data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Ref No</th>
                  <th>Amount</th>
                  <th>Submitted By</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((appr, idx) => (
                  <tr key={idx}>
                    <td className="text-slate-700 font-medium">{appr.type}</td>
                    <td className="font-semibold text-slate-800">{appr.refNo}</td>
                    <td className="font-semibold text-slate-900">{appr.amount}</td>
                    <td className="text-slate-600">{appr.submittedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Row 5 (Bottom 3 Columns: Recent Contractor Running Bills, Site Photo Updates, Team Activity) */}
      <section className="table-tri-grid">
        {/* Col 1: Recent Contractor Running Bills */}
        <div className="section-panel-box anim-panel-in" style={{ animationDelay: '0.38s' }}>
          <div className="panel-box-header">
            <h2 className="panel-box-title">Recent Contractor Running Bills</h2>
            <Link href="/contractors/bills" className="panel-view-all-link">
              View All
            </Link>
          </div>

          <div className="panel-table-wrapper">
            <table className="mini-data-table">
              <thead>
                <tr>
                  <th>Contractor</th>
                  <th>Project</th>
                  <th>Bill No</th>
                  <th>Amount</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {runningBills.map((bill, idx) => (
                  <tr key={idx}>
                    <td className="font-medium text-slate-800">{bill.contractor}</td>
                    <td className="text-slate-600">{bill.project}</td>
                    <td className="font-semibold text-slate-800">{bill.billNo}</td>
                    <td className="font-semibold text-slate-900">{bill.amount}</td>
                    <td className="text-right">
                      <span className={`table-badge-tag ${bill.statusClass}`}>{bill.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 2: Site Photo Updates (GPS) */}
        <div className="section-panel-box anim-panel-in" style={{ animationDelay: '0.44s' }}>
          <div className="panel-box-header">
            <h2 className="panel-box-title">Site Photo Updates (GPS)</h2>
            <Link href="/inventory/stock" className="panel-view-all-link">
              View All
            </Link>
          </div>

          <div className="site-photos-quad-grid">
            {sitePhotos.map((photo) => (
              <div key={photo.id} className="site-photo-card">
                <div className="photo-image-frame">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="site-photo-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="photo-card-body">
                  <strong className="photo-card-title">{photo.title}</strong>
                  <span className="photo-card-time">{photo.time}</span>
                  <span className="photo-card-location">
                    <span className="pin-symbol">📍</span> {photo.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Team Activity */}
        <div className="section-panel-box anim-panel-in" style={{ animationDelay: '0.50s' }}>
          <div className="panel-box-header">
            <h2 className="panel-box-title">Team Activity</h2>
            <Link href="/approvals" className="panel-view-all-link">
              View All
            </Link>
          </div>

          <div className="team-activity-list">
            {teamActivities.map((act) => (
              <div key={act.id} className="team-activity-row">
                {act.isSystem ? (
                  <div className="system-activity-icon">
                    <FileText size={16} weight="fill" color="#ffffff" />
                  </div>
                ) : (
                  <img
                    src={act.avatar}
                    alt={act.user}
                    className="team-user-avatar"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="team-activity-content">
                  <p className="team-activity-desc">
                    <strong className="user-name">{act.user}</strong> {act.text}
                  </p>
                  <span className="team-activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
