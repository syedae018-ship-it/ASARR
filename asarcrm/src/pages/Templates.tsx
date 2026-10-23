import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Edit, FileText, FileCheck, Mail, MessageSquare } from "lucide-react";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, writeBatch } from "@/lib/database";

interface Template {
    id: string;
    title: string;
    type: 'agreement' | 'contract' | 'onboarding' | 'welcome' | 'proposal';
    content: string;
    created_at: string;
}

const TEMPLATE_TYPES = [
    { value: 'proposal', label: 'Proposal', icon: FileText },
    { value: 'agreement', label: 'Agreement', icon: FileCheck },
    { value: 'contract', label: 'Contract', icon: FileCheck },
    { value: 'onboarding', label: 'Onboarding Message', icon: MessageSquare },
    { value: 'welcome', label: 'Welcome Message', icon: Mail },
];

export default function Templates() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState<{ title: string, type: string, content: string }>({
        title: '',
        type: 'proposal',
        content: ''
    });

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ["templates", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const q = query(
                collection(db, "templates"),
                where("user_id", "==", user.id),
                orderBy("created_at", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Template[];
        },
        enabled: !!user,
    });

    const createTemplate = useMutation({
        mutationFn: async () => {
            await addDoc(collection(db, "templates"), {
                user_id: user!.id,
                title: newTemplate.title,
                type: newTemplate.type,
                content: newTemplate.content,
                created_at: new Date().toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            toast.success("Template created successfully");
            setIsEditorOpen(false);
            setNewTemplate({ title: '', type: 'proposal', content: '' });
        },
        onError: (err) => {
            toast.error("Failed to create template");
            console.error(err);
        }
    });

    const updateTemplate = useMutation({
        mutationFn: async () => {
            if (!selectedTemplate) return;
            await updateDoc(doc(db, "templates", selectedTemplate.id), {
                title: newTemplate.title,
                type: newTemplate.type,
                content: newTemplate.content,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            toast.success("Template updated successfully");
            setIsEditorOpen(false);
            setSelectedTemplate(null);
            setNewTemplate({ title: '', type: 'proposal', content: '' });
        },
        onError: (err) => {
            toast.error("Failed to update template");
            console.error(err);
        }
    });

    const deleteTemplate = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, "templates", id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            toast.success("Template deleted");
        }
    });

    const seedDefaults = useMutation({
        mutationFn: async () => {
            const defaults = [
                {
                    title: "Standard Agreement",
                    type: "agreement",
                    content: "This AGREEMENT is made between [Provider Name] and [Client Name]...\n\n1. SCOPE OF WORK\n...\n2. PAYMENT TERMS\n..."
                },
                {
                    title: "Web Design Proposal",
                    type: "proposal",
                    content: "Dear [Client Name],\n\nWe are pleased to present this proposal for your website redesign...\n\n---\nTimeline: 4 Weeks\nTotal Investment: $5,000"
                },
                {
                    title: "Welcome Email",
                    type: "welcome",
                    content: "Hi [Name],\n\nWelcome aboard! We are thrilled to have you as a client. Here is what to expect next..."
                }
            ];

            const batch = writeBatch(db);
            defaults.forEach(d => {
                const docRef = doc(collection(db, "templates"));
                batch.set(docRef, { ...d, user_id: user!.id, created_at: new Date().toISOString() });
            });
            await batch.commit();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            toast.success("Default templates added");
        },
        onError: (err) => {
            toast.error("Failed to seed templates");
            console.error(err);
        }
    });


    const handleEdit = (template: Template) => {
        setSelectedTemplate(template);
        setNewTemplate({
            title: template.title,
            type: template.type,
            content: template.content
        });
        setIsEditorOpen(true);
    };

    const handleCreate = () => {
        setSelectedTemplate(null);
        setNewTemplate({ title: '', type: 'proposal', content: '' });
        setIsEditorOpen(true);
    }

    if (isLoading) {
        return (
            <div className="p-4 md:p-8">
                <PageHeader title="Templates" description="Manage your document and message templates." />
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Templates"
                description="Manage your document and message templates."
                action={
                    <div className="flex gap-2">
                        {templates.length === 0 && (
                            <Button variant="outline" onClick={() => seedDefaults.mutate()} disabled={seedDefaults.isPending} className="gap-2">
                                <FileCheck className="w-4 h-4" />
                                Generate Defaults
                            </Button>
                        )}
                        <Button onClick={handleCreate} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Template
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {templates.map((template) => {
                    const typeConfig = TEMPLATE_TYPES.find(t => t.value === template.type) || TEMPLATE_TYPES[0];
                    const Icon = typeConfig.icon;
                    return (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                                        <Icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{typeConfig.label}</div>
                                </div>
                                <CardTitle className="line-clamp-1">{template.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="line-clamp-3 text-xs bg-muted/50 p-2 rounded">
                                    {template.content}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteTemplate.mutate(template.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                        No templates created yet. Click "Create Template" to get started.
                    </div>
                )}
            </div>

            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Template Title</Label>
                                <Input
                                    value={newTemplate.title}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                                    placeholder="e.g. Standard Proposal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={newTemplate.type}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                                >
                                    {TEMPLATE_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <div className="text-xs text-muted-foreground mb-1">
                                Use this content in your proposals or messages.
                            </div>
                            <Textarea
                                value={newTemplate.content}
                                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                                className="min-h-[300px] font-mono text-sm"
                                placeholder="Type your template content here..."
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => selectedTemplate ? updateTemplate.mutate() : createTemplate.mutate()}
                            disabled={createTemplate.isPending || updateTemplate.isPending}
                        >
                            {createTemplate.isPending || updateTemplate.isPending ? 'Saving...' : 'Save Template'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
