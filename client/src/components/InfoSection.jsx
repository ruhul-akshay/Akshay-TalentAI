
export default function InfoSection() {
  return (
    <div className="bg-white bg-opacity-95 rounded-xl p-6 mt-5 shadow-lg">
      <h3 className="text-gray-800 mb-4 text-lg font-semibold">How it works:</h3>
      <ul className="space-y-3">
        <li className="pb-2 border-b border-gray-100 text-sm text-gray-600 last:border-b-0">
          📝 Set up your job description with required skills and qualifications
        </li>
        <li className="pb-2 border-b border-gray-100 text-sm text-gray-600 last:border-b-0">
          📤 Upload one or multiple PDF/DOCX resume files
        </li>
        <li className="pb-2 border-b border-gray-100 text-sm text-gray-600 last:border-b-0">
          🔍 The system analyzes each resume against the job description
        </li>
        <li className="pb-2 border-b border-gray-100 text-sm text-gray-600 last:border-b-0">
          📊 Get an Excel file with match percentages and matched keywords
        </li>
        <li className="pb-2 border-b border-gray-100 text-sm text-gray-600 last:border-b-0">
          ✅ Review candidates ranked by relevance
        </li>
      </ul>
    </div>
  );
}
