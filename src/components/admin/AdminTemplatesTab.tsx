import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminTemplates, updateTemplatePrice, toggleTemplateFree, toggleTemplateActive, createTemplate } from '@/api/admin';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const AdminTemplatesTab = () => {
  const qc = useQueryClient();
  const { data: templates, isLoading } = useQuery({ queryKey: ['admin-templates'], queryFn: getAdminTemplates });
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '', slug: '', description: '', priceInr: 0, priceUsd: 0, priceEur: 0,
    themeKey: '', isFree: false, isPremium: false, sortOrder: 0, formSchema: ''
  });

  const priceMut = useMutation({
    mutationFn: ({ id, prices }: any) => updateTemplatePrice(id, prices),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-templates'] }); toast.success('Price updated'); setEditingPrice(null); },
    onError: () => toast.error('Failed to update price'),
  });

  const freeMut = useMutation({
    mutationFn: ({ id, isFree }: any) => toggleTemplateFree(id, isFree),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-templates'] }); toast.success('Updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const activeMut = useMutation({
    mutationFn: ({ id, isActive }: any) => toggleTemplateActive(id, isActive),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-templates'] }); toast.success('Updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const createMut = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-templates'] }); toast.success('Template created'); setCreating(false); },
    onError: () => toast.error('Failed to create template'),
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-lg font-semibold">Templates</h3>
        <button onClick={() => setCreating(true)} className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5">
          <Plus size={14} /> Create New Template
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {['Name', 'Type', 'Price (₹)', 'Free?', 'Active?', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-body font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {templates?.map((t: any) => (
              <tr key={t.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-body font-medium">{t.name}</td>
                <td className="px-4 py-3 font-body text-muted-foreground">{t.category || t.type || '—'}</td>
                <td className="px-4 py-3 font-body">₹{t.priceInr || 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${t.isFree ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                    {t.isFree ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${t.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                    {t.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPrice({ id: t.id, priceInr: t.priceInr || 0, priceUsd: t.priceUsd || 0, priceEur: t.priceEur || 0 })} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors font-body">
                      Edit Price
                    </button>
                    <button onClick={() => freeMut.mutate({ id: t.id, isFree: !t.isFree })} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors font-body">
                      {t.isFree ? 'Make Paid' : 'Make Free'}
                    </button>
                    <button onClick={() => activeMut.mutate({ id: t.id, isActive: t.isActive === false })} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors font-body">
                      {t.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Price Modal */}
      {editingPrice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingPrice(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-heading text-lg font-semibold">Edit Price</h4>
              <button onClick={() => setEditingPrice(null)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            {['priceInr', 'priceUsd', 'priceEur'].map(field => (
              <div key={field} className="mb-3">
                <label className="font-body text-xs text-muted-foreground block mb-1">{field === 'priceInr' ? 'Price (₹ INR)' : field === 'priceUsd' ? 'Price ($ USD)' : 'Price (€ EUR)'}</label>
                <input
                  type="number"
                  value={editingPrice[field]}
                  onChange={e => setEditingPrice({ ...editingPrice, [field]: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
            <button
              onClick={() => priceMut.mutate({ id: editingPrice.id, prices: { priceInr: editingPrice.priceInr, priceUsd: editingPrice.priceUsd, priceEur: editingPrice.priceEur } })}
              className="btn-gold w-full py-2.5 rounded-lg text-sm mt-2"
              disabled={priceMut.isPending}
            >
              {priceMut.isPending ? 'Saving...' : 'Save Price'}
            </button>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-heading text-lg font-semibold">Create Template</h4>
              <button onClick={() => setCreating(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'slug', label: 'Slug', type: 'text' },
                { key: 'description', label: 'Description', type: 'text' },
                { key: 'themeKey', label: 'Theme Key', type: 'text' },
                { key: 'priceInr', label: 'Price (₹)', type: 'number' },
                { key: 'priceUsd', label: 'Price ($)', type: 'number' },
                { key: 'priceEur', label: 'Price (€)', type: 'number' },
                { key: 'sortOrder', label: 'Sort Order', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="font-body text-xs text-muted-foreground block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(newTemplate as any)[f.key]}
                    onChange={e => setNewTemplate({ ...newTemplate, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-body text-sm">
                  <input type="checkbox" checked={newTemplate.isFree} onChange={e => setNewTemplate({ ...newTemplate, isFree: e.target.checked })} className="rounded" /> Free
                </label>
                <label className="flex items-center gap-2 font-body text-sm">
                  <input type="checkbox" checked={newTemplate.isPremium} onChange={e => setNewTemplate({ ...newTemplate, isPremium: e.target.checked })} className="rounded" /> Premium
                </label>
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">Form Schema (JSON)</label>
                <textarea
                  value={newTemplate.formSchema}
                  onChange={e => setNewTemplate({ ...newTemplate, formSchema: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const payload = { ...newTemplate, formSchema: newTemplate.formSchema ? JSON.parse(newTemplate.formSchema) : null };
                createMut.mutate(payload);
              }}
              className="btn-gold w-full py-2.5 rounded-lg text-sm mt-4"
              disabled={createMut.isPending}
            >
              {createMut.isPending ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplatesTab;
