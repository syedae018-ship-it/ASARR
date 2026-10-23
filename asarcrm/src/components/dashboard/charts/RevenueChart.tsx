import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, subMonths } from 'date-fns';

interface RevenueChartProps {
  invoices: Array<{ amount?: number; status?: string; paid_date?: string | null; created_at?: string }>;
}

export function RevenueChart({ invoices }: RevenueChartProps) {
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, index) => {
    const month = startOfMonth(subMonths(now, 5 - index));
    const key = format(month, 'yyyy-MM');
    const revenue = invoices
      .filter((invoice) => {
        const date = invoice.paid_date || invoice.created_at;
        return invoice.status === 'paid' && date?.slice(0, 7) === key;
      })
      .reduce((total, invoice) => total + Number(invoice.amount || 0), 0);

    return { month: format(month, 'MMM'), revenue };
  });

  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-1">Revenue trends</h3>
      <p className="text-sm text-muted-foreground mb-6">Paid invoices over the last six months</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--border))', borderRadius: '10px', color: 'hsl(var(--foreground))' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
