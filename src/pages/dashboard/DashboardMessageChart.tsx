import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const messageChartData = [
  { name: 'Lun', messages: 120 },
  { name: 'Mar', messages: 210 },
  { name: 'Mer', messages: 180 },
  { name: 'Jeu', messages: 340 },
  { name: 'Ven', messages: 280 },
  { name: 'Sam', messages: 150 },
  { name: 'Dim', messages: 190 },
];

export function DashboardMessageChart() {
  return (
    <div className="bg-[#0f0f0f] border border-zinc-800/50 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Volume de messages</h3>
          <p className="text-xs text-zinc-500">Activité sur les 7 derniers jours</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Messages reçus
          </span>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={messageChartData}>
            <defs>
              <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
            <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #27272a', borderRadius: '8px' }}
              itemStyle={{ color: '#f97316', fontSize: '12px' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="messages" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorMsg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
