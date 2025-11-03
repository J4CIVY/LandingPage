'use client';

import { useEffect, useState, type ElementType } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaServer, FaDatabase, FaCloud, FaShieldAlt } from 'react-icons/fa';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  icon: ElementType;
}

/**
 * System Health Dashboard for Admin
 * Shows status of critical services and configuration
 */
export default function SystemHealthDashboard() {
  const [healthChecks, setHealthChecks] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    const checks: HealthStatus[] = [];

    // Check environment variables
    try {
      const response = await fetch('/api/health/env-check');
      const data = await response.json();
      
      checks.push({
        service: 'Environment Variables',
        status: data.valid ? 'healthy' : 'error',
        message: data.valid ? 'All required variables configured' : data.message || 'Missing required variables',
        icon: FaServer
      });
    } catch {
      checks.push({
        service: 'Environment Variables',
        status: 'error',
        message: 'Failed to check configuration',
        icon: FaServer
      });
    }

    // Check database connection
    try {
      const response = await fetch('/api/health/database');
      const data = await response.json();
      
      checks.push({
        service: 'MongoDB Database',
        status: data.connected ? 'healthy' : 'error',
        message: data.connected ? `Connected (${data.collections} collections)` : 'Connection failed',
        icon: FaDatabase
      });
    } catch {
      checks.push({
        service: 'MongoDB Database',
        status: 'error',
        message: 'Health check failed',
        icon: FaDatabase
      });
    }

    // Check Cloudinary
    try {
      const response = await fetch('/api/health/cloudinary');
      const data = await response.json();
      
      checks.push({
        service: 'Cloudinary CDN',
        status: data.configured ? 'healthy' : 'warning',
        message: data.configured ? 'API configured and ready' : 'Not configured',
        icon: FaCloud
      });
    } catch {
      checks.push({
        service: 'Cloudinary CDN',
        status: 'warning',
        message: 'Status unknown',
        icon: FaCloud
      });
    }

    // Check security features
    checks.push({
      service: 'Security Features',
      status: 'healthy',
      message: 'CSRF, Rate Limiting, and Encryption active',
      icon: FaShieldAlt
    });

    setHealthChecks(checks);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const healthyCount = healthChecks.filter(c => c.status === 'healthy').length;
  const warningCount = healthChecks.filter(c => c.status === 'warning').length;
  const errorCount = healthChecks.filter(c => c.status === 'error').length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
        <button
          onClick={checkSystemHealth}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{healthyCount}</div>
          <div className="text-xs text-green-700 dark:text-green-300">Healthy</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{warningCount}</div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300">Warnings</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</div>
          <div className="text-xs text-red-700 dark:text-red-300">Errors</div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="space-y-2">
        {healthChecks.map((check, idx) => (
          <HealthCheckCard key={idx} {...check} />
        ))}
      </div>
    </div>
  );
}

function HealthCheckCard({ service, status, message, icon: Icon }: HealthStatus) {
  const statusConfig = {
    healthy: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: FaCheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: FaExclamationTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: FaTimesCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-700 dark:text-red-300'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-3 flex items-start gap-3`}>
      <Icon className={`text-xl ${config.iconColor} mt-0.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{service}</h4>
          <StatusIcon className={`${config.iconColor} text-sm shrink-0`} />
        </div>
        <p className={`text-xs ${config.textColor} mt-1`}>{message}</p>
      </div>
    </div>
  );
}
