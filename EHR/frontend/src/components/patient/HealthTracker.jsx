import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  ChartBarIcon,
  ArrowUpIcon, 
  ArrowDownIcon,
  PlusIcon,
  ScaleIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import PageHeader from '../PageHeader';

// Chart.js options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'white'
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white'
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white'
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};

export default function HealthTracker({ userId }) {
  const [activeMetric, setActiveMetric] = useState('bloodPressure');
  const [timeRange, setTimeRange] = useState('week');
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetricValues, setNewMetricValues] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    glucose: '',
    weight: '',
    notes: ''
  });

  // Mock health data
  const healthData = {
    bloodPressure: {
      readings: [
        { date: '2023-02-01', systolic: 120, diastolic: 80 },
        { date: '2023-02-03', systolic: 118, diastolic: 79 },
        { date: '2023-02-05', systolic: 122, diastolic: 82 },
        { date: '2023-02-07', systolic: 121, diastolic: 80 },
        { date: '2023-02-09', systolic: 119, diastolic: 78 },
        { date: '2023-02-11', systolic: 123, diastolic: 81 },
        { date: '2023-02-13', systolic: 120, diastolic: 79 },
      ],
      status: 'normal',
      trend: 'stable',
      target: { min: 90, max: 120 },
      unit: 'mmHg'
    },
    heartRate: {
      readings: [
        { date: '2023-02-01', value: 72 },
        { date: '2023-02-03', value: 75 },
        { date: '2023-02-05', value: 70 },
        { date: '2023-02-07', value: 73 },
        { date: '2023-02-09', value: 71 },
        { date: '2023-02-11', value: 74 },
        { date: '2023-02-13', value: 72 },
      ],
      status: 'normal',
      trend: 'stable',
      target: { min: 60, max: 100 },
      unit: 'bpm'
    },
    bloodGlucose: {
      readings: [
        { date: '2023-02-01', value: 95 },
        { date: '2023-02-03', value: 98 },
        { date: '2023-02-05', value: 105 },
        { date: '2023-02-07', value: 99 },
        { date: '2023-02-09', value: 97 },
        { date: '2023-02-11', value: 101 },
        { date: '2023-02-13', value: 98 },
      ],
      status: 'normal',
      trend: 'stable',
      target: { min: 70, max: 130 },
      unit: 'mg/dL'
    },
    weight: {
      readings: [
        { date: '2023-02-01', value: 162 },
        { date: '2023-02-03', value: 162.5 },
        { date: '2023-02-05', value: 161.8 },
        { date: '2023-02-07', value: 161.5 },
        { date: '2023-02-09', value: 160.9 },
        { date: '2023-02-11', value: 160.5 },
        { date: '2023-02-13', value: 160.2 },
      ],
      status: 'normal',
      trend: 'improving',
      target: { min: 150, max: 170 },
      unit: 'lbs'
    }
  };

  // Metric display information
  const metrics = [
    { 
      id: 'bloodPressure', 
      name: 'Blood Pressure', 
      icon: HeartIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20' 
    },
    { 
      id: 'heartRate', 
      name: 'Heart Rate', 
      icon: HeartIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20' 
    },
    { 
      id: 'bloodGlucose', 
      name: 'Blood Glucose', 
      icon: BeakerIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20' 
    },
    { 
      id: 'weight', 
      name: 'Weight', 
      icon: ScaleIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20' 
    }
  ];

  // Get chart data for the active metric
  const getChartData = () => {
    const metricData = healthData[activeMetric];
    const labels = metricData.readings.map(reading => {
      const date = new Date(reading.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    if (activeMetric === 'bloodPressure') {
      return {
        labels,
        datasets: [
          {
            label: 'Systolic',
            data: metricData.readings.map(reading => reading.systolic),
            borderColor: 'rgba(220, 38, 38, 1)',  // red-600
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            tension: 0.2
          },
          {
            label: 'Diastolic',
            data: metricData.readings.map(reading => reading.diastolic),
            borderColor: 'rgba(59, 130, 246, 1)', // blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.2
          }
        ]
      };
    } else {
      return {
        labels,
        datasets: [
          {
            label: getActiveMetricName(),
            data: metricData.readings.map(reading => reading.value),
            borderColor: getActiveMetricColor(),
            backgroundColor: `${getActiveMetricColor().replace('1)', '0.2)')}`,
            tension: 0.2
          }
        ]
      };
    }
  };

  // Helper to get active metric name
  const getActiveMetricName = () => {
    const metric = metrics.find(m => m.id === activeMetric);
    return metric ? metric.name : '';
  };

  // Helper to get active metric color
  const getActiveMetricColor = () => {
    switch(activeMetric) {
      case 'bloodPressure': return 'rgba(220, 38, 38, 1)';  // red-600
      case 'heartRate': return 'rgba(168, 85, 247, 1)';     // purple-500
      case 'bloodGlucose': return 'rgba(59, 130, 246, 1)';  // blue-500
      case 'weight': return 'rgba(34, 197, 94, 1)';         // green-500
      default: return 'rgba(55, 65, 81, 1)';                // gray-700
    }
  };

  // Handle adding a new metric reading
  const handleAddMetric = () => {
    // In a real app, this would send data to an API
    console.log('Adding new metric:', { 
      metric: activeMetric, 
      values: newMetricValues,
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowAddMetric(false);
    setNewMetricValues({
      systolic: '',
      diastolic: '',
      heartRate: '',
      glucose: '',
      weight: '',
      notes: ''
    });
  };

  // Get the most recent reading for the active metric
  const getLatestReading = () => {
    const metricData = healthData[activeMetric];
    const latestReading = metricData.readings[metricData.readings.length - 1];
    
    if (activeMetric === 'bloodPressure') {
      return `${latestReading.systolic}/${latestReading.diastolic} ${metricData.unit}`;
    } else {
      return `${latestReading.value} ${metricData.unit}`;
    }
  };

  // Get the trend indicator for the metric
  const getTrendIndicator = (trend) => {
    switch(trend) {
      case 'improving':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'worsening':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      case 'stable':
      default:
        return <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Get status indicator color
  const getStatusColor = (status) => {
    switch(status) {
      case 'normal': return 'text-green-500';
      case 'elevated': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div>
      <PageHeader 
        title="Health Tracker" 
        description="Monitor and track your health metrics"
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {metrics.map(metric => {
          const metricData = healthData[metric.id];
          const latestReading = metricData.readings[metricData.readings.length - 1];
          
          let displayValue;
          if (metric.id === 'bloodPressure') {
            displayValue = `${latestReading.systolic}/${latestReading.diastolic}`;
          } else {
            displayValue = latestReading.value;
          }
          
          return (
            <div 
              key={metric.id}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer border-2 ${
                activeMetric === metric.id ? 'border-blue-500' : 'border-transparent'
              } hover:border-blue-500 transition-colors`}
              onClick={() => setActiveMetric(metric.id)}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${metric.bgColor} flex items-center justify-center mr-4`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{metric.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-white mr-2">{displayValue}</p>
                    <p className="text-xs text-gray-400">{metricData.unit}</p>
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <span className={`mr-1 ${getStatusColor(metricData.status)}`}>
                      {metricData.status}
                    </span>
                    {getTrendIndicator(metricData.trend)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Chart Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">{getActiveMetricName()} History</h2>
            <p className="text-sm text-gray-400">
              Latest: {getLatestReading()}
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <div className="flex bg-gray-700 rounded-md overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button
                className={`px-3 py-1 text-sm ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button
                className={`px-3 py-1 text-sm ${timeRange === 'year' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
            
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center"
              onClick={() => setShowAddMetric(true)}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>
        </div>
        
        <div className="h-64">
          <Line data={getChartData()} options={chartOptions} />
        </div>
      </div>
      
      {/* Metric Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target Range */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Target Range</h3>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-300">
                {activeMetric === 'bloodPressure' ? 'Systolic' : getActiveMetricName()}
              </p>
              <p className="text-sm text-white">
                {activeMetric === 'bloodPressure' 
                  ? `${healthData[activeMetric].target.min} - ${healthData[activeMetric].target.max} ${healthData[activeMetric].unit}`
                  : `${healthData[activeMetric].target.min} - ${healthData[activeMetric].target.max} ${healthData[activeMetric].unit}`
                }
              </p>
            </div>
            
            {activeMetric === 'bloodPressure' && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-300">Diastolic</p>
                <p className="text-sm text-white">60 - 80 mmHg</p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                  These target ranges are general guidelines. Your doctor may recommend different targets based on your specific health needs.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Recommendations</h3>
          
          <div className="space-y-4">
            {activeMetric === 'bloodPressure' && (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Maintain a healthy diet</p>
                  <p className="text-xs text-gray-400">
                    Limit sodium intake, increase potassium-rich foods, and follow the DASH diet.
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Regular physical activity</p>
                  <p className="text-xs text-gray-400">
                    Aim for at least 150 minutes of moderate-intensity exercise per week.
                  </p>
                </div>
              </>
            )}
            
            {activeMetric === 'heartRate' && (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Monitor during exercise</p>
                  <p className="text-xs text-gray-400">
                    Keep your heart rate between 50-85% of your maximum heart rate during exercise.
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Practice stress reduction</p>
                  <p className="text-xs text-gray-400">
                    Try meditation, deep breathing, or yoga to help manage stress and lower resting heart rate.
                  </p>
                </div>
              </>
            )}
            
            {activeMetric === 'bloodGlucose' && (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Consistent meal timing</p>
                  <p className="text-xs text-gray-400">
                    Eat meals at regular times to help maintain stable blood glucose levels.
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Choose complex carbohydrates</p>
                  <p className="text-xs text-gray-400">
                    Focus on whole grains, legumes, and non-starchy vegetables instead of simple sugars.
                  </p>
                </div>
              </>
            )}
            
            {activeMetric === 'weight' && (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Balanced nutrition</p>
                  <p className="text-xs text-gray-400">
                    Focus on a balanced diet with appropriate portion sizes and plenty of fruits and vegetables.
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">Regular weigh-ins</p>
                  <p className="text-xs text-gray-400">
                    Weigh yourself at the same time of day, preferably in the morning after using the bathroom.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Metric Modal */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">
              Add New {getActiveMetricName()} Reading
            </h3>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddMetric(); }}>
              {activeMetric === 'bloodPressure' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Systolic (mmHg)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="120"
                      value={newMetricValues.systolic}
                      onChange={(e) => setNewMetricValues({...newMetricValues, systolic: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Diastolic (mmHg)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="80"
                      value={newMetricValues.diastolic}
                      onChange={(e) => setNewMetricValues({...newMetricValues, diastolic: e.target.value})}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {getActiveMetricName()} ({healthData[activeMetric].unit})
                  </label>
                  <input 
                    type="number" 
                    step={activeMetric === 'weight' ? '0.1' : '1'}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={activeMetric === 'heartRate' ? '72' : 
                               activeMetric === 'bloodGlucose' ? '100' : '160'}
                    value={newMetricValues[activeMetric === 'heartRate' ? 'heartRate' : 
                                        activeMetric === 'bloodGlucose' ? 'glucose' : 'weight']}
                    onChange={(e) => {
                      const fieldName = activeMetric === 'heartRate' ? 'heartRate' : 
                                      activeMetric === 'bloodGlucose' ? 'glucose' : 'weight';
                      setNewMetricValues({...newMetricValues, [fieldName]: e.target.value});
                    }}
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Notes (Optional)
                </label>
                <textarea 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Add any relevant notes about this reading..."
                  value={newMetricValues.notes}
                  onChange={(e) => setNewMetricValues({...newMetricValues, notes: e.target.value})}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                  onClick={() => setShowAddMetric(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 