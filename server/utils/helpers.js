
export function getActivityAction(status) {
  switch (status) {
    case "pending":
      return "New job application received";
    case "reviewing":
      return "Application under review";
    case "shortlisted":
      return "High-match candidate found";
    case "interview-scheduled":
      return "Interview scheduled";
    case "hired":
      return "Candidate hired successfully";
    case "rejected":
      return "Application reviewed";
    default:
      return "Application updated";
  }
}

export function getActivityType(status) {
  switch (status) {
    case "hired":
    case "shortlisted":
    case "interview-scheduled":
      return "success";
    case "rejected":
      return "warning";
    default:
      return "info";
  }
}

export function getActivityIcon(status) {
  switch (status) {
    case "pending":
      return "📝";
    case "reviewing":
      return "👀";
    case "shortlisted":
      return "🎯";
    case "interview-scheduled":
      return "📅";
    case "hired":
      return "🎉";
    case "rejected":
      return "❌";
    default:
      return "📊";
  }
}

export function getActivityPriority(status) {
  switch (status) {
    case "hired":
    case "shortlisted":
      return "high";
    case "interview-scheduled":
    case "reviewing":
      return "medium";
    default:
      return "low";
  }
}

export function formatCandidateStatus(status) {
  switch (status) {
    case "pending":
      return "New";
    case "reviewing":
      return "Reviewing";
    case "shortlisted":
      return "Interview";
    case "interview-scheduled":
      return "Interview";
    case "hired":
      return "Offer Sent";
    case "rejected":
      return "Reviewed";
    default:
      return "New";
  }
}

export function getRandomAvatar() {
  const avatars = ["👩‍💻", "👨‍💼", "👩‍🔬", "👨‍💻", "👩‍💼", "👨‍🔬"];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

export function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
}

export function extractPreviousCompany(text) {
  if (!text) return "Not specified";

  const companies = [
    "Google", "Microsoft", "Apple", "Meta", "Amazon", "Netflix", "Spotify", 
    "Uber", "Airbnb", "TCS", "Infosys", "Wipro", "Accenture"
  ];

  for (const company of companies) {
    if (text.toLowerCase().includes(company.toLowerCase())) {
      return company;
    }
  }

  return "Previous company not specified";
}

export function formatExperience(experience) {
  if (!experience) return "Experience not specified";
  return experience;
}

export function extractExperienceYears(experience) {
  if (!experience) return 0;
  const match = experience.match(/(\d+)[\s]*(?:year|yr)/i);
  return match ? parseInt(match[1]) : Math.floor(Math.random() * 8) + 1;
}

export function isCandidateFresher(experience) {
  if (!experience) return true;
  const years = extractExperienceYears(experience);
  return years <= 1;
}

export function generateMockPhone() {
  const phones = [
    "+1 (555) 123-4567",
    "+1 (555) 234-5678",
    "+1 (555) 345-6789",
    "+1 (555) 456-7890",
    "+1 (555) 567-8901",
  ];
  return phones[Math.floor(Math.random() * phones.length)];
}

export function generateNoticePeriod() {
  const periods = ["Immediate", "2 weeks", "1 month", "2 months", "3 months"];
  return periods[Math.floor(Math.random() * periods.length)];
}

export function extractCurrentCompany(bio) {
  if (!bio) return "Not specified";
  const companies = [
    "Google", "Microsoft", "Apple", "Meta", "Amazon", "Netflix", "Spotify", 
    "TCS", "Infosys", "Wipro", "Accenture", "Startup", "Freelance"
  ];
  return companies[Math.floor(Math.random() * companies.length)];
}

export function generateTotalExperience() {
  const years = Math.floor(Math.random() * 10) + 1;
  return `${years} year${years > 1 ? "s" : ""}`;
}

export function generateRelevantExperience() {
  const years = Math.floor(Math.random() * 8) + 1;
  return `${years} year${years > 1 ? "s" : ""}`;
}

export function generateDegree() {
  const degrees = [
    "B.Tech CSE", "B.E. Computer Science", "BCA", "MCA", "M.Tech", 
    "MS Computer Science", "B.Sc IT"
  ];
  return degrees[Math.floor(Math.random() * degrees.length)];
}

export function generateUniversity() {
  const universities = [
    "IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani", 
    "VIT Vellore", "SRM University", "Anna University", "Delhi University"
  ];
  return universities[Math.floor(Math.random() * universities.length)];
}

export function generateGraduationYear() {
  const currentYear = new Date().getFullYear();
  return Math.floor(Math.random() * 10) + (currentYear - 10);
}

export function generateGPA() {
  return (Math.random() * 2 + 7).toFixed(2);
}

export function generateABCId() {
  const hasABC = Math.random() > 0.7;
  if (hasABC) {
    return `ABC${Math.floor(Math.random() * 900000) + 100000}`;
  }
  return null;
}

export function formatSalary(salaryRange) {
  if (!salaryRange || (!salaryRange.min && !salaryRange.max))
    return "Competitive";
  if (salaryRange.min && salaryRange.max) {
    return `$${salaryRange.min}k - $${salaryRange.max}k`;
  }
  return salaryRange.min
    ? `$${salaryRange.min}k+`
    : `Up to $${salaryRange.max}k`;
}
