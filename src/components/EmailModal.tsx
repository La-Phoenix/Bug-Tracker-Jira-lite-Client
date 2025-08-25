import React, { useState } from 'react';
import { Mail, X, User } from 'lucide-react';

export interface EmailRecipient {
  userId: number;
  name?: string;
  userName?: string;
  email?: string;
  userEmail?: string;
}

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipients: EmailRecipient[];
    defaultSubject?: string;
    defaultBody?: string;
    senderName?: string;
    onEmailSent?: (result: { recipientCount: number; subject: string; success: boolean }) => void;
    onEmailError?: (error: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  recipients,
  defaultSubject = '',
  defaultBody = '',
  senderName = 'Team Lead',
  onEmailSent,
  onEmailError
}) => {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  // Update states when props change
  React.useEffect(() => {
    if (isOpen) {
      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [isOpen, defaultSubject, defaultBody]);

  if (!isOpen) return null;

  const handleSendEmail = () => {
    const emails = recipients
      .map(recipient => recipient.email || recipient.userEmail)
      .filter(Boolean);

    if (emails.length === 0) {
      if (onEmailError) {
        onEmailError('No valid email addresses found');
      }
      return;
    }

    if (!subject.trim()) {
      if (onEmailError) {
        onEmailError('Please enter a subject');
      }
      return;
    }

    if (!body.trim()) {
      if (onEmailError) {
        onEmailError('Please enter a message');
      }
      return;
    }

    try {
      const mailtoLink = `mailto:${emails.join(';')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      
      // Call success callback
      if (onEmailSent) {
        onEmailSent({
          recipientCount: emails.length,
          subject,
          success: true
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error opening email client:', error);
      if (onEmailError) {
        onEmailError('Failed to open email client. Please check if you have an email application installed.');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const recipientCount = recipients.length;
  const validEmailCount = recipients.filter(r => r.email || r.userEmail).length;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Email
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {recipientCount === 1 
                  ? 'Send email to 1 team member' 
                  : `Send email to ${recipientCount} team members`
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recipients ({recipientCount})
              </label>
              {validEmailCount !== recipientCount && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {recipientCount - validEmailCount} without email
                </span>
              )}
            </div>
            
            <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex flex-wrap gap-2">
                {recipients.map((recipient, index) => {
                  const hasEmail = !!(recipient.email || recipient.userEmail);
                  return (
                    <div
                      key={index}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                        hasEmail 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                      }`}
                      title={hasEmail ? (recipient.email || recipient.userEmail) : 'No email address'}
                    >
                      <User className="h-3 w-3" />
                      <span>{recipient.name || recipient.userName}</span>
                      {!hasEmail && (
                        <span className="text-xs opacity-75">(no email)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Hi ${recipients.length === 1 ? (recipients[0].name || recipients[0].userName) : 'Team'},\n\nI hope this message finds you well.\n\nBest regards,\n${senderName}`}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm sm:text-base"
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {body.length}/2000 characters
            </p>
          </div>

          {/* Warning for recipients without email */}
          {validEmailCount !== recipientCount && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> {recipientCount - validEmailCount} selected member{recipientCount - validEmailCount !== 1 ? 's' : ''} 
                {recipientCount - validEmailCount === 1 ? ' does' : ' do'} not have email addresses and will not receive this email.
              </p>
            </div>
          )}

          {/* No valid emails warning */}
          {validEmailCount === 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Warning:</strong> None of the selected members have valid email addresses. 
                The email cannot be sent.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={validEmailCount === 0 || !subject.trim() || !body.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            title={validEmailCount === 0 ? 'No valid email addresses' : ''}
          >
            <Mail className="h-4 w-4" />
            Send Email {validEmailCount > 0 && `(${validEmailCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};