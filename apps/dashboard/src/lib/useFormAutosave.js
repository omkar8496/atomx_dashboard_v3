import { useCallback, useEffect, useMemo, useRef } from "react";
import { idbDelete, idbGet, idbSet } from "./idb";

export function useFormAutosave({
  formRef,
  draftKey,
  getValues,
  onRestore,
  enabled = true,
  debounceMs = 800,
  watch = []
}) {
  const saveTimerRef = useRef(null);
  const restoringRef = useRef(false);
  const watchKey = useMemo(() => {
    if (!watch || watch.length === 0) return "";
    try {
      return JSON.stringify(watch);
    } catch (err) {
      console.error("Failed to serialize watch values", err);
      return String(Date.now());
    }
  }, [watch]);

  const clearDraft = useCallback(async () => {
    if (!draftKey) return;
    try {
      await idbDelete(draftKey);
    } catch (err) {
      console.error("Failed to clear draft", err);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!enabled || !draftKey) return undefined;
    let active = true;

    (async () => {
      try {
        const draft = await idbGet(draftKey);
        if (!active || !draft?.values) return;
        restoringRef.current = true;
        try {
          onRestore?.(draft.values, draft.updatedAt);
        } catch (restoreError) {
          console.error("Failed to restore draft", restoreError);
          try {
            await idbDelete(draftKey);
          } catch (cleanupError) {
            console.error("Failed to remove invalid draft", cleanupError);
          }
        }
      } catch (err) {
        console.error("Failed to load draft", err);
      } finally {
        restoringRef.current = false;
      }
    })();

    return () => {
      active = false;
    };
  }, [draftKey, enabled, onRestore]);

  const scheduleSave = useCallback(() => {
    if (restoringRef.current) return;
    if (!enabled || !draftKey) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(async () => {
      try {
        const values = getValues ? getValues() : {};
        if (!values || typeof values !== "object") return;
        await idbSet(draftKey, { values, updatedAt: Date.now() });
      } catch (err) {
        console.error("Failed to save draft", err);
      }
    }, debounceMs);
  }, [debounceMs, draftKey, enabled, getValues]);

  useEffect(() => {
    if (!enabled || !draftKey || !formRef?.current) return undefined;
    const form = formRef.current;

    const handler = () => {
      scheduleSave();
    };

    form.addEventListener("input", handler);
    form.addEventListener("change", handler);

    return () => {
      form.removeEventListener("input", handler);
      form.removeEventListener("change", handler);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [draftKey, enabled, formRef, scheduleSave]);

  useEffect(() => {
    if (!enabled || !draftKey) return;
    if (!watchKey) return;
    scheduleSave();
  }, [watchKey, enabled, draftKey, scheduleSave]);

  return { clearDraft };
}
