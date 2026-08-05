import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Employee, Department } from '../../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const EmployeeList: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [salary, setSalary] = useState(120000);
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'TERMINATED'>('ACTIVE');
  const [profileImage, setProfileImage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees({ departmentId: selectedDept, search });
      setEmployees(data);
      const depts = await api.getDepartments();
      setDepartments(depts);
      if (!departmentId && depts.length > 0) {
        setDepartmentId(depts[0].id);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const openAddModal = () => {
    setEditingEmp(null);
    setFullName('');
    setEmail('');
    setPhone('+1 (555) 019-3388');
    setAddress('San Francisco, CA');
    setDesignation('Software Engineer');
    setSkillsStr('Java 21, Spring Boot, REST API');
    setSalary(125000);
    setStatus('ACTIVE');
    setProfileImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300');
    setShowAddModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFullName(emp.fullName);
    setEmail(emp.email);
    setPhone(emp.phone);
    setAddress(emp.address);
    setDesignation(emp.designation);
    setDepartmentId(emp.departmentId);
    setSkillsStr(emp.skills.join(', '));
    setSalary(emp.salary || 100000);
    setStatus(emp.status);
    setProfileImage(emp.profileImage);
    setShowAddModal(true);
  };

  const handleDelete = async (empId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee record?')) return;
    try {
      await api.deleteEmployee(empId);
      setAlertMsg({ type: 'success', text: 'Employee removed successfully' });
      fetchEmployees();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to delete employee' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertMsg(null);

    const skillsArr = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingEmp) {
        await api.updateEmployee(editingEmp.id, {
          fullName,
          email,
          phone,
          address,
          designation,
          departmentId,
          skills: skillsArr,
          salary: Number(salary),
          status,
          profileImage,
        });
        setAlertMsg({ type: 'success', text: 'Employee details updated successfully' });
      } else {
        await api.createEmployee({
          fullName,
          email,
          phone,
          address,
          designation,
          departmentId,
          skills: skillsArr,
          salary: Number(salary),
          profileImage,
        });
        setAlertMsg({ type: 'success', text: 'New employee added successfully' });
      }

      setShowAddModal(false);
      fetchEmployees();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Action failed' });
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
            <Users className="h-6 w-6 text-indigo-400" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and manage enterprise workforce profiles & department allocations.
          </p>
        </div>

        {canManage && (
          <button
            id="btn-add-employee-modal"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center space-x-2 transition self-start sm:self-auto transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Employee</span>
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

      {/* Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-search-employee"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, designation, or skills..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950/80 text-white border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            id="select-filter-department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs bg-slate-950/80 text-white border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Grid / Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-12 text-center text-slate-400 shadow-xl">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold">No employees found matching filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-slate-900/90 rounded-3xl border border-slate-800/90 p-5 shadow-xl hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={emp.profileImage}
                      alt={emp.fullName}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{emp.fullName}</h3>
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">{emp.designation}</p>
                      <span className="inline-block mt-1 text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold border border-slate-700">
                        {emp.departmentName || 'General'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      emp.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : emp.status === 'ON_LEAVE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 mb-4 border-t border-b border-slate-800 py-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Joined {emp.joiningDate}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mb-4">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Tech Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <button
                  id={`btn-view-${emp.id}`}
                  onClick={() => setViewingEmp(emp)}
                  className="text-slate-300 hover:text-indigo-400 font-semibold flex items-center space-x-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </button>

                {canManage && (
                  <div className="flex items-center space-x-2">
                    <button
                      id={`btn-edit-${emp.id}`}
                      onClick={() => openEditModal(emp)}
                      className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition"
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-delete-${emp.id}`}
                      onClick={() => handleDelete(emp.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-xl transition"
                      title="Delete Employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingEmp ? 'Edit Employee Record' : 'Add New Employee'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  id="modal-emp-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email *</label>
                  <input
                    id="modal-emp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone</label>
                  <input
                    id="modal-emp-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Designation</label>
                  <input
                    id="modal-emp-designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Department</label>
                  <select
                    id="modal-emp-department"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Skills (comma separated)</label>
                <input
                  id="modal-emp-skills"
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="Java, Spring Boot, PostgreSQL, Docker"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Annual Salary ($)</label>
                  <input
                    id="modal-emp-salary"
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Status</label>
                  <select
                    id="modal-emp-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-employee"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-md transition"
                >
                  {submitting ? 'Saving...' : editingEmp ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingEmp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Employee Details</h3>
              <button onClick={() => setViewingEmp(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              <img
                src={viewingEmp.profileImage}
                alt={viewingEmp.fullName}
                className="h-20 w-20 rounded-2xl mx-auto object-cover ring-2 ring-indigo-500/40 shadow-xl mb-2"
              />
              <h2 className="text-lg font-bold text-white">{viewingEmp.fullName}</h2>
              <p className="text-xs text-indigo-400 font-semibold">{viewingEmp.designation}</p>
              <span className="inline-block mt-1 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-bold">
                {viewingEmp.departmentName} Department
              </span>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Employee ID:</span>
                <span className="font-bold text-white">{viewingEmp.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Email Address:</span>
                <span className="font-bold text-white">{viewingEmp.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Phone Number:</span>
                <span className="font-bold text-white">{viewingEmp.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Joining Date:</span>
                <span className="font-bold text-white">{viewingEmp.joiningDate}</span>
              </div>
              {canManage && (
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Annual Compensation:</span>
                  <span className="font-bold text-emerald-400">${viewingEmp.salary?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Status:</span>
                <span className="font-bold text-emerald-400">{viewingEmp.status}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingEmp(null)}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-2xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/30"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
