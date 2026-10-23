import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Send, FileText, Printer, CreditCard, Upload, Palette } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, getDoc, doc } from "@/lib/database";

interface LineItem {
  id: string;
  description: string;
  price: number;
}

interface ProposalGeneratorProps {
  lead?: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
  } | null;
  client?: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalGenerator({ lead, client, open, onOpenChange }: ProposalGeneratorProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Consultation', price: 0 }
  ]);
  const [title, setTitle] = useState('Project Proposal');
  const [introduction, setIntroduction] = useState('Thank you for the opportunity to submit this proposal. We are excited about the possibility of working with you.');
  const [selectedTemplate, setSelectedTemplate] = useState<string>("default");
  const [paymentLink, setPaymentLink] = useState("");

  // Customization State
  const [customPrimaryColor, setCustomPrimaryColor] = useState("");
  const [customSecondaryColor, setCustomSecondaryColor] = useState("");
  const [customLogo, setCustomLogo] = useState("");

  const recipient = lead || client;

  // Fetch brand settings & templates
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const docRef = doc(db, 'profiles', user.id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    },
    enabled: !!user,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, 'templates'),
        where('user_id', '==', user.id),
        where('type', '==', 'proposal'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    },
    enabled: !!user,
  });

  // Effective branding
  const primaryColor = customPrimaryColor || profile?.primary_color || '#000000';
  const secondaryColor = customSecondaryColor || profile?.secondary_color || '#333333';
  const logoUrl = customLogo || profile?.logo_url;

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setIntroduction(template.content);
      setTitle(template.title);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleSend = async () => {
    try {
      if (!user?.id || !recipient?.email) {
        throw new Error("A recipient email is required.");
      }

      await addDoc(collection(db, 'proposals'), {
        user_id: user.id,
        lead_id: lead?.id || null,
        client_id: client?.id || null,
        recipient_email: recipient.email,
        title,
        introduction,
        line_items: items,
        total,
        payment_link: paymentLink || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        status: 'sent',
        created_at: new Date().toISOString(),
      });

      if (client) {
        await addDoc(collection(db, 'client_activity'), {
          user_id: user!.id,
          client_id: client.id,
          activity_type: 'proposal_sent',
          description: `Sent proposal: ${title} ($${total})`,
          created_at: new Date().toISOString()
        });
      }

      const emailBody = [
        introduction,
        '',
        `Proposal total: $${total.toLocaleString()}`,
        paymentLink ? `Payment link: ${paymentLink}` : '',
        '',
        'Please reply to this email if you would like to approve or discuss the proposal.',
      ].filter(Boolean).join('\n');

      window.location.href = `mailto:${encodeURIComponent(recipient.email)}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(emailBody)}`;
      toast.success(`Proposal saved. Opening your email app for ${recipient.email}.`);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send proposal");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-md overflow-hidden">
        <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Proposal Generator
            </DialogTitle>
            <div className="h-6 w-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              {/* Color Pickers in Header */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                    <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: primaryColor }} />
                    Brand Colors
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={primaryColor} onChange={(e) => setCustomPrimaryColor(e.target.value)} className="w-10 h-10 p-1 cursor-pointer" />
                      <Input value={primaryColor} onChange={(e) => setCustomPrimaryColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={secondaryColor} onChange={(e) => setCustomSecondaryColor(e.target.value)} className="w-10 h-10 p-1 cursor-pointer" />
                      <Input value={secondaryColor} onChange={(e) => setCustomSecondaryColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setCustomPrimaryColor(""); setCustomSecondaryColor(""); }}>Reset to Default</Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {templates.length > 0 && (
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Load Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 h-9">
              <Printer className="w-4 h-4" />
              Print PDF
            </Button>
            <Button onClick={handleSend} size="sm" className="gap-2 h-9">
              <Send className="w-4 h-4" />
              Save & Email
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor Side */}
          <div className="w-[400px] border-r bg-muted/30 flex flex-col shrink-0 text-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

              <div className="space-y-4">
                <h3 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Proposal Details</h3>
                <div className="space-y-2">
                  <Label>Proposal Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label>Introduction / Cover Letter</Label>
                  <Textarea
                    value={introduction}
                    onChange={e => setIntroduction(e.target.value)}
                    rows={6}
                    className="resize-none bg-background leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Financials</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Line Items</Label>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr,100px,32px] gap-2 items-start">
                        <Input
                          className="h-8 text-sm bg-background"
                          placeholder="Description"
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                        />
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            className="h-8 pl-5 text-sm bg-background text-right"
                            placeholder="0"
                            value={item.price}
                            onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value))}
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-2 border-dashed">
                    <Plus className="w-4 h-4" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Stripe Payment Link (Optional)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 bg-background"
                      placeholder="https://buy.stripe.com/..."
                      value={paymentLink}
                      onChange={e => setPaymentLink(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Visual Customization</h3>
                <div className="space-y-2">
                  <Label>Logo Override</Label>
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain border rounded bg-white p-1" />
                    ) : (
                      <div className="w-10 h-10 border border-dashed rounded flex items-center justify-center bg-muted/50">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                      Upload Custom Logo
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                  {customLogo && <Button variant="ghost" size="sm" onClick={() => setCustomLogo("")} className="text-xs h-6 px-0 text-red-500 hover:text-red-700 hover:bg-transparent">Remove custom logo</Button>}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-background shrink-0">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Total Amount:</span>
                <span className="text-xl" style={{ color: primaryColor }}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="flex-1 bg-zinc-100/50 items-start justify-center p-8 overflow-y-auto print-container text-black custom-scrollbar">
            <div
              className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-xl rounded-sm p-12 relative flex flex-col items-start gap-8 print:shadow-none print:m-0 print:w-full transition-transform origin-top duration-300"
              style={{
                // Dynamic branding colors
                '--primary': primaryColor,
                '--secondary': secondaryColor,
              } as React.CSSProperties}
            >
              {/* Header */}
              <div className="w-full flex justify-between items-start border-b pb-8" style={{ borderColor: primaryColor }}>
                <div>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain mb-6" />
                  ) : (
                    <h1 className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>{profile?.company_name || 'AGENCY NAME'}</h1>
                  )}
                  <div className="text-sm text-gray-500 space-y-1">
                    <h3 className="font-bold text-gray-900">{profile?.company_name}</h3>
                    {profile?.company_email && <p>{profile.company_email}</p>}
                    {profile?.company_phone && <p>{profile.company_phone}</p>}
                    {profile?.company_website && <p>{profile.company_website}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-5xl font-light text-gray-200 uppercase tracking-widest">Proposal</h2>
                  <div className="mt-8 space-y-1 text-sm">
                    <p className="font-semibold text-gray-900">Date Issued:</p>
                    <p className="text-gray-500">{format(new Date(), "MMMM dd, yyyy")}</p>
                  </div>
                  <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg min-w-[250px] border-l-4" style={{ borderColor: primaryColor }}>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Prepared For:</p>
                    <p className="font-bold text-lg text-gray-900">{recipient?.name}</p>
                    {recipient?.company && <p className="text-gray-600 font-medium">{recipient.company}</p>}
                    <p className="text-gray-500 text-sm mt-1">{recipient?.email}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full flex-1 space-y-10">
                <div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: secondaryColor }}>{title}</h3>
                  <div className="text-gray-600 leading-7 whitespace-pre-wrap text-justify">
                    {introduction}
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="py-4 px-6 text-gray-800">{item.description || "Item description"}</td>
                          <td className="py-4 px-6 text-right text-gray-800 font-medium">
                            ${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="py-6 px-6 text-right font-bold text-gray-900">Total Estimate</td>
                        <td className="py-6 px-6 text-right font-bold text-2xl" style={{ color: primaryColor }}>
                          ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {paymentLink && (
                  <div className="bg-green-50 border border-green-100 p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-green-900">Ready to proceed?</h4>
                      <p className="text-green-700 text-sm">Click the button to make a secure payment.</p>
                    </div>
                    <Button asChild className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                      <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                        Pay Now ${total.toLocaleString()}
                      </a>
                    </Button>
                  </div>
                )}


                {profile?.terms_and_conditions && (
                  <div className="mt-12 pt-8 border-t border-gray-100 page-break-inside-avoid">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Terms & Conditions</h4>
                    <div className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed columns-2 gap-8">
                      {profile.terms_and_conditions}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="w-full pt-8 border-t text-center text-sm text-gray-400">
                <p>Thank you for your business!</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
