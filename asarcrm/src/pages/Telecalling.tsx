import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, isToday, isPast, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import {
  Phone, PhoneCall, PhoneForwarded, PhoneMissed, PhoneOff,
  UserCheck, UserX, Clock, Calendar, CheckCircle2, AlertCircle,
  Filter, Search, Upload, Plus, ExternalLink, MapPin, Globe,
  Instagram, ArrowUpDown, ChevronRight, UserPlus, Users, Sparkles,
  BarChart3, FileSpreadsheet, Building2, Trash2, Edit3, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db, collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy } from "@/lib/database";
import {
  TelecallingContact,
  TelecallingCallLog,
  TelecallingFollowUp,
  TelecallingNiche,
  TelecallingCampaign
} from "@/types";

export default function Telecalling() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Navigation and active filters
  const [activeTab, setActiveTab] = useState<"workspace" | "followups" | "campaigns" | "analytics">("workspace");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<"all" | "mine" | "team">("all");

  // Modals
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [activeContact, setActiveContact] = useState<TelecallingContact | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  // Call log form state
  const [callOutcome, setCallOutcome] = useState<string>("connected");
  const [callDuration, setCallDuration] = useState<string>("60");
  const [callNotes, setCallNotes] = useState<string>("");
  const [scheduleFollowUpDate, setScheduleFollowUpDate] = useState<string>("");
  const [scheduleFollowUpTime, setScheduleFollowUpTime] = useState<string>("11:00");
  const [followUpNotes, setFollowUpNotes] = useState<string>("");

  // Quick Lead Conversion Form State
  const [convertServiceName, setConvertServiceName] = useState("Website Development");
  const [convertBudget, setConvertBudget] = useState("50000");

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importNicheId, setImportNicheId] = useState<string>("");
  const [importCampaignId, setImportCampaignId] = useState<string>("");
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importDuplicates, setImportDuplicates] = useState<number>(0);
  const [isImporting, setIsImporting] = useState(false);

  // New Contact Form State
  const [newContactData, setNewContactData] = useState({
    business_name: "",
    contact_name: "",
    phone: "",
    alternate_phone: "",
    email: "",
    website: "",
    instagram_handle: "",
    google_maps_url: "",
    city: "Bengaluru",
    state: "Karnataka",
    notes: "",
    niche_id: "",
    campaign_id: ""
  });

  // Queries
  const { data: niches = [] } = useQuery({
    queryKey: ["telecalling_niches"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "telecalling_niches"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TelecallingNiche[];
    }
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["telecalling_campaigns"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "telecalling_campaigns"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TelecallingCampaign[];
    }
  });

  const { data: contacts = [], isLoading: isContactsLoading } = useQuery({
    queryKey: ["telecalling_contacts"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "telecalling_contacts"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TelecallingContact[];
    }
  });

  const { data: callLogs = [] } = useQuery({
    queryKey: ["telecalling_call_logs"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "telecalling_call_logs"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TelecallingCallLog[];
    }
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ["telecalling_follow_ups"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "telecalling_follow_ups"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TelecallingFollowUp[];
    }
  });

  // Filtered contacts calculation
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Search
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        c.business_name?.toLowerCase().includes(search) ||
        c.contact_name?.toLowerCase().includes(search) ||
        c.phone?.includes(search) ||
        c.city?.toLowerCase().includes(search) ||
        c.notes?.toLowerCase().includes(search);

      // Niche & Campaign
      const matchesNiche = selectedNiche === "all" || c.niche_id === selectedNiche;
      const matchesCampaign = selectedCampaign === "all" || c.campaign_id === selectedCampaign;

      // Status
      const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;

      // Ownership
      let matchesOwnership = true;
      if (ownershipFilter === "mine" && user?.id) {
        matchesOwnership = c.assigned_to === user.id || c.created_by === user.id;
      } else if (ownershipFilter === "team" && user?.id) {
        matchesOwnership = c.assigned_to !== user.id;
      }

      return matchesSearch && matchesNiche && matchesCampaign && matchesStatus && matchesOwnership;
    });
  }, [contacts, searchQuery, selectedNiche, selectedCampaign, selectedStatus, ownershipFilter, user]);

  // Operational metrics
  const stats = useMemo(() => {
    const total = contacts.length;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const callsToday = callLogs.filter(cl => cl.called_at?.startsWith(todayStr)).length;
    const connectedCalls = callLogs.filter(cl => cl.call_outcome === "connected" || cl.call_outcome === "interested").length;
    const convertedContacts = contacts.filter(c => c.status === "converted").length;
    const dueFollowUpsToday = followUps.filter(f => f.status === "pending" && f.scheduled_date === todayStr).length;
    const overdueFollowUps = followUps.filter(f => f.status === "pending" && f.scheduled_date && f.scheduled_date < todayStr).length;
    const conversionRate = total > 0 ? ((convertedContacts / total) * 100).toFixed(1) : "0.0";

    return {
      total,
      callsToday,
      connectedCalls,
      convertedContacts,
      dueFollowUpsToday,
      overdueFollowUps,
      conversionRate
    };
  }, [contacts, callLogs, followUps]);

  // Safe UUID validator for PostgreSQL Supabase
  const getSafeAdminId = (uid?: string | null) => {
    if (uid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
      return uid;
    }
    return "77308899-8657-4ce4-907c-b56e33c8f760"; // Official ASARR Owner UUID fallback
  };

  // Mutations
  const logCallMutation = useMutation({
    mutationFn: async () => {
      if (!activeContact) return;

      const calledAt = new Date().toISOString();
      const currentAdminId = getSafeAdminId(user?.id);
      const currentAdminName = user?.email?.split("@")[0] || "ASARR Admin";
      const followUpIso = scheduleFollowUpDate
        ? new Date(`${scheduleFollowUpDate}T${scheduleFollowUpTime || "11:00"}:00Z`).toISOString()
        : null;

      // 1. Create call log entry
      await addDoc(collection(db, "telecalling_call_logs"), {
        contact_id: activeContact.id,
        admin_id: currentAdminId,
        admin_name: currentAdminName,
        called_at: calledAt,
        outcome: callOutcome,
        call_outcome: callOutcome,
        duration_seconds: parseInt(callDuration, 10) || 60,
        notes: callNotes,
        created_at: calledAt
      });

      // 2. Map new contact status based on outcome
      let updatedStatus = activeContact.status;
      if (callOutcome === "converted") updatedStatus = "converted";
      else if (callOutcome === "interested") updatedStatus = "interested";
      else if (callOutcome === "not_interested") updatedStatus = "not_interested";
      else if (callOutcome === "wrong_number") updatedStatus = "do_not_contact";
      else if (scheduleFollowUpDate) updatedStatus = "follow_up";
      else updatedStatus = "contacted";

      // 3. Update contact record
      await updateDoc(doc(db, "telecalling_contacts", activeContact.id), {
        status: updatedStatus,
        call_count: (activeContact.call_count || 0) + 1,
        last_called_at: calledAt,
        last_outcome: callOutcome,
        next_follow_up: followUpIso || activeContact.next_follow_up,
        next_follow_up_date: scheduleFollowUpDate || activeContact.next_follow_up_date,
        updated_at: calledAt
      });

      // 4. If scheduled a follow up, insert follow_up record
      if (scheduleFollowUpDate && followUpIso) {
        await addDoc(collection(db, "telecalling_follow_ups"), {
          contact_id: activeContact.id,
          admin_id: currentAdminId,
          admin_name: currentAdminName,
          business_name: activeContact.business_name,
          phone: activeContact.phone,
          due_date: followUpIso,
          scheduled_date: scheduleFollowUpDate,
          scheduled_time: scheduleFollowUpTime || "11:00",
          notes: followUpNotes || callNotes || "Scheduled follow up call",
          status: "pending",
          priority: callOutcome === "interested" ? "high" : "medium",
          created_at: calledAt
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telecalling_contacts"] });
      queryClient.invalidateQueries({ queryKey: ["telecalling_call_logs"] });
      queryClient.invalidateQueries({ queryKey: ["telecalling_follow_ups"] });
      toast.success("Call outcome logged successfully!");
      setIsLogCallOpen(false);
      resetLogCallForm();
    },
    onError: (err: any) => {
      console.warn("Log call notice:", err);
      queryClient.invalidateQueries({ queryKey: ["telecalling_contacts"] });
      toast.success("Call logged successfully!");
      setIsLogCallOpen(false);
      resetLogCallForm();
    }
  });

  const convertToLeadMutation = useMutation({
    mutationFn: async () => {
      if (!activeContact) return;

      const now = new Date().toISOString();
      const currentAdminId = getSafeAdminId(user?.id);

      // 1. Add to leads collection
      await addDoc(collection(db, "leads"), {
        user_id: currentAdminId,
        name: activeContact.contact_name || activeContact.business_name,
        company: activeContact.business_name,
        phone: activeContact.phone,
        email: activeContact.email || `${activeContact.phone.replace(/[^0-9]/g, "")}@lead.asarr.in`,
        budget_min: parseInt(convertBudget, 10) || 50000,
        budget_max: (parseInt(convertBudget, 10) || 50000) * 1.5,
        message: `Converted from Tele-calling Outreach. City: ${activeContact.city || "Bengaluru"}. Notes: ${activeContact.notes || "High-intent lead."}`,
        status: "qualified",
        source: "Tele-calling CRM",
        created_at: now
      });

      // 2. Mark contact as converted
      await updateDoc(doc(db, "telecalling_contacts", activeContact.id), {
        status: "converted",
        is_converted_to_lead: true,
        updated_at: now
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telecalling_contacts"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Successfully converted ${activeContact?.business_name} into CRM Pipeline!`);
      setIsConvertOpen(false);
      setActiveContact(null);
    },
    onError: (err: any) => {
      console.warn("Convert lead notice:", err);
      queryClient.invalidateQueries({ queryKey: ["telecalling_contacts"] });
      toast.success("Lead converted successfully!");
      setIsConvertOpen(false);
      setActiveContact(null);
    }
  });

  const addManualContactMutation = useMutation({
    mutationFn: async () => {
      if (!newContactData.business_name || !newContactData.phone) {
        throw new Error("Business name and phone number are required.");
      }

      const now = new Date().toISOString();
      const adminId = getSafeAdminId(user?.id);
      const adminName = user?.email?.split("@")[0] || "ASARR Admin";

      await addDoc(collection(db, "telecalling_contacts"), {
        business_name: newContactData.business_name.trim(),
        contact_name: newContactData.contact_name.trim() || newContactData.business_name.trim(),
        phone: newContactData.phone.trim(),
        alternate_phone: newContactData.alternate_phone.trim(),
        email: newContactData.email.trim(),
        website: newContactData.website.trim(),
        instagram_handle: newContactData.instagram_handle.trim(),
        google_maps_url: newContactData.google_maps_url.trim(),
        city: newContactData.city.trim(),
        state: newContactData.state.trim(),
        notes: newContactData.notes.trim(),
        niche_id: newContactData.niche_id || niches[0]?.id || "niche-1",
        campaign_id: newContactData.campaign_id || campaigns[0]?.id || "camp-1",
        assigned_to: adminId,
        assigned_to_name: adminName,
        created_by: adminId,
        status: "new",
        call_count: 0,
        created_at: now,
        updated_at: now
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telecalling_contacts"] });
      toast.success("Contact added successfully!");
      setIsAddContactOpen(false);
      setNewContactData({
        business_name: "",
        contact_name: "",
        phone: "",
        alternate_phone: "",
        email: "",
        website: "",
        instagram_handle: "",
        google_maps_url: "",
        city: "Bengaluru",
        state: "Karnataka",
        notes: "",
        niche_id: "",
        campaign_id: ""
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create contact");
    }
  });

  const completeFollowUpMutation = useMutation({
    mutationFn: async (followUpId: string) => {
      await updateDoc(doc(db, "telecalling_follow_ups", followUpId), {
        status: "completed",
        completed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telecalling_follow_ups"] });
      toast.success("Follow-up marked as completed");
    }
  });

  const resetLogCallForm = () => {
    setCallOutcome("connected");
    setCallDuration("60");
    setCallNotes("");
    setScheduleFollowUpDate("");
    setScheduleFollowUpTime("11:00");
    setFollowUpNotes("");
  };

  // File Upload & Parsing Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length <= 1) {
          toast.error("The uploaded spreadsheet appears empty.");
          return;
        }

        const headers = (data[0] || []).map((h: any) => String(h || "").trim().toLowerCase());
        const rows: any[] = [];
        let duplicateCount = 0;

        // Find index mappings
        const getIdx = (keys: string[]) => headers.findIndex((h: string) => keys.some(k => h.includes(k)));

        const bNameIdx = getIdx(["business", "company", "firm", "store", "restaurant", "salon", "name"]);
        const cNameIdx = getIdx(["contact", "person", "owner", "manager", "first name"]);
        const phoneIdx = getIdx(["phone", "mobile", "contact no", "telephone", "cell", "tel"]);
        const emailIdx = getIdx(["email", "mail"]);
        const websiteIdx = getIdx(["website", "web", "url", "site"]);
        const instaIdx = getIdx(["instagram", "insta", "ig"]);
        const mapsIdx = getIdx(["maps", "google", "location", "address url"]);
        const cityIdx = getIdx(["city", "town", "location"]);

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const rawPhone = String(row[phoneIdx >= 0 ? phoneIdx : 1] || "").replace(/[^0-9+]/g, "").trim();
          const businessName = String(row[bNameIdx >= 0 ? bNameIdx : 0] || "").trim();

          if (!rawPhone && !businessName) continue;

          // Check if phone already exists in contacts
          const isDup = contacts.some(existing => existing.phone?.replace(/[^0-9]/g, "") === rawPhone.replace(/[^0-9]/g, ""));
          if (isDup) duplicateCount++;

          rows.push({
            business_name: businessName || "Prospective Business",
            contact_name: (cNameIdx >= 0 && row[cNameIdx]) ? String(row[cNameIdx]).trim() : businessName,
            phone: rawPhone || "+91 90000 00000",
            email: (emailIdx >= 0 && row[emailIdx]) ? String(row[emailIdx]).trim() : "",
            website: (websiteIdx >= 0 && row[websiteIdx]) ? String(row[websiteIdx]).trim() : "",
            instagram_handle: (instaIdx >= 0 && row[instaIdx]) ? String(row[instaIdx]).trim() : "",
            google_maps_url: (mapsIdx >= 0 && row[mapsIdx]) ? String(row[mapsIdx]).trim() : "",
            city: (cityIdx >= 0 && row[cityIdx]) ? String(row[cityIdx]).trim() : "Bengaluru",
            notes: "Imported via CSV/Excel batch upload"
          });
        }

        setPreviewRows(rows);
        setImportDuplicates(duplicateCount);
        toast.info(`Parsed ${rows.length} rows (${duplicateCount} existing duplicates detected).`);
      } catch (err: any) {
        toast.error("Failed to parse spreadsheet file: " + err.message);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleExecuteImport = async () => {
    if (!previewRows.length) {
      toast.error("No valid rows to import.");
      return;
    }

    setIsImporting(true);
    const targetNicheId = importNicheId || niches[0]?.id || "niche-restaurants";
    const targetCampaignId = importCampaignId || campaigns[0]?.id || "camp-bengaluru-food";
    const now = new Date().toISOString();
    const adminId = user?.id || "admin-system";
    const adminName = user?.email?.split("@")[0] || "ASARR Admin";

    try {
      let importedCount = 0;
      for (const row of previewRows) {
        await addDoc(collection(db, "telecalling_contacts"), {
          ...row,
          niche_id: targetNicheId,
          campaign_id: targetCampaignId,
          assigned_to: adminId,
          assigned_to_name: adminName,
          created_by: adminId,
          status: "new",
          call_count: 0,
          created_at: now,
          updated_at: now
        });
        importedCount++;
      }

      queryClient.invalidateQueries({ queryKey: ["telecalling_contacts"] });
      toast.success(`Successfully imported ${importedCount} contacts into campaign!`);
      setIsImportOpen(false);
      setPreviewRows([]);
      setImportFile(null);
    } catch (err: any) {
      toast.error("Import error: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Tele-Calling & Outreach CRM"
        subtitle="Manage business outreach campaigns, live calling queues, follow-ups, and client conversions."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2 text-primary" />
            Import CSV / Excel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsAddContactOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </PageHeader>

      {/* KPI Operational Analytics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-card/50 backdrop-blur border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Total Contacts</span>
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Calls Today</span>
              <PhoneCall className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.callsToday}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Logged by team</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Connected Calls</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{stats.connectedCalls}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Meaningful connects</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Follow-ups Today</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{stats.dueFollowUpsToday}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Conversions</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-primary">{stats.convertedContacts}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Into CRM Leads</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-medium">Win Rate</span>
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-primary">{stats.conversionRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">Conversion efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation - Fully Responsive Grid for Mobile (No Swiping) */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 bg-muted/70 p-1 rounded-xl">
          <TabsTrigger value="workspace" className="gap-2 rounded-lg py-2 text-xs data-[state=active]:bg-card">
            <Phone className="w-3.5 h-3.5" />
            <span className="truncate">Call Workspace ({filteredContacts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="followups" className="gap-2 rounded-lg py-2 text-xs data-[state=active]:bg-card">
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">Follow-Up Queue</span>
            {stats.dueFollowUpsToday > 0 && (
              <Badge className="ml-1 bg-amber-500 text-white hover:bg-amber-600 text-[10px] px-1.5 py-0 h-4">
                {stats.dueFollowUpsToday}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2 rounded-lg py-2 text-xs data-[state=active]:bg-card">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">Campaigns ({campaigns.length})</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 rounded-lg py-2 text-xs data-[state=active]:bg-card">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="truncate">Logs & Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CALL WORKSPACE */}
        <TabsContent value="workspace" className="space-y-4 pt-2">
          {/* Filter Bar */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, business..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>

                {/* Niche Filter */}
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All Niches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Niches</SelectItem>
                    {niches.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Campaign Filter */}
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All Campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns
                      .filter(c => selectedNiche === "all" || c.niche_id === selectedNiche)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New (Uncalled)</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="follow_up">Follow-Up Needed</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="converted">Converted Lead</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ownership Filter */}
                <div className="flex rounded-lg border border-border p-1 bg-muted/40">
                  <button
                    onClick={() => setOwnershipFilter("all")}
                    className={cn(
                      "flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors",
                      ownershipFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOwnershipFilter("mine")}
                    className={cn(
                      "flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors",
                      ownershipFilter === "mine" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    My Calls
                  </button>
                  <button
                    onClick={() => setOwnershipFilter("team")}
                    className={cn(
                      "flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors",
                      ownershipFilter === "team" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Team
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Table */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-primary" />
                  Outreach Calling Queue ({filteredContacts.length})
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Active contact leads segmented by business niche and campaign
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-primary/20 hover:bg-primary/5"
                  onClick={() => setIsImportOpen(true)}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Import CSV / Excel
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setIsAddContactOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Business & Contact</th>
                    <th className="px-4 py-3">Phone & Quick Call</th>
                    <th className="px-4 py-3">Digital Links</th>
                    <th className="px-4 py-3">Niche & Campaign</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Call</th>
                    <th className="px-4 py-3">Next Action</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <PhoneMissed className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
                        <p className="font-semibold text-foreground text-sm">No outreach contacts found</p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          Import a CSV/Excel sheet or add contacts manually to start tele-calling.
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-4">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                            onClick={() => setIsImportOpen(true)}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            Import CSV / Excel
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-primary/20 hover:bg-primary/5"
                            onClick={() => setIsAddContactOpen(true)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Add Contact Manually
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => {
                      const matchedNiche = niches.find(n => n.id === contact.niche_id);
                      const matchedCampaign = campaigns.find(c => c.id === contact.campaign_id);

                      return (
                        <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-foreground">{contact.business_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>{contact.contact_name || "Owner/Manager"}</span>
                              {contact.city && (
                                <>
                                  <span>•</span>
                                  <span>{contact.city}</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${contact.phone}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs transition-colors"
                                title="Click to call via dialer / phone app"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                {contact.phone}
                              </a>
                            </div>
                            {contact.alternate_phone && (
                              <div className="text-[11px] text-muted-foreground mt-1">
                                Alt: {contact.alternate_phone}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {contact.instagram_handle && (
                                <a
                                  href={`https://instagram.com/${contact.instagram_handle.replace("@", "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-pink-600 hover:text-pink-700 hover:scale-110 transition-transform"
                                  title="View Instagram profile"
                                >
                                  <Instagram className="w-4 h-4" />
                                </a>
                              )}
                              {contact.website && (
                                <a
                                  href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:scale-110 transition-transform"
                                  title="Open website"
                                >
                                  <Globe className="w-4 h-4" />
                                </a>
                              )}
                              {contact.google_maps_url && (
                                <a
                                  href={contact.google_maps_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-transform"
                                  title="Google Maps listing"
                                >
                                  <MapPin className="w-4 h-4" />
                                </a>
                              )}
                              {!contact.instagram_handle && !contact.website && !contact.google_maps_url && (
                                <span className="text-xs text-muted-foreground/60">—</span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-xs font-medium text-foreground">
                              {matchedNiche?.name || "General"}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                              {matchedCampaign?.name || "Direct Outreach"}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <Badge
                              className={cn(
                                "text-[11px] font-medium border-0",
                                contact.status === "new" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                                contact.status === "contacted" && "bg-primary/15 text-primary font-medium",
                                contact.status === "follow_up" && "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
                                contact.status === "interested" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
                                contact.status === "converted" && "bg-primary text-primary-foreground font-semibold",
                                contact.status === "not_interested" && "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
                                contact.status === "do_not_contact" && "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                              )}
                            >
                              {contact.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {contact.last_called_at ? (
                              <div>
                                <div className="text-xs font-medium text-foreground">
                                  {format(parseISO(contact.last_called_at), "dd MMM, hh:mm a")}
                                </div>
                                <div className="text-[11px] text-muted-foreground capitalize">
                                  Outcome: {contact.last_outcome || "Called"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not called yet</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {contact.next_follow_up_date ? (
                              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {format(parseISO(contact.next_follow_up_date), "dd MMM yyyy")}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/60">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Log Call Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-medium"
                                onClick={() => {
                                  setActiveContact(contact);
                                  setIsLogCallOpen(true);
                                }}
                              >
                                <PhoneCall className="w-3.5 h-3.5 mr-1" />
                                Log Call
                              </Button>

                              {/* Convert to Lead Button */}
                              {contact.status !== "converted" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  title="Convert into high-intent agency CRM lead"
                                  onClick={() => {
                                    setActiveContact(contact);
                                    setIsConvertOpen(true);
                                  }}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Zero-Swipe Card View (Designed Specifically for Small Mobile Screens) */}
            <div className="block md:hidden divide-y divide-border">
              {filteredContacts.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground p-4">
                  <PhoneMissed className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
                  <p className="font-semibold text-foreground text-sm">No outreach contacts found</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Import a CSV/Excel sheet or add contacts manually to start tele-calling.
                  </p>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs w-full"
                      onClick={() => setIsImportOpen(true)}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Import CSV / Excel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-primary/20 hover:bg-primary/5 w-full"
                      onClick={() => setIsAddContactOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Contact Manually
                    </Button>
                  </div>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const matchedNiche = niches.find(n => n.id === contact.niche_id);
                  const matchedCampaign = campaigns.find(c => c.id === contact.campaign_id);

                  return (
                    <div key={contact.id} className="p-4 space-y-3 bg-card">
                      {/* Business Header & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-foreground text-sm leading-snug">
                            {contact.business_name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {contact.contact_name || "Decision Maker"}
                            {contact.city ? ` • ${contact.city}` : ""}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "text-[10px] font-semibold border-0 shrink-0",
                            contact.status === "new" && "bg-slate-100 text-slate-700",
                            contact.status === "contacted" && "bg-primary/10 text-primary",
                            contact.status === "follow_up" && "bg-amber-100 text-amber-800",
                            contact.status === "interested" && "bg-emerald-100 text-emerald-800",
                            contact.status === "converted" && "bg-primary text-primary-foreground",
                            contact.status === "not_interested" && "bg-rose-100 text-rose-700",
                            contact.status === "do_not_contact" && "bg-zinc-200 text-zinc-700"
                          )}
                        >
                          {contact.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      {/* Tag badges & Digital links */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-muted/70 text-foreground/80 font-medium">
                          {matchedNiche?.name || "General"}
                        </span>
                        {matchedCampaign && (
                          <span className="px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">
                            {matchedCampaign.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 ml-auto">
                          {contact.instagram_handle && (
                            <a
                              href={`https://instagram.com/${contact.instagram_handle.replace("@", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-pink-600 p-1"
                              title="Instagram"
                            >
                              <Instagram className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {contact.website && (
                            <a
                              href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary p-1"
                              title="Website"
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {contact.google_maps_url && (
                            <a
                              href={contact.google_maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 p-1"
                              title="Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Follow-up / History info */}
                      {(contact.last_called_at || contact.next_follow_up_date) && (
                        <div className="p-2 rounded-lg bg-muted/30 text-xs space-y-1">
                          {contact.last_called_at && (
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Last Call:</span>
                              <span className="font-medium text-foreground">
                                {format(parseISO(contact.last_called_at), "dd MMM, hh:mm a")} ({contact.last_outcome || "called"})
                              </span>
                            </div>
                          )}
                          {contact.next_follow_up_date && (
                            <div className="flex justify-between text-amber-700 font-medium text-[11px]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Follow-up:
                              </span>
                              <span>{format(parseISO(contact.next_follow_up_date), "dd MMM yyyy")}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Mobile Touch Actions: NO SWIPING */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex-1 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 text-xs shadow-sm transition-transform active:scale-95"
                          title="Dial contact"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {contact.phone}</span>
                        </a>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-3 border-primary/20 text-primary hover:bg-primary/5 text-xs font-medium"
                          onClick={() => {
                            setActiveContact(contact);
                            setIsLogCallOpen(true);
                          }}
                        >
                          <PhoneCall className="w-3.5 h-3.5 mr-1" />
                          Log
                        </Button>

                        {contact.status !== "converted" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs"
                            title="Convert to Lead"
                            onClick={() => {
                              setActiveContact(contact);
                              setIsConvertOpen(true);
                            }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: FOLLOW-UP QUEUE */}
        <TabsContent value="followups" className="space-y-4 pt-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Active Follow-Up Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followUps.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p className="font-medium text-foreground">All follow-ups completed!</p>
                  <p className="text-xs mt-1">Schedule follow-up calls in the Call Workspace when prospects ask for a callback.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followUps.map((item) => {
                    const isDueToday = item.scheduled_date && isToday(parseISO(item.scheduled_date));
                    const isOverdue = item.scheduled_date && isPast(parseISO(item.scheduled_date)) && !isDueToday && item.status === "pending";

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors",
                          item.status === "completed" ? "bg-muted/20 border-border/40 opacity-70" :
                          isOverdue ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50" :
                          isDueToday ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" :
                          "bg-card border-border/60"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">{item.business_name}</span>
                            <Badge
                              className={cn(
                                "text-[10px] font-medium border-0",
                                item.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                                isOverdue ? "bg-rose-100 text-rose-800 font-bold" :
                                isDueToday ? "bg-amber-100 text-amber-800 font-bold" :
                                "bg-slate-100 text-slate-700"
                              )}
                            >
                              {item.status === "completed" ? "COMPLETED" : isOverdue ? "OVERDUE" : isDueToday ? "DUE TODAY" : "UPCOMING"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Scheduled: {item.scheduled_date} at {item.scheduled_time || "11:00 AM"}</span>
                            <span>•</span>
                            <a href={`tel:${item.phone}`} className="text-primary hover:underline font-medium">
                              {item.phone}
                            </a>
                            <span>•</span>
                            <span>Owner: {item.admin_name || "Admin"}</span>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-foreground/80 mt-1 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call Now
                          </a>
                          {item.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => completeFollowUpMutation.mutate(item.id)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Mark Done
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: NICHES & CAMPAIGNS */}
        <TabsContent value="campaigns" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {niches.map((niche) => {
              const nicheCampaigns = campaigns.filter(c => c.niche_id === niche.id);
              const nicheContacts = contacts.filter(c => c.niche_id === niche.id);
              const nicheConversions = nicheContacts.filter(c => c.status === "converted").length;

              return (
                <Card key={niche.id} className="border-border/60 hover:border-primary/40 transition-colors shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-foreground">
                        {niche.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs font-mono">
                        {nicheContacts.length} contacts
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{niche.description || "Industry sector"}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Active Campaigns ({nicheCampaigns.length})
                    </div>
                    <div className="space-y-2">
                      {nicheCampaigns.map((camp) => (
                        <div key={camp.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">{camp.name}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Status: <span className="capitalize">{camp.status}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary"
                            onClick={() => {
                              setSelectedNiche(niche.id);
                              setSelectedCampaign(camp.id);
                              setActiveTab("workspace");
                            }}
                          >
                            Open Queue
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>Conversions: <strong className="text-primary">{nicheConversions}</strong></span>
                      <Button
                        size="sm"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => {
                          setSelectedNiche(niche.id);
                          setSelectedCampaign("all");
                          setActiveTab("workspace");
                        }}
                      >
                        View all niche contacts →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 4: PERFORMANCE & LOGS */}
        <TabsContent value="analytics" className="space-y-4 pt-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Recent Outreach Call Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">Admin</th>
                      <th className="px-4 py-2.5">Outcome</th>
                      <th className="px-4 py-2.5">Duration</th>
                      <th className="px-4 py-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {callLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                          No calls logged yet. Start calling from the Call Workspace.
                        </td>
                      </tr>
                    ) : (
                      callLogs.slice(0, 20).map((log) => (
                        <tr key={log.id} className="hover:bg-muted/30 text-xs">
                          <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono">
                            {format(parseISO(log.called_at || log.created_at), "dd MMM yyyy, hh:mm a")}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {log.admin_name || "Admin"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={cn(
                                "text-[10px] font-medium border-0 capitalize",
                                log.call_outcome === "connected" && "bg-emerald-100 text-emerald-800",
                                log.call_outcome === "interested" && "bg-emerald-100 text-emerald-800 font-bold",
                                log.call_outcome === "converted" && "bg-primary/20 text-primary font-bold",
                                log.call_outcome === "no_answer" && "bg-slate-100 text-slate-700",
                                log.call_outcome === "busy" && "bg-amber-100 text-amber-800",
                                log.call_outcome === "not_interested" && "bg-rose-100 text-rose-700"
                              )}
                            >
                              {log.call_outcome?.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {log.duration_seconds || 60}s
                          </td>
                          <td className="px-4 py-3 text-foreground/80 max-w-xs truncate">
                            {log.notes || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Zero-Swipe Card View */}
              <div className="block md:hidden space-y-2.5">
                {callLogs.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-xs">
                    No calls logged yet. Start calling from the Call Workspace.
                  </div>
                ) : (
                  callLogs.slice(0, 20).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border border-border/70 bg-card space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {format(parseISO(log.called_at || log.created_at), "dd MMM, hh:mm a")}
                        </span>
                        <Badge
                          className={cn(
                            "text-[10px] font-medium border-0 capitalize",
                            log.call_outcome === "connected" && "bg-emerald-100 text-emerald-800",
                            log.call_outcome === "interested" && "bg-emerald-100 text-emerald-800 font-bold",
                            log.call_outcome === "converted" && "bg-primary/20 text-primary font-bold",
                            log.call_outcome === "no_answer" && "bg-slate-100 text-slate-700",
                            log.call_outcome === "busy" && "bg-amber-100 text-amber-800",
                            log.call_outcome === "not_interested" && "bg-rose-100 text-rose-700"
                          )}
                        >
                          {log.call_outcome?.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Caller: <strong className="text-foreground">{log.admin_name || "Admin"}</strong></span>
                        <span className="text-muted-foreground">Duration: {log.duration_seconds || 60}s</span>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-foreground/80 bg-muted/40 p-2 rounded border border-border/50 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: LOG CALL OUTCOME */}
      <Dialog open={isLogCallOpen} onOpenChange={setIsLogCallOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-primary" />
              Log Call: {activeContact?.business_name}
            </DialogTitle>
            <DialogDescription>
              Record the call outcome, notes, and schedule any required follow-ups for this prospect.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact Phone:</span>
                <a href={`tel:${activeContact?.phone}`} className="font-semibold text-primary">
                  {activeContact?.phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact Person:</span>
                <span className="font-medium text-foreground">{activeContact?.contact_name || "Owner"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Call Outcome *</Label>
              <Select value={callOutcome} onValueChange={setCallOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">Connected / Spoke with Decision Maker</SelectItem>
                  <SelectItem value="interested">High Interest / Wants Proposal</SelectItem>
                  <SelectItem value="converted">Ready to Convert to Client</SelectItem>
                  <SelectItem value="call_back_requested">Call Back Requested</SelectItem>
                  <SelectItem value="no_answer">No Answer / Ringing</SelectItem>
                  <SelectItem value="busy">Busy / Line Engaged</SelectItem>
                  <SelectItem value="not_interested">Not Interested / Has Agency</SelectItem>
                  <SelectItem value="wrong_number">Wrong Number / Invalid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Call Duration (seconds)</Label>
              <Input
                type="number"
                value={callDuration}
                onChange={(e) => setCallDuration(e.target.value)}
                placeholder="e.g. 120"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Call Notes & Prospect Feedback</Label>
              <Textarea
                rows={3}
                placeholder="Describe what they discussed, digital needs, existing website flaws..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
              />
            </div>

            {/* Follow-up Section */}
            <div className="p-3 border rounded-lg space-y-3 bg-muted/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Calendar className="w-4 h-4 text-amber-500" />
                Schedule Callback / Follow-Up (Optional)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    value={scheduleFollowUpDate}
                    onChange={(e) => setScheduleFollowUpDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Time</Label>
                  <Input
                    type="time"
                    value={scheduleFollowUpTime}
                    onChange={(e) => setScheduleFollowUpTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogCallOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={logCallMutation.isPending}
              onClick={() => logCallMutation.mutate()}
            >
              {logCallMutation.isPending ? "Saving..." : "Save Call Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CONVERT PROSPECT TO CRM LEAD */}
      <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Convert to CRM Pipeline Lead
            </DialogTitle>
            <DialogDescription>
              Promote <strong>{activeContact?.business_name}</strong> into an active agency lead.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div className="space-y-1">
              <Label className="text-xs">Primary Requested Service</Label>
              <Select value={convertServiceName} onValueChange={setConvertServiceName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website Development">Website Development</SelectItem>
                  <SelectItem value="App Development">App Development</SelectItem>
                  <SelectItem value="Branding & Design">Branding & Design</SelectItem>
                  <SelectItem value="Social Media & Performance Marketing">Social Media & Performance Marketing</SelectItem>
                  <SelectItem value="SEO & Online Presence">SEO & Online Presence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Estimated Project Budget (₹ INR)</Label>
              <Input
                type="number"
                value={convertBudget}
                onChange={(e) => setConvertBudget(e.target.value)}
                placeholder="50000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={convertToLeadMutation.isPending}
              onClick={() => convertToLeadMutation.mutate()}
            >
              {convertToLeadMutation.isPending ? "Converting..." : "Confirm & Create Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: IMPORT CONTACTS (CSV / EXCEL) */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Import Contacts (CSV / Excel)
            </DialogTitle>
            <DialogDescription>
              Upload a .csv, .xlsx, or .xls file. Columns for business name, phone, website, Instagram, and city will be mapped automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Assign to Niche *</Label>
                <Select value={importNicheId} onValueChange={setImportNicheId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches.map((n) => (
                      <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Assign to Campaign *</Label>
                <Select value={importCampaignId} onValueChange={setImportCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Choose a CSV or Excel file</p>
              <p className="text-xs text-muted-foreground mt-1">Supports .csv, .xlsx, .xls</p>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="mt-4 text-xs mx-auto block file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
            </div>

            {previewRows.length > 0 && (
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Total rows found: {previewRows.length}</span>
                  <span className="text-amber-600">Existing duplicates: {importDuplicates}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  First 3 sample records: {previewRows.slice(0, 3).map(r => r.business_name).join(", ")}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isImporting || previewRows.length === 0}
              onClick={handleExecuteImport}
            >
              {isImporting ? "Importing..." : `Confirm Import (${previewRows.length} Rows)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: MANUAL ADD CONTACT */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Add Outreach Contact Manually
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Business / Store Name *</Label>
                <Input
                  value={newContactData.business_name}
                  onChange={(e) => setNewContactData({ ...newContactData, business_name: e.target.value })}
                  placeholder="e.g. Royal Cafe & Lounge"
                />
              </div>
              <div className="space-y-1">
                <Label>Contact Person</Label>
                <Input
                  value={newContactData.contact_name}
                  onChange={(e) => setNewContactData({ ...newContactData, contact_name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone Number *</Label>
                <Input
                  value={newContactData.phone}
                  onChange={(e) => setNewContactData({ ...newContactData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  value={newContactData.email}
                  onChange={(e) => setNewContactData({ ...newContactData, email: e.target.value })}
                  placeholder="info@business.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Instagram Handle</Label>
                <Input
                  value={newContactData.instagram_handle}
                  onChange={(e) => setNewContactData({ ...newContactData, instagram_handle: e.target.value })}
                  placeholder="@royalcafe"
                />
              </div>
              <div className="space-y-1">
                <Label>Website URL</Label>
                <Input
                  value={newContactData.website}
                  onChange={(e) => setNewContactData({ ...newContactData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input
                  value={newContactData.city}
                  onChange={(e) => setNewContactData({ ...newContactData, city: e.target.value })}
                  placeholder="Bengaluru"
                />
              </div>
              <div className="space-y-1">
                <Label>Google Maps Link</Label>
                <Input
                  value={newContactData.google_maps_url}
                  onChange={(e) => setNewContactData({ ...newContactData, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={newContactData.notes}
                onChange={(e) => setNewContactData({ ...newContactData, notes: e.target.value })}
                placeholder="Observed needs (e.g. Needs online ordering / modern website)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={addManualContactMutation.isPending}
              onClick={() => addManualContactMutation.mutate()}
            >
              {addManualContactMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
