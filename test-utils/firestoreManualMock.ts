import type { DocumentData } from 'firebase/firestore';

export const firestoreStore = new Map<string, DocumentData>();

type QueryConstraint =
  | { type: 'where'; field: string; op: string; value: unknown }
  | { type: 'orderBy'; field: string; direction: string };

type CollectionRef = { _collectionPath: string };
type DocumentRef = { path: string; id: string; _collectionPath?: string };

let autoIdCounter = 0;

export function resetFirestoreStore(): void {
  firestoreStore.clear();
  autoIdCounter = 0;
  jest.clearAllMocks();
}

function getCollectionDocuments(collectionPath: string): DocumentRef[] {
  const prefix = `${collectionPath}/`;

  return [...firestoreStore.entries()]
    .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
    .map(([path, data]) => ({
      path,
      id: path.split('/').pop() ?? '',
      data: () => data,
      exists: () => true,
    })) as unknown as DocumentRef[];
}

function matchesConstraints(data: DocumentData, constraints: QueryConstraint[]): boolean {
  return constraints.every((constraint) => {
    if (constraint.type !== 'where') {
      return true;
    }

    const fieldValue = data[constraint.field];

    switch (constraint.op) {
      case '==':
        return fieldValue === constraint.value;
      case '>=':
        return compareValues(fieldValue, constraint.value) >= 0;
      case '<=':
        return compareValues(fieldValue, constraint.value) <= 0;
      default:
        return true;
    }
  });
}

function compareValues(left: unknown, right: unknown): number {
  const leftValue = toComparable(left);
  const rightValue = toComparable(right);

  if (leftValue < rightValue) {
    return -1;
  }

  if (leftValue > rightValue) {
    return 1;
  }

  return 0;
}

function toComparable(value: unknown): number {
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return Number(value);
}

function createMockSnapshot(ref: DocumentRef) {
  const data = firestoreStore.get(ref.path);

  return {
    exists: () => data !== undefined,
    id: ref.id,
    data: () => data,
  };
}

export class Timestamp {
  constructor(
    readonly seconds: number,
    readonly nanoseconds: number
  ) {}

  static fromDate(date: Date): Timestamp {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1_000_000);
  }
}

export const collection = jest.fn((_db: unknown, path: string): CollectionRef => ({
  _collectionPath: path,
}));

export const doc = jest.fn(
  (parent: CollectionRef | DocumentRef, maybeId?: string): DocumentRef => {
    if (maybeId !== undefined) {
      const collectionPath =
        '_collectionPath' in parent ? parent._collectionPath : parent.path.replace(/\/[^/]+$/, '');

      return {
        path: `${collectionPath}/${maybeId}`,
        id: maybeId,
      };
    }

    const collectionPath = parent._collectionPath;
    const id = `generated-${++autoIdCounter}`;

    return {
      path: `${collectionPath}/${id}`,
      id,
      _collectionPath: collectionPath,
    };
  }
);

export const setDoc = jest.fn(async (ref: DocumentRef, data: DocumentData) => {
  firestoreStore.set(ref.path, data);
});

export const getDoc = jest.fn(async (ref: DocumentRef) => createMockSnapshot(ref));

export const updateDoc = jest.fn(async (ref: DocumentRef, data: DocumentData) => {
  const existing = firestoreStore.get(ref.path) ?? {};
  firestoreStore.set(ref.path, { ...existing, ...data });
});

export const deleteDoc = jest.fn(async (ref: DocumentRef) => {
  firestoreStore.delete(ref.path);
});

export const query = jest.fn((colRef: CollectionRef, ...constraints: QueryConstraint[]) => ({
  _collectionPath: colRef._collectionPath,
  _constraints: constraints,
}));

export const where = jest.fn(
  (field: string, op: string, value: unknown): QueryConstraint => ({
    type: 'where',
    field,
    op,
    value,
  })
);

export const orderBy = jest.fn(
  (field: string, direction = 'asc'): QueryConstraint => ({
    type: 'orderBy',
    field,
    direction,
  })
);

export const getDocs = jest.fn(async (queryRef: {
  _collectionPath: string;
  _constraints?: QueryConstraint[];
}) => {
  const constraints = queryRef._constraints ?? [];
  const docs = getCollectionDocuments(queryRef._collectionPath).filter((documentRef) => {
    const data = firestoreStore.get(documentRef.path);
    return data ? matchesConstraints(data, constraints) : false;
  });

  return {
    empty: docs.length === 0,
    docs: docs.map((documentRef) => createMockSnapshot(documentRef)),
    forEach: (callback: (snapshot: ReturnType<typeof createMockSnapshot>) => void) => {
      docs.forEach((documentRef) => callback(createMockSnapshot(documentRef)));
    },
  };
});

export type Firestore = unknown;
