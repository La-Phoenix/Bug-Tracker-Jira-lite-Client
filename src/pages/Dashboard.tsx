import { useState, useEffect } from 'react';
import { Search, Plus, Bug, AlertCircle, CheckCircle, Clock, User, Calendar} from 'lucide-react';

interface Status{
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  reporter: string;
  created: string;
  labels: string[];
  type: 'bug' | 'feature' | 'task';
}
// interface tickets {
//     id: string;
//     title: string;
//     description: string;
//     status: 'open' | 'in-progress' | 'resolved';
//     priority: 'critical' | 'high' | 'medium' | 'low';
//     assignee: string;
//     reporter: string;
//     created: string;
//     labels: string[];
//     type: string;
// }[]

const DashboardPage = () => {
  const [tickets, setTickets] = useState([
    {
      id: 'BUG-001',
      title: 'Login form validation not working',
      description: 'Users can submit empty login forms without validation errors',
      status: 'open',
      priority: 'high',
      assignee: 'John Doe',
      reporter: 'Jane Smith',
      created: '2025-07-20',
      labels: ['frontend', 'validation'],
      type: 'bug'
    },
    {
      id: 'BUG-002',
      title: 'Database connection timeout',
      description: 'Intermittent database timeouts causing 500 errors',
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Mike Johnson',
      reporter: 'Sarah Wilson',
      created: '2025-07-19',
      labels: ['backend', 'database'],
      type: 'bug'
    },
    {
      id: 'FEAT-003',
      title: 'Add dark mode toggle',
      description: 'Implement system-wide dark mode with user preference storage',
      status: 'resolved',
      priority: 'medium',
      assignee: 'Alice Brown',
      reporter: 'Tom Davis',
      created: '2025-07-18',
      labels: ['frontend', 'ui'],
      type: 'feature'
    },
    {
      id: 'BUG-004',
      title: 'Memory leak in dashboard',
      description: 'Dashboard component causing memory leaks on long sessions',
      status: 'open',
      priority: 'medium',
      assignee: 'Chris Lee',
      reporter: 'Emma Taylor',
      created: '2025-07-17',
      labels: ['frontend', 'performance'],
      type: 'bug'
    }
  ]);

  const [filteredTickets, setFilteredTickets] = useState(tickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    type: 'bug',
    labels: []
  });

  useEffect(() => {
    let filtered = tickets;
    
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // const getStatusIcon = (status: Status["status"]) => {
  //   switch (status) {
  //     case 'open': return <AlertCircle className="w-4 h-4" />;
  //     case 'in-progress': return <Clock className="w-4 h-4" />;
  //     case 'resolved': return <CheckCircle className="w-4 h-4" />;
  //     default: return <Bug className="w-4 h-4" />;
  //   }
  // };

  const getStatusColor = (status: Status["status"]) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-900/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-900/20';
      case 'resolved': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: Status["priority"]) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const createTicket = () => {
    if (!newTicket.title || !newTicket.description) return;
    
    const ticket = {
      id: `${newTicket.type.toUpperCase()}-${String(tickets.length + 1).padStart(3, '0')}`,
      ...newTicket,
      status: 'open',
      reporter: 'Current User',
      created: new Date().toISOString().split('T')[0],
      labels: newTicket.labels.length > 0 ? newTicket.labels : ['unlabeled']
    };
    
    setTickets([...tickets, ticket]);
    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      type: 'bug',
      labels: []
    });
    setShowCreateModal(false);
  };

  const updateTicketStatus = (id: string, newStatus: Status["status"]) => {
    setTickets(tickets.map(ticket =>
      ticket.id === id ? { ...ticket, status: newStatus } : ticket
    ));
  };

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* <Bug className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" /> */}
            <h1 className="text-lg sm:text-2xl font-bold">Issue</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-4 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Issue</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-gray-800 p-3 sm:p-6 rounded-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-400 text-xs sm:text-sm">Open Issues</p>
                <p className="text-xl sm:text-3xl font-bold text-red-400">{stats.open}</p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 self-end sm:self-auto" />
            </div>
          </div>
          <div className="bg-gray-800 p-3 sm:p-6 rounded-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-400 text-xs sm:text-sm">In Progress</p>
                <p className="text-xl sm:text-3xl font-bold text-yellow-400">{stats.inProgress}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 self-end sm:self-auto" />
            </div>
          </div>
          <div className="bg-gray-800 p-3 sm:p-6 rounded-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-400 text-xs sm:text-sm">Resolved</p>
                <p className="text-xl sm:text-3xl font-bold text-green-400">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 self-end sm:self-auto" />
            </div>
          </div>
          <div className="bg-gray-800 p-3 sm:p-6 rounded-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-400 text-xs sm:text-sm">Total Issues</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-400">{stats.total}</p>
              </div>
              <Bug className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 self-end sm:self-auto" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-700 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-initial bg-gray-700 border border-gray-600 rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 sm:flex-initial bg-gray-700 border border-gray-600 rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-6 hover:border-gray-600 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-blue-400 font-mono text-xs sm:text-sm">{ticket.id}</span>
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getPriorityColor(ticket.priority as any)}`}></div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{ticket.priority}</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded sm:hidden">{ticket.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value as Status["status"])}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(ticket.status as any)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-2 leading-tight">{ticket.title}</h3>
              <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">{ticket.description}</p>
              
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                {ticket.labels.map((label, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    {label}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-400 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">Assigned: {ticket.assignee || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Created: {ticket.created}</span>
                  </div>
                </div>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded hidden sm:inline">{ticket.type}</span>
              </div>
            </div>
          ))}
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <Bug className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No issues found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold">Create New Issue</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-200 p-1"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter issue title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-100 focus:ring-2 focus:ring-blue-500 h-20 sm:h-24 resize-none"
                    placeholder="Describe the issue..."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={newTicket.type}
                      onChange={(e) => setNewTicket({...newTicket, type: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                      <option value="task">Task</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assignee</label>
                  <input
                    type="text"
                    value={newTicket.assignee}
                    onChange={(e) => setNewTicket({...newTicket, assignee: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assignee name..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={createTicket}
                  disabled={!newTicket.title || !newTicket.description}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors order-1 sm:order-2"
                >
                  Create Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;