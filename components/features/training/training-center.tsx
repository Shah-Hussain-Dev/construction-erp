'use client';

import React, { useState, useMemo } from 'react';
import {
  House,
  Buildings,
  Kanban,
  ShoppingCart,
  Cube,
  Scroll,
  Bank,
  ChatDots,
  ChartPie,
  DeviceMobile,
  Play,
  Pause,
  CheckCircle,
  Circle,
  FileText,
  VideoCamera,
  Question,
  DownloadSimple,
  MagnifyingGlass,
  ArrowRight,
  CaretRight,
  CaretLeft,
  X,
  SpeakerHigh,
  ClosedCaptioning,
  Gear,
  CornersOut,
  Sparkle,
  Clock,
  BookOpen,
  WarningCircle,
  Bell,
  Check,
  DotsThreeVertical,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { BRAND_CONFIG } from '@/lib/config';
import trainingDataRaw from '@/lib/training-data.json';
import type { TrainingData, TrainingModule, TrainingLesson } from './types';

const trainingData = trainingDataRaw as unknown as TrainingData;

// Icon resolver helper
function getModuleIcon(iconName: string) {
  switch (iconName) {
    case 'House':
      return House;
    case 'Buildings':
      return Buildings;
    case 'Kanban':
      return Kanban;
    case 'ShoppingCart':
      return ShoppingCart;
    case 'Cube':
      return Cube;
    case 'Scroll':
      return Scroll;
    case 'Bank':
      return Bank;
    case 'ChatDots':
      return ChatDots;
    case 'ChartPie':
      return ChartPie;
    case 'DeviceMobile':
      return DeviceMobile;
    default:
      return BookOpen;
  }
}

export function TrainingCenter() {
  const [modules, setModules] = useState<TrainingModule[]>(trainingData.modules);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('1.1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [notifiedModules, setNotifiedModules] = useState<Record<number, boolean>>({});
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Active module & lesson resolution
  const activeModule = useMemo(() => {
    return modules.find((m) => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const activeLesson = useMemo(() => {
    if (!activeModule.lessons || activeModule.lessons.length === 0) return null;
    return (
      activeModule.lessons.find((l) => l.id === selectedLessonId) ||
      activeModule.lessons[0]
    );
  }, [activeModule, selectedLessonId]);

  // Base completed count from overall curriculum progress (28 in screenshot)
  const baseCompletedCount = trainingData.progress.completedLessons || 28;
  const initialCheckedCount = useMemo(() => {
    let count = 0;
    trainingData.modules.forEach((m) => {
      m.lessons?.forEach((l) => {
        if (l.completed) count++;
      });
    });
    return count;
  }, []);

  const totalCompletedLessons = useMemo(() => {
    const currentChecked = modules.reduce((acc, m) => {
      if (!m.lessons) return acc;
      return acc + m.lessons.filter((l) => l.completed).length;
    }, 0);
    return baseCompletedCount + (currentChecked - initialCheckedCount);
  }, [modules, baseCompletedCount, initialCheckedCount]);

  const totalPossibleLessons = trainingData.progress.totalLessons || 86;
  const progressPercentage = useMemo(() => {
    if (totalCompletedLessons === baseCompletedCount) {
      return trainingData.progress.completionPercentage;
    }
    return Math.min(100, Math.round((totalCompletedLessons / totalPossibleLessons) * 100));
  }, [totalCompletedLessons, baseCompletedCount, totalPossibleLessons]);

  // Toggle completion of a lesson
  const toggleLessonCompleted = (moduleId: number, lessonId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId || !mod.lessons) return mod;
        const updatedLessons = mod.lessons.map((les) => {
          if (les.id !== lessonId) return les;
          const nextCompleted = !les.completed;
          if (nextCompleted) {
            toast.success(`Completed "${les.title}"! Progress updated.`);
          }
          return { ...les, completed: nextCompleted };
        });
        const completedCount = updatedLessons.filter((l) => l.completed).length;
        return {
          ...mod,
          lessons: updatedLessons,
          completedCount,
        };
      }),
    );
  };

  // Switch to next or previous lesson
  const handleNextLesson = () => {
    if (!activeModule.lessons) return;
    const currentIndex = activeModule.lessons.findIndex((l) => l.id === activeLesson?.id);
    if (currentIndex >= 0 && currentIndex < activeModule.lessons.length - 1) {
      const next = activeModule.lessons[currentIndex + 1];
      setSelectedLessonId(next.id);
    } else {
      toast.info('You reached the last lesson in this module!');
    }
  };

  const handlePrevLesson = () => {
    if (!activeModule.lessons) return;
    const currentIndex = activeModule.lessons.findIndex((l) => l.id === activeLesson?.id);
    if (currentIndex > 0) {
      const prev = activeModule.lessons[currentIndex - 1];
      setSelectedLessonId(prev.id);
    }
  };

  const handleNotifyMe = (moduleId: number, moduleName: string) => {
    setNotifiedModules((prev) => ({ ...prev, [moduleId]: true }));
    toast.success(`Notification set! You will be alerted when "${moduleName}" is published.`);
  };

  // Filter modules/lessons when search is active
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.toLowerCase();
    return modules.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.lessons?.some((l) => l.title.toLowerCase().includes(q)),
    );
  }, [modules, searchQuery]);

  return (
    <div className="training-page-root">
      {/* 1. Header Toolbar */}
      <header className="training-header-bar">
        <div className="training-header-left">
          <div className="training-header-icon-box">
            <BookOpen size={24} weight="duotone" className="text-blue-600" />
          </div>
          <div>
            <h1 className="training-header-title">Training &amp; Help Center</h1>
            <p className="training-header-subtitle">
              Learn how to use {BRAND_CONFIG.name} with step-by-step guides, video tutorials and FAQs.
            </p>
          </div>
        </div>

        <div className="training-header-actions">
          <div className="training-search-wrap">
            <MagnifyingGlass size={16} className="training-search-icon" />
            <input
              type="text"
              placeholder="Search training content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="training-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="training-search-clear"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Top Row: Welcome Card + Your Progress Card */}
      <div className="training-top-grid">
        {/* Welcome Hero Card */}
        <div className="training-welcome-card">
          <div className="welcome-card-content">
            <span className="welcome-eyebrow">Welcome to</span>
            <h2 className="welcome-title">{BRAND_CONFIG.name} Training Center</h2>
            <p className="welcome-desc">
              Everything you need to learn and master the ERP system. Watch videos, follow step-by-step guides or explore FAQs.
            </p>

            <div className="welcome-badges-row">
              <button
                type="button"
                onClick={() => {
                  setSelectedModuleId(1);
                  setSelectedLessonId('1.1');
                }}
                className="welcome-feature-badge"
              >
                <div className="feature-badge-icon blue">
                  <Play size={14} weight="fill" />
                </div>
                <div>
                  <strong className="badge-name">Video Tutorials</strong>
                  <span className="badge-sub">Short &amp; easy videos</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedModuleId(7);
                  setSelectedLessonId('7.2');
                }}
                className="welcome-feature-badge"
              >
                <div className="feature-badge-icon green">
                  <FileText size={14} weight="fill" />
                </div>
                <div>
                  <strong className="badge-name">Step-by-Step Guides</strong>
                  <span className="badge-sub">Detailed instructions</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('training-faqs-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="welcome-feature-badge"
              >
                <div className="feature-badge-icon purple">
                  <Question size={14} weight="bold" />
                </div>
                <div>
                  <strong className="badge-name">FAQs</strong>
                  <span className="badge-sub">Get quick answers</span>
                </div>
              </button>
            </div>
          </div>

          <div className="welcome-hero-art">
            <img
              src="/images/training-hero.jpg"
              alt="Construction Engineer with Hard Hat and Tablet"
              className="welcome-hero-image"
            />
          </div>
        </div>

        {/* Your Training Progress Card */}
        <div className="training-progress-card">
          <div className="progress-card-head">
            <h3 className="progress-card-title">Your Training Progress</h3>
            <button
              type="button"
              onClick={() => toast.info(`Report: ${totalCompletedLessons} of ${totalPossibleLessons} lessons completed (${progressPercentage}%).`)}
              className="progress-card-report-btn"
            >
              View Report
            </button>
          </div>

          <div className="progress-card-body">
            {/* Donut Chart */}
            <div className="progress-donut-wrap">
              <svg className="progress-donut-svg" viewBox="0 0 100 100">
                <circle
                  className="donut-bg"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="9"
                  fill="none"
                />
                <circle
                  className="donut-fill"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="9"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * progressPercentage) / 100}
                />
              </svg>
              <div className="donut-center-text">
                <strong className="donut-percent">{`${progressPercentage}%`}</strong>
                <span className="donut-label">Complete</span>
              </div>
            </div>

            {/* Metrics List */}
            <div className="progress-metrics-list">
              <div className="progress-metric-item">
                <div className="metric-icon-box blue">
                  <BookOpen size={16} weight="bold" />
                </div>
                <div className="metric-info">
                  <strong className="metric-val">3 / 10</strong>
                  <span className="metric-lbl">Modules Completed</span>
                </div>
              </div>

              <div className="progress-metric-item">
                <div className="metric-icon-box cyan">
                  <Play size={16} weight="fill" />
                </div>
                <div className="metric-info">
                  <strong className="metric-val">{`${totalCompletedLessons} / ${totalPossibleLessons}`}</strong>
                  <span className="metric-lbl">Lessons Completed</span>
                </div>
              </div>

              <div className="progress-metric-item">
                <div className="metric-icon-box amber">
                  <Clock size={16} weight="bold" />
                </div>
                <div className="metric-info">
                  <strong className="metric-val">2.5 Hours</strong>
                  <span className="metric-lbl">Learning Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Popular Topics Bar */}
      <section className="training-popular-section">
        <div className="popular-header-row">
          <h3 className="popular-title">Popular Topics</h3>
          <button
            type="button"
            onClick={() => setSelectedModuleId(7)}
            className="popular-view-all"
          >
            View All
          </button>
        </div>

        <div className="popular-topics-grid">
          {trainingData.popularTopics.map((topic) => {
            const isCurrent = activeModule.id === topic.moduleId;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setSelectedModuleId(topic.moduleId);
                  const targetMod = modules.find((m) => m.id === topic.moduleId);
                  if (targetMod?.lessons && targetMod.lessons.length > 0) {
                    setSelectedLessonId(targetMod.lessons[0].id);
                  }
                }}
                className={`popular-topic-card theme-${topic.theme} ${isCurrent ? 'is-active' : ''}`}
              >
                <div className="topic-card-icon-wrap">
                  {topic.id === 'getting-started' && <BookOpen size={20} weight="duotone" />}
                  {topic.id === 'project-management' && <Buildings size={20} weight="duotone" />}
                  {topic.id === 'procurement' && <ShoppingCart size={20} weight="duotone" />}
                  {topic.id === 'inventory' && <Cube size={20} weight="duotone" />}
                  {topic.id === 'contractor-billing' && <FileText size={20} weight="duotone" />}
                  {topic.id === 'accounting-finance' && <Bank size={20} weight="duotone" />}
                </div>
                <div className="topic-card-info">
                  <h4 className="topic-card-title">{topic.title}</h4>
                  <span className="topic-card-lessons">{topic.lessonsCount} Lessons</span>
                </div>
                <div className="topic-card-arrow">
                  <ArrowRight size={14} weight="bold" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Main 3-Column Split Layout */}
      <div className="training-main-layout">
        {/* Left Column: Training Modules Sidebar */}
        <aside className="training-modules-sidebar">
          <div className="modules-sidebar-header">
            <h3 className="modules-sidebar-title">Training Modules</h3>
          </div>

          <div className="modules-list-scroll">
            {filteredModules.map((mod) => {
              const IconComp = getModuleIcon(mod.icon);
              const isActive = mod.id === activeModule.id;
              const isComingSoon = mod.status === 'coming_soon';

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    if (mod.lessons && mod.lessons.length > 0) {
                      setSelectedLessonId(mod.lessons[0].id);
                    }
                  }}
                  className={`training-module-item ${isActive ? 'is-active' : ''} ${isComingSoon ? 'is-coming-soon' : ''}`}
                >
                  <div className={`module-item-icon-box ${isActive ? 'active-icon' : ''}`}>
                    <IconComp size={18} weight={isActive ? 'fill' : 'regular'} />
                  </div>

                  <div className="module-item-text">
                    <h4 className="module-item-title">{mod.title}</h4>
                    <p className="module-item-summary">{mod.summary}</p>
                  </div>

                  <div className="module-item-meta">
                    {isComingSoon ? (
                      <span className="module-soon-pill">Soon</span>
                    ) : (
                      <span className="module-progress-pill">
                        {mod.completedCount} / {mod.totalCount}
                      </span>
                    )}
                    <CaretRight size={14} className="module-arrow" />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Active Module Content & Interactive Walkthrough */}
        <main className="training-active-content">
          {activeModule.status === 'ready' ? (
            <div className="ready-module-wrapper">
              {/* Active Module Header */}
              <div className="active-module-header">
                <div className="active-module-title-box">
                  <div className="active-module-badge-icon">
                    {React.createElement(getModuleIcon(activeModule.icon), {
                      size: 20,
                      weight: 'duotone',
                    })}
                  </div>
                  <div>
                    <h2 className="active-module-heading">{activeModule.name}</h2>
                    <p className="active-module-desc">{activeModule.description}</p>
                  </div>
                </div>

                <div className="active-module-progress-indicator">
                  <div className="progress-text-row">
                    <span>
                      {activeModule.completedCount} of {activeModule.totalCount} completed
                    </span>
                    <strong>
                      {Math.round((activeModule.completedCount / activeModule.totalCount) * 100)}%
                    </strong>
                  </div>
                  <div className="active-module-progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.round((activeModule.completedCount / activeModule.totalCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Video Mockup / Screen Player */}
              <div className="video-player-container">
                <div className="video-screen-mockup">
                  {/* Mock dashboard background inside player */}
                  <div className="player-inner-viewport">
                    <div className="player-mock-topbar">
                      <div className="mock-window-dots">
                        <span className="dot red" />
                        <span className="dot yellow" />
                        <span className="dot green" />
                      </div>
                      <span className="mock-window-title">
                        {BRAND_CONFIG.name} · {activeLesson?.title || 'Interactive Lesson'}
                      </span>
                    </div>

                    <div className="player-mock-body">
                      {/* Interactive Play Overlay Button */}
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`player-center-play-btn ${isPlaying ? 'is-playing' : ''}`}
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                      >
                        {isPlaying ? (
                          <Pause size={28} weight="fill" />
                        ) : (
                          <Play size={28} weight="fill" className="ml-1" />
                        )}
                      </button>

                      <div className="player-ambient-label">
                        <span>{activeLesson?.type === 'video' ? 'Full HD Video Walkthrough' : 'Interactive Step-by-Step Guide'}</span>
                      </div>
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className="player-controls-bottom">
                      <div className="controls-scrub-bar">
                        <div className="scrub-fill" style={{ width: isPlaying ? '65%' : '28%' }}>
                          <span className="scrub-handle" />
                        </div>
                      </div>

                      <div className="controls-buttons-row">
                        <div className="controls-left">
                          <button
                            type="button"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="ctrl-btn"
                          >
                            {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                          </button>
                          <span className="ctrl-time">
                            {isPlaying ? '04:12' : '02:15'} / {activeLesson?.duration || '08:30'}
                          </span>
                        </div>

                        <div className="controls-right">
                          <button type="button" className="ctrl-btn" title="Volume">
                            <SpeakerHigh size={16} />
                          </button>
                          <button type="button" className="ctrl-btn" title="Subtitles">
                            <ClosedCaptioning size={16} />
                          </button>
                          <button type="button" className="ctrl-btn" title="Settings">
                            <Gear size={16} />
                          </button>
                          <button type="button" className="ctrl-btn" title="Fullscreen">
                            <CornersOut size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Overview & Next/Prev Controls */}
              {activeLesson && (
                <div className="active-lesson-overview">
                  <div className="lesson-overview-meta">
                    <div>
                      <h3 className="lesson-title">
                        {activeLesson.number} {activeLesson.title}
                      </h3>
                      <p className="lesson-desc">{activeLesson.description}</p>
                    </div>

                    <div className="lesson-nav-buttons">
                      <button
                        type="button"
                        onClick={handlePrevLesson}
                        className="lesson-nav-btn prev"
                      >
                        <CaretLeft size={16} weight="bold" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextLesson}
                        className="lesson-nav-btn next"
                      >
                        <span>Next Lesson</span>
                        <CaretRight size={16} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* Step-by-Step Interactive Guide Box (Especially for Accounts & Finance and Main 4 Modules) */}
                  {activeLesson.steps && activeLesson.steps.length > 0 && (
                    <div className="lesson-steps-container">
                      <div className="steps-container-header">
                        <div className="flex items-center gap-2">
                          <FileText size={16} weight="duotone" className="text-blue-600" />
                          <h4 className="steps-heading">Step-by-Step Procedure</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleLessonCompleted(activeModule.id, activeLesson.id)}
                          className={`lesson-mark-complete-btn ${activeLesson.completed ? 'is-completed' : ''}`}
                        >
                          {activeLesson.completed ? (
                            <>
                              <CheckCircle size={15} weight="fill" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <Circle size={15} />
                              <span>Mark as Complete</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="steps-timeline">
                        {activeLesson.steps.map((st) => (
                          <div key={st.stepNumber} className="step-timeline-item">
                            <div className="step-number-pill">{st.stepNumber}</div>
                            <div className="step-details">
                              <h5 className="step-title">{st.title}</h5>
                              <p className="step-content">{st.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lessons Playlist Checklist for Active Module */}
                  <div className="lessons-playlist-card">
                    <div className="playlist-head">
                      <h4 className="playlist-title">Module Lessons ({activeModule.lessons?.length || 0})</h4>
                      <span className="playlist-sub">Click any lesson to open step-by-step walkthrough</span>
                    </div>

                    <div className="playlist-items-stack">
                      {activeModule.lessons?.map((les) => {
                        const isCurrentLesson = les.id === activeLesson.id;
                        return (
                          <div
                            key={les.id}
                            className={`playlist-item-row ${isCurrentLesson ? 'is-active-lesson' : ''}`}
                            onClick={() => setSelectedLessonId(les.id)}
                          >
                            <div className="playlist-item-left">
                              <div className="playlist-type-icon">
                                {les.type === 'video' ? (
                                  <VideoCamera size={15} weight="fill" className="text-blue-500" />
                                ) : (
                                  <FileText size={15} weight="bold" className="text-slate-500" />
                                )}
                              </div>
                              <span className="playlist-lesson-number">{les.number}</span>
                              <span className="playlist-lesson-title">{les.title}</span>
                            </div>

                            <div className="playlist-item-right">
                              <span className="playlist-duration">{les.duration}</span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLessonCompleted(activeModule.id, les.id);
                                }}
                                className="playlist-check-btn"
                                aria-label={les.completed ? 'Mark incomplete' : 'Mark completed'}
                              >
                                {les.completed ? (
                                  <CheckCircle size={18} weight="fill" className="text-emerald-500" />
                                ) : (
                                  <Circle size={18} className="text-slate-300 hover:text-slate-400" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info(`Options for ${les.title}`);
                                }}
                                className="playlist-more-btn"
                              >
                                <DotsThreeVertical size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Coming Soon Module View (Exact user requirement: "and resst show Traning Module will add soon") */
            <div className="coming-soon-module-container">
              <div className="coming-soon-card">
                <div className="soon-badge">
                  <Sparkle size={14} weight="fill" />
                  <span>IN PRODUCTION</span>
                </div>

                <div className="soon-icon-halo">
                  {React.createElement(getModuleIcon(activeModule.icon), {
                    size: 42,
                    weight: 'duotone',
                    className: 'text-amber-500',
                  })}
                </div>

                <h2 className="soon-title">{activeModule.name}</h2>
                <h3 className="soon-tagline">Training Module will add soon</h3>

                <p className="soon-message">
                  {activeModule.comingSoonMessage ||
                    'Our curriculum team is recording hands-on walkthroughs and video guides for this module. Expected release in the next update.'}
                </p>

                {activeModule.upcomingTopics && (
                  <div className="soon-upcoming-box">
                    <h4 className="upcoming-title">Upcoming Topics in this Module:</h4>
                    <ul className="upcoming-list">
                      {activeModule.upcomingTopics.map((top, idx) => (
                        <li key={idx} className="upcoming-item">
                          <Check size={14} weight="bold" className="text-amber-500 shrink-0" />
                          <span>{top}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="soon-actions-row">
                  <button
                    type="button"
                    onClick={() => handleNotifyMe(activeModule.id, activeModule.name)}
                    disabled={notifiedModules[activeModule.id]}
                    className="soon-btn-notify"
                  >
                    <Bell size={16} weight="bold" />
                    <span>
                      {notifiedModules[activeModule.id] ? 'Notification Active' : 'Notify Me When Added'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toast.success(`Preliminary syllabus for ${activeModule.name} downloaded.`);
                    }}
                    className="soon-btn-syllabus"
                  >
                    <DownloadSimple size={16} weight="bold" />
                    <span>Download Syllabus (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Column: Quick Links & FAQs */}
        <aside className="training-right-sidebar">
          {/* Quick Links Card */}
          <div className="training-quick-links-card">
            <h3 className="quick-links-heading">Quick Links</h3>
            <div className="quick-links-list">
              <button
                type="button"
                onClick={() => {
                  setSelectedModuleId(1);
                  setSelectedLessonId('1.1');
                }}
                className="quick-link-row"
              >
                <div className="quick-link-icon-box blue">
                  <Play size={16} weight="fill" />
                </div>
                <div className="quick-link-text">
                  <strong className="ql-title">Video Tutorials</strong>
                  <span className="ql-desc">Watch short videos</span>
                </div>
                <CaretRight size={14} className="ql-arrow" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedModuleId(7);
                  setSelectedLessonId('7.2');
                }}
                className="quick-link-row"
              >
                <div className="quick-link-icon-box orange">
                  <FileText size={16} weight="fill" />
                </div>
                <div className="quick-link-text">
                  <strong className="ql-title">Step-by-Step Guides</strong>
                  <span className="ql-desc">Detailed walkthroughs</span>
                </div>
                <CaretRight size={14} className="ql-arrow" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('training-faqs-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="quick-link-row"
              >
                <div className="quick-link-icon-box emerald">
                  <Question size={16} weight="bold" />
                </div>
                <div className="quick-link-text">
                  <strong className="ql-title">Frequently Asked Questions</strong>
                  <span className="ql-desc">Find instant answers</span>
                </div>
                <CaretRight size={14} className="ql-arrow" />
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success('Downloading Prince Constructions User Manual (PDF)...');
                }}
                className="quick-link-row"
              >
                <div className="quick-link-icon-box teal">
                  <DownloadSimple size={16} weight="bold" />
                </div>
                <div className="quick-link-text">
                  <strong className="ql-title">Download User Manual</strong>
                  <span className="ql-desc">PDF guide for offline use</span>
                </div>
                <CaretRight size={14} className="ql-arrow" />
              </button>
            </div>
          </div>

          {/* Frequently Asked Questions Card */}
          <div id="training-faqs-anchor" className="training-faqs-card">
            <div className="faqs-head-row">
              <h3 className="faqs-heading">Frequently Asked Questions</h3>
              <button
                type="button"
                onClick={() => toast.info('Displaying all 6 core ERP FAQs.')}
                className="faqs-view-all"
              >
                View All
              </button>
            </div>

            <div className="faqs-list-stack">
              {trainingData.faqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <div key={faq.id} className="faq-accordion-item">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                      className="faq-question-btn"
                    >
                      <span>{faq.question}</span>
                      <CaretRight
                        size={14}
                        weight="bold"
                        className={`faq-arrow-icon ${isOpen ? 'is-open' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="faq-answer-body">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TrainingCenter;
