import React, { useState, useEffect } from 'react';
import { CheckSquare, Check, X, ChevronDown, ChevronRight, Plus, Trash2, Settings } from 'lucide-react';
import { ServiceTask, JobCardFormData, OtherProgressData } from '../../../../types/jobCardTypes';

interface OtherTaskListProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: OtherProgressData) => void;
}

const OtherTaskList: React.FC<OtherTaskListProps> = ({ 
  jobCardFormData,
  onJobCardDataChange 
}) => {
  const [otherProgress, setOtherProgress] = useState<ServiceTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize other progress data
  useEffect(() => {
    const existingProgress = jobCardFormData?.other_progress;
    
    if (existingProgress && existingProgress.tasks) {
      // Use existing data from database
      setOtherProgress(existingProgress.tasks);
    } else {
      // Initialize with empty array for new job cards
      setOtherProgress([]);
    }
  }, [jobCardFormData]);

  // Helper function to update other progress data
  const updateOtherProgressData = (updatedTasks: ServiceTask[]) => {
    const otherData: OtherProgressData = {
      tasks: updatedTasks
    };
    
    onJobCardDataChange('other_progress', otherData);
  };

  // Add new task row
  const addNewTask = () => {
    const newTask: ServiceTask = {
      task: '',
      status: null,
      description: '',
      done_by: '',
      hours: null
    };
    
    const updatedProgress = [...otherProgress, newTask];
    setOtherProgress(updatedProgress);
    updateOtherProgressData(updatedProgress);
  };

  // Delete task row
  const deleteTask = (taskIndex: number) => {
    const updatedProgress = otherProgress.filter((_, index) => index !== taskIndex);
    setOtherProgress(updatedProgress);
    updateOtherProgressData(updatedProgress);
  };

  // Update task status
  const updateTaskStatus = (taskIndex: number, status: 'tick' | 'cross' | 'n/a' | null) => {
    const updatedProgress = [...otherProgress];
    updatedProgress[taskIndex] = {
      ...updatedProgress[taskIndex],
      status
    };
    setOtherProgress(updatedProgress);
    updateOtherProgressData(updatedProgress);
  };

  // Update task field (task name, description, done_by, hours)
  const updateTaskField = (taskIndex: number, field: 'task' | 'description' | 'done_by' | 'hours', value: string | number | null) => {
    const updatedProgress = [...otherProgress];
    updatedProgress[taskIndex] = {
      ...updatedProgress[taskIndex],
      [field]: value
    };
    setOtherProgress(updatedProgress);
    updateOtherProgressData(updatedProgress);
  };

  // Calculate progress
  const completedTasks = otherProgress.filter(task => task.status !== null).length;
  const progressPercentage = otherProgress.length > 0 ? Math.round((completedTasks / otherProgress.length) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 border-b border-indigo-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Other Task List</h4>
            <p className="text-sm text-indigo-600">
              {completedTasks} of {otherProgress.length} tasks addressed
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="animate-fadeIn">
          {/* Add Task Button */}
          <div className="p-4 bg-indigo-50 border-b border-indigo-200">
            <button
              onClick={addNewTask}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </button>
          </div>

          {/* Tasks Table */}
          {otherProgress.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                      Task Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      Status <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                      Description <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[17%]">
                      Done by <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      Hours
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[4%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {otherProgress.map((taskData, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Task Number Column */}
                      <td className="px-4 py-3 text-center w-[8%]">
                        <span className="font-medium text-indigo-600 text-sm">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      
                      {/* Task Name Column */}
                      <td className="px-4 py-3 w-[25%] align-top">
                        <textarea
                          value={taskData.task}
                          onChange={(e) => updateTaskField(index, 'task', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none overflow-hidden"
                          rows={1}
                          placeholder="Enter task name..."
                          style={{ minHeight: '32px' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.max(32, target.scrollHeight) + 'px';
                          }}
                        />
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-4 py-3 text-center w-[8%]">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => updateTaskStatus(index, taskData.status === 'tick' ? null : 'tick')}
                            className={`p-1.5 rounded-md transition-colors duration-200 ${
                              taskData.status === 'tick'
                                ? 'bg-green-100 text-green-600 border border-green-300'
                                : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
                            }`}
                            title="Mark as completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => updateTaskStatus(index, taskData.status === 'cross' ? null : 'cross')}
                            className={`p-1.5 rounded-md transition-colors duration-200 ${
                              taskData.status === 'cross'
                                ? 'bg-red-100 text-red-600 border border-red-300'
                                : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                            }`}
                            title="Mark as failed/issue"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => updateTaskStatus(index, taskData.status === 'n/a' ? null : 'n/a')}
                            className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                              taskData.status === 'n/a'
                                ? 'bg-gray-200 text-gray-700 border border-gray-300'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-150 hover:text-gray-600'
                            }`}
                            title="Mark as not applicable"
                          >
                            N/A
                          </button>
                        </div>
                      </td>
                      
                      {/* Description Column */}
                      <td className="px-4 py-3 w-[30%] align-top">
                        <textarea
                          value={taskData.description}
                          onChange={(e) => updateTaskField(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none overflow-hidden"
                          rows={1}
                          placeholder="Add description..."
                          style={{ minHeight: '32px' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.max(32, target.scrollHeight) + 'px';
                          }}
                        />
                      </td>
                      
                      {/* Done by Column */}
                      <td className="px-4 py-3 w-[17%] align-top">
                        <textarea
                          value={taskData.done_by}
                          onChange={(e) => updateTaskField(index, 'done_by', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none overflow-hidden"
                          rows={1}
                          placeholder="Mechanic name"
                          style={{ minHeight: '32px' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.max(32, target.scrollHeight) + 'px';
                          }}
                        />
                      </td>
                      
                      {/* Hours Column */}
                      <td className="px-4 py-3 w-[8%]">
                        <input
                          type="number"
                          value={taskData.hours || ''}
                          onChange={(e) => updateTaskField(index, 'hours', e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[60px]"
                          placeholder="0.0"
                          step="0.1"
                          min="0"
                        />
                      </td>
                      
                      {/* Actions Column */}
                      <td className="px-4 py-3 text-center w-[4%]">
                        <button
                          onClick={() => deleteTask(index)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-400 mb-2">No Custom Tasks Added</p>
              <p className="text-sm text-gray-400 mb-4">
                Click "Add Task" to create custom tasks for this job
              </p>
              <button
                onClick={addNewTask}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Task
              </button>
            </div>
          )}
        </div>
      )}
      
      {isExpanded && otherProgress.length > 0 && (
        <div className="p-4 bg-indigo-50 border-t border-indigo-200 animate-fadeIn">
          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700 font-medium">
              Progress: {progressPercentage}%
            </span>
            <div className="w-32 bg-indigo-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherTaskList;