import { motion } from "framer-motion";

function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-xl p-6 mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, Student 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Here’s your dashboard overview.
        </p>
      </motion.div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700">
            📚 My Subjects
          </h2>
          <p className="text-gray-500 mt-2">
            View enrolled subjects and materials.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700">
            📝 Assignments
          </h2>
          <p className="text-gray-500 mt-2">
            Track upcoming submissions.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700">
            📊 Performance
          </h2>
          <p className="text-gray-500 mt-2">
            Monitor your academic progress.
          </p>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;