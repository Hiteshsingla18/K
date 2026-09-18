import { MineRecord } from '../types';

export const MINES_DATA: MineRecord[] = [
  // =========================================================================
  // 1. JHARKHAND (5 MINES)
  // =========================================================================
  {
    id: 'MIN-4492-R',
    name: 'Rajmahal Open Cast Project (OCP)',
    region: 'Godda / Sahibganj',
    state: 'Jharkhand',
    subsidiary: 'ECL',
    basin: 'Rajmahal Basin',
    status: 'critical',
    complianceScore: 58,
    operator: 'Eastern Coalfields Limited (ECL)',
    lastInspection: '14 Oct 2023',
    permitExp: 'Dec 2025',
    activeReports: 14,
    unauthorizedAreaHa: 28,
    coalfield: 'Rajmahal Coalfield',
    productionCapacityMTPA: 17.0,
    latitude: 25.0215,
    longitude: 87.3982,
    workforceSplit: {
      permanent: 248,
      contractual: 164,
      total: 412
    },
    activeWorkforce: 412,
    flags: [
      { title: 'Unauthorized Ext. Beyond Boundary', note: 'Satellite delta scan (T-24h): 28 Ha breach (Notice SCN-2026-082)', severity: 9 },
      { title: 'Missing Dust Control Water Sprinkler Logs', note: 'Automated telemetry audit failure on Haul Road Alpha', severity: 6 },
    ]
  },
  {
    id: 'MIN-3108-J',
    name: 'Jharia Kujama Colliery',
    region: 'Dhanbad',
    state: 'Jharkhand',
    subsidiary: 'BCCL',
    basin: 'Damodar Valley Basin',
    status: 'critical',
    complianceScore: 61,
    operator: 'Bharat Coking Coal Limited (BCCL)',
    lastInspection: '22 Nov 2023',
    permitExp: 'Mar 2026',
    activeReports: 9,
    unauthorizedAreaHa: 16.2,
    coalfield: 'Jharia Coalfield',
    productionCapacityMTPA: 4.8,
    latitude: 23.7420,
    longitude: 86.4180,
    workforceSplit: {
      permanent: 520,
      contractual: 380,
      total: 900
    },
    activeWorkforce: 900,
    flags: [
      { title: 'Thermal Infrasound Sensor Alert', note: 'Sub-surface coal seam fire plume detected along Kujama flank', severity: 9 },
      { title: 'Unregulated Gas Venting (CO > 50 ppm)', note: 'Continuous optical gas telemetry warning', severity: 8 },
    ]
  },
  {
    id: 'MIN-7120-N',
    name: 'North Karanpura Megamine',
    region: 'Chatra / Hazaribagh',
    state: 'Jharkhand',
    subsidiary: 'CCL',
    basin: 'Damodar Valley Basin',
    status: 'compliant',
    complianceScore: 91,
    operator: 'Central Coalfields Limited (CCL)',
    lastInspection: '10 Feb 2024',
    permitExp: 'Oct 2030',
    activeReports: 2,
    coalfield: 'North Karanpura Coalfield',
    productionCapacityMTPA: 20.0,
    latitude: 23.8610,
    longitude: 85.0820,
    workforceSplit: {
      permanent: 680,
      contractual: 840,
      total: 1520
    },
    activeWorkforce: 1520,
    flags: []
  },
  {
    id: 'MIN-2841-B',
    name: 'Bokaro Amalgamated Colliery',
    region: 'Bokaro / Bermo',
    state: 'Jharkhand',
    subsidiary: 'CCL',
    basin: 'Damodar Valley Basin',
    status: 'compliant',
    complianceScore: 86,
    operator: 'Central Coalfields Limited (CCL)',
    lastInspection: '18 Jan 2024',
    permitExp: 'May 2028',
    activeReports: 3,
    coalfield: 'East Bokaro Coalfield',
    productionCapacityMTPA: 9.5,
    latitude: 23.7780,
    longitude: 85.8640,
    workforceSplit: {
      permanent: 490,
      contractual: 410,
      total: 900
    },
    activeWorkforce: 900,
    flags: [
      { title: 'Konar River Silt Trap Maintenance Due', note: 'Quarterly environmental audit recommendation', severity: 4 }
    ]
  },
  {
    id: 'MIN-3315-M',
    name: 'Moonidih Underground Project',
    region: 'Dhanbad',
    state: 'Jharkhand',
    subsidiary: 'BCCL',
    basin: 'Damodar Valley Basin',
    status: 'compliant',
    complianceScore: 84,
    operator: 'Bharat Coking Coal Limited (BCCL)',
    lastInspection: '05 Jan 2024',
    permitExp: 'Aug 2027',
    activeReports: 3,
    coalfield: 'Jharia Coalfield',
    productionCapacityMTPA: 3.2,
    latitude: 23.7370,
    longitude: 86.3470,
    workforceSplit: {
      permanent: 620,
      contractual: 280,
      total: 900
    },
    activeWorkforce: 900,
    flags: [
      { title: 'Longwall Degasification Telemetry Stable', note: 'Methanometer array calibrated within DGMS limits', severity: 3 }
    ]
  },

  // =========================================================================
  // 2. CHHATTISGARH (5 MINES)
  // =========================================================================
  {
    id: 'MIN-8834-K',
    name: 'Gevra Mega Open Cast Project',
    region: 'Korba',
    state: 'Chhattisgarh',
    subsidiary: 'SECL',
    basin: 'Hasdeo-Arand Basin',
    status: 'compliant',
    complianceScore: 94,
    operator: 'South Eastern Coalfields Limited (SECL)',
    lastInspection: '12 Dec 2023',
    permitExp: 'Jul 2028',
    activeReports: 4,
    coalfield: 'Korba Coalfield',
    productionCapacityMTPA: 52.5,
    latitude: 22.3582,
    longitude: 82.6841,
    workforceSplit: {
      permanent: 1450,
      contractual: 1850,
      total: 3300
    },
    activeWorkforce: 3300,
    flags: [
      { title: 'High-volume Continuous Miner Deployment', note: 'Automated tele-remote fleet operating under MoEFCC clearance', severity: 2 }
    ]
  },
  {
    id: 'MIN-8850-K',
    name: 'Kusmunda Super Pit OCP',
    region: 'Korba',
    state: 'Chhattisgarh',
    subsidiary: 'SECL',
    basin: 'Hasdeo-Arand Basin',
    status: 'compliant',
    complianceScore: 89,
    operator: 'South Eastern Coalfields Limited (SECL)',
    lastInspection: '08 Feb 2024',
    permitExp: 'Nov 2029',
    activeReports: 3,
    coalfield: 'Korba Coalfield',
    productionCapacityMTPA: 45.0,
    latitude: 22.3360,
    longitude: 82.6970,
    workforceSplit: {
      permanent: 1100,
      contractual: 1420,
      total: 2520
    },
    activeWorkforce: 2520,
    flags: []
  },
  {
    id: 'MIN-8862-D',
    name: 'Dipka Expansion OCP',
    region: 'Korba',
    state: 'Chhattisgarh',
    subsidiary: 'SECL',
    basin: 'Hasdeo-Arand Basin',
    status: 'monitor',
    complianceScore: 74,
    operator: 'South Eastern Coalfields Limited (SECL)',
    lastInspection: '28 Jan 2024',
    permitExp: 'Sep 2027',
    activeReports: 6,
    coalfield: 'Korba Coalfield',
    productionCapacityMTPA: 35.0,
    latitude: 22.3180,
    longitude: 82.5690,
    workforceSplit: {
      permanent: 890,
      contractual: 1210,
      total: 2100
    },
    activeWorkforce: 2100,
    flags: [
      { title: 'Haul Road Fugitive Dust Sensor Warning', note: 'Real-time CAAQMS station recorded PM10 > 250 µg/m³ near rail siding', severity: 6 },
      { title: 'Surface Miner Mist Cannon Log Gaps', note: 'Water delivery pressure fell below standard operating threshold', severity: 5 }
    ]
  },
  {
    id: 'MIN-8875-C',
    name: 'Chhal Open Cast Project',
    region: 'Raigarh',
    state: 'Chhattisgarh',
    subsidiary: 'SECL',
    basin: 'Mand-Raigarh Basin',
    status: 'monitor',
    complianceScore: 78,
    operator: 'South Eastern Coalfields Limited (SECL)',
    lastInspection: '15 Jan 2024',
    permitExp: 'Aug 2027',
    activeReports: 5,
    coalfield: 'Mand-Raigarh Coalfield',
    productionCapacityMTPA: 12.0,
    latitude: 22.0910,
    longitude: 83.1320,
    workforceSplit: {
      permanent: 340,
      contractual: 560,
      total: 900
    },
    activeWorkforce: 900,
    flags: [
      { title: 'Overburden Bench Slope Angle Audit', note: 'Slope stability radar flagged minor settling on South Dump', severity: 6 }
    ]
  },
  {
    id: 'MIN-8889-B',
    name: 'Bishrampur Underground Project',
    region: 'Surajpur',
    state: 'Chhattisgarh',
    subsidiary: 'SECL',
    basin: 'Son-Hatdo Basin',
    status: 'compliant',
    complianceScore: 87,
    operator: 'South Eastern Coalfields Limited (SECL)',
    lastInspection: '03 Dec 2023',
    permitExp: 'Jun 2028',
    activeReports: 1,
    coalfield: 'Bishrampur Coalfield',
    productionCapacityMTPA: 2.8,
    latitude: 23.1810,
    longitude: 82.9930,
    workforceSplit: {
      permanent: 420,
      contractual: 190,
      total: 610
    },
    activeWorkforce: 610,
    flags: []
  },

  // =========================================================================
  // 3. ODISHA (4 MINES)
  // =========================================================================
  {
    id: 'MIN-9941-T',
    name: 'Talcher Central OCP',
    region: 'Angul',
    state: 'Odisha',
    subsidiary: 'MCL',
    basin: 'Mahanadi Basin',
    status: 'compliant',
    complianceScore: 93,
    operator: 'Mahanadi Coalfields Limited (MCL)',
    lastInspection: '18 Jan 2024',
    permitExp: 'May 2029',
    activeReports: 2,
    coalfield: 'Talcher Coalfield',
    productionCapacityMTPA: 24.0,
    latitude: 20.9500,
    longitude: 85.2150,
    workforceSplit: {
      permanent: 950,
      contractual: 1200,
      total: 2150
    },
    activeWorkforce: 2150,
    flags: []
  },
  {
    id: 'MIN-9955-I',
    name: 'Ib Valley Belpahar OCP',
    region: 'Jharsuguda',
    state: 'Odisha',
    subsidiary: 'MCL',
    basin: 'Ib Valley Basin',
    status: 'compliant',
    complianceScore: 88,
    operator: 'Mahanadi Coalfields Limited (MCL)',
    lastInspection: '22 Feb 2024',
    permitExp: 'Apr 2029',
    activeReports: 2,
    coalfield: 'Ib Valley Coalfield',
    productionCapacityMTPA: 18.0,
    latitude: 21.8210,
    longitude: 83.8560,
    workforceSplit: {
      permanent: 720,
      contractual: 880,
      total: 1600
    },
    activeWorkforce: 1600,
    flags: []
  },
  {
    id: 'MIN-9968-L',
    name: 'Lakhanpur Open Cast Mine',
    region: 'Jharsuguda',
    state: 'Odisha',
    subsidiary: 'MCL',
    basin: 'Ib Valley Basin',
    status: 'compliant',
    complianceScore: 85,
    operator: 'Mahanadi Coalfields Limited (MCL)',
    lastInspection: '14 Nov 2023',
    permitExp: 'Dec 2027',
    activeReports: 3,
    coalfield: 'Ib Valley Coalfield',
    productionCapacityMTPA: 21.0,
    latitude: 21.7580,
    longitude: 83.8240,
    workforceSplit: {
      permanent: 680,
      contractual: 910,
      total: 1590
    },
    activeWorkforce: 1590,
    flags: []
  },
  {
    id: 'MIN-9982-K',
    name: 'Kaniha Open Cast Project',
    region: 'Angul',
    state: 'Odisha',
    subsidiary: 'MCL',
    basin: 'Mahanadi Basin',
    status: 'critical',
    complianceScore: 63,
    operator: 'Mahanadi Coalfields Limited (MCL)',
    lastInspection: '09 Jan 2024',
    permitExp: 'Feb 2026',
    activeReports: 12,
    unauthorizedAreaHa: 19.4,
    coalfield: 'Talcher Coalfield',
    productionCapacityMTPA: 14.0,
    latitude: 21.0740,
    longitude: 85.0740,
    workforceSplit: {
      permanent: 410,
      contractual: 590,
      total: 1000
    },
    activeWorkforce: 1000,
    flags: [
      { title: 'Silt Retention Sump Overflow', note: 'Runoff discharged into Tikra River tributary following unseasonal rains', severity: 9 },
      { title: 'Statutory Greenbelt Buffer Deficit', note: 'Satellite NDVI audit: 19.4 Ha non-vegetated outer buffer perimeter', severity: 8 }
    ]
  },

  // =========================================================================
  // 4. WEST BENGAL (3 MINES)
  // =========================================================================
  {
    id: 'MIN-5521-R',
    name: 'Raniganj Sripur Colliery',
    region: 'Asansol / Paschim Bardhaman',
    state: 'West Bengal',
    subsidiary: 'ECL',
    basin: 'Damodar Valley Basin',
    status: 'monitor',
    complianceScore: 72,
    operator: 'Eastern Coalfields Limited (ECL)',
    lastInspection: '19 Sep 2023',
    permitExp: 'Nov 2025',
    activeReports: 7,
    unauthorizedAreaHa: 9.8,
    coalfield: 'Raniganj Coalfield',
    productionCapacityMTPA: 6.8,
    latitude: 23.6821,
    longitude: 86.9744,
    workforceSplit: {
      permanent: 580,
      contractual: 420,
      total: 1000
    },
    activeWorkforce: 1000,
    flags: [
      { title: 'Excess Mine Inundation Water Runoff', note: 'Pumping telemetry breach into local natural drainage channel', severity: 7 },
      { title: 'InSAR Ground Displacement Tracking', note: 'Subsidence radar: 2.8 cm/month alert on old workings perimeter', severity: 6 }
    ]
  },
  {
    id: 'MIN-5534-J',
    name: 'Jhanjra Longwall Underground Project',
    region: 'Paschim Bardhaman',
    state: 'West Bengal',
    subsidiary: 'ECL',
    basin: 'Damodar Valley Basin',
    status: 'compliant',
    complianceScore: 88,
    operator: 'Eastern Coalfields Limited (ECL)',
    lastInspection: '11 Dec 2023',
    permitExp: 'Oct 2028',
    activeReports: 2,
    coalfield: 'Raniganj Coalfield',
    productionCapacityMTPA: 4.5,
    latitude: 23.6650,
    longitude: 87.2880,
    workforceSplit: {
      permanent: 820,
      contractual: 330,
      total: 1150
    },
    activeWorkforce: 1150,
    flags: []
  },
  {
    id: 'MIN-5547-K',
    name: 'Khottadih Underground & OCP',
    region: 'Paschim Bardhaman',
    state: 'West Bengal',
    subsidiary: 'ECL',
    basin: 'Damodar Valley Basin',
    status: 'compliant',
    complianceScore: 82,
    operator: 'Eastern Coalfields Limited (ECL)',
    lastInspection: '20 Jan 2024',
    permitExp: 'Jun 2027',
    activeReports: 4,
    coalfield: 'Raniganj Coalfield',
    productionCapacityMTPA: 3.1,
    latitude: 23.7140,
    longitude: 87.2340,
    workforceSplit: {
      permanent: 460,
      contractual: 290,
      total: 750
    },
    activeWorkforce: 750,
    flags: [
      { title: 'Water Spray Nozzle Pressure Fluctuations', note: 'Conveyor belt transfer chute dust suppression advisory', severity: 5 }
    ]
  },

  // =========================================================================
  // 5. MADHYA PRADESH (3 MINES)
  // =========================================================================
  {
    id: 'MIN-6284-S',
    name: 'Singrauli Jayant OCP',
    region: 'Singrauli',
    state: 'Madhya Pradesh',
    subsidiary: 'NCL',
    basin: 'Son Valley Basin',
    status: 'compliant',
    complianceScore: 90,
    operator: 'Northern Coalfields Limited (NCL)',
    lastInspection: '04 Nov 2023',
    permitExp: 'Jan 2027',
    activeReports: 3,
    coalfield: 'Singrauli Coalfield',
    productionCapacityMTPA: 25.0,
    latitude: 24.1124,
    longitude: 82.6318,
    workforceSplit: {
      permanent: 1150,
      contractual: 1350,
      total: 2500
    },
    activeWorkforce: 2500,
    flags: []
  },
  {
    id: 'MIN-6298-N',
    name: 'Nigahi Super OCP',
    region: 'Singrauli',
    state: 'Madhya Pradesh',
    subsidiary: 'NCL',
    basin: 'Son Valley Basin',
    status: 'compliant',
    complianceScore: 89,
    operator: 'Northern Coalfields Limited (NCL)',
    lastInspection: '16 Dec 2023',
    permitExp: 'Sep 2028',
    activeReports: 2,
    coalfield: 'Singrauli Coalfield',
    productionCapacityMTPA: 21.0,
    latitude: 24.1350,
    longitude: 82.5950,
    workforceSplit: {
      permanent: 980,
      contractual: 1120,
      total: 2100
    },
    activeWorkforce: 2100,
    flags: []
  },
  {
    id: 'MIN-6310-B',
    name: 'Bina Open Cast Project',
    region: 'Singrauli',
    state: 'Madhya Pradesh',
    subsidiary: 'NCL',
    basin: 'Son Valley Basin',
    status: 'compliant',
    complianceScore: 86,
    operator: 'Northern Coalfields Limited (NCL)',
    lastInspection: '27 Jan 2024',
    permitExp: 'Jul 2028',
    activeReports: 3,
    coalfield: 'Singrauli Coalfield',
    productionCapacityMTPA: 10.5,
    latitude: 24.1620,
    longitude: 82.7480,
    workforceSplit: {
      permanent: 640,
      contractual: 780,
      total: 1420
    },
    activeWorkforce: 1420,
    flags: []
  },

  // =========================================================================
  // 6. MAHARASHTRA (3 MINES)
  // =========================================================================
  {
    id: 'MIN-1422-C',
    name: 'Chandrapur Durgapur OCP',
    region: 'Chandrapur',
    state: 'Maharashtra',
    subsidiary: 'WCL',
    basin: 'Wardha Valley Basin',
    status: 'monitor',
    complianceScore: 76,
    operator: 'Western Coalfields Limited (WCL)',
    lastInspection: '06 Nov 2023',
    permitExp: 'Dec 2026',
    activeReports: 5,
    coalfield: 'Wardha Valley Coalfield',
    productionCapacityMTPA: 5.2,
    latitude: 19.9860,
    longitude: 79.3080,
    workforceSplit: {
      permanent: 510,
      contractual: 630,
      total: 1140
    },
    activeWorkforce: 1140,
    flags: [
      { title: 'Tadoba Buffer Zone Ambient Air Alert', note: 'Automated telemetry logged elevated PM10 during dry crosswinds', severity: 6 }
    ]
  },
  {
    id: 'MIN-1435-U',
    name: 'Umrer Open Cast Project',
    region: 'Nagpur',
    state: 'Maharashtra',
    subsidiary: 'WCL',
    basin: 'Wardha Valley Basin',
    status: 'compliant',
    complianceScore: 85,
    operator: 'Western Coalfields Limited (WCL)',
    lastInspection: '12 Jan 2024',
    permitExp: 'Mar 2029',
    activeReports: 2,
    coalfield: 'Umrer Coalfield',
    productionCapacityMTPA: 4.5,
    latitude: 20.8650,
    longitude: 79.3360,
    workforceSplit: {
      permanent: 430,
      contractual: 520,
      total: 950
    },
    activeWorkforce: 950,
    flags: []
  },
  {
    id: 'MIN-1448-S',
    name: 'Sasti Underground Mine',
    region: 'Chandrapur',
    state: 'Maharashtra',
    subsidiary: 'WCL',
    basin: 'Wardha Valley Basin',
    status: 'compliant',
    complianceScore: 83,
    operator: 'Western Coalfields Limited (WCL)',
    lastInspection: '24 Jan 2024',
    permitExp: 'Nov 2027',
    activeReports: 1,
    coalfield: 'Wardha Valley Coalfield',
    productionCapacityMTPA: 1.9,
    latitude: 19.8240,
    longitude: 79.3320,
    workforceSplit: {
      permanent: 390,
      contractual: 180,
      total: 570
    },
    activeWorkforce: 570,
    flags: []
  },

  // =========================================================================
  // 7. TELANGANA (2 MINES)
  // =========================================================================
  {
    id: 'MIN-7712-K',
    name: 'Singareni Kothagudem OCP IV',
    region: 'Bhadradri Kothagudem',
    state: 'Telangana',
    subsidiary: 'SCCL',
    basin: 'Godavari Valley Basin',
    status: 'compliant',
    complianceScore: 91,
    operator: 'Singareni Collieries Company Ltd (SCCL)',
    lastInspection: '07 Feb 2024',
    permitExp: 'Dec 2029',
    activeReports: 2,
    coalfield: 'Godavari Valley Coalfield',
    productionCapacityMTPA: 8.5,
    latitude: 17.5480,
    longitude: 80.6120,
    workforceSplit: {
      permanent: 820,
      contractual: 950,
      total: 1770
    },
    activeWorkforce: 1770,
    flags: []
  },
  {
    id: 'MIN-7725-R',
    name: 'Ramagundam OC III Extension',
    region: 'Peddapalli',
    state: 'Telangana',
    subsidiary: 'SCCL',
    basin: 'Godavari Valley Basin',
    status: 'compliant',
    complianceScore: 88,
    operator: 'Singareni Collieries Company Ltd (SCCL)',
    lastInspection: '19 Dec 2023',
    permitExp: 'Oct 2028',
    activeReports: 1,
    coalfield: 'Godavari Valley Coalfield',
    productionCapacityMTPA: 7.2,
    latitude: 18.7610,
    longitude: 79.4890,
    workforceSplit: {
      permanent: 760,
      contractual: 890,
      total: 1650
    },
    activeWorkforce: 1650,
    flags: []
  }
];
