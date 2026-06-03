
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [completionStatus, setCompletionStatus] = useState({});
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [profilePictureUploading, setProfilePictureUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      dateOfBirth: '',
      profilePictureUrl: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }
    },
    professionalInfo: {
      currentRole: '',
      currentCompany: '',
      totalExperience: '',
      relevantExperience: '',
      expectedSalary: '',
      currentSalary: '',
      noticePeriod: '',
      workAuthorization: '',
      bio: '',
      availability: ''
    },
    educationHistory: {
      tenthGrade: {
        board: '',
        schoolName: '',
        yearOfPassing: '',
        percentage: '',
        grade: '',
        subjects: []
      },
      twelfthGrade: {
        board: '',
        schoolName: '',
        stream: '',
        yearOfPassing: '',
        percentage: '',
        grade: '',
        subjects: []
      },
      graduation: {
        degree: '',
        specialization: '',
        university: '',
        collegeName: '',
        yearOfPassing: '',
        cgpa: '',
        percentage: '',
        grade: '',
        projects: []
      },
      postGraduation: {
        degree: '',
        specialization: '',
        university: '',
        collegeName: '',
        yearOfPassing: '',
        cgpa: '',
        percentage: '',
        grade: '',
        thesis: {
          title: '',
          description: '',
          guide: ''
        },
        projects: []
      },
      additionalQualifications: []
    },
    workExperienceHistory: [],
    references: [],
    skillsAndCertifications: {
      technicalSkills: [],
      softSkills: [],
      certifications: [],
      languages: []
    },
    resume: {
      fileName: '',
      fileUrl: '',
      fileSize: 0,
      uploadDate: null
    },
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: '',
      personalWebsite: ''
    },
    careerPreferences: {
      preferredRoles: [],
      preferredIndustries: [],
      preferredLocations: [],
      preferredWorkMode: '',
      preferredJobTypes: [],
      preferredCompanySize: '',
      salaryExpectations: {
        minimum: '',
        maximum: '',
        currency: 'INR',
        negotiable: false
      },
      careerGoals: '',
      willingToRelocate: false,
      availabilityToJoin: ''
    }
  });

  const sections = [
    { 
      key: 'personal', 
      label: 'Personal Info', 
      icon: '👤',
      description: 'Basic personal information and contact details'
    },
    { 
      key: 'professional', 
      label: 'Professional', 
      icon: '💼',
      description: 'Current role, experience, and professional summary'
    },
    { 
      key: 'education', 
      label: 'Education', 
      icon: '🎓',
      description: 'Complete academic background'
    },
    { 
      key: 'experience', 
      label: 'Experience', 
      icon: '🏢',
      description: 'Detailed work history'
    },
    { 
      key: 'skills', 
      label: 'Skills & Certs', 
      icon: '🛠️',
      description: 'Technical skills and certifications'
    },
    { 
      key: 'references', 
      label: 'References', 
      icon: '🤝',
      description: 'Professional references'
    },
    { 
      key: 'preferences', 
      label: 'Career Goals', 
      icon: '🎯',
      description: 'Career preferences'
    }
  ];

  const workAuthorizationOptions = [
    'Indian Citizen',
    'Person of Indian Origin (PIO)',
    'Overseas Citizen of India (OCI)',
    'Work Permit Holder',
    'Student Visa',
    'Dependent Visa',
    'Other'
  ];

  const availabilityOptions = [
    'Available Immediately',
    'Available in 2 weeks',
    'Available in 1 month',
    'Available in 2 months',
    'Available in 3 months',
    'Currently not available'
  ];

  const noticePeriodOptions = [
    'Serving Notice Period',
    'Immediate',
    '15 Days',
    '1 Month',
    '2 Months',
    '3 Months',
    'More than 3 Months'
  ];

  const educationBoards = [
    'CBSE', 'ICSE', 'State Board', 'IB', 'NIOS', 'Other'
  ];

  const streams = [
    'Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts/Humanities', 'Vocational'
  ];

  const employmentTypes = [
    'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
  ];

  const workModes = [
    'On-site', 'Remote', 'Hybrid'
  ];

  const relationshipTypes = [
    'Former Manager', 'Current Manager', 'Colleague', 'HR', 'Client', 
    'Mentor', 'Academic Reference', 'Other'
  ];

  const skillCategories = {
    'Programming Languages': [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript',
      'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart'
    ],
    'Web Technologies': [
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'HTML5', 'CSS3', 'SASS', 'Bootstrap', 'Tailwind CSS',
      'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Redux', 'GraphQL', 'REST API'
    ],
    'Databases': [
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Oracle', 'SQL Server',
      'DynamoDB', 'Cassandra', 'Neo4j'
    ],
    'Cloud & DevOps': [
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform',
      'Ansible', 'Helm', 'Prometheus', 'Grafana'
    ],
    'Mobile Development': [
      'React Native', 'Flutter', 'Android', 'iOS', 'Ionic', 'Xamarin'
    ],
    'Data Science': [
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
      'Tableau', 'Power BI', 'Apache Spark'
    ]
  };

  useEffect(() => {
    loadProfile();
    fetchUniversities();
  }, []);

  const cleanFormDataForSave = (data) => {
    const cleaned = JSON.parse(JSON.stringify(data));
    
    if (cleaned.careerPreferences) {
      if (!cleaned.careerPreferences.preferredWorkMode || cleaned.careerPreferences.preferredWorkMode === '') {
        delete cleaned.careerPreferences.preferredWorkMode;
      }
      if (!cleaned.careerPreferences.preferredCompanySize || cleaned.careerPreferences.preferredCompanySize === '') {
        delete cleaned.careerPreferences.preferredCompanySize;
      }
    }
    
    if (cleaned.references && cleaned.references.length > 0) {
      cleaned.references = cleaned.references.filter(ref => {
        return ref.name && ref.name.trim() && 
               ref.designation && ref.designation.trim() && 
               ref.email && ref.email.trim() && 
               ref.relationship && ref.relationship.trim();
      });
    }
    
    if (cleaned.workExperienceHistory && cleaned.workExperienceHistory.length > 0) {
      cleaned.workExperienceHistory = cleaned.workExperienceHistory.filter(exp => {
        return exp.companyName && exp.companyName.trim() && 
               exp.jobTitle && exp.jobTitle.trim() && 
               exp.startDate && exp.startDate.trim();
      });
    }
    
    if (cleaned.skillsAndCertifications && cleaned.skillsAndCertifications.languages) {
      cleaned.skillsAndCertifications.languages = cleaned.skillsAndCertifications.languages.filter(lang => {
        return lang.name && lang.name.trim();
      });
    }
    
    if (cleaned.skillsAndCertifications && cleaned.skillsAndCertifications.certifications) {
      cleaned.skillsAndCertifications.certifications = cleaned.skillsAndCertifications.certifications.filter(cert => {
        return cert.name && cert.name.trim();
      });
    }
    
    if (cleaned.educationHistory && cleaned.educationHistory.additionalQualifications) {
      cleaned.educationHistory.additionalQualifications = cleaned.educationHistory.additionalQualifications.filter(qual => {
        return qual.qualificationType && qual.qualificationType.trim() && 
               qual.courseName && qual.courseName.trim();
      });
    }
    
    return cleaned;
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/candidates/profile');
      
      if (response.ok) {
        const data = await response.json();
        const profile = data.data;
        
        setFormData({
          personalInfo: {
            firstName: profile.personalInfo?.firstName || '',
            lastName: profile.personalInfo?.lastName || '',
            email: profile.personalInfo?.email || '',
            phone: profile.personalInfo?.phone || '',
            alternatePhone: profile.personalInfo?.alternatePhone || '',
            dateOfBirth: profile.personalInfo?.dateOfBirth ? 
              profile.personalInfo.dateOfBirth.split('T')[0] : '',
            profilePictureUrl: profile.personalInfo?.profilePictureUrl || '',
            address: {
              street: profile.personalInfo?.address?.street || '',
              city: profile.personalInfo?.address?.city || '',
              state: profile.personalInfo?.address?.state || '',
              postalCode: profile.personalInfo?.address?.postalCode || '',
              country: profile.personalInfo?.address?.country || 'India'
            }
          },
          professionalInfo: {
            currentRole: profile.professionalInfo?.currentRole || '',
            currentCompany: profile.professionalInfo?.currentCompany || '',
            totalExperience: profile.professionalInfo?.totalExperience || '',
            relevantExperience: profile.professionalInfo?.relevantExperience || '',
            expectedSalary: profile.professionalInfo?.expectedSalary || '',
            currentSalary: profile.professionalInfo?.currentSalary || '',
            noticePeriod: profile.professionalInfo?.noticePeriod || '',
            workAuthorization: profile.professionalInfo?.workAuthorization || '',
            bio: profile.professionalInfo?.bio || '',
            availability: profile.professionalInfo?.availability || ''
          },
          educationHistory: {
            tenthGrade: profile.educationHistory?.tenthGrade || { board: '', schoolName: '', yearOfPassing: '', percentage: '', grade: '', subjects: [] },
            twelfthGrade: profile.educationHistory?.twelfthGrade || { board: '', schoolName: '', stream: '', yearOfPassing: '', percentage: '', grade: '', subjects: [] },
            graduation: profile.educationHistory?.graduation || { degree: '', specialization: '', university: '', collegeName: '', yearOfPassing: '', cgpa: '', percentage: '', grade: '', projects: [] },
            postGraduation: profile.educationHistory?.postGraduation || { degree: '', specialization: '', university: '', collegeName: '', yearOfPassing: '', cgpa: '', percentage: '', grade: '', thesis: { title: '', description: '', guide: '' }, projects: [] },
            additionalQualifications: profile.educationHistory?.additionalQualifications || []
          },
          workExperienceHistory: profile.workExperienceHistory || [],
          references: profile.references || [],
          skillsAndCertifications: {
            technicalSkills: profile.skillsAndCertifications?.technicalSkills || [],
            softSkills: profile.skillsAndCertifications?.softSkills || [],
            certifications: profile.skillsAndCertifications?.certifications || [],
            languages: profile.skillsAndCertifications?.languages || []
          },
          resume: {
            fileName: profile.resume?.fileName || '',
            fileUrl: profile.resume?.fileUrl || '',
            fileSize: profile.resume?.fileSize || 0,
            uploadDate: profile.resume?.uploadDate || null
          },
          socialLinks: {
            linkedin: profile.socialLinks?.linkedin || '',
            github: profile.socialLinks?.github || '',
            portfolio: profile.socialLinks?.portfolio || '',
            twitter: profile.socialLinks?.twitter || '',
            personalWebsite: profile.socialLinks?.personalWebsite || ''
          },
          careerPreferences: {
            preferredRoles: profile.careerPreferences?.preferredRoles || [],
            preferredIndustries: profile.careerPreferences?.preferredIndustries || [],
            preferredLocations: profile.careerPreferences?.preferredLocations || [],
            preferredWorkMode: profile.careerPreferences?.preferredWorkMode || '',
            preferredJobTypes: profile.careerPreferences?.preferredJobTypes || [],
            preferredCompanySize: profile.careerPreferences?.preferredCompanySize || '',
            salaryExpectations: profile.careerPreferences?.salaryExpectations || { minimum: '', maximum: '', currency: 'INR', negotiable: false },
            careerGoals: profile.careerPreferences?.careerGoals || '',
            willingToRelocate: profile.careerPreferences?.willingToRelocate || false,
            availabilityToJoin: profile.careerPreferences?.availabilityToJoin || ''
          }
        });
        
        calculateCompletionStatus(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ text: 'Failed to load profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const response = await fetch('https://colleges-api.onrender.com/colleges');
      const data = await response.json();
      const sortedUniversities = data
        .map(college => college.name)
        .filter((name, index, array) => array.indexOf(name) === index)
        .sort();
      setUniversities(sortedUniversities);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities([
        'Indian Institute of Technology (IIT)',
        'Indian Institute of Science (IISc)',
        'Jawaharlal Nehru University (JNU)',
        'University of Delhi'
      ]);
    } finally {
      setLoadingUniversities(false);
    }
  };

  const calculateCompletionStatus = (profile) => {
    const status = {};
    
    const personalRequired = ['firstName', 'lastName', 'email', 'phone'];
    const personalComplete = personalRequired.every(field => 
      profile.personalInfo?.[field] && profile.personalInfo[field].trim()
    );
    status.personal = personalComplete && profile.personalInfo?.address?.city;
    
    const professionalRequired = ['currentRole', 'totalExperience', 'bio'];
    status.professional = professionalRequired.every(field => 
      profile.professionalInfo?.[field] && profile.professionalInfo[field].trim()
    );
    
    status.education = profile.educationHistory?.graduation?.degree || 
                     profile.educationHistory?.tenthGrade?.percentage;
    
    status.experience = profile.workExperienceHistory && 
                       profile.workExperienceHistory.length > 0;
    
    status.references = profile.references && profile.references.length >= 2;
    
    status.skills = profile.skillsAndCertifications?.technicalSkills && 
                   profile.skillsAndCertifications.technicalSkills.length > 0;
    
    status.preferences = profile.careerPreferences?.preferredRoles && 
                        profile.careerPreferences.preferredRoles.length > 0;
    
    setCompletionStatus(status);
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const cleanedFormData = cleanFormDataForSave(formData);
      
      const response = await apiCall('/api/candidates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedFormData)
      });

      if (response.ok) {
        setMessage({ text: '✅ Section saved successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        calculateCompletionStatus(cleanedFormData);
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to save section', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving section:', error);
      setMessage({ text: 'Failed to save section. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleNextSection = () => {
    const currentIndex = sections.findIndex(s => s.key === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addWorkExperience = () => {
    const newExperience = {
      companyName: '',
      jobTitle: '',
      department: '',
      employmentType: 'Full-time',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      location: '',
      workMode: 'On-site',
      responsibilities: [''],
      achievements: [''],
      technologies: [],
      teamSize: '',
      reportingManager: {
        name: '',
        designation: '',
        email: '',
        phone: ''
      },
      reasonForLeaving: '',
      salary: {
        amount: '',
        currency: 'INR'
      }
    };

    setFormData(prev => ({
      ...prev,
      workExperienceHistory: [...prev.workExperienceHistory, newExperience]
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperienceHistory: prev.workExperienceHistory.filter((_, i) => i !== index)
    }));
  };

  const addReference = () => {
    const newReference = {
      name: '',
      designation: '',
      company: '',
      email: '',
      phone: '',
      relationship: 'Former Manager',
      workingRelationship: '',
      yearsKnown: '',
      canContact: true,
      bestTimeToContact: '',
      notes: '',
      referenceType: 'Professional'
    };

    setFormData(prev => ({
      ...prev,
      references: [...prev.references, newReference]
    }));
  };

  const removeReference = (index) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const addAdditionalQualification = () => {
    const newQualification = {
      qualificationType: '',
      courseName: '',
      institution: '',
      yearOfCompletion: '',
      duration: '',
      grade: '',
      description: ''
    };

    setFormData(prev => ({
      ...prev,
      educationHistory: {
        ...prev.educationHistory,
        additionalQualifications: [...prev.educationHistory.additionalQualifications, newQualification]
      }
    }));
  };

  const addCertification = () => {
    const newCertification = {
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      status: 'Active'
    };

    setFormData(prev => ({
      ...prev,
      skillsAndCertifications: {
        ...prev.skillsAndCertifications,
        certifications: [...prev.skillsAndCertifications.certifications, newCertification]
      }
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsAndCertifications: {
        ...prev.skillsAndCertifications,
        certifications: prev.skillsAndCertifications.certifications.filter((_, i) => i !== index)
      }
    }));
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Please upload only JPEG or PNG images', type: 'error' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Image size must be less than 2MB', type: 'error' });
      return;
    }

    setProfilePictureUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('profilePicture', file);

    try {
      const response = await apiCall('/api/job-seeker/upload-profile-picture', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        handleInputChange('personalInfo.profilePictureUrl', data.data.profilePicture.fileUrl);
        setMessage({ text: '✅ Profile picture uploaded successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (error) {
      setMessage({ text: 'Failed to upload profile picture', type: 'error' });
    } finally {
      setProfilePictureUploading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Please upload only PDF, DOC, or DOCX files', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File size must be less than 5MB', type: 'error' });
      return;
    }

    setResumeUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    try {
      const response = await apiCall('/api/job-seeker/upload-resume', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          resume: data.data.resume
        }));
        setMessage({ text: '✅ Resume uploaded successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (error) {
      setMessage({ text: 'Failed to upload resume', type: 'error' });
    } finally {
      setResumeUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const completedSections = Object.values(completionStatus).filter(Boolean).length;
  const totalSections = sections.length;
  const overallProgress = (completedSections / totalSections) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-green-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            {formData.personalInfo.profilePictureUrl ? (
              <img
                src={formData.personalInfo.profilePictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl shadow-lg">
                👤
              </div>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Professional Profile
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light mb-8">
            Build a comprehensive profile that showcases your professional journey
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">Overall Completion</span>
              <span className="text-sm font-medium text-gray-400">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedSections} of {totalSections} sections completed
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            <div className="flex items-center space-x-2">
              <span>{message.type === 'success' ? '✅' : '❌'}</span>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20 min-w-max">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`relative px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                  activeSection === section.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm font-bold">{section.label}</span>
                  </div>
                  {completionStatus[section.key] && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                  {section.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
          
          {activeSection === 'personal' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">👤 Personal Information</h2>
                  <p className="text-gray-400">Basic information about yourself</p>
                </div>
                {completionStatus.personal && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <span>✅</span>
                    <span className="font-medium">Complete</span>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📸</span> Profile Picture
                </h3>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    {formData.personalInfo.profilePictureUrl ? (
                      <img
                        src={formData.personalInfo.profilePictureUrl}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl shadow-lg">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                        id="profile-picture-upload"
                      />
                      <label htmlFor="profile-picture-upload" className="cursor-pointer block">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-white font-medium mb-2">Upload Profile Picture</p>
                        <p className="text-gray-400 text-sm mb-4">
                          {profilePictureUploading ? 'Uploading...' : 'Click to browse or drag and drop'}
                        </p>
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                          <span>📎</span>
                          <span>{profilePictureUploading ? 'Uploading...' : 'Choose Image'}</span>
                        </div>
                      </label>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      Supported: JPEG, PNG • Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.personalInfo.firstName || ''}
                    onChange={(e) => handleInputChange('personalInfo.firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.personalInfo.lastName || ''}
                    onChange={(e) => handleInputChange('personalInfo.lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.personalInfo.email || ''}
                    onChange={(e) => handleInputChange('personalInfo.email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.personalInfo.phone || ''}
                    onChange={(e) => handleInputChange('personalInfo.phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Alternate Phone</label>
                  <input
                    type="tel"
                    value={formData.personalInfo.alternatePhone || ''}
                    onChange={(e) => handleInputChange('personalInfo.alternatePhone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth || ''}
                    onChange={(e) => handleInputChange('personalInfo.dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📍</span> Address Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={formData.personalInfo.address?.street || ''}
                      onChange={(e) => handleInputChange('personalInfo.address.street', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="House number, building, street name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.personalInfo.address?.city || ''}
                        onChange={(e) => handleInputChange('personalInfo.address.city', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                        placeholder="Enter city name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">State *</label>
                      <input
                        type="text"
                        value={formData.personalInfo.address?.state || ''}
                        onChange={(e) => handleInputChange('personalInfo.address.state', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                        placeholder="Enter state name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Postal Code *</label>
                      <input
                        type="text"
                        value={formData.personalInfo.address?.postalCode || ''}
                        onChange={(e) => handleInputChange('personalInfo.address.postalCode', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                        placeholder="Enter PIN code"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.personalInfo.address?.country || 'India'}
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">💼 Professional Information</h2>
                  <p className="text-gray-400">Your current role, experience, and career summary</p>
                </div>
                {completionStatus.professional && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <span>✅</span>
                    <span className="font-medium">Complete</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Professional Summary *</label>
                <textarea
                  value={formData.professionalInfo.bio || ''}
                  onChange={(e) => handleInputChange('professionalInfo.bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all resize-none"
                  placeholder="Write a compelling summary of your professional background, key achievements, and career aspirations..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Current Role *</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.currentRole || ''}
                    onChange={(e) => handleInputChange('professionalInfo.currentRole', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Current Company</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.currentCompany || ''}
                    onChange={(e) => handleInputChange('professionalInfo.currentCompany', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="e.g., Tech Solutions Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Total Experience *</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.totalExperience || ''}
                    onChange={(e) => handleInputChange('professionalInfo.totalExperience', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="e.g., 5 years 3 months"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Relevant Experience</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.relevantExperience || ''}
                    onChange={(e) => handleInputChange('professionalInfo.relevantExperience', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="e.g., 3 years 6 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Current Salary (Annual)</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.currentSalary || ''}
                    onChange={(e) => handleInputChange('professionalInfo.currentSalary', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="e.g., ₹12,00,000"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Expected Salary (Annual)</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.expectedSalary || ''}
                    onChange={(e) => handleInputChange('professionalInfo.expectedSalary', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                    placeholder="e.g., ₹15,00,000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Notice Period</label>
                  <select
                    value={formData.professionalInfo.noticePeriod || ''}
                    onChange={(e) => handleInputChange('professionalInfo.noticePeriod', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="">Select notice period</option>
                    {noticePeriodOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Work Authorization</label>
                  <select
                    value={formData.professionalInfo.workAuthorization || ''}
                    onChange={(e) => handleInputChange('professionalInfo.workAuthorization', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="">Select work authorization</option>
                    {workAuthorizationOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Availability</label>
                <select
                  value={formData.professionalInfo.availability || ''}
                  onChange={(e) => handleInputChange('professionalInfo.availability', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                >
                  <option value="">Select availability</option>
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📄</span> Resume Upload
                </h3>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer block">
                    <div className="text-4xl mb-3">📄</div>
                    {formData.resume.fileName ? (
                      <div>
                        <p className="text-green-400 font-medium mb-2">✓ Resume Uploaded</p>
                        <p className="text-gray-300 text-sm">{formData.resume.fileName}</p>
                        <p className="text-blue-400 text-sm mt-2 hover:text-white">
                          Click to replace resume
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white font-medium mb-2">Upload Your Resume</p>
                        <p className="text-gray-400 text-sm mb-4">
                          {resumeUploading ? 'Uploading...' : 'Click to browse or drag and drop'}
                        </p>
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                          <span>📎</span>
                          <span>{resumeUploading ? 'Uploading...' : 'Choose File'}</span>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Supported: PDF, DOC, DOCX • Max size: 5MB
                </p>
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🎓 Education History</h2>
                  <p className="text-gray-400">Complete academic background</p>
                </div>
                {completionStatus.education && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <span>✅</span>
                    <span className="font-medium">Complete</span>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📚</span> Class 10th
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Board</label>
                    <select
                      value={formData.educationHistory.tenthGrade?.board || ''}
                      onChange={(e) => handleInputChange('educationHistory.tenthGrade.board', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="">Select Board</option>
                      {educationBoards.map(board => (
                        <option key={board} value={board}>{board}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">School Name</label>
                    <input
                      type="text"
                      value={formData.educationHistory.tenthGrade?.schoolName || ''}
                      onChange={(e) => handleInputChange('educationHistory.tenthGrade.schoolName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="Enter school name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Year of Passing</label>
                    <input
                      type="number"
                      value={formData.educationHistory.tenthGrade?.yearOfPassing || ''}
                      onChange={(e) => handleInputChange('educationHistory.tenthGrade.yearOfPassing', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., 2018"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Percentage/Grade</label>
                    <input
                      type="text"
                      value={formData.educationHistory.tenthGrade?.percentage || ''}
                      onChange={(e) => handleInputChange('educationHistory.tenthGrade.percentage', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., 85% or A+"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📖</span> Class 12th
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Board</label>
                    <select
                      value={formData.educationHistory.twelfthGrade?.board || ''}
                      onChange={(e) => handleInputChange('educationHistory.twelfthGrade.board', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="">Select Board</option>
                      {educationBoards.map(board => (
                        <option key={board} value={board}>{board}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">School Name</label>
                    <input
                      type="text"
                      value={formData.educationHistory.twelfthGrade?.schoolName || ''}
                      onChange={(e) => handleInputChange('educationHistory.twelfthGrade.schoolName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="Enter school name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Stream</label>
                    <select
                      value={formData.educationHistory.twelfthGrade?.stream || ''}
                      onChange={(e) => handleInputChange('educationHistory.twelfthGrade.stream', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="">Select Stream</option>
                      {streams.map(stream => (
                        <option key={stream} value={stream}>{stream}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Year of Passing</label>
                    <input
                      type="number"
                      value={formData.educationHistory.twelfthGrade?.yearOfPassing || ''}
                      onChange={(e) => handleInputChange('educationHistory.twelfthGrade.yearOfPassing', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Percentage/Grade</label>
                    <input
                      type="text"
                      value={formData.educationHistory.twelfthGrade?.percentage || ''}
                      onChange={(e) => handleInputChange('educationHistory.twelfthGrade.percentage', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., 88% or A+"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🎓</span> Graduation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Degree</label>
                    <input
                      type="text"
                      value={formData.educationHistory.graduation?.degree || ''}
                      onChange={(e) => handleInputChange('educationHistory.graduation.degree', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., B.Tech, B.E., BCA, B.Sc"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Specialization</label>
                    <input
                      type="text"
                      value={formData.educationHistory.graduation?.specialization || ''}
                      onChange={(e) => handleInputChange('educationHistory.graduation.specialization', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">University</label>
                    <select
                      value={formData.educationHistory.graduation?.university || ''}
                      onChange={(e) => handleInputChange('educationHistory.graduation.university', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                      disabled={loadingUniversities}
                    >
                      <option value="">
                        {loadingUniversities ? 'Loading...' : 'Select university'}
                      </option>
                      {universities.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">College Name</label>
                    <input
                      type="text"
                      value={formData.educationHistory.graduation?.collegeName || ''}
                      onChange={(e) => handleInputChange('educationHistory.graduation.collegeName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="Enter college name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Year of Passing</label>
                    <input
                      type="number"
                      value={formData.educationHistory.graduation?.yearOfPassing || ''}
                      onChange={(e) => handleInputChange('educationHistory.graduation.yearOfPassing', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">CGPA/Percentage</label>
                    <input
                      type="text"
                      value={formData.educationHistory.graduation?.cgpa || ''}
                      onChange={(e) => handleInputChange('educationHistory.graduation.cgpa', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., 8.5 CGPA or 75%"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🎯</span> Post Graduation
                  <span className="ml-2 text-sm text-gray-400">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Degree</label>
                    <input
                      type="text"
                      value={formData.educationHistory.postGraduation?.degree || ''}
                      onChange={(e) => handleInputChange('educationHistory.postGraduation.degree', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., M.Tech, MCA, MBA, M.Sc"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Specialization</label>
                    <input
                      type="text"
                      value={formData.educationHistory.postGraduation?.specialization || ''}
                      onChange={(e) => handleInputChange('educationHistory.postGraduation.specialization', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., AI, Finance"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">University</label>
                    <select
                      value={formData.educationHistory.postGraduation?.university || ''}
                      onChange={(e) => handleInputChange('educationHistory.postGraduation.university', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="">Select university</option>
                      {universities.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Year of Passing</label>
                    <input
                      type="number"
                      value={formData.educationHistory.postGraduation?.yearOfPassing || ''}
                      onChange={(e) => handleInputChange('educationHistory.postGraduation.yearOfPassing', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="e.g., 2026"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🏢 Work Experience</h2>
                  <p className="text-gray-400">Detailed work history</p>
                </div>
                <div className="flex items-center space-x-4">
                  {completionStatus.experience && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <span>✅</span>
                      <span className="font-medium">Complete</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addWorkExperience}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <span>➕</span>
                    <span>Add Experience</span>
                  </button>
                </div>
              </div>

              {formData.workExperienceHistory.map((experience, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="mr-2">💼</span> Experience {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Company Name *</label>
                        <input
                          type="text"
                          value={experience.companyName || ''}
                          onChange={(e) => {
                            const updated = [...formData.workExperienceHistory];
                            updated[index].companyName = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              workExperienceHistory: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Job Title *</label>
                        <input
                          type="text"
                          value={experience.jobTitle || ''}
                          onChange={(e) => {
                            const updated = [...formData.workExperienceHistory];
                            updated[index].jobTitle = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              workExperienceHistory: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="Enter job title"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Employment Type</label>
                        <select
                          value={experience.employmentType || 'Full-time'}
                          onChange={(e) => {
                            const updated = [...formData.workExperienceHistory];
                            updated[index].employmentType = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              workExperienceHistory: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                        >
                          {employmentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Work Mode</label>
                        <select
                          value={experience.workMode || 'On-site'}
                          onChange={(e) => {
                            const updated = [...formData.workExperienceHistory];
                            updated[index].workMode = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              workExperienceHistory: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                        >
                          {workModes.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Location</label>
                        <input
                          type="text"
                          value={experience.location || ''}
                          onChange={(e) => {
                            const updated = [...formData.workExperienceHistory];
                            updated[index].location = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              workExperienceHistory: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="Work location"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Start Date *</label>
                        <input
                          type="date"
                          value={experience.startDate ? experience.startDate.split('T')[0] : ''}
                          onChange={(e) => {
                            const updated = [...formData.workExperienceHistory];
                            updated[index].startDate = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              workExperienceHistory: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">End Date</label>
                        <input
                          type="date"
                          value={experience.endDate ? experience.endDate.split('T')[0] : ''}
                          onChange={(e) => {
                            const updated = [...formData.workExperienceHistory];
                            updated[index].endDate = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              workExperienceHistory: updated
                            }));
                          }}
                          disabled={experience.isCurrentJob}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all disabled:opacity-50"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2 text-gray-300">
                          <input
                            type="checkbox"
                            checked={experience.isCurrentJob || false}
                            onChange={(e) => {
                              const updated = [...formData.workExperienceHistory];
                              updated[index].isCurrentJob = e.target.checked;
                              if (e.target.checked) {
                                updated[index].endDate = '';
                              }
                              setFormData(prev => ({
                                ...prev,
                                workExperienceHistory: updated
                              }));
                            }}
                            className="rounded bg-white/10 border border-white/20"
                          />
                          <span>Current Job</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Key Responsibilities</label>
                      <textarea
                        value={(experience.responsibilities || ['']).join('\n')}
                        onChange={(e) => {
                          const updated = [...formData.workExperienceHistory];
                          updated[index].responsibilities = e.target.value.split('\n').filter(item => item.trim());
                          setFormData(prev => ({
                            ...prev,
                            workExperienceHistory: updated
                          }));
                        }}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all resize-none"
                        placeholder="Enter each responsibility on a new line..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.workExperienceHistory.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💼</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">No Work Experience Added</h3>
                  <p className="text-gray-500 mb-6">Add your work experience to complete your profile</p>
                  <button
                    type="button"
                    onClick={addWorkExperience}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
                  >
                    <span>➕</span>
                    <span>Add Your First Experience</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🛠️ Skills & Certifications</h2>
                  <p className="text-gray-400">Technical skills and certifications</p>
                </div>
                {completionStatus.skills && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <span>✅</span>
                    <span className="font-medium">Complete</span>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">⚡</span> Technical Skills
                </h3>
                
                {Object.entries(skillCategories).map(([category, skills]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-lg font-semibold text-purple-300 mb-3">{category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {skills.map(skill => (
                        <label key={skill} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.skillsAndCertifications.technicalSkills.some(s => 
                              (typeof s === 'string' ? s : s.skillName) === skill
                            )}
                            onChange={(e) => {
                              const currentSkills = formData.skillsAndCertifications.technicalSkills;
                              if (e.target.checked) {
                                const newSkill = { skillName: skill, proficiencyLevel: 'Intermediate' };
                                setFormData(prev => ({
                                  ...prev,
                                  skillsAndCertifications: {
                                    ...prev.skillsAndCertifications,
                                    technicalSkills: [...currentSkills, newSkill]
                                  }
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  skillsAndCertifications: {
                                    ...prev.skillsAndCertifications,
                                    technicalSkills: currentSkills.filter(s => 
                                      (typeof s === 'string' ? s : s.skillName) !== skill
                                    )
                                  }
                                }));
                              }
                            }}
                            className="rounded bg-white/10 border border-white/20"
                          />
                          <span className="text-gray-300 text-sm">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {formData.skillsAndCertifications.technicalSkills.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-3">Your Selected Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.skillsAndCertifications.technicalSkills.map((skill, index) => {
                        const skillName = typeof skill === 'string' ? skill : skill.skillName;
                        return (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-500/30 flex items-center space-x-1"
                          >
                            <span>{skillName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.skillsAndCertifications.technicalSkills.filter((_, i) => i !== index);
                                setFormData(prev => ({
                                  ...prev,
                                  skillsAndCertifications: {
                                    ...prev.skillsAndCertifications,
                                    technicalSkills: updated
                                  }
                                }));
                              }}
                              className="text-blue-300 hover:text-white ml-1"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">🏆</span> Certifications <span className="ml-2 text-sm text-gray-400">(Optional)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    <span>➕</span>
                    <span>Add Certification</span>
                  </button>
                </div>
                
                {formData.skillsAndCertifications.certifications.map((cert, index) => (
                  <div key={index} className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-white font-medium">Certification {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Certification Name *</label>
                        <input
                          type="text"
                          value={cert.name || ''}
                          onChange={(e) => {
                            const updated = [...formData.skillsAndCertifications.certifications];
                            updated[index].name = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              skillsAndCertifications: {
                                ...prev.skillsAndCertifications,
                                certifications: updated
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuer || ''}
                          onChange={(e) => {
                            const updated = [...formData.skillsAndCertifications.certifications];
                            updated[index].issuer = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              skillsAndCertifications: {
                                ...prev.skillsAndCertifications,
                                certifications: updated
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="e.g., Amazon Web Services"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Issue Date</label>
                        <input
                          type="date"
                          value={cert.issueDate ? cert.issueDate.split('T')[0] : ''}
                          onChange={(e) => {
                            const updated = [...formData.skillsAndCertifications.certifications];
                            updated[index].issueDate = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              skillsAndCertifications: {
                                ...prev.skillsAndCertifications,
                                certifications: updated
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Expiry Date (if applicable)</label>
                        <input
                          type="date"
                          value={cert.expiryDate ? cert.expiryDate.split('T')[0] : ''}
                          onChange={(e) => {
                            const updated = [...formData.skillsAndCertifications.certifications];
                            updated[index].expiryDate = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              skillsAndCertifications: {
                                ...prev.skillsAndCertifications,
                                certifications: updated
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Credential ID</label>
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) => {
                            const updated = [...formData.skillsAndCertifications.certifications];
                            updated[index].credentialId = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              skillsAndCertifications: {
                                ...prev.skillsAndCertifications,
                                certifications: updated
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="Credential ID number"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Credential URL</label>
                        <input
                          type="url"
                          value={cert.credentialUrl || ''}
                          onChange={(e) => {
                            const updated = [...formData.skillsAndCertifications.certifications];
                            updated[index].credentialUrl = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              skillsAndCertifications: {
                                ...prev.skillsAndCertifications,
                                certifications: updated
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.skillsAndCertifications.certifications.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No certifications added yet (optional)</p>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">🗣️</span> Languages
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        skillsAndCertifications: {
                          ...prev.skillsAndCertifications,
                          languages: [...prev.skillsAndCertifications.languages, { name: '', proficiency: 'Basic' }]
                        }
                      }));
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <span>➕</span>
                    <span>Add Language</span>
                  </button>
                </div>
                
                {formData.skillsAndCertifications.languages.map((language, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-3">
                    <select
                      value={language.name || ''}
                      onChange={(e) => {
                        const updated = [...formData.skillsAndCertifications.languages];
                        updated[index].name = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          skillsAndCertifications: {
                            ...prev.skillsAndCertifications,
                            languages: updated
                          }
                        }));
                      }}
                      className="flex-1 px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Punjabi">Punjabi</option>
                    </select>
                    <select
                      value={language.proficiency || ''}
                      onChange={(e) => {
                        const updated = [...formData.skillsAndCertifications.languages];
                        updated[index].proficiency = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          skillsAndCertifications: {
                            ...prev.skillsAndCertifications,
                            languages: updated
                          }
                        }));
                      }}
                      className="w-48 px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Native">Native</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.skillsAndCertifications.languages.filter((_, i) => i !== index);
                        setFormData(prev => ({
                          ...prev,
                          skillsAndCertifications: {
                            ...prev.skillsAndCertifications,
                            languages: updated
                          }
                        }));
                      }}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🔗</span> Professional Links
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin || ''}
                      onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">GitHub Profile</label>
                    <input
                      type="url"
                      value={formData.socialLinks.github || ''}
                      onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Portfolio Website</label>
                    <input
                      type="url"
                      value={formData.socialLinks.portfolio || ''}
                      onChange={(e) => handleInputChange('socialLinks.portfolio', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Personal Website</label>
                    <input
                      type="url"
                      value={formData.socialLinks.personalWebsite || ''}
                      onChange={(e) => handleInputChange('socialLinks.personalWebsite', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'references' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🤝 Professional References</h2>
                  <p className="text-gray-400">Professional contacts who can vouch for your work</p>
                </div>
                <div className="flex items-center space-x-4">
                  {completionStatus.references && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <span>✅</span>
                      <span className="font-medium">Complete</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addReference}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <span>➕</span>
                    <span>Add Reference</span>
                  </button>
                </div>
              </div>

              {formData.references.map((reference, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="mr-2">👤</span> Reference {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeReference(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={reference.name || ''}
                          onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].name = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              references: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="Enter reference's full name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Designation *</label>
                        <input
                          type="text"
                          value={reference.designation || ''}
                          onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].designation = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              references: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="Their job title/designation"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={reference.email || ''}
                          onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].email = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              references: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="reference@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={reference.phone || ''}
                          onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].phone = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              references: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Company/Organization</label>
                        <input
                          type="text"
                          value={reference.company || ''}
                          onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].company = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              references: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                          placeholder="Their current company"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">Relationship *</label>
                        <select
                          value={reference.relationship || 'Former Manager'}
                          onChange={(e) => {
                            const updated = [...formData.references];
                            updated[index].relationship = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              references: updated
                            }));
                          }}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                        >
                          <option value="">Select relationship</option>
                          {relationshipTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {formData.references.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">No References Added</h3>
                  <p className="text-gray-500 mb-6">Add professional references to strengthen your profile</p>
                  <button
                    type="button"
                    onClick={addReference}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all"
                  >
                    <span>➕</span>
                    <span>Add Your First Reference</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🎯 Career Goals & Preferences</h2>
                  <p className="text-gray-400">Define your career aspirations</p>
                </div>
                {completionStatus.preferences && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <span>✅</span>
                    <span className="font-medium">Complete</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Career Goals & Aspirations</label>
                <textarea
                  value={formData.careerPreferences.careerGoals || ''}
                  onChange={(e) => handleInputChange('careerPreferences.careerGoals', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all resize-none"
                  placeholder="Describe your short-term and long-term career objectives..."
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Preferred Job Roles</label>
                <input
                  type="text"
                  value={(formData.careerPreferences.preferredRoles || []).join(', ')}
                  onChange={(e) => {
                    const roles = e.target.value.split(',').map(role => role.trim()).filter(role => role);
                    handleInputChange('careerPreferences.preferredRoles', roles);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  placeholder="Software Engineer, Product Manager (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Preferred Work Mode</label>
                  <select
                    value={formData.careerPreferences.preferredWorkMode || ''}
                    onChange={(e) => handleInputChange('careerPreferences.preferredWorkMode', e.target.value || null)}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="">Select work mode (Optional)</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Preferred Company Size</label>
                  <select
                    value={formData.careerPreferences.preferredCompanySize || ''}
                    onChange={(e) => handleInputChange('careerPreferences.preferredCompanySize', e.target.value || null)}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="">Select company size (Optional)</option>
                    <option value="Startup (1-50)">Startup (1-50)</option>
                    <option value="Small (51-200)">Small (51-200)</option>
                    <option value="Medium (201-1000)">Medium (201-1000)</option>
                    <option value="Large (1000+)">Large (1000+)</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">💰</span> Salary Expectations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Minimum (Annual)</label>
                    <input
                      type="text"
                      value={formData.careerPreferences.salaryExpectations?.minimum || ''}
                      onChange={(e) => handleInputChange('careerPreferences.salaryExpectations.minimum', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="₹12,00,000"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Maximum (Annual)</label>
                    <input
                      type="text"
                      value={formData.careerPreferences.salaryExpectations?.maximum || ''}
                      onChange={(e) => handleInputChange('careerPreferences.salaryExpectations.maximum', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      placeholder="₹18,00,000"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.careerPreferences.salaryExpectations?.negotiable || false}
                        onChange={(e) => handleInputChange('careerPreferences.salaryExpectations.negotiable', e.target.checked)}
                        className="rounded bg-white/10 border border-white/20"
                      />
                      <span>Negotiable</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Preferred Work Locations</label>
                <input
                  type="text"
                  value={(formData.careerPreferences.preferredLocations || []).join(', ')}
                  onChange={(e) => {
                    const locations = e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc);
                    handleInputChange('careerPreferences.preferredLocations', locations);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  placeholder="Mumbai, Bangalore, Delhi, Remote (comma-separated)"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.careerPreferences.willingToRelocate || false}
                    onChange={(e) => handleInputChange('careerPreferences.willingToRelocate', e.target.checked)}
                    className="rounded bg-white/10 border border-white/20"
                  />
                  <span>Willing to relocate for the right opportunity</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-center items-center space-x-4 p-8 border-t border-white/10">
            <button
              type="button"
              onClick={handleSaveSection}
              disabled={saving}
              className={`px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                saving ? 'animate-pulse' : ''
              }`}
            >
              <span>💾</span>
              <span>{saving ? 'Saving...' : 'Save Section'}</span>
            </button>
            
            {sections.findIndex(s => s.key === activeSection) < sections.length - 1 && (
              <button
                type="button"
                onClick={handleNextSection}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <span>Next Section</span>
                <span>➡️</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
