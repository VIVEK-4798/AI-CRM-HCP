import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertCircle, CheckCircle, MessageSquare, ClipboardList, Sparkles, BellRing, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total HCPs", value: "148", icon: <Users className="w-5 h-5 text-primary" />, desc: "+12 this month" },
    { label: "Today's Meetings", value: "6", icon: <Calendar className="w-5 h-5 text-blue-500" />, desc: "4 completed" },
    { label: "Pending Follow Ups", value: "18", icon: <AlertCircle className="w-5 h-5 text-status-warning" />, desc: "4 due this week" },
    { label: "Completed Interactions", value: "412", icon: <CheckCircle className="w-5 h-5 text-status-success" />, desc: "+36 last week" },
  ];

  const features = [
    {
      title: "AI Chat Logging",
      desc: "Dictate or type interaction notes directly to our cognitive AI assistant. It automatically drafts the log for you.",
      icon: <MessageSquare className="w-6 h-6 text-primary" />
    },
    {
      title: "Structured Form Logging",
      desc: "Prefer traditional inputs? Our form validation helps capture precise structured details in just a few clicks.",
      icon: <ClipboardList className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Smart Summaries",
      desc: "AI extracts key details, products discussed, sentiments, and action items from unstructured interaction notes.",
      icon: <Sparkles className="w-6 h-6 text-violet-500" />
    },
    {
      title: "Follow Up Tracking",
      desc: "Never miss another commitment. Track tasks, schedules, and reminders automatically synced with HCP profile timelines.",
      icon: <BellRing className="w-6 h-6 text-emerald-500" />
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Content */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left select-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-secondary-light text-amber-800 border border-secondary">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            AI-Driven Engagement Suite
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight text-text-primary leading-[1.1] font-sans">
            AI First CRM for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              Healthcare Representatives
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Log HCP interactions smarter, sync prescriber behaviors, and predict next-best engagements using natural conversation flows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button
              variant="primary"
              className="w-full sm:w-auto h-12"
              onClick={() => navigate('/log-interaction')}
            >
              Log Interaction <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12"
              onClick={() => navigate('/hcps')}
            >
              View HCP Directory
            </Button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg aspect-square bg-gradient-to-tr from-secondary-light/35 to-amber-100/10 rounded-[40px] flex items-center justify-center p-8 border border-secondary/20">
            {/* Soft decorative blur circles */}
            <div className="absolute -top-4 -right-4 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-full bg-secondary-light/40 blur-3xl" />
            
            {/* Conceptual SVG Illustration */}
            <svg viewBox="0 0 400 400" className="w-full h-full max-w-[320px] drop-shadow-xl animate-in zoom-in-95 duration-700">
              {/* Background Cards */}
              <rect x="40" y="80" width="220" height="240" rx="20" fill="white" stroke="#E2E8F0" strokeWidth="2" />
              <rect x="140" y="140" width="220" height="180" rx="20" fill="white" stroke="#F1F5F9" strokeWidth="2" />
              
              {/* Card 1 Details */}
              <circle cx="90" cy="130" r="24" fill="#FEF3C7" />
              <path d="M82 135 C 82 125, 98 125, 98 135" stroke="#F5B000" strokeWidth="3" fill="none" />
              <circle cx="90" cy="124" r="8" fill="#F5B000" />
              
              <rect x="130" y="115" width="100" height="10" rx="5" fill="#E2E8F0" />
              <rect x="130" y="135" width="60" height="8" rx="4" fill="#F1F5F9" />
              
              <rect x="70" y="180" width="160" height="6" rx="3" fill="#F1F5F9" />
              <rect x="70" y="200" width="130" height="6" rx="3" fill="#F1F5F9" />

              {/* Card 2 details (AI Chat widget popup) */}
              <rect x="160" y="160" width="180" height="140" rx="16" fill="#0F172A" />
              {/* AI bubble */}
              <rect x="176" y="180" width="110" height="24" rx="12" fill="#334155" />
              <rect x="188" y="188" width="60" height="8" rx="4" fill="#64748B" />
              {/* User bubble */}
              <rect x="210" y="215" width="114" height="24" rx="12" fill="#F5B000" />
              <rect x="222" y="223" width="70" height="8" rx="4" fill="#0F172A" />
              
              {/* Heart rate visual chart */}
              <path d="M176 270 L200 270 L210 255 L220 285 L230 262 L240 273 L250 270 L290 270" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              
              {/* Dots / floating specs */}
              <circle cx="340" cy="100" r="10" fill="#FFD466" />
              <circle cx="340" cy="100" r="4" fill="#F5B000" />
              <circle cx="60" cy="340" r="12" fill="#E2E8F0" />
              <circle cx="300" cy="340" r="6" fill="#F5B000" />
            </svg>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight select-none">
          Commercial Insights Today
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} hoverLift className="flex items-center gap-5">
              <div className="p-3.5 bg-slate-50 rounded-[14px] flex items-center justify-center">
                {stat.icon}
              </div>
              <div className="text-left">
                <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-3xl font-extrabold text-text-primary tracking-tight block my-0.5">
                  {stat.value}
                </span>
                <span className="text-text-secondary text-xs">
                  {stat.desc}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight text-center lg:text-left select-none">
          Empowered Capabilities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} hoverLift className="flex flex-col gap-4">
              <div className="p-3 bg-slate-50 rounded-[14px] w-12 h-12 flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-text-primary tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
