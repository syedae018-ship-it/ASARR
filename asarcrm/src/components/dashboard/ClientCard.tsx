import { Building2, Mail, Phone } from "lucide-react";

interface ClientCardProps {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectCount: number;
  delay?: number;
}

export function ClientCard({ name, company, email, phone, projectCount, delay = 0 }: ClientCardProps) {
  return (
    <div 
      className="glass rounded-xl p-5 hover-lift animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-lg font-semibold text-primary">
            {name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{company}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-semibold text-foreground">{projectCount}</span>
          <p className="text-xs text-muted-foreground">Projects</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{phone}</span>
        </div>
      </div>
    </div>
  );
}
