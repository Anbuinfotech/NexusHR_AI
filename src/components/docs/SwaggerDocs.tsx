import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FileCode, Lock, Server, Sparkles, Terminal, Copy, Check } from 'lucide-react';

export const SwaggerDocs: React.FC = () => {
  const [swaggerJson, setSwaggerJson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api-docs/swagger.json')
      .then((res) => res.json())
      .then((data) => setSwaggerJson(data))
      .catch((err) => console.error('Failed to load swagger spec:', err))
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user & issue JWT Bearer token', role: 'PUBLIC' },
    { method: 'POST', path: '/api/auth/register', desc: 'Register new user account (Employee/HR/Admin)', role: 'PUBLIC' },
    { method: 'GET', path: '/api/employees', desc: 'Retrieve paginated workforce employee list', role: 'EMPLOYEE, HR, ADMIN' },
    { method: 'POST', path: '/api/employees', desc: 'Create new employee profile in database', role: 'HR, ADMIN' },
    { method: 'GET', path: '/api/departments', desc: 'List enterprise departments & budget allocations', role: 'EMPLOYEE, HR, ADMIN' },
    { method: 'POST', path: '/api/departments', desc: 'Create department & manager assignment', role: 'ADMIN' },
    { method: 'GET', path: '/api/attendance', desc: 'Get attendance logs and monthly calculations', role: 'EMPLOYEE, HR, ADMIN' },
    { method: 'POST', path: '/api/attendance/check-in', desc: 'Self check-in / check-out for current user', role: 'EMPLOYEE' },
    { method: 'GET', path: '/api/leaves', desc: 'Get leave application records', role: 'EMPLOYEE, HR, ADMIN' },
    { method: 'POST', path: '/api/leaves', desc: 'Submit new leave request', role: 'EMPLOYEE' },
    { method: 'PUT', path: '/api/leaves/:id/status', desc: 'Approve or Reject leave application', role: 'HR, ADMIN' },
    { method: 'GET', path: '/api/performance', desc: 'Fetch employee performance reviews & ratings', role: 'EMPLOYEE, HR, ADMIN' },
    { method: 'POST', path: '/api/performance', desc: 'Submit performance appraisal & AI analysis', role: 'HR, ADMIN' },
    { method: 'POST', path: '/api/ai/resume-analyze', desc: 'Gemini 3.6 Flash resume skill extraction & scoring', role: 'ALL' },
    { method: 'POST', path: '/api/ai/performance-feedback', desc: 'Gemini 3.6 Flash employee development plan generator', role: 'ALL' },
    { method: 'GET', path: '/api/analytics/dashboard', desc: 'Get overall HR metrics & attendance velocity', role: 'ALL' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-6 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold mb-1">
            <Server className="h-4 w-4" />
            <span>OpenAPI 3.0 / Swagger Specification</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">REST API Documentation</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Enterprise OpenAPI specification with JWT bearer authorization, Spring Security role rules, and server-side Gemini endpoints.
          </p>
        </div>

        <a
          href="/api-docs/swagger.json"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/40 flex items-center space-x-2 transition self-start md:self-auto transform hover:-translate-y-0.5"
        >
          <FileCode className="h-4 w-4" />
          <span>Raw swagger.json</span>
        </a>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-slate-900/90 rounded-3xl p-6 text-slate-100 border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
            <Terminal className="h-4 w-4" />
            <span>cURL Authentication Example</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Authorization: Bearer &lt;JWT_TOKEN&gt;</span>
        </div>

        <pre className="bg-slate-950 p-4 rounded-2xl overflow-x-auto text-[11px] font-mono text-emerald-400 border border-slate-800 shadow-inner">
{`curl -X POST http://localhost:3000/api/ai/resume-analyze \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -d '{
        "targetRole": "Senior Spring Boot Engineer",
        "resumeText": "5+ years experience in Java 21, Spring Boot 3, Microservices..."
      }'`}
        </pre>
      </div>

      {/* Endpoints Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">API Route Specification ({endpoints.length} Endpoints)</h3>
          <span className="text-xs text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
            JWT Bearer Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Method</th>
                <th className="p-4">Endpoint Path</th>
                <th className="p-4">Description</th>
                <th className="p-4">RBAC Permission</th>
                <th className="p-4 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {endpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] border ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : ep.method === 'PUT'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{ep.path}</td>
                  <td className="p-4 text-slate-300 font-sans">{ep.desc}</td>
                  <td className="p-4 font-sans text-indigo-400 font-semibold text-[11px]">{ep.role}</td>
                  <td className="p-4 text-right font-sans">
                    <button
                      id={`btn-copy-ep-${idx}`}
                      onClick={() => copyToClipboard(ep.path, `ep-${idx}`)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Copy Path"
                    >
                      {copiedEndpoint === `ep-${idx}` ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
