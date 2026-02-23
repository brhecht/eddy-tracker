import { useState, useEffect, useCallback, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const DOC_REF = doc(db, "eddy", "state");

/**
 * Shared Firestore state hook.
 * All clients subscribe to the same document.
 * Writes are debounced to avoid thrashing on rapid clicks.
 */
export function useFirestoreState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [synced, setSynced] = useState(false);
  const pending = useRef(null);
  const timer = useRef(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = onSnapshot(DOC_REF, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data[key] !== undefined) {
          setValue(data[key]);
        }
      }
      setSynced(true);
    });
    return unsub;
  }, [key]);

  // Debounced write to Firestore
  const set = useCallback(
    (updater) => {
      setValue((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        // Debounce writes: 300ms
        pending.current = next;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          setDoc(DOC_REF, { [key]: pending.current }, { merge: true }).catch(
            (e) => console.error(`Firestore write error [${key}]:`, e)
          );
        }, 300);
        return next;
      });
    },
    [key]
  );

  return [value, set, synced];
}
