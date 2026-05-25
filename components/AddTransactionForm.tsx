"use client";

import { useEffect, useState, useRef } from "react";
import { X, Plus, Tag } from "lucide-react";
import { getIconForCategory, ICON_PICKER_GROUPS } from "../lib/categoryIcons";
import { useSession } from "next-auth/react";


/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
type Transaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "DEBT" | "COMMITMENT" | "SAVINGS" | "INVESTMENT";
  status: "Completed" | "Pending";
  savingsGoalId?: string | null;
};

type TransactionType =
  | "INCOME"
  | "EXPENSE"
  | "DEBT"
  | "COMMITMENT"
  | "SAVINGS"
  | "INVESTMENT";

type Category = {
  id: string;
  name: string;
  icon: string;
  type: string;
  isDefault: boolean;
  userId?: string | null;
};

type AddTransactionFormProps = {
  onTransactionSaved: () => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
  onShowToast: (message: string, type?: "success" | "error") => void;
  onScrollToTransactions: () => void;
};

type SavingsGoal = { id: string; name: string };

/* ─────────────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 12,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 400,
  paddingLeft: 14,
  paddingRight: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s ease, background 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  marginBottom: 6,
};

const emptyForm: {
  title: string;
  category: string;
  date: string;
  amount: string;
  type: TransactionType;
  status: "Completed" | "Pending";
  savingsGoalId: string;
} = {
  title: "",
  category: "",
  date: "",
  amount: "",
  type: "EXPENSE",
  status: "Completed",
  savingsGoalId: "",
};

/* ─────────────────────────────────────────────────────────────────
   Icon Picker Popover
───────────────────────────────────────────────────────────────── */
function IconPicker({
  onSelect,
  onClose,
}: {
  onSelect: (icon: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        width: 280,
        maxHeight: 320,
        overflowY: "auto",
        background: "rgba(43,30,89,0.97)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 16,
        padding: "12px 14px",
        backdropFilter: "blur(24px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
      }}
    >
      {ICON_PICKER_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 12 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: 6,
            }}
          >
            {group.label}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {group.icons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  onSelect(icon);
                  onClose();
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(232,201,122,0.2)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1)";
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────── */
export default function AddTransactionForm({
  onTransactionSaved,
  editingTransaction,
  onCancelEdit,
  onShowToast,
  onScrollToTransactions,
}: AddTransactionFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  /* Categories from DB */
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  /* Category manager UI */
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [showNewIconPicker, setShowNewIconPicker] = useState(false);

  /* Per-category icon edit picker */
  const [editingIconForId, setEditingIconForId] = useState<string | null>(null);

  /* Filtered by current type */
  const currentCats = categories.filter((c) => c.type === form.type);

  /* ── Load categories from API ── */
  async function fetchCategories() {
    try {
      setCatLoading(true);
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setCatLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ── Add new category ── */
  async function addCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const icon = newCategoryIcon || getIconForCategory(trimmed, form.type);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, type: form.type, icon }),
    });

    if (res.ok) {
      setNewCategoryName("");
      setNewCategoryIcon("");
      fetchCategories();
      onShowToast("Category added!");
    } else if (res.status === 409) {
      onShowToast("Category already exists", "error");
    } else {
      onShowToast("Failed to add category", "error");
    }
  }

  /* ── Update icon for existing category ── */
  async function updateCategoryIcon(id: string, icon: string) {
    await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, icon }),
    });
    setEditingIconForId(null);
    fetchCategories();
  }

  /* ── Delete category ── */
  async function deleteCategory(id: string, name: string) {
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (form.category === name) setForm((p) => ({ ...p, category: "" }));
    fetchCategories();
  }

  /* ── Load editing transaction ── */
  useEffect(() => {
    if (editingTransaction) {
      setForm({
        title: editingTransaction.title,
        category: editingTransaction.category,
        // ✅ FIX: strip to date-only "YYYY-MM-DD" for the date input
        date: editingTransaction.date.split("T")[0],
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        status: editingTransaction.status,
        savingsGoalId: editingTransaction.savingsGoalId ?? "",
      });
    }
  }, [editingTransaction]);

  /* ── Load savings goals ── */
  useEffect(() => {
    fetch("/api/savings-goals")
      .then((r) => r.json())
      .then((d) => setGoals(Array.isArray(d) ? d : d.goals ?? d.data ?? []))
      .catch(() => setGoals([]));
  }, []);

  /* ── Form handlers ── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "savingsGoalId" && value) {
      setForm((p) => ({
        ...p,
        savingsGoalId: value,
        type: "EXPENSE" as TransactionType,
        category: "Savings",
      }));
      return;
    }

    if (name === "type") {
      setForm((p) => ({
        ...p,
        type: value as TransactionType,
        category: "",
      }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => setForm(emptyForm);
  const cancelEdit = () => {
    setForm(emptyForm);
    onCancelEdit?.();
  };

  /* ── ✅ FIXED: convert date-only string to full ISO datetime ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = Boolean(editingTransaction);
    const res = await fetch("/api/transactions", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        id: editingTransaction?.id,
        amount: form.amount ? parseFloat(form.amount) : 0,
        // ✅ FIX: <input type="date"> gives "YYYY-MM-DD" which fails Zod's
        // .datetime() validator. Append time + UTC offset to make it a valid
        // ISO 8601 datetime string before sending to the API.
        date: new Date(form.date + "T00:00:00.000Z").toISOString(),
        savingsGoalId: form.savingsGoalId || null,
      }),
    });
    if (!res.ok) {
      onShowToast("Failed to save transaction.", "error");
      return;
    }
    onShowToast(isEditing ? "Transaction updated." : "Transaction saved.");
    setForm(emptyForm);
    onTransactionSaved();
    onScrollToTransactions();
    onCancelEdit?.();
  };

  /* ── Selected category's icon (for display in dropdown) ── */
  const selectedIcon = form.category
    ? (categories.find(
        (c) => c.name === form.category && c.type === form.type
      )?.icon ?? getIconForCategory(form.category, form.type))
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .txn-input:focus {
          border-color: rgba(232,201,122,0.65) !important;
          background: rgba(255,255,255,0.10) !important;
          box-shadow: 0 0 0 3px rgba(232,201,122,0.10);
        }
        .txn-input::placeholder { color: rgba(255,255,255,0.22); }
        .txn-input option { background: #1A0F3C; color: #fff; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.4); cursor: pointer;
        }
        .cat-chip:hover { background: rgba(255,255,255,0.12) !important; }
      `}}></style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.40)",
              margin: "3px 0 0",
            }}
          >
            {editingTransaction
              ? "Update the transaction details below"
              : "Record a new income or expense entry"}
          </p>
        </div>

        {/* Manage categories pill */}
        <button
          type="button"
          onClick={() => setShowCategoryManager((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: showCategoryManager
              ? "rgba(232,201,122,0.15)"
              : "rgba(255,255,255,0.07)",
            border: showCategoryManager
              ? "1px solid rgba(232,201,122,0.35)"
              : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "6px 12px",
            color: showCategoryManager
              ? "#E8C97A"
              : "rgba(255,255,255,0.55)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
        >
          <Tag size={13} />
          Categories
        </button>
      </div>

      {/* ── Category Manager ── */}
      {showCategoryManager && (
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {form.type} Categories
          </p>

          {/* Existing category chips */}
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}
          >
            {catLoading ? (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                Loading…
              </p>
            ) : currentCats.length === 0 ? (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                No categories yet. Add one below.
              </p>
            ) : (
              currentCats.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background:
                      form.category === cat.name
                        ? "rgba(232,201,122,0.18)"
                        : "rgba(255,255,255,0.08)",
                    border:
                      form.category === cat.name
                        ? "1px solid rgba(232,201,122,0.40)"
                        : "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 8,
                    padding: "4px 6px 4px 8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    position: "relative",
                  }}
                  className="cat-chip"
                  onClick={() =>
                    setForm((p) => ({ ...p, category: cat.name }))
                  }
                >
                  {/* Icon — click to change */}
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      title="Change icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingIconForId(
                          editingIconForId === cat.id ? null : cat.id
                        );
                      }}
                      style={{
                        fontSize: 15,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0 2px",
                        lineHeight: 1,
                        borderRadius: 4,
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform =
                          "scale(1.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform =
                          "scale(1)";
                      }}
                    >
                      {cat.icon}
                    </button>

                    {/* Icon picker for this specific category */}
                    {editingIconForId === cat.id && (
                      <IconPicker
                        onSelect={(icon) => updateCategoryIcon(cat.id, icon)}
                        onClose={() => setEditingIconForId(null)}
                      />
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      color:
                        form.category === cat.name
                          ? "#E8C97A"
                          : "rgba(255,255,255,0.65)",
                      fontWeight: 500,
                    }}
                  >
                    {cat.name}
                  </span>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(cat.id, cat.name);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0 2px",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.28)",
                      display: "flex",
                      lineHeight: 1,
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#E8A0A0";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.28)";
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add new category row */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Auto icon preview / picker trigger */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setShowNewIconPicker((v) => !v)}
                title="Pick icon"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.07)",
                  fontSize: 20,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.07)";
                }}
              >
                {newCategoryIcon ||
                  getIconForCategory(newCategoryName, form.type) ||
                  "➕"}
              </button>

              {showNewIconPicker && (
                <IconPicker
                  onSelect={(icon) => {
                    setNewCategoryIcon(icon);
                    setShowNewIconPicker(false);
                  }}
                  onClose={() => setShowNewIconPicker(false)}
                />
              )}
            </div>

            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
              placeholder="New category name…"
              className="txn-input"
              style={{ ...inputStyle, height: 42, flex: 1, fontSize: 13 }}
            />

            <button
              type="button"
              onClick={addCategory}
              style={{
                height: 42,
                width: 42,
                borderRadius: 10,
                border: "none",
                background: "rgba(232,201,122,0.20)",
                color: "#E8C97A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(232,201,122,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(232,201,122,0.20)";
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.25)",
              marginTop: 8,
            }}
          >
            Tip: Click any icon to change it · Auto-icon assigned as you type
          </p>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit}>
        {/* Row 1: Type + Status */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="txn-input"
              style={inputStyle}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
              <option value="DEBT">Debt</option>
              <option value="COMMITMENT">Commitment</option>
              <option value="SAVINGS">Savings</option>
              <option value="INVESTMENT">Investment</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="txn-input"
              style={inputStyle}
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Row 2: Title */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Monthly Salary, Grab Ride..."
            className="txn-input"
            style={inputStyle}
          />
        </div>

        {/* Row 3: Category (with icon) + Amount */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ position: "relative" }}>
              {selectedIcon && (
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                >
                  {selectedIcon}
                </span>
              )}
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="txn-input"
                style={{
                  ...inputStyle,
                  paddingLeft: selectedIcon ? 40 : 14,
                }}
              >
                <option value="">Select category</option>
                {currentCats.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Amount (RM)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="txn-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Row 4: Date + Savings Goal */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              form.type === "EXPENSE" ? "1fr 1fr" : "1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="txn-input"
              style={inputStyle}
            />
          </div>
          {form.type === "EXPENSE" && (
            <div>
              <label style={labelStyle}>Savings Goal (optional)</label>
              <select
                name="savingsGoalId"
                value={form.savingsGoalId}
                onChange={handleChange}
                className="txn-input"
                style={inputStyle}
              >
                <option value="">No savings goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Buttons ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="submit"
            style={{
              height: 46,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background:
                "linear-gradient(135deg,#E8A0A0 0%,#E8C97A 100%)",
              color: "#453284",
              fontSize: 14,
              fontWeight: 700,
              padding: "0 24px",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(232,162,160,0.30)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
          >
            {editingTransaction ? "Update" : "Save Transaction"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            style={{
              height: 46,
              borderRadius: 12,
              cursor: "pointer",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.60)",
              fontSize: 14,
              fontWeight: 500,
              padding: "0 20px",
              fontFamily: "inherit",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.07)";
            }}
          >
            Reset
          </button>

          {editingTransaction && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                height: 46,
                borderRadius: 12,
                cursor: "pointer",
                background: "rgba(255,100,100,0.10)",
                border: "1px solid rgba(255,100,100,0.20)",
                color: "#E8A0A0",
                fontSize: 14,
                fontWeight: 500,
                padding: "0 20px",
                fontFamily: "inherit",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,100,100,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,100,100,0.10)";
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </>
  );
}