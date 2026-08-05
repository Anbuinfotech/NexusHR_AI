import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Department } from '../../types';
import { Building, Plus, Users, DollarSign, Edit, CheckCircle, AlertCircle, X } from 'lucide-react';

export const DepartmentList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [managerName, setManagerName] = useState('');
  const [budget, setBudget] = useState(300000);

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setDepartmentName('');
    setDescription('Core strategic focus and business execution division.');
    setManagerName('Alex Mercer');
    setBudget(400000);
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setDepartmentName(dept.departmentName);
    setDescription(dept.description);
    setManagerName(dept.managerName);
    setBudget(dept.budget);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertMsg(null);

    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, {
          departmentName,
          description,
          managerName,
          budget: Number(budget),
        });
        setAlertMsg({ type: 'success', text: 'Department updated successfully' });
      } else {
        await api.createDepartment({
          departmentName,
          description,
          managerName,
          budget: Number(budget),
        });
        setAlertMsg({ type: 'success', text: 'New department created successfully' });
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Department operation failed' });
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
            <Building className="h-6 w-6 text-indigo-400" />
            <span>Department Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize business units, track headcounts, and allocate department budgets.
          </p>
        </div>

        {isAdmin && (
          <button
            id="btn-add-department-modal"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center space-x-2 transition self-start sm:self-auto transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
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
            {alertMsg.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
            <span className="font-semibold">{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold text-base">×</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-slate-900/90 rounded-3xl border border-slate-800/90 p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition duration-300 group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition duration-300">
                    <Building className="h-6 w-6" />
                  </div>
                  {isAdmin && (
                    <button
                      id={`btn-edit-dept-${dept.id}`}
                      onClick={() => openEditModal(dept)}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{dept.departmentName}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{dept.description}</p>

                <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium text-slate-400">Department Head:</span>
                    <span className="font-bold text-white">{dept.managerName}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium flex items-center space-x-1.5 text-slate-400">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Headcount:</span>
                    </span>
                    <span className="font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                      {dept.employeeCount || 0} employees
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium flex items-center space-x-1.5 text-slate-400">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Annual Budget:</span>
                    </span>
                    <span className="font-extrabold text-emerald-400">${dept.budget?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Department Name *</label>
                <input
                  id="modal-dept-name"
                  type="text"
                  required
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Data Analytics"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  id="modal-dept-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Department Head / Manager</label>
                <input
                  id="modal-dept-manager"
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Manager Full Name"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Annual Budget Allocation ($)</label>
                <input
                  id="modal-dept-budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-dept"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm"
                >
                  {submitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
