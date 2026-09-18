export type PortalType = 'gov' | 'operator' | 'officer' | 'labour' | 'citizen';
export type UserRole = 'gov' | 'operator' | 'officer' | 'labour' | 'citizen';

export interface AuthUser {
  role: UserRole;
  name: string;
  designation: string;
  agency: string;
  badgeText: string;
  avatarInitials: string;
  colliery?: string;
  workerId?: string;
}

export type GovNavType = 'overview' | 'explorer' | 'evidence' | 'citizen' | 'risk';

export type ViolationStatus = 
  | 'pending_review' 
  | 'awaiting_mine_response' 
  | 'response_submitted_awaiting_verification';

export interface OfflineMutation {
  id: string; // local UUID
  type: 'shift_attendance' | 'near_miss_report' | 'capa_issuance' | 'gas_incident_log';
  title: string;
  origin: 'labour_app' | 'mine_officer';
  timestamp: string;
  idempotencyKey: string;
  status: 'pending' | 'syncing' | 'synced';
  payloadSummary: string;
  serverRecordId?: string;
}

export interface CapaRecord {
  id: string; // e.g. 'CAPA-402'
  localUuid: string;
  workerTag: string; // e.g. 'Worker #218'
  workerName?: string;
  violationTitle: string; // e.g. 'Missing Hardhat in Heavy Haul Zone'
  severity: 'High' | 'Critical' | 'Medium';
  zone: string; // e.g. 'Opencast Haul Pit #4'
  assignedTo: string; // e.g. 'Overman Ramesh Yadav'
  timestamp: string;
  aiConfidence: number; // e.g. 88%
  status: 'Open' | 'Action_Initiated' | 'Resolved';
  syncStatus: 'pending' | 'synced';
  evidenceFrame: string;
  actionSummary?: string;
}

export interface WorkforceAttendanceRecord {
  id: string; // e.g. 'ATT-8812'
  localUuid: string;
  workerId: string; // e.g. 'WKR-8812'
  workerName: string; // e.g. 'Ramesh Soren'
  designation: string; // e.g. 'Drill & Excavation Operator'
  employmentCategory: 'Permanent' | 'Contractual';
  contractorAgency?: string; // e.g. 'Apex Mining Logistics'
  shift: 'Shift A' | 'Shift B' | 'Shift C';
  checkInTime: string; // e.g. '06:02 AM'
  date: string;
  geofenceGate: string; // e.g. 'Pit #2 Gate Alpha (Geofence Verified)'
  fitnessStatus: 'Fit (Form-O Valid)' | 'Fit (DGMS Valid)' | 'Training Due Soon' | 'Gate Pass Expiring' | 'Medical Review Req';
  syncStatus: 'pending' | 'synced';
  govRecordNumber?: string;
  avatarInitials?: string;
}

export interface LabourAttendanceRecord {
  id: string;
  localUuid: string;
  workerId: string;
  workerName: string;
  employmentCategory?: 'Permanent' | 'Contractual';
  contractorAgency?: string;
  designation?: string;
  shift: 'Shift A' | 'Shift B' | 'Shift C';
  checkInTime: string;
  date: string;
  geofenceStatus: string;
  syncStatus: 'pending' | 'synced';
  govRecordNumber?: string;
}

export interface LabourNearMissRecord {
  id: string; // e.g. 'WKR-7031'
  localUuid: string;
  category: 'Gas Smell' | 'Missing PPE' | 'Unstable Bench / Overburden Crack' | 'Machinery Fault';
  categoryHindi: string;
  description: string;
  photoAttached: boolean;
  photoPreview?: string;
  audioRecorded: boolean;
  audioDurationSec?: number;
  timestamp: string;
  date: string;
  syncStatus: 'pending' | 'synced';
  status: 'Received' | 'Assigned to Safety Officer' | 'Resolved';
}

export interface SafetyTelemetry {
  methaneCh4Pct: number; // e.g. 0.28%
  methaneStatus: 'Safe' | 'Warning' | 'Hazard';
  coPpm: number; // e.g. 12 ppm
  coStatus: 'Safe' | 'Warning' | 'Hazard';
  pm10DustUgm3: number; // e.g. 148 µg/m³
  pm10Status: 'Alert' | 'Moderate' | 'Safe';
  workersOnDuty: number; // 412
  equipmentUnitsActive: number; // 18
  activeShift: 'Shift B';
}

export interface MineRecord {
  id: string;
  name: string;
  region: string;
  state: string;
  subsidiary: string; // e.g. 'ECL', 'BCCL', 'CCL', 'SECL', 'MCL', 'NCL', 'WCL', 'SCCL'
  basin: string; // e.g. 'Rajmahal Basin', 'Damodar Valley Basin', 'Mahanadi Basin'
  status: 'critical' | 'monitor' | 'compliant';
  complianceScore: number;
  operator: string;
  lastInspection: string;
  permitExp: string;
  activeReports: number;
  unauthorizedAreaHa?: number;
  coalfield: string;
  productionCapacityMTPA: number;
  latitude: number;
  longitude: number;
  workforceSplit: {
    permanent: number;
    contractual: number;
    total: number;
  };
  activeWorkforce?: number;
  flags: { title: string; note: string; severity: number }[];
}

export interface CitizenReportRecord {
  id: string; // e.g. 'CR-882'
  pin: string; // e.g. '1428'
  mineId: string;
  mineName: string;
  village: string;
  category: string;
  categoryKey: string;
  date: string;
  timestamp: string;
  details: string;
  stage: 1 | 2 | 3 | 4 | 5;
  statusText: string;
  statusColor: 'emerald' | 'blue' | 'red' | 'amber';
  geotagCorrelationPct?: number;
  contributedToScn?: boolean;
  scnNumber?: string;
  scnNoticeDate?: string;
  scnOutcome?: string;
  outcomeStatus?: 'pending' | 'resolved' | 'active_notice';
  estimatedNextUpdate?: string;
}

export interface AuditTrailEntry {
  id: string;
  blockNumber: number;
  eventType: 'SCN_DISPATCH' | 'OPERATOR_DEFENSE' | 'SATELLITE_SYNC' | 'AI_CONFIDENCE_RUN' | 'COMMUNITY_CORROBORATION' | 'FIELD_VERIFICATION';
  eventLabel: string;
  author: string;
  role: string;
  agency: string;
  utcTimestamp: string;
  hashSha256: string;
  prevHashSha256: string;
  verificationStatus: 'verified' | 'tamper_proof';
  details: string;
  coordinates?: string;
}
