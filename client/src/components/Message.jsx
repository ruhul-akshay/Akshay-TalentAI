
export default function Message({ message }) {
  if (!message) return null;

  const isError = message.includes('Error');
  
  return (
    <div className={`p-4 rounded-lg mt-5 font-medium ${
      isError 
        ? 'bg-red-100 text-red-800 border border-red-200' 
        : 'bg-green-100 text-green-800 border border-green-200'
    }`}>
      {message}
    </div>
  );
}
