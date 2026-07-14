import React, { useState } from 'react';
import { MapPin, Navigation, Info, ArrowRight, Check, Compass, Phone, AlertTriangle, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Landmark {
  id: string;
  nameEn: string;
  nameTe: string;
  distanceKm: number;
  tractorMins: number;
  fuelEstimateLiters: number;
  x: number; // SVG X coordinate
  y: number; // SVG Y coordinate
  descEn: string;
  descTe: string;
  stepsEn: string[];
  stepsTe: string[];
  type: 'highway' | 'town' | 'market';
}

const LANDMARKS: Landmark[] = [
  {
    id: 'bypass_circle',
    nameEn: 'Suryapet Bypass Circle (NH65)',
    nameTe: 'సూర్యాపేట బైపాస్ సర్కిల్ (NH-65)',
    distanceKm: 2.2,
    tractorMins: 10,
    fuelEstimateLiters: 0.8,
    x: 120,
    y: 100,
    descEn: 'Crucial entry point connecting Hyderabad & Vijayawada highway with Suryapet bypass.',
    descTe: 'హైదరాబాద్ & విజయవాడ జాతీయ రహదారిని సూర్యాపేట బైపాస్ తో అనుసంధానించే ప్రధాన కూడలి.',
    stepsEn: [
      'Enter the NH65 Bypass heading East (towards Vijayawada).',
      'Drive straight for 1.5 km past the Indian Oil fuel station.',
      'Slight left into the local service single-lane road near the flyover bridge.',
      'Sri Reddy Mechanical Works is instantly visible on the right near Khammam Cross Roads.'
    ],
    stepsTe: [
      'NH65 బైపాస్ ద్వారా తూర్పు దిశగా (విజయవాడ వైపు) ప్రయాణించండి.',
      'ఇండియన్ ఆయిల్ బంకు దాటిన తర్వాత 1.5 కి.మీ నేరుగా వెళ్ళండి.',
      'ఫ్లైఓవర్ బ్రిడ్జ్ సమీపంలో స్థానిక సర్వీస్ సింగిల్లేన్ లోకి ఎడమ వైపునకు తిరగండి.',
      'ఖమ్మం క్రాస్ రోడ్స్ చెక్‌పోస్ట్ వద్ద శ్రీ రెడ్డి మెకానిక్ వర్క్స్ కుడివైపున కనిపిస్తుంది.'
    ],
    type: 'highway'
  },
  {
    id: 'bus_stand',
    nameEn: 'Suryapet New Bus Stand',
    nameTe: 'సూర్యాపేట కొత్త బస్ స్టాండ్ (టౌన్)',
    distanceKm: 4.5,
    tractorMins: 18,
    fuelEstimateLiters: 1.5,
    x: 80,
    y: 240,
    descEn: 'The core transit hub at town center. Best route for tractors avoiding narrow residential lanes.',
    descTe: 'సూర్యాపేట పట్టణ కేంద్రంలోని నడిబొడ్డు బస్ టెర్మినల్. ఇరుకైన సందులను నివారించడానికి రైతులు వాడే అనుకూల మార్గం.',
    stepsEn: [
      'Head East on Town Main Road towards bypass.',
      'Turn right onto NH65 Bypass Road highway junction.',
      'Cross the bypass underpass bridge and keep on the left lane.',
      'Our repair station with 8 high bays is directly opposite the Khammam Road checkpost.'
    ],
    stepsTe: [
      'టౌన్ మెయిన్ రోడ్ నుండి తూర్పు వైపుగా బైపాస్ వైపు ప్రయాణించండి.',
      'NH65 బైపాస్ రోడ్డు జంక్షన్ వద్ద కుడి వైపుకు తిరగండి.',
      'బైపాస్ అండర్‌పాస్ బ్రిడ్జ్ దాటి ఎడమ లేన్ లోనే కొనసాగండి.',
      '8 వర్కింగ్ బేలతో కూడిన మా రిపేర్ స్టేషన్ ఖమ్మం రోడ్ చెక్‌పోస్ట్‌కు సరిగ్గా ఎదురుగా ఉంటుంది.'
    ],
    type: 'town'
  },
  {
    id: 'market_yard',
    nameEn: 'Suryapet Krishi Market Yard',
    nameTe: 'సూర్యాపేట వ్యవసాయ మార్కెట్ యార్డ్',
    distanceKm: 3.8,
    tractorMins: 15,
    fuelEstimateLiters: 1.2,
    x: 250,
    y: 50,
    descEn: 'Major hub where farmers unload grain. Quick connection back to our workshop for post-unload servicing.',
    descTe: 'రైతులు ధాన్యం అన్‌లోడ్ చేసే ప్రధాన సూర్యాపేట మార్కెట్. పంట లోడ్ దించిన వెంటనే సర్వీసింగ్ చేసుకోవడానికి అత్యంత దగ్గరి మార్గం.',
    stepsEn: [
      'Exit the Market Yard gate and turn right towards Sadla Cheruvu road.',
      'Merge onto Khammam parallel bypass link road directly past the railway side-corridor.',
      'Follow bypass road down for 2.8 km.',
      'Sri Reddy Spare Parts & Mechanic shop is on the left corner before the Khammam road turning.'
    ],
    stepsTe: [
      'మార్కెట్ యార్డ్ గేట్ నుండి బయటకు వచ్చి సడ్లా చెరువు రోడ్డు వైపు కుడి వైపునకు తిరగండి.',
      'రైల్వే సైడ్ కారిడార్ దాటి నేరుగా ఖమ్మం ప్యారలల్ బైపాస్ లింక్ రోడ్డులోకి ప్రవేశించండి.',
      'బైపాస్ రోడ్డులో 2.8 కి.మీ కిందకు ప్రయాణించండి.',
      'శ్రీ రెడ్డి స్పేర్ పార్ట్స్ & మెకానిక్ షాప్ ఖమ్మం రోడ్డు మలుపునకు ముందే ఎడమ మూలలో ఉంటుంది.'
    ],
    type: 'market'
  },
  {
    id: 'vijayawada_entrance',
    nameEn: 'Vijayawada Highway Entrance (NH65)',
    nameTe: 'విజయవాడ హైవే ఎంట్రన్స్ (NH-65 ఈస్ట్)',
    distanceKm: 5.2,
    tractorMins: 22,
    fuelEstimateLiters: 1.8,
    x: 420,
    y: 110,
    descEn: 'Entering Suryapet from Vijayawada / Kodad side, optimal path avoiding city traffic.',
    descTe: 'విజయవాడ / కోదాడ వైపు నుండి సూర్యాపేటలోకి ప్రవేశించే మార్గం, సిటీ ట్రాఫిక్ లేకుండా తేలికగా చేరుకోవచ్చు.',
    stepsEn: [
      'Drive westbound on state highway NH65 toward Suryapet town entrance.',
      'Proceed past the heavy agricultural check-post limits.',
      'Slight right into the Khammam Cross Roads approach loop road.',
      'Take immediate left at the corner - look for the Kuncharapu Nagi Reddy mechanical works banner.'
    ],
    stepsTe: [
      'NH65 హైవే ద్వారా పశ్చిమ దిశగా సూర్యాపేట టౌన్ ఎంట్రన్స్ వైపు ప్రయాణించండి.',
      'వ్యవసాయ భారీ వాహనాల చెక్-పోస్ట్ దాటి ముందుకు సాగండి.',
      'ఖమ్మం రోడ్డు క్రాస్ రోడ్స్ అప్రోచ్ లూప్ రోడ్డులోకి స్వల్పంగా కుడి వైపునకు తిరగండి.',
      'మూలలో వెంటనే ఎడమ వైపునకు తిరగండి - అక్కడ "కుంచరపు నాగి రెడ్డి మెకానికల్ వర్క్స్" బోర్డు ఉంటుంది.'
    ],
    type: 'highway'
  }
];

// Sri Reddy Shop location is fixed at:
const SHOP_NODE = { x: 340, y: 200, nameEn: 'Sri Reddy Workshop (Shop)', nameTe: 'శ్రీ రెడ్డి వర్క్‌షాప్ (షాప్)' };

interface SuryapetLandmarkNavProps {
  lang: 'en' | 'te';
}

export default function SuryapetLandmarkNav({ lang }: SuryapetLandmarkNavProps) {
  const [selectedId, setSelectedId] = useState<string>('bypass_circle');
  const [reportedMobile, setReportedMobile] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [trackerSimLive, setTrackerSimLive] = useState(false);
  const [activeVoiceBeacon, setActiveVoiceBeacon] = useState(false);

  const activeLandmark = LANDMARKS.find(l => l.id === selectedId) || LANDMARKS[0];

  const handleShareWhatsApp = () => {
    const textStr = lang === 'en' 
      ? `Sri Reddy Tractor Works Location! Start: ${activeLandmark.nameEn}. Distance: ${activeLandmark.distanceKm} km. Tractors drive approx ${activeLandmark.tractorMins} mins. Location: Khammam Cross Roads, Suryapet.`
      : `శ్రీ రెడ్డి ట్రాక్టర్ వర్క్స్ లొకేషన్ మార్గం! ప్రారంభం: ${activeLandmark.nameTe}. దూరం: ${activeLandmark.distanceKm} కి.మీ. సుమారు ${activeLandmark.tractorMins} నిమిషాల ప్రయాణం. చిరునామా: ఖమ్మం క్రాస్ రోడ్స్, సూర్యాపేట.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(textStr)}`, '_blank');
  };

  const handleReportBreakdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedMobile) return;
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportedMobile('');
    }, 4500);
  };

  // Sound effect generator placeholder for heavy farm machine audio cue (simulated custom tractor horn!)
  const handleSimulateHorn = () => {
    setActiveVoiceBeacon(true);
    setTimeout(() => setActiveVoiceBeacon(false), 800);
    // Beep sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sawtooth'; // Rough tractor horn-like sawtooth wave
      oscillator.frequency.setValueAtTime(260, audioCtx.currentTime); // Low horn
      oscillator.frequency.exponentialRampToValueAtTime(130, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (err) {
      console.log('Audio Context muted or blocked by browser standard permissions');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg" id="suryapet-navigation-system">
      
      {/* Header Band */}
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <span className="p-1 px-2.5 bg-brand-green-700 rounded-lg text-sm text-yellow-300 font-black animate-pulse">🚜 Live</span>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight font-display text-white">
              {lang === 'en' ? 'SURYAPET INTERACTIVE LANDMARK ROUTING' : 'సూర్యాపేట ఇంటరాక్టివ్ ల్యాండ్‌మార్క్ రూటింగ్'}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">
              {lang === 'en' ? 'CALCULATED FOR MASSIVE TRACTORS & HEAVY HARVESTERS' : 'భారీ ట్రాక్టర్లు & హార్వెస్టర్ల రూట్ మ్యాప్ విజువలైజర్'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTrackerSimLive(!trackerSimLive)}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all tracking-wider ${trackerSimLive ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            🛰️ {trackerSimLive ? (lang === 'en' ? 'TRACKING ON' : 'ట్రాకింగ్ ఆన్') : (lang === 'en' ? 'SIMULATE PATH' : 'సిమ్యులేట్ మార్గం')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Interactive SVG Map (Col Span: 7) */}
        <div className="lg:col-span-7 bg-slate-50 p-4 border-r border-slate-100 flex flex-col justify-between">
          <div className="text-[10.5px] text-slate-500 mb-2 flex items-center justify-between font-mono bg-white p-2 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1.5 font-bold">
              <Compass className="w-3.5 h-3.5 text-brand-green-600 animate-spin" />
              {lang === 'en' ? 'CLICK LANDMARKS TO INITIATE GPS TRACKING' : 'మార్గాన్ని చూసేందుకు గుర్తులపై క్లిక్ చేయండి'}
            </span>
            <span className="bg-slate-100 text-slate-700 font-black px-2 py-0.5 rounded text-[9px]">SURYAPET TR AREA</span>
          </div>

          {/* Map Vector Stage */}
          <div className="relative bg-emerald-50/50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-inner h-80">
            
            {/* Soft Farmland Backdrops */}
            <div className="absolute top-4 left-6 text-[32px] opacity-15 pointer-events-none select-none">🌾</div>
            <div className="absolute bottom-8 left-8 text-[32px] opacity-10 pointer-events-none select-none">🌾</div>
            <div className="absolute top-24 right-48 text-[28px] opacity-10 pointer-events-none select-none">🌾</div>
            <div className="absolute top-12 left-60 w-24 h-16 bg-brand-green-700/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-8 right-24 w-40 h-20 bg-brand-green-700/5 rounded-full blur-2xl pointer-events-none" />

            {/* Simulated Canal/River Reservoir (Saddalacheruvu) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path 
                d="M 180,0 Q 200,60 160,110 T 130,220 T 110,320" 
                fill="none" 
                stroke="#93c5fd" 
                strokeWidth="10" 
                strokeLinecap="round" 
              />
              <text x="145" y="280" fill="#1e3a8a" fontSize="8" className="font-mono tracking-widest font-bold rotate-90 opacity-60">SADDALA CHERUVU CANAL</text>
            </svg>

            {/* SVG Roads Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {/* NH65 Bypass Highway Line (Drawn in slate) */}
              <path 
                d="M 20,110 L 120,100 L 260,120 L 340,200 L 480,240" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="16" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Internal painted tarmac lane stripes */}
              <path 
                d="M 20,110 L 120,100 L 260,120 L 340,200 L 480,240" 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="2" 
                strokeDasharray="8 8"
                strokeLinecap="round" 
              />

              {/* Town Road coming to Cross Roads */}
              <path 
                d="M 80,240 L 220,180 L 340,200" 
                fill="none" 
                stroke="#94a3b8" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Town Road stripe */}
              <path 
                d="M 80,240 L 220,180 L 340,200" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
                strokeLinecap="round" 
              />

              {/* Market Link Canal Road */}
              <path 
                d="M 250,50 L 260,120" 
                fill="none" 
                stroke="#94a3b8" 
                strokeWidth="10" 
                strokeLinecap="round" 
              />

              {/* ACTIVE ROUTE HIGHLIGHT LINE */}
              <AnimatePresence>
                <motion.path 
                  key={selectedId}
                  d={
                    selectedId === 'bypass_circle' 
                      ? "M 120,100 L 260,120 L 340,200" 
                      : selectedId === 'bus_stand'
                      ? "M 80,240 L 220,180 L 340,200"
                      : selectedId === 'market_yard'
                      ? "M 250,50 L 260,120 L 340,200"
                      : "M 420,110 L 340,200" // Vijayawada Entrance to Shop directly
                  }
                  fill="none" 
                  stroke="#fbbf24" // Brighter amber highlighted active path
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ strokeDasharray: "10 5", strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              </AnimatePresence>
            </svg>

            {/* LANDMARK INTERACTIVE PINS */}
            {LANDMARKS.map((landmark) => {
              const isSelected = landmark.id === selectedId;
              return (
                <button
                  key={landmark.id}
                  onClick={() => setSelectedId(landmark.id)}
                  style={{ left: `${(landmark.x / 500) * 100}%`, top: `${(landmark.y / 320) * 100}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none group"
                >
                  <span className="absolute -inset-4 rounded-full bg-slate-900/0 hover:bg-slate-900/5 transition-all" />
                  
                  {/* Circular Radar Rings for Selected */}
                  {isSelected && (
                    <span className="absolute -inset-3 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
                  )}

                  <div className={`p-1.5 rounded-full border shadow transition-all ${
                    isSelected 
                      ? 'bg-amber-500 border-amber-600 text-slate-950 scale-125' 
                      : 'bg-white border-slate-300 text-slate-600 hover:scale-115 hover:bg-slate-100'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 fill-current" />
                  </div>

                  {/* Tiny Label Popover */}
                  <span className={`absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[8.5px] font-black tracking-tight px-1.5 py-0.5 rounded shadow-sm border border-slate-200/50 max-w-[130px] overflow-hidden truncate transition-all ${
                    isSelected 
                      ? 'bg-slate-900 text-white font-mono scale-105' 
                      : 'bg-white/90 text-slate-700 font-display group-hover:bg-slate-900 group-hover:text-white'
                  }`}>
                    {lang === 'en' ? landmark.nameEn.split('(')[0] : landmark.nameTe.split('(')[0]}
                  </span>
                </button>
              );
            })}

            {/* SRI REDDY MAIN WORKSHOP PIN (Destination) */}
            <div 
              style={{ left: `${(SHOP_NODE.x / 500) * 100}%`, top: `${(SHOP_NODE.y / 320) * 100}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
            >
              {/* Highlight background glow */}
              <div className="absolute -inset-5 bg-brand-green-600/30 rounded-full blur-lg animate-pulse" />

              {/* Audio beacon visual representation */}
              {activeVoiceBeacon && (
                <div className="absolute -inset-10 border-4 border-amber-400 rounded-full animate-ping z-0" />
              )}
              
              <div className="bg-brand-green-800 text-white p-2 rounded-xl shadow-xl border-2 border-white z-10 scale-110 flex items-center gap-1.5">
                <span className="text-sm font-semibold animate-bounce">🚜</span>
                <div className="text-[9px] font-display text-left">
                  <p className="font-extrabold text-amber-300 tracking-tight leading-3">SRI REDDY</p>
                  <p className="opacity-80 text-[7px] font-mono leading-3">KHAMMAM X RD</p>
                </div>
              </div>

              {/* Decorative Check Flags */}
              <span className="absolute -top-3 right-0 bg-yellow-400 block border border-slate-800 rounded px-1 text-[7px] font-bold text-slate-950 font-mono scale-90">
                DEST
              </span>
            </div>

            {/* ANIMATED SIMULATED TRAVELER TRACTOR OR DOT */}
            {trackerSimLive && (
              <motion.div
                style={{ zIndex: 25 }}
                className="absolute bg-slate-950 text-white p-1 rounded-full border border-yellow-400 shadow-md flex items-center justify-center text-xs"
                animate={{
                  x: selectedId === 'bypass_circle' 
                    ? [120, 260, 340] 
                    : selectedId === 'bus_stand'
                    ? [80, 220, 340]
                    : selectedId === 'market_yard'
                    ? [250, 260, 340]
                    : [420, 340],
                  y: selectedId === 'bypass_circle' 
                    ? [100, 120, 200] 
                    : selectedId === 'bus_stand'
                    ? [240, 180, 200]
                    : selectedId === 'market_yard'
                    ? [50, 120, 200]
                    : [110, 200],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🚜
              </motion.div>
            )}

            {/* Compass rose decoration */}
            <div className="absolute bottom-3 right-3 bg-white/90 border border-slate-200 p-1.5 rounded-lg flex items-center justify-center pointer-events-none select-none z-10">
              <Compass className="w-5 h-5 text-slate-400" />
              <div className="text-[7.5px] font-mono text-slate-500 font-bold ml-1 flex flex-col leading-2">
                <span>N ↑</span>
                <span>SURYAPET</span>
              </div>
            </div>
          </div>

          {/* Quick interactive utility box under the map */}
          <div className="mt-4 bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex gap-2.5 items-center">
              <span className="text-xl">📯</span>
              <div>
                <p className="font-bold text-amber-950">
                  {lang === 'en' ? 'Simulate Tractor Horn Beacon' : 'ట్రాక్టర్ హారన్ శబ్దాన్ని వినండి'}
                </p>
                <p className="text-[10px] text-amber-700 leading-3">
                  {lang === 'en' ? 'Click to sound horn and trace audio direction beacon.' : 'బిగ్గరగా హారన్ బటన్ నొక్కి దిశను ధృవీకరించుకోండి.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSimulateHorn}
              className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm text-[11px] whitespace-nowrap transition-all flex items-center gap-1"
            >
              <Disc className={`w-3.5 h-3.5 ${activeVoiceBeacon ? 'animate-spin' : ''}`} />
              {lang === 'en' ? 'SOUND HORN' : 'హారన్ ప్లే'}
            </button>
          </div>
        </div>

        {/* Right Nav-card (Col Span: 5) */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-5 bg-white">
          
          {/* Landmark details */}
          <div>
            <div className="flex gap-2 items-center mb-3">
              <span className="p-1 px-2.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-black font-mono">
                {lang === 'en' ? 'START NODE' : 'ప్రారంభ స్థానం'}
              </span>
              <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">GPS ROUTER</span>
            </div>

            {/* Landmark Switcher Buttons Tabs */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {LANDMARKS.map((landmark) => {
                const isSelected = landmark.id === selectedId;
                return (
                  <button
                    key={landmark.id}
                    onClick={() => { setSelectedId(landmark.id); }}
                    className={`p-2 rounded-xl text-left text-xs border transition-all ${
                      isSelected 
                        ? 'bg-brand-green-800 border-brand-green-900 text-white font-bold shadow-md shadow-brand-green-250' 
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <p className="truncate font-display text-[10.5px]">
                      {lang === 'en' ? landmark.nameEn.split('(')[0] : landmark.nameTe.split('(')[0]}
                    </p>
                    <p className={`text-[9px] ${isSelected ? 'text-amber-300' : 'text-slate-400'} font-mono`}>
                      {landmark.distanceKm} km | {landmark.tractorMins} mins
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs font-display">
                    {lang === 'en' ? activeLandmark.nameEn : activeLandmark.nameTe}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {lang === 'en' ? activeLandmark.descEn : activeLandmark.descTe}
                  </p>
                </div>
              </div>

              {/* Heavy Machinery Telemetry */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'DISTANCE' : 'దూరం'}</p>
                  <p className="text-xs font-mono font-black text-slate-800">{activeLandmark.distanceKm} km</p>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase font-sans">{lang === 'en' ? 'TRACTOR TIME' : 'ట్రాక్టర్ సమయం'}</p>
                  <p className="text-xs font-mono font-black text-brand-green-700">{activeLandmark.tractorMins} mins</p>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'DIESEL EST' : 'డీజిల్ అంచనా'}</p>
                  <p className="text-xs font-mono font-black text-amber-600">~{activeLandmark.fuelEstimateLiters} L</p>
                </div>
              </div>
            </div>
          </div>

          {/* Turn-by-turn list */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-700 text-[10.5px] uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-brand-green-700 animate-pulse" />
              {lang === 'en' ? 'TURN-BY-TURN TRACTOR TRACK GUIDELINES' : 'అక్షరాల వారీగా రోడ్డు దిశల వివరణ'}
            </h5>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-600 font-sans">
              {(lang === 'en' ? activeLandmark.stepsEn : activeLandmark.stepsTe).map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-slate-50/50 p-2 rounded border border-slate-100">
                  <span className="w-5 h-5 bg-slate-200 text-slate-800 text-[10px] font-mono font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>💬</span>
                {lang === 'en' ? 'WhatsApp Route info' : 'వాట్సాప్‌లో లొకేషన్ పంపు'}
              </button>

              <a
                href="tel:+919866409550"
                className="bg-slate-150 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Call Owner' : 'నాగి రెడ్డి గారికి కాల్'}
              </a>
            </div>

            {/* Simulated Road Breakdown Coordinates Alert Box */}
            <form onSubmit={handleReportBreakdown} className="bg-rose-50 border border-rose-100 p-3 rounded-xl space-y-2">
              <p className="text-[10px] text-rose-800 leading-relaxed font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce shrink-0" />
                {lang === 'en' ? 'TRACTOR BROKE DOWN ON THE WAY?' : 'మధ్యలోనే ట్రాక్టర్ ఆగిపోయిందా? సహాయం కోరండి'}
              </p>
              
              <div className="flex gap-1.5">
                <input
                  type="tel"
                  placeholder={lang === 'en' ? 'Enter Phone Number...' : 'మీ ఫోన్ నంబర్ రాయండి...'}
                  value={reportedMobile}
                  onChange={(e) => setReportedMobile(e.target.value)}
                  className="bg-white border text-xs px-2.5 py-1.5 rounded-lg flex-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-all"
                >
                  {lang === 'en' ? 'SEND RESCUE' : 'సహాయం పంపండి'}
                </button>
              </div>

              {reportSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[9.5px] font-mono text-emerald-800 font-bold bg-emerald-50 rounded p-1.5 border border-emerald-200 mt-1"
                >
                  {lang === 'en' 
                    ? '✓ SOS transmitted successfully! Shop-owner Kuncharapu Nagi Reddy has your mobile and will prepare on-field toolkit advice.'
                    : '✓ రెస్క్యూ అభ్యర్థన విజయవంతంగా చేరింది! యజమాని ఫోన్ ద్వారా వెంటనే మిమ్మల్ని సంప్రదించి అవసరమైన మెకానిక్‌ను పంపుతారు.'}
                </motion.div>
              )}
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
