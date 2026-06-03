
import { useState, useEffect } from 'react';

export default function JobRoleManager({ onJobRoleSelect, selectedJobRole }) {
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    experienceLevel: 'mid',
    skills: '',
    location: '',
    salaryRange: { min: '', max: '' }
  });

  useEffect(() => {
    fetchJobRoles();
  }, []);

  const fetchJobRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/job-roles');
      const data = await response.json();
      if (data.success) {
        setJobRoles(data.data);
      }
    } catch (error) {
      console.error('Error fetching job roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobRole = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        salaryRange: {
          min: formData.salaryRange.min ? parseInt(formData.salaryRange.min) : undefined,
          max: formData.salaryRange.max ? parseInt(formData.salaryRange.max) : undefined
        }
      };

      const response = await fetch('/api/job-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (data.success) {
        setJobRoles([data.data, ...jobRoles]);
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          department: '',
          experienceLevel: 'mid',
          skills: '',
          location: '',
          salaryRange: { min: '', max: '' }
        });
      }
    } catch (error) {
      console.error('Error creating job role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('salaryRange')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salaryRange: { ...prev.salaryRange, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-5 shadow-lg backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-800 text-xl font-semibold">Job Roles</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          {showCreateForm ? 'Cancel' : '+ Create New Role'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateJobRole} className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              required
              className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead Level</option>
            </select>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleInputChange}
              className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              name="salaryRange.min"
              placeholder="Min Salary"
              value={formData.salaryRange.min}
              onChange={handleInputChange}
              className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              name="salaryRange.max"
              placeholder="Max Salary"
              value={formData.salaryRange.max}
              onChange={handleInputChange}
              className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={formData.skills}
            onChange={handleInputChange}
            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
          />
          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Job Role'}
          </button>
        </form>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Job Role:
        </label>
        <select
          value={selectedJobRole?._id || ''}
          onChange={(e) => {
            const selected = jobRoles.find(role => role._id === e.target.value);
            onJobRoleSelect(selected);
          }}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">Select a job role...</option>
          {jobRoles.map(role => (
            <option key={role._id} value={role._id}>
              {role.title} - {role.department} ({role.experienceLevel})
            </option>
          ))}
        </select>
      </div>

      {selectedJobRole && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">{selectedJobRole.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Department:</strong> {selectedJobRole.department} | 
            <strong> Level:</strong> {selectedJobRole.experienceLevel} |
            <strong> Location:</strong> {selectedJobRole.location || 'Remote'}
          </p>
          {selectedJobRole.skills && selectedJobRole.skills.length > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              <strong>Skills:</strong> {selectedJobRole.skills.join(', ')}
            </p>
          )}
          {selectedJobRole.salaryRange && (selectedJobRole.salaryRange.min || selectedJobRole.salaryRange.max) && (
            <p className="text-sm text-gray-600 mb-2">
              <strong>Salary:</strong> ${selectedJobRole.salaryRange.min || 0} - ${selectedJobRole.salaryRange.max || 'Open'}
            </p>
          )}
          <p className="text-sm text-gray-700">{selectedJobRole.description}</p>
        </div>
      )}
    </div>
  );
}
