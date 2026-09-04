import { useEffect, useState } from "react";
import { Loader2, MapPin, Pencil, Trash2, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Address = {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

const blank = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "Jamshedpur",
  state: "Jharkhand",
  pincode: "",
  is_default: false,
};

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("addresses")
      .select("id, full_name, phone, line1, line2, city, state, pincode, is_default")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (err) setError("Could not load your addresses.");
    else {
      setError(null);
      setAddresses((data ?? []) as Address[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { addresses, loading, error, reload: load };
}

export function AddressManager({
  selectedId,
  onSelect,
}: {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { user } = useAuth();
  const { addresses, loading, error, reload } = useAddresses();
  const [form, setForm] = useState<typeof blank | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form) return;
    setBusy(true);
    const payload = { ...form, line2: form.line2 || null, user_id: user.id };
    const res = editId
      ? await supabase.from("addresses").update(payload).eq("id", editId)
      : await supabase.from("addresses").insert(payload);
    setBusy(false);
    if (res.error) {
      toast.error("Could not save the address. Please check the fields.");
      return;
    }
    toast.success(editId ? "Address updated" : "Address added");
    setForm(null);
    setEditId(null);
    await reload();
  };

  const del = async (id: string) => {
    const { error: err } = await supabase.from("addresses").delete().eq("id", id);
    if (err) toast.error("Could not delete the address.");
    else {
      toast.success("Address removed");
      await reload();
    }
  };

  const makeDefault = async (id: string) => {
    const { error: err } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    if (err) toast.error("Could not set default address.");
    else await reload();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-[12px] text-muted-foreground">
        <Loader2 size={14} className="animate-spin" /> Loading addresses…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-[12px] text-muted-foreground">
          {error}{" "}
          <button onClick={reload} className="font-semibold text-primary">
            Retry
          </button>
        </div>
      )}

      {addresses.length === 0 && !error && (
        <p className="text-[12px] text-muted-foreground">No saved addresses yet.</p>
      )}

      {addresses.map((a) => {
        const selected = selectedId === a.id;
        return (
          <div
            key={a.id}
            className={`card-surface p-2.5 ${selected ? "border-primary ring-1 ring-primary" : ""}`}
          >
            <div className="flex items-start gap-2">
              {onSelect && (
                <button
                  onClick={() => onSelect(a.id)}
                  aria-label="Select address"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary" : "border-border"}`}
                >
                  {selected && <Check size={10} className="text-primary-foreground" />}
                </button>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-foreground">
                  {a.full_name}
                  {a.is_default && (
                    <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                      DEFAULT
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} — {a.pincode}
                </p>
                <p className="text-[11px] text-muted-foreground">Phone: {a.phone}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px]">
                  <button
                    onClick={() => {
                      setEditId(a.id);
                      setForm({ ...a, line2: a.line2 ?? "" });
                    }}
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button onClick={() => del(a.id)} className="flex items-center gap-1 text-muted-foreground">
                    <Trash2 size={11} /> Delete
                  </button>
                  {!a.is_default && (
                    <button onClick={() => makeDefault(a.id)} className="font-semibold text-primary">
                      Set default
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {form ? (
        <form onSubmit={save} className="card-surface space-y-2 p-2.5">
          <p className="text-[13px] font-bold text-foreground">{editId ? "Edit address" : "New address"}</p>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Full name" value={form.full_name} set={(v) => setForm({ ...form, full_name: v })} required />
            <Input label="Phone" value={form.phone} set={(v) => setForm({ ...form, phone: v })} required />
          </div>
          <Input label="House / Flat, Street" value={form.line1} set={(v) => setForm({ ...form, line1: v })} required />
          <Input label="Landmark (optional)" value={form.line2} set={(v) => setForm({ ...form, line2: v })} />
          <div className="grid grid-cols-3 gap-2">
            <Input label="City" value={form.city} set={(v) => setForm({ ...form, city: v })} required />
            <Input label="State" value={form.state} set={(v) => setForm({ ...form, state: v })} required />
            <Input label="Pincode" value={form.pincode} set={(v) => setForm({ ...form, pincode: v })} required />
          </div>
          <label className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            />
            Set as default address
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-strong text-[12.5px] font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 size={13} className="animate-spin" />} Save address
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setEditId(null);
              }}
              className="h-9 rounded-lg border border-border px-3 text-[12.5px] font-semibold text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setEditId(null);
            setForm({ ...blank });
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-[12.5px] font-semibold text-primary"
        >
          <Plus size={14} /> Add new address
        </button>
      )}

      {addresses.length > 0 && (
        <p className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
          <MapPin size={11} className="text-primary" /> Delivery available across Jamshedpur
        </p>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  set,
  required,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(e) => set(e.target.value)}
        className="mt-0.5 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-[12.5px] text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}
