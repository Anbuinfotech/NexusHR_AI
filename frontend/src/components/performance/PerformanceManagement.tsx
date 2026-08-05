import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PerformanceReview, Employee, AiPerformanceAnalysisResult } from '../../types';
import { Award, Plus, Sparkles, CheckCircle2, Star, TrendingUp, X, AlertCircle } from 'lucide-react';

export const PerformanceManagement: React.FC = () => {
  const { user, employee } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Review Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [technicalScore, setTechnicalScore] = useState(8);
  const [communicationScore, setCommunicationScore] = useState(8);
  const [teamworkScore, setTeamworkScore] = useState(9);
  const [projectsCompleted, setProjectsCompleted] = useState(6);
  const [feedback, setFeedback] = useState('Demonstrates exceptional problem-solving and architectural consistency.');

  // AI Generation State inside Modal
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiPerformanceAnalysisResult | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const data = await api.getPerformanceReviews();
      setReviews(data);
      const emps = await api.getEmployees();
      setEmployees(emps);
      if (emps.length > 0 && !selectedEmpId) {
        setSelectedEmpId(emps[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [user]);

  const handleGenerateAiFeedback = async () => {
    setGeneratingAi(true);
    try {
      const result = await api.generatePerformanceFeedback({
        employeeId: selectedEmpId,
        technicalScore,
        communicationScore,
        teamworkScore,
        projectsCompleted,
        feedback,
      });
      setAiResult(result);
    } catch (err: any) {
      console.error('AI generation failed:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertMsg(null);
    try {
      await api.createPerformanceReview({
        employeeId: selectedEmpId,
        technicalScore,
        communicationScore,
        teamworkScore,
        projectsCompleted,
        feedback,
      });

      setAlertMsg({ type: 'success', text: 'Performance appraisal created successfully' });
      setShowModal(false);
      fetchPerformanceData();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to submit review' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2.5 tracking-tight">
            <Award className="h-6 w-6 text-indigo-400" />
            <span>Performance Reviews & Growth</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct multi-metric evaluations, rate employee skills, and generate AI development blueprints.
          </p>
        </div>

        {canManage && (
          <button
            id="btn-create-review-modal"
            onClick={() => {
              setAiResult(null);
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center space-x-2 transition self-start sm:self-auto transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Performance Review</span>
          </button>
        )}
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-lg ${
            alertMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' : 'bg-red-950/80 text-red-300 border-red-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
            <span className="font-semibold">{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold text-base">×</button>
        </div>
      )}

      {/* Reviews Cards List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl">
          No performance reviews found
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900/90 rounded-3xl border border-slate-800/90 p-6 shadow-xl space-y-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white tracking-tight">{rev.employeeName}</h3>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full font-bold">
                      Overall Rating: {rev.overallRating} / 5.0 ⭐
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluated by {rev.reviewerName} on {rev.reviewDate}
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs font-semibold">
                  <div className="text-center bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Technical</span>
                    <span className="text-indigo-400 font-extrabold">{rev.technicalScore}/10</span>
                  </div>
                  <div className="text-center bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Comm.</span>
                    <span className="text-purple-400 font-extrabold">{rev.communicationScore}/10</span>
                  </div>
                  <div className="text-center bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Teamwork</span>
                    <span className="text-emerald-400 font-extrabold">{rev.teamworkScore}/10</span>
                  </div>
                </div>
              </div>

              {/* Feedback Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Evaluator Feedback</h4>
                <p className="text-xs text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 font-medium leading-relaxed">
                  {rev.feedback}
                </p>
              </div>

              {/* AI Analysis Cards if available */}
              {(rev.aiStrengths || rev.aiImprovementPlan) && (
                <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl space-y-3 backdrop-blur-md">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Gemini AI Growth & Appraisal Insights</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {rev.aiStrengths && (
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="font-bold text-emerald-400 block mb-1">Key Strengths:</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {rev.aiStrengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rev.aiImprovementPlan && (
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="font-bold text-indigo-400 block mb-1">30-60-90 Day Plan:</span>
                        <p className="text-slate-300 whitespace-pre-line leading-relaxed">{rev.aiImprovementPlan}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Performance Review</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Select Employee *</label>
                <select
                  id="select-review-employee"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Technical (1-10)</label>
                  <input
                    id="input-tech-score"
                    type="number"
                    min="1"
                    max="10"
                    value={technicalScore}
                    onChange={(e) => setTechnicalScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Comm. (1-10)</label>
                  <input
                    id="input-comm-score"
                    type="number"
                    min="1"
                    max="10"
                    value={communicationScore}
                    onChange={(e) => setCommunicationScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Teamwork (1-10)</label>
                  <input
                    id="input-team-score"
                    type="number"
                    min="1"
                    max="10"
                    value={teamworkScore}
                    onChange={(e) => setTeamworkScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Projects Completed Count</label>
                <input
                  id="input-projects-count"
                  type="number"
                  value={projectsCompleted}
                  onChange={(e) => setProjectsCompleted(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300">Manager Evaluation Feedback</label>
                  <button
                    id="btn-ai-generate-appraisal"
                    type="button"
                    onClick={handleGenerateAiFeedback}
                    disabled={generatingAi}
                    className="text-amber-400 font-bold flex items-center space-x-1 hover:text-amber-300"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{generatingAi ? 'Generating AI Plan...' : 'AI Assist Feedback'}</span>
                  </button>
                </div>
                <textarea
                  id="input-review-feedback"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {aiResult && (
                <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30 space-y-2 text-amber-200">
                  <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Gemini AI Development Plan Generated</span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-amber-300">Strengths:</strong> {aiResult.strengths.join('; ')}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-indigo-300">Plan:</strong> {aiResult.improvementPlan.join(' ')}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-review"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-md transition"
                >
                  {submitting ? 'Submitting...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
