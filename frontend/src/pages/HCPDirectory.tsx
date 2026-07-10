import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Phone, Mail, MapPin, Building, Stethoscope, Edit, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { useHcps } from '../hooks/useHcps';

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  hospital: string;
  city: string;
  email: string;
  phone: string;
}

export const HCPDirectory: React.FC = () => {
  // Use Redux-backed custom state hooks
  const { 
    hcps, 
    loading, 
    error: apiError, 
    fetchHcps, 
    createHcp, 
    updateHcp, 
    deleteHcp 
  } = useHcps();

  // Search and Filter states
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  
  // Modals management
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for Create/Edit
  const [formValues, setFormValues] = useState({
    name: '',
    specialization: '',
    hospital: '',
    city: '',
    email: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch HCP profiles from backend on component mount
  useEffect(() => {
    fetchHcps().catch(err => {
      console.error("Failed to load HCPs on mount:", err);
      triggerToast('error', "Failed to load HCP profiles from database.");
    });
  }, [fetchHcps]);

  const specializations = Array.from(new Set(hcps.map(d => d.specialization))).map(s => ({ value: s, label: s }));

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formValues.name) errors.name = "Name is required.";
    if (!formValues.specialization) errors.specialization = "Specialization is required.";
    if (!formValues.hospital) errors.hospital = "Hospital affiliation is required.";
    if (!formValues.city) errors.city = "City is required.";
    if (!formValues.email) {
      errors.email = "Email is required.";
    } else if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(formValues.email)) {
      errors.email = "Invalid email format.";
    }
    if (!formValues.phone) errors.phone = "Phone number is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = () => {
    setFormValues({ name: '', specialization: '', hospital: '', city: '', email: '', phone: '' });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setSelectedDoc(doc);
    setFormValues({
      name: doc.name,
      specialization: doc.specialization,
      hospital: doc.hospital,
      city: doc.city,
      email: doc.email,
      phone: doc.phone
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleCreateHCP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createHcp(formValues);
      triggerToast('success', "HCP created successfully");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to create HCP profile.";
      triggerToast('error', errMsg);
    }
  };

  const handleUpdateHCP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !validateForm()) return;

    try {
      await updateHcp(selectedDoc.id, formValues);
      triggerToast('success', "Successfully updated");
      setIsEditModalOpen(false);
      setSelectedDoc(null);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to update HCP profile.";
      triggerToast('error', errMsg);
    }
  };

  const handleDeleteHCP = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this HCP profile? This action will also delete all associated interactions.")) return;
    
    try {
      await deleteHcp(id);
      triggerToast('success', "HCP deleted successfully");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to delete HCP profile.";
      triggerToast('error', errMsg);
    }
  };

  const filteredDoctors = hcps.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.hospital.toLowerCase().includes(search.toLowerCase()) ||
                          doc.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterSpec === '' || doc.specialization === filterSpec;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-[14px] shadow-2xl border text-sm font-semibold select-none animate-in fade-in slide-in-from-top-4 duration-300 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toastMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="HCP Directory"
        subtitle="Manage and query registered Healthcare Professional profiles and network affiliations."
        actions={
          <Button variant="primary" className="h-11" onClick={openCreateModal} disabled={loading}>
            <Plus className="w-4 h-4" /> Add HCP Profile
          </Button>
        }
      />

      {/* Query Filter Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-card border border-border-custom shadow-premium-soft select-none">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, hospital, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-border-custom rounded-input text-sm text-text-primary outline-none focus:bg-white focus:border-primary transition-all duration-200"
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary hidden sm:inline" />
          <select
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-slate-50/50 border border-border-custom rounded-input text-sm text-text-primary outline-none focus:bg-white focus:border-primary transition-all duration-200"
            disabled={loading}
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec.value} value={spec.value}>{spec.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state display banner */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-card text-sm flex items-center gap-2 select-none">
          <AlertTriangle className="w-5 h-5 text-status-danger" />
          <span>Error loading profiles: {apiError}. Mock fallbacks active.</span>
        </div>
      )}

      {/* HCP Card Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doc => (
            <Card key={doc.id} hoverLift className="flex flex-col justify-between h-[270px]">
              <div>
                {/* Header details */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-text-primary tracking-tight">
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Stethoscope className="w-3.5 h-3.5 text-primary" />
                      <span>{doc.specialization}</span>
                    </div>
                  </div>
                  <Badge variant="info">ID: {doc.id}</Badge>
                </div>

                {/* Body details */}
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{doc.city}</span>
                  </div>
                </div>
              </div>

              {/* View/Edit/Delete Actions */}
              <div className="pt-4 border-t border-border-custom flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-2 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg transition-colors"
                    title="Edit Profile"
                    disabled={loading}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHCP(doc.id)}
                    className="p-2 text-slate-400 hover:text-status-danger hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Profile"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Button 
                  variant="outline" 
                  className="px-4 py-2 h-9" 
                  onClick={() => setSelectedDoc(doc)}
                  disabled={loading}
                >
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center">
          <p className="text-text-secondary mb-4">No Healthcare Professionals match your search filters.</p>
          <Button variant="outline" onClick={() => { setSearch(''); setFilterSpec(''); }}>Reset Filters</Button>
        </Card>
      )}

      {/* Modal 1: Create HCP Form */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New HCP Profile">
        <form onSubmit={handleCreateHCP} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Dr. Arthur Pendelton"
            value={formValues.name}
            onChange={handleInputChange}
            error={formErrors.name}
            disabled={loading}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Specialization"
              name="specialization"
              placeholder="e.g. Cardiology"
              value={formValues.specialization}
              onChange={handleInputChange}
              error={formErrors.specialization}
              disabled={loading}
            />
            <Input
              label="City"
              name="city"
              placeholder="e.g. Boston"
              value={formValues.city}
              onChange={handleInputChange}
              error={formErrors.city}
              disabled={loading}
            />
          </div>

          <Input
            label="Hospital Affiliation"
            name="hospital"
            placeholder="e.g. Massachusetts General Hospital"
            value={formValues.hospital}
            onChange={handleInputChange}
            error={formErrors.hospital}
            disabled={loading}
          />

          <Input
            label="Email Address"
            name="email"
            placeholder="e.g. arthur.pendelton@mgh.org"
            value={formValues.email}
            onChange={handleInputChange}
            error={formErrors.email}
            disabled={loading}
          />

          <Input
            label="Phone Contact"
            name="phone"
            placeholder="e.g. +1-555-0123"
            value={formValues.phone}
            onChange={handleInputChange}
            error={formErrors.phone}
            disabled={loading}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Save HCP Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit HCP Form */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedDoc(null); }} title="Edit HCP Profile">
        <form onSubmit={handleUpdateHCP} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Dr. Arthur Pendelton"
            value={formValues.name}
            onChange={handleInputChange}
            error={formErrors.name}
            disabled={loading}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Specialization"
              name="specialization"
              placeholder="e.g. Cardiology"
              value={formValues.specialization}
              onChange={handleInputChange}
              error={formErrors.specialization}
              disabled={loading}
            />
            <Input
              label="City"
              name="city"
              placeholder="e.g. Boston"
              value={formValues.city}
              onChange={handleInputChange}
              error={formErrors.city}
              disabled={loading}
            />
          </div>

          <Input
            label="Hospital Affiliation"
            name="hospital"
            placeholder="e.g. Massachusetts General Hospital"
            value={formValues.hospital}
            onChange={handleInputChange}
            error={formErrors.hospital}
            disabled={loading}
          />

          <Input
            label="Email Address"
            name="email"
            placeholder="e.g. arthur.pendelton@mgh.org"
            value={formValues.email}
            onChange={handleInputChange}
            error={formErrors.email}
            disabled={loading}
          />

          <Input
            label="Phone Contact"
            name="phone"
            placeholder="e.g. +1-555-0123"
            value={formValues.phone}
            onChange={handleInputChange}
            error={formErrors.phone}
            disabled={loading}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setIsEditModalOpen(false); setSelectedDoc(null); }} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: View HCP Details */}
      <Modal isOpen={selectedDoc !== null && !isEditModalOpen} onClose={() => setSelectedDoc(null)} title="HCP Profile Sheet">
        {selectedDoc && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary-light flex items-center justify-center text-primary border border-secondary shadow-sm">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">{selectedDoc.name}</h3>
                <span className="text-sm font-medium text-text-secondary">{selectedDoc.specialization} Specialist</span>
              </div>
            </div>

            <div className="h-px bg-border-custom" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-text-primary">
                <Building className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-semibold uppercase">Affiliated Hospital</span>
                  <span>{selectedDoc.hospital}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-primary">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-semibold uppercase">Location City</span>
                  <span>{selectedDoc.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-primary">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-semibold uppercase">Email</span>
                  <a href={`mailto:${selectedDoc.email}`} className="text-primary hover:underline">{selectedDoc.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-primary">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-semibold uppercase">Phone Contact</span>
                  <span>{selectedDoc.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border-custom">
              <Button variant="primary" onClick={() => setSelectedDoc(null)}>
                Close Sheet
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
