// Mock Users
export const doctors = [
  { id: 1, name: 'Dr. John Smith', specialty: 'Cardiology', email: 'doctor@example.com', profileImage: null },
  { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Neurology', email: 'doctor2@example.com', profileImage: null },
  { id: 3, name: 'Dr. Michael Brown', specialty: 'Pediatrics', email: 'michael@example.com', profileImage: null },
  { id: 4, name: 'Dr. Emily Davis', specialty: 'Dermatology', email: 'emily@example.com', profileImage: null },
];

export const patients = [
  { id: 1, name: 'Alex Thompson', age: 35, gender: 'Male', email: 'patient@example.com', bloodType: 'A+', profileImage: null },
  { id: 2, name: 'Emily Wilson', age: 28, gender: 'Female', email: 'patient2@example.com', bloodType: 'O-', profileImage: null },
  { id: 3, name: 'Robert Johnson', age: 45, gender: 'Male', email: 'robert@example.com', bloodType: 'B+', profileImage: null },
  { id: 4, name: 'Sophia Miller', age: 32, gender: 'Female', email: 'sophia@example.com', bloodType: 'AB+', profileImage: null },
  { id: 5, name: 'David Garcia', age: 50, gender: 'Male', email: 'david@example.com', bloodType: 'A-', profileImage: null },
  { id: 6, name: 'Jessica Martinez', age: 29, gender: 'Female', email: 'jessica@example.com', bloodType: 'O+', profileImage: null },
];

// Appointments
export const appointments = [
  { 
    id: 1, 
    patientId: 1, 
    doctorId: 1, 
    date: new Date(2024, 4, 15, 14, 0),
    type: 'Check-up', 
    status: 'scheduled',
    notes: 'Regular annual check-up'
  },
  { 
    id: 2, 
    patientId: 2, 
    doctorId: 1, 
    date: new Date(2024, 4, 15, 15, 30),
    type: 'Consultation', 
    status: 'scheduled',
    notes: 'Discuss recent test results'
  },
  { 
    id: 3, 
    patientId: 3, 
    doctorId: 1, 
    date: new Date(2024, 4, 16, 10, 0),
    type: 'Follow-up', 
    status: 'scheduled',
    notes: 'Follow-up after medication change'
  },
  { 
    id: 4, 
    patientId: 4, 
    doctorId: 2, 
    date: new Date(2024, 4, 15, 9, 0),
    type: 'New Patient', 
    status: 'scheduled',
    notes: 'Initial consultation'
  },
  { 
    id: 5, 
    patientId: 1, 
    doctorId: 3, 
    date: new Date(2024, 4, 20, 11, 0),
    type: 'Specialist Referral', 
    status: 'pending',
    notes: 'Referred by Dr. Smith'
  },
];

// Medical Records
export const medicalRecords = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    date: new Date(2023, 3, 10),
    type: 'Examination',
    title: 'Annual Physical',
    description: 'Complete physical examination showing good overall health. Blood pressure slightly elevated at 140/85.',
    attachments: [{name: 'lab_results.pdf', url: '#'}]
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 1,
    date: new Date(2023, 2, 5),
    type: 'Lab Results',
    title: 'Blood Work Analysis',
    description: 'Cholesterol levels are within normal range. Vitamin D is slightly low.',
    attachments: [{name: 'blood_work.pdf', url: '#'}]
  },
  {
    id: 3,
    patientId: 2,
    doctorId: 2,
    date: new Date(2023, 3, 15),
    type: 'Diagnosis',
    title: 'Migraine Assessment',
    description: 'Patient experiences recurring migraines. Prescribed sumatriptan 50mg as needed.',
    attachments: []
  },
  {
    id: 4,
    patientId: 3,
    doctorId: 1,
    date: new Date(2023, 4, 1),
    type: 'Procedure',
    title: 'Minor Surgery',
    description: 'Removal of skin lesion on right arm. Sent for biopsy.',
    attachments: [{name: 'procedure_notes.pdf', url: '#'}]
  },
];

// Messages
export const messages = [
  {
    id: 1,
    senderId: 1, // Doctor 1
    receiverId: 1, // Patient 1
    date: new Date(2023, 4, 10, 9, 30),
    content: 'Good morning Alex, just checking in after your appointment. How are you feeling?',
    read: true
  },
  {
    id: 2,
    senderId: 1, // Patient 1
    receiverId: 1, // Doctor 1
    date: new Date(2023, 4, 10, 10, 15),
    content: 'Hi Dr. Smith, I\'m feeling much better. The new medication seems to be working well.',
    read: true
  },
  {
    id: 3,
    senderId: 1, // Doctor 1
    receiverId: 1, // Patient 1
    date: new Date(2023, 4, 10, 10, 20),
    content: 'That\'s great to hear! Keep monitoring and let me know if you experience any side effects.',
    read: false
  },
  {
    id: 4,
    senderId: 2, // Doctor 2
    receiverId: 2, // Patient 2
    date: new Date(2023, 4, 9, 14, 0),
    content: 'Hello Emily, I\'ve reviewed your test results. Everything looks normal. No need for concern.',
    read: true
  },
];

// Notifications
export let notifications = [
  {
    id: 1,
    userId: 1,
    type: 'appointment',
    content: 'Reminder: You have an appointment with Dr. Smith tomorrow at 2:00 PM',
    date: new Date(2023, 4, 14, 10, 0),
    read: false
  },
  {
    id: 2,
    userId: 1,
    type: 'message',
    content: 'New message from Dr. Smith',
    date: new Date(2023, 4, 10, 10, 20),
    read: false
  },
  {
    id: 3,
    userId: 1,
    type: 'record',
    content: 'Your latest test results have been uploaded to your medical records',
    date: new Date(2023, 4, 8, 15, 30),
    read: true
  },
  {
    id: 4,
    userId: 2,
    type: 'message',
    content: 'New message from Dr. Johnson',
    date: new Date(2023, 4, 9, 14, 0),
    read: false
  },
];

// Prescriptions
export const prescriptions = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: new Date(2023, 3, 10),
    endDate: new Date(2023, 6, 10),
    instructions: 'Take in the morning with food',
    refillsRemaining: 2
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 1,
    medication: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    startDate: new Date(2023, 3, 10),
    endDate: new Date(2023, 6, 10),
    instructions: 'Take at bedtime',
    refillsRemaining: 2
  },
  {
    id: 3,
    patientId: 2,
    doctorId: 2,
    medication: 'Sumatriptan',
    dosage: '50mg',
    frequency: 'As needed for migraines',
    startDate: new Date(2023, 3, 15),
    endDate: new Date(2023, 9, 15),
    instructions: 'Take at first sign of migraine. Do not exceed 200mg in 24 hours.',
    refillsRemaining: 3
  },
];

// Health Metrics for Patient Analytics
export const healthMetrics = {
  1: { // Patient 1
    bloodPressure: [
      { date: new Date(2023, 0, 15), value: '130/85' },
      { date: new Date(2023, 1, 15), value: '135/88' },
      { date: new Date(2023, 2, 15), value: '132/84' },
      { date: new Date(2023, 3, 15), value: '125/82' },
      { date: new Date(2023, 4, 10), value: '120/80' },
    ],
    bloodGlucose: [
      { date: new Date(2023, 0, 15), value: 95 },
      { date: new Date(2023, 1, 15), value: 98 },
      { date: new Date(2023, 2, 15), value: 103 },
      { date: new Date(2023, 3, 15), value: 97 },
      { date: new Date(2023, 4, 10), value: 95 },
    ],
    weight: [
      { date: new Date(2023, 0, 15), value: 185 },
      { date: new Date(2023, 1, 15), value: 183 },
      { date: new Date(2023, 2, 15), value: 181 },
      { date: new Date(2023, 3, 15), value: 180 },
      { date: new Date(2023, 4, 10), value: 178 },
    ],
  },
  2: { // Patient 2
    bloodPressure: [
      { date: new Date(2023, 0, 15), value: '118/75' },
      { date: new Date(2023, 1, 15), value: '120/78' },
      { date: new Date(2023, 2, 15), value: '117/76' },
      { date: new Date(2023, 3, 15), value: '119/77' },
      { date: new Date(2023, 4, 10), value: '115/75' },
    ],
    bloodGlucose: [
      { date: new Date(2023, 0, 15), value: 88 },
      { date: new Date(2023, 1, 15), value: 90 },
      { date: new Date(2023, 2, 15), value: 87 },
      { date: new Date(2023, 3, 15), value: 85 },
      { date: new Date(2023, 4, 10), value: 86 },
    ],
    weight: [
      { date: new Date(2023, 0, 15), value: 142 },
      { date: new Date(2023, 1, 15), value: 143 },
      { date: new Date(2023, 2, 15), value: 140 },
      { date: new Date(2023, 3, 15), value: 141 },
      { date: new Date(2023, 4, 10), value: 140 },
    ],
  }
};

// Helper functions to get data by user
export const getPatientAppointments = (patientId) => {
  return appointments.filter(appointment => appointment.patientId === patientId);
};

export const getDoctorAppointments = (doctorId) => {
  return appointments.filter(appointment => appointment.doctorId === doctorId);
};

export const getPatientById = (patientId) => {
  return patients.find(patient => patient.id === patientId);
};

export const getDoctorById = (doctorId) => {
  return doctors.find(doctor => doctor.id === doctorId);
};

export const getPatientMedicalRecords = (patientId) => {
  return medicalRecords.filter(record => record.patientId === patientId);
};

export const getPatientPrescriptions = (patientId) => {
  return prescriptions.filter(prescription => prescription.patientId === patientId);
};

export const getUserMessages = (userId, isDoctor) => {
  // First, get all messages for the user
  const userMessages = messages.filter(message => 
    (message.senderId === userId && message.receiverId <= (isDoctor ? patients.length : doctors.length)) || 
    (message.receiverId === userId && message.senderId <= (isDoctor ? doctors.length : patients.length))
  );

  // Group messages by conversation (unique pairs of sender and receiver)
  const conversations = {};
  userMessages.forEach(message => {
    const otherId = message.senderId === userId ? message.receiverId : message.senderId;
    const conversationId = `${Math.min(userId, otherId)}-${Math.max(userId, otherId)}`;
    
    if (!conversations[conversationId]) {
      conversations[conversationId] = {
        id: conversationId,
        messages: [],
        patientId: isDoctor ? otherId : userId,
        doctorId: isDoctor ? userId : otherId,
      };
    }
    
    conversations[conversationId].messages.push({
      id: message.id,
      sender: message.senderId === userId ? 'user' : (isDoctor ? 'patient' : 'doctor'),
      content: message.content,
      timestamp: message.date,
      read: message.read,
      status: message.read ? 'read' : 'sent'
    });
  });

  // Convert conversations object to array and sort by last message date
  return Object.values(conversations).map(conv => ({
    ...conv,
    messages: conv.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  })).sort((a, b) => new Date(b.messages[b.messages.length - 1].timestamp) - new Date(a.messages[a.messages.length - 1].timestamp));
};

export const getUserNotifications = (userId) => {
  return notifications.filter(notification => notification.userId === userId);
};

export const markNotificationAsRead = (userId, notificationId) => {
  notifications = notifications.map(notification => 
    notification.userId === userId && notification.id === notificationId
      ? { ...notification, read: true }
      : notification
  );
};

export const markAllNotificationsAsRead = (userId) => {
  notifications = notifications.map(notification => 
    notification.userId === userId
      ? { ...notification, read: true }
      : notification
  );
};

export const markMessageAsRead = (messageId) => {
  messages.forEach(message => {
    if (message.id === messageId) {
      message.read = true;
    }
  });
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}; 