import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import trainingDataRaw from '../lib/training-data.json';
import { TrainingCenter } from '../components/features/training/training-center';
import type { TrainingData } from '../components/features/training/types';

const data = trainingDataRaw as unknown as TrainingData;

describe('Training Center Data Model', () => {
  it('contains all 10 training modules and 86 lessons', () => {
    expect(data.modules.length).toBe(10);
    expect(data.progress.totalLessons).toBe(86);
    const sidebarLessonsSum = data.modules.reduce((acc, m) => acc + (m.totalCount || 0), 0);
    expect(sidebarLessonsSum).toBe(92);
  });

  it('provides complete step-by-step guides for Accounting & Finance (Module 7)', () => {
    const accountsModule = data.modules.find((m) => m.id === 7);
    expect(accountsModule).toBeDefined();
    expect(accountsModule?.name).toBe('Accounting & Finance');
    expect(accountsModule?.status).toBe('ready');
    expect(accountsModule?.lessons).toBeDefined();
    expect(accountsModule?.lessons?.length).toBeGreaterThanOrEqual(14);

    // Verify key accounting workflows have step-by-step procedures
    const voucherLesson = accountsModule?.lessons?.find((l) => l.title.includes('Payment'));
    expect(voucherLesson?.steps).toBeDefined();
    expect(voucherLesson?.steps?.length).toBeGreaterThan(0);

    const tdsLesson = accountsModule?.lessons?.find((l) => l.title.includes('TDS'));
    expect(tdsLesson?.steps).toBeDefined();
    expect(tdsLesson?.steps?.length).toBeGreaterThan(0);
  });

  it('provides complete step-by-step guides for the 4 main modules (1, 2, 3, 4)', () => {
    const mainModuleIds = [1, 2, 3, 4];
    mainModuleIds.forEach((id) => {
      const mod = data.modules.find((m) => m.id === id);
      expect(mod).toBeDefined();
      expect(mod?.status).toBe('ready');
      expect(mod?.lessons).toBeDefined();
      expect(mod?.lessons?.length).toBeGreaterThan(0);
      expect(mod?.lessons?.[0].steps?.length).toBeGreaterThan(0);
    });
  });

  it('marks remaining modules (5, 6, 8, 9, 10) as coming_soon', () => {
    const upcomingModuleIds = [5, 6, 8, 9, 10];
    upcomingModuleIds.forEach((id) => {
      const mod = data.modules.find((m) => m.id === id);
      expect(mod).toBeDefined();
      expect(mod?.status).toBe('coming_soon');
      expect(mod?.upcomingTopics).toBeDefined();
      expect(mod?.upcomingTopics?.length).toBeGreaterThan(0);
    });
  });

  it('provides popular topics, quick links and frequently asked questions', () => {
    expect(data.popularTopics.length).toBe(6);
    expect(data.quickLinks.length).toBe(4);
    expect(data.faqs.length).toBe(6);
  });
});

describe('TrainingCenter UI Component', () => {
  it('renders complete training center layout with exact UI elements from design', () => {
    const html = renderToString(<TrainingCenter />);

    // Header & Toolbar
    expect(html).toContain('Training &amp; Help Center');
    expect(html).not.toContain('Request a Training');
    expect(html).toContain('Search training content...');

    // Welcome Card
    expect(html).toContain('Training Center');
    expect(html).toContain('Everything you need to learn and master');
    expect(html).toContain('Video Tutorials');
    expect(html).toContain('Step-by-Step Guides');
    expect(html).toContain('FAQs');
    expect(html).not.toContain('Live Training');

    // Progress Donut Card
    expect(html).toContain('Your Training Progress');
    expect(html).toContain('25%');
    expect(html).toContain('Complete');
    expect(html).toContain('Modules Completed');
    expect(html).toContain('Lessons Completed');
    expect(html).toContain('Learning Time');

    // Popular Topics
    expect(html).toContain('Popular Topics');
    expect(html).toContain('Getting Started');
    expect(html).toContain('Project Management');
    expect(html).toContain('Purchase &amp; Procurement');
    expect(html).toContain('Inventory Management');
    expect(html).toContain('Contractor &amp; Billing');
    expect(html).toContain('Accounting &amp; Finance');

    // Modules Sidebar
    expect(html).toContain('Training Modules');
    expect(html).toContain('1. Getting Started');
    expect(html).toContain('2. Organization Setup');
    expect(html).toContain('3. Project Management');
    expect(html).toContain('4. Procurement');
    expect(html).toContain('7. Accounting &amp; Finance');

    // Quick Links & FAQs
    expect(html).toContain('Quick Links');
    expect(html).toContain('Frequently Asked Questions');
    expect(html).toContain('How do I create a new project?');
    expect(html).toContain('How to raise a material request from site?');
  });
});
