import React, { useState, useEffect } from 'react';
import { translations, TranslationSet } from '../translations.ts';
import { SparePart, RepairStatus } from '../types.ts';
import SuryapetLandmarkNav from './SuryapetLandmarkNav.tsx';
import { 
  Wrench, ShieldCheck, DollarSign, Zap, Phone, 
  MapPin, Clock, ArrowRight, Search, FileText, CheckCircle2, 
  Battery, LifeBuoy, Sliders, ShieldAlert, Award
} from 'lucide-react';

const PART_IMAGES: Record<string, string> = {
  'p1': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80', // Swaraj Primary Outer Air Filter
  'p2': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80', // Mahindra 575 DI Heavy-Duty Clutch Plate
  'p3': 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80', // Tractor Engine Head Gasket (Universal)
  'p4': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80', // Bosch Fuel Filter Element
  'p5': 'https://images.unsplash.com/photo-1610471930007-aa90229c90b7?auto=format&fit=crop&w=400&q=80', // Heavy-Duty Clutch Release Bearing
  'p6': 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&w=400&q=80', // Tractor Brake Shoe Set (Left + Right)
};

const CATEGORY_IMAGES: Record<string, string> = {
  'Filters': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
  'Clutch parts': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
  'Brake parts': 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&w=400&q=80',
  'Tractor engine parts': 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80',
  'Battery parts': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80',
  'Gear parts': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
  'Automobile spare parts': 'https://images.unsplash.com/photo-1620987278429-ab178d6eb547?auto=format&fit=crop&w=400&q=80',
  'Vehicle parts': 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80',
};

const DEFAULT_PART_IMAGE = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80';

const getExactProductImage = (part: SparePart): string => {
  if (part.image) return part.image;
  const nameLower = part.name.toLowerCase();
  
  if (nameLower.includes('air filter')) {
    return 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80';
  }
  if (nameLower.includes('clutch plate')) {
    return 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80';
  }
  if (nameLower.includes('gasket')) {
    return 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80';
  }
  if (nameLower.includes('fuel filter')) {
    return 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80';
  }
  if (nameLower.includes('bearing')) {
    return 'https://images.unsplash.com/photo-1610471930007-aa90229c90b7?auto=format&fit=crop&w=400&q=80';
  }
  if (nameLower.includes('brake shoe') || nameLower.includes('brake')) {
    return 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&w=400&q=80';
  }
  if (nameLower.includes('battery') || nameLower.includes('exide')) {
    return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80';
  }
  if (nameLower.includes('oil') || nameLower.includes('lubricant')) {
    return 'https://images.unsplash.com/photo-1620987278429-ab178d6eb547?auto=format&fit=crop&w=400&q=80';
  }
  return PART_IMAGES[part.id] || CATEGORY_IMAGES[part.category] || DEFAULT_PART_IMAGE;
};

interface PublicPagesProps {
  lang: 'en' | 'te';
  t: TranslationSet;
  onBookSuccess: () => void;
  onSelectService: (serviceName: string) => void;
}

export default function PublicPages({ lang, t, onBookSuccess, onSelectService }: PublicPagesProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'services' | 'parts' | 'contact' | 'track'>('home');
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Booking Form Fields
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingTractor, setBookingTractor] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [bookingIssue, setBookingIssue] = useState('');
  const [bookingServiceType, setBookingServiceType] = useState('Routine Servicing');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  // Repair Tracking Search Status
  const [trackPhoneOrId, setTrackPhoneOrId] = useState('');
  const [trackingResults, setTrackingResults] = useState<any[]>([]);
  const [trackSearched, setTrackSearched] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    setPartsLoading(true);
    try {
      const res = await fetch('/api/spare-parts');
      if (res.ok) {
        const data = await res.json();
        setSpareParts(data);
      }
    } catch (e) {
      console.error(e);
    }
    setPartsLoading(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingIssue) {
      alert('Please fill out Name, Phone and Issue fields.');
      return;
    }
    setBookingSubmitting(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: bookingName,
          customerPhone: bookingPhone,
          tractorModel: bookingTractor,
          tractorNumber: bookingNumber,
          issueDescription: bookingIssue,
          serviceType: bookingServiceType
        })
      });

      if (res.ok) {
        const booked = await res.json();
        setBookingSuccessMsg(`${t.bookingSuccess} (Booking ID: ${booked.id})`);
        setBookingName('');
        setBookingPhone('');
        setBookingTractor('');
        setBookingNumber('');
        setBookingIssue('');
        onBookSuccess();
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
    }
    setBookingSubmitting(false);
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackPhoneOrId) return;
    setTrackLoading(true);
    setTrackSearched(true);
    try {
      const res = await fetch('/api/repairs');
      if (res.ok) {
        const data = await res.json();
        const cleanedQuery = trackPhoneOrId.trim().toLowerCase();
        const filtered = data.filter((r: any) => 
          r.id.toLowerCase() === cleanedQuery || 
          r.customerPhone.includes(cleanedQuery) ||
          r.customerName.toLowerCase().includes(cleanedQuery)
        );
        setTrackingResults(filtered);
      }
    } catch (err) {
      console.error(err);
    }
    setTrackLoading(false);
  };

  const categories = React.useMemo(() => {
    const base = ['All', 'Tractor engine parts', 'Filters', 'Brake parts', 'Battery parts', 'Clutch parts', 'Gear parts', 'Automobile spare parts', 'Vehicle parts'];
    const dynamic = Array.from(new Set(spareParts.map(p => p.category).filter(Boolean)));
    const merged = ['All', ...Array.from(new Set([...base.filter(c => c !== 'All'), ...dynamic]))];
    return merged;
  }, [spareParts]);

  const filteredParts = spareParts.filter(part => {
    const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
    const matchesText = part.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      part.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
      part.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesText;
  });

  return (
    <div className="flex-1">
      {/* Dynamic Tab Navigation for Landing Page */}
      <div className="bg-charcoal-900 sticky top-0 z-40 border-t border-b border-charcoal-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto py-2 gap-2 no-scrollbar">
            <button 
              id="public-tab-home"
              onClick={() => setActiveTab('home')} 
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'home' ? 'bg-brand-green-700 text-white' : 'text-slate-300 hover:text-white hover:bg-charcoal-800'}`}
            >
              {t.homeTab}
            </button>
            <button 
              id="public-tab-services"
              onClick={() => setActiveTab('services')} 
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'services' ? 'bg-brand-green-700 text-white' : 'text-slate-300 hover:text-white hover:bg-charcoal-800'}`}
            >
              {t.servicesTab}
            </button>
            <button 
              id="public-tab-parts"
              onClick={() => setActiveTab('parts')} 
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'parts' ? 'bg-brand-green-700 text-white' : 'text-slate-300 hover:text-white hover:bg-charcoal-800'}`}
            >
              {t.sparePartsTab}
            </button>
            <button 
              id="public-tab-track"
              onClick={() => setActiveTab('track')} 
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap relative ${activeTab === 'track' ? 'bg-amber-500 text-charcoal-950' : 'text-amber-400 hover:bg-charcoal-800'}`}
            >
              🚜 Track My Tractor
            </button>
            <button 
              id="public-tab-about"
              onClick={() => setActiveTab('about')} 
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'about' ? 'bg-brand-green-700 text-white' : 'text-slate-300 hover:text-white hover:bg-charcoal-800'}`}
            >
              {t.aboutTab}
            </button>
            <button 
              id="public-tab-contact"
              onClick={() => setActiveTab('contact')} 
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'contact' ? 'bg-brand-green-700 text-white' : 'text-slate-300 hover:text-white hover:bg-charcoal-800'}`}
            >
              {t.contactTab}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'home' && (
        <>
          {/* Hero Banner Section */}
          <div className="relative bg-charcoal-950 text-white overflow-hidden py-16 sm:py-24">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green-950/90 to-charcoal-950 z-10" />
            
            {/* Ambient background decoration */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-brand-green-700/20 rounded-full blur-3xl" />
            <div className="absolute right-10 bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
            
            <div className="max-w-7xl mx-auto px-4 relative z-20 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-brand-green-800/60 border border-brand-green-500/30 px-3 py-1.5 rounded-full text-brand-green-100 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  {t.tagline}
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight text-white">
                  {lang === 'en' ? (
                    <>
                      Trusted Tractor Repair & <br />
                      <span className="text-amber-400">Genuine Spare Parts</span> Shop
                    </>
                  ) : (
                    <>
                      నమ్మకమైన ట్రాక్టర్ రిపేర్ & <br />
                      <span className="text-amber-400">ఒరిజినల్ స్పేర్ పార్ట్స్</span> నిలయం
                    </>
                  )}
                </h1>
                
                <p className="text-slate-300 text-base max-w-xl">
                  {t.heroSubtitle}. {t.aboutDesc1}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => {
                      const element = document.getElementById('booking-form-section');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setActiveTab('services');
                      }
                    }}
                    className="bg-brand-green-600 hover:bg-brand-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-brand-green-700/20 hover:shadow-brand-green-750/30 transition-all flex items-center gap-2"
                  >
                    <Wrench className="w-5 h-5" />
                    {t.bookServiceBtn}
                  </button>

                  <a 
                    href="tel:+919866409550" 
                    className="border border-slate-500 hover:bg-slate-800 text-slate-100 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
                  >
                    <Phone className="w-5 h-5 text-amber-500" />
                    +91 9866409550
                  </a>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-4">
                  <div className="flex items-center gap-1.5 border-r border-slate-700 pr-4">
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-500" /> Authorized spares
                  </div>
                  <div className="flex items-center gap-1.5 border-r border-slate-700 pr-4">
                    <Zap className="w-4.5 h-4.5 text-amber-500" /> Quick diagnosis
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-amber-500" /> Live online tracking
                  </div>
                </div>
              </div>

              {/* Dynamic Graphic UI showcasing Workshop Stats & Speciality */}
              <div className="flex-1 w-full max-w-lg">
                <div className="bg-charcoal-900 border border-slate-700/60 p-6 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur">
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Wrench className="w-48 h-48 text-white" />
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-green-600"></div>
                      <span className="font-mono text-xs text-slate-300">SRI REDDY WORKSHOP STATUS</span>
                    </div>
                    <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-emerald-400 font-mono">LIVE OK</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white mb-1">{t.ownerLabel}: {t.ownerName}</h3>
                      <p className="text-slate-400 text-xs mb-3">{t.specializationLabel}: {t.specializationVal}</p>
                    </div>

                    <div className="bg-charcoal-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-green-600/20 text-brand-green-500 rounded-md">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Total Serviced Tractors</p>
                          <p className="font-bold text-slate-100 font-display">1,850+ Farmers served</p>
                        </div>
                      </div>
                      <Award className="w-6 h-6 text-amber-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                        <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Diagnostic Accuracy</p>
                        <p className="text-xl font-black text-amber-400">100%</p>
                      </div>
                      <div className="bg-brand-green-500/10 p-3 rounded-lg border border-brand-green-500/20">
                        <p className="text-[10px] text-brand-green-400 uppercase tracking-wider font-semibold">Availability</p>
                        <p className="text-xl font-black text-brand-green-400">24/7 Support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Problem - Solution Statement (Solving the 10 Workshop Problems) */}
          <div className="bg-charcoal-100 py-12 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-display text-slate-800">Solving Real-World Tractor Workshop Problems</h2>
                <p className="text-slate-500 text-sm mt-1">Smart business mechanics that keep South Indian farmers driving without errors.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex gap-4">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-500 shrink-0 h-10 w-10 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">No Manual Errors & Delayed Bills</h4>
                    <p className="text-xs text-slate-500 mt-1">Our system uses digital multi-item calculation schemas with QR codes so farmers get error-free printed bills.</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0 h-10 w-10 flex items-center justify-center">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Zero Stock Shortages</h4>
                    <p className="text-xs text-slate-500 mt-1">Low-stock alerts detect when air/fuel filters or clutch plates fall below min targets, ensuring instant ordering.</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex gap-4">
                  <div className="p-2 bg-brand-green-50 rounded-lg text-brand-green-600 shrink-0 h-10 w-10 flex items-center justify-center">
                    <Battery className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Real-time Tractor Tracking</h4>
                    <p className="text-xs text-slate-500 mt-1">Know exactly when your tractor enters Under Repair, requires spare parts, or is fully ready for delivered setup.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section preview */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-800">{t.servicesPageTitle}</h2>
                  <p className="text-slate-500 text-sm mt-1">{t.servicesPageSub}</p>
                </div>
                <button 
                  onClick={() => setActiveTab('services')}
                  className="mt-4 md:mt-0 text-brand-green-700 hover:text-brand-green-800 font-bold text-xs flex items-center gap-1 group"
                >
                  View All Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: t.engineRepair, icon: <Wrench />, desc: 'Complex multi-cylinder tractor engine diagnostics, piston replacement, valve setting, head gasket overhaul.', cost: '₹5,000 - ₹18,000' },
                  { title: t.maintenance, icon: <CheckCircle2 />, desc: 'Timely maintenance checks, radiator cleaning, clutch optimization, brakes tension tuning, and fuel line bleed.', cost: '₹1,500 - ₹3,000' },
                  { title: t.partsReplacement, icon: <LifeBuoy />, desc: 'Prompt replacement of planetary gears, heavy rear axles, cooling fan assemblies, and hydraulic lift components.', cost: '₹1,000 - ₹6,000' },
                  { title: t.oilChange, icon: <Sliders />, desc: 'Changing transmission gear oils, motor lubricants, coolant flush, and dynamic lubrication of link-arms pins.', cost: '₹2,500 - ₹4,500' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-brand-green-500 hover:bg-brand-green-50/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="p-2 bg-brand-green-700 text-white rounded-lg w-10 h-10 flex items-center justify-center mb-4 shadow">
                        {item.icon}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-2">{item.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-400 font-semibold">EST. LABOUR COST</span>
                      <span className="text-brand-green-700 font-bold text-xs">{item.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial Section */}
          <div className="bg-slate-50 py-16 border-t border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center max-w-xl mx-auto mb-10">
                <h2 className="text-2xl font-bold font-display text-slate-800">What Our Farmers Say</h2>
                <p className="text-slate-500 text-xs mt-1">Authentic words of trust from village farm operators who depend on Sri Reddy Workshop.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 relative">
                  <p className="text-slate-600 text-xs italic leading-relaxed">
                    "Kuncharapu Nagi Reddy garu provides extremely honest services. My Swaraj 744 tractor was experiencing severe hydraulic lifting weakness during harvesting. Mechanic Sunil fixed the valve block in 3 hours. Billing was 100% digital with no hidden fees!"
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-green-700 text-white flex items-center justify-center text-xs font-bold">PR</div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">B. Prasad Reddy</h5>
                      <p className="text-[10px] text-slate-400">Suryapet Taluka Owner</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 relative">
                  <p className="text-slate-600 text-xs italic leading-relaxed">
                    "I travel all the way from Allagadda because Sri Reddy Workshop keeps original spare parts in stock. Previously, other shops caused delays of 4 days waiting for filters. Here, we get parts immediately. Highly responsive mechanics!"
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-green-700 text-white flex items-center justify-center text-xs font-bold">MV</div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">M. Venkat Ramana</h5>
                      <p className="text-[10px] text-slate-400">Paddy Cultivator</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 relative">
                  <p className="text-slate-600 text-xs italic leading-relaxed">
                    "The live online tractor tracking system is an absolute lifesaver. Sitting at home, I was able to search my phone number on this portal and saw exactly when the clutch was completed. Saved my travel time!"
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-green-700 text-white flex items-center justify-center text-xs font-bold">KR</div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">K. Ramudu</h5>
                      <p className="text-[10px] text-slate-400">Banaganapalli Farmer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Booking Section */}
          <div id="booking-form-section" className="py-16 bg-white scroll-mt-20">
            <div className="max-w-3xl mx-auto px-4">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold font-display text-slate-800">{t.bookingFormTitle}</h2>
                  <p className="text-slate-500 text-xs mt-1">{t.bookingFormSub}</p>
                </div>

                {bookingSuccessMsg && (
                  <div className="bg-brand-green-100 border border-brand-green-500 text-brand-green-800 p-4 rounded-xl text-xs font-semibold mb-6 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-green-600 shrink-0" />
                    <div>{bookingSuccessMsg}</div>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">{t.customerName} <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Ramesh Reddy" 
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:border-brand-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">{t.phoneNumber} <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        placeholder="10 digit phone number" 
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value.replace(/\D/g,''))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:border-brand-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">{t.tractorModel} (Brand/Model)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Swaraj 744 / Mahindra 575" 
                        value={bookingTractor}
                        onChange={(e) => setBookingTractor(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:border-brand-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">{t.tractorNumber}</label>
                      <input 
                        type="text" 
                        placeholder="e.g. AP-21-TJ-XXXX" 
                        value={bookingNumber}
                        onChange={(e) => setBookingNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:border-brand-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1">{t.serviceType}</label>
                    <select 
                      value={bookingServiceType}
                      onChange={(e) => setBookingServiceType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-semibold focus:border-brand-green-500 focus:outline-none"
                    >
                      <option value="Routine Servicing">{t.maintenance}</option>
                      <option value="Engine Repair & Overhauling">{t.engineRepair}</option>
                      <option value="Clutch & Gearbox Diagnostics">{t.diagnostics}</option>
                      <option value="Spare Parts Replacement">{t.partsReplacement}</option>
                      <option value="Emergency Breakdown Repair">{t.emergencyRepair}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1">{t.issueDesc} <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g. Gear shifting grid sound or heavy black smoke coming out." 
                      value={bookingIssue}
                      onChange={(e) => setBookingIssue(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:border-brand-green-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={bookingSubmitting}
                    className="w-full bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {bookingSubmitting ? 'Booking Request Submitting...' : t.submitBooking}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TRACKING PAGE VIEW */}
      {activeTab === 'track' && (
        <div className="py-12 bg-slate-50 flex-1">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200">
              <div className="text-center mb-8">
                <span className="bg-amber-100 text-amber-800 border-amber-350 border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Farmer Self-Service</span>
                <h2 className="text-2xl font-bold font-display text-slate-800 mt-2">🚜 Live Tractor Repair Status Tracker</h2>
                <p className="text-slate-500 text-xs mt-1">Get immediate real-time workflow information representing your tractor diagnostics without calling the shop.</p>
              </div>

              <form onSubmit={handleTrackSearch} className="flex gap-2 max-w-lg mx-auto mb-10">
                <input 
                  type="text" 
                  required
                  placeholder="Enter Registered Customer Name or Phone (10 digits)..." 
                  value={trackPhoneOrId}
                  onChange={(e) => setTrackPhoneOrId(e.target.value)}
                  className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 text-slate-800 text-xs font-medium focus:border-brand-green-500 focus:outline-none focus:bg-white"
                />
                <button 
                  type="submit"
                  className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </form>

              {trackLoading && (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-brand-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-500 text-xs">Querying workshop database...</p>
                </div>
              )}

              {!trackLoading && trackSearched && trackingResults.length === 0 && (
                <div className="text-center bg-amber-50 rounded-xl p-8 border border-amber-200 max-w-md mx-auto">
                  <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mx-auto mb-3 font-bold text-lg">!</span>
                  <h4 className="font-bold text-slate-700 text-sm">No Active Repairs Located</h4>
                  <p className="text-xs text-slate-500 mt-1">We couldn't locate any records for "{trackPhoneOrId}". Please cross-check the phone number or name.</p>
                </div>
              )}

              {!trackLoading && trackingResults.length > 0 && (
                <div className="space-y-8">
                  <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-green-700" /> Active Workshop Repairs Located ({trackingResults.length})
                  </h3>

                  {trackingResults.map((repair) => (
                    <div key={repair.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-2 bg-slate-100 p-3 rounded-lg border">
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">TRACTOR & OWNER</p>
                          <h4 className="font-bold text-slate-800 text-xs">{repair.tractorModel} ({repair.tractorNumber})</h4>
                          <p className="text-slate-500 text-xs">Farmer: {repair.customerName} - {repair.customerPhone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">REPAIR STATE</p>
                          <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                            repair.status === RepairStatus.PENDING ? 'bg-slate-200 text-slate-700' :
                            repair.status === RepairStatus.ACCEPTED ? 'bg-sky-100 text-sky-800' :
                            repair.status === RepairStatus.UNDER_REPAIR ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            repair.status === RepairStatus.SPARE_PARTS_REQUIRED ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            repair.status === RepairStatus.COMPLETED ? 'bg-brand-green-100 text-brand-green-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {repair.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400 font-bold text-[10px]">TRACTOR ISSUE SPECIFIED</p>
                          <p className="text-slate-700 font-medium mt-0.5">{repair.issueDescription}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold text-[10px]">ASSIGNED WORKSHOP MECHANIC</p>
                          <p className="text-slate-700 font-semibold mt-0.5">{repair.assignedMechanicName || 'Coordinator triage phase'}</p>
                        </div>
                        {repair.estimatedCost > 0 && (
                          <div className="col-span-1 sm:col-span-2 bg-amber-50 border border-amber-200 p-3 rounded flex justify-between items-center">
                            <span className="font-bold text-slate-600 text-[11px]">PRE-ESTIMATED PARTS + LABOUR WORK</span>
                            <span className="text-brand-green-700 font-mono font-bold">₹{repair.estimatedCost}</span>
                          </div>
                        )}
                      </div>

                      {/* Visual Progress Stepper timeline */}
                      <div className="pt-4 border-t">
                        <p className="text-slate-400 font-bold text-[10px] mb-4 uppercase tracking-wider">LIVE WORKFLOW TIMELINE</p>
                        <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-slate-250">
                          {repair.timeline && repair.timeline.map((event: any, i: number) => (
                            <div key={i} className="flex gap-4 relative items-start">
                              <span className="w-7.5 h-7.5 rounded-full bg-slate-200 text-slate-800 border-2 border-white shadow flex items-center justify-center text-xs shrink-0 font-bold relative z-10">
                                {i + 1}
                              </span>
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-850 text-xs">{event.status}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(event.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-xs">{event.notes}</p>
                                <span className="text-[9px] text-slate-400 block mt-1">Logged by: {event.updatedBy}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SERVICES PAGE VIEW */}
      {activeTab === 'services' && (
        <div className="py-12 bg-slate-50 flex-1">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center md:max-w-xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold font-display text-slate-800">{t.servicesPageTitle}</h2>
              <p className="text-slate-500 text-xs mt-1">{t.servicesPageSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: t.engineRepair, desc: 'Complete breakdown diesel engine diagnosis, cylinder liners honing, piston-ring calibrating, fuel injector replacement, and multi-valve timings tuning.', cost: '₹5,000 - ₹18,000', label: 'Engine' },
                { title: t.maintenance, desc: 'General periodic fluid flushing, oil filtration check, battery cleaning, lubrication of planetary shafts, and heavy-duty radiator descaling.', cost: '₹1,500 - ₹3,000', label: 'Servicing' },
                { title: t.diagnostics, desc: 'Hydraulic gear fluid testing, pressure safety valve resets, gearbox alignment, differential lock repair, and PTO power check.', cost: '₹2,500 - ₹5,000', label: 'Gearbox' },
                { title: t.partsReplacement, desc: 'Removal and replacements of damaged axles, gear shafts, engine belts, link pin assemblies, and steering gearboxes.', cost: '₹1,000 - ₹6,000', label: 'Spares' },
                { title: t.oilChange, desc: 'Replacement of old engine lubrication oil with multi-grade 15W-40, high viscosity gear transmission oil, and fuel separation filter elements.', cost: '₹2,500 - ₹4,500', label: 'Fluids' },
                { title: t.emergencyRepair, desc: 'On-demand mechanical diagnostic consulting for breakdown tractors blocked in farm yards or towing paths.', cost: '₹2,000 - ₹4,000', label: 'Emergency' },
                { title: t.clutchBrakeWork, desc: 'Brake shoe linings replacement, brake calliper tension adjusting, hydraulic master cylinders overhaul, clutch disc plate alignment.', cost: '₹3,000 - ₹7,000', label: 'Controls' },
                { title: t.electricalDiagnostics, desc: 'Starter motor repair, dynamo charging unit test, vehicle harness wiring, light controls setup, and heavy tractor battery installations.', cost: '₹800 - ₹2,500', label: 'Electrical' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="p-6">
                    <span className="bg-brand-green-100 text-brand-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{item.label}</span>
                    <h3 className="font-bold font-display text-slate-800 text-base mt-2 mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="p-6 bg-slate-50 border-t flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">EST. SERVICE CHARGES</span>
                      <span className="text-brand-green-800 font-bold text-xs">{item.cost}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setBookingIssue(`Interested in: ${item.title}. Describe details here.`);
                        setBookingServiceType(item.title);
                        const element = document.getElementById('booking-form-section');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          setActiveTab('home');
                          setTimeout(() => {
                            document.getElementById('booking-form-section')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SPARE PARTS PUBLIC PAGE */}
      {activeTab === 'parts' && (
        <div className="py-12 bg-slate-50 flex-1">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center md:max-w-xl mx-auto mb-8 animate-fade-in">
              <span className="bg-brand-green-100 text-brand-green-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Automobile Shop Stock Shelf</span>
              <h2 className="text-3xl font-extrabold font-display text-slate-800 mt-2">{t.sparePartsInventory}</h2>
              <p className="text-slate-500 text-xs mt-1">{t.sparePartsSub}</p>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white shadow-xs rounded-xl p-4 border border-slate-205 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.searchPartsPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-slate-800 text-xs font-semibold focus:border-brand-green-500 focus:outline-none"
                />
              </div>

              <div className="flex overflow-x-auto gap-2 w-full sm:w-auto no-scrollbar py-1">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-brand-green-700 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat === 'All' ? t.allCategories : cat}
                  </button>
                ))}
              </div>
            </div>

            {partsLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-brand-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-slate-550 text-xs">Querying automobile inventories...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredParts.map((part) => (
                    <div key={part.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      {/* Stylized product display with high contrast layout & dynamic image */}
                      <div className="relative h-44 w-full bg-slate-950 overflow-hidden flex flex-col justify-end group">
                        {/* Top styling stripe */}
                        <div className="absolute top-0 inset-x-0 h-1.5 caution-stripes opacity-90 z-20"></div>
                        
                        {/* Real dynamic image from Unsplash with smooth hover zoom */}
                        <img 
                          src={getExactProductImage(part)} 
                          alt={part.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Gradient tint overlay for high readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />

                        {/* Text and code badging */}
                        <div className="p-3.5 relative z-20 flex justify-between items-end w-full">
                          <div className="text-left">
                            <span className="inline-block bg-amber-400 text-slate-950 font-mono text-[9px] font-black tracking-wider px-2 py-0.5 rounded shadow-sm">
                              {part.code}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-200 font-mono bg-slate-900/85 px-2 py-0.5 rounded font-extrabold border border-slate-700/50 shadow-xs">
                              {part.brand}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-2">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          {part.category}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs leading-relaxed min-h-[32px]">{part.name}</h4>
                        
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-150 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold leading-3">RETAIL RATE</span>
                            <span className="font-bold text-slate-850 font-mono">₹{part.price}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-bold leading-3">LIVE SHELF</span>
                            {part.stock <= 0 ? (
                              <span className="text-rose-600 font-bold text-xs uppercase">Out Of Stock</span>
                            ) : part.stock <= part.minStockAlert ? (
                              <span className="text-amber-500 font-bold text-xs uppercase">{part.stock} Left (Low)</span>
                            ) : (
                              <span className="text-brand-green-600 font-bold text-xs uppercase">{part.stock} in Stock</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t">
                        <a 
                          href={`https://wa.me/919866409550?text=Hello%20Sri%20Reddy%20Motors%2C%20I%20want%20to%20buy%20the%20spare%20part%3A%20${encodeURIComponent(part.name)}%20(Code%3A%20${part.code})`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-bold text-center block transition-all shadow-xs"
                        >
                          💬 Order via WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredParts.length === 0 && (
                  <div className="text-center py-16 bg-white border rounded-xl">
                    <p className="text-slate-500 text-xs">No spare parts matched your searches. Contact Nagi Reddy directly for emergency custom ordering.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ABOUT PAGE VIEW */}
      {activeTab === 'about' && (
        <div className="py-12 bg-slate-50 flex-1">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
              <div className="relative h-48 bg-brand-green-950 p-8 flex items-end">
                <div className="absolute inset-x-0 bottom-0 h-1 caution-stripes"></div>
                <div>
                  <h2 className="text-3xl font-extrabold font-display text-white">{t.aboutTitle}</h2>
                  <p className="text-amber-400 text-xs font-semibold">{t.tagline}</p>
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-8 text-xs leading-relaxed text-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-slate-700 font-medium text-sm">
                      {t.aboutDesc1}
                    </p>
                    <p>
                      {t.aboutDesc2}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-250 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">OFFICIAL RECOGNITIONS</h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4.5 h-4.5 text-brand-green-700 shrink-0 mt-0.5" />
                          <span>Owner: <strong className="text-slate-800">Kuncharapu Nagi Reddy</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4.5 h-4.5 text-brand-green-700 shrink-0 mt-0.5" />
                          <span>Industry Specialization: <strong className="text-slate-800">Mechanical, Hydraulic & Diesel Systems</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4.5 h-4.5 text-brand-green-700 shrink-0 mt-0.5" />
                          <span>Operational Roots: <strong className="text-slate-800">Suryapet & adjoining agricultural tracts</strong></span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">SHOP WORKSHOP RESOLVE</p>
                      <p className="font-semibold text-slate-800 italic">"Farmers produce crop grains for our dinner. Our mission is to repair their physical machinery without delay or billing errors so they never lose critical diesel power."</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t font-display">
                  <h3 className="text-center text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Core Workshop Competencies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border rounded-lg flex items-start gap-3">
                      <span className="w-6.5 h-6.5 rounded bg-brand-green-700 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs mb-1">Hydraulic Precision Tuning</h5>
                        <p className="text-[11px] text-slate-500">Correcting linkage dropouts, high-load oil foaming, and lifting power weakness.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border rounded-lg flex items-start gap-3">
                      <span className="w-6.5 h-6.5 rounded bg-brand-green-700 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs mb-1">Full Cylinder Compression Rebuilds</h5>
                        <p className="text-[11px] text-slate-500">Overhauling piston-head sleeves, diesel injection calibration, and filter assemblies tuning.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT PAGE VIEW */}
      {activeTab === 'contact' && (
        <div className="py-12 bg-slate-50 flex-1">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12">
              
              <div className="md:col-span-12 p-6 bg-brand-green-950 text-white border-b relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <MapPin className="w-48 h-48" />
                </div>
                <h2 className="text-2xl font-extrabold font-display">{t.contactTitle}</h2>
                <p className="text-slate-300 text-xs mt-1">{t.contactSubtitle}</p>
              </div>

              {/* Left Column: Direct Address coordinates */}
              <div className="md:col-span-5 p-6 sm:p-10 space-y-6 border-r border-slate-200 text-xs">
                {/* Visual Showcase Banner */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl overflow-hidden border border-slate-250 shadow-sm relative group h-28">
                      <img 
                        src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80" 
                        alt="Tractor Service" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                      <span className="absolute bottom-1.5 left-2 bg-slate-950/80 text-amber-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded">
                        TRACTOR BAY
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-250 shadow-sm relative group h-28">
                      <img 
                        src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80" 
                        alt="Heavy Machinery Spare Parts" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                      <span className="absolute bottom-1.5 left-2 bg-slate-950/80 text-amber-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded">
                        WORKSHOP TOOLS
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-medium font-mono">
                    {lang === 'en' ? '📸 Sri Reddy Premium Service Center & Spare Stock' : '📸 శ్రీ రెడ్డి సర్వీస్ సెంటర్ & ల్యాండ్‌మార్క్ వివరాలు'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">OFFICIAL BUSINESS PLACE</h4>
                  <div className="flex gap-2 text-slate-600">
                    <MapPin className="w-5 h-5 text-brand-green-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Sri Reddy Tractor Mechanic Works</p>
                      <p className="mt-1 leading-relaxed">Khammam Cross Roads, Suryapet, Telangana - 508213</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">{t.workingHoursLabel}</h4>
                  <div className="flex gap-2 text-slate-600 font-medium">
                    <Clock className="w-5 h-5 text-brand-green-700 shrink-0" />
                    <div>
                      <p>08:00 AM - 08:30 PM</p>
                      <p className="text-amber-600 font-bold mt-0.5">Sunday Closed for general work</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">DIRECT COMMUNICATION DIRECTORY</h4>
                  <div className="space-y-2.5">
                    <a 
                      href="tel:+919866409550" 
                      className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border transition-all"
                    >
                      <Phone className="w-5 h-5 text-brand-green-700 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">WORKSHOP COORDINATOR / OWNER</p>
                        <p className="text-slate-800 font-bold text-xs">+91 9866409550</p>
                      </div>
                    </a>

                    <a 
                      href="https://wa.me/919866409550?text=Hi%20Kuncharapu%20Nagi%2520Reddy%20garu%2C%20I%20want%2520to%20know%20your%20mechanic%20availability%20today." 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border transition-all"
                    >
                      <span className="text-xl">💬</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">EMERGENCY WHATSAPP HELPLINE</p>
                        <p className="text-emerald-700 font-bold text-xs">+91 9866409550 (Status Support)</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: High Quality Interactive Landmark & Routing Explorer */}
              <div className="md:col-span-7 bg-slate-50 p-6 flex flex-col gap-4">
                <SuryapetLandmarkNav lang={lang} />
                <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-2 text-xs">
                  <h5 className="font-bold text-slate-800">🛠️ WORKSHOP DETAILS & ACCESSIBILITY</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Our workshop features <strong>8 dedicated truck/tractor garage bays</strong>, heavy ceiling power-hoists, hydraulic block test-pumps, and extensive tool cabinets to fix Swaraj, Sonalika and Mahindra machinery within hours.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
