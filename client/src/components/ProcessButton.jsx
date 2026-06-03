
export default function ProcessButton({ loading, filesCount, onProcess }) {
  return (
    <div className="bg-white rounded-xl p-6 mb-5 shadow-lg backdrop-blur-sm">
      <button
        onClick={onProcess}
        disabled={loading || filesCount === 0}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? '⏳ Processing...' : '🚀 Process Resumes'}
      </button>
    </div>
  );
}
