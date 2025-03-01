interface Sensor {
    deviceId: string;
    sn: string;
    a: number;
    w: number;
    pt: number;
    s: boolean;
    lj: boolean;
}

interface AlarmRule {
    on: boolean;
    th: number;
    thmm?: number;
    d: number;
    f?: number;
    tl?: number;
    tlmm?: number;
}

interface AlarmRules {
    h: AlarmRule;
    f: AlarmRule;
    l: AlarmRule;
    nd: { i: number; r: number; l: number };
    p: number;
    r: number;
    std: Record<string, unknown>;
}

interface GlucoseMeasurement {
    FactoryTimestamp: string;
    Timestamp: string;
    type: number;
    ValueInMgPerDl: number;
    TrendArrow: number;
    TrendMessage: string | null;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
}

interface PatientDevice {
    did: string;
    dtid: number;
    v: string;
    ll: number;
    hl: number;
    u: number;
    fixedLowAlarmValues: { mgdl: number; mmoll: number };
    alarms: boolean;
    fixedLowThreshold: number;
}

interface Connection {
    id: string;
    patientId: string;
    country: string;
    status: number;
    firstName: string;
    lastName: string;
    targetLow: number;
    targetHigh: number;
    uom: number;
    sensor: Sensor;
    alarmRules: AlarmRules;
    glucoseMeasurement: GlucoseMeasurement;
    glucoseItem: GlucoseMeasurement;
    glucoseAlarm: unknown | null;
    patientDevice: PatientDevice;
    created: number;
}

interface ActiveSensor {
    sensor: Sensor;
    device: PatientDevice;
}

interface GraphData {
    FactoryTimestamp: string;
    Timestamp: string;
    type: number;
    ValueInMgPerDl: number;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
}

interface Data {
    connection: Connection;
    activeSensors: ActiveSensor[];
    graphData: GraphData[];
}

interface Ticket {
    token: string;
    expires: number;
    duration: number;
}

interface ApiResponse {
    status: number;
    data: Data;
    ticket: Ticket;
}

export type { ApiResponse };
