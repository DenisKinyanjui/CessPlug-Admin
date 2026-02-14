import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { createChama } from '../../../services/chamaApi';

const CreateChama = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weeklyContribution: '',
    totalWeeks: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Group name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.weeklyContribution || parseFloat(formData.weeklyContribution) <= 0) {
      setError('Weekly contribution amount must be greater than 0');
      return false;
    }
    if (!formData.totalWeeks || parseInt(formData.totalWeeks) <= 0) {
      setError('Total weeks must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const data = {
        name: formData.name,
        description: formData.description,
        weeklyContribution: parseFloat(formData.weeklyContribution),
        totalWeeks: parseInt(formData.totalWeeks),
        currentWeek: 1,
        members: [],
        status: 'draft' as const,
        createdBy: localStorage.getItem('userId') || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createChama(data);
      navigate('/admin/chamas');
    } catch (err: any) {
      setError(err.message || 'Failed to create chama group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/chamas')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Chama Group</h1>
          <p className="text-gray-600 mt-1">Set up a new savings group with contribution rules</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Nairobi Savers Circle"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="text-sm text-gray-500 mt-1">Enter a clear, descriptive name for the group</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the group's purpose, location, or any specific details..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">Help members understand what this group is about</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Weekly Contribution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Contribution Amount (KES) *
              </label>
              <input
                type="number"
                name="weeklyContribution"
                value={formData.weeklyContribution}
                onChange={handleInputChange}
                placeholder="e.g., 5000"
                step="100"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-sm text-gray-500 mt-1">Amount each member contributes weekly</p>
            </div>

            {/* Total Weeks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Weeks) *
              </label>
              <input
                type="number"
                name="totalWeeks"
                value={formData.totalWeeks}
                onChange={handleInputChange}
                placeholder="e.g., 52"
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-sm text-gray-500 mt-1">Total number of weeks for this contribution cycle</p>
            </div>
          </div>

          {/* Form Summary */}
          {formData.name && formData.weeklyContribution && formData.totalWeeks && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-blue-900">Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">Group Name</p>
                  <p className="font-medium text-blue-900">{formData.name}</p>
                </div>
                <div>
                  <p className="text-blue-700">Total Collection</p>
                  <p className="font-medium text-blue-900">
                    KES {(parseFloat(formData.weeklyContribution) * parseInt(formData.totalWeeks)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Duration</p>
                  <p className="font-medium text-blue-900">{formData.totalWeeks} weeks</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/chamas')}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Chama Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChama;
