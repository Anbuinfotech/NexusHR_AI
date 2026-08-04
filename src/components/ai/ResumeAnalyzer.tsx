import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ResumeAnalysisResult, Employee } from '../../types';
import { FileText, Sparkles, Upload, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';

const SAMPLE_RESUMES = [
  {
    title: 'Senior Java & Spring Boot Developer Resume',
    role: 'Senior Java Backend Engineer',
    text: `ALEXANDER VANCE
Email: alex.vance@example.com | Phone: +1 555-019-2831

SUMMARY:
Results-driven Senior Java Developer with 6+ years of experience designing and implementing scalable enterprise microservices using Java 21, Spring Boot 3, Spring Data JPA, Hibernate, PostgreSQL, and REST APIs. Strong background in unit testing (JUnit, Mockito) and continuous integration pipelines.

TECHNICAL SKILLS:
Languages & Frameworks: Java 17/21, Spring Boot 3, Spring Security, JWT, Hibernate, JPA, React 19, TypeScript
Databases & Tools: PostgreSQL, MySQL, Redis, Docker, Git, Maven, Gradle, RESTful Web Services, Swagger OpenAPI

EXPERIENCE:
Lead Backend Engineer | Enterprise SaaS Corp (2022 - Present)
- Architected RESTful microservices for high-throughput HR analytics platforms handling over 50k daily active users.
- Implemented JWT authentication and role-based access control (RBAC) across 15+ microservices.
- Optimized database queries in PostgreSQL, reducing average response latency by 35%.`,
  },
  {
    title: 'HR Talent & Recruitment Specialist Resume',
    role: 'Senior HR Manager',
    text: `SARAH JENKINS
Email: sjenkins@hr-enterprise.com | Location: New York, NY

SUMMARY:
Strategic HR Professional with 7 years of expertise in talent acquisition, employee onboarding, performance appraisal design, conflict resolution, and HRIS data analytics.

SKILLS:
HR Analytics, Performance Reviews, Talent Acquisition, Labor Law Compliance, Employee Relations, Strategic Workforce Planning, Compensation & Benefits.`,
  },
];

export const ResumeAnalyzer: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].text);
  const [targetRole, setTargetRole] = useState(SAMPLE_RESUMES[0].role);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getEmployees().then((data) => {
      setEmployees(data);
      if (data.length > 0) setSelectedEmpId(data[0].id);
    }).catch(console.error);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setLoading(true);
    setError(null);
    setSavedMsg(null);
    try {
      const res = await api.analyzeResume(resumeText, targetRole, selectedEmpId || undefined);
      setResult(res);
      const matchedEmp = employees.find((emp) => emp.id === selectedEmpId);
      if (matchedEmp) {
        setSavedMsg(`Analysis attached to profile of ${matchedEmp.fullName} in DB!`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume with AI');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setResumeText(text);
      }
    };
    reader.readAsText(file);
  };

  const loadSample = (sample: typeof SAMPLE_RESUMES[0]) => {
    setResumeText(sample.text);
    setTargetRole(sample.role);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 p-6 rounded-3xl text-white shadow-xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Server-Side Gemini 3.6 Flash Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">AI Resume Analyzer</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Upload candidate resumes or paste plain text. Select an employee to save extracted skills and analysis directly to their database profile.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-col gap-1.5 self-start md:self-auto">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Load Sample Resumes:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_RESUMES.map((sample, idx) => (
              <button
                key={idx}
                id={`btn-load-sample-${idx}`}
                onClick={() => loadSample(sample)}
                className="px-3 py-1.5 text-[11px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl transition transform hover:-translate-y-0.5"
              >
                {sample.role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form Input */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Resume & Target Role Input</span>
            </h3>

            <label className="cursor-pointer text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1.5 transition">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload TXT File</span>
              <input type="file" accept=".txt,.md,.text" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Select Employee Profile in Database *</span>
                <span className="text-[10px] text-indigo-400 font-semibold">{employees.length} employees available</span>
              </label>
              <select
                id="select-ai-employee"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">-- General Candidate / Unassigned --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.designation} - {emp.departmentName || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Job Position *</label>
              <input
                id="input-ai-target-role"
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Java Backend Engineer"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Paste Resume Content *</label>
              <textarea
                id="textarea-ai-resume-text"
                required
                rows={10}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate resume plain text here..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
              />
            </div>

            {error && <div className="p-3.5 bg-red-950/80 text-red-300 text-xs rounded-xl border border-red-500/30 font-semibold">{error}</div>}

            <button
              id="btn-analyze-resume-ai"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 transition text-sm transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{loading ? 'Analyzing with Gemini 3.6 Flash...' : 'Run AI Resume Analysis'}</span>
            </button>
          </form>
        </div>

        {/* Right Output Results */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800/90 shadow-xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>AI Analysis Results</span>
              </h3>
              {result && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Evaluated Role: {result.evaluatedRole}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-xs font-semibold text-slate-400">Extracting skills & evaluating profile against Gemini model...</p>
              </div>
            ) : !result ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <FileText className="h-12 w-12 mx-auto text-slate-600" />
                <p className="text-xs font-semibold">Click "Run AI Resume Analysis" to generate evaluation report</p>
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* Score Gauge */}
                <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 font-medium block text-xs">Match Fit Score:</span>
                    <h2 className="text-3xl font-black text-indigo-400 mt-0.5 tracking-tight">{result.matchScore}%</h2>
                    <span className="text-[11px] font-bold text-purple-400">Assessed Level: {result.experienceLevel}</span>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-900/40">
                    {result.matchScore >= 80 ? 'A+' : result.matchScore >= 70 ? 'B' : 'C'}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Executive Summary</h4>
                  <p className="text-slate-200 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-medium">
                    {result.summary}
                  </p>
                </div>

                {/* Skills Found */}
                <div>
                  <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center space-x-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Identified Skills ({result.skills?.length || 0})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skills?.map((s, idx) => (
                      <span key={idx} className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-semibold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center space-x-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Missing Skills for Target Role ({result.missingSkills?.length || 0})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills?.map((s, idx) => (
                      <span key={idx} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl font-semibold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <h4 className="font-extrabold text-indigo-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center space-x-1">
                    <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Career Improvement Roadmap</span>
                  </h4>
                  <ul className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-slate-300">
                    {result.suggestions?.map((sugg, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <ArrowRight className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                        <span>{sugg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
