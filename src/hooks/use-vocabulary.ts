import { useEffect, useState } from "react";
import * as service from "@/lib/vocab-service";
import type { VocabItem } from "@/types/vocab";

export function useVocabulary() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await service.ensureVocabStore();
      const all = await service.listVocab();
      if (mounted) {
        setItems(all);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return {
    items,
    loading,
    refresh: async () => setItems(await service.listVocab()),
    add: service.addVocab,
    update: service.updateVocab,
    delete: service.deleteVocab,
    applyReviewResult: service.applyReviewResult,
    exportJSON: service.exportVocabJSON,
    importJSON: service.importVocabJSON,
  };
}
