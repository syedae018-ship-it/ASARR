import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LeadCaptureForm } from "@/components/lead/LeadCaptureForm";
import { Zap } from "lucide-react";
import { db } from "@/lib/database";
import { doc, getDoc } from "@/lib/database";

export default function LeadForm() {
  const { userId } = useParams<{ userId: string }>();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["agency-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Form Not Found</h1>
          <p className="text-muted-foreground">This form doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {profile.company_name || profile.full_name || "Get in Touch"}
              </h1>
              <p className="text-sm text-muted-foreground">Project Inquiry Form</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container max-w-2xl mx-auto px-4 py-12">
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Start Your Project</h2>
            <p className="text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
          <LeadCaptureForm
            agencyUserId={userId}
            leadConfig={(profile as any).lead_form_config}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by Agency OS
        </div>
      </footer>
    </div>
  );
}