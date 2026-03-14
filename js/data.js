// EXCP Agent HR - Mock Data

// Standard pipeline stages for all hiring requests (ordered)
const KANBAN_STAGES = [
  'Sourcing',
  'Screening',
  'Shortlisted',
  'Interview',
  'Offer letter',
  'Under medical',
  'Re-medical',
  'Medical Fit',
  'Medical Unfit',
  'Waiting Visa Stamped',
  'Visa Stamped',
  'Injaz Waiting Uploading',
  'Injaz Uploaded',
  'Waiting Flight Reservation',
  'Ticket in hand (PTA)',
  'Missed flight Plan',
  'Arrived',
  'Under Cancelation',
  'Rejected',
  'Placed'
];

/** Target days to take action per stage (for agent KPIs). Admin can edit on Hiring Stages settings page. */
let STAGE_TARGET_DAYS = {
  'Sourcing': 3,
  'Screening': 5,
  'Shortlisted': 2,
  'Interview': 5,
  'Offer letter': 5,
  'Under medical': 3,
  'Re-medical': null,
  'Medical Fit': null,
  'Medical Unfit': null,
  'Waiting Visa Stamped': 10,
  'Visa Stamped': null,
  'Injaz Waiting Uploading': 2,
  'Injaz Uploaded': null,
  'Waiting Flight Reservation': 2,
  'Ticket in hand (PTA)': 7,
  'Missed flight Plan': null,
  'Arrived': null,
  'Under Cancelation': null,
  'Rejected': null,
  'Placed': null
};

// Ensure all KANBAN_STAGES have a key (default null if missing)
KANBAN_STAGES.forEach(s => { if (STAGE_TARGET_DAYS[s] === undefined) STAGE_TARGET_DAYS[s] = null; });

const mockClients = [
  { id: 'c1', name: 'Saudi German Hospital', industry: 'Healthcare', status: 'active', logo: 'SG', location: 'Jeddah, KSA' },
  { id: 'c2', name: 'King Faisal Specialist Hospital', industry: 'Healthcare', status: 'active', logo: 'KF', location: 'Riyadh, KSA' },
  { id: 'c3', name: 'Al Noor Hospital', industry: 'Healthcare', status: 'active', logo: 'AN', location: 'Riyadh, KSA' }
];

// Bulk update Excel columns - field mapping for candidate
const BULK_UPDATE_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'arabicName', label: 'ArabicName' },
  { key: 'passportNumber', label: 'PassportNumber' },
  { key: 'birthdate', label: 'DateOfBirth' },
  { key: 'religion', label: 'Religion' },
  { key: 'maritalStatus', label: 'MaritalStatus' },
  { key: 'gender', label: 'Gender' },
  { key: 'nationality', label: 'Country' },
  { key: 'title', label: 'Profession' },
  { key: 'currentPosition', label: 'ActualWork' },
  { key: 'actualWorkDescription', label: 'ActualWorkDescription' },
  { key: 'hiringRequest', label: 'HiringRequest' },
  { key: 'projCode', label: 'ProjCode' },
  { key: 'projName', label: 'ProjName' },
  { key: 'bulkVisaNumber', label: 'BulkVisaNumber' },
  { key: 'issueDate', label: 'IssueDate' },
  { key: 'authorizationNumber', label: 'AuthorizationNumber' },
  { key: 'basicSalary', label: 'BasicSalary' },
  { key: 'foodAllowance', label: 'Foodallowance' },
  { key: 'housingAllowance', label: 'HousingAllowance' },
  { key: 'otherAllowance', label: 'OtherAllowance' },
  { key: 'transportationAllowance', label: 'TransportationAllowance' },
  { key: 'overtimeAllowance', label: 'Overtimeallowance' },
  { key: 'shiftAllowance', label: 'ShiftAllowance' },
  { key: 'mobileAllowance', label: 'MobileAllowance' },
  { key: 'remoteAreaAllowance', label: 'RemoteAreaAllowance' },
  { key: 'specialAllowance', label: 'SpecialAllowance' },
  { key: 'passportExpiryDate', label: 'PassportExpiryDate' },
  { key: 'passportIssuePlace', label: 'PassportIssuePlace' },
  { key: 'passportIssueDate', label: 'PassportIssueDate' },
  { key: 'expectedArrivalDate', label: 'ExpectedArrivalDate' },
  { key: 'agent', label: 'Agent' },
  { key: 'borderNo', label: 'BorderNo' },
  { key: 'flightNumber', label: 'FlightNumber' },
  { key: 'airCompany', label: 'AirCompany' },
  { key: 'departureTime', label: 'DepartureTime' },
  { key: 'arrivalDate', label: 'ArrivalDate' },
  { key: 'arrivalTime', label: 'ArrivalTime' },
  { key: 'arrivalPlace', label: 'ArrivalPlace' }
];

// Candidate ownership: each candidate has agentId (one agent only). Agent users see only their candidates.
const mockCandidates = [
  {
    id: 'ca1', agentId: 'ag1', name: 'KEJANE M. CABANTAC', firstName: 'KEJANE', lastName: 'CABANTAC', title: 'Housemaid',
    nationality: 'Philippines', experience: '5 years', experienceYears: 3, status: 'hired', avatar: 'KC',
    reference: 'W5VW894Y9', gender: '', diploma: 'Nursing', university: 'Central Mindanao University (CMU)',
    currentCompany: 'DON CARLOS DOCTORS HOSPITAL', currentPosition: 'REGISTERED NURSE',
    arabicName: '', passportNumber: 'W5VW894Y9', religion: '', maritalStatus: '',
    actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '',
    basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '',
    overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '',
    passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: 'Maramag, Philippines', birthdate: '', address: 'Purok 8 South Poblacion, Maramag, Bukidnon',
    email: 'kejanemacancabantac@gmail.com', phone: '639975880451', skills: [
      { name: 'Operating room duties', rating: 10 },
      { name: 'Effective and Therapeutic communication', rating: 10 },
      { name: 'Ability to work well under pressure', rating: 10 },
      { name: 'Emergency and critical care nursing', rating: 10 },
      { name: 'Record-keeping and following protocols', rating: 10 }
    ],
    tags: ['Nurse', 'Best Migrant'],
    department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: 'Pending', emailConsent: 'Pending', description: '',
    employmentStatus: 'Hired', hiredDate: '2026-02-01 11:56', startDate: '', probationEndDate: '', leftDate: '',
    employeeJob: 'Nurse - Jeddah Al Rehab', employeeClient: 'Saudi German Hospital',
    experience: [
      { role: 'Registered Nurse', company: 'DON CARLOS DOCTORS HOSPITAL', start: '2022-01-01', end: '2025-01-01', years: '3 yrs', country: 'PH' }
    ],
    education: [
      { institution: 'Central Mindanao University (CMU)', degree: "Bachelor's Degree", start: '2016-01-01', end: '2020-01-01', country: 'PH' }
    ],
    createdDate: '2020-02-01 11:29', createdBy: 'Muhammad', lastUpdated: '2026-02-01 12:39',
    resumeCount: 1, inboxCount: 1, jobsCount: 1
  },
  {
    id: 'ca2', agentId: 'ag1', name: 'MARIA SANTOS', firstName: 'MARIA', lastName: 'SANTOS', title: 'Common Labor',
    nationality: 'Philippines', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'MS',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'OR', rating: 9 }, { name: 'Cardiac', rating: 8 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 1
  },
  {
    id: 'ca3', agentId: 'ag1', name: 'AHMED HASSAN', firstName: 'AHMED', lastName: 'HASSAN', title: 'Common Labor',
    nationality: 'India', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'AH',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Pediatrics', rating: 8 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  // Additional sample candidates
  {
    id: 'ca4', agentId: 'ag1', name: 'JOHN DOE', firstName: 'JOHN', lastName: 'DOE', title: 'Housemaid',
    nationality: 'Philippines', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'JD',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'General Nursing', rating: 8 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca5', agentId: 'ag1', name: 'FATIMA ALI', firstName: 'FATIMA', lastName: 'ALI', title: 'Housemaid',
    nationality: 'India', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'FA',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'ICU', rating: 9 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca6', agentId: 'ag1', name: 'ANNA KIM', firstName: 'ANNA', lastName: 'KIM', title: 'Housemaid',
    nationality: 'Philippines', experience: '5 years', experienceYears: 5, status: 'available', avatar: 'AK',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Emergency', rating: 9 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca7', agentId: 'ag1', name: 'LAILA HUSSEIN', firstName: 'LAILA', lastName: 'HUSSEIN', title: 'Housemaid',
    nationality: 'Philippines', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'LH',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'OR', rating: 9 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca8', agentId: 'ag1', name: 'MOHAMMED SALIM', firstName: 'MOHAMMED', lastName: 'SALIM', title: 'Housemaid',
    nationality: 'India', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'MS',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Leadership', rating: 8 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca9', agentId: 'ag1', name: 'SARA IBRAHIM', firstName: 'SARA', lastName: 'IBRAHIM', title: 'Common Labor',
    nationality: 'Kenya', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'SI',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Pediatrics', rating: 9 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca10', agentId: 'ag1', name: 'RANIA YOUSSEF', firstName: 'RANIA', lastName: 'YOUSSEF', title: 'Common Labor',
    nationality: 'India', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'RY',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Cardiac', rating: 9 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca11', agentId: 'ag1', name: 'JAMES BROWN', firstName: 'JAMES', lastName: 'BROWN', title: 'Common Labor',
    nationality: 'India', experience: '2 years', experienceYears: 2, status: 'available', avatar: 'JB',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Ward Nursing', rating: 8 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca12', agentId: 'ag1', name: 'EMILY CLARK', firstName: 'EMILY', lastName: 'CLARK', title: 'Common Labor',
    nationality: 'Philippines', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'EC',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Oncology', rating: 8 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  {
    id: 'ca13', agentId: 'ag3', name: 'OMAR FARIS', firstName: 'OMAR', lastName: 'FARIS', title: 'Cook',
    nationality: 'India', experience: '5 years', experienceYears: 5, status: 'available', avatar: 'OF',
    reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '',
    arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '',
    bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '',
    otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '',
    remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '',
    expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '',
    arrivalDate: '', arrivalTime: '', arrivalPlace: '',
    location: '', birthdate: '', address: '', email: '', phone: '',
    skills: [{ name: 'Cooking', rating: 9 }],
    tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '',
    nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '',
    employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '',
    experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0
  },
  // 5 unassigned (ag5 Kenya), 25 assigned
  { id: 'ca14', agentId: 'ag5', name: 'Grace Wanjiku', firstName: 'Grace', lastName: 'Wanjiku', title: 'Housemaid', nationality: 'Kenya', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'GW', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Cleaning', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca15', agentId: 'ag5', name: 'Peter Omondi', firstName: 'Peter', lastName: 'Omondi', title: 'Common Labor', nationality: 'Kenya', experience: '2 years', experienceYears: 2, status: 'available', avatar: 'PO', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Manual work', rating: 7 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca16', agentId: 'ag5', name: 'Mary Akinyi', firstName: 'Mary', lastName: 'Akinyi', title: 'Cook', nationality: 'Kenya', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'MA', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Cooking', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca17', agentId: 'ag5', name: 'James Otieno', firstName: 'James', lastName: 'Otieno', title: 'Driver', nationality: 'Kenya', experience: '6 years', experienceYears: 6, status: 'available', avatar: 'JO', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Driving', rating: 9 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca18', agentId: 'ag5', name: 'Lucy Muthoni', firstName: 'Lucy', lastName: 'Muthoni', title: 'Caregiver', nationality: 'Kenya', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'LM', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Elder care', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca19', agentId: 'ag1', name: 'CARMEN REYES', firstName: 'CARMEN', lastName: 'REYES', title: 'Housemaid', nationality: 'Philippines', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'CR', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Housekeeping', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca20', agentId: 'ag1', name: 'RENATO GARCIA', firstName: 'RENATO', lastName: 'GARCIA', title: 'Common Labor', nationality: 'Philippines', experience: '2 years', experienceYears: 2, status: 'available', avatar: 'RG', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Construction', rating: 7 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca21', agentId: 'ag3', name: 'RAJESH KUMAR', firstName: 'RAJESH', lastName: 'KUMAR', title: 'Cook', nationality: 'India', experience: '6 years', experienceYears: 6, status: 'available', avatar: 'RK', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Indian cuisine', rating: 9 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca22', agentId: 'ag3', name: 'SUNITA DEVI', firstName: 'SUNITA', lastName: 'DEVI', title: 'Cook', nationality: 'India', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'SD', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Baking', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca23', agentId: 'ag1', name: 'LINA TAN', firstName: 'LINA', lastName: 'TAN', title: 'Housemaid', nationality: 'Philippines', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'LT', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Childcare', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca24', agentId: 'ag1', name: 'VISHNU PATEL', firstName: 'VISHNU', lastName: 'PATEL', title: 'Common Labor', nationality: 'India', experience: '2 years', experienceYears: 2, status: 'available', avatar: 'VP', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Warehouse', rating: 7 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca25', agentId: 'ag4', name: 'ANITA SHARMA', firstName: 'ANITA', lastName: 'SHARMA', title: 'Caregiver', nationality: 'India', experience: '5 years', experienceYears: 5, status: 'available', avatar: 'AS', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Patient care', rating: 9 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca26', agentId: 'ag4', name: 'SURESH REDDY', firstName: 'SURESH', lastName: 'REDDY', title: 'Driver', nationality: 'India', experience: '7 years', experienceYears: 7, status: 'available', avatar: 'SR', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Delivery driving', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca27', agentId: 'ag1', name: 'ROSA MENDOZA', firstName: 'ROSA', lastName: 'MENDOZA', title: 'Housemaid', nationality: 'Philippines', experience: '5 years', experienceYears: 5, status: 'available', avatar: 'RM', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Laundry', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca28', agentId: 'ag1', name: 'MIGUEL TORRES', firstName: 'MIGUEL', lastName: 'TORRES', title: 'Common Labor', nationality: 'Philippines', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'MT', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Masonry', rating: 7 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca29', agentId: 'ag3', name: 'PRADEEP SINGH', firstName: 'PRADEEP', lastName: 'SINGH', title: 'Cook', nationality: 'India', experience: '8 years', experienceYears: 8, status: 'available', avatar: 'PS', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Chef', rating: 9 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca30', agentId: 'ag3', name: 'KAVITHA NAIR', firstName: 'KAVITHA', lastName: 'NAIR', title: 'Housemaid', nationality: 'India', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'KN', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Cooking', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca31', agentId: 'ag1', name: 'CECILIA FLORES', firstName: 'CECILIA', lastName: 'FLORES', title: 'Caregiver', nationality: 'Philippines', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'CF', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Elder care', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca32', agentId: 'ag1', name: 'RICO SANTOS', firstName: 'RICO', lastName: 'SANTOS', title: 'Driver', nationality: 'Philippines', experience: '5 years', experienceYears: 5, status: 'available', avatar: 'RS', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Transport', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca33', agentId: 'ag4', name: 'DEEPAK VERMA', firstName: 'DEEPAK', lastName: 'VERMA', title: 'Driver', nationality: 'India', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'DV', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Fleet', rating: 7 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca34', agentId: 'ag4', name: 'LAKSHMI IYER', firstName: 'LAKSHMI', lastName: 'IYER', title: 'Caregiver', nationality: 'India', experience: '6 years', experienceYears: 6, status: 'available', avatar: 'LI', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Healthcare', rating: 9 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca35', agentId: 'ag1', name: 'DIANA MORALES', firstName: 'DIANA', lastName: 'MORALES', title: 'Housemaid', nationality: 'Philippines', experience: '2 years', experienceYears: 2, status: 'available', avatar: 'DM', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Cleaning', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca36', agentId: 'ag1', name: 'RODOLFO RAMOS', firstName: 'RODOLFO', lastName: 'RAMOS', title: 'Common Labor', nationality: 'Philippines', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'RR', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Plumbing', rating: 7 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca37', agentId: 'ag3', name: 'MOHAN LAL', firstName: 'MOHAN', lastName: 'LAL', title: 'Cook', nationality: 'India', experience: '5 years', experienceYears: 5, status: 'available', avatar: 'ML', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Catering', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca38', agentId: 'ag3', name: 'REKHA GUPTA', firstName: 'REKHA', lastName: 'GUPTA', title: 'Housemaid', nationality: 'India', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'RG', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Housekeeping', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca39', agentId: 'ag1', name: 'FELICIA Bautista', firstName: 'FELICIA', lastName: 'Bautista', title: 'Caregiver', nationality: 'Philippines', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'FB', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Nursing aide', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca40', agentId: 'ag1', name: 'BENJAMIN CRUZ', firstName: 'BENJAMIN', lastName: 'CRUZ', title: 'Driver', nationality: 'Philippines', experience: '6 years', experienceYears: 6, status: 'available', avatar: 'BC', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Chauffeur', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca41', agentId: 'ag4', name: 'ARUN MEHTA', firstName: 'ARUN', lastName: 'MEHTA', title: 'Common Labor', nationality: 'India', experience: '3 years', experienceYears: 3, status: 'available', avatar: 'AM', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Electrician', rating: 7 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca42', agentId: 'ag4', name: 'PRIYA SHARMA', firstName: 'PRIYA', lastName: 'SHARMA', title: 'Housemaid', nationality: 'India', experience: '4 years', experienceYears: 4, status: 'available', avatar: 'PS', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Cooking', rating: 8 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 },
  { id: 'ca43', agentId: 'ag3', name: 'VIJAY BHATT', firstName: 'VIJAY', lastName: 'BHATT', title: 'Cook', nationality: 'India', experience: '7 years', experienceYears: 7, status: 'available', avatar: 'VB', reference: '', gender: '', diploma: '', university: '', currentCompany: '', currentPosition: '', arabicName: '', passportNumber: '', religion: '', maritalStatus: '', actualWorkDescription: '', bulkVisaNumber: '', issueDate: '', authorizationNumber: '', basicSalary: '', foodAllowance: '', housingAllowance: '', otherAllowance: '', transportationAllowance: '', overtimeAllowance: '', shiftAllowance: '', mobileAllowance: '', remoteAreaAllowance: '', specialAllowance: '', passportExpiryDate: '', passportIssuePlace: '', passportIssueDate: '', expectedArrivalDate: '', agent: '', borderNo: '', flightNumber: '', airCompany: '', departureTime: '', arrivalDate: '', arrivalTime: '', arrivalPlace: '', location: '', birthdate: '', address: '', email: '', phone: '', skills: [{ name: 'Pastry', rating: 9 }], tags: [], department: '', industry: '', graduationDate: '', currentSalary: '', expectedSalary: '', noticePeriod: '', nationalities: [], languages: [], gdprConsent: '', emailConsent: '', description: '', employmentStatus: '', hiredDate: '', startDate: '', probationEndDate: '', leftDate: '', employeeJob: '', employeeClient: '', experience: [], education: [], createdDate: '', createdBy: '', lastUpdated: '', resumeCount: 0, inboxCount: 0, jobsCount: 0 }
];

// 5 jobs: Housemaid, Common Labor, Cook, Driver, Caregiver
const mockJobs = [
  { id: 'j1', title: 'Housemaid', clientId: 'c1', clientName: 'Saudi German Hospital', salary: 'SR 1,200 - 1,500 SAR', minSalary: '1200', maxSalary: '1500', currency: 'SAR', frequency: 'Monthly', location: 'Jeddah, Saudi Arabia', status: 'active', priority: 'high', owner: 'Muhammad', ownerAvatar: 'M', jobReference: 'SG-HM-001', headcount: 20, contractType: 'Full-time', experienceLevel: 'Junior', remote: false, officeAddress: '', expectedCloseDate: '', jobBrief: 'Household workers for domestic cleaning, laundry, and general housekeeping.', responsibilities: ['House cleaning', 'Laundry', 'Cooking support', 'Childcare assistance'], jobRequirements: ['Basic Arabic preferred', 'Reliable', 'Household experience'] },
  { id: 'j2', title: 'Common Labor', clientId: 'c1', clientName: 'Saudi German Hospital', salary: 'SR 1,000 - 1,300 SAR', minSalary: '1000', maxSalary: '1300', currency: 'SAR', frequency: 'Monthly', location: 'Jeddah, Saudi Arabia', status: 'active', priority: 'medium', owner: 'Muhammad', ownerAvatar: 'M', jobReference: 'SG-CL-001', headcount: 30, contractType: 'Full-time', experienceLevel: 'Junior', remote: false, officeAddress: '', expectedCloseDate: '', jobBrief: 'General labor for construction, maintenance and manual tasks.', responsibilities: ['Manual labor', 'Site support', 'Loading/unloading'], jobRequirements: ['Physically fit', 'Basic safety awareness'] },
  { id: 'j3', title: 'Cook', clientId: 'c2', clientName: 'King Faisal Specialist Hospital', salary: 'SR 2,500 - 3,000 SAR', minSalary: '2500', maxSalary: '3000', currency: 'SAR', frequency: 'Monthly', location: 'Riyadh, Saudi Arabia', status: 'active', priority: 'high', owner: 'Muhammad', ownerAvatar: 'M', jobReference: 'KFSH-CK-001', headcount: 10, contractType: 'Full-time', experienceLevel: 'Mid-level', remote: false, officeAddress: '', expectedCloseDate: '', jobBrief: 'Cooks for kitchen operations and meal preparation.', responsibilities: ['Meal preparation', 'Menu planning', 'Kitchen hygiene'], jobRequirements: ['Culinary experience', 'Hygiene certificate'] },
  { id: 'j4', title: 'Driver', clientId: 'c2', clientName: 'King Faisal Specialist Hospital', salary: 'SR 2,000 - 2,500 SAR', minSalary: '2000', maxSalary: '2500', currency: 'SAR', frequency: 'Monthly', location: 'Riyadh, Saudi Arabia', status: 'active', priority: 'medium', owner: 'Muhammad', ownerAvatar: 'M', jobReference: 'KFSH-DR-001', headcount: 8, contractType: 'Full-time', experienceLevel: 'Mid-level', remote: false, officeAddress: '', expectedCloseDate: '', jobBrief: 'Company drivers for staff and patient transport.', responsibilities: ['Safe driving', 'Vehicle maintenance', 'Route planning'], jobRequirements: ['Valid license', '3+ years driving'] },
  { id: 'j5', title: 'Caregiver', clientId: 'c3', clientName: 'Al Noor Hospital', salary: 'SR 1,800 - 2,200 SAR', minSalary: '1800', maxSalary: '2200', currency: 'SAR', frequency: 'Monthly', location: 'Riyadh, Saudi Arabia', status: 'active', priority: 'high', owner: 'Muhammad', ownerAvatar: 'M', jobReference: 'AN-CG-001', headcount: 15, contractType: 'Full-time', experienceLevel: 'Junior', remote: false, officeAddress: '', expectedCloseDate: '', jobBrief: 'Patient care assistants for elderly and disabled care.', responsibilities: ['Personal care', 'Mobility support', 'Medication reminders'], jobRequirements: ['Compassionate', 'Basic care training'] }
];

// Hiring Requests: ag1 (u2) 4 HR in 2 jobs; ag3 (u4) 2 HR in 1 job; ag5 (u6) 0 HR
const mockHiringRequests = [
  { id: 'hr1', jobId: 'j1', number: 'HR-001', assignedAgentId: 'u2', assignedAgentName: 'Sara', required: 3, filled: 2, visaNumber: '1305370995' },
  { id: 'hr2', jobId: 'j1', number: 'HR-002', assignedAgentId: 'u2', assignedAgentName: 'Sara', required: 2, filled: 1, visaNumber: '1305370996' },
  { id: 'hr3', jobId: 'j2', number: 'HR-001', assignedAgentId: 'u2', assignedAgentName: 'Sara', required: 2, filled: 1, visaNumber: '1305370997' },
  { id: 'hr4', jobId: 'j2', number: 'HR-002', assignedAgentId: 'u2', assignedAgentName: 'Sara', required: 2, filled: 0, visaNumber: '1305370998' },
  { id: 'hr5', jobId: 'j3', number: 'HR-001', assignedAgentId: 'u4', assignedAgentName: 'Vikram', required: 2, filled: 1, visaNumber: '1305370999' },
  { id: 'hr6', jobId: 'j3', number: 'HR-002', assignedAgentId: 'u4', assignedAgentName: 'Vikram', required: 2, filled: 0, visaNumber: '1305371000' }
];

// Candidate assignments: 5 unassigned (ca14-ca18); rest assigned to hr1-hr6
const mockAssignments = (function () {
  const emptyStages = KANBAN_STAGES.reduce((o, s) => { o[s] = []; return o; }, {});
  return {
    hr1: { ...emptyStages, 'Sourcing': ['ca5', 'ca35'], 'Interview': ['ca6'], 'Placed': ['ca1', 'ca4'] },
    hr2: { ...emptyStages, 'Screening': ['ca7', 'ca23'], 'Offer letter': ['ca8'], 'Placed': ['ca27'] },
    hr3: { ...emptyStages, 'Screening': ['ca2', 'ca3', 'ca12'], 'Shortlisted': ['ca9'], 'Under medical': ['ca10'] },
    hr4: { ...emptyStages, 'Sourcing': ['ca11', 'ca28', 'ca40'], 'Screening': ['ca24', 'ca39'], 'Shortlisted': ['ca36'] },
    hr5: { ...emptyStages, 'Screening': ['ca21'], 'Interview': ['ca13'], 'Medical Fit': ['ca22'], 'Placed': ['ca29'] },
    hr6: { ...emptyStages, 'Sourcing': ['ca30', 'ca38'], 'Screening': ['ca37'], 'Shortlisted': ['ca43'] }
  };
})();

function getJobHiringRequests(jobId) {
  return mockHiringRequests.filter(hr => hr.jobId === jobId);
}

function getJobTotals(jobId) {
  const hrs = getJobHiringRequests(jobId);
  return {
    required: hrs.reduce((s, hr) => s + hr.required, 0),
    filled: hrs.reduce((s, hr) => s + hr.filled, 0)
  };
}

const DEFAULT_STAGES = KANBAN_STAGES.slice();

// Stage change logs: LATE (over target), EXCELLENT (under target), ON TIME (within target)
const mockActivities = [
  // ca1: Placed (Housemaid)
  { id: 1, type: 'stage', subtype: 'stageChange', title: 'KEJANE M. CABANTAC moved from Visa Stamped to Placed', jobId: 'j1', candidateId: 'ca1', relatedTo: 'KEJANE M. CABANTAC', date: '2026-03-01 11:56:00', scheduledDate: '2026-03-01', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca2: LATE - Screening (5d) to Shortlisted (2d target) took 5 days
  { id: 2, type: 'stage', subtype: 'stageChange', title: 'MARIA SANTOS moved from Sourcing to Screening', jobId: 'j2', candidateId: 'ca2', relatedTo: 'MARIA SANTOS', date: '2026-02-25 09:00:00', scheduledDate: '2026-02-25', status: 'done', assigneeId: 'u2', user: 'Sara' },
  { id: 3, type: 'stage', subtype: 'stageChange', title: 'MARIA SANTOS moved from Screening to Shortlisted', jobId: 'j2', candidateId: 'ca2', relatedTo: 'MARIA SANTOS', date: '2026-03-07 09:00:00', scheduledDate: '2026-03-07', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca3: ON TIME - Screening to Shortlisted in 2 days (target 2)
  { id: 4, type: 'stage', subtype: 'stageChange', title: 'AHMED HASSAN moved from Sourcing to Screening', jobId: 'j2', candidateId: 'ca3', relatedTo: 'AHMED HASSAN', date: '2026-03-02 10:00:00', scheduledDate: '2026-03-02', status: 'done', assigneeId: 'u2', user: 'Sara' },
  { id: 5, type: 'stage', subtype: 'stageChange', title: 'AHMED HASSAN moved from Screening to Shortlisted', jobId: 'j2', candidateId: 'ca3', relatedTo: 'AHMED HASSAN', date: '2026-03-04 10:00:00', scheduledDate: '2026-03-04', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca5: EXCELLENT - Sourcing to Screening in 1 day (target 3)
  { id: 6, type: 'stage', subtype: 'stageChange', title: 'FATIMA ALI moved from Sourcing to Screening', jobId: 'j1', candidateId: 'ca5', relatedTo: 'FATIMA ALI', date: '2026-03-01 11:00:00', scheduledDate: '2026-03-01', status: 'done', assigneeId: 'u2', user: 'Sara' },
  { id: 7, type: 'stage', subtype: 'stageChange', title: 'FATIMA ALI moved from Screening to Shortlisted', jobId: 'j1', candidateId: 'ca5', relatedTo: 'FATIMA ALI', date: '2026-03-03 11:30:00', scheduledDate: '2026-03-03', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca6: ON TIME - Shortlisted to Interview in 2 days (target 2)
  { id: 8, type: 'stage', subtype: 'stageChange', title: 'ANNA KIM moved from Sourcing to Screening', jobId: 'j1', candidateId: 'ca6', relatedTo: 'ANNA KIM', date: '2026-02-28 09:00:00', scheduledDate: '2026-02-28', status: 'done', assigneeId: 'u2', user: 'Sara' },
  { id: 9, type: 'stage', subtype: 'stageChange', title: 'ANNA KIM moved from Shortlisted to Interview', jobId: 'j1', candidateId: 'ca6', relatedTo: 'ANNA KIM', date: '2026-03-03 09:00:00', scheduledDate: '2026-03-03', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca8: LATE - Screening to Shortlisted took 6 days (target 2)
  { id: 10, type: 'stage', subtype: 'stageChange', title: 'MOHAMMED SALIM moved from Sourcing to Screening', jobId: 'j1', candidateId: 'ca8', relatedTo: 'MOHAMMED SALIM', date: '2026-02-25 10:30:00', scheduledDate: '2026-02-25', status: 'done', assigneeId: 'u2', user: 'Sara' },
  { id: 11, type: 'stage', subtype: 'stageChange', title: 'MOHAMMED SALIM moved from Screening to Shortlisted', jobId: 'j1', candidateId: 'ca8', relatedTo: 'MOHAMMED SALIM', date: '2026-03-05 10:30:00', scheduledDate: '2026-03-05', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca9: EXCELLENT - Screening to Under medical in 1 day (target 3)
  { id: 12, type: 'stage', subtype: 'stageChange', title: 'SARA IBRAHIM moved from Sourcing to Screening', jobId: 'j2', candidateId: 'ca9', relatedTo: 'SARA IBRAHIM', date: '2026-03-02 15:45:00', scheduledDate: '2026-03-02', status: 'done', assigneeId: 'u2', user: 'Sara' },
  { id: 13, type: 'stage', subtype: 'stageChange', title: 'SARA IBRAHIM moved from Screening to Under medical', jobId: 'j2', candidateId: 'ca9', relatedTo: 'SARA IBRAHIM', date: '2026-03-03 15:45:00', scheduledDate: '2026-03-03', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca10: ON TIME
  { id: 14, type: 'stage', subtype: 'stageChange', title: 'RANIA YOUSSEF moved from Shortlisted to Under medical', jobId: 'j2', candidateId: 'ca10', relatedTo: 'RANIA YOUSSEF', date: '2026-03-04 10:00:00', scheduledDate: '2026-03-04', status: 'done', assigneeId: 'u2', user: 'Sara' },
  // ca13, ca22: Cook - Vikram (ag3)
  { id: 15, type: 'stage', subtype: 'stageChange', title: 'OMAR FARIS moved from Screening to Interview', jobId: 'j3', candidateId: 'ca13', relatedTo: 'OMAR FARIS', date: '2026-03-02 14:00:00', scheduledDate: '2026-03-02', status: 'done', assigneeId: 'u4', user: 'Vikram' },
  { id: 16, type: 'stage', subtype: 'stageChange', title: 'SUNITA DEVI moved from Under medical to Medical Fit', jobId: 'j3', candidateId: 'ca22', relatedTo: 'SUNITA DEVI', date: '2026-03-05 11:00:00', scheduledDate: '2026-03-05', status: 'done', assigneeId: 'u4', user: 'Vikram' },
  { id: 17, type: 'stage', subtype: 'stageChange', title: 'PRADEEP SINGH moved from Medical Fit to Placed', jobId: 'j3', candidateId: 'ca29', relatedTo: 'PRADEEP SINGH', date: '2026-03-06 16:00:00', scheduledDate: '2026-03-06', status: 'done', assigneeId: 'u4', user: 'Vikram' },
  // Other activities
  { id: 18, type: 'call', title: 'Call with Saudi German Hospital', jobId: 'j1', date: '2026-03-02 10:00:00', scheduledDate: '2026-03-02', status: 'done', assigneeId: 'u2', user: 'Sara' },
  { id: 19, type: 'interview', title: 'Interview - MARIA SANTOS', jobId: 'j2', candidateId: 'ca2', relatedTo: 'MARIA SANTOS', date: '2026-03-06 13:00:00', scheduledDate: '2026-03-06', status: 'scheduled', assigneeId: 'u2', user: 'Sara' },
  { id: 20, type: 'email', title: 'Sent CV to King Faisal HR', jobId: 'j3', date: '2026-03-01 16:00:00', scheduledDate: '2026-03-01', status: 'done', assigneeId: 'u4', user: 'Vikram' }
];

const mockInbox = [
  { id: 1, from: 'Saudi German HR', subject: 'Re: Nurse positions - Jeddah', preview: 'Thank you for the CVs. We would like to schedule...', date: '1h ago', unread: true },
  { id: 2, from: 'King Faisal Hospital', subject: 'Interview confirmation', preview: 'Interview scheduled for MARIA SANTOS on March 5...', date: '3h ago', unread: true },
  { id: 3, from: 'Al Noor Hospital', subject: 'New job requirement', preview: 'We have 5 new positions for ICU nurses...', date: '1d ago', unread: false }
];

// Users: role 'admin' | 'agent'. Agent users have agentId (link to Agent entity)
const mockUsers = [
  { id: 'u1', name: 'Muhammad', role: 'admin', email: 'admin@test.com', password: '123', avatar: 'M', agentId: null },
  { id: 'u2', name: 'Sara', role: 'agent', email: 'agent1@test.com', password: '123', avatar: 'S', agentId: 'ag1' },
  { id: 'u3', name: 'Rosa', role: 'agent', email: 'agent2@test.com', password: '123', avatar: 'R', agentId: 'ag2' },
  { id: 'u4', name: 'Vikram', role: 'agent', email: 'agent3@test.com', password: '123', avatar: 'V', agentId: 'ag3' },
  { id: 'u5', name: 'Priya', role: 'agent', email: 'agent4@test.com', password: '123', avatar: 'P', agentId: 'ag4' },
  { id: 'u6', name: 'Joseph', role: 'agent', email: 'agent5@test.com', password: '123', avatar: 'J', agentId: 'ag5' }
];

// Nationalities (lookup for authorization, candidates, etc.)
const mockNationalities = [
  { id: 'n1', name: 'India' },
  { id: 'n2', name: 'Philippines' },
  { id: 'n3', name: 'Egypt' },
  { id: 'n4', name: 'Pakistan' },
  { id: 'n5', name: 'Sri Lanka' },
  { id: 'n6', name: 'Kenya' }
];

// Countries lookup (for agent address)
const mockCountries = [
  { name: 'Pakistan' },
  { name: 'Philippines' },
  { name: 'Saudi Arabia' },
  { name: 'India' },
  { name: 'Egypt' },
  { name: 'Sri Lanka' },
  { name: 'Kenya' }
];

// Cities by country (for agent address – city filtered by country)
const mockCitiesByCountry = {
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
  'Philippines': ['Manila', 'Cebu', 'Davao', 'Quezon City', 'Makati'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza'],
  'Sri Lanka': ['Colombo', 'Kandy', 'Galle'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
};

// Agents (company/agency entity). Each agent can have many agent users.
// 2 Philippines, 2 India, 1 Kenya
const mockAgents = [
  { id: 'ag1', name: 'TRANS ASIA INTEGRATE SERVICES', code: 'TAS', licenseNo: '', nameEn: '', officeOfficialName: '', agentType: 'External', country: 'Philippines', city: 'Manila', supplierSite: '', phone: '', streetName: '', poBox: '', fax: '', buildingNumber: '', officeSpaceSqm: '' },
  { id: 'ag2', name: 'Pacific Overseas Recruitment', code: 'POR', licenseNo: '', nameEn: '', officeOfficialName: '', agentType: 'External', country: 'Philippines', city: 'Cebu', supplierSite: '', phone: '', streetName: '', poBox: '', fax: '', buildingNumber: '', officeSpaceSqm: '' },
  { id: 'ag3', name: 'India Global Manpower Agency', code: 'IGM', licenseNo: '', nameEn: '', officeOfficialName: '', agentType: 'External', country: 'India', city: 'Mumbai', supplierSite: '', phone: '', streetName: '', poBox: '', fax: '', buildingNumber: '', officeSpaceSqm: '' },
  { id: 'ag4', name: 'South Asia Recruitment Services', code: 'SARS', licenseNo: '', nameEn: '', officeOfficialName: '', agentType: 'External', country: 'India', city: 'Delhi', supplierSite: '', phone: '', streetName: '', poBox: '', fax: '', buildingNumber: '', officeSpaceSqm: '' },
  { id: 'ag5', name: 'East Africa Manpower Agency', code: 'EAMA', licenseNo: '', nameEn: '', officeOfficialName: '', agentType: 'External', country: 'Kenya', city: 'Nairobi', supplierSite: '', phone: '', streetName: '', poBox: '', fax: '', buildingNumber: '', officeSpaceSqm: '' }
];

// Authorizations linked to hiring requests
const mockAgentAuthorizations = [
  { id: 'aa1', code: 'AUTH-001', clientId: 'c1', hiringRequestId: 'hr1', agentId: 'u2', nationalityId: 'n2', authorizationDate: '2025-02-15', issueDate: '2025-02-15', mainAgentId: 'ag1', eWakalaAgentId: 'ag1', inEmbassy: false, enjazNotes: 'Housemaid - Philippines - Visa 1305370995', enjazName: 'TRANS ASIA INTEGRATE SERVICES' },
  { id: 'aa2', code: 'AUTH-002', clientId: 'c1', hiringRequestId: 'hr2', agentId: 'u2', nationalityId: 'n2', authorizationDate: '2025-02-20', issueDate: '2025-02-20', mainAgentId: 'ag1', eWakalaAgentId: 'ag1', inEmbassy: false, enjazNotes: 'Housemaid - Philippines', enjazName: 'TRANS ASIA INTEGRATE SERVICES' },
  { id: 'aa3', code: 'AUTH-003', clientId: 'c1', hiringRequestId: 'hr3', agentId: 'u2', nationalityId: 'n1', authorizationDate: '2025-03-01', issueDate: '2025-03-01', mainAgentId: 'ag1', eWakalaAgentId: 'ag1', inEmbassy: true, enjazNotes: 'Common Labor - India/Philippines', enjazName: 'TRANS ASIA INTEGRATE SERVICES' },
  { id: 'aa4', code: 'AUTH-004', clientId: 'c1', hiringRequestId: 'hr4', agentId: 'u2', nationalityId: 'n1', authorizationDate: '2025-03-05', issueDate: '', mainAgentId: 'ag1', eWakalaAgentId: 'ag1', inEmbassy: false, enjazNotes: '', enjazName: 'TRANS ASIA INTEGRATE SERVICES' },
  { id: 'aa5', code: 'AUTH-005', clientId: 'c2', hiringRequestId: 'hr5', agentId: 'u4', nationalityId: 'n1', authorizationDate: '2025-03-10', issueDate: '2025-03-10', mainAgentId: 'ag3', eWakalaAgentId: 'ag3', inEmbassy: false, enjazNotes: 'Cook - India', enjazName: 'India Global Manpower Agency' },
  { id: 'aa6', code: 'AUTH-006', clientId: 'c2', hiringRequestId: 'hr6', agentId: 'u4', nationalityId: 'n1', authorizationDate: '2025-03-12', issueDate: '', mainAgentId: 'ag3', eWakalaAgentId: 'ag3', inEmbassy: false, enjazNotes: '', enjazName: 'India Global Manpower Agency' }
];

// CVs: uploaded without job/HR; can be converted to candidate (AI or manual)
const mockCVs = [
  { id: 'cv1', fileName: 'Maria_Santos_RN.pdf', uploadDate: '2025-03-01 14:30', status: 'converted', candidateId: 'ca2', uploadedByUserId: 'u1' },
  { id: 'cv2', fileName: 'Ahmed_Hassan_Nurse.pdf', uploadDate: '2025-03-02 09:15', status: 'converted', candidateId: 'ca3', uploadedByUserId: 'u1' },
  { id: 'cv3', fileName: 'John_Doe_RN.pdf', uploadDate: '2025-03-03 11:00', status: 'not_converted', candidateId: null, uploadedByUserId: 'u2' }
];

const mockAuditLog = [
  { id: 1, action: 'User login', user: 'Muhammad', date: '2025-03-03 10:00' },
  { id: 2, action: 'Job created: Nurse - Jeddah', user: 'Muhammad', date: '2025-03-02 14:30' },
  { id: 3, action: 'Candidate added: KEJANE M. CABANTAC', user: 'Muhammad', date: '2025-03-01 09:15' }
];

const mockCandidateHistory = {
  ca1: [
    { id: 1, user: 'Muhammad', userAvatar: 'M', action: "added the tag 'Nurse' to this candidate", date: '9 days ago (2026-02-01)' },
    { id: 2, user: 'Muhammad', userAvatar: 'M', action: "added the tag 'Best Migrant Workers - Philippines' to this candidate", date: '9 days ago (2026-02-01)' },
    { id: 3, user: 'Muhammad', userAvatar: 'M', action: 'hired the candidate KEJANE M. CABANTAC', date: '9 days ago (2026-02-01)' },
    { id: 4, user: 'Muhammad', userAvatar: 'M', action: 'moved the candidate KEJANE M. CABANTAC from stage Visa Stamping to stage Placed', date: '9 days ago (2026-02-01)' },
    { id: 5, user: 'Muhammad', userAvatar: 'M', action: 'updated the candidate KEJANE M. CABANTAC', date: '9 days ago (2026-02-01)' }
  ],
  ca2: [],
  ca3: []
};

function getStagesForHiringRequest(hrId) {
  const a = mockAssignments[hrId];
  if (!a) return DEFAULT_STAGES;
  return Object.keys(a).length ? Object.keys(a) : DEFAULT_STAGES;
}

function getHiringRequestAssignments(hrId) {
  return mockAssignments[hrId] || {};
}

// --- Taeed (MOL Support / تایید) - Admin only ---
const mockTaeeds = [
  {
    id: 't1',
    issuedNo: '1006473',
    visaType: 'Taeed',
    issueDateHijri: '9/11/1445',
    issueDate: '20/03/2024',
    sectorType: 'Household',
    molEmployer: 'Domestic CR',
    workOwnerNo: '7007618023',
    taedQuantity: 1000,
    totalVisa: 204,
    issuedVisaNumber: 696,
    supportCase: 'Valid',
    expiryDateHijri: '9/14/1446',
    expiryDate: '13/03/2025',
    sendToFinance: 'No',
    totalPaidVisa: '',
    fromTaed: '',
    visaNotes: '',
    taedCancel: 0
  }
];

// Taeed Details - profession-level breakdown; quantity taken from Taeed
const mockTaeedDetails = [
  { id: 'td1', taeedId: 't1', molNo: '1006473', molHeader: '1006473', profession: 'Housemaid', nationality: 'Block', gender: 'Female', visasQty: 204, sector: 'Household', comingCity: 'Block' }
];

// --- Issued Visa Header - Admin only ---
const mockIssuedVisaHeaders = [
  {
    id: 'ivh1',
    issuedNo: '1302035097',
    visaType: 'Issued visa',
    issueDateHijri: '1/5/1445',
    issueDate: '14/11/2023',
    sectorType: 'Household',
    molEmployer: 'Domestic CR',
    workOwnerNo: '7006070325',
    taedQuantity: null,
    totalVisa: 36
  }
];

// Issued Visa Details - profession/nationality breakdown; quantity from header
const mockIssuedVisaDetails = [
  { id: 'ivd1', headerId: 'ivh1', visaNo: '1302035097', visaHeader: '1302035097', fromMolSupport: '1006473', profession: 'Housemaid', nationality: 'Uganda', gender: 'Female', visasQty: 36, sector: 'Household', comingCity: 'Kampala', statusReason: 'Active', orderNo: '', issueDateHijri: '1/5/1445', issueDate: '13/11/2023', expiryDateHijri: '1/5/1447', startingVisasQty: 36, issuedVisaNumber: '', molCancel: '', visaExpireDate: '22/10/2025' }
];

// Visa status counts for Taeed/Issued Visa detail dashboards
const VISA_DASHBOARD_STATUSES = ['Visa Numbers', 'Available', 'Hiring Request', 'Authorization', 'Labors on Visa', 'Arrived', 'Escap', 'Not-Arrived', 'Labours Visa Expired', 'Expire Soon'];

// Data validation - returns { valid: boolean, errors: string[] }
function validateData() {
  const errors = [];
  const candIds = new Set(mockCandidates.map(c => c.id));
  const hrIds = new Set(mockHiringRequests.map(h => h.id));
  const agentIds = new Set(mockAgents.map(a => a.id));
  const assignedCandIds = new Set();
  for (const hrId of Object.keys(mockAssignments || {})) {
    if (!hrIds.has(hrId)) errors.push('Assignment references unknown HR: ' + hrId);
    const hr = mockHiringRequests.find(h => h.id === hrId);
    const agentId = hr && mockUsers.find(u => u.id === hr.assignedAgentId)?.agentId;
    for (const stage of Object.keys(mockAssignments[hrId] || {})) {
      for (const cid of (mockAssignments[hrId][stage] || [])) {
        if (!candIds.has(cid)) errors.push('Assignment references unknown candidate: ' + cid);
        if (assignedCandIds.has(cid)) errors.push('Candidate assigned to multiple HRs: ' + cid);
        assignedCandIds.add(cid);
        const c = mockCandidates.find(x => x.id === cid);
        if (c && agentId && c.agentId !== agentId) errors.push('Candidate ' + cid + ' agentId ' + c.agentId + ' does not match HR agent ' + agentId);
      }
    }
  }
  const unassigned = mockCandidates.filter(c => !assignedCandIds.has(c.id)).length;
  if (unassigned < 5) errors.push('Expected at least 5 unassigned candidates, found ' + unassigned);
  for (const c of mockCandidates) {
    if (!c.agentId || !agentIds.has(c.agentId)) errors.push('Candidate ' + c.id + ' has invalid agentId: ' + c.agentId);
  }
  return { valid: errors.length === 0, errors };
}
