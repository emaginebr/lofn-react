import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';

export default function ReportsPage() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const revenueData = [4200, 5800, 7100, 6200, 8900, 9400, 11200, 10800, 12500, 14200, 13100, 15600];
  const maxRevenue = Math.max(...revenueData);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-3xl text-foreground tracking-tight">Relatorios</h1>
          <p className="text-sm text-muted-foreground mt-1">Analise o desempenho da sua loja</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all">
          <Download className="w-3.5 h-3.5" />
          Exportar
        </button>
      </div>

      {/* Period selector */}
      <div className="flex gap-1.5">
        {['7 dias', '30 dias', '90 dias', '12 meses', 'Personalizado'].map((period, i) => (
          <button
            key={period}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              i === 3
                ? 'bg-amber-500 text-noir-950'
                : 'bg-secondary border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-xl border border-border p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[13px] font-semibold text-foreground tracking-wide uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500/60" />
            Receita Mensal
          </h2>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            2026
          </span>
        </div>
        <div className="flex items-end gap-1.5 h-52">
          {revenueData.map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {(value / 1000).toFixed(1)}k
              </span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 transition-colors cursor-default"
                style={{ height: `${(value / maxRevenue) * 100}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger">
        {[
          { label: 'Ticket Medio', value: 'R$ 168,17', change: '+5.3%', up: true },
          { label: 'Taxa de Conversao', value: '3.2%', change: '+0.4%', up: true },
          { label: 'Clientes Recorrentes', value: '42%', change: '-1.2%', up: false },
        ].map((kpi) => (
          <div key={kpi.label} className="glow-hover bg-card rounded-xl border border-border p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-amber-500/60" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {kpi.change} vs mes anterior
            </p>
          </div>
        ))}
      </div>

      {/* Categories breakdown */}
      <div className="bg-card rounded-xl border border-border p-6 animate-scale-in">
        <h2 className="text-[13px] font-semibold text-foreground tracking-wide uppercase mb-5">Vendas por Categoria</h2>
        <div className="space-y-4">
          {[
            { name: 'Assinaturas', pct: 45, color: 'from-amber-500 to-amber-400' },
            { name: 'Consultorias', pct: 28, color: 'from-purple-500 to-purple-400' },
            { name: 'Cursos', pct: 18, color: 'from-emerald-500 to-emerald-400' },
            { name: 'Outros', pct: 9, color: 'from-noir-400 to-noir-300' },
          ].map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">{cat.name}</span>
                <span className="font-semibold text-foreground tabular-nums">{cat.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
