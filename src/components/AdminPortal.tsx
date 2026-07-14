import React, { useState, useEffect } from 'react';
import { User, Customer, SparePart, RepairRequest, Invoice, Mechanic, SystemSettings, UserRole, RepairStatus } from '../types.ts';
import { translations, TranslationSet } from '../translations.ts';
import { 
  BarChart3, Users, Wrench, Package, Receipt, Milestone, 
  Settings, LogOut, Plus, Search, Check, AlertTriangle, 
  Trash2, Edit, Printer, TrendingUp, Sliders, PrinterCheck, 
  DollarSign, RefreshCw, Layers, Calendar, ChevronRight, UserCheck
} from 'lucide-react';

interface AdminPortalProps {
  user: User;
  onLogout: () => void;
  lang: 'en' | 'te';
}

export default function AdminPortal({ user, onLogout, lang }: AdminPortalProps) {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'customers' | 'repairs' | 'inventory' | 'billing' | 'mechanics' | 'reports' | 'settings'>('dashboard');
  
  // Loaded Data States
  const [dbStats, setDbStats] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Selector / Filter strings
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Customer Edit/Add Fields
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custTractor, setCustTractor] = useState('');
  const [custNumber, setCustNumber] = useState('');

  // Spare Part Edit/Add Fields
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [partName, setPartName] = useState('');
  const [partCategory, setPartCategory] = useState('Filters');
  const [customCategory, setCustomCategory] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partCode, setPartCode] = useState('');
  const [partPrice, setPartPrice] = useState('0');
  const [partStock, setPartStock] = useState('10');
  const [partSupplier, setPartSupplier] = useState('');
  const [partMinAlert, setPartMinAlert] = useState('5');
  const [partImage, setPartImage] = useState('');

  // Repair Request Manager Fields
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairRequest | null>(null);
  const [repCustId, setRepCustId] = useState('');
  const [repCustName, setRepCustName] = useState('');
  const [repCustPhone, setRepCustPhone] = useState('');
  const [repTractor, setRepTractor] = useState('');
  const [repNumber, setRepNumber] = useState('');
  const [repIssue, setRepIssue] = useState('');
  const [repMechanicId, setRepMechanicId] = useState('');
  const [repStatus, setRepStatus] = useState<RepairStatus>(RepairStatus.PENDING);
  const [repEstCost, setRepEstCost] = useState('0');
  const [repNotes, setRepNotes] = useState('');

  // Dynamic Invoicing Cart construction
  const [selectedCustomerIdForBill, setSelectedCustomerIdForBill] = useState('');
  const [associatedRepairId, setAssociatedRepairId] = useState('');
  const [billLabor, setBillLabor] = useState('1500');
  const [billDiscount, setBillDiscount] = useState('0');
  const [billGstPercent, setBillGstPercent] = useState('18');
  const [billingCart, setBillingCart] = useState<{ partId: string; partName: string; quantity: number; price: number }[]>([]);
  const [searchPartQueryForCart, setSearchPartQueryForCart] = useState('');
  const [billSuccessInvoice, setBillSuccessInvoice] = useState<Invoice | null>(null);

  // Settings Field Config
  const [shopNameField, setShopNameField] = useState('');
  const [ownerNameField, setOwnerNameField] = useState('');
  const [shopPhoneField, setShopPhoneField] = useState('');
  const [shopWhatsappField, setShopWhatsappField] = useState('');
  const [shopAddressField, setShopAddressField] = useState('');
  const [shopWorkingHoursField, setShopWorkingHoursField] = useState('');

  // Selected Detail Views
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);
  const [selectedInvoiceView, setSelectedInvoiceView] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [activeMenu]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Parallel loader endpoints
      const [resStats, resCust, resRep, resParts, resInv, resMech, resSet] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/repairs').then(r => r.json()),
        fetch('/api/spare-parts').then(r => r.json()),
        fetch('/api/invoices').then(r => r.json()),
        fetch('/api/mechanics').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      setDbStats(resStats);
      setCustomers(resCust);
      setRepairs(resRep);
      setSpareParts(resParts);
      setInvoices(resInv);
      setMechanics(resMech);
      setSettings(resSet);

      // Pre-fill fields for settings tab if loaded
      if (resSet) {
        setShopNameField(resSet.shopName);
        setOwnerNameField(resSet.ownerName);
        setShopPhoneField(resSet.phone);
        setShopWhatsappField(resSet.whatsapp);
        setShopAddressField(resSet.address);
        setShopWorkingHoursField(resSet.workingHours);
      }
    } catch (e) {
      console.error('Error fetching workshop details', e);
    }
    setLoading(false);
  };

  // 1. CUSTOMER PORTAL MANAGEMENT API LOGIC
  const handleOpenCustomerModal = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    if (customer) {
      setCustName(customer.name);
      setCustPhone(customer.phone);
      setCustAddress(customer.address);
      setCustTractor(customer.tractorModel);
      setCustNumber(customer.tractorNumber);
    } else {
      setCustName('');
      setCustPhone('');
      setCustAddress('');
      setCustTractor('');
      setCustNumber('');
    }
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) {
      alert('Please fill out Customer Name and Phone.');
      return;
    }
    const body = {
      name: custName,
      phone: custPhone,
      address: custAddress,
      tractorModel: custTractor,
      tractorNumber: custNumber
    };

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setCustomerModalOpen(false);
        fetchInitialData();
      } else {
        alert('Failed to save customer data.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this customer record?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedCustomerDetail?.id === id) {
          setSelectedCustomerDetail(null);
        }
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. SPARE PARTS STOCK MANAGEMENT API LOGIC
  const handleOpenPartModal = (part: SparePart | null = null) => {
    setEditingPart(part);
    if (part) {
      setPartName(part.name);
      const predefined = ['Filters', 'Brake parts', 'Battery parts', 'Clutch parts', 'Gear parts', 'Tractor engine parts', 'Automobile spare parts', 'Vehicle parts'];
      if (predefined.includes(part.category)) {
        setPartCategory(part.category);
        setCustomCategory('');
      } else {
        setPartCategory('custom_category_option');
        setCustomCategory(part.category);
      }
      setPartBrand(part.brand);
      setPartCode(part.code);
      setPartPrice(String(part.price));
      setPartStock(String(part.stock));
      setPartSupplier(part.supplier);
      setPartMinAlert(String(part.minStockAlert));
      setPartImage(part.image || '');
    } else {
      setPartName('');
      setPartCategory('Filters');
      setCustomCategory('');
      setPartBrand('');
      setPartCode('SP-' + Math.floor(100 + Math.random() * 900));
      setPartPrice('150');
      setPartStock('5');
      setPartSupplier('');
      setPartMinAlert('3');
      setPartImage('');
    }
    setPartModalOpen(true);
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partPrice || !partStock) {
      alert('Part name, price, and stock quantities are mandatory metrics.');
      return;
    }
    const finalCategory = partCategory === 'custom_category_option' ? customCategory.trim() : partCategory;
    if (!finalCategory) {
      alert('Please select or specify a category shelf.');
      return;
    }
    const body = {
      name: partName,
      category: finalCategory,
      brand: partBrand,
      code: partCode,
      price: Number(partPrice),
      stock: Number(partStock),
      supplier: partSupplier,
      minStockAlert: Number(partMinAlert),
      image: partImage
    };

    try {
      const url = editingPart ? `/api/spare-parts/${editingPart.id}` : '/api/spare-parts';
      const method = editingPart ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setPartModalOpen(false);
        fetchInitialData();
      } else {
        alert('Failed to update tractor spare parts stock.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!confirm('Delete this spare part from our inventory tracker?')) return;
    try {
      const res = await fetch(`/api/spare-parts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. REPAIR WORKSPACE MANAGEMENT API LOGIC
  const handleOpenRepairModal = (repair: RepairRequest | null = null) => {
    setEditingRepair(repair);
    if (repair) {
      setRepCustId(repair.customerId);
      setRepCustName(repair.customerName);
      setRepCustPhone(repair.customerPhone);
      setRepTractor(repair.tractorModel);
      setRepNumber(repair.tractorNumber);
      setRepIssue(repair.issueDescription);
      setRepMechanicId(repair.assignedMechanicId || '');
      setRepStatus(repair.status);
      setRepEstCost(String(repair.estimatedCost || '0'));
      setRepNotes(repair.notes || '');
    } else {
      setRepCustId('new');
      setRepCustName('');
      setRepCustPhone('');
      setRepTractor('');
      setRepNumber('');
      setRepIssue('');
      setRepMechanicId('');
      setRepStatus(RepairStatus.PENDING);
      setRepEstCost('2500');
      setRepNotes('');
    }
    setRepairModalOpen(true);
  };

  const handleSaveRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (repCustId === 'new' && (!repCustName || !repCustPhone)) {
      alert('For guest bookings, farmer name and phone coordinates must be mapped.');
      return;
    }
    if (!repIssue) {
      alert('Please specify the diagnostic complaint details.');
      return;
    }

    const body: any = {
      status: repStatus,
      assignedMechanicId: repMechanicId,
      estimatedCost: Number(repEstCost),
      notes: repNotes,
      updatedBy: user.name
    };

    try {
      if (editingRepair) {
        // Edit existing repair tracking
        const res = await fetch(`/api/repairs/${editingRepair.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          setRepairModalOpen(false);
          fetchInitialData();
        } else {
          alert('Failed to update repair state.');
        }
      } else {
        // Add new repair request from backend interface
        const res = await fetch('/api/repairs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: repCustName,
            customerPhone: repCustPhone,
            tractorModel: repTractor,
            tractorNumber: repNumber,
            issueDescription: repIssue,
            serviceType: 'Manual Log'
          })
        });
        if (res.ok) {
          const added = await res.json();
          // Immediately apply mechanic and estimates if filled
          if (repMechanicId || repStatus !== RepairStatus.PENDING) {
            await fetch(`/api/repairs/${added.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
          }
          setRepairModalOpen(false);
          fetchInitialData();
        } else {
          alert('Failed to log new repair request.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRepair = async (id: string) => {
    if (!confirm('Are you sure you want to remove this repair record from the system?')) return;
    try {
      const res = await fetch(`/api/repairs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  // Quick state update for mechanics (e.g., Sunil changing status of their jobs)
  const handleQuickMechanicStatusUpdate = async (repairId: string, targetStatus: RepairStatus) => {
    try {
      const res = await fetch(`/api/repairs/${repairId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          updatedBy: user.name,
          notes: `Mechanics terminal adjusted state to ${targetStatus}`
        })
      });
      if (res.ok) {
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. AUTONOMOUS BILLING DESK & CART CREATION
  const handleAddPartToCart = (part: SparePart) => {
    if (part.stock <= 0) {
      alert('This spare part is out of stock! Custom order or replenishment required.');
      return;
    }
    const existing = billingCart.find(item => item.partId === part.id);
    if (existing) {
      if (existing.quantity >= part.stock) {
        alert(`Cannot add more. Retail stock shelf contains only ${part.stock} items.`);
        return;
      }
      setBillingCart(billingCart.map(item => 
        item.partId === part.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setBillingCart([...billingCart, { partId: part.id, partName: part.name, quantity: 1, price: part.price }]);
    }
  };

  const handleRemovePartFromCart = (partId: string) => {
    setBillingCart(billingCart.filter(item => item.partId !== partId));
  };

  const handleUpdateCartQty = (partId: string, qty: number, maxStock: number) => {
    if (qty <= 0) {
      handleRemovePartFromCart(partId);
      return;
    }
    if (qty > maxStock) {
      alert(`Available tractor inventory stock is limited to ${maxStock} items.`);
      return;
    }
    setBillingCart(billingCart.map(item => 
      item.partId === partId ? { ...item, quantity: qty } : item
    ));
  };

  const handleGenerateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerObj = customers.find(c => c.id === selectedCustomerIdForBill);
    if (!customerObj) {
      alert('Please select or specify a valid Customer to generate dynamic bills.');
      return;
    }

    const matchedRepair = repairs.find(r => r.id === associatedRepairId);

    const invoicePayload = {
      repairId: associatedRepairId,
      customerId: customerObj.id,
      customerName: customerObj.name,
      customerPhone: customerObj.phone,
      tractorModel: matchedRepair ? matchedRepair.tractorModel : customerObj.tractorModel,
      tractorNumber: matchedRepair ? matchedRepair.tractorNumber : customerObj.tractorNumber,
      mechanicId: matchedRepair ? matchedRepair.assignedMechanicId : '',
      mechanicName: matchedRepair ? matchedRepair.assignedMechanicName : 'Workshop Team',
      sparePartsUsed: billingCart,
      repairCharges: Number(billLabor),
      discount: Number(billDiscount),
      taxGst: Number(billGstPercent)
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      if (res.ok) {
        const invoiced = await res.json();
        setBillSuccessInvoice(invoiced);
        setSelectedCustomerIdForBill('');
        setAssociatedRepairId('');
        setBillingCart([]);
        setBillLabor('1500');
        setBillDiscount('0');
        fetchInitialData();
      } else {
        alert('Billing payload failed verification.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. UPDATE CO-ORDINATES SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      shopName: shopNameField,
      ownerName: ownerNameField,
      phone: shopPhoneField,
      whatsapp: shopWhatsappField,
      address: shopAddressField,
      workingHours: shopWorkingHoursField
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        alert('Sri Reddy Workshop core configuration updated successfully.');
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper arrays & categories
  const categoriesList = React.useMemo(() => {
    const base = ['All', 'Tractor engine parts', 'Filters', 'Brake parts', 'Battery parts', 'Clutch parts', 'Gear parts', 'Automobile spare parts', 'Vehicle parts'];
    const dynamic = Array.from(new Set(spareParts.map(p => p.category).filter(Boolean)));
    const merged = ['All', ...Array.from(new Set([...base.filter(c => c !== 'All'), ...dynamic]))];
    return merged;
  }, [spareParts]);
  
  // Filtering lists
  const filteredParts = spareParts.filter(p => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery) ||
    c.tractorModel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRepairs = repairs.filter(r => 
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.customerPhone.includes(searchQuery) || 
    r.tractorModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If the logged-in user is a MECHANIC, restrict most views and force them to the customized assigned workspace
  const isMechanicOnly = user.role === UserRole.MECHANIC;
  const assignedRepairsForMechanic = repairs.filter(r => r.assignedMechanicId === 'm1' || r.assignedMechanicName.includes(user.name));

  return (
    <div className="flex-1 bg-slate-100 flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)]">
      
      {/* SIDE CONTROL RAIL */}
      <div className="w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800 shrink-0 text-slate-300 p-4 space-y-6 select-none no-print">
        <div className="bg-charcoal-950 p-4 rounded-xl border border-charcoal-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-green-700/20 text-brand-green-400 font-extrabold flex items-center justify-center border border-brand-green-500/30">
            {user.role === UserRole.ADMIN ? '👑' : user.role === UserRole.STAFF ? '💼' : '🔧'}
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white leading-5 truncate">{user.name}</h4>
            <span className="text-[10px] bg-slate-800 text-amber-500 rounded px-1.5 py-0.5 font-mono uppercase border border-slate-700 font-extrabold">{user.role}</span>
          </div>
        </div>

        <nav className="space-y-1">
          {!isMechanicOnly ? (
            <>
              <button 
                id="sidebar-btn-dashboard"
                onClick={() => setActiveMenu('dashboard')} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${activeMenu === 'dashboard' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <BarChart3 className="w-4.5 h-4.5 text-brand-green-400" /> Executive Overview
              </button>

              <button 
                id="sidebar-btn-customers"
                onClick={() => setActiveMenu('customers')} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${activeMenu === 'customers' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <Users className="w-4.5 h-4.5 text-brand-green-400" /> Farmers ({customers.length})
              </button>

              <button 
                id="sidebar-btn-repairs"
                onClick={() => setActiveMenu('repairs')} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${activeMenu === 'repairs' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <Wrench className="w-4.5 h-4.5 text-brand-green-400" /> Tractor Repairs ({repairs.length})
              </button>

              <button 
                id="sidebar-btn-inventory"
                onClick={() => setActiveMenu('inventory')} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${activeMenu === 'inventory' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <Package className="w-4.5 h-4.5 text-brand-green-400" /> Stock Inventory
              </button>

              <button 
                id="sidebar-btn-billing"
                onClick={() => { setActiveMenu('billing'); setBillSuccessInvoice(null) }} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors relative ${activeMenu === 'billing' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <Receipt className="w-4.5 h-4.5 text-brand-green-400" /> Invoicing Station
              </button>

              <button 
                id="sidebar-btn-mechanics"
                onClick={() => setActiveMenu('mechanics')} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${activeMenu === 'mechanics' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <Milestone className="w-4.5 h-4.5 text-brand-green-400" /> Mechanics Desk ({mechanics.length})
              </button>

              <button 
                id="sidebar-btn-reports"
                onClick={() => setActiveMenu('reports')} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${activeMenu === 'reports' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <TrendingUp className="w-4.5 h-4.5 text-brand-green-400" /> Analytics & PDF
              </button>

              <button 
                id="sidebar-btn-settings"
                onClick={() => setActiveMenu('settings')} 
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${activeMenu === 'settings' ? 'bg-brand-green-700 text-white shadow font-bold' : 'hover:bg-charcoal-800 hover:text-white'}`}
              >
                <Settings className="w-4.5 h-4.5 text-brand-green-400" /> Shop Settings
              </button>
            </>
          ) : (
            <button 
              id="sidebar-btn-repairs-mech"
              onClick={() => setActiveMenu('repairs')} 
              className="w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center gap-3 bg-brand-green-700 text-white"
            >
              <Wrench className="w-4.5 h-4.5" /> My Assigned Jobs
            </button>
          )}
        </nav>

        <div className="pt-6 border-t border-charcoal-800">
          <button 
            id="sidebar-btn-logout"
            onClick={onLogout} 
            className="w-full text-rose-450 hover:bg-rose-950 hover:text-rose-100 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center gap-3 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" /> Logout Session
          </button>
        </div>
      </div>

      {/* WORKSPACE CORE BODY ENTRY */}
      <div className="flex-1 p-6">
        
        {loading && (
          <div className="bg-white/85 flex flex-col items-center justify-center p-20 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 border-4 border-brand-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono text-xs text-slate-500 mt-3 font-semibold">Syncing database operations securely...</p>
          </div>
        )}

        {dbStats && !loading && (
          <>
            {/* EXECUTIVE METRIC DASHBOARD */}
            {!isMechanicOnly && activeMenu === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-800">Sri Reddy Mechanical Works Admin Dashboard</h2>
                    <p className="text-xs text-slate-400 font-mono">Owner: Kuncharapu Nagi Reddy | Khammam Cross Roads, Suryapet</p>
                  </div>
                  <button 
                    onClick={fetchInitialData}
                    className="p-1.5 bg-slate-100 border rounded-lg hover:bg-slate-200 text-slate-600 transition-all font-bold text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh
                  </button>
                </div>

                {/* 7-KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div className="bg-white p-4 rounded-xl border text-center space-y-1">
                    <Users className="w-5 h-5 mx-auto text-emerald-600" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-3">Farmers</p>
                    <p className="text-xl font-black text-slate-800">{dbStats.totalCustomers}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border text-center space-y-1">
                    <Wrench className="w-5 h-5 mx-auto text-sky-600" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-3">Tractor Jobs</p>
                    <p className="text-xl font-black text-slate-800">{dbStats.totalRepairs}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border text-center space-y-1">
                    <span className="text-xl text-amber-500 font-bold">●</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-3">Pending</p>
                    <p className="text-xl font-black text-slate-800">{dbStats.pendingRepairs}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border text-center space-y-1">
                    <span className="text-xl text-brand-green-600 font-bold">✔</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-3">Completed</p>
                    <p className="text-xl font-black text-slate-800">{dbStats.completedRepairs}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border text-center space-y-1">
                    <Package className="w-5 h-5 mx-auto text-indigo-600" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-3">Spares Store</p>
                    <p className="text-xl font-black text-slate-800">{dbStats.totalInventoryUnique}</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center space-y-1">
                    <AlertTriangle className="w-5 h-5 mx-auto text-rose-500" />
                    <p className="text-[10px] text-rose-500 font-bold uppercase leading-3">Low Stock</p>
                    <p className="text-xl font-black text-rose-600">{dbStats.lowStockItems}</p>
                  </div>
                  <div className="bg-slate-900 text-amber-400 p-4 rounded-xl border text-center space-y-1">
                    <DollarSign className="w-5 h-5 mx-auto" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-3">Net Inflow</p>
                    <p className="text-lg font-black font-mono">₹{dbStats.revenue.total}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Revenue History Chart using CSS Grid columns as an elegant CSS bar-graph representation */}
                  <div className="bg-white p-5 rounded-2xl border lg:col-span-8 space-y-4">
                    <h3 className="font-bold font-display text-slate-800 text-sm flex items-center justify-between pb-2 border-b">
                      <span>📈 Monthly Business Revenue Movements ({new Date().getFullYear()})</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">AUTO REFR.</span>
                    </h3>
                    
                    <div className="flex justify-between items-end h-48 pt-6 border-b">
                      {dbStats.revenueHistory && dbStats.revenueHistory.map((pt: any, i: number) => {
                        const maxVal = Math.max(...dbStats.revenueHistory.map((item: any) => item.revenue), 10000);
                        const pct = Math.max((pt.revenue / maxVal) * 100, 4); // min height representation
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 space-y-2">
                            <span className="text-[9px] font-mono text-slate-500 font-bold">₹{pt.revenue}</span>
                            <div className="w-8 bg-brand-green-600/90 hover:bg-brand-green-700 rounded-t-md transition-all ease-out" style={{ height: `${pct * 1.2}px` }}></div>
                            <span className="text-[10px] text-slate-400 font-semibold">{pt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 text-[11px] text-slate-400 justify-center">
                      <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-brand-green-600 rounded"></span> Inflows (₹)</div>
                      <p>Aggregate includes: <strong>Spare parts sales</strong> and <strong>Diagnostic labor</strong></p>
                    </div>
                  </div>

                  {/* Low Stock Highlight Alert and Tractor Diagnostics Distribution */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-5 rounded-2xl border space-y-3">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b flex items-center justify-between">
                        <span>⚠️ Stock Alerts ({dbStats.lowStockItems})</span>
                        {dbStats.lowStockItems > 0 && <span className="bg-rose-100 text-rose-700 font-mono text-[9px] px-1.5 py-0.5 rounded font-black uppercase">REPLENISH</span>}
                      </h4>
                      <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
                        {spareParts.filter(p => p.stock <= p.minStockAlert).map(p => (
                          <div key={p.id} className="bg-rose-50/70 p-2 rounded border border-rose-100 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-rose-950 font-display truncate max-w-[150px]">{p.name}</p>
                              <span className="text-[10px] text-rose-500 capitalize">{p.brand} | {p.category}</span>
                            </div>
                            <span className="bg-rose-200 text-rose-800 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono">{p.stock} units left</span>
                          </div>
                        ))}
                        {dbStats.lowStockItems === 0 && (
                          <p className="text-slate-400 text-xs italic text-center py-6">All spare parts inventories are within healthy thresholds!</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border space-y-3">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b">🗂️ Tractor Repairs Breakdown</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Engine Overhauls</span>
                          <span className="font-bold text-slate-800 font-mono">{dbStats.breakdown.engine}</span>
                        </div>
                        <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: `${(dbStats.breakdown.engine / (dbStats.totalRepairs || 1)) * 100}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-slate-600 pt-1">
                          <span>Clutch Assemblies</span>
                          <span className="font-bold text-slate-800 font-mono">{dbStats.breakdown.clutch}</span>
                        </div>
                        <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: `${(dbStats.breakdown.clutch / (dbStats.totalRepairs || 1)) * 100}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-slate-600 pt-1">
                          <span>Fluid / Oil Servicing</span>
                          <span className="font-bold text-slate-800 font-mono">{dbStats.breakdown.servicing}</span>
                        </div>
                        <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full" style={{ width: `${(dbStats.breakdown.servicing / (dbStats.totalRepairs || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FARMERS / CUSTOMERS LIST MODULE */}
            {activeMenu === 'customers' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-800">Farmers & Tractor Fleet Owners Catalog</h2>
                    <p className="text-xs text-slate-400">Total registered profiles tracking mechanical service history coordinates.</p>
                  </div>
                  <button 
                    id="btn-add-customer"
                    onClick={() => handleOpenCustomerModal()}
                    className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4.5 h-4.5" /> Register Farmer
                  </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl border">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search farmers by name, phone model details..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-slate-800 text-xs font-semibold focus:border-brand-green-500 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Customers Shelf */}
                  <div className="lg:col-span-8 bg-white border rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                          <th className="p-4">Farmer Details</th>
                          <th className="p-4">Vehicle Specs</th>
                          <th className="p-4">Registered Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredCustomers.map(c => (
                          <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${selectedCustomerDetail?.id === c.id ? 'bg-brand-green-50/50' : ''}`}>
                            <td className="p-4" onClick={() => setSelectedCustomerDetail(c)}>
                              <p className="font-bold text-slate-800 text-sm cursor-pointer">{c.name}</p>
                              <p className="text-slate-500 font-mono mt-0.5">{c.phone}</p>
                              <p className="text-slate-400 text-[10px]">{c.address}</p>
                            </td>
                            <td className="p-4 cursor-pointer" onClick={() => setSelectedCustomerDetail(c)}>
                              <span className="font-bold text-slate-700 font-display">{c.tractorModel}</span>
                              <p className="text-slate-400 text-[10px] lowercase font-mono">{c.tractorNumber || 'No plate record'}</p>
                            </td>
                            <td className="p-4 text-slate-500">{c.joinedDate}</td>
                            <td className="p-4 text-right space-y-1 sm:space-y-0 sm:space-x-1">
                              <button 
                                onClick={() => handleOpenCustomerModal(c)}
                                className="p-1 px-2.5 bg-slate-100 text-slate-600 rounded border hover:bg-slate-200 text-[10px] font-semibold"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCustomer(c.id)}
                                className="p-1 px-2 bg-rose-50 text-rose-600 rounded border border-rose-200 hover:bg-rose-100 text-[10px] font-bold"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Selected Detailed Profile Sidebar */}
                  <div className="lg:col-span-4 bg-white p-5 border rounded-xl space-y-4 min-h-[300px]">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b">📋 Profile Service Card</h3>
                    {selectedCustomerDetail ? (
                      <div className="space-y-4 text-xs">
                        <div className="bg-slate-50 p-4 border rounded-lg relative overflow-hidden">
                          <div className="absolute top-0 inset-x-0 h-1 bg-brand-green-700"></div>
                          <h4 className="font-bold text-slate-800 text-sm leading-relaxed">{selectedCustomerDetail.name}</h4>
                          <p className="font-mono text-slate-500 text-xs mt-0.5">📞 {selectedCustomerDetail.phone}</p>
                          <p className="text-slate-400 text-[10px] mt-2 font-semibold">📍 Address: {selectedCustomerDetail.address}</p>
                          <p className="text-slate-400 text-[10px] font-semibold">🚜 Tractor: {selectedCustomerDetail.tractorModel} ({selectedCustomerDetail.tractorNumber})</p>
                        </div>

                        {/* Calculations summary */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-slate-50 border p-3 rounded-lg">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-3">Total Repairs</span>
                            <p className="text-lg font-black text-slate-800 mt-1">
                              {repairs.filter(r => r.customerId === selectedCustomerDetail.id).length}
                            </p>
                          </div>
                          <div className="bg-slate-50 border p-3 rounded-lg">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-3">Total Billed</span>
                            <p className="text-base font-black text-brand-green-700 font-mono mt-1">
                              ₹{invoices.filter(i => i.customerId === selectedCustomerDetail.id).reduce((sum, item) => sum + item.totalAmount, 0)}
                            </p>
                          </div>
                        </div>

                        {/* History list for this customer */}
                        <div className="space-y-2">
                          <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Historic Work Order Logs</p>
                          <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                            {repairs.filter(r => r.customerId === selectedCustomerDetail.id).map(r => (
                              <div key={r.id} className="border p-2.5 rounded bg-slate-50/70 text-slate-650">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[130px]">{r.issueDescription}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${r.status === RepairStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{r.status}</span>
                                </div>
                                <span className="text-[9px] text-slate-400 block font-mono">ID: {r.id} | Date: {new Date(r.dateCreated).toLocaleDateString()}</span>
                              </div>
                            ))}
                            {repairs.filter(r => r.customerId === selectedCustomerDetail.id).length === 0 && (
                              <p className="text-slate-400 text-xs italic text-center py-4">No logged repairs associated yet.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs italic text-center py-12">Click a customer name to load dynamic repair & bill directories instantly.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REPAIR TICKETS AND TRACKBOARD PANEL */}
            {activeMenu === 'repairs' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-800">Tractor Repair Work Orders & Garage Board</h2>
                    <p className="text-xs text-slate-400">Log diagnostics, allocate specialist mechanics and update timelines.</p>
                  </div>
                  {!isMechanicOnly && (
                    <button 
                      id="btn-add-repair"
                      onClick={() => handleOpenRepairModal()}
                      className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-all shadow"
                    >
                      <Plus className="w-4.5 h-4.5" /> Book Vehicle Intake
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search active tractor repairs by model status numbers..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-slate-800 text-xs font-semibold focus:border-brand-green-500 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* Table list of repairs */}
                <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                        <th className="p-4">Customer/Tractor</th>
                        <th className="p-4">Mechanical Defect / Diagnostic Problem</th>
                        <th className="p-4">Assigned Mechanic</th>
                        <th className="p-4">Estimated Fee</th>
                        <th className="p-4">Repair Progress Badge</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {(isMechanicOnly ? assignedRepairsForMechanic : filteredRepairs).map(rep => (
                        <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-extrabold text-slate-800">{rep.customerName}</p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-mono font-bold mt-0.5">{rep.tractorModel} - {rep.tractorNumber}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-755 font-semibold text-xs leading-relaxed max-w-sm">{rep.issueDescription}</p>
                            <span className="text-[9px] text-slate-400 font-mono italic block mt-1">Booked: {new Date(rep.dateCreated).toLocaleDateString()}</span>
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            {rep.assignedMechanicName || 'Not Assigned'}
                          </td>
                          <td className="p-4 font-black font-mono text-brand-green-700">
                            {rep.estimatedCost > 0 ? `₹${rep.estimatedCost}` : 'Calculating'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                              rep.status === RepairStatus.PENDING ? 'bg-slate-200 text-slate-700 border' :
                              rep.status === RepairStatus.ACCEPTED ? 'bg-sky-100 text-sky-800 border' :
                              rep.status === RepairStatus.UNDER_REPAIR ? 'bg-amber-100 text-amber-800 border border-amber-250 animate-pulse' :
                              rep.status === RepairStatus.SPARE_PARTS_REQUIRED ? 'bg-rose-50 border border-rose-200 text-rose-700 font-extrabold' :
                              rep.status === RepairStatus.COMPLETED ? 'bg-brand-green-100 text-brand-green-800 border border-brand-green-300' :
                              'bg-indigo-100 text-indigo-850'
                            }`}>
                              {rep.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {isMechanicOnly ? (
                              <div className="space-y-1">
                                <select 
                                  value={rep.status}
                                  onChange={(e) => handleQuickMechanicStatusUpdate(rep.id, e.target.value as RepairStatus)}
                                  className="bg-white border rounded px-1.5 py-1 text-[10px] font-bold text-slate-805"
                                >
                                  <option value={RepairStatus.ACCEPTED}>Accept Job</option>
                                  <option value={RepairStatus.UNDER_REPAIR}>Busy: Under Repair</option>
                                  <option value={RepairStatus.SPARE_PARTS_REQUIRED}>Require Spares</option>
                                  <option value={RepairStatus.COMPLETED}>Task Finished</option>
                                </select>
                              </div>
                            ) : (
                              <div className="space-y-1 sm:space-y-0 sm:space-x-1">
                                <button 
                                  onClick={() => handleOpenRepairModal(rep)}
                                  className="p-1 px-2.5 bg-slate-100 text-slate-600 rounded border hover:bg-slate-200 text-[10px] font-semibold"
                                >
                                  Update / Assign
                                </button>
                                <button 
                                  onClick={() => handleDeleteRepair(rep.id)}
                                  className="p-1 px-2 bg-rose-50 text-rose-500 rounded border border-rose-200 hover:bg-rose-100 text-[10px]"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {(isMechanicOnly ? assignedRepairsForMechanic : filteredRepairs).length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-slate-400 text-xs italic">No matching garage records located in workshop databases.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SPARE PARTS STOCK INVENTORY CONTROL */}
            {activeMenu === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-800">Auto Parts Stock & Warehouse Controls</h2>
                    <p className="text-xs text-slate-400">Total spare physical categories in the commercial automobile shelf.</p>
                  </div>
                  <button 
                    id="btn-add-part"
                    onClick={() => handleOpenPartModal()}
                    className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-all shadow"
                  >
                    <Plus className="w-4.5 h-4.5" /> Log Spare Part Unit
                  </button>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search live spare stock shelf by code name brand..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-slate-800 text-xs font-semibold focus:border-brand-green-500 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="flex gap-2 max-w-full overflow-x-auto no-scrollbar">
                    {categoriesList.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-brand-green-700 text-white shadow font-extrabold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid listing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredParts.map(part => (
                    <div key={part.id} className="bg-white border text-xs rounded-xl overflow-hidden shadow-xs hover:shadow-sm border-slate-200 flex flex-col justify-between">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-mono border font-extrabold px-2 py-0.5 rounded uppercase">
                            {part.code}
                          </span>
                          {part.stock <= part.minStockAlert && (
                            <span className="bg-rose-100 text-rose-700 border-rose-350 border font-mono text-[9px] font-black px-1.5 py-0.5 rounded uppercase animate-bounce">
                              Low Stock
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{part.brand} | {part.category}</span>
                          <h4 className="font-bold text-slate-805 text-xs mt-0.5 leading-relaxed truncate">{part.name}</h4>
                          <span className="text-[10px] text-slate-400">Supplier: {part.supplier}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[9px] text-slate-450 uppercase block font-bold leading-3">STOCKED LEVEL</span>
                            <span className={`font-extrabold ${part.stock <= part.minStockAlert ? 'text-rose-600' : 'text-slate-800'}`}>
                              {part.stock} / {part.minStockAlert} (Alert Floor)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-450 uppercase block font-bold leading-3">RETAIL RATE</span>
                            <span className="font-bold text-brand-green-800 font-mono text-sm leading-5">₹{part.price}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border-t flex gap-2">
                        <button 
                          onClick={() => handleOpenPartModal(part)}
                          className="flex-1 bg-white hover:bg-slate-100 text-slate-700 rounded border hover:border-slate-300 py-2.5 font-bold text-[10px] text-center flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit details
                        </button>
                        <button 
                          onClick={() => handleDeletePart(part.id)}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-650 rounded p-2 text-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredParts.length === 0 && (
                    <div className="col-span-4 text-center py-10 bg-white border rounded-xl">
                      <p className="text-slate-400 text-xs italic">No matching spare stock entries registered yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BILLING / INVOICING DESK */}
            {activeMenu === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border">
                  <h2 className="text-lg font-bold font-display text-slate-800">Sri Reddy Interactive Invoicing & Bill Creator</h2>
                  <p className="text-xs text-slate-400">Add labor, map components from live inventories, recalculate GST, and generate QR verification.</p>
                </div>

                {billSuccessInvoice ? (
                  /* INVOICE BILL COMPLETE RENDER */
                  <div className="max-w-xl mx-auto bg-white border border-slate-350 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6" id="printed-invoice-card">
                    <div className="flex justify-between items-start border-b pb-4">
                      <div>
                        <span className="caution-stripes h-2.5 w-24 block rounded-full mb-2"></span>
                        <h2 className="font-extrabold tracking-tight font-display text-slate-850 text-base leading-4">{settings?.shopName}</h2>
                        <span className="text-[10px] bg-slate-900 text-white rounded px-2 py-0.5 mt-2 inline-block uppercase font-mono">{billSuccessInvoice.invoiceNumber}</span>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold">📍 Address: {settings?.address}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">📞 Call/WhatsApp: {settings?.phone}</p>
                      </div>
                      <div className="text-right border-l pl-4 shrink-0 font-mono text-[10px] text-slate-500">
                        <h4 className="font-extrabold text-amber-500 text-lg uppercase leading-5">ORIGINAL BILL</h4>
                        <p className="mt-1">Date: {new Date(billSuccessInvoice.dateCreated).toLocaleString()}</p>
                        <p className="text-emerald-700 font-extrabold">STATUS: PAID & SETTLED</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-3">FARMER RECIPIENT</p>
                        <p className="font-bold text-slate-800">{billSuccessInvoice.customerName}</p>
                        <p className="text-slate-500 font-mono mt-0.5">📞 {billSuccessInvoice.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-3">TRACTOR SPECIFICATIONS</p>
                        <p className="font-bold text-slate-700">{billSuccessInvoice.tractorModel}</p>
                        <p className="text-slate-400 font-mono mt-0.5">Plate: {billSuccessInvoice.tractorNumber || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-450 font-bold uppercase tracking-wider text-[9px]">Billable Items Line List</p>
                      <table className="w-full text-left font-sans text-xs border">
                        <thead>
                          <tr className="bg-slate-100 border-b text-[9px] uppercase font-bold text-slate-500">
                            <th className="p-2">Category Description</th>
                            <th className="p-2 text-center">Qty</th>
                            <th className="p-2 text-right">Unit Rate</th>
                            <th className="p-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {/* Labor Work Line */}
                          <tr>
                            <td className="p-2">
                              <p className="font-bold text-slate-800">Tractor Mechanical Diagnostic Labor</p>
                              <span className="text-[9px] text-slate-400 block font-semibold italic">Technician: {billSuccessInvoice.mechanicName || 'Workshop Team'}</span>
                            </td>
                            <td className="p-2 text-center font-mono">1</td>
                            <td className="p-2 text-right font-mono">₹{billSuccessInvoice.repairCharges}</td>
                            <td className="p-2 text-right font-mono">₹{billSuccessInvoice.repairCharges}</td>
                          </tr>
                          {/* Parts Lines */}
                          {billSuccessInvoice.sparePartsUsed.map((item, index) => (
                            <tr key={index}>
                              <td className="p-2">
                                <p className="font-bold text-slate-800">{item.partName}</p>
                                <span className="text-[9px] text-slate-400 block font-mono">Code Ref: SP_ITEM_{item.partId.slice(-4).toUpperCase()}</span>
                              </td>
                              <td className="p-2 text-center font-mono">{item.quantity}</td>
                              <td className="p-2 text-right font-mono">₹{item.price}</td>
                              <td className="p-2 text-right font-mono">₹{item.price * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bill breakdown calculations */}
                    <div className="border-t pt-3 flex justify-between text-xs space-y-1">
                      <div className="space-y-2 text-center flex flex-col items-center justify-center border p-3 bg-slate-50 rounded-lg w-32 shrink-0">
                        <span className="text-[8px] text-slate-450 uppercase tracking-widest leading-3 font-bold">QR VERIFIED</span>
                        {/* Interactive elegant CSS custom styled fake QR code visual */}
                        <div className="w-16 h-16 bg-slate-900 p-1 flex flex-wrap gap-0.5 justify-center items-center rounded border-2 border-white select-none">
                          {Array.from({ length: 16 }).map((_, ind) => (
                            <div key={ind} className={`w-3 h-3 ${ind % 3 === 0 || ind % 5 === 2 ? 'bg-white' : 'bg-slate-950'} rounded-xs`}></div>
                          ))}
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 capitalize truncate w-24">OWNER SIGNED OK</span>
                      </div>

                      <div className="w-64 space-y-1.5 text-slate-600 font-medium pl-6">
                        {billSuccessInvoice.discount > 0 && (
                          <div className="flex justify-between">
                            <span>Special Promo Discount:</span>
                            <span className="text-rose-600 font-mono font-bold">-₹{billSuccessInvoice.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[11px]">
                          <span>Tax/GST Proportion ({billSuccessInvoice.taxGst}%):</span>
                          <span className="font-mono text-slate-700 font-bold">Included</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-850 font-black border-t border-slate-300 pt-2 bg-slate-900 text-amber-400 p-2 rounded">
                          <span className="uppercase tracking-wider text-[10px]">TOTAL INVOICE COST:</span>
                          <span className="font-mono text-base">₹{billSuccessInvoice.totalAmount}</span>
                        </div>
                        <span className="text-[8.5px] italic text-slate-400 block text-right">Computed using Indian dynamic tax structure rules</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 text-center space-y-4 no-print flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => window.print()}
                        className="flex-1 bg-brand-green-700 hover:bg-brand-green-800 text-white py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <PrinterCheck className="w-4.5 h-4.5" /> {lang === 'en' ? 'Print Bill (System Layout)' : 'బిల్లు ప్రింట్ చేయండి'}
                      </button>
                      <button 
                        onClick={() => setBillSuccessInvoice(null)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-xl font-bold text-xs"
                      >
                        Create New Invoice
                      </button>
                    </div>
                  </div>
                ) : (
                  /* INVOICE BILL CREATOR WORKSPACE SHEET */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-white p-5 border rounded-xl space-y-4">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b">💳 Automated Invoice Generator</h3>
                      
                      <form onSubmit={handleGenerateInvoiceSubmit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Select Registered Farmer <span className="text-red-550">*</span></label>
                            <select 
                              required
                              value={selectedCustomerIdForBill}
                              onChange={(e) => {
                                setSelectedCustomerIdForBill(e.target.value);
                                // Prefill plate values from matching customer model if any
                                const matched = customers.find(c => c.id === e.target.value);
                                const repMatch = repairs.find(r => r.customerId === e.target.value);
                                if (repMatch) setAssociatedRepairId(repMatch.id);
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-green-500"
                            >
                              <option value="">-- Click to Select Farmer --</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} [📞 {c.phone}]</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Associate Repair Ticket (Optional)</label>
                            <select 
                              value={associatedRepairId}
                              onChange={(e) => {
                                setAssociatedRepairId(e.target.value);
                                const matchedRep = repairs.find(r => r.id === e.target.value);
                                if (matchedRep && matchedRep.estimatedCost > 0) {
                                  setBillLabor(String(matchedRep.estimatedCost));
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-850 focus:outline-none focus:border-brand-green-500"
                            >
                              <option value="">-- Select Active Repair Ticket --</option>
                              {repairs.filter(r => r.customerId === selectedCustomerIdForBill || !selectedCustomerIdForBill).map(r => (
                                <option key={r.id} value={r.id}>[Job ID: {r.id.slice(-4).toUpperCase()}] {r.tractorModel} - Status: {r.status}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-3">Parts Applied (Cart List)</p>
                          <div className="space-y-2">
                            {billingCart.map((item, index) => {
                              const details = spareParts.find(p => p.id === item.partId);
                              return (
                                <div key={index} className="flex items-center justify-between p-2 rounded.md bg-slate-50 border border-slate-200">
                                  <div>
                                    <p className="font-extrabold text-slate-800 text-[11px] leading-relaxed">{item.partName}</p>
                                    <p className="text-slate-400 text-[10.5px]">Brand Rate: ₹{item.price} per unit</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <input 
                                      type="number" 
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateCartQty(item.partId, Number(e.target.value), details ? details.stock : 10)}
                                      className="w-12 border bg-white rounded text-center py-0.5 text-xs font-mono font-bold"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => handleRemovePartFromCart(item.partId)}
                                      className="text-rose-500 font-bold text-[10.5px] hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {billingCart.length === 0 && (
                              <p className="text-slate-400 text-xs italic bg-slate-50 p-4 border text-center rounded-lg">No spare parts attached from the store shelf yet. Click items on the right directory to mount them instantly.</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Diagnostic Labor Fee (₹) <span className="text-red-550">*</span></label>
                            <input 
                              type="number" 
                              required
                              value={billLabor}
                              onChange={(e) => setBillLabor(e.target.value.replace(/\D/g,''))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:border-brand-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Promo Discount (₹)</label>
                            <input 
                              type="number" 
                              value={billDiscount}
                              onChange={(e) => setBillDiscount(e.target.value.replace(/\D/g,''))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-semibold text-rose-650 focus:outline-none focus:border-brand-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Tax Scheme / GST %</label>
                            <select 
                              value={billGstPercent}
                              onChange={(e) => setBillGstPercent(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-green-500"
                            >
                              <option value="5">GST 5% (Minor Oils)</option>
                              <option value="12">GST 12% (Normal Handtools)</option>
                              <option value="18">GST 18% (Standard Tractor Spares)</option>
                              <option value="28">GST 28% (Special High Cast Batteries)</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-brand-green-700 hover:bg-brand-green-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                        >
                          <PrinterCheck className="w-5 h-5" /> Calculate Pricing & Finalize Receipt
                        </button>
                      </form>
                    </div>

                    {/* Quick Inventory Stock Search Panel for Invoicing Cart */}
                    <div className="lg:col-span-4 bg-white p-5 border rounded-xl space-y-4">
                      <div className="border-b pb-2 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">📦 Automobile Stock Shelf</h4>
                        <span className="bg-slate-100 text-[10px] px-2 py-0.5 border rounded">Live Stock Search</span>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search parts name code..." 
                          value={searchPartQueryForCart}
                          onChange={(e) => setSearchPartQueryForCart(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-850 text-xs focus:outline-none focus:border-brand-green-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-2.5 max-h-96 overflow-y-auto no-scrollbar">
                        {spareParts
                          .filter(p => !searchPartQueryForCart || p.name.toLowerCase().includes(searchPartQueryForCart.toLowerCase()) || p.code.toLowerCase().includes(searchPartQueryForCart.toLowerCase()))
                          .map(part => (
                            <div key={part.id} className="border p-2.5 rounded hover:bg-slate-50/80 transition-all text-xs flex justify-between items-center bg-slate-50/40">
                              <div>
                                <h5 className="font-bold text-slate-800 leading-tight truncate max-w-[150px]">{part.name}</h5>
                                <p className="text-[10.5px] text-slate-500 mt-0.5">₹{part.price} | Stock: {part.stock}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleAddPartToCart(part)}
                                className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-extrabold text-[10.5px] px-2.5 py-1 rounded"
                              >
                                + Add
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MECHANICS TRACKING DESK */}
            {activeMenu === 'mechanics' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-800">Workshop Specialist Mechanics Workspace</h2>
                    <p className="text-xs text-slate-400">Track task load, active repair allocations, and daily mechanics performance KPIs.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                  {mechanics.map(mech => {
                    const activeJobs = repairs.filter(r => r.assignedMechanicId === mech.id && r.status !== RepairStatus.COMPLETED && r.status !== RepairStatus.DELIVERED);
                    const completedJobs = repairs.filter(r => r.assignedMechanicId === mech.id && (r.status === RepairStatus.COMPLETED || r.status === RepairStatus.DELIVERED));
                    return (
                      <div key={mech.id} className="bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                        <div className="bg-slate-900 text-white p-4 relative overflow-hidden flex items-center justify-between">
                          <div className="absolute inset-y-0 right-0 p-2 opacity-5">
                            <Wrench className="w-24 h-24" />
                          </div>
                          <div>
                            <span className="bg-brand-green-700 text-white text-[9px] font-mono rounded px-1.5 py-0.5 font-extrabold uppercase">TECHNICIAN</span>
                            <h3 className="font-extrabold font-display text-sm mt-1 leading-tight">{mech.name}</h3>
                            <p className="text-slate-400 text-[10px] mt-0.5">📞 {mech.phone}</p>
                          </div>
                          <span className={`px-2 py-0.5 font-bold rounded text-[9.5px] mt-1 ${mech.status === 'Active' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-amber-400 text-charcoal-950'}`}>
                            {mech.status === 'Active' ? 'Available' : 'Busy'}
                          </span>
                        </div>

                        <div className="p-4 space-y-4 text-xs">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">SPECIALIZATION AREA</p>
                            <p className="font-semibold text-slate-700 leading-relaxed bg-slate-50 border p-2.5 rounded-lg">{mech.specialization || 'General Systems Diagnostician'}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-slate-50 border p-2.5 rounded-lg">
                              <span className="text-[10px] text-slate-400 font-bold block uppercase leading-3">Active Repair Job</span>
                              <p className="text-lg font-black text-slate-850 font-mono mt-1">{activeJobs.length}</p>
                            </div>
                            <div className="bg-slate-50 border p-2.5 rounded-lg">
                              <span className="text-[10px] text-slate-400 font-bold block uppercase leading-3">Completed jobs</span>
                              <p className="text-lg font-black text-brand-green-700 font-mono mt-1">{completedJobs.length}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Ongoing Tasks Assigned</p>
                            <div className="space-y-1.5">
                              {activeJobs.map(job => (
                                <div key={job.id} className="bg-slate-50 p-2 border rounded flex justify-between items-center">
                                  <div>
                                    <p className="font-bold text-slate-755 leading-tight truncate max-w-[120px]">{job.customerName}</p>
                                    <span className="text-[10px] text-slate-400 font-mono italic">{job.tractorModel}</span>
                                  </div>
                                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 border border-amber-250 font-bold text-[8.5px] rounded uppercase">{job.status}</span>
                                </div>
                              ))}
                              {activeJobs.length === 0 && (
                                <p className="text-slate-400 text-[10.5px] italic text-center py-2 bg-slate-50 border border-dashed rounded">No active repair tickets pending assigned diagnostics!</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DIRECT EXPORT REPORT ANALYTICS PAGE */}
            {activeMenu === 'reports' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-800">Shop Performance and Growth Analytics Report</h2>
                    <p className="text-xs text-slate-400 font-mono">Real-time analytical summaries from the persistent database.</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm no-print"
                  >
                    <Printer className="w-4 h-4" /> Print Business Report
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Revenue Splits */}
                  <div className="bg-white p-5 border rounded-2xl shadow-xs space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm pb-2 border-b flex items-center gap-1">💸 Inflow Streams Diagnostics</h4>
                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Genuine Spare parts Inflows:</span>
                        <span className="font-extrabold text-slate-850 font-mono">₹{dbStats.revenue.spareParts}</span>
                      </div>
                      <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden">
                        <div className="bg-brand-green-700 h-full" style={{ width: `${(dbStats.revenue.spareParts / (dbStats.revenue.total || 1)) * 100}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center text-slate-600">
                        <span>Workshop Repair Services Labor:</span>
                        <span className="font-extrabold text-slate-850 font-mono">₹{dbStats.revenue.labor}</span>
                      </div>
                      <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full" style={{ width: `${(dbStats.revenue.labor / (dbStats.revenue.total || 1)) * 100}%` }}></div>
                      </div>

                      <div className="bg-slate-900 text-amber-400 p-3 rounded-lg flex justify-between items-center font-display border mt-4">
                        <span className="font-black text-[10.5px]">CUMULATIVE BUSINESS REVENUE INFLOWS:</span>
                        <span className="font-mono text-base font-extrabold">₹{dbStats.revenue.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary lists */}
                  <div className="bg-white p-5 border rounded-2xl shadow-xs space-y-4 font-sans text-xs">
                    <h4 className="font-bold text-slate-805 text-sm pb-2 border-b">📜 General Invoices List</h4>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
                      {invoices.map(inv => (
                        <div key={inv.id} className="border p-2.5 rounded bg-slate-5" onClick={() => setSelectedInvoiceView(inv)}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 font-mono">{inv.invoiceNumber}</span>
                            <span className="font-bold text-brand-green-700 font-mono">₹{inv.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-slate-450 mt-1 leading-4 text-[10px]">
                            <span>Farmer: {inv.customerName}</span>
                            <span>{new Date(inv.dateCreated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                      {invoices.length === 0 && (
                        <p className="text-slate-400 text-xs italic text-center py-6">No invoices created yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHOP CONFIG SYSTEM SETTINGS */}
            {activeMenu === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border">
                  <h2 className="text-lg font-bold font-display text-slate-800">Workshop & Automobile Shop Core Configurations</h2>
                  <p className="text-xs text-slate-400">Manage business details, owner metadata, contact coordinates and times.</p>
                </div>

                <div className="max-w-2xl bg-white border p-6 rounded-2xl shadow-sm">
                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-750 font-bold mb-1">Company / Workshop Title Name</label>
                      <input 
                        type="text" 
                        required
                        value={shopNameField}
                        onChange={(e) => setShopNameField(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-brand-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-750 font-bold mb-1">Official Owner Name</label>
                        <input 
                          type="text" 
                          required
                          value={ownerNameField}
                          onChange={(e) => setOwnerNameField(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-750 font-bold mb-1">Co-ordinator Working Hours</label>
                        <input 
                          type="text" 
                          required
                          value={shopWorkingHoursField}
                          onChange={(e) => setShopWorkingHoursField(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-green-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-750 font-bold mb-1">Call Booking Phone Line</label>
                        <input 
                          type="tel" 
                          required
                          value={shopPhoneField}
                          onChange={(e) => setShopPhoneField(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-semibold text-slate-800 focus:outline-none focus:border-brand-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-750 font-bold mb-1">WhatsApp Status Update Helpline</label>
                        <input 
                          type="tel" 
                          required
                          value={shopWhatsappField}
                          onChange={(e) => setShopWhatsappField(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-semibold text-slate-800 focus:outline-none focus:border-brand-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-750 font-bold mb-1">Workshop physical address geo description</label>
                      <textarea 
                        required
                        rows={3}
                        value={shopAddressField}
                        onChange={(e) => setShopAddressField(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-850 focus:outline-none focus:border-brand-green-500"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="bg-brand-green-700 hover:bg-brand-green-800 text-white font-black px-5 py-2.5 rounded-xl transition-all shadow"
                    >
                      Save Shop Settings
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* DYNAMIC CUSTOMER ADD / EDIT DIALOG MODAL */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-green-700 rounded-t-3xl"></div>
            
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-extrabold font-display text-slate-850 text-sm">
                {editingCustomer ? '✏️ Edit Farmer Profile Coordinates' : '🚜 Create New Farmer Profile Account'}
              </h3>
              <button 
                onClick={() => setCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 font-black text-xs"
              >
                ✖ close
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Farmer Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Prasad" 
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone Coordinate <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    required
                    maxLength={10}
                    placeholder="10 digit cellular number" 
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-850 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Tractor Brand & Model</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Swaraj 744 FE" 
                    value={custTractor}
                    onChange={(e) => setCustTractor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Registration Plate Plate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AP-21-TJ-XXXX" 
                    value={custNumber}
                    onChange={(e) => setCustNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Farmer physical address</label>
                <textarea 
                  rows={2}
                  placeholder="Street and village descriptions" 
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-850"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setCustomerModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-lg px-4 py-2 shadow font-bold"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC REPAIR ADD / EDIT DIALOG MODAL */}
      {repairModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl p-6 w-full max-w-xl shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-green-700 rounded-t-3xl"></div>
            
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-extrabold font-display text-slate-800 text-sm">
                {editingRepair ? '🛠️ Update Active Garage Diagnostic Process' : '🚜 Log Manual Intaked Repair Work'}
              </h3>
              <button 
                onClick={() => setRepairModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 text-xs font-bold"
              >
                ✖ close
              </button>
            </div>

            <form onSubmit={handleSaveRepair} className="space-y-4 text-xs font-semibold text-slate-700">
              
              {!editingRepair && (
                <div className="bg-slate-50 p-3.5 border rounded-xl space-y-3">
                  <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mb-1">Farmer Contact Register Phase</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Farmer Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Ramulu" 
                        value={repCustName}
                        onChange={(e) => setRepCustName(e.target.value)}
                        className="w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        placeholder="10 digit mobile" 
                        value={repCustPhone}
                        onChange={(e) => setRepCustPhone(e.target.value.replace(/\D/g,''))}
                        className="w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Tractor Model</label>
                      <input 
                        type="text" 
                        placeholder="Mahindra 575 DI" 
                        value={repTractor}
                        onChange={(e) => setRepTractor(e.target.value)}
                        className="w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Tractor Number Plates</label>
                      <input 
                        type="text" 
                        placeholder="AP-21-TX-XXXX" 
                        value={repNumber}
                        onChange={(e) => setRepNumber(e.target.value)}
                        className="w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 font-medium text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingRepair && (
                <div className="bg-slate-50 p-2.5 border rounded-lg text-[11px] text-slate-500">
                  <p className="font-bold text-slate-700">TRACTOR: {repTractor} ({repNumber})</p>
                  <p className="mt-0.5">Farmer Client: {repCustName} ({repCustPhone})</p>
                </div>
              )}

              <div>
                <label className="block font-bold mb-1">Diagnostic Issue defect detailed <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={2}
                  disabled={!!editingRepair}
                  value={repIssue}
                  onChange={(e) => setRepIssue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-xs focus:bg-white"
                  placeholder="e.g. Valve sound and white smoke coming from tail exhaust pipe gears hard."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3">
                <div>
                  <label className="block font-bold mb-1">Assign Mechanic Specialist</label>
                  <select 
                    value={repMechanicId}
                    onChange={(e) => setRepMechanicId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-brand-green-500"
                  >
                    <option value="">-- No Assignment yet --</option>
                    {mechanics.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Garage Repair Status</label>
                  <select 
                    value={repStatus}
                    onChange={(e) => setRepStatus(e.target.value as RepairStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-brand-green-500"
                  >
                    <option value={RepairStatus.PENDING}>Pending Triage</option>
                    <option value={RepairStatus.ACCEPTED}>Accepted Intake</option>
                    <option value={RepairStatus.UNDER_REPAIR}>Under Active Repair</option>
                    <option value={RepairStatus.SPARE_PARTS_REQUIRED}>Spare Parts Required</option>
                    <option value={RepairStatus.COMPLETED}>Repair Completed</option>
                    <option value={RepairStatus.DELIVERED}>Delivered & Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Pre-Estimated Charges (₹)</label>
                  <input 
                    type="number" 
                    value={repEstCost}
                    onChange={(e) => setRepEstCost(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Append Mechanic Diary Logs & Progress Note</label>
                <input 
                  type="text" 
                  placeholder="e.g. Engine cylinder head open, replacing copper block linings today." 
                  value={repNotes}
                  onChange={(e) => setRepNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-850 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setRepairModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-lg px-4 py-2 font-bold shadow"
                >
                  Submit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC SPARE PART ADD / EDIT DIALOG MODAL */}
      {partModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-green-700 rounded-t-3xl"></div>
            
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-extrabold font-display text-slate-850 text-sm">
                {editingPart ? '✏️ Modify Spare Part Quantities' : '⚙️ Register New Mechanical Component'}
              </h3>
              <button 
                onClick={() => setPartModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 text-xs font-bold"
              >
                ✖ close
              </button>
            </div>

            <form onSubmit={handleSavePart} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Part Name / Component <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Clutch Release Assembly" 
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Category Shelf <span className="text-red-550">*</span></label>
                  <select 
                    value={partCategory}
                    onChange={(e) => setPartCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-brand-green-500"
                  >
                    <option value="Filters">Filters</option>
                    <option value="Brake parts">Brake Parts</option>
                    <option value="Battery parts">Battery Parts</option>
                    <option value="Clutch parts">Clutch Parts</option>
                    <option value="Gear parts">Gear Parts</option>
                    <option value="Tractor engine parts">Engine Parts</option>
                    <option value="Automobile spare parts">Automobile General</option>
                    <option value="Vehicle parts">Vehicle Parts</option>
                    <option value="custom_category_option">+ Add New Category...</option>
                  </select>
                </div>
              </div>

              {partCategory === 'custom_category_option' && (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3.5 space-y-2">
                  <label className="block font-bold text-slate-700">Custom Category Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Cabin accessories, Electrical parts, etc."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-brand-green-500 font-semibold"
                  />
                  <p className="text-[10px] text-slate-500 font-normal">This custom category will be added to the database and will appear as a category choice across both customer-facing lists and admin stock shelves.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">Manufacturer Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. FL-SW-09" 
                    value={partCode}
                    onChange={(e) => setPartCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Donaldson / Bosch" 
                    value={partBrand}
                    onChange={(e) => setPartBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Supplier Entity</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ananta Spares" 
                    value={partSupplier}
                    onChange={(e) => setPartSupplier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">Retail Shelf Price (₹) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    value={partPrice}
                    onChange={(e) => setPartPrice(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Available Stock (Shelf) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    value={partStock}
                    onChange={(e) => setPartStock(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Min Threshold Alert</label>
                  <input 
                    type="number" 
                    value={partMinAlert}
                    onChange={(e) => setPartMinAlert(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Exact Product Image URL (Unsplash or custom)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/photo-..." 
                  value={partImage}
                  onChange={(e) => setPartImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setPartModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-lg px-4 py-2 font-bold shadow"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
