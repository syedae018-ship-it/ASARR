import { supabase } from "@/integrations/supabase/client";
import {
  isDemoModeActive,
  getDemoCollection,
  saveDemoCollection,
  DEMO_OWNER_ID,
} from "./demoData";

type Value = unknown;
// The compatibility layer preserves the dynamic document shape used by the
// existing MVP screens while the app transitions to generated Supabase types.
type Row = Record<string, any>;

type CollectionReference = {
  kind: "collection";
  table: string;
};

export type DocumentReference = {
  kind: "document";
  table: string;
  id: string;
};

type FilterConstraint = {
  kind: "where";
  field: string;
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=";
  value: Value;
};

type OrderConstraint = {
  kind: "order";
  field: string;
  direction: "asc" | "desc";
};

type LimitConstraint = {
  kind: "limit";
  count: number;
};

type QueryConstraint = FilterConstraint | OrderConstraint | LimitConstraint;

type QueryReference = CollectionReference & {
  constraints: QueryConstraint[];
};

class DocumentSnapshot {
  constructor(
    readonly ref: DocumentReference,
    private readonly row: Row | null,
  ) {}

  get id() {
    return this.ref.id;
  }

  exists() {
    return this.row !== null && this.row !== undefined;
  }

  data() {
    return this.row ?? {};
  }
}

class QuerySnapshot {
  constructor(readonly docs: DocumentSnapshot[]) {}

  get size() {
    return this.docs.length;
  }

  get empty() {
    return this.docs.length === 0;
  }
}

export const db = supabase;

export function collection(_client: unknown, table: string): CollectionReference {
  return { kind: "collection", table };
}

export function doc(
  clientOrCollection: unknown | CollectionReference,
  table?: string,
  id?: string,
): DocumentReference {
  if (isCollectionReference(clientOrCollection)) {
    return {
      kind: "document",
      table: clientOrCollection.table,
      id: table || crypto.randomUUID(),
    };
  }

  if (!table) throw new Error("A table name is required.");
  return { kind: "document", table, id: id || crypto.randomUUID() };
}

export function where(
  field: string,
  operator: FilterConstraint["operator"],
  value: Value,
): FilterConstraint {
  return { kind: "where", field, operator, value };
}

export function orderBy(field: string, direction: "asc" | "desc" = "asc"): OrderConstraint {
  return { kind: "order", field, direction };
}

export function limit(count: number): LimitConstraint {
  return { kind: "limit", count };
}

export function query(
  reference: CollectionReference,
  ...constraints: QueryConstraint[]
): QueryReference {
  return { ...reference, constraints };
}

// In-memory/localStorage query evaluation for demo mode
function executeDemoQuery(reference: CollectionReference | QueryReference): Row[] {
  let items = [...getDemoCollection(reference.table)];
  const constraints = "constraints" in reference ? reference.constraints : [];

  for (const constraint of constraints) {
    if (constraint.kind === "where") {
      items = items.filter((item) => {
        const itemVal = item[constraint.field];
        switch (constraint.operator) {
          case "==":
            return itemVal === constraint.value;
          case "!=":
            return itemVal !== constraint.value;
          case ">":
            return itemVal > (constraint.value as any);
          case ">=":
            return itemVal >= (constraint.value as any);
          case "<":
            return itemVal < (constraint.value as any);
          case "<=":
            return itemVal <= (constraint.value as any);
          default:
            return true;
        }
      });
    } else if (constraint.kind === "order") {
      const field = constraint.field;
      const asc = constraint.direction === "asc";
      items.sort((a, b) => {
        const valA = a[field] ?? "";
        const valB = b[field] ?? "";
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    } else if (constraint.kind === "limit") {
      items = items.slice(0, constraint.count);
    }
  }

  return items;
}

export async function getDocs(reference: CollectionReference | QueryReference) {
  if (isDemoModeActive()) {
    const demoItems = executeDemoQuery(reference);
    return new QuerySnapshot(
      demoItems.map((row) =>
        new DocumentSnapshot(
          { kind: "document", table: reference.table, id: String(row.id) },
          row,
        ),
      ),
    );
  }

  try {
    let request = supabase.from(reference.table).select("*");
    const constraints = "constraints" in reference ? reference.constraints : [];

    for (const constraint of constraints) {
      if (constraint.kind === "where") {
        request = applyFilter(request, constraint);
      } else if (constraint.kind === "order") {
        request = request.order(constraint.field, { ascending: constraint.direction === "asc" });
      } else {
        request = request.limit(constraint.count);
      }
    }

    const { data, error } = await request;
    if (error) {
      console.warn(`Supabase getDocs query error on ${reference.table}:`, error.message);
      // Fallback to demo items if table doesn't exist yet or offline
      const fallback = executeDemoQuery(reference);
      return new QuerySnapshot(
        fallback.map((row) =>
          new DocumentSnapshot(
            { kind: "document", table: reference.table, id: String(row.id) },
            row,
          ),
        ),
      );
    }

    return new QuerySnapshot(
      (data ?? []).map((row) =>
        new DocumentSnapshot(
          { kind: "document", table: reference.table, id: String(row.id) },
          row,
        ),
      ),
    );
  } catch (err) {
    console.error(`Supabase error on ${reference.table}:`, err);
    const fallback = executeDemoQuery(reference);
    return new QuerySnapshot(
      fallback.map((row) =>
        new DocumentSnapshot(
          { kind: "document", table: reference.table, id: String(row.id) },
          row,
        ),
      ),
    );
  }
}

export async function getCountFromServer(reference: CollectionReference | QueryReference) {
  if (isDemoModeActive()) {
    const count = executeDemoQuery(reference).length;
    return { data: () => ({ count }) };
  }

  try {
    let request = supabase.from(reference.table).select("*", { count: "exact", head: true });
    const constraints = "constraints" in reference ? reference.constraints : [];

    for (const constraint of constraints) {
      if (constraint.kind === "where") request = applyFilter(request, constraint);
    }

    const { count, error } = await request;
    if (error) {
      console.warn(`Supabase count error on ${reference.table}:`, error.message);
      const fallbackCount = executeDemoQuery(reference).length;
      return { data: () => ({ count: fallbackCount }) };
    }
    return { data: () => ({ count: count ?? 0 }) };
  } catch (err) {
    console.error(`Supabase getCountFromServer error on ${reference.table}:`, err);
    return { data: () => ({ count: 0 }) };
  }
}

export async function getDoc(reference: DocumentReference) {
  if (isDemoModeActive()) {
    const items = getDemoCollection(reference.table);
    const item = items.find((d: any) => String(d.id) === String(reference.id)) ?? null;
    return new DocumentSnapshot(reference, item);
  }

  try {
    const { data, error } = await supabase
      .from(reference.table)
      .select("*")
      .eq("id", reference.id)
      .maybeSingle();

    if (error) {
      console.warn(`Supabase getDoc error on ${reference.table}/${reference.id}:`, error.message);
      const items = getDemoCollection(reference.table);
      const item = items.find((d: any) => String(d.id) === String(reference.id)) ?? null;
      return new DocumentSnapshot(reference, item);
    }
    return new DocumentSnapshot(reference, data);
  } catch (err) {
    console.error(`Supabase error on ${reference.table}/${reference.id}:`, err);
    return new DocumentSnapshot(reference, null);
  }
}

export async function addDoc(reference: CollectionReference, values: Row) {
  const id = values.id || crypto.randomUUID();
  const payload = { id, ...values };

  if (isDemoModeActive()) {
    const items = getDemoCollection(reference.table);
    items.unshift(payload);
    saveDemoCollection(reference.table, items);
    return { id };
  }

  try {
    const { error } = await supabase.from(reference.table).insert(payload);
    if (error) {
      console.warn(`Supabase addDoc fallback to local on ${reference.table}:`, error.message);
      const items = getDemoCollection(reference.table);
      items.unshift(payload);
      saveDemoCollection(reference.table, items);
    }
  } catch (err) {
    console.warn(`Supabase addDoc error, saving locally on ${reference.table}:`, err);
    const items = getDemoCollection(reference.table);
    items.unshift(payload);
    saveDemoCollection(reference.table, items);
  }

  return { id };
}

export async function setDoc(reference: DocumentReference, values: Row, options?: { merge?: boolean }) {
  const payload = { id: reference.id, ...values };

  if (isDemoModeActive()) {
    const items = getDemoCollection(reference.table);
    const idx = items.findIndex((d: any) => String(d.id) === String(reference.id));
    if (idx >= 0) {
      items[idx] = options?.merge ? { ...items[idx], ...payload } : payload;
    } else {
      items.push(payload);
    }
    saveDemoCollection(reference.table, items);
    return;
  }

  try {
    const { error } = await supabase.from(reference.table).upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn(`Supabase setDoc error on ${reference.table}:`, error.message);
      const items = getDemoCollection(reference.table);
      const idx = items.findIndex((d: any) => String(d.id) === String(reference.id));
      if (idx >= 0) items[idx] = { ...items[idx], ...payload };
      else items.push(payload);
      saveDemoCollection(reference.table, items);
    }
  } catch (err) {
    console.warn(`Supabase setDoc error on ${reference.table}:`, err);
  }
}

export async function updateDoc(reference: DocumentReference, values: Row) {
  if (isDemoModeActive()) {
    const items = getDemoCollection(reference.table);
    const idx = items.findIndex((d: any) => String(d.id) === String(reference.id));
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...values };
      saveDemoCollection(reference.table, items);
    }
    return;
  }

  try {
    const { error } = await supabase.from(reference.table).update(values).eq("id", reference.id);
    if (error) {
      console.warn(`Supabase updateDoc fallback on ${reference.table}:`, error.message);
      const items = getDemoCollection(reference.table);
      const idx = items.findIndex((d: any) => String(d.id) === String(reference.id));
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...values };
        saveDemoCollection(reference.table, items);
      }
    }
  } catch (err) {
    console.warn(`Supabase updateDoc error on ${reference.table}:`, err);
    const items = getDemoCollection(reference.table);
    const idx = items.findIndex((d: any) => String(d.id) === String(reference.id));
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...values };
      saveDemoCollection(reference.table, items);
    }
  }
}

export async function deleteDoc(reference: DocumentReference) {
  if (isDemoModeActive()) {
    const items = getDemoCollection(reference.table);
    const filtered = items.filter((d: any) => String(d.id) !== String(reference.id));
    saveDemoCollection(reference.table, filtered);
    return;
  }

  try {
    const { error } = await supabase.from(reference.table).delete().eq("id", reference.id);
    if (error) {
      console.warn(`Supabase deleteDoc fallback on ${reference.table}:`, error.message);
      const items = getDemoCollection(reference.table);
      const filtered = items.filter((d: any) => String(d.id) !== String(reference.id));
      saveDemoCollection(reference.table, filtered);
    }
  } catch (err) {
    console.warn(`Supabase deleteDoc error on ${reference.table}:`, err);
  }
}

export function writeBatch(_client: unknown) {
  const operations: Array<() => Promise<void>> = [];

  return {
    set(reference: DocumentReference, values: Row) {
      operations.push(() => setDoc(reference, values));
    },
    update(reference: DocumentReference, values: Row) {
      operations.push(() => updateDoc(reference, values));
    },
    delete(reference: DocumentReference) {
      operations.push(() => deleteDoc(reference));
    },
    async commit() {
      await Promise.all(operations.map((operation) => operation()));
    },
  };
}

export async function uploadPublicFile(bucket: string, path: string, file: File): Promise<string> {
  if (isDemoModeActive()) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicData.publicUrl;
}

export async function uploadPrivateFile(bucket: string, path: string, file: File): Promise<string> {
  if (isDemoModeActive()) {
    return path;
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  return data.path;
}

export async function createSignedFileUrl(bucket: string, path: string, expiresInSeconds: number = 3600): Promise<string> {
  if (isDemoModeActive()) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function removePublicFile(bucket: string, publicUrl: string): Promise<void> {
  if (isDemoModeActive()) return;
  try {
    const parts = publicUrl.split(`/${bucket}/`);
    if (parts[1]) {
      await supabase.storage.from(bucket).remove([parts[1]]);
    }
  } catch (err) {
    console.warn("Failed to remove storage object:", err);
  }
}

export async function getInstallationOwnerId(): Promise<string | null> {
  if (isDemoModeActive()) {
    return DEMO_OWNER_ID;
  }
  try {
    const { data, error } = await supabase.rpc("installation_owner_id");
    if (error) throw error;
    return (data as string | null) ?? null;
  } catch {
    return null;
  }
}

function isCollectionReference(value: unknown): value is CollectionReference {
  return Boolean(value && typeof value === "object" && "kind" in value && value.kind === "collection");
}

// Supabase uses a different generic builder type after each filter operation.
function applyFilter(request: any, constraint: FilterConstraint) {
  switch (constraint.operator) {
    case "==":
      return constraint.value === null
        ? request.is(constraint.field, null)
        : request.eq(constraint.field, constraint.value);
    case "!=":
      return request.neq(constraint.field, constraint.value);
    case ">":
      return request.gt(constraint.field, constraint.value);
    case ">=":
      return request.gte(constraint.field, constraint.value);
    case "<":
      return request.lt(constraint.field, constraint.value);
    case "<=":
      return request.lte(constraint.field, constraint.value);
  }
}
