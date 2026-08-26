"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Mail, Phone, ClipboardList, CheckSquare } from "lucide-react";
import Link from "next/link";
import {
  addOrgMember,
  updateOrgMember,
  moveOrgMember,
  deleteOrgMember,
  linkOrgMemberAccount,
  unlinkOrgMemberAccount,
  setOrgMemberAccessTier,
  saveOrgMemberAvatar,
  type OrgMemberFields,
  type OrgAccessTier,
} from "./org-actions";

export type OrgNode = {
  id: string;
  parentId: string | null;
  name: string;
  title: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  linkedProfileId: string | null;
  linkedEmail: string | null;
  linkedName: string | null;
  linkedRole: "viewer" | "editor" | "manager" | "admin" | "client" | null;
};

type TreeNode = OrgNode & { children: TreeNode[] };

function groupByParent(nodes: OrgNode[]) {
  const byParent = new Map<string | null, OrgNode[]>();
  for (const n of nodes) {
    const list = byParent.get(n.parentId) ?? [];
    list.push(n);
    byParent.set(n.parentId, list);
  }
  return byParent;
}

function buildForest(nodes: OrgNode[]): TreeNode[] {
  const byParent = groupByParent(nodes);
  function attach(n: OrgNode): TreeNode {
    return { ...n, children: (byParent.get(n.id) ?? []).map(attach) };
  }
  return (byParent.get(null) ?? []).map(attach);
}

function descendantIds(nodes: OrgNode[], rootId: string): Set<string> {
  const byParent = groupByParent(nodes);
  const out = new Set<string>();
  function walk(id: string) {
    for (const child of byParent.get(id) ?? []) {
      out.add(child.id);
      walk(child.id);
    }
  }
  walk(rootId);
  return out;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

const ACCESS_TIERS: OrgAccessTier[] = ["viewer", "editor", "manager", "admin"];
const ACCESS_TIER_LABELS: Record<OrgAccessTier, string> = {
  viewer: "Viewer",
  editor: "Editor",
  manager: "Manager",
  admin: "Admin",
};

type ModalState = { kind: "edit"; node: OrgNode } | { kind: "add"; parentId: string | null };

/** The real, editable org chart — see page.tsx's header comment for the
 *  client ask this answers. A pure-CSS nested-list tree (see the
 *  `.org-tree` block in globals.css) draws the connectors; this component
 *  owns the tree state, drag-to-reparent, and the add/edit/delete modal. */
export function OrgChart({ nodes, isAdmin }: { nodes: OrgNode[]; isAdmin: boolean }) {
  const router = useRouter();
  const forest = useMemo(() => buildForest(nodes), [nodes]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<OrgNode | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [movePending, startMove] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const blockedDropIds = useMemo(() => {
    if (!draggingId) return new Set<string>();
    const s = descendantIds(nodes, draggingId);
    s.add(draggingId);
    return s;
  }, [draggingId, nodes]);

  function commitMove(targetId: string | null) {
    if (!draggingId) return;
    const movingId = draggingId;
    setDraggingId(null);
    setDragOverId(null);
    setDragOverRoot(false);
    if (targetId !== null && blockedDropIds.has(targetId)) return;
    const movingNode = nodes.find((n) => n.id === movingId);
    if (!movingNode || movingNode.parentId === targetId) return;
    startMove(async () => {
      const result = await moveOrgMember(movingId, targetId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Moved");
        router.refresh();
      }
    });
  }

  function requestDelete(node: OrgNode) {
    setModal(null);
    setConfirmDelete(node);
  }

  function confirmTheDelete() {
    if (!confirmDelete) return;
    const node = confirmDelete;
    startDelete(async () => {
      const result = await deleteOrgMember(node.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`${node.name} removed`);
        router.refresh();
      }
      setConfirmDelete(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {nodes.length} {nodes.length === 1 ? "position" : "positions"} on the chart.
        </p>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setModal({ kind: "add", parentId: null })}
            className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <Plus className="size-4" />
            Add team member
          </button>
        )}
      </div>

      <div className="border-border overflow-x-auto rounded-2xl border p-8">
        {forest.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            Nobody&apos;s on the chart yet.{isAdmin ? " Add the first position above." : ""}
          </p>
        ) : (
          <ul className="org-tree mx-auto w-max">
            {forest.map((root) => (
              <TreeNodeView
                key={root.id}
                node={root}
                isAdmin={isAdmin}
                draggingId={draggingId}
                dragOverId={dragOverId}
                blockedDropIds={blockedDropIds}
                onDragStart={setDraggingId}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                  setDragOverRoot(false);
                }}
                onDragOverNode={setDragOverId}
                onDrop={commitMove}
                onOpen={(n) => setModal({ kind: "edit", node: n })}
                onAddChild={(parentId) => setModal({ kind: "add", parentId })}
                onDeleteBadge={requestDelete}
              />
            ))}
          </ul>
        )}
        {draggingId && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverRoot(true);
            }}
            onDragLeave={() => setDragOverRoot(false)}
            onDrop={(e) => {
              e.preventDefault();
              commitMove(null);
            }}
            className={`mt-6 rounded-xl border-2 border-dashed p-3 text-center text-xs font-medium transition-colors ${
              dragOverRoot ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            Drop here to move to the top of the chart
          </div>
        )}
        {movePending && <p className="text-muted-foreground mt-2 text-center text-xs">Moving…</p>}
      </div>

      {modal &&
        (isAdmin ? (
          <OrgMemberModal
            key={modal.kind === "edit" ? modal.node.id : `add-${modal.parentId}`}
            state={modal}
            nodes={nodes}
            onClose={() => setModal(null)}
            onRequestDelete={requestDelete}
          />
        ) : modal.kind === "edit" ? (
          <ReadOnlyOrgMemberModal node={modal.node} onClose={() => setModal(null)} />
        ) : null)}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}
        >
          <div role="dialog" aria-modal="true" className="bg-background w-full max-w-sm space-y-4 rounded-2xl p-6 shadow-xl">
            <h2 className="font-heading text-lg font-bold">Remove {confirmDelete.name}?</h2>
            <p className="text-muted-foreground text-sm">
              {nodesHaveChildren(nodes, confirmDelete.id)
                ? "Their direct reports will move up to whoever they reported to — nobody else is removed."
                : "This only removes their box from the chart."}
              {confirmDelete.linkedProfileId && " Their dashboard login and access aren't affected — this only removes the chart entry."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="font-heading border-border flex-1 rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTheDelete}
                disabled={deletePending}
                className="font-heading bg-destructive text-destructive-foreground flex-1 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {deletePending ? "Removing…" : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function nodesHaveChildren(nodes: OrgNode[], id: string) {
  return nodes.some((n) => n.parentId === id);
}

function TreeNodeView({
  node,
  isAdmin,
  draggingId,
  dragOverId,
  blockedDropIds,
  onDragStart,
  onDragEnd,
  onDragOverNode,
  onDrop,
  onOpen,
  onAddChild,
  onDeleteBadge,
}: {
  node: TreeNode;
  isAdmin: boolean;
  draggingId: string | null;
  dragOverId: string | null;
  blockedDropIds: Set<string>;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverNode: (id: string | null) => void;
  onDrop: (targetId: string) => void;
  onOpen: (node: OrgNode) => void;
  onAddChild: (parentId: string) => void;
  onDeleteBadge: (node: OrgNode) => void;
}) {
  const isDragging = draggingId === node.id;
  const isBlocked = draggingId !== null && blockedDropIds.has(node.id);
  const isOver = dragOverId === node.id && !isBlocked && draggingId !== node.id;

  return (
    <li>
      <div className="flex flex-col items-center">
        <div
          className={`relative rounded-full ${isOver ? "org-tree__drop-target" : ""}`}
          onDragOver={(e) => {
            if (!isAdmin || draggingId === null || isBlocked || draggingId === node.id) return;
            e.preventDefault();
            onDragOverNode(node.id);
          }}
          onDragLeave={() => onDragOverNode(null)}
          onDrop={(e) => {
            e.preventDefault();
            onDrop(node.id);
          }}
        >
          <button
            type="button"
            draggable={isAdmin}
            onDragStart={(e) => {
              if (!isAdmin) return;
              e.dataTransfer.effectAllowed = "move";
              onDragStart(node.id);
            }}
            onDragEnd={onDragEnd}
            onClick={() => onOpen(node)}
            className={`border-background bg-primary/10 text-primary relative flex size-16 items-center justify-center overflow-hidden rounded-full border-4 shadow-md transition-transform hover:scale-105 ${
              isDragging ? "opacity-40" : ""
            }`}
          >
            {node.avatarUrl ? (
              <Image src={node.avatarUrl} alt={node.name} fill sizes="64px" className="object-cover" />
            ) : (
              <span className="font-heading text-lg font-bold">{initials(node.name)}</span>
            )}
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(node.id);
                }}
                aria-label={`Add someone under ${node.name}`}
                title="Add someone under them"
                className="bg-primary text-primary-foreground border-background absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 shadow"
              >
                <Plus className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBadge(node);
                }}
                aria-label={`Remove ${node.name} from the chart`}
                title="Remove from chart"
                className="bg-muted text-muted-foreground border-background hover:bg-destructive hover:text-destructive-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 shadow"
              >
                <X className="size-3" />
              </button>
            </>
          )}
        </div>

        <div className="bg-border h-3 w-px" />

        <button
          type="button"
          onClick={() => onOpen(node)}
          className="border-border bg-card hover:border-primary/50 max-w-36 rounded-full border px-3 py-1.5 text-center shadow-sm"
        >
          <span className="font-heading block truncate text-xs font-semibold">{node.name}</span>
          {(node.title || node.department) && (
            <span className="text-muted-foreground block truncate text-[10px]">
              {[node.title, node.department].filter(Boolean).join(" · ")}
            </span>
          )}
        </button>
      </div>

      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              isAdmin={isAdmin}
              draggingId={draggingId}
              dragOverId={dragOverId}
              blockedDropIds={blockedDropIds}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverNode={onDragOverNode}
              onDrop={onDrop}
              onOpen={onOpen}
              onAddChild={onAddChild}
              onDeleteBadge={onDeleteBadge}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function OrgMemberModal({
  state,
  nodes,
  onClose,
  onRequestDelete,
}: {
  state: ModalState;
  nodes: OrgNode[];
  onClose: () => void;
  onRequestDelete: (node: OrgNode) => void;
}) {
  const router = useRouter();
  const initialNode = state.kind === "edit" ? state.node : null;
  const [memberId, setMemberId] = useState<string | null>(initialNode?.id ?? null);
  const [parentId, setParentId] = useState<string | null>(
    state.kind === "edit" ? state.node.parentId : state.parentId
  );
  const [name, setName] = useState(initialNode?.name ?? "");
  const [title, setTitle] = useState(initialNode?.title ?? "");
  const [department, setDepartment] = useState(initialNode?.department ?? "");
  const [email, setEmail] = useState(initialNode?.email ?? "");
  const [phone, setPhone] = useState(initialNode?.phone ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialNode?.avatarUrl ?? null);
  const [linkedProfileId, setLinkedProfileId] = useState(initialNode?.linkedProfileId ?? null);
  const [linkedLabel, setLinkedLabel] = useState(initialNode?.linkedName || initialNode?.linkedEmail || null);
  const [linkedRole, setLinkedRole] = useState(initialNode?.linkedRole ?? null);
  const [linkEmailInput, setLinkEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isEditing = memberId !== null;
  const excludedParentIds = useMemo(() => {
    if (!memberId) return new Set<string>();
    const s = descendantIds(nodes, memberId);
    s.add(memberId);
    return s;
  }, [memberId, nodes]);
  const parentOptions = nodes.filter((n) => !excludedParentIds.has(n.id));

  function handleSaveDetails() {
    setError(null);
    if (!name.trim()) {
      setError("Give them a name first.");
      return;
    }
    const fields: OrgMemberFields = { name, title, department, email, phone };
    startTransition(async () => {
      if (isEditing && memberId) {
        const result = await updateOrgMember(memberId, fields);
        if (result.error) {
          setError(result.error);
          return;
        }
        toast.success("Saved");
        router.refresh();
        onClose();
      } else {
        const result = await addOrgMember(parentId, fields);
        if (result.error || !result.id) {
          setError(result.error ?? "Couldn't add them.");
          return;
        }
        setMemberId(result.id);
        toast.success("Added — add a photo or link an account below if you'd like.");
        router.refresh();
      }
    });
  }

  function handleParentChange(value: string) {
    const next = value || null;
    setParentId(next);
    if (!isEditing || !memberId) return;
    startTransition(async () => {
      const result = await moveOrgMember(memberId, next);
      if (result.error) {
        toast.error(result.error);
        setParentId(initialNode?.parentId ?? null);
        return;
      }
      toast.success("Moved");
      router.refresh();
    });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !memberId) return;
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await saveOrgMemberAvatar(memberId, formData);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  }

  function handleLink() {
    if (!memberId || !linkEmailInput.trim()) return;
    startTransition(async () => {
      const result = await linkOrgMemberAccount(memberId, linkEmailInput);
      if (result.error || !result.profileId) {
        toast.error(result.error ?? "Couldn't link that account.");
        return;
      }
      toast.success("Account linked");
      setLinkedProfileId(result.profileId);
      setLinkedLabel(result.label ?? linkEmailInput.trim());
      setLinkedRole((result.role as OrgNode["linkedRole"]) ?? null);
      setLinkEmailInput("");
      router.refresh();
    });
  }

  function handleUnlink() {
    if (!memberId) return;
    startTransition(async () => {
      const result = await unlinkOrgMemberAccount(memberId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Account unlinked");
      setLinkedProfileId(null);
      setLinkedLabel(null);
      setLinkedRole(null);
      router.refresh();
    });
  }

  function handleAccessTier(role: OrgAccessTier) {
    if (!linkedProfileId) return;
    startTransition(async () => {
      const result = await setOrgMemberAccessTier(linkedProfileId, role);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Access set to ${ACCESS_TIER_LABELS[role]}`);
      setLinkedRole(role);
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="bg-background w-full max-w-md space-y-5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">{isEditing ? "Edit position" : "Add to the chart"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {isEditing && (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full">
              {avatarPreview ? (
                <Image src={avatarPreview} alt={name} fill sizes="56px" className="object-cover" />
              ) : (
                <span className="font-heading font-bold">{initials(name || "?")}</span>
              )}
            </div>
            <label className="font-heading border-border inline-block cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              {pending ? "Working…" : "Change photo"}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={pending}
                className="hidden"
              />
            </label>
          </div>
        )}

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g. CEO)"
              className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department"
              className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contact email"
              type="email"
              className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <label className="block text-xs">
            <span className="font-heading font-semibold">Reports to</span>
            <select
              value={parentId ?? ""}
              onChange={(e) => handleParentChange(e.target.value)}
              className="border-border bg-background text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">No one (top of the chart)</option>
              {parentOptions.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground mt-1 block">
              You can also just drag their circle onto someone else&apos;s in the chart.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSaveDetails}
          disabled={pending}
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Saving…" : isEditing ? "Save details" : "Add to chart"}
        </button>

        {isEditing && (
          <>
            <div className="border-border space-y-3 border-t pt-4">
              <h3 className="font-heading text-sm font-semibold">Dashboard access</h3>
              {linkedProfileId ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    Linked to <span className="font-semibold">{linkedLabel}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={linkedRole && ACCESS_TIERS.includes(linkedRole as OrgAccessTier) ? linkedRole : "none"}
                      onChange={(e) => handleAccessTier(e.target.value as OrgAccessTier)}
                      disabled={pending}
                      className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {(!linkedRole || !ACCESS_TIERS.includes(linkedRole as OrgAccessTier)) && (
                        <option value="none" disabled>
                          No dashboard access yet
                        </option>
                      )}
                      {ACCESS_TIERS.map((t) => (
                        <option key={t} value={t}>
                          {ACCESS_TIER_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleUnlink}
                      disabled={pending}
                      className="font-heading text-muted-foreground hover:text-destructive text-xs font-semibold"
                    >
                      Unlink account
                    </button>
                  </div>
                  <Link
                    href={`/admin/onboarding?user=${linkedProfileId}`}
                    className="font-heading border-border hover:bg-muted flex w-max items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                  >
                    <CheckSquare className="size-3.5" />
                    Onboarding & reports
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs">
                    No dashboard login yet — this is a placeholder position. Link one by email to
                    set their access.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={linkEmailInput}
                      onChange={(e) => setLinkEmailInput(e.target.value)}
                      placeholder="Their account email"
                      type="email"
                      className="border-border min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    <button
                      type="button"
                      onClick={handleLink}
                      disabled={pending || !linkEmailInput.trim()}
                      className="font-heading border-border hover:bg-muted rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                      Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              {email && (
                <a href={`mailto:${email}`} className="text-primary flex items-center gap-1.5 text-xs font-semibold">
                  <Mail className="size-3.5" />
                  Email
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="text-primary flex items-center gap-1.5 text-xs font-semibold">
                  <Phone className="size-3.5" />
                  Call
                </a>
              )}
              {linkedProfileId && (
                <Link
                  href={`/admin/inquiries?assigned=${linkedProfileId}`}
                  className="text-primary flex items-center gap-1.5 text-xs font-semibold"
                >
                  <ClipboardList className="size-3.5" />
                  Assigned inquiries
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!memberId) return;
                  // initialNode is null when this modal started as "add"
                  // and only became editable after the first save — build
                  // the confirm dialog's target from current form state.
                  onRequestDelete(
                    initialNode ?? {
                      id: memberId,
                      parentId,
                      name,
                      title: title || null,
                      department: department || null,
                      email: email || null,
                      phone: phone || null,
                      avatarUrl: avatarPreview,
                      linkedProfileId,
                      linkedEmail: null,
                      linkedName: linkedLabel,
                      linkedRole,
                    }
                  );
                }}
                className="font-heading text-destructive ml-auto text-xs font-semibold"
              >
                Remove from chart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** What a non-admin (editor) sees on click — real staff still get to see
 *  who's who and how to reach them (client ask: "if it's an editor we
 *  bring on... they can see the organization structure... contact
 *  options"), just no edit surface, since org_members' RLS only allows
 *  admins to mutate it. */
function ReadOnlyOrgMemberModal({ node, onClose }: { node: OrgNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="bg-background w-full max-w-sm space-y-4 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">{node.name}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full">
            {node.avatarUrl ? (
              <Image src={node.avatarUrl} alt={node.name} fill sizes="56px" className="object-cover" />
            ) : (
              <span className="font-heading font-bold">{initials(node.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            {(node.title || node.department) && (
              <p className="text-muted-foreground text-sm">{[node.title, node.department].filter(Boolean).join(" · ")}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {node.email && (
            <a href={`mailto:${node.email}`} className="text-primary flex items-center gap-1.5 font-semibold">
              <Mail className="size-3.5" />
              {node.email}
            </a>
          )}
          {node.phone && (
            <a href={`tel:${node.phone}`} className="text-primary flex items-center gap-1.5 font-semibold">
              <Phone className="size-3.5" />
              {node.phone}
            </a>
          )}
        </div>
        {!node.email && !node.phone && <p className="text-muted-foreground text-sm">No contact info on file.</p>}
      </div>
    </div>
  );
}
