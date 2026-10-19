'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Buildings,
  ArrowRight,
  ShieldCheck,
  EnvelopeSimple,
  LockSimple,
  Eye,
  EyeSlash,
  CheckCircle,
  HardHat,
  ChartLineUp,
  Package,
  Receipt,
  UsersThree,
  Sparkle,
} from '@phosphor-icons/react';
import { loginSchema } from '@/schemas';
import { auth } from '@/lib/api';
import { BRAND_CONFIG } from '@/lib/config';
import { useSession } from '../providers';

interface DemoRole {
  role: string;
  title: string;
  subtitle: string;
  email: string;
  icon: React.ComponentType<any>;
}

const DEMO_ROLES: DemoRole[] = [
  {
    role: 'admin',
    title: 'Administrator',
    subtitle: 'Full access to entire ERP & settings',
    email: 'admin@civil.example',
    icon: ShieldCheck,
  },
  {
    role: 'owner',
    title: 'Owner / Director',
    subtitle: 'Full administrative & financial oversight',
    email: 'owner@civil.example',
    icon: Buildings,
  },
  {
    role: 'manager',
    title: 'Project Manager',
    subtitle: 'Budgets, schedules & site diary approvals',
    email: 'manager@civil.example',
    icon: ChartLineUp,
  },
  {
    role: 'supervisor',
    title: 'Site Supervisor',
    subtitle: 'Daily DPRs, site attendance & requests',
    email: 'supervisor@civil.example',
    icon: HardHat,
  },
  {
    role: 'store',
    title: 'Store Manager',
    subtitle: 'Inventory inward, stock transfer & GRN',
    email: 'store@civil.example',
    icon: Package,
  },
  {
    role: 'purchase',
    title: 'Purchase Officer',
    subtitle: 'Vendor orders, RFQs & requisitions',
    email: 'purchase@civil.example',
    icon: Receipt,
  },
  {
    role: 'accounts',
    title: 'Finance / Accounts',
    subtitle: 'Vouchers, day-book, TDS/GST & bills',
    email: 'accounts@civil.example',
    icon: Receipt,
  },
  {
    role: 'contractor',
    title: 'Contractor',
    subtitle: 'Measurement sheets & running bills',
    email: 'contractor@civil.example',
    icon: UsersThree,
  },
  {
    role: 'client',
    title: 'Client / Investor',
    subtitle: 'Client billing portal & project status',
    email: 'client@civil.example',
    icon: Buildings,
  },
];

export function AuthScreen({ reset = false }: { reset?: boolean }) {
  const [ready, setReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => setReady(true), []);
  const router = useRouter();
  const query = useQueryClient();
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  // If already authenticated, redirect straight to the dashboard
  useEffect(() => {
    if (!sessionLoading && sessionUser) {
      router.replace('/');
    }
  }, [sessionUser, sessionLoading, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@civil.example', password: 'demo' },
  });

  const currentEmail = watch('email');

  useEffect(() => {
    const matched = DEMO_ROLES.find((r) => r.email === currentEmail);
    if (matched) setSelectedRole(matched.role);
    else setSelectedRole('');
  }, [currentEmail]);

  async function submit(values: { email: string; password: string }) {
    setPending(true);
    setError('');
    try {
      if (reset) {
        const result = await auth.reset(values.email);
        setMessage(result.message);
      } else {
        const user = await auth.login(values.email, values.password);
        await query.cancelQueries();
        query.removeQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
        query.setQueryData(['session'], user);
        // Always redirect directly to the dashboard
        router.push('/');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  const handleSelectRole = (r: DemoRole) => {
    setSelectedRole(r.role);
    setValue('email', r.email, { shouldValidate: true });
    setValue('password', 'demo', { shouldValidate: true });
  };

  return (
    <main className="auth-layout">
      {/* 1. Left Showcase / Story Panel */}
      <section className="auth-story-panel">
        <div className="auth-story-bg-glow" />

        {/* Brand Header */}
        <div className="auth-story-top">
          <div className="auth-brand-badge">
            <div className="auth-brand-icon">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt={BRAND_CONFIG.name}
                className="auth-brand-logo-img"
              />
            </div>
            <div className="auth-brand-text">
              <span className="auth-brand-title">{BRAND_CONFIG.name.toUpperCase()}</span>
              <span className="auth-brand-tag">{BRAND_CONFIG.tagline}</span>
            </div>
          </div>
        </div>

        {/* Center Hero Information */}
        <div className="auth-story-center">
          <div className="auth-eyebrow-pill">
            <Sparkle size={13} weight="fill" />
            <span>{BRAND_CONFIG.tagline}</span>
          </div>

          <h1 className="auth-headline">
            Master your sites, cash flows, and materials in one unified workspace.
          </h1>

          <p className="auth-subtext">
            From daily site diaries and GPS photo tracking to contractor running bills and GST accounting—designed specifically for {BRAND_CONFIG.name} civil & engineering teams.
          </p>

          {/* Interactive Live Site Telemetry Card */}
          <div className="auth-telemetry-card">
            <div className="telemetry-card-header">
              <div className="telemetry-live-dot">
                <span className="live-ping" />
                <span className="live-core" />
              </div>
              <span className="telemetry-header-text">Live Site Network • 18 Active Sites</span>
            </div>

            <div className="telemetry-stats-grid">
              <div className="telemetry-stat-item">
                <span className="telemetry-stat-label">Monthly Billing</span>
                <strong className="telemetry-stat-value">₹ 1.22 Cr</strong>
                <span className="telemetry-stat-change">+18% this month</span>
              </div>
              <div className="telemetry-stat-item">
                <span className="telemetry-stat-label">Material Inward</span>
                <strong className="telemetry-stat-value">99.4%</strong>
                <span className="telemetry-stat-change">Verified GRNs</span>
              </div>
              <div className="telemetry-stat-item">
                <span className="telemetry-stat-label">Bill Clearances</span>
                <strong className="telemetry-stat-value">4.2 hrs</strong>
                <span className="telemetry-stat-change">Avg. turnaround</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="auth-story-bottom">
          <div className="auth-trust-badges">
            <span className="trust-item">
              <CheckCircle size={14} weight="fill" className="text-emerald-400" />
              <span>Offline Field Sync</span>
            </span>
            <span className="trust-sep">•</span>

          </div>
          <small className="auth-copyright">{BRAND_CONFIG.legalName} • {BRAND_CONFIG.tagline}</small>
        </div>
      </section>

      {/* 2. Right Form Panel */}
      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          {/* Mobile-only brand header */}
          <div className="auth-mobile-brand">
            <div className="mobile-brand-icon">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt={BRAND_CONFIG.name}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div>
              <strong className="mobile-brand-title">{BRAND_CONFIG.name.toUpperCase()}</strong>
              <span className="mobile-brand-subtitle">{BRAND_CONFIG.tagline}</span>
            </div>
          </div>

          <div className="auth-form-header">
            <div className="auth-form-icon-box">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt={BRAND_CONFIG.name}
                className="w-10 h-10 object-contain rounded-lg"
              />
            </div>
            <h2 className="auth-form-title">{reset ? 'Reset your password' : 'Welcome back'}</h2>
            <p className="auth-form-subtitle">
              {reset
                ? 'Enter your work email address to receive password reset instructions.'
                : 'Sign in to access your sites, bills, inventory, and accounts.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="auth-credentials-form">
            {/* Email Field */}
            <div className="auth-input-group">
              <label htmlFor="auth-email" className="auth-input-label">
                Work Email Address
              </label>
              <div className="auth-input-container">
                <EnvelopeSimple size={18} className="auth-input-icon" />
                <input
                  id="auth-email"
                  {...register('email')}
                  disabled={!ready || pending}
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="username"
                  className={`auth-text-input ${errors.email ? 'has-error' : ''}`}
                />
              </div>
              {errors.email && <span className="auth-error-msg">{errors.email.message}</span>}
            </div>

            {/* Password Field */}
            {!reset && (
              <div className="auth-input-group">
                <div className="auth-password-label-row">
                  <label htmlFor="auth-password" className="auth-input-label">
                    Password
                  </label>
                  <Link href="/reset-password" className="auth-forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="auth-input-container">
                  <LockSimple size={18} className="auth-input-icon" />
                  <input
                    id="auth-password"
                    {...register('password')}
                    disabled={!ready || pending}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className={`auth-text-input ${errors.password ? 'has-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="auth-error-msg">{errors.password.message}</span>}
              </div>
            )}

            {/* Remember me row */}
            {!reset && (
              <div className="auth-remember-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="auth-checkbox-input"
                  />
                  <span className="auth-checkbox-text">Keep me signed in for 30 days</span>
                </label>
              </div>
            )}

            {error && (
              <div role="alert" className="auth-alert-error">
                {error}
              </div>
            )}

            {message && (
              <div role="status" className="auth-alert-success">
                {message}
              </div>
            )}

            <button
              disabled={pending || !ready}
              type="submit"
              className="auth-primary-submit-btn"
            >
              <span>{pending ? 'Signing in…' : reset ? 'Send Reset Link' : 'Sign In to Workspace'}</span>
              <ArrowRight size={18} weight="bold" />
            </button>
          </form>

          {reset && (
            <Link className="auth-back-signin-link" href="/login">
              ← Back to Sign In
            </Link>
          )}

          {/* Clean Demo Workspace Switcher */}
          {!reset && (
            <div className="auth-demo-switcher-card">
              <div className="demo-switcher-header">
                <div className="demo-header-title-box">
                  <ShieldCheck size={16} weight="fill" className="text-blue-600" />
                  <strong>Demo Accounts by Role</strong>
                </div>
                <span className="demo-password-hint">
                  password: <code>demo</code>
                </span>
              </div>
              <p className="demo-switcher-desc">
                Click any role below to prefill credentials and explore simulated permissions:
              </p>

              <div className="demo-role-grid">
                {DEMO_ROLES.map((r) => {
                  const isSelected = selectedRole === r.role;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`demo-role-pill-btn ${isSelected ? 'is-selected' : ''}`}
                      title={`${r.title} (${r.email}) - ${r.subtitle}`}
                    >
                      <Icon
                        size={14}
                        weight={isSelected ? 'fill' : 'regular'}
                        className="demo-pill-icon"
                      />
                      <span className="demo-pill-title">{r.title}</span>
                    </button>
                  );
                })}
              </div>

              {selectedRole && (
                <div className="demo-role-active-info">
                  <span className="active-role-tag">Selected:</span>
                  <span className="active-role-desc">
                    <span className="font-semibold">{DEMO_ROLES.find((r) => r.role === selectedRole)?.email}</span> —{' '}
                    {DEMO_ROLES.find((r) => r.role === selectedRole)?.subtitle}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="auth-footer-security">
            <ShieldCheck size={14} weight="fill" className="text-emerald-500" />
            <span>256-Bit SSL Encrypted Enterprise Workspace</span>
          </div>
        </div>
      </section>
    </main>
  );
}
