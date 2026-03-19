import { Link } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { ROUTES } from '../../lib/constants';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from 'lucide-react';

const stats = [
  {
    label: 'Receita Total',
    value: 'R$ 24.890',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    iconBg: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    label: 'Pedidos',
    value: '148',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ShoppingCart,
    iconBg: 'bg-amber-500/10 text-amber-500',
  },
  {
    label: 'Produtos Ativos',
    value: '67',
    change: '+3',
    trend: 'up' as const,
    icon: Package,
    iconBg: 'bg-blue-500/10 text-blue-400',
  },
  {
    label: 'Clientes',
    value: '1.204',
    change: '-2.1%',
    trend: 'down' as const,
    icon: Users,
    iconBg: 'bg-purple-500/10 text-purple-400',
  },
];

const recentOrders = [
  { id: 1042, customer: 'Maria Silva', total: 'R$ 259,90', status: 'Ativo', date: '18/03' },
  { id: 1041, customer: 'Joao Santos', total: 'R$ 89,90', status: 'Recebido', date: '18/03' },
  { id: 1040, customer: 'Ana Oliveira', total: 'R$ 450,00', status: 'Finalizado', date: '17/03' },
  { id: 1039, customer: 'Carlos Lima', total: 'R$ 129,90', status: 'Suspenso', date: '17/03' },
  { id: 1038, customer: 'Lucia Ferreira', total: 'R$ 320,00', status: 'Ativo', date: '16/03' },
];

const topProducts = [
  { name: 'Plano Premium Mensal', sales: 42, revenue: 'R$ 8.358' },
  { name: 'Plano Basico Anual', sales: 28, revenue: 'R$ 5.572' },
  { name: 'Consultoria Individual', sales: 19, revenue: 'R$ 3.781' },
  { name: 'Curso Avancado', sales: 15, revenue: 'R$ 2.985' },
];

const statusStyles: Record<string, string> = {
  Ativo: 'text-emerald-400',
  Recebido: 'text-amber-400',
  Finalizado: 'text-muted-foreground',
  Suspenso: 'text-red-400',
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl text-foreground tracking-tight">
          Bem-vindo, {user?.name || 'Admin'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumo da sua loja hoje.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glow-hover bg-card rounded-xl p-4 border border-border animate-slide-up"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                <stat.icon className="w-[18px] h-[18px]" />
              </div>
              <span className={`inline-flex items-center text-xs font-medium tabular-nums ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground tabular-nums tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border animate-scale-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-[13px] font-semibold text-foreground tracking-wide uppercase">Pedidos Recentes</h2>
            <Link
              to={ROUTES.ORDERS}
              className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-muted-foreground border-b border-border uppercase tracking-wider">
                  <th className="px-5 py-2.5 font-medium">#</th>
                  <th className="px-5 py-2.5 font-medium">Cliente</th>
                  <th className="px-5 py-2.5 font-medium">Total</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{order.id}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{order.customer}</td>
                    <td className="px-5 py-3 text-foreground tabular-nums">{order.total}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${statusStyles[order.status] || 'text-muted-foreground'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs tabular-nums">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-[13px] font-semibold text-foreground tracking-wide uppercase">Top Produtos</h2>
            <TrendingUp className="w-4 h-4 text-amber-500/60" />
          </div>
          <div className="p-4 space-y-1">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-muted-foreground tabular-nums w-5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.sales} vendas</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-foreground ml-3 shrink-0 tabular-nums">
                  {product.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
