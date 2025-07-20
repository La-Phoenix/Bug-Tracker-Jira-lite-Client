const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow">Open Tickets: 0</div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow">In Progress: 0</div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow">Closed Tickets: 0</div>
      </div>
    </div>
  )
}

export default Dashboard
