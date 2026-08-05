import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Employee, AiPerformanceAnalysisResult } from '../../types';
import { Sparkles, Award, Star, CheckCircle, AlertTriangle, Target, Compass, RefreshCw } from 'lucide-react';

export const AiFeedbackGenerator: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [technicalScore, setTechnicalScore] = useState(8);
  const [communicationScore, setCommunicationScore] = useState(7);
  const [teamworkScore, setTeamworkScore] = useState(9);
  const [projectsCompleted, setProjectsCompleted] = useState(5);
  const [existingFeedback, setExistingFeedback] = useState('High velocity engineer with strong technical deliverables.');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiPerformanceAnalysisResult | null>(null);

  useEffect(() => {
    api.getEmployees().then((emps) => {
      setEmployees(emps);
      if (emps.length > 0) setSelectedEmpId(emps[0].id);
    });
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generatePerformanceFeedback({
        employeeId: selectedEmpId,
        technicalScore,
        communicationScore,
        teamworkScore,
        projectsCompleted,
        feedback: existingFeedback,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedEmp = employees.find((e) => e.id === selectedEmpId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-6 rounded-3xl text-white shadow-xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
            <Sparkles className="h-4 w-4" />
            <span>AI Employee Performance & Appraisal Generator</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Performance Feedback AI</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Input performance scores for technical capability, communication, and completed projects. Gemini generates comprehensive employee strengths, growth opportunities, a 30-60-90 day development plan, and career trajectory suggestions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Award className="h-4 w-4 text-indigo-400" />
            <span>Employee Evaluation Parameters</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Employee</label>
              <select
                id="select-ai-emp-feedback"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.designation})
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders for scores */}
            <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Technical Skill Rating:</span>
                  <span className="text-indigo-400 font-extrabold">{technicalScore} / 10</span>
                </div>
                <input
                  id="slider-tech-score"
                  type="range"
                  min="1"
                  max="10"
                  value={technicalScore}
                  onChange={(e) => setTechnicalScore(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Communication Rating:</span>
                  <span className="text-purple-400 font-extrabold">{communicationScore} / 10</span>
                </div>
                <input
                  id="slider-comm-score"
                  type="range"
                  min="1"
                  max="10"
                  value={communicationScore}
                  onChange={(e) => setCommunicationScore(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Teamwork Rating:</span>
                  <span className="text-emerald-400 font-extrabold">{teamworkScore} / 10</span>
                </div>
                <input
                  id="slider-team-score"
                  type="range"
                  min="1"
                  max="10"
                  value={teamworkScore}
                  onChange={(e) => setTeamworkScore(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Completed Projects Count</label>
                <input
                  id="input-ai-projects-count"
                  type="number"
                  min="0"
                  value={projectsCompleted}
                  onChange={(e) => setProjectsCompleted(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Evaluator Notes / Context</label>
              <textarea
                id="input-ai-eval-notes"
                rows={3}
                value={existingFeedback}
                onChange={(e) => setExistingFeedback(e.target.value)}
                placeholder="Additional notes about employee performance..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
              />
            </div>

            <button
              id="btn-generate-ai-feedback-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 transition text-sm transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 text-amber-200" />
              <span>{loading ? 'Generating AI Development Report...' : 'Generate AI Performance Appraisal'}</span>
            </button>
          </form>
        </div>

        {/* Output Results */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800/90 shadow-xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Generated Performance & Growth Report</span>
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="h-8 w-8 text-amber-400 animate-spin" />
                <p className="text-xs font-semibold text-slate-400">Generating employee feedback blueprint with Gemini...</p>
              </div>
            ) : !result ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Award className="h-12 w-12 mx-auto text-slate-600" />
                <p className="text-xs font-semibold">Click "Generate AI Performance Appraisal" to generate report</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-4 rounded-2xl border border-amber-500/30">
                  <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider mb-1">
                    Appraisal Executive Summary ({selectedEmp?.fullName})
                  </span>
                  <p className="text-slate-200 leading-relaxed font-medium">{result.executiveSummary}</p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center space-x-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Key Employee Strengths</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-slate-300 font-medium">
                    {result.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Growth Areas (Weaknesses) */}
                <div>
                  <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center space-x-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Growth Opportunities</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-slate-300 font-medium">
                    {result.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                {/* 30-60-90 Day Plan */}
                <div>
                  <h4 className="font-extrabold text-indigo-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center space-x-1">
                    <Target className="h-3.5 w-3.5 text-indigo-400" />
                    <span>30-60-90 Day Actionable Development Plan</span>
                  </h4>
                  <ul className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-slate-300">
                    {result.improvementPlan.map((plan, idx) => (
                      <li key={idx} className="font-medium">
                        • {plan}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Career Trajectory */}
                <div>
                  <h4 className="font-extrabold text-purple-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center space-x-1">
                    <Compass className="h-3.5 w-3.5 text-purple-400" />
                    <span>Long-Term Promotion & Career Trajectory</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-purple-300 font-medium">
                    {result.careerSuggestions.map((sugg, idx) => (
                      <li key={idx}>{sugg}</li>
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
