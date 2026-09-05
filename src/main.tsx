import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Droplets,
  FileDown,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  MapPin,
  Menu,
  Power,
  QrCode,
  RefreshCcw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  Waves,
  Wifi,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import './styles.css';

type SensorKey = 'ph' | 'tds' | 'turbidity' | 'temperature' | 'conductivity' | 'iron' | 'manganese';
type Severity = 'safe' | 'warning' | 'critical';
type Range = '1h' | '6h' | '24h' | '7d';
type NavItem =
  | 'Dashboard'
  | 'Live Data'
  | 'Water Quality History'
  | 'Adaptive Treatment'
  | 'Alerts'
  | 'Filter & Maintenance'
  | 'Reports'
  | 'Settings'
  | 'About System';

type SensorState = Record<SensorKey, number> & {
  flow_rate: number;
  pressure: number;
  output_pressure: number;
  battery: number;
  solar_power: number;
  tank: number;
  odor: boolean;
};

type Limits = {
  phMin: number;
  phMax: number;
  tds: number;
  turbidity: number;
  iron: number;
  manganese: number;
};

const defaultLimits: Limits = {
  phMin: 6.5,
  phMax: 8.5,
  tds: 600,
  turbidity: 10,
  iron: 0.3,
  manganese: 0.1,
};

const navTargets: Record<NavItem, string> = {
  Dashboard: 'dashboard',
  'Live Data': 'live-data',
  'Water Quality History': 'history',
  'Adaptive Treatment': 'adaptive-treatment',
  Alerts: 'alerts',
  'Filter & Maintenance': 'maintenance',
  Reports: 'reports',
  Settings: 'settings',
  'About System': 'about-system',
};

const navItems: [NavItem, React.ElementType][] = [
  ['Dashboard', LayoutDashboard],
  ['Live Data', Activity],
  ['Water Quality History', History],
  ['Adaptive Treatment', SlidersHorizontal],
  ['Alerts', Bell],
  ['Filter & Maintenance', Wrench],
  ['Reports', FileText],
  ['Settings', Settings],
  ['About System', ShieldCheck],
];

const initialSensors: SensorState = {
  ph: 6.23,
  tds: 520,
  turbidity: 32.4,
  temperature: 27.6,
  conductivity: 950,
  iron: 1.82,
  manganese: 0.64,
  flow_rate: 12.4,
  pressure: 1.7,
  output_pressure: 1.2,
  battery: 86,
  solar_power: 125,
  tank: 74,
  odor: false,
};

const sensorMeta: Record<SensorKey, { label: string; unit: string; icon: React.ElementType; precision: number }> = {
  ph: { label: 'pH', unit: 'pH', icon: Droplets, precision: 2 },
  tds: { label: 'TDS', unit: 'ppm', icon: Waves, precision: 0 },
  turbidity: { label: 'Turbidity', unit: 'NTU', icon: Activity, precision: 1 },
  temperature: { label: 'Temperature', unit: 'deg C', icon: Thermometer, precision: 1 },
  conductivity: { label: 'Conductivity', unit: 'uS/cm', icon: Zap, precision: 0 },
  iron: { label: 'Iron (Fe)', unit: 'mg/L', icon: Cpu, precision: 2 },
  manganese: { label: 'Manganese (Mn)', unit: 'mg/L', icon: Cpu, precision: 2 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function classify(key: SensorKey, value: number, limits: Limits): { status: string; severity: Severity } {
  if (key === 'ph') {
    if (value < limits.phMin) return { status: 'LOW', severity: 'warning' };
    if (value > limits.phMax) return { status: 'HIGH', severity: 'warning' };
    return { status: 'NORMAL', severity: 'safe' };
  }
  if (key === 'temperature' || key === 'conductivity') return { status: 'MONITOR', severity: 'safe' };
  const limit = limits[key as keyof Limits] as number;
  if (value > limit * 1.6) return { status: 'HIGH', severity: 'critical' };
  if (value > limit) return { status: 'HIGH', severity: 'warning' };
  return { status: 'NORMAL', severity: 'safe' };
}

function buildTreatment(input: SensorState, limits: Limits) {
  const sediment = input.turbidity > limits.turbidity;
  const feMn = input.iron > limits.iron || input.manganese > limits.manganese;
  const ro = input.tds > limits.tds;
  const carbon = input.odor;
  return [
    { name: 'Sediment Filter', on: sediment, reason: sediment ? 'High turbidity detected' : 'Turbidity within configured limit' },
    { name: 'Fe/Mn Removal', on: feMn, reason: feMn ? 'High Fe/Mn detected' : 'Fe and Mn within configured limits' },
    { name: 'Activated Carbon/Biochar', on: carbon, reason: carbon ? 'Organic/odor treatment requested' : 'Organic/odor treatment not required' },
    { name: 'RO/NF', on: ro, reason: ro ? 'High TDS detected' : 'TDS within configured limit' },
    { name: 'UV Disinfection', on: true, reason: 'Final disinfection policy enabled' },
    { name: 'Output Verification', on: true, reason: 'Validates treated water before dispensing' },
  ];
}

function buildOutput(input: SensorState, limits: Limits): SensorState {
  const treatment = buildTreatment(input, limits);
  const on = (name: string) => treatment.find((item) => item.name === name)?.on;
  return {
    ...input,
    ph: clamp(input.ph + 0.28, 6.7, 7.6),
    tds: on('RO/NF') ? input.tds * 0.38 : input.tds * 0.96,
    turbidity: on('Sediment Filter') ? input.turbidity * 0.12 : input.turbidity * 0.9,
    iron: on('Fe/Mn Removal') ? input.iron * 0.08 : input.iron * 0.85,
    manganese: on('Fe/Mn Removal') ? input.manganese * 0.09 : input.manganese * 0.86,
  };
}

function outputPasses(output: SensorState, limits: Limits) {
  return (
    output.ph >= limits.phMin &&
    output.ph <= limits.phMax &&
    output.tds <= limits.tds &&
    output.turbidity <= limits.turbidity &&
    output.iron <= limits.iron &&
    output.manganese <= limits.manganese
  );
}

function safetyScore(input: SensorState, output: SensorState, limits: Limits) {
  const checks = [
    output.ph >= limits.phMin && output.ph <= limits.phMax ? 18 : 5,
    Math.max(0, 18 - (output.tds / limits.tds) * 8),
    Math.max(0, 18 - (output.turbidity / limits.turbidity) * 10),
    Math.max(0, 18 - (output.iron / limits.iron) * 10),
    Math.max(0, 18 - (output.manganese / limits.manganese) * 10),
    input.battery > 25 ? 10 : 4,
  ];
  return Math.round(clamp(checks.reduce((a, b) => a + b, 0), 0, 100));
}

function nextSensors(previous: SensorState, tick: number): SensorState {
  const highTds = tick % 36 > 18;
  const recovers = tick % 50 > 40;
  return {
    ...previous,
    ph: clamp(previous.ph + (Math.random() - 0.45) * 0.08, 6.05, 7.25),
    tds: clamp(previous.tds + (highTds ? 24 : -12) + (Math.random() - 0.5) * 20, 360, 870),
    turbidity: clamp(previous.turbidity + (recovers ? -4 : (Math.random() - 0.35) * 3), 5, 48),
    temperature: clamp(previous.temperature + (Math.random() - 0.5) * 0.35, 25.8, 30.5),
    conductivity: clamp(previous.conductivity + (Math.random() - 0.45) * 35, 630, 1260),
    iron: clamp(previous.iron + (recovers ? -0.12 : (Math.random() - 0.45) * 0.14), 0.16, 2.4),
    manganese: clamp(previous.manganese + (recovers ? -0.05 : (Math.random() - 0.45) * 0.06), 0.05, 0.82),
    flow_rate: clamp(previous.flow_rate + (Math.random() - 0.5) * 0.5, 9.5, 15.2),
    pressure: clamp(previous.pressure + (Math.random() - 0.5) * 0.08, 1.3, 2.1),
    output_pressure: clamp(previous.output_pressure + (Math.random() - 0.5) * 0.05, 0.9, 1.6),
    battery: clamp(previous.battery + (Math.random() - 0.55) * 0.3, 62, 96),
    solar_power: clamp(previous.solar_power + (Math.random() - 0.42) * 12, 50, 180),
    tank: clamp(previous.tank + (Math.random() - 0.48) * 0.8, 42, 91),
    odor: tick % 44 > 33,
  };
}

function statusClass(severity: Severity) {
  return severity === 'safe' ? 'text-emerald-300 bg-emerald-400/10 border-emerald-300/25' : severity === 'warning' ? 'text-amber-300 bg-amber-400/10 border-amber-300/25' : 'text-red-300 bg-red-400/10 border-red-300/25';
}

function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [sensors, setSensors] = useState(initialSensors);
  const [tick, setTick] = useState(0);
  const [range, setRange] = useState<Range>('1h');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [limits, setLimits] = useState(defaultLimits);
  const [section, setSection] = useState('Dashboard');
  const [now, setNow] = useState(new Date());

  const selectSection = (target: NavItem) => {
    setSection(target);
    window.requestAnimationFrame(() => {
      document.getElementById(navTargets[target])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
      if (demoMode) {
        setTick((t) => t + 1);
        setSensors((s) => nextSensors(s, tick));
      }
    }, 2500);
    return () => window.clearInterval(id);
  }, [demoMode, tick]);

  const output = useMemo(() => buildOutput(sensors, limits), [sensors, limits]);
  const treatment = useMemo(() => buildTreatment(sensors, limits), [sensors, limits]);
  const pass = outputPasses(output, limits);
  const score = safetyScore(sensors, output, limits);
  const alerts = buildAlerts(sensors, output, limits, pass).filter((alert) => !dismissed.includes(alert.id));
  const chartData = useMemo(() => makeChart(range, sensors), [range, sensors]);
  const passportPayload = JSON.stringify({
    unit: 'JAL-SHIELD-SIH-2026-01',
    source: 'DEMO LOCATION: Borewell / Mining-Affected Water',
    input: pickQuality(sensors),
    output: pickQuality(output),
    treatment: treatment.filter((t) => t.on).map((t) => t.name),
    verification: pass ? 'PASS' : 'FAIL',
    timestamp: now.toISOString(),
  });

  return (
    <div className="min-h-screen bg-[#050b12] text-slate-100">
      <Sidebar collapsed={collapsed} current={section as NavItem} onSelect={selectSection} />
      <main className={`${collapsed ? 'lg:pl-24' : 'lg:pl-72'} transition-all duration-300`}>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} score={score} pass={pass} now={now} demoMode={demoMode} setDemoMode={setDemoMode} current={section as NavItem} onSelect={selectSection} />
        <div className="mx-auto max-w-[1800px] space-y-5 px-4 pb-8 pt-4 sm:px-6">
          <section id="dashboard" className="scroll-mt-28 grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_1.75fr_1fr]">
            <SafetyIndicator pass={pass} score={score} sensors={sensors} limits={limits} />
            <div id="adaptive-treatment" className="scroll-mt-28">
              <AdaptiveTreatment treatment={treatment} pass={pass} />
            </div>
            <SystemOverview sensors={sensors} />
          </section>

          <section className="grid grid-cols-1 gap-4 2xl:grid-cols-[1.25fr_1fr]">
            <div className="space-y-4">
              <div id="live-data" className="scroll-mt-28">
                <Panel title="Live Water Quality" badge="DEMO SENSOR DATA">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(Object.keys(sensorMeta) as SensorKey[]).map((key) => (
                    <SensorCard key={key} id={key} value={sensors[key]} limits={limits} time={now} />
                  ))}
                </div>
                </Panel>
              </div>
              <div id="history" className="scroll-mt-28">
                <TrendChart data={chartData} range={range} setRange={setRange} />
              </div>
            </div>
            <div className="space-y-4">
              <DecisionEngine sensors={sensors} limits={limits} treatment={treatment} />
              <OutputVerification output={output} limits={limits} pass={pass} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div id="maintenance" className="scroll-mt-28">
              <Maintenance sensors={sensors} treatment={treatment} />
            </div>
            <div id="alerts" className="scroll-mt-28">
              <Alerts alerts={alerts} dismiss={(id) => setDismissed((items) => [...items, id])} />
            </div>
            <WaterPassport payload={passportPayload} now={now} pass={pass} />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
            <Prediction sensors={sensors} />
            <div id="settings" className="scroll-mt-28">
              <SettingsPanel limits={limits} setLimits={setLimits} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <div id="reports" className="scroll-mt-28">
              <Reports sensors={sensors} output={output} treatment={treatment} alerts={alerts} pass={pass} />
            </div>
            <LocationAndGuide limits={limits} />
          </section>
          <section id="about-system" className="scroll-mt-28">
            <AboutSystem />
          </section>
        </div>
      </main>
    </div>
  );
}

function Sidebar({ collapsed, current, onSelect }: { collapsed: boolean; current: NavItem; onSelect: (v: NavItem) => void }) {
  return (
    <aside className={`${collapsed ? 'lg:w-24' : 'lg:w-72'} fixed inset-y-0 left-0 z-30 hidden border-r border-cyan-200/10 bg-[#07111d]/95 p-4 backdrop-blur-xl transition-all lg:block`}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-400/10"><ShieldCheck className="text-cyan-300" /></div>
        {!collapsed && <div><h1 className="text-lg font-bold">JAL-SHIELD</h1><p className="text-xs text-cyan-200/70">SIH 2026 Prototype</p></div>}
      </div>
      <nav className="mt-8 space-y-1">
        {navItems.map(([item, Icon]) => (
          <button key={item} onClick={() => onSelect(item)} title={item} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${current === item ? 'bg-cyan-400/12 text-cyan-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Icon size={18} /> {!collapsed && <span>{item}</span>}
          </button>
        ))}
      </nav>
      {!collapsed && <div className="absolute bottom-4 left-4 right-4 space-y-3 rounded-lg border border-cyan-200/10 bg-white/[0.03] p-4 text-xs text-slate-300">
        <StatusLine label="System Mode" value="AUTO" color="cyan" />
        <StatusLine label="System Status" value="System Running Normally" color="green" />
        <StatusLine label="Connectivity" value="Online" color="green" />
      </div>}
    </aside>
  );
}

function Header({ collapsed, setCollapsed, score, pass, now, demoMode, setDemoMode, current, onSelect }: { collapsed: boolean; setCollapsed: (v: boolean) => void; score: number; pass: boolean; now: Date; demoMode: boolean; setDemoMode: (v: boolean) => void; current: NavItem; onSelect: (v: NavItem) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-cyan-200/10 bg-[#050b12]/82 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button className="rounded-lg border border-cyan-200/15 p-2 text-cyan-200" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar"><Menu size={20} /></button>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold sm:text-2xl">JAL-SHIELD</h2>
            <p className="text-xs text-slate-400 sm:text-sm">Smart Water Purification & Quality Monitoring System</p>
            <p className="hidden text-xs text-cyan-200/80 sm:block">Real-time Monitoring • Adaptive Purification • Safe Water</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge tone={pass ? 'green' : 'red'}>Water Status: {pass ? 'SAFE' : 'UNSAFE'}</Badge>
          <Badge tone={score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'}>Safety Score: {score}/100</Badge>
          <Badge tone="cyan"><Wifi size={14} /> System Online</Badge>
          <Badge tone="cyan"><MapPin size={14} /> DEMO LOCATION</Badge>
          <button onClick={() => setDemoMode(!demoMode)} className={`rounded-lg border px-3 py-2 font-semibold ${demoMode ? 'border-cyan-300/30 bg-cyan-400/12 text-cyan-200' : 'border-slate-500/30 bg-slate-800 text-slate-300'}`}>{demoMode ? 'DEMO MODE' : 'LIVE HARDWARE'}</button>
          <span className="text-slate-400">{now.toLocaleTimeString()}</span>
        </div>
      </div>
      <nav className="mx-auto mt-3 flex max-w-[1800px] gap-2 overflow-x-auto pb-1 lg:hidden">
        {navItems.map(([item, Icon]) => (
          <button key={item} onClick={() => onSelect(item)} className={`flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${current === item ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-100' : 'border-white/10 text-slate-400'}`}>
            <Icon size={15} />
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}

function Panel({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-cyan-200/12 bg-panel p-4 shadow-glow backdrop-blur-xl"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-base font-bold tracking-wide">{title}</h3>{badge && <Badge tone="cyan">{badge}</Badge>}</div>{children}</div>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'green' | 'amber' | 'red' | 'cyan' }) {
  const cls = tone === 'green' ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200' : tone === 'amber' ? 'border-amber-300/25 bg-amber-400/10 text-amber-200' : tone === 'red' ? 'border-red-300/25 bg-red-400/10 text-red-200' : 'border-cyan-300/25 bg-cyan-400/10 text-cyan-200';
  return <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-semibold ${cls}`}>{children}</span>;
}

function SensorCard({ id, value, limits, time }: { id: SensorKey; value: number; limits: Limits; time: Date }) {
  const meta = sensorMeta[id];
  const Icon = meta.icon;
  const status = classify(id, value, limits);
  return <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
    <div className="flex items-center justify-between"><Icon className="text-cyan-300" size={22} /><span className={`rounded-md border px-2 py-1 text-[11px] font-bold ${statusClass(status.severity)}`}>{status.status}</span></div>
    <div className="mt-4"><p className="text-sm text-slate-400">{meta.label}</p><p className="text-3xl font-bold">{value.toFixed(meta.precision)} <span className="text-sm font-medium text-slate-400">{meta.unit}</span></p></div>
    <div className="mt-3 flex justify-between text-xs text-slate-500"><span>Trend +{(Math.random() * 2.4).toFixed(1)}%</span><span>{time.toLocaleTimeString()}</span></div>
  </div>;
}

function AdaptiveTreatment({ treatment, pass }: { treatment: ReturnType<typeof buildTreatment>; pass: boolean }) {
  return <Panel title="Adaptive Treatment Status" badge="SELECT ONLY REQUIRED PATH">
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {treatment.map((stage, index) => <div key={stage.name} className={`relative rounded-lg border p-4 ${stage.on ? 'border-cyan-300/35 bg-cyan-400/10' : 'border-white/10 bg-white/[0.025]'}`}>
        <div className="flex items-start justify-between gap-2"><h4 className="font-bold">{stage.name}</h4><Badge tone={stage.on ? 'green' : 'amber'}>{stage.on ? 'ON' : 'OFF'}</Badge></div>
        <p className="mt-3 min-h-10 text-sm text-slate-300">{stage.reason}</p>
        <p className="mt-3 text-xs text-slate-500">Flow direction {index < treatment.length - 1 ? 'to next module' : pass ? 'to dispensing' : 'to recirculation'}</p>
        {index < treatment.length - 1 && <ChevronRight className="absolute -right-3 top-1/2 hidden rounded-full bg-[#07111d] text-cyan-300 md:block" size={24} />}
      </div>)}
    </div>
  </Panel>;
}

function SafetyIndicator({ pass, score, sensors, limits }: { pass: boolean; score: number; sensors: SensorState; limits: Limits }) {
  const contamination = [
    sensors.turbidity > limits.turbidity && 'Turbidity',
    sensors.iron > limits.iron && 'Iron',
    sensors.manganese > limits.manganese && 'Manganese',
    sensors.tds > limits.tds && 'TDS',
  ].filter(Boolean).join(', ') || 'None above configured limits';
  return <Panel title="Water Safety"><div className="flex items-center gap-4"><div className={`grid h-20 w-20 place-items-center rounded-full border ${pass ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-red-300/40 bg-red-400/10'}`}>{pass ? <CheckCircle2 className="text-emerald-300" size={42} /> : <XCircle className="text-red-300" size={42} />}</div><div><p className="text-sm text-slate-400">Output verification</p><h3 className="text-2xl font-bold">{pass ? 'WATER SAFE FOR DISPENSING' : 'WATER NOT SAFE'}</h3><p className="mt-1 text-sm text-slate-300">Score {score}/100</p></div></div><div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-xs uppercase text-slate-500">Detected contamination</p><p className="mt-1 font-semibold text-amber-200">{contamination}</p></div></Panel>;
}

function TrendChart({ data, range, setRange }: { data: any[]; range: Range; setRange: (r: Range) => void }) {
  return <Panel title="Real-Time Trend Graph" badge="DEMO SENSOR DATA"><div className="mb-3 flex flex-wrap gap-2">{(['1h', '6h', '24h', '7d'] as Range[]).map((r) => <button key={r} onClick={() => setRange(r)} className={`rounded-md border px-3 py-1.5 text-xs font-bold ${range === r ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-100' : 'border-white/10 text-slate-400'}`}>Last {r}</button>)}</div><div className="h-72"><ResponsiveContainer><LineChart data={data}><CartesianGrid stroke="rgba(148,163,184,.12)" /><XAxis dataKey="label" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} /><Tooltip contentStyle={{ background: '#07111d', border: '1px solid rgba(125,211,252,.2)', borderRadius: 8 }} /><Line dataKey="ph" stroke="#22d3ee" dot={false} /><Line dataKey="tds" stroke="#38bdf8" dot={false} /><Line dataKey="turbidity" stroke="#f59e0b" dot={false} /><Line dataKey="temperature" stroke="#a78bfa" dot={false} /><Line dataKey="iron" stroke="#fb7185" dot={false} /><Line dataKey="manganese" stroke="#f97316" dot={false} /></LineChart></ResponsiveContainer></div></Panel>;
}

function DecisionEngine({ sensors, limits, treatment }: { sensors: SensorState; limits: Limits; treatment: ReturnType<typeof buildTreatment> }) {
  return <Panel title="Adaptive Decision Engine" badge="AUTO MODE"><div className="grid grid-cols-4 gap-2 text-center text-xs text-slate-300"><Step label="Sensor Data" /><Step label="Classification" /><Step label="Treatment Selection" /><Step label="Actuator Control" /></div><div className="mt-4 space-y-2">{treatment.slice(0, 4).map((t) => <div key={t.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm"><span>{t.reason}</span><span className={t.on ? 'text-emerald-300' : 'text-slate-500'}>{t.on ? `${t.name} activated` : `${t.name} bypassed`}</span></div>)}</div><p className="mt-4 text-xs text-slate-500">Logic assists treatment selection; final safety depends on configured validated thresholds and output verification.</p></Panel>;
}

function OutputVerification({ output, limits, pass }: { output: SensorState; limits: Limits; pass: boolean }) {
  const keys: SensorKey[] = ['ph', 'tds', 'turbidity', 'iron', 'manganese', 'temperature'];
  return <Panel title="Output Water Quality"><div className="space-y-2">{keys.map((key) => { const ok = classify(key, output[key], limits).severity !== 'critical' && (key === 'temperature' || classify(key, output[key], limits).severity === 'safe'); return <div key={key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"><span>{sensorMeta[key].label}: {output[key].toFixed(sensorMeta[key].precision)} {sensorMeta[key].unit}</span><Badge tone={ok ? 'green' : 'red'}>{ok ? 'PASS' : 'FAIL'}</Badge></div>; })}</div><div className={`mt-4 rounded-lg border p-4 text-center ${pass ? 'border-emerald-300/30 bg-emerald-400/10' : 'border-red-300/30 bg-red-400/10'}`}><h4 className="text-xl font-bold">{pass ? 'WATER SAFE FOR DISPENSING' : 'OUTPUT VERIFICATION FAILED'}</h4><p className="mt-1 text-sm">{pass ? 'Dispensing enabled' : 'DISPENSING BLOCKED • RECIRCULATION ACTIVATED'}</p>{!pass && <div className="mx-auto mt-3 h-2 max-w-sm overflow-hidden rounded-full bg-red-950"><div className="recirc h-full w-1/2 rounded-full bg-red-300" /></div>}</div></Panel>;
}

function Maintenance({ sensors, treatment }: { sensors: SensorState; treatment: ReturnType<typeof buildTreatment> }) {
  const volume = sensors.flow_rate * 420;
  const cards = [
    ['Sediment Filter', 72 - volume / 10000, '0.42 bar', treatment[0].on],
    ['Fe/Mn Media', 65 - volume / 12000, '0.31 bar', treatment[1].on],
    ['Activated Carbon/Biochar', 58 - volume / 14000, '0.24 bar', treatment[2].on],
    ['RO Membrane', 35 - volume / 18000, '0.68 bar', treatment[3].on],
    ['UV Lamp', 81 - volume / 30000, 'Nominal', true],
  ] as const;
  return <Panel title="Filter & Maintenance"><div className="space-y-3">{cards.map(([name, raw, pressure, active]) => <FilterLifeCard key={name} name={name} remaining={clamp(raw, 8, 99)} pressure={pressure} active={active} />)}</div><p className="mt-3 text-sm text-amber-200">Warning: RO membrane replacement soon</p></Panel>;
}

function FilterLifeCard({ name, remaining, pressure, active }: { name: string; remaining: number; pressure: string; active: boolean }) {
  const days = Math.max(2, Math.round(remaining / 3));
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><div className="flex items-center justify-between"><span className="font-semibold">{name}</span><span className={remaining < 40 ? 'text-amber-300' : 'text-emerald-300'}>{Math.round(remaining)}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-800"><div className={`h-full rounded-full ${remaining < 40 ? 'bg-amber-300' : 'bg-emerald-300'}`} style={{ width: `${remaining}%` }} /></div><p className="mt-2 text-xs text-slate-500">{days} days estimated • pressure drop {pressure} • {active ? 'Operating' : 'Standby'}</p></div>;
}

function Alerts({ alerts, dismiss }: { alerts: ReturnType<typeof buildAlerts>; dismiss: (id: string) => void }) {
  return <Panel title="Alerts & Notifications"><div className="space-y-2">{alerts.map((a) => <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><div className="flex items-start justify-between gap-2"><Badge tone={a.severity}>{a.severity.toUpperCase()}</Badge><button onClick={() => dismiss(a.id)} title="Dismiss"><X size={16} /></button></div><p className="mt-2 font-semibold">{a.message}</p><p className="text-xs text-slate-500">{a.time} • Sensor: {a.sensor} • Action: {a.action}</p></div>)}</div></Panel>;
}

function SystemOverview({ sensors }: { sensors: SensorState }) {
  const items = [['Flow Rate', `${sensors.flow_rate.toFixed(1)} L/min`, Gauge], ['Input Pressure', `${sensors.pressure.toFixed(1)} bar`, Gauge], ['Output Pressure', `${sensors.output_pressure.toFixed(1)} bar`, Gauge], ['Pump Status', 'ON', Power], ['Valve Status', 'Adaptive', SlidersHorizontal], ['Battery Level', `${Math.round(sensors.battery)}%`, BatteryCharging], ['Solar Power', `${Math.round(sensors.solar_power)} W`, Zap], ['Tank Level', `${Math.round(sensors.tank)}%`, Droplets], ['Internet', 'Online', Wifi]] as const;
  return <Panel title="System Overview"><div className="grid grid-cols-2 gap-2">{items.map(([label, value, Icon]) => <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><Icon size={18} className="text-cyan-300" /><p className="mt-2 text-xs text-slate-500">{label}</p><p className="font-bold">{value}</p></div>)}</div></Panel>;
}

function WaterPassport({ payload, now, pass }: { payload: string; now: Date; pass: boolean }) {
  return <Panel title="Water Passport"><div className="flex gap-4"><div className="rounded-lg bg-white p-2"><QRCodeSVG value={payload} size={118} /></div><div className="text-sm text-slate-300"><p className="font-bold text-white">Unit ID: JAL-SHIELD-SIH-2026-01</p><p>Source: DEMO LOCATION</p><p>Last measurement: {now.toLocaleString()}</p><p>Verification: {pass ? 'PASS' : 'FAIL'}</p><p>Filter status: RO service soon</p></div></div></Panel>;
}

function Prediction({ sensors }: { sensors: SensorState }) {
  const data = Array.from({ length: 12 }, (_, i) => ({ day: `D${i + 1}`, tds: sensors.tds + i * 8, turbidity: Math.max(3, sensors.turbidity - i * 1.3), iron: sensors.iron - i * 0.04, manganese: sensors.manganese - i * 0.015, ph: sensors.ph + i * 0.02 }));
  return <Panel title="AI Water Quality Prediction" badge="AI DEMO / SIMULATED PREDICTION"><div className="h-48"><ResponsiveContainer><AreaChart data={data}><CartesianGrid stroke="rgba(148,163,184,.12)" /><XAxis dataKey="day" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} /><Tooltip contentStyle={{ background: '#07111d', border: '1px solid rgba(125,211,252,.2)', borderRadius: 8 }} /><Area dataKey="tds" stroke="#38bdf8" fill="#38bdf822" /><Area dataKey="turbidity" stroke="#f59e0b" fill="#f59e0b22" /></AreaChart></ResponsiveContainer></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg border border-white/10 p-3">RO Membrane<br /><b>Estimated replacement: 12 days</b></div><div className="rounded-lg border border-white/10 p-3">Fe/Mn Media<br /><b>Estimated replacement: 19 days</b></div></div><p className="mt-3 text-xs text-slate-500">Prediction does not guarantee drinking-water safety.</p></Panel>;
}

function SettingsPanel({ limits, setLimits }: { limits: Limits; setLimits: (l: Limits) => void }) {
  return <Panel title="Settings"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{Object.entries(limits).map(([key, value]) => <label key={key} className="text-sm text-slate-300">{key}<input className="mt-1 w-full rounded-md border border-cyan-200/15 bg-slate-950 px-3 py-2 text-white" type="number" step="0.01" value={value} onChange={(e) => setLimits({ ...limits, [key]: Number(e.target.value) })} /></label>)}</div><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><button className="rounded-lg border border-white/10 px-3 py-2">Pump Settings</button><button className="rounded-lg border border-white/10 px-3 py-2">Valve Settings</button><button className="rounded-lg border border-white/10 px-3 py-2">Wi-Fi/API Config</button><button className="rounded-lg border border-white/10 px-3 py-2">Notifications</button></div><button onClick={() => setLimits(defaultLimits)} className="mt-3 rounded-lg border border-amber-300/30 px-3 py-2 text-amber-200">Reset to Default</button></Panel>;
}

function Reports({ sensors, output, treatment, alerts, pass }: { sensors: SensorState; output: SensorState; treatment: ReturnType<typeof buildTreatment>; alerts: ReturnType<typeof buildAlerts>; pass: boolean }) {
  const report = { date: new Date().toISOString(), source: 'DEMO LOCATION', input: pickQuality(sensors), treatment: treatment.filter((t) => t.on).map((t) => t.name), output: pickQuality(output), result: pass ? 'PASS' : 'FAIL', alerts: alerts.length, system: 'Online' };
  const download = (name: string, type: string) => {
    const blob = new Blob([type === 'csv' ? Object.entries(pickQuality(output)).map(([k, v]) => `${k},${v}`).join('\n') : JSON.stringify(report, null, 2)], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
  };
  return <Panel title="Report Generation"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><ActionButton icon={FileText} label="Generate Water Quality Report" onClick={() => download('jal-shield-report.json', 'json')} /><ActionButton icon={FileDown} label="Download Sensor Data" onClick={() => download('sensor-data.json', 'json')} /><ActionButton icon={FileDown} label="Export CSV" onClick={() => download('sensor-data.csv', 'csv')} /><ActionButton icon={QrCode} label="Generate PDF Report" onClick={() => download('jal-shield-pdf-payload.json', 'json')} /></div></Panel>;
}

function LocationAndGuide({ limits }: { limits: Limits }) {
  return <Panel title="Water Source & Safety Guide"><div className="grid gap-4 md:grid-cols-2"><div className="rounded-lg border border-cyan-200/12 bg-cyan-400/5 p-4"><MapPin className="text-cyan-300" /><h4 className="mt-3 font-bold">Water Source</h4><p className="text-sm text-slate-300">Source Type: Borewell / Mining-Affected Water</p><p className="text-sm text-slate-300">Location: Demo Location</p><div className="mt-4 grid h-36 place-items-center rounded-lg border border-dashed border-cyan-300/25 text-cyan-200">DEMO LOCATION MAP</div></div><div className="space-y-2 text-sm">{[['pH', `${limits.phMin}-${limits.phMax}`], ['TDS', `<= ${limits.tds} ppm`], ['Turbidity', `<= ${limits.turbidity} NTU`], ['Iron', `<= ${limits.iron} mg/L`], ['Manganese', `<= ${limits.manganese} mg/L`]].map(([k, v]) => <div key={k} className="flex justify-between rounded-lg border border-white/10 p-3"><span>{k}</span><span>{v}</span></div>)}<p className="text-xs text-slate-500">Configured limits - verify against applicable BIS/WHO/local requirements before deployment.</p></div></div></Panel>;
}

function AboutSystem() {
  return <Panel title="About System" badge="SIH 2026 HARDWARE PROTOTYPE"><div className="grid gap-4 lg:grid-cols-3"><div className="rounded-lg border border-white/10 bg-white/[0.03] p-4"><ShieldCheck className="text-cyan-300" /><h4 className="mt-3 font-bold">JAL-SHIELD</h4><p className="mt-2 text-sm text-slate-300">Adaptive mining-aware smart water purification and quality monitoring system for live prototype demonstration.</p></div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-4"><RefreshCcw className="text-emerald-300" /><h4 className="mt-3 font-bold">Prototype Flow</h4><p className="mt-2 text-sm text-slate-300">Raw water to sensors, classification, selected treatment, output verification, dispensing or recirculation.</p></div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-4"><AlertTriangle className="text-amber-300" /><h4 className="mt-3 font-bold">Deployment Note</h4><p className="mt-2 text-sm text-slate-300">Demo thresholds and simulated predictions must be validated against applicable BIS, WHO, and local requirements before real drinking-water use.</p></div></div></Panel>;
}

function Step({ label }: { label: string }) {
  return <div className="rounded-lg border border-cyan-200/12 bg-cyan-400/5 p-2"><Bot className="mx-auto mb-1 text-cyan-300" size={18} />{label}</div>;
}

function StatusLine({ label, value, color }: { label: string; value: string; color: 'green' | 'cyan' }) {
  return <div><p className="text-slate-500">{label}</p><p className={color === 'green' ? 'text-emerald-300' : 'text-cyan-300'}>● {value}</p></div>;
}

function ActionButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/18"><Icon size={18} />{label}</button>;
}

function buildAlerts(input: SensorState, output: SensorState, limits: Limits, pass: boolean) {
  const time = new Date().toLocaleTimeString();
  const alerts = [];
  if (input.tds > limits.tds) alerts.push({ id: 'tds', severity: 'red' as const, message: 'High TDS detected', time, sensor: 'TDS', action: 'Route through RO/NF' });
  if (input.iron > limits.iron) alerts.push({ id: 'iron', severity: 'amber' as const, message: 'High Iron level detected', time, sensor: 'Iron (Fe)', action: 'Activate Fe/Mn removal' });
  if (input.turbidity > limits.turbidity) alerts.push({ id: 'turbidity', severity: 'amber' as const, message: 'Turbidity above configured limit', time, sensor: 'Turbidity', action: 'Activate sediment filter' });
  if (!pass) alerts.push({ id: 'output', severity: 'red' as const, message: 'Output verification failed', time, sensor: 'Output sensors', action: 'Block dispensing and recirculate' });
  alerts.push({ id: 'normal', severity: 'green' as const, message: outputPasses(output, limits) ? 'System operating normally' : 'Treatment loop active', time, sensor: 'Controller', action: 'Continue monitoring' });
  alerts.push({ id: 'filter', severity: 'amber' as const, message: 'Filter life low', time, sensor: 'RO membrane', action: 'Schedule replacement soon' });
  return alerts;
}

function makeChart(range: Range, current: SensorState) {
  const count = range === '1h' ? 18 : range === '6h' ? 24 : range === '24h' ? 32 : 40;
  return Array.from({ length: count }, (_, i) => ({
    label: `${i + 1}`,
    ph: Number((current.ph + Math.sin(i / 3) * 0.35).toFixed(2)),
    tds: Math.round(current.tds + Math.sin(i / 4) * 80),
    turbidity: Number(Math.max(2, current.turbidity + Math.cos(i / 5) * 12).toFixed(1)),
    temperature: Number((current.temperature + Math.sin(i / 6) * 1.2).toFixed(1)),
    iron: Number(Math.max(0.05, current.iron + Math.sin(i / 4) * 0.4).toFixed(2)),
    manganese: Number(Math.max(0.02, current.manganese + Math.cos(i / 4) * 0.13).toFixed(2)),
  }));
}

function pickQuality(s: SensorState) {
  return { ph: s.ph, tds: s.tds, turbidity: s.turbidity, temperature: s.temperature, iron: s.iron, manganese: s.manganese };
}

createRoot(document.getElementById('root')!).render(<Shell />);
