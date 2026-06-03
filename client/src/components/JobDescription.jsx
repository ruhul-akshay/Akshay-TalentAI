
export default function JobDescription({ jobDescription, setJobDescription, onUpdate }) {
  return (
    <div className="bg-white rounded-xl p-6 mb-5 shadow-lg backdrop-blur-sm">
      <h2 className="text-gray-800 mb-4 text-xl font-semibold">Job Description</h2>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Enter the job description with required skills, qualifications, and experience..."
        rows={6}
        className="w-full p-4 border-2 border-gray-200 rounded-lg text-sm resize-y mb-4 transition-colors focus:outline-none focus:border-blue-500"
      />
      <button 
        onClick={onUpdate}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      >
        Update Job Description
      </button>
    </div>
  );
}
