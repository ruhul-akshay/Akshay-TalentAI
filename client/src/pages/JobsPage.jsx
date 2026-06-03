import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function JobsPage() {
  const { apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationsData, setApplicationsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Predefined options for dropdowns
  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 'MongoDB', 'Express.js',
    'Vue.js', 'Angular', 'TypeScript', 'PHP', 'Laravel', 'Django', 'Flask', 'Spring Boot', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'Git', 'REST APIs', 'GraphQL', 'Redux', 'Next.js', 'Tailwind CSS', 'Bootstrap',
    'MySQL', 'PostgreSQL', 'Firebase', 'Machine Learning', 'Data Analysis', 'Project Management', 'Agile',
    'Scrum', 'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Marketing', 'SEO', 'Content Writing',
    'Social Media Management', 'Sales', 'Customer Service', 'Team Leadership', 'Communication'
  ];

  const departmentOptions = [
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Data Science',
    'DevOps', 'QA', 'Security', 'Legal', 'Customer Success', 'Support', 'Business Development'
  ];

  const benefitOptions = [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k)', 'Flexible PTO', 'Remote Work',
    'Flexible Hours', 'Stock Options', 'Professional Development', 'Gym Membership', 'Free Lunch',
    'Commuter Benefits', 'Maternity/Paternity Leave', 'Life Insurance', 'Disability Insurance',
    'Learning Budget', 'Conference Budget', 'Home Office Setup', 'Mental Health Support', 'Wellness Programs'
  ];

  const certificationOptions = [
    'AWS Certified Solutions Architect', 'Google Cloud Professional', 'Microsoft Azure Fundamentals',
    'Certified Kubernetes Administrator', 'Docker Certified Associate', 'PMP', 'Scrum Master',
    'CompTIA Security+', 'CISSP', 'CISM', 'Oracle Certified Professional', 'Salesforce Certified',
    'HubSpot Certified', 'Google Analytics Certified', 'Facebook Blueprint Certified'
  ];

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`/api/jobs?status=${activeTab}`);
      const data = await response.json();
      if (data.success) {
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setMessage({ type: 'error', text: 'Failed to fetch jobs' });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId) => {
    try {
      const response = await apiCall(`/api/admin/job-applications/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setApplicationsData(data.data || []);
      } else {
        setApplicationsData([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationsData([]);
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      setLoading(true);
      const response = await apiCall('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs();
        setShowCreateModal(false);
        setMessage({ type: 'success', text: 'Job created successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create job' });
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setMessage({ type: 'error', text: 'Failed to create job' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (jobData) => {
    try {
      setLoading(true);
      const response = await apiCall(`/api/jobs/${selectedJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs();
        setShowEditModal(false);
        setSelectedJob(null);
        setMessage({ type: 'success', text: 'Job updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update job' });
      }
    } catch (error) {
      console.error('Error updating job:', error);
      setMessage({ type: 'error', text: 'Failed to update job' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const response = await apiCall(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs();
        setMessage({ type: 'success', text: `Job status updated to ${newStatus}` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      setMessage({ type: 'error', text: 'Failed to update job status' });
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    await fetchJobApplications(job._id);
    setShowApplicationsModal(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const updateApplicationStatus = async (applicationId, newStatus, notes = '') => {
    try {
      const response = await apiCall(`/api/applications/${applicationId}/${getActionFromStatus(newStatus)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        await fetchJobApplications(selectedJob._id);
        setMessage({ type: 'success', text: `Application status updated to ${newStatus}` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      setMessage({ type: 'error', text: 'Failed to update application status' });
    }
  };

  const getActionFromStatus = (status) => {
    switch (status) {
      case 'reviewing': return 'review';
      case 'shortlisted': return 'shortlist';
      case 'interview-scheduled': return 'schedule-interview';
      case 'rejected': return 'reject';
      case 'hired': return 'hire';
      default: return 'review';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-emerald-500 to-green-600';
      case 'paused': return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'closed': return 'bg-gradient-to-r from-slate-500 to-gray-600';
      case 'draft': return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      default: return 'bg-gradient-to-r from-purple-500 to-pink-600';
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'reviewing': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'shortlisted': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'interview-scheduled': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-rose-500';
      case 'hired': return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'border-l-red-500 bg-red-500/10';
      case 'high': return 'border-l-orange-500 bg-orange-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-l-green-500 bg-green-500/10';
      default: return 'border-l-blue-500 bg-blue-500/10';
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department?.toLowerCase()) {
      case 'engineering': return '💻';
      case 'product': return '🎯';
      case 'design': return '🎨';
      case 'marketing': return '📢';
      case 'sales': return '💼';
      case 'finance': return '💰';
      case 'hr': return '👥';
      case 'operations': return '⚙️';
      case 'data science': return '📊';
      case 'devops': return '🚀';
      case 'qa': return '🔍';
      case 'security': return '🔐';
      default: return '🏢';
    }
  };

  const formatSalary = (salaryRange) => {
    if (salaryRange?.min && salaryRange?.max) {
      return `${salaryRange.currency || '$'}${salaryRange.min}k - ${salaryRange.currency || '$'}${salaryRange.max}k`;
    } else if (salaryRange?.min) {
      return `${salaryRange.currency || '$'}${salaryRange.min}k+`;
    } else if (salaryRange?.max) {
      return `Up to ${salaryRange.currency || '$'}${salaryRange.max}k`;
    }
    return 'Competitive';
  };

  const getNoticePeriodDisplay = (noticePeriod) => {
    switch (noticePeriod) {
      case 'immediate': return '🚀 Immediate';
      case '2-weeks': return '📅 2 Weeks';
      case '1-month': return '📅 1 Month';
      case '2-months': return '📅 2 Months';
      case '3-months': return '📅 3 Months';
      case 'negotiable': return '🤝 Negotiable';
      default: return '🤝 Negotiable';
    }
  };

  const getWorkModeIcon = (workMode) => {
    switch (workMode) {
      case 'remote': return '🏠';
      case 'hybrid': return '🔄';
      case 'onsite': return '🏢';
      default: return '🔄';
    }
  };

  const filteredJobs = jobs
    .filter(job => 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDepartment === 'all' || job.department === filterDepartment)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'applications': return (b.applications || 0) - (a.applications || 0);
        case 'views': return (b.views || 0) - (a.views || 0);
        case 'urgency': 
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        default: return 0;
      }
    });

  const departments = [...new Set(jobs.map(job => job.department).filter(Boolean))];

  const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (option) => {
      if (selected.includes(option)) {
        onChange(selected.filter(item => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 text-left flex justify-between items-center"
        >
          <span className={selected.length > 0 ? 'text-white' : 'text-gray-400'}>
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/20 rounded-xl max-h-60 overflow-y-auto shadow-xl">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className={`p-3 cursor-pointer hover:bg-white/10 transition-colors ${
                  selected.includes(option) ? 'bg-blue-500/20 text-blue-300' : 'text-white'
                }`}
              >
                <span className="mr-3 text-white">
                  {selected.includes(option) ? '✓' : ''}
                </span>
                <span className="text-white">{option}</span>
              </div>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm flex items-center space-x-2"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onChange(selected.filter(i => i !== item))}
                  className="text-blue-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const JobFormModal = ({ isEdit = false, onSubmit, onClose }) => {
    const [formData, setFormData] = useState(isEdit && selectedJob ? {
      title: selectedJob.title || '',
      description: selectedJob.description || '',
      department: selectedJob.department || '',
      experienceLevel: selectedJob.experienceLevel || 'mid',
      skills: selectedJob.skills || [],
      location: selectedJob.location || '',
      workMode: selectedJob.workMode || 'hybrid',
      type: selectedJob.type || 'Full-time',
      urgency: selectedJob.urgency || 'medium',
      noticePeriod: selectedJob.noticePeriod || 'negotiable',
      positionCount: selectedJob.positionCount || 1,
      deadline: selectedJob.deadline ? new Date(selectedJob.deadline).toISOString().split('T')[0] : '',
      contractDuration: selectedJob.contractDuration || '',
      benefits: selectedJob.benefits || [],
      requirements: {
        education: selectedJob.requirements?.education || '',
        certifications: selectedJob.requirements?.certifications || [],
        languages: selectedJob.requirements?.languages?.map(l => l.language || '') || [],
        experience: selectedJob.requirements?.experience || ''
      },
      reportingManager: {
        title: selectedJob.reportingManager?.title || '',
        department: selectedJob.reportingManager?.department || ''
      },
      teamSize: selectedJob.teamSize || '',
      travelRequired: selectedJob.travelRequired || 'none',
      securityClearance: selectedJob.securityClearance || 'none',
      salaryRange: { 
        min: selectedJob.salaryRange?.min || '', 
        max: selectedJob.salaryRange?.max || '', 
        currency: selectedJob.salaryRange?.currency || 'USD' 
      },
      responsibilities: selectedJob.responsibilities || [],
      qualifications: selectedJob.qualifications || [],
      companyBenefits: selectedJob.companyBenefits || '',
      workSchedule: selectedJob.workSchedule || 'standard'
    } : {
      title: '',
      description: '',
      department: '',
      experienceLevel: 'mid',
      skills: [],
      location: '',
      workMode: 'hybrid',
      type: 'Full-time',
      urgency: 'medium',
      noticePeriod: 'negotiable',
      positionCount: 1,
      deadline: '',
      contractDuration: '',
      benefits: [],
      requirements: {
        education: '',
        certifications: [],
        languages: [],
        experience: ''
      },
      reportingManager: {
        title: '',
        department: ''
      },
      teamSize: '',
      travelRequired: 'none',
      securityClearance: 'none',
      salaryRange: { min: '', max: '', currency: 'USD' },
      responsibilities: [],
      qualifications: [],
      companyBenefits: '',
      workSchedule: 'standard'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const jobData = {
        ...formData,
        status: formData.status || 'active', // Ensure new jobs are active by default
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
        positionCount: parseInt(formData.positionCount) || 1,
        deadline: formData.deadline || undefined,
        salaryRange: {
          min: formData.salaryRange.min ? parseInt(formData.salaryRange.min) : undefined,
          max: formData.salaryRange.max ? parseInt(formData.salaryRange.max) : undefined,
          currency: formData.salaryRange.currency
        },
        requirements: {
          ...formData.requirements,
          languages: formData.requirements.languages.map(lang => ({
            language: lang,
            proficiency: 'intermediate'
          }))
        }
      };
      onSubmit(jobData);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name.includes('salaryRange')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          salaryRange: { ...prev.salaryRange, [field]: value }
        }));
      } else if (name.includes('requirements')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          requirements: { ...prev.requirements, [field]: value }
        }));
      } else if (name.includes('reportingManager')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          reportingManager: { ...prev.reportingManager, [field]: value }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };

    const addTextItem = (field, value) => {
      if (value.trim()) {
        setFormData(prev => ({
          ...prev,
          [field]: [...prev[field], value.trim()]
        }));
      }
    };

    const removeTextItem = (field, index) => {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-purple-800 rounded-3xl p-8 max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              {isEdit ? '✏️ Edit Position' : '🚀 Create New Position'}
            </h2>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <span>📋</span>
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1e293b', color: 'white' }}>Select Department</option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept} style={{ backgroundColor: '#1e293b', color: 'white' }}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level *</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="entry" style={{ backgroundColor: '#1e293b', color: 'white' }}>Entry Level (0-2 years)</option>
                    <option value="mid" style={{ backgroundColor: '#1e293b', color: 'white' }}>Mid Level (2-5 years)</option>
                    <option value="senior" style={{ backgroundColor: '#1e293b', color: 'white' }}>Senior Level (5-8 years)</option>
                    <option value="lead" style={{ backgroundColor: '#1e293b', color: 'white' }}>Lead Level (8+ years)</option>
                    <option value="director" style={{ backgroundColor: '#1e293b', color: 'white' }}>Director Level</option>
                    <option value="vp" style={{ backgroundColor: '#1e293b', color: 'white' }}>VP Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Employment Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="Full-time" style={{ backgroundColor: '#1e293b', color: 'white' }}>Full-time</option>
                    <option value="Part-time" style={{ backgroundColor: '#1e293b', color: 'white' }}>Part-time</option>
                    <option value="Contract" style={{ backgroundColor: '#1e293b', color: 'white' }}>Contract</option>
                    <option value="Internship" style={{ backgroundColor: '#1e293b', color: 'white' }}>Internship</option>
                    <option value="Freelance" style={{ backgroundColor: '#1e293b', color: 'white' }}>Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority Level</label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Positions</label>
                  <input
                    type="number"
                    name="positionCount"
                    value={formData.positionCount}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </div>

            {/* Location & Work Details */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <span>📍</span>
                <span>Location & Work Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. New York, NY"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Work Mode</label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Travel Required</label>
                  <select
                    name="travelRequired"
                    value={formData.travelRequired}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="none">No Travel</option>
                    <option value="minimal">Minimal (1-10%)</option>
                    <option value="occasional">Occasional (10-25%)</option>
                    <option value="frequent">Frequent (25%+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Work Schedule</label>
                  <select
                    name="workSchedule"
                    value={formData.workSchedule}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="standard">Standard (9-5)</option>
                    <option value="flexible">Flexible Hours</option>
                    <option value="shift">Shift Work</option>
                    <option value="weekend">Weekend Work</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compensation & Benefits */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <span>💰</span>
                <span>Compensation & Benefits</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Salary (k)</label>
                  <input
                    type="number"
                    name="salaryRange.min"
                    value={formData.salaryRange.min}
                    onChange={handleInputChange}
                    placeholder="e.g. 80"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Salary (k)</label>
                  <input
                    type="number"
                    name="salaryRange.max"
                    value={formData.salaryRange.max}
                    onChange={handleInputChange}
                    placeholder="e.g. 120"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <select
                    name="salaryRange.currency"
                    value={formData.salaryRange.currency}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Benefits</label>
                <MultiSelectDropdown
                  options={benefitOptions}
                  selected={formData.benefits}
                  onChange={(selected) => setFormData(prev => ({ ...prev, benefits: selected }))}
                  placeholder="Select benefits offered..."
                />
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <span>🛠️</span>
                <span>Skills & Requirements</span>
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Required Skills *</label>
                  <MultiSelectDropdown
                    options={skillOptions}
                    selected={formData.skills}
                    onChange={(selected) => setFormData(prev => ({ ...prev, skills: selected }))}
                    placeholder="Select required skills..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Education Requirements</label>
                    <input
                      type="text"
                      name="requirements.education"
                      value={formData.requirements.education}
                      onChange={handleInputChange}
                      placeholder="e.g. Bachelor's degree in Computer Science"
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience Requirements</label>
                    <input
                      type="text"
                      name="requirements.experience"
                      value={formData.requirements.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 3+ years in web development"
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Certifications</label>
                  <MultiSelectDropdown
                    options={certificationOptions}
                    selected={formData.requirements.certifications}
                    onChange={(selected) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, certifications: selected }
                    }))}
                    placeholder="Select preferred certifications..."
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <span>📝</span>
                <span>Job Description</span>
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Timeline & Additional Info */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <span>⏰</span>
                <span>Timeline & Additional Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notice Period</label>
                  <select
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    style={{ 
                      color: 'white',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <option value="immediate">Immediate Start</option>
                    <option value="2-weeks">2 Weeks Notice</option>
                    <option value="1-month">1 Month Notice</option>
                    <option value="2-months">2 Months Notice</option>
                    <option value="3-months">3 Months Notice</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Team Size</label>
                  <input
                    type="number"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                <span>{loading ? 'Saving...' : (isEdit ? 'Update Position' : 'Create Position')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ApplicationsModal = () => {
    if (!showApplicationsModal || !selectedJob) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-purple-800 rounded-3xl p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-2">
                📋 Applications for {selectedJob.title}
              </h2>
              <p className="text-gray-400">{applicationsData.length} applicant{applicationsData.length !== 1 ? 's' : ''} found</p>
            </div>
            <button
              onClick={() => setShowApplicationsModal(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="space-y-6">
            {applicationsData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-6">📭</div>
                <h4 className="text-3xl font-bold text-gray-400 mb-4">No Applications Yet</h4>
                <p className="text-gray-500 text-lg">This position hasn't received any applications yet.</p>
              </div>
            ) : (
              applicationsData.map((application) => (
                <div key={application._id} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        {application.applicant?.profile?.profilePicture?.fileUrl ? (
                          <img
                            src={application.applicant.profile.profilePicture.fileUrl}
                            alt={application.applicant.firstName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                            {application.applicant ? (application.applicant.firstName?.charAt(0) || application.applicant.email?.charAt(0))?.toUpperCase() : '👤'}
                          </div>
                        )}
                        {application.aiAnalysis?.matchPercentage && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {application.aiAnalysis.matchPercentage}%
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {application.applicant ? `${application.applicant.firstName} ${application.applicant.lastName}` : 'Unknown Applicant'}
                        </h3>
                        <p className="text-gray-400 mb-2">{application.applicant?.email || 'No email provided'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <span>📱</span>
                            <span>{application.applicant?.profile?.phone || 'No phone'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>{application.applicant?.profile?.address?.city || 'Location not specified'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>💼</span>
                            <span>{application.applicant?.profile?.totalExperience || 'Experience not specified'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getApplicationStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                      </div>
                      <div className="text-sm text-gray-400">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {application.coverLetter && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">📝 Cover Letter</h4>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-gray-300 leading-relaxed">{application.coverLetter}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                    {application.applicant?.profile?.resume?.fileUrl && (
                      <a
                        href={application.applicant.profile.resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                      >
                        📄 View Resume
                      </a>
                    )}

                    {application.status === 'pending' && (
                      <button 
                        onClick={() => updateApplicationStatus(application._id, 'reviewing')}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                      >
                        📋 Review
                      </button>
                    )}

                    {(application.status === 'reviewing' || application.status === 'pending') && (
                      <button 
                        onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                      >
                        ⭐ Shortlist
                      </button>
                    )}

                    <button 
                      onClick={() => updateApplicationStatus(application._id, 'rejected')}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const JobCard = ({ job }) => (
    <div className={`group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border-l-4 ${getUrgencyColor(job.urgency)} border border-white/20 hover:border-white/40`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-white/20">
            <span className="text-3xl">{getDepartmentIcon(job.department)}</span>
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold text-white">{job.title}</h3>
              <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 text-sm rounded-lg border border-cyan-500/30 font-mono">
                {job.jobId || `JOB-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              <span className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-lg">
                <span>🏢</span>
                <span>{job.department}</span>
              </span>
              <span className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-lg">
                <span>{getWorkModeIcon(job.workMode)}</span>
                <span>{job.workMode || 'Hybrid'}</span>
              </span>
              <span className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-lg">
                <span>📍</span>
                <span>{job.location || 'Remote'}</span>
              </span>
              <span className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-lg">
                <span>🎯</span>
                <span>{job.experienceLevel}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(job.status)}`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </div>
          {job.urgency === 'critical' && (
            <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              URGENT
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 text-center border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{job.positionCount || 1}</div>
          <div className="text-sm text-gray-300">Open Positions</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 text-center border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{job.applications || 0}</div>
          <div className="text-sm text-gray-300">Applications</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 text-center border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">{job.views || 0}</div>
          <div className="text-sm text-gray-300">Views</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 text-center border border-yellow-500/30">
          <div className="text-2xl font-bold text-yellow-400">{job.shortlisted || 0}</div>
          <div className="text-sm text-gray-300">Shortlisted</div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <span className="text-2xl">💰</span>
          <div>
            <div className="font-semibold text-white">{formatSalary(job.salaryRange)}</div>
            <div className="text-sm text-gray-400">Salary Range</div>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <span className="text-2xl">⏰</span>
          <div>
            <div className="font-semibold text-white">{getNoticePeriodDisplay(job.noticePeriod)}</div>
            <div className="text-sm text-gray-400">Notice Period</div>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <span className="text-2xl">📅</span>
          <div>
            <div className="font-semibold text-white">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}</div>
            <div className="text-sm text-gray-400">Application Deadline</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3">🛠️ Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 8).map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30">
                {skill}
              </span>
            ))}
            {job.skills.length > 8 && (
              <span className="px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-lg border border-white/20">
                +{job.skills.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job Description Preview */}
      {job.description && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3">📝 Job Description:</h4>
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{job.description}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button 
          onClick={() => handleViewApplications(job)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
        >
          <span>📋</span>
          <span>Applications ({job.applications || 0})</span>
        </button>
        <button 
          onClick={() => handleEditJob(job)}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
        >
          <span>✏️</span>
          <span>Edit</span>
        </button>
        <select
          value={job.status}
          onChange={(e) => handleStatusChange(job._id, e.target.value)}
          className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium focus:outline-none hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Jobs Management Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light">
            Create, manage, and track your job postings with advanced analytics and modern features
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/50 text-green-300' 
              : 'bg-red-500/20 border-red-500/50 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              <span>{message.type === 'success' ? '✅' : '❌'}</span>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-6 mb-12">
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20">
              {['active', 'paused', 'closed', 'draft'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Jobs
                </button>
              ))}
            </div>
          </div>

          {/* Search, Filter and Create */}
          <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
              style={{ 
                color: 'white',
                backgroundColor: '#1e293b'
              }}
            >
              <option value="all" style={{ backgroundColor: '#1e293b', color: 'white' }}>All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept} style={{ backgroundColor: '#1e293b', color: 'white' }}>{dept}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
              style={{ 
                color: 'white',
                backgroundColor: '#1e293b'
              }}
            >
              <option value="newest" style={{ backgroundColor: '#1e293b', color: 'white' }}>Newest First</option>
              <option value="oldest" style={{ backgroundColor: '#1e293b', color: 'white' }}>Oldest First</option>
              <option value="applications" style={{ backgroundColor: '#1e293b', color: 'white' }}>Most Applications</option>
              <option value="views" style={{ backgroundColor: '#1e293b', color: 'white' }}>Most Views</option>
              <option value="urgency" style={{ backgroundColor: '#1e293b', color: 'white' }}>By Urgency</option>
            </select>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <span>➕</span>
              <span>Create Position</span>
            </button>
          </div>
        </div>

        {/* Job Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-blue-500/30">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold mb-1 text-blue-400">{jobs.filter(j => j.status === 'active').length}</div>
            <div className="text-blue-300 text-sm">Active Positions</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-green-500/30">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold mb-1 text-green-400">{jobs.reduce((sum, job) => sum + (job.applications || 0), 0)}</div>
            <div className="text-green-300 text-sm">Applications</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-purple-500/30">
            <div className="text-4xl mb-2">👀</div>
            <div className="text-3xl font-bold mb-1 text-purple-400">{jobs.reduce((sum, job) => sum + (job.views || 0), 0)}</div>
            <div className="text-purple-300 text-sm">Total Views</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-yellow-500/30">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold mb-1 text-yellow-400">{jobs.reduce((sum, job) => sum + (job.shortlisted || 0), 0)}</div>
            <div className="text-yellow-300 text-sm">Shortlisted</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-red-500/30">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-3xl font-bold mb-1 text-red-400">{jobs.filter(j => j.urgency === 'critical' || j.urgency === 'high').length}</div>
            <div className="text-red-300 text-sm">Urgent Roles</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Positions 
              <span className="text-gray-400 text-lg ml-2">({filteredJobs.length} jobs)</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">⏳</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">Loading positions...</h3>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-8">
              {filteredJobs.map((job, index) => (
                <div key={job._id} className="animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">No positions found</h3>
              <p className="text-gray-500 text-lg mb-6">Try adjusting your search or create a new job posting</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                Create New Position
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <JobFormModal
          onSubmit={handleCreateJob}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && (
        <JobFormModal
          isEdit={true}
          onSubmit={handleUpdateJob}
          onClose={() => {
            setShowEditModal(false);
            setSelectedJob(null);
          }}
        />
      )}

      <ApplicationsModal />

      <Footer />
    </div>
  );
}