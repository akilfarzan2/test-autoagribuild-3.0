import React, { useState, useEffect } from 'react';
import { CheckSquare, Check, X, ChevronDown, ChevronRight, Truck, Zap, Disc, AlertTriangle, Wrench, Box, Calendar, Gauge, Hash } from 'lucide-react';
import { ServiceTask, JobCardFormData, TrailerProgressData } from '../../../../types/jobCardTypes';

// Trailer Task Sections - Organized by category
export const TRAILER_TASK_SECTIONS = [
  {
    heading: "Electrical System",
    icon: Zap,
    description: "Check all electrical components and systems",
    tasks: [
      "Check all electrical plugs",
      "Check battery charge and switch operation",
      "Check that all trailer lights are working"
    ]
  },
  {
    heading: "Tires and Wheels",
    icon: Disc,
    description: "Inspect tires, wheels, and related components",
    tasks: [
      "Inflate tire pressure to manufacturer specifications",
      "Inspect tires for cuts, wear, or bulging",
      "Inspect wheel nuts and bolts for cracks, dents, or distortion",
      "Tighten wheels to specified torque"
    ]
  },
  {
    heading: "Brake System",
    icon: AlertTriangle,
    description: "Comprehensive brake system inspection and maintenance",
    tasks: [
      "Adjust brakes to proper operating clearance",
      "Check brake controller settings and operation",
      "Check brake cylinders for leaks or sticking",
      "Check hand brake cable and adjustment",
      "Check/top up brake fluid level if required",
      "Inspect brake lines for cracks, leaks, or kinks",
      "Inspect brake linings for wear or contamination",
      "Inspect brake magnets for wear and current draw",
      "Inspect hubs/drums for abnormal wear or scoring",
      "Inspect wheel bearings & cups for corrosion or wear – clean and repack",
      "Lubricate all grease points",
      "Test brakes for functionality"
    ]
  },
  {
    heading: "Suspension",
    icon: Wrench,
    description: "Inspect suspension components and hardware",
    tasks: [
      "Check U-bolts for wear and confirm tightness",
      "Inspect springs for wear and loss of arch",
      "Inspect suspension parts for bending, loose fasteners, and wear"
    ]
  },
  {
    heading: "Body/Chassis",
    icon: Box,
    description: "Check structural components and operational systems",
    tasks: [
      "Check operation of landing leg",
      "Check tail gate pins/safety chains/safety bars and lubricate",
      "Check tow hitch eye wear is within limit",
      "Check tow hitch mounting and any cracks"
    ]
  }
];

interface TrailerTaskListProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: TrailerProgressData) => void;
}

const TrailerTaskList: React.FC<TrailerTaskListProps> = ({ 
  jobCardFormData,
  onJobCardDataChange 
}) => {
  const [trailerProgress, setTrailerProgress] = useState<ServiceTask[]>([]);
  const [inspectionDate, setInspectionDate] = useState<string>('');
  const [kilometers, setKilometers] = useState<string>('');
  const [plantNumber, setPlantNumber] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    "Electrical System": true,
    "Tires and Wheels": true,
    "Brake System": true,
    "Suspension": true,
    "Body/Chassis": true
  });

  // Initialize trailer progress data
  useEffect(() => {
    const existingProgress = jobCardFormData?.trailer_progress;
    
    if (existingProgress && existingProgress.tasks) {
      // Use existing data from database
      setTrailerProgress(existingProgress.tasks);
      setInspectionDate(existingProgress.inspection_date || '');
      setKilometers(existingProgress.kilometers?.toString() || '');
      setPlantNumber(existingProgress.plant_number || '');
    } else {
      // Initialize with default values for new job cards
      const initialTasks: ServiceTask[] = [];
      
      TRAILER_TASK_SECTIONS.forEach(section => {
        section.tasks.forEach(task => {
          initialTasks.push({
            task,
            status: null,
            description: '',
            done_by: '',
            hours: null,
            section: section.heading
          });
        });
      });
      
      setTrailerProgress(initialTasks);
      setInspectionDate('');
      setKilometers('');
      setPlantNumber('');
    }
  }, [jobCardFormData]);

  // Helper function to update trailer progress data
  const updateTrailerProgressData = (
    updatedTasks: ServiceTask[],
    updatedDate?: string,
    updatedKm?: string,
    updatedPlant?: string
  ) => {
    const trailerData: TrailerProgressData = {
      inspection_date: updatedDate !== undefined ? updatedDate : inspectionDate,
      kilometers: updatedKm !== undefined ? (updatedKm ? parseFloat(updatedKm) : null) : (kilometers ? parseFloat(kilometers) : null),
      plant_number: updatedPlant !== undefined ? updatedPlant : plantNumber,
      tasks: updatedTasks
    };
    
    onJobCardDataChange('trailer_progress', trailerData);
  };

  // Handle inspection date change
  const handleInspectionDateChange = (value: string) => {
    setInspectionDate(value);
    updateTrailerProgressData(trailerProgress, value);
  };

  // Handle kilometers change
  const handleKilometersChange = (value: string) => {
    setKilometers(value);
    updateTrailerProgressData(trailerProgress, undefined, value);
  };

  // Handle plant number change
  const handlePlantNumberChange = (value: string) => {
    setPlantNumber(value);
    updateTrailerProgressData(trailerProgress, undefined, undefined, value);
  };

  // Update task status
  const updateTaskStatus = (taskIndex: number, status: 'tick' | 'cross' | 'n/a' | null) => {
    const updatedProgress = [...trailerProgress];
    updatedProgress[taskIndex] = {
      ...updatedProgress[taskIndex],
      status
    };
    setTrailerProgress(updatedProgress);
    updateTrailerProgressData(updatedProgress);
  };

  // Update task field (description, done_by, hours)
  const updateTaskField = (taskIndex: number, field: 'description' | 'done_by' | 'hours', value: string | number | null) => {
    const updatedProgress = [...trailerProgress];
    updatedProgress[taskIndex] = {
      ...updatedProgress[taskIndex],
      [field]: value
    };
    setTrailerProgress(updatedProgress);
    updateTrailerProgressData(updatedProgress);
  };

  // Toggle section expansion
  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Calculate progress
  const completedTasks = trailerProgress.filter(task => task.status !== null).length;
  const progressPercentage = trailerProgress.length > 0 ? Math.round((completedTasks / trailerProgress.length) * 100) : 0;

  // Get tasks for a specific section
  const getTasksForSection = (sectionName: string) => {
    return trailerProgress.filter(task => task.section === sectionName);
  };

  // Get global task index for a task within a section
  const getGlobalTaskIndex = (sectionTask: ServiceTask) => {
    return trailerProgress.findIndex(task => 
      task.task === sectionTask.task && task.section === sectionTask.section
    );
  };

  // Get continuous task number across all sections
  const getTaskNumber = (taskIndex: number) => {
    return taskIndex + 1;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 transition-colors duration-200 border-b border-orange-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Trailer Task List</h4>
            <p className="text-sm text-orange-600">
              {completedTasks} of {trailerProgress.length} tasks addressed
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
          {/* Inspection Information Fields */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-4">Trailer Inspection Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Field */}
              <div>
                <label htmlFor="trailerInspectionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  id="trailerInspectionDate"
                  value={inspectionDate}
                  onChange={(e) => handleInspectionDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Select the inspection date</p>
              </div>

              {/* KM Field */}
              <div>
                <label htmlFor="trailerKilometers" className="block text-sm font-medium text-gray-700 mb-2">
                  <Gauge className="w-4 h-4 inline mr-1" />
                  KM
                </label>
                <input
                  type="number"
                  id="trailerKilometers"
                  value={kilometers}
                  onChange={(e) => handleKilometersChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter kilometers"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Enter current kilometers</p>
              </div>

              {/* Plant Number Field */}
              <div>
                <label htmlFor="trailerPlantNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Plant Number
                </label>
                <input
                  type="text"
                  id="trailerPlantNumber"
                  value={plantNumber}
                  onChange={(e) => handlePlantNumberChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter plant number"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for this trailer</p>
              </div>
            </div>
          </div>

          {/* Task Sections */}
          {TRAILER_TASK_SECTIONS.map((section, sectionIndex) => {
            const sectionTasks = getTasksForSection(section.heading);
            const SectionIcon = section.icon;
            const sectionCompleted = sectionTasks.filter(task => task.status !== null).length;
            const sectionProgress = sectionTasks.length > 0 ? Math.round((sectionCompleted / sectionTasks.length) * 100) : 0;
            
            return (
              <div key={section.heading} className={`border-b border-gray-100 last:border-b-0 ${sectionIndex > 0 ? 'mt-6' : ''}`}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.heading)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                      <SectionIcon className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <h5 className="text-sm font-bold text-gray-900">{section.heading}</h5>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-600">
                        {sectionCompleted} of {sectionTasks.length} tasks
                      </div>
                      <div className="text-xs text-orange-600 font-medium">
                        {sectionProgress}% complete
                      </div>
                    </div>
                    {expandedSections[section.heading] ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Section Tasks */}
                {expandedSections[section.heading] && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                            Task
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                            Status <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[33%]">
                            Description <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[17%]">
                            Done by <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                            Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sectionTasks.map((taskData) => {
                          const globalIndex = getGlobalTaskIndex(taskData);
                          const taskNumber = getTaskNumber(globalIndex);
                          
                          return (
                            <tr key={`${taskData.section}-${taskData.task}`} className="hover:bg-gray-50 transition-colors duration-200">
                              {/* Task Number Column */}
                              <td className="px-4 py-3 text-center w-[8%]">
                                <span className="font-medium text-orange-600 text-sm">
                                  {String(taskNumber).padStart(2, '0')}
                                </span>
                              </td>
                              
                              {/* Task Column */}
                              <td className="px-4 py-3 text-sm text-gray-700 w-[25%]">
                                {taskData.task}
                              </td>
                              
                              {/* Status Column */}
                              <td className="px-4 py-3 text-center w-[8%]">
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    onClick={() => updateTaskStatus(globalIndex, taskData.status === 'tick' ? null : 'tick')}
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
                                    onClick={() => updateTaskStatus(globalIndex, taskData.status === 'cross' ? null : 'cross')}
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
                                    onClick={() => updateTaskStatus(globalIndex, taskData.status === 'n/a' ? null : 'n/a')}
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
                              <td className="px-4 py-3 w-[33%] align-top">
                                <textarea
                                  value={taskData.description}
                                  onChange={(e) => updateTaskField(globalIndex, 'description', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none overflow-hidden"
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
                                  onChange={(e) => updateTaskField(globalIndex, 'done_by', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none overflow-hidden"
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
                                  onChange={(e) => updateTaskField(globalIndex, 'hours', e.target.value ? parseFloat(e.target.value) : null)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[60px]"
                                  placeholder="0.0"
                                  step="0.1"
                                  min="0"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {isExpanded && (
        <div className="p-4 bg-orange-50 border-t border-orange-200 animate-fadeIn">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-700 font-medium">
              Progress: {progressPercentage}%
            </span>
            <div className="w-32 bg-orange-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrailerTaskList;