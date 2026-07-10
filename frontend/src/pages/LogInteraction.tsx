import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Check, Stethoscope, ClipboardList, Info, AlertTriangle, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { Badge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { useHcps } from '../hooks/useHcps';
import { useInteractions } from '../hooks/useInteractions';
import { useChat } from '../hooks/useChat';

export const LogInteraction: React.FC = () => {
  // Integrate hooks
  const { hcps, fetchHcps, loading: hcpsLoading } = useHcps();
  const { fetchInteractions } = useInteractions();
  const { 
    messages, 
    preview, 
    loading: chatLoading, 
    error: chatError, 
    sendChatMessage, 
    updatePreview, 
    discardPreview, 
    confirmAndSave,
    clearChat 
  } = useChat();

  // Local component states
  const [chatInput, setChatInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userConfirmedUnder50, setUserConfirmedUnder50] = useState(false);
  const [hasEditedField, setHasEditedField] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Automatically reset user approval checkbox and edit indicator when preview details change
  useEffect(() => {
    setUserConfirmedUnder50(false);
    setHasEditedField(false);
  }, [preview]);

  // Edit Preview local form states
  const [editValues, setEditValues] = useState({
    hcp_id: '',
    interaction_type: '',
    products_discussed: '',
    summary: '',
    follow_up_date: '',
    status: ''
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch HCP list on mount
  useEffect(() => {
    fetchHcps().catch(console.error);
  }, [fetchHcps]);

  // Scroll chat area on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Structured Log Form States (Left Side)
  const [selectedHcpId, setSelectedHcpId] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [products, setProducts] = useState('');
  const [summary, setSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { createInteraction, loading: formSaveLoading } = useInteractions();

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

  const statusOptions = [
    { value: "COMPLETED", label: "Completed" },
    { value: "FOLLOW_UP_PENDING", label: "Follow Up Pending" },
    { value: "CANCELLED", label: "Cancelled" }
  ];

  // Save Left-Side Structured Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!selectedHcpId) errors.hcp_id = "Please select an HCP.";
    if (!type) errors.type = "Please select an interaction type.";
    if (!date) errors.date = "Interaction date is required.";
    if (!summary) errors.summary = "Summary notes are required.";
    if (!products) errors.products = "Products discussed are required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      triggerToast('error', "Please correct validation errors.");
      return;
    }

    setFormErrors({});

    try {
      await createInteraction({
        hcp_id: parseInt(selectedHcpId, 10),
        interaction_mode: "FORM",
        interaction_type: type,
        interaction_date: new Date(date).toISOString(),
        summary,
        products_discussed: products,
        follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
        status: followUpDate ? "FOLLOW_UP_PENDING" : "COMPLETED"
      });

      triggerToast('success', "Interaction logged successfully");
      
      setSelectedHcpId('');
      setType('');
      setDate('');
      setProducts('');
      setSummary('');
      setFollowUpDate('');
      fetchInteractions().catch(console.error);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to log interaction.";
      triggerToast('error', errMsg);
    }
  };

  // Submit AI Chat Notes
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const messageToSend = chatInput.trim();
    setChatInput('');
    await sendChatMessage(messageToSend);
  };

  // Enter Edit mode for Preview Card
  const handleEnterEdit = () => {
    if (!preview) return;
    setEditValues({
      hcp_id: String(preview.hcp_id),
      interaction_type: preview.interaction_type,
      products_discussed: preview.products_discussed,
      summary: preview.summary,
      follow_up_date: preview.follow_up_date || '',
      status: preview.status
    });
    setIsEditing(true);
  };

  // Save changes within local edit form to Redux Preview state
  const handleSaveEdit = () => {
    if (!editValues.hcp_id || !editValues.interaction_type || !editValues.summary || !editValues.products_discussed) {
      triggerToast('error', "HCP, type, summary and products discussed are required.");
      return;
    }

    const matchedHcp = hcps.find(h => h.id === parseInt(editValues.hcp_id, 10));
    const doctorName = matchedHcp ? matchedHcp.name : 'Unknown Doctor';

    updatePreview({
      hcp_id: parseInt(editValues.hcp_id, 10),
      doctor_name: doctorName,
      interaction_type: editValues.interaction_type,
      products_discussed: editValues.products_discussed,
      summary: editValues.summary,
      follow_up_date: editValues.follow_up_date || null,
      status: editValues.status
    });
    setIsEditing(false);
    setHasEditedField(true);
    triggerToast('success', "Preview updated locally");
  };

  // Discard Preview Card
  const handleDiscard = () => {
    discardPreview();
    setIsEditing(false);
    triggerToast('success', "Preview cleared");
  };

  // Confirm and Save Preview Card to DB
  const handleConfirmSave = async () => {
    if (!preview) return;
    try {
      await confirmAndSave(preview);
      triggerToast('success', "Interaction Saved Successfully");
      setIsEditing(false);
      fetchInteractions().catch(console.error);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to save interaction.";
      triggerToast('error', errMsg);
    }
  };

  const getStatusLabel = (statusVal: string) => {
    switch (statusVal) {
      case 'COMPLETED': return 'Completed';
      case 'FOLLOW_UP_PENDING': return 'Follow Up Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return statusVal;
    }
  };

  const getTypeLabel = (typeVal: string) => {
    switch (typeVal) {
      case 'IN_PERSON': return 'In Person Visit';
      case 'CALL': return 'Phone Call';
      case 'EMAIL': return 'Email';
      case 'VIDEO': return 'Video Conference';
      default: return typeVal;
    }
  };

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
        title="Log Interaction"
        subtitle="Log visits, calls, or emails with HCPs. Use the structured form or extract values using AI Chat."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Structured Form */}
        <div className="lg:col-span-6">
          <Card className="relative overflow-hidden h-[730px] flex flex-col justify-between">
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-text-primary">Structured Form Log</h2>
              </div>
              
              <form onSubmit={handleSaveForm} className="space-y-4">
                <Select
                  label="Select Healthcare Professional"
                  placeholder={hcpsLoading ? "Loading HCP profiles..." : "Choose Doctor..."}
                  options={hcpOptions}
                  value={selectedHcpId}
                  onChange={(e) => {
                    setSelectedHcpId(e.target.value);
                    if (formErrors.hcp_id) setFormErrors(prev => ({ ...prev, hcp_id: '' }));
                  }}
                  error={formErrors.hcp_id}
                  disabled={hcpsLoading || formSaveLoading}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Interaction Type"
                    placeholder="Select Type..."
                    options={interactionTypes}
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      if (formErrors.type) setFormErrors(prev => ({ ...prev, type: '' }));
                    }}
                    error={formErrors.type}
                    disabled={formSaveLoading}
                  />

                  <Input
                    label="Interaction Date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (formErrors.date) setFormErrors(prev => ({ ...prev, date: '' }));
                    }}
                    error={formErrors.date}
                    disabled={formSaveLoading}
                  />
                </div>

                <Input
                  label="Products Discussed"
                  placeholder="e.g. CardioHeart-Z, Stat-B12"
                  value={products}
                  onChange={(e) => {
                    setProducts(e.target.value);
                    if (formErrors.products) setFormErrors(prev => ({ ...prev, products: '' }));
                  }}
                  error={formErrors.products}
                  disabled={formSaveLoading}
                />

                <Textarea
                  label="Interaction Summary"
                  placeholder="Summarize the core topics discussed, objections, and interest level..."
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    if (formErrors.summary) setFormErrors(prev => ({ ...prev, summary: '' }));
                  }}
                  error={formErrors.summary}
                  disabled={formSaveLoading}
                />

                <Input
                  label="Follow Up Date (Optional)"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  disabled={formSaveLoading}
                />
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-border-custom flex items-center justify-between mt-6 bg-white z-10">
              <span className="text-xs text-text-secondary flex items-center gap-1.5 select-none">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Saves directly to interaction history database.
              </span>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveForm}
                  variant="primary"
                  isLoading={formSaveLoading}
                  disabled={formSaveLoading}
                  className="px-8"
                >
                  Save Log
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: AI Assistant & Preview Card */}
        <div className="lg:col-span-6 space-y-6">
          {/* AI Chat Area */}
          <Card className="p-0 overflow-hidden flex flex-col justify-between h-[450px]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-border-custom bg-slate-50/50 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-secondary shadow-sm text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">Interactive AI Assistant</h3>
                  <span className="text-[10px] text-status-success font-medium">Online</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="h-8 text-xs px-3"
                onClick={clearChat}
                disabled={chatLoading}
              >
                Clear History
              </Button>
            </div>

            {/* Chat Messages viewport */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[18px] px-4 py-3 text-sm shadow-premium-soft border select-text leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-text-primary border-primary rounded-tr-none'
                        : 'bg-white text-text-primary border-border-custom rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="block text-[9px] text-right mt-1 opacity-60">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-border-custom rounded-[18px] rounded-tl-none px-4 py-3 shadow-premium-soft flex flex-col gap-1.5 select-none">
                    <span className="text-xs text-text-secondary">AI is analyzing the interaction...</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="flex justify-start">
                  <div className="bg-red-50 text-red-800 border border-red-200 rounded-[18px] rounded-tl-none px-4 py-3 text-xs flex items-center gap-1.5 shadow-premium-soft select-none">
                    <AlertTriangle className="w-4 h-4 text-status-danger" />
                    <span>Unable to process interaction. Please try again.</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-border-custom bg-white flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Log details (e.g., 'Met with Dr. John Doe today...')"
                className="flex-1 px-4 py-3 bg-slate-50 border border-border-custom rounded-input text-sm text-text-primary outline-none focus:bg-white focus:border-primary transition-all duration-200"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="p-3 bg-primary text-text-primary rounded-input hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </Card>

          {/* AI Extracted Preview Card */}
          <Card className="relative overflow-hidden border border-slate-200 shadow-xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
            
            <div className="flex items-center gap-2 mb-5 select-none">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
                AI Extracted Preview
              </h3>
            </div>

            {preview ? (
              <div className="space-y-6">
                {isEditing ? (
                  /* Editable Mode Form fields */
                  <div className="space-y-4">
                    <Select
                      label="Physician Doctor"
                      options={hcpOptions}
                      value={editValues.hcp_id}
                      onChange={(e) => setEditValues(prev => ({ ...prev, hcp_id: e.target.value }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Interaction Type"
                        options={interactionTypes}
                        value={editValues.interaction_type}
                        onChange={(e) => setEditValues(prev => ({ ...prev, interaction_type: e.target.value }))}
                      />
                      <Select
                        label="Status"
                        options={statusOptions}
                        value={editValues.status}
                        onChange={(e) => setEditValues(prev => ({ ...prev, status: e.target.value }))}
                      />
                    </div>

                    <Input
                      label="Products Discussed"
                      value={editValues.products_discussed}
                      onChange={(e) => setEditValues(prev => ({ ...prev, products_discussed: e.target.value }))}
                    />

                    <Textarea
                      label="Core Summary Notes"
                      value={editValues.summary}
                      onChange={(e) => setEditValues(prev => ({ ...prev, summary: e.target.value }))}
                    />

                    <Input
                      label="Follow Up Date"
                      type="date"
                      value={editValues.follow_up_date}
                      onChange={(e) => setEditValues(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    />

                    {/* Editor Action Buttons */}
                    <div className="flex justify-end gap-2.5 pt-4 border-t border-border-custom">
                      <Button variant="outline" className="h-9 px-4 text-xs" onClick={() => setIsEditing(false)}>
                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button variant="primary" className="h-9 px-4 text-xs" onClick={handleSaveEdit}>
                        <Save className="w-3.5 h-3.5 mr-1" /> Save Updates
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Read Only Display Mode */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-text-primary">
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-secondary font-semibold uppercase block select-none">HCP Doctor</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Stethoscope className="w-4 h-4 text-indigo-500" /> Dr. {preview.doctor_name}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-secondary font-semibold uppercase block select-none">Interaction Type</span>
                        <span className="font-medium text-slate-700">{getTypeLabel(preview.interaction_type)}</span>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-text-secondary font-semibold uppercase block select-none">Core Discussion Summary</span>
                        <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-border-custom">
                          {preview.summary || "No discussion summary notes generated."}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-secondary font-semibold uppercase block select-none">Products Discussed</span>
                        <span className="font-medium text-indigo-600 font-semibold">{preview.products_discussed || "N/A"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-secondary font-semibold uppercase block select-none">Follow Up Date</span>
                        <span className="font-medium text-slate-700">{preview.follow_up_date || "None scheduled"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-secondary font-semibold uppercase block select-none">Log Status</span>
                        <Badge variant={preview.status === 'COMPLETED' ? 'success' : 'warning'} className="text-[9px] uppercase tracking-wide">
                          {getStatusLabel(preview.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* AI Confidence Indicator */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[14px] p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary font-semibold uppercase block select-none">AI Confidence</span>
                        {(() => {
                          const conf = preview.confidence ?? 85; // TODO: Confidence should later come from the LangGraph/LLM response in production.
                          if (conf >= 90) return <Badge variant="success" className="text-[9px] font-bold">🟢 High Confidence ({conf}%)</Badge>;
                          if (conf >= 70) return <Badge variant="warning" className="text-[9px] font-bold">🟡 Medium Confidence ({conf}%)</Badge>;
                          return <Badge variant="danger" className="text-[9px] font-bold">🔴 Low Confidence ({conf}%)</Badge>;
                        })()}
                      </div>
                      
                      {/* Horizontal progress bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden select-none">
                        <div 
                          className="bg-amber-400 h-full transition-all duration-500 rounded-full" 
                          style={{ width: `${preview.confidence ?? 85}%` }} 
                        />
                      </div>

                      {/* Warnings & Checkbox confirmations */}
                      {(() => {
                        const conf = preview.confidence ?? 85;
                        if (conf < 70) {
                          return (
                            <div className="space-y-2">
                              <div className="text-[11px] text-red-600 flex items-start gap-1 font-medium leading-relaxed">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>AI is not fully confident. Please review the extracted information carefully before saving.</span>
                              </div>
                              {conf < 50 && (
                                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none mt-1">
                                  <input 
                                    type="checkbox"
                                    checked={userConfirmedUnder50}
                                    onChange={(e) => setUserConfirmedUnder50(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                  />
                                  <span>I have reviewed the extracted information.</span>
                                </label>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Standard Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-border-custom">
                      <Button 
                        variant="outline" 
                        className="text-xs h-9 text-slate-600 hover:text-status-danger hover:bg-red-50 hover:border-red-200" 
                        onClick={handleDiscard}
                        disabled={chatLoading}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Discard
                      </Button>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="text-xs h-9" 
                          onClick={handleEnterEdit}
                          disabled={chatLoading}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="primary" 
                          className="text-xs h-9 px-5 bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white font-bold" 
                          onClick={handleConfirmSave}
                          isLoading={chatLoading}
                          disabled={
                            chatLoading || 
                            (((preview.confidence ?? 85) < 50) && !hasEditedField && !userConfirmedUnder50)
                          }
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Confirm & Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty Preview State */
              <div className="py-8 text-center text-xs text-text-secondary flex flex-col items-center justify-center select-none">
                <Info className="w-8 h-8 text-slate-300 mb-2.5 animate-pulse" />
                <p>Submit interaction notes in the AI chat to extract and display the structured preview card here.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
