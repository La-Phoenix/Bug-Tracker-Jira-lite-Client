import type { Label } from '../types/interface';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Mock labels data
const mockLabels: Label[] = [
  {
    id: 1,
    name: 'Bug',
    color: '#dc2626',
    description: 'Something is not working correctly',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 2,
    name: 'Feature Request',
    color: '#059669',
    description: 'New functionality or enhancement',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  },
  {
    id: 3,
    name: 'Documentation',
    color: '#2563eb',
    description: 'Improvements or additions to documentation',
    createdAt: '2024-01-17T13:20:00Z',
    updatedAt: '2024-01-18T16:10:00Z'
  },
  {
    id: 4,
    name: 'High Priority',
    color: '#dc2626',
    description: 'Issues that need immediate attention',
    createdAt: '2024-01-18T08:30:00Z',
    updatedAt: '2024-01-25T12:00:00Z'
  },
  {
    id: 5,
    name: 'Low Priority',
    color: '#6b7280',
    description: 'Nice to have improvements',
    createdAt: '2024-01-19T15:45:00Z',
    updatedAt: '2024-01-19T15:45:00Z'
  },
  {
    id: 6,
    name: 'UI/UX',
    color: '#7c3aed',
    description: 'User interface and experience related',
    createdAt: '2024-01-20T10:20:00Z',
    updatedAt: '2024-01-23T09:15:00Z'
  },
  {
    id: 7,
    name: 'Backend',
    color: '#059669',
    description: 'Server-side and API related issues',
    createdAt: '2024-01-21T14:10:00Z',
    updatedAt: '2024-01-24T17:30:00Z'
  },
  {
    id: 8,
    name: 'Testing',
    color: '#ea580c',
    description: 'Testing and quality assurance',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z'
  }
];

export const LabelService = {
  getAllLabels: async (): Promise<ApiResponse<Label[]>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: mockLabels,
      message: 'Labels fetched successfully'
    };
  },

  getLabelById: async (id: number): Promise<ApiResponse<Label>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const label = mockLabels.find(l => l.id === id);
    if (!label) {
      return {
        success: false,
        message: 'Label not found'
      };
    }

    return {
      success: true,
      data: label,
      message: 'Label fetched successfully'
    };
  },

  createLabel: async (labelData: Omit<Label, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Label>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newLabel: Label = {
      ...labelData,
      id: Math.max(...mockLabels.map(l => l.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockLabels.push(newLabel);

    return {
      success: true,
      data: newLabel,
      message: 'Label created successfully'
    };
  },

  updateLabel: async (id: number, labelData: Partial<Omit<Label, 'id' | 'createdAt'>>): Promise<ApiResponse<Label>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const labelIndex = mockLabels.findIndex(l => l.id === id);
    if (labelIndex === -1) {
      return {
        success: false,
        message: 'Label not found'
      };
    }

    mockLabels[labelIndex] = {
      ...mockLabels[labelIndex],
      ...labelData,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: mockLabels[labelIndex],
      message: 'Label updated successfully'
    };
  },

  deleteLabel: async (id: number): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const labelIndex = mockLabels.findIndex(l => l.id === id);
    if (labelIndex === -1) {
      return {
        success: false,
        message: 'Label not found'
      };
    }

    mockLabels.splice(labelIndex, 1);

    return {
      success: true,
      message: 'Label deleted successfully'
    };
  }
};