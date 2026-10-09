import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────
   🔧 ENDPOINT (base — no /search)
   ───────────────────────────────────────────── */
const PARCEL_ENDPOINT = 'https://sheetdb.io/api/v1/hw2ce8n9rooe3';

/* Column used to locate the row when saving.
   It must be UNIQUE and it must exist in the sheet. */
const KEY_COLUMN = 'tracking_number';

/* ─────────────────────────────────────────────
   DROPDOWN OPTIONS
   ───────────────────────────────────────────── */
const COURIER_OPTIONS = [
  'GIG Logistics',
  'DHL',
  'FedEx',
  'UPS',
  'Kwik',
  'Sendbox',
  'GIGGo',
  'Aramex',
  'TNT',
  'EMS',
  'NIPOST',
  'Other',
];

const STATUS_OPTIONS = [
  'pending',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
];

const DROPDOWNS = {
  courier: COURIER_OPTIONS,
  status: STATUS_OPTIONS,
};

const Home = () => {
  const [original, setOriginal] = useState(null); // the row as fetched
  const [draft, setDraft] = useState({});         // the editable copy
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  /* ---------- READ (single row) ---------- */
  const fetchRow = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(PARCEL_ENDPOINT);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [data];
      const row = list[0];

      if (!row) {
        setOriginal(null);
        setDraft({});
        setError('The sheet has no rows.');
        return;
      }

      setOriginal(row);
      setDraft({ ...row });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRow();
  }, []);

  /* ---------- EDIT ---------- */
  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- UPDATE ---------- */
  const handleUpdate = async () => {
    if (!original) return;

    const keyValue = original[KEY_COLUMN];
    if (!keyValue) {
      setError(`Row has no "${KEY_COLUMN}" — cannot update.`);
      return;
    }

    // Only send changed fields
    const payload = {};
    Object.keys(draft).forEach((k) => {
      if (String(original[k] ?? '') !== String(draft[k] ?? '')) {
        payload[k] = draft[k];
      }
    });

    if (Object.keys(payload).length === 0) {
      setMessage('Nothing changed.');
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const url = `${PARCEL_ENDPOINT}/${KEY_COLUMN}/${encodeURIComponent(keyValue)}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ data: payload }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Update failed ${res.status} ${text}`);
      }

      // Reflect saved values back into local state
      const merged = { ...original, ...payload };
      setOriginal(merged);
      setDraft(merged);
      setMessage('Saved.');
      setTimeout(() => setMessage(null), 2200);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- RESET TO LAST-FETCHED ---------- */
  const handleReset = () => {
    if (original) setDraft({ ...original });
  };

  /* ---------- RENDER ---------- */
  const keys = Object.keys(draft);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <h1 style={styles.title}>Parcel Admin</h1>
        <p style={styles.sub}>
          Single-row editor · reads and updates in place
        </p>

        <div style={styles.toolbar}>
          <button
            onClick={fetchRow}
            disabled={loading}
            style={styles.btnPrimary}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        {!original && !loading && !error && (
          <div style={styles.empty}>No row loaded.</div>
        )}

        {original && (
          <div style={styles.card}>
            {/* HEADER */}
            <div style={styles.cardHead}>
              <strong style={styles.cardTitle}>
                {original[KEY_COLUMN] || 'Row 1'}
              </strong>
              <div style={styles.headActions}>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  style={styles.btnGhost}
                >
                  Reset
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  style={{
                    ...styles.btnSave,
                    opacity: saving ? 0.6 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving…' : 'Update'}
                </button>
              </div>
            </div>

            {/* RAW REFERENCE STRIP */}
            <div style={styles.rawBox}>
              <div style={styles.rawLabel}>Current values</div>
              <div style={styles.rawRow}>
                {keys.map((k) => (
                  <span key={k} style={styles.rawCell}>
                    <span style={styles.rawKey}>{k}</span>
                    <span style={styles.rawVal}>
                      {original[k] === '' || original[k] == null
                        ? '—'
                        : String(original[k])}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* EDIT GRID */}
            <div style={styles.grid}>
              {keys.map((key) => {
                const isKey = key === KEY_COLUMN;
                const options = DROPDOWNS[key];

                return (
                  <label key={key} style={styles.field}>
                    <span style={styles.label}>
                      {key}
                      {isKey && <span style={styles.tag}>key</span>}
                    </span>

                    {options ? (
                      <select
                        style={styles.select}
                        value={draft[key] ?? ''}
                        onChange={(e) => updateField(key, e.target.value)}
                      >
                        <option value="">— select —</option>
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        style={styles.input}
                        value={draft[key] ?? ''}
                        onChange={(e) => updateField(key, e.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- INLINE STYLES ---------- */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#F7F6F3',
    fontFamily: 'Inter, -apple-system, sans-serif',
    padding: '2.5rem 1rem',
    color: '#0E0E10',
  },
  wrap: { maxWidth: 900, margin: '0 auto' },
  title: { fontSize: '1.75rem', margin: 0, letterSpacing: '-0.02em' },
  sub: { color: '#71717A', margin: '0.35rem 0 1.5rem', fontSize: '0.9rem' },
  toolbar: { marginBottom: '1.25rem' },
  btnPrimary: {
    padding: '0.7rem 1.3rem',
    borderRadius: 100,
    background: '#FF5230',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  btnSave: {
    padding: '0.5rem 1.1rem',
    borderRadius: 100,
    background: '#0E0E10',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  btnGhost: {
    padding: '0.5rem 1.1rem',
    borderRadius: 100,
    background: 'transparent',
    color: '#52525B',
    border: '1px solid rgba(0,0,0,0.12)',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  headActions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: 12,
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  success: {
    background: '#dcfce7',
    color: '#166534',
    padding: '0.75rem 1rem',
    borderRadius: 12,
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  empty: {
    background: '#fff',
    padding: '2.5rem 1rem',
    borderRadius: 16,
    textAlign: 'center',
    color: '#71717A',
    fontSize: '0.9rem',
  },
  card: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 15px 40px -30px rgba(0,0,0,0.2)',
  },
  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontFamily: "'SF Mono', Menlo, monospace",
    fontSize: '1rem',
    letterSpacing: '-0.01em',
  },

  rawBox: {
    background: '#FAFAF8',
    border: '1px dashed rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: '0.85rem 1rem',
    marginBottom: '1.25rem',
  },
  rawLabel: {
    fontSize: '0.62rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#A1A1AA',
    marginBottom: '0.5rem',
  },
  rawRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem 1.1rem',
    fontFamily: "'SF Mono', Menlo, monospace",
    fontSize: '0.75rem',
    color: '#52525B',
  },
  rawCell: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '0.3rem',
  },
  rawKey: { color: '#A1A1AA' },
  rawVal: { color: '#0E0E10', fontWeight: 600 },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.85rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#A1A1AA',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  tag: {
    fontSize: '0.55rem',
    fontWeight: 800,
    letterSpacing: '0.1em',
    color: '#FF5230',
    background: 'rgba(255,82,48,0.1)',
    padding: '0.1rem 0.4rem',
    borderRadius: 100,
  },
  input: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    padding: '0.55rem 0.75rem',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#F7F6F3',
    outline: 'none',
  },
  select: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    padding: '0.55rem 2rem 0.55rem 0.75rem',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#F7F6F3',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2352525B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.65rem center',
  },
};

export default Home;