import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Search,
  Trash2,
  Shield,
  AlertCircle,
  Grid3X3,
  List,
  UserPlus,
  User,
  Award,
  Clock,
  Target,
  MessageSquare,
  Activity,
  Filter,
  ChevronDown,
  Mail,
  CheckCircle,
  X
} from 'lucide-react';
import { UserService } from '../services/UserService';
import { IssueService } from '../services/IssueServices';
import { TeamSkeleton } from '../components/TeamSkeleton';
import type { User as UserType, Issue, ApiResponse, Project } from '../types/interface';
import { useAuth } from '../contexts/AuthContext';
import { EmailModal, type EmailRecipient } from '../components/EmailModal';
import { MessagePromptModal } from '../components/MessagePromptModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ProjectService } from '../services/ProjectService';
import { ProjectSelectionModal } from '../components/ProjectSelectionModal';
import { AddUserToProjectModal } from '../components/Team/AddUserToProjectModal';

export interface TeamMember {
  userId: number;
  userName: string;
  userRole: "Admin" | "User";
  activeIssues: number;
  resolvedIssues: number;
  lastActive: string;
  userEmail: string;
  performance: 'excellent' | 'good' | 'average' | 'needs-attention';
  sharedProjects: Project[]
}

const Team: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Email modal states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  
  // Add User Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
  const [addUserProgress, setAddUserProgress] = useState<{ current: number; total: number; currentUser?: string } | null>(null);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    isLoading?: boolean;
  } | null>(null);

  // Message modal state
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    title: string;
    onSend: (message: string) => void;
    isLoading?: boolean;
  } | null>(null);

  // Operation feedback states
  const [operationError, setOperationError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Project management states
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [selectedProjectForRemoval, setSelectedProjectForRemoval] = useState<number | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // View and selection
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);
  const [isProjectSelectionOpen, setIsProjectSelectionOpen] = useState(false);

  useEffect(() => {
    loadTeamData();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, searchTerm, roleFilter, performanceFilter]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersResponse, issuesResponse, projectsResponse] = await Promise.all([
        UserService.getTeamMembers(),
        IssueService.getUserProjectsIssues(),
        ProjectService.getMyProjects()
      ]);

      // Set user's projects
      if (projectsResponse.success && projectsResponse.data) {
        setUserProjects(projectsResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        const issues = issuesResponse.success ? issuesResponse.data || [] : [];
        setAllIssues(issues);
        
        // Enhanced members logic
        const enhancedMembers: any[] = usersResponse.data.map(user => {
          const userIssues = issues.filter(issue => issue.assigneeId === user.id);
          const activeIssues = userIssues.filter(issue => 
            issue.statusName?.toLowerCase() === 'open' || 
            issue.statusName?.toLowerCase().includes('progress')
          ).length;
          const resolvedIssues = userIssues.filter(issue => 
            issue.statusName?.toLowerCase() === 'resolved'
          ).length;
          
          let performance: 'excellent' | 'good' | 'average' | 'needs-attention' = 'average';
          const totalIssues = userIssues.length;
          if (totalIssues > 0) {
            const resolvedRatio = resolvedIssues / totalIssues;
            if (resolvedRatio >= 0.8) performance = 'excellent';
            else if (resolvedRatio >= 0.6) performance = 'good';
            else if (resolvedRatio >= 0.4) performance = 'average';
            else performance = 'needs-attention';
          }

          return {
            ...user,
            activeIssues,
            resolvedIssues,
            lastActive: user.updatedAt || user.createdAt,
            performance
          };
        });

        setTeamMembers(enhancedMembers);
      } else {
        setError(usersResponse.message || 'Failed to fetch team data');
      }
    } catch (err: any) {
      console.error('Error loading team:', err);
      setError('An error occurred while loading team data');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...teamMembers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.userRole?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.performance === performanceFilter
      );
    }

    setFilteredMembers(filtered);
  };

  
  // Add function to handle adding users to project (around line 500)
  const handleAddUsersToProject = async (
    projectId: number, 
    users: Array<{ userId: number; role: 'Admin' | 'Member' }>
  ) => {
    try {
      let successCount = 0;
      let failedUsers: string[] = [];
      
      // Set up progress tracking
      setAddUserProgress({ current: 0, total: users.length });
      
      // Process each user individually
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userData = availableUsers.find(u => u.userId === user.userId);
        const userName = userData?.userName || `User ${user.userId}`;
        
        // Update progress
        setAddUserProgress({
          current: i + 1,
          total: users.length,
          currentUser: userName
        });
        
        try {
          const response = await ProjectService.addProjectMembers(
            projectId, 
            user.userId, 
            user.role === 'Admin' ? 'Admin' : 'Member'
          );
          
          if (response.success) {
            successCount++;
          } else {
            failedUsers.push(userName);
          }
        } catch (error) {
          failedUsers.push(userName);
        }
        
        // Small delay between requests to prevent overwhelming the server
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Clear progress
      setAddUserProgress(null);
      
      // Show results (same as before)
      if (successCount > 0) {
        const adminCount = users.filter(u => u.role === 'Admin').length;
        const memberCount = users.filter(u => u.role === 'Member').length;
        
        let message = `Successfully added ${successCount} user${successCount === 1 ? '' : 's'} to project`;
        if (adminCount > 0 && memberCount > 0) {
          message += ` (${adminCount} admin${adminCount === 1 ? '' : 's'}, ${memberCount} member${memberCount === 1 ? '' : 's'})`;
        } else if (adminCount > 0) {
          message += ` as admin${adminCount === 1 ? '' : 's'}`;
        } else {
          message += ` as member${memberCount === 1 ? '' : 's'}`;
        }
        
        showSuccess(message);
        loadTeamData();
      }
      
      if (failedUsers.length > 0) {
        showError(`Failed to add ${failedUsers.length} user${failedUsers.length === 1 ? '' : 's'}: ${failedUsers.join(', ')}`);
      }
      
    } catch (error: any) {
      setAddUserProgress(null);
      console.error('Error adding users to project:', error);
      showError(`Error adding users: ${error.message || 'Please try again'}`);
    }
  };

  const showError = (message: string) => {
    setOperationError(message);
    setTimeout(() => setOperationError(''), 5000);
  };

  const closeConfirmationModal = () => {
    if (!confirmationModal?.isLoading) {
      setConfirmationModal(null);
    }
  };

  const closeMessageModal = () => {
    if (!messageModal?.isLoading) {
      setMessageModal(null);
    }
  };

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
  if (selectedMembers.length === filteredMembers.length && filteredMembers.length > 0) {
    // If all are selected, deselect all
    setSelectedMembers([]);
  } else {
    // If none or some are selected, select all filtered members
    setSelectedMembers(filteredMembers.map(member => member.userId));
  }
};

  const getUserProjects = async(userId: number) => {
    const resp = await ProjectService.getMyProjects(userId);
    if(resp.success) {
      setUserProjects(resp.data);
    } else{
      showError(resp.message || resp.errors.map(e => e).join(" ") || "Failed to fecth projects")
    }
  }

  const handleRemoveMember = async (member: TeamMember) => {
    setRemovingMember(member);
    await getUserProjects(member.userId);
    confirmRemove();
  };

  const confirmRemove = async () => {
    if (!removingMember) return;
    
    // If user has no projects or only one project, proceed directly
    // if (userProjects.length <= 1) {
    if (userProjects.length < 1) {
      const projectId = userProjects.length === 1 ? userProjects[0].id : null;
      showRemovalConfirmation(projectId);
      return;
    }
    
    // Show project selection modal first
    setIsProjectSelectionOpen(true);
  };

  const handleProjectSelection = (projectId: number) => {
    setSelectedProjectForRemoval(projectId);
    setIsProjectSelectionOpen(false);
    showRemovalConfirmation(projectId);
  };

  const showRemovalConfirmation = (projectId: number | null) => {
    if (!removingMember) return;
    
    const project = userProjects.find(p => p.id === projectId);
    const projectName = project ? project.name : 'the organization';
    
    setConfirmationModal({
      isOpen: true,
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${removingMember.userName} from ${projectName}?\n\nThey will lose access to this project and its issues.`,
      variant: 'danger',
      confirmText: 'Remove Member',
      onConfirm: async () => {
        try {
          setConfirmationModal(prev => prev ? { ...prev, isLoading: true } : null);
          
          let response: ApiResponse<any>;
          if (projectId) {
            // Remove from specific project
            console.log("removingMember: ", removingMember)
            response = await ProjectService.removeProjectMember(projectId, removingMember.userId);
          } else {
            // Handle case where user has no projects
            setConfirmationModal(null);
            showError('Member is not assigned to any project yet.');
            return;
          }
          
          if (response.success) {
            setTeamMembers(prev => prev.filter(m => m.userId !== removingMember.userId));
            setSelectedMembers(prev => prev.filter(id => id !== removingMember.userId));
            
            setConfirmationModal(null);
            setRemovingMember(null);
            setSelectedProjectForRemoval(null);
            showSuccess(`${removingMember.userName} has been removed from ${projectName}`);
          } else {
            setConfirmationModal(null);
            showError(response?.message || 'Failed to remove team member');
          }
        } catch (err: any) {
          console.error('Error removing team member:', err);
          setConfirmationModal(null);
          showError(`Error removing team member: ${err.message || 'Please try again'}`);
        }
      }
    });
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'lead':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'senior':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'developer':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300';
      case 'tester':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'average':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'needs-attention':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
      case 'lead':
        return <UserPlus className="h-4 w-4" />;
      case 'senior':
        return <Award className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Award className="h-4 w-4" />;
      case 'good':
        return <Target className="h-4 w-4" />;
      case 'average':
        return <Clock className="h-4 w-4" />;
      case 'needs-attention':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays <= 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendEmail = (member: TeamMember, isSelected = false) => {
    const recipients: EmailRecipient[] = isSelected 
      ? selectedMembers
          .map(id => filteredMembers.find(m => m.userId === id))
          .filter(Boolean) as TeamMember[]
      : [member];

    // Check for valid email addresses
    const validEmails = recipients.filter(r => r.email || r.userEmail);
    const invalidCount = recipients.length - validEmails.length;

    if (validEmails.length === 0) {
      showError('No valid email addresses found for selected members');
      return;
    }

    // Show confirmation if some members don't have emails
    if (invalidCount > 0) {
      const memberNames = recipients.slice(0, 3).map(r => r.name || r.userName).join(', ');
      setConfirmationModal({
        isOpen: true,
        title: 'Send Email with Missing Addresses',
        message: `${invalidCount} selected member${invalidCount === 1 ? '' : 's'} ${invalidCount === 1 ? 'does' : 'do'} not have email addresses.\n\nContinue sending to ${validEmails.length} member${validEmails.length === 1 ? '' : 's'} (${memberNames}${recipients.length > 3 ? '...' : ''})?`,
        variant: 'warning',
        confirmText: 'Continue',
        onConfirm: () => {
          setConfirmationModal(null);
          setEmailRecipients(recipients);
          setIsEmailModalOpen(true);
        }
      });
      return;
    }

    setEmailRecipients(recipients);
    setIsEmailModalOpen(true);
  };

  const handleBulkEmail = () => {
    if (selectedMembers.length === 0) {
      showError('Please select team members first');
      return;
    }
    
    const selectedMembersList = selectedMembers
      .map(id => filteredMembers.find(m => m.userId === id))
      .filter(Boolean) as TeamMember[];
      
    const memberNames = selectedMembersList
      .slice(0, 3)
      .map(m => m.userName)
      .join(', ');
      
    setConfirmationModal({
      isOpen: true,
      title: 'Send Bulk Email',
      message: `Send email to ${selectedMembers.length} selected member${selectedMembers.length === 1 ? '' : 's'}?\n\n${memberNames}${selectedMembers.length > 3 ? '...' : ''}`,
      variant: 'info',
      confirmText: 'Send Email',
      onConfirm: () => {
        setConfirmationModal(null);
        handleSendEmail(filteredMembers[0], true);
      }
    });
  };

  const getEmailDefaults = () => {
    const isMultiple = emailRecipients.length > 1;
    
    const subject = isMultiple 
      ? `Team Update - ${emailRecipients.length} members`
      : `Message for ${emailRecipients[0]?.name || emailRecipients[0]?.userName}`;
        
    const body = isMultiple
      ? `Hi Team,\n\nI hope this message finds you all well.\n\nBest regards,\n${user?.name || 'Team Lead'}`
      : `Hi ${emailRecipients[0]?.name || emailRecipients[0]?.userName},\n\nI hope this message finds you well.\n\nBest regards,\n${user?.name || 'Team Lead'}`;
        
    return { subject, body };
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleEmailSent = (result: { recipientCount: number; subject: string; success: boolean }) => {
    if (result.success) {
      showSuccess(`Email client opened for ${result.recipientCount} recipient${result.recipientCount === 1 ? '' : 's'}`);
      
      // Clear selection after bulk email
      if (selectedMembers.length > 0) {
        setSelectedMembers([]);
      }
    }
  };

  const handleEmailError = (error: string) => {
    showError(error);
  };
  
  const handleSendMessage = async (member: TeamMember, isSelected = false) => {
    const recipientCount = isSelected ? selectedMembers.length : 1;
    const recipientNames = isSelected 
      ? selectedMembers.map(id => {
          const m = filteredMembers.find(m => m.userId === id);
          return m?.userName;
        }).filter(Boolean).slice(0, 3).join(', ')
      : (member.userName);

    const title = isSelected 
      ? `Send message to ${recipientCount} selected members (${recipientNames}${recipientCount > 3 ? '...' : ''})`
      : `Send message to ${ member.userName}`;

    setMessageModal({
      isOpen: true,
      title,
      onSend: async (message: string) => {
        try {
          setMessageModal(prev => prev ? { ...prev, isLoading: true } : null);
          
          // Simulate API call - replace with your actual messaging service
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Sending message:', {
            recipients: isSelected ? selectedMembers : [member.userId],
            message,
            sender: user?.id
          });
          
          setMessageModal(null);
          showSuccess(
            isSelected 
              ? `Message sent to ${recipientCount} team members!`
              : `Message sent to ${member.userName}!`
          );
          
          // Clear selection after bulk action
          if (isSelected) {
            setSelectedMembers([]);
          }
          
        } catch (error: any) {
          console.error('Error sending message:', error);
          setMessageModal(null);
          showError(`Failed to send message: ${error.message || 'Please try again'}`);
        }
      }
    });
  };
  const openAddUserModal = () => {
    loadAvailableUsers();
    setIsAddUserModalOpen(true);
  };

  const loadAvailableUsers = async () => {
    try {
      // Get all users as fallback - this is now only used as initial data
      const users = (await UserService.getAllUsers()).data;
      const potentialMembers: TeamMember[] = users
        .map(u => ({
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          userRole: u.role ?? "User",
          activeIssues: 0,
          resolvedIssues: 0,
          lastActive: new Date().toISOString(),
          performance: "average",
          sharedProjects: []
        }));
      setAvailableUsers(potentialMembers);
    } catch (error) {
      console.error('Error loading available users:', error);
      showError('Failed to load available users');
    }
  };

  const handleBulkMessage = () => {
    if (selectedMembers.length === 0) {
      showError('Please select team members first');
      return;
    }
    handleSendMessage(filteredMembers[0], true);
  };

  const getInitials = (name?: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Action buttons component
  const ActionButtons: React.FC<{ member: TeamMember; className?: string }> = ({ 
    member, 
    className = "" 
  }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <button 
        onClick={() => handleSendMessage(member)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-blue-600 cursor-pointer dark:hover:text-blue-400 transition-colors" 
        title="Send message"
      >
        <MessageSquare className="h-4 w-4" />
      </button>
      <button 
        onClick={() => handleSendEmail(member)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-green-600 cursor-pointer dark:hover:text-green-400 transition-colors" 
        title="Send email"
      >
        <Mail className="h-4 w-4" />
      </button>
      {member?.userRole !== "Admin" && (
        <button 
          onClick={() => handleRemoveMember(member)}
          className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 cursor-pointer dark:hover:text-red-400 transition-colors" 
          title="Remove member"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );


  if (loading) {
    return <TeamSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Team
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadTeamData}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.activeIssues && m.activeIssues > 0).length,
    highPerformers: teamMembers.filter(m => m.performance === 'excellent').length,
    totalActiveIssues: teamMembers.reduce((sum, m) => sum + (m.activeIssues || 0), 0)
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Team
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Manage your development team and track performance
            </p>
          </div>
          {/* {user?.role === "Admin" && ( */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors shadow-sm text-sm sm:text-base"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Member</span>
              </button>
              <button
                onClick={openAddUserModal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors shadow-sm text-sm sm:text-base"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add to Project</span>
              </button>
            </div>
          {/* )} */}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{teamStats.total}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Team Members</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{teamStats.active}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Members</p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{teamStats.highPerformers}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">High Performers</p>
              </div>
              <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{teamStats.totalActiveIssues}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Issues</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          {/* Main Search Bar */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search Input */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex lg:hidden text-gray-700 dark:text-gray-300 items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(roleFilter !== 'all' || performanceFilter !== 'all') && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {(roleFilter !== 'all' ? 1 : 0) + (performanceFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="lead">Team Lead</option>
                    <option value="senior">Senior</option>
                    <option value="developer">Developer</option>
                    <option value="tester">Tester</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Performance Filter */}
                <div className="relative">
                  <select
                    value={performanceFilter}
                    onChange={(e) => setPerformanceFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-40"
                  >
                    <option value="all">All Performance</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="needs-attention">Needs Attention</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="lg:hidden border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="lead">Team Lead</option>
                    <option value="senior">Senior</option>
                    <option value="developer">Developer</option>
                    <option value="tester">Tester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</label>
                  <select
                    value={performanceFilter}
                    onChange={(e) => setPerformanceFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Performance</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="needs-attention">Needs Attention</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">View</label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium">{filteredMembers.length}</span> of <span className="font-medium">{teamMembers.length}</span> members
              </p>
              {selectedMembers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{selectedMembers.length}</span> selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleBulkMessage}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Message
                    </button>
                    <button 
                      onClick={handleBulkEmail}
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      Email
                    </button>
                    {user?.role === "Admin" && (
                      <button className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
                        Change Role
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Members Grid/List */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMembers.map((member) => (
              <div key={member.userId} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                      {getInitials( member.userName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                        { member.userName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {member.userEmail}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.userId)}
                    onChange={() => handleSelectMember(member.userId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Role and Performance */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Role:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.userRole as string)}`}>
                      {getRoleIcon(member.userRole as string)}
                      <span className="hidden sm:inline">{member.userRole || 'Member'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Performance:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance || 'average')}`}>
                      {getPerformanceIcon(member.performance || 'average')}
                      <span className="hidden sm:inline capitalize">{member.performance || 'Average'}</span>
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                    <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{member.activeIssues || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 sm:p-3 text-center">
                    <p className="text-lg sm:text-xl font-semibold text-emerald-600 dark:text-emerald-400">{member.resolvedIssues || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Resolved</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => handleSendMessage(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                  <button 
                    onClick={() => handleSendEmail(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-600 cursor-pointer transition-colors"
                  >
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </button>
                  {member?.userRole !== "Admin" && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:border-red-300 dark:hover:border-red-700 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  // Add indeterminate state for partial selection
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length;
                    }
                  }}
                />
                <div className="ml-4 grid grid-cols-12 gap-4 w-full text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <div className="col-span-3">Member</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Performance</div>
                  <div className="col-span-2">Active Issues</div>
                  <div className="col-span-2">Last Active</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMembers.map((member) => (
                <div key={member.userId} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.userId)}
                        onChange={() => handleSelectMember(member.userId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {getInitials( member.userName)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-1">
                              { member.userName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {member.userEmail}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.userRole as string)}`}>
                            {getRoleIcon(member.userRole as string)}
                            {member.userRole || 'Member'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance || 'average')}`}>
                            {getPerformanceIcon(member.performance || 'average')}
                            {member.performance || 'Average'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{member.activeIssues || 0} active</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            <span>{member.resolvedIssues || 0} resolved</span>
                          </div>
                          <span>•</span>
                          <span>Active {formatDate(member.lastActive)}</span>
                        </div>
                      </div>
                      <ActionButtons member={member} />
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.userId)}
                      onChange={() => handleSelectMember(member.userId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-4 grid grid-cols-12 gap-4 w-full items-center">
                      {/* Member */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(member.userName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            { member.userName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {member.userEmail}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.userRole as string)}`}>
                          {getRoleIcon(member.userRole as string)}
                          {member.userRole || 'Member'}
                        </span>
                      </div>

                      {/* Performance */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance || 'average')}`}>
                          {getPerformanceIcon(member.performance || 'average')}
                          {member.performance || 'Average'}
                        </span>
                      </div>

                      {/* Issues */}
                      <div className="col-span-2">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">{member.activeIssues || 0}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {member.resolvedIssues || 0} resolved
                          </div>
                        </div>
                      </div>

                      {/* Last Active */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(member.lastActive )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <ActionButtons member={member} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredMembers.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <UsersIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No team members found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
              {searchTerm || roleFilter !== 'all' || performanceFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start building your team by inviting members'}
            </p>
            {!searchTerm && roleFilter === 'all' && performanceFilter === 'all' && user?.role === "Admin" && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                Invite Team Member
              </button>
            )}
          </div>
        )}
      </div>

      {/* Success/Error Notifications */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-800 border-2 border-green-300 dark:border-green-600 rounded-lg p-4 shadow-xl z-50 max-w-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                Success!
              </p>
              <p className="text-xs text-green-800 dark:text-green-200">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {operationError && (
        <div className="fixed top-4 right-4 bg-red-100 dark:bg-red-800 border-2 border-red-300 dark:border-red-600 rounded-lg p-4 shadow-xl z-50 max-w-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                Error
              </p>
              <p className="text-xs text-red-800 dark:text-red-200">
                {operationError}
              </p>
            </div>
            <button
              onClick={() => setOperationError('')}
              className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        title="Select Project(s)"
        isOpen={isProjectSelectionOpen}
        onClose={() => setIsProjectSelectionOpen(false)}
        onSelect={handleProjectSelection}
        projects={userProjects}
        memberName={ removingMember?.userName || ''}
      />

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={closeConfirmationModal}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          isLoading={confirmationModal.isLoading}
          variant={confirmationModal.variant}
        />
      )}

      {/* Message Modal */}
      {messageModal && (
        <MessagePromptModal
          isOpen={messageModal.isOpen}
          onClose={closeMessageModal}
          onSend={messageModal.onSend}
          title={messageModal.title}
          isLoading={messageModal.isLoading}
        />
      )}

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipients={emailRecipients}
        defaultSubject={getEmailDefaults().subject}
        defaultBody={getEmailDefaults().body}
        senderName={user?.name || 'Team Lead'}
        onEmailSent={handleEmailSent}
        onEmailError={handleEmailError}
      />
      {/* Add Users to Project Modal */}
      <AddUserToProjectModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        projects={userProjects}
        availableUsers={availableUsers}
        onAddUsers={handleAddUsersToProject}
        isLoading={!!addUserProgress}
        progress={addUserProgress!}
      />
    </div>
  );
};

export default Team;