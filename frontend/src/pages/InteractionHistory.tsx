import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, Eye, Trash2, Edit, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { Badge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { useInteractions } from '../hooks/useInteractions';
import { useHcps } from '../hooks/useHcps';

interface InteractionRecord {
  id: number;
  hcp_id: number;
  interaction_mode: string;
  interaction_type: string;
  interaction_date: string;
  summary: string;
  products_discussed: string;
  follow_up_date: string | null;
  status: string;
}

export const InteractionHistory: React.FC = () => {
  // Pull Redux states
  const { 
    interactions, 
    loading: interactionsLoading, 
    error: interactionsError, 
    fetchInteractions, 
    deleteInteraction,
    updateInteraction
  } = useInteractions();

  const { hcps, fetchHcps, loading: hcpsLoading } = useHcps();

  // Component states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<InteractionRecord | null>(null);
  const [editRecord, setEditRecord] = useState<InteractionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Form States
  const [formValues, setFormValues] = useState({
    hcp_id: '',
    interaction_type: '',
    interaction_date: '',
    summary: '',
    products_discussed: '',
    follow_up_date: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch both datasets from backend on component mount
  useEffect(() => {
    fetchInteractions().catch(console.error);
    fetchHcps().catch(console.error);
  }, [fetchInteractions, fetchHcps]);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this interaction log?")) return;
    try {
      await deleteInteraction(id);
      triggerToast('success', "Interaction deleted successfully");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to delete interaction record.";
      triggerToast('error', errMsg);
    }
  };

  const handleEditOpen = (rec: InteractionRecord) => {
    setEditRecord(rec);
    // Format ISO string date to match datetime-local input format (YYYY-MM-DDTHH:MM)
    const formattedDate = rec.interaction_date ? rec.interaction_date.slice(0, 16) : '';
    const formattedFollowUp = rec.follow_up_date ? rec.follow_up_date.slice(0, 10) : '';
    
    setFormValues({
      hcp_id: String(rec.hcp_id),
      interaction_type: rec.interaction_type,
      interaction_date: formattedDate,
      summary: rec.summary,
      products_discussed: rec.products_discussed,
      follow_up_date: formattedFollowUp
    });
    setFormErrors({});
  };

  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;

    // Validate fields
    const errors: Record<string, string> = {};
    if (!formValues.hcp_id) errors.hcp_id = "Please select an HCP.";
    if (!formValues.interaction_type) errors.interaction_type = "Please select an interaction type.";
    if (!formValues.interaction_date) errors.interaction_date = "Interaction date is required.";
    if (!formValues.summary) errors.summary = "Summary notes are required.";
    if (!formValues.products_discussed) errors.products_discussed = "Products discussed are required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await updateInteraction(editRecord.id, {
        hcp_id: parseInt(formValues.hcp_id, 10),
        interaction_type: formValues.interaction_type,
        interaction_date: new Date(formValues.interaction_date).toISOString(),
        summary: formValues.summary,
        products_discussed: formValues.products_discussed,
        follow_up_date: formValues.follow_up_date ? new Date(formValues.follow_up_date).toISOString() : null,
        status: formValues.follow_up_date ? "FOLLOW_UP_PENDING" : "COMPLETED"
      });

      triggerToast('success', "Successfully updated");
      setEditRecord(null);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to update interaction record.";
      triggerToast('error', errMsg);
    }
  };

  // Cross-reference doctors profiles inside the interactions view list
  const getDoctorDetails = (hcpId: number) => {
    const doc = hcps.find(h => h.id === hcpId);
    return doc ? {
      name: doc.name,
      specialty: doc.specialization,
      hospital: doc.hospital
    } : {
      name: `HCP ID: ${hcpId}`,
      specialty: 'Unknown Specialty',
      hospital: 'Unknown Clinic'
    };
  };

  const filteredRecords = interactions.filter(rec => {
    const doc = getDoctorDetails(rec.hcp_id);
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          rec.summary.toLowerCase().includes(search.toLowerCase()) ||
                          rec.products_discussed.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === '' || rec.interaction_type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'FOLLOW_UP_PENDING':
        return <Badge variant="warning">Follow Up Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="primary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IN_PERSON': return "In Person";
      case 'CALL': return "Phone Call";
      case 'EMAIL': return "Email";
      case 'VIDEO': return "Video Conference";
      default: return type;
    }
  };

  const hcpOptions = hcps.map(d => ({ 
    value: d.id, 
    label: `${d.name} (${d.specialization}) - ${d.hospital}` 
  }));

  const interactionTypes = [
    { value: "IN_PERSON", label: "In Person Visit" },
    { value: "CALL", label: "Phone Call" },
    { value: "EMAIL", label: "Email" },
    { value: "VIDEO", label: "Video Conference" },
  ];

  const columns = [
    {
      header: "Doctor Profile",
      accessor: (row: InteractionRecord) => {
        const doc = getDoctorDetails(row.hcp_id);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-text-primary">{doc.name}</span>
            <span className="text-[11px] text-text-secondary">{doc.hospital} • {doc.specialty}</span>
          </div>
        );
      }
    },
    {
      header: "Interaction Type",
      accessor: (row: InteractionRecord) => (
        <span className="font-medium text-slate-600">{getTypeLabel(row.interaction_type)}</span>
      )
    },
    {
      header: "Logged Date",
      accessor: (row: InteractionRecord) => {
        // Format ISO String to friendly local display date
        const formattedDate = new Date(row.interaction_date).toLocaleString([], {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        });
        return (
          <div className="flex items-center gap-1.5 text-text-secondary text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        );
      }
    },
    {
      header: "Status",
      accessor: (row: InteractionRecord) => getStatusBadge(row.status)
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row: InteractionRecord) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedRecord(row)}
            className="p-2 text-slate-500 hover:text-text-primary hover:bg-slate-100 rounded-lg transition-colors"
            title="View Details"
            disabled={interactionsLoading}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOpen(row)}
            className="p-2 text-slate-500 hover:text-primary hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Log"
            disabled={interactionsLoading}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-slate-400 hover:text-status-danger hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Log"
            disabled={interactionsLoading}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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
        title="Interaction History"
        subtitle="Review historical log records and interaction summaries with Healthcare Professionals."
      />

      {/* Query Filter Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-card border border-border-custom shadow-premium-soft select-none">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor, keywords, or products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-border-custom rounded-input text-sm text-text-primary outline-none focus:bg-white focus:border-primary transition-all duration-200"
            disabled={interactionsLoading || hcpsLoading}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-secondary hidden sm:inline" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-slate-50/50 border border-border-custom rounded-input text-sm text-text-primary outline-none focus:bg-white focus:border-primary transition-all duration-200"
            disabled={interactionsLoading || hcpsLoading}
          >
            <option value="">All Types</option>
            <option value="IN_PERSON">In Person</option>
            <option value="CALL">Phone Call</option>
            <option value="EMAIL">Email</option>
            <option value="VIDEO">Video Conference</option>
          </select>
        </div>
      </div>

      {/* Errors banner */}
      {(interactionsError) && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-card text-sm flex items-center gap-2 select-none">
          <AlertTriangle className="w-5 h-5 text-status-danger" />
          <span>Error loading logs: {interactionsError}. Mock database fallbacks active.</span>
        </div>
      )}

      {/* Interactions Table */}
      <Table
        columns={columns}
        data={filteredRecords}
        emptyMessage="No interaction history found matching your search parameters."
      />

      {/* Dummy Pagination */}
      {filteredRecords.length > 0 && (
        <div className="flex items-center justify-between py-2 select-none">
          <span className="text-xs text-text-secondary">
            Showing 1-{filteredRecords.length} of {filteredRecords.length} logs
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="p-2 h-9 flex items-center justify-center" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="p-2 h-9 flex items-center justify-center" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal 1: View Interaction Details */}
      <Modal isOpen={selectedRecord !== null && editRecord === null} onClose={() => setSelectedRecord(null)} title="Interaction Audit Log">
        {selectedRecord && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              {(() => {
                const doc = getDoctorDetails(selectedRecord.hcp_id);
                return (
                  <div>
                    <h4 className="text-lg font-bold text-text-primary">{doc.name}</h4>
                    <p className="text-xs text-text-secondary">{doc.hospital} • {doc.specialty}</p>
                  </div>
                );
              })()}
              {getStatusBadge(selectedRecord.status)}
            </div>

            <div className="h-px bg-border-custom" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[10px] text-text-secondary font-semibold uppercase block">Log Type</span>
                <span className="font-medium">{getTypeLabel(selectedRecord.interaction_type)}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-semibold uppercase block">Execution Date</span>
                <span className="font-medium">
                  {new Date(selectedRecord.interaction_date).toLocaleString()}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-text-secondary font-semibold uppercase block">Products Discussed</span>
                <span className="font-medium text-indigo-600">{selectedRecord.products_discussed}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-text-secondary font-semibold uppercase block">Summary Notes</span>
                <p className="text-slate-600 leading-relaxed text-xs bg-slate-50 p-3 rounded-lg border border-border-custom">
                  {selectedRecord.summary}
                </p>
              </div>
              {selectedRecord.follow_up_date && (
                <div>
                  <span className="text-[10px] text-text-secondary font-semibold uppercase block">Scheduled Follow Up</span>
                  <span className="font-medium text-status-warning">
                    {new Date(selectedRecord.follow_up_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-border-custom">
              <Button variant="primary" onClick={() => setSelectedRecord(null)}>
                Close Log
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 2: Edit Interaction Log */}
      <Modal isOpen={editRecord !== null} onClose={() => setEditRecord(null)} title="Edit Interaction Log">
        <form onSubmit={handleUpdateSave} className="space-y-4">
          <Select
            label="Select Healthcare Professional"
            placeholder="Choose Doctor..."
            options={hcpOptions}
            value={formValues.hcp_id}
            onChange={(e) => {
              setFormValues(prev => ({ ...prev, hcp_id: e.target.value }));
              if (formErrors.hcp_id) setFormErrors(prev => ({ ...prev, hcp_id: '' }));
            }}
            error={formErrors.hcp_id}
            disabled={interactionsLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Interaction Type"
              placeholder="Select Type..."
              options={interactionTypes}
              value={formValues.interaction_type}
              onChange={(e) => {
                setFormValues(prev => ({ ...prev, interaction_type: e.target.value }));
                if (formErrors.interaction_type) setFormErrors(prev => ({ ...prev, interaction_type: '' }));
              }}
              error={formErrors.interaction_type}
              disabled={interactionsLoading}
            />

            <Input
              label="Interaction Date"
              type="datetime-local"
              value={formValues.interaction_date}
              onChange={(e) => {
                setFormValues(prev => ({ ...prev, interaction_date: e.target.value }));
                if (formErrors.interaction_date) setFormErrors(prev => ({ ...prev, interaction_date: '' }));
              }}
              error={formErrors.interaction_date}
              disabled={interactionsLoading}
            />
          </div>

          <Input
            label="Products Discussed"
            placeholder="e.g. CardioHeart-Z, Stat-B12"
            value={formValues.products_discussed}
            onChange={(e) => {
              setFormValues(prev => ({ ...prev, products_discussed: e.target.value }));
              if (formErrors.products_discussed) setFormErrors(prev => ({ ...prev, products_discussed: '' }));
            }}
            error={formErrors.products_discussed}
            disabled={interactionsLoading}
          />

          <Textarea
            label="Interaction Summary"
            placeholder="Summarize discussion details..."
            value={formValues.summary}
            onChange={(e) => {
              setFormValues(prev => ({ ...prev, summary: e.target.value }));
              if (formErrors.summary) setFormErrors(prev => ({ ...prev, summary: '' }));
            }}
            error={formErrors.summary}
            disabled={interactionsLoading}
          />

          <Input
            label="Follow Up Date (Optional)"
            type="date"
            value={formValues.follow_up_date}
            onChange={(e) => setFormValues(prev => ({ ...prev, follow_up_date: e.target.value }))}
            disabled={interactionsLoading}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <Button type="button" variant="outline" onClick={() => setEditRecord(null)} disabled={interactionsLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={interactionsLoading}>
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
