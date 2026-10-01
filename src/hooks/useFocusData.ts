import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { useFocusEffect } from 'expo-router';
import { getErrorMessage } from '../utils/getErrorMessage';

interface FocusData<T> {
  data: T | null; // null tant que le premier chargement n'a pas réussi
  setData: Dispatch<SetStateAction<T | null>>;
  loadError: string | null;
  loadedAt: Date | null;
  isRefreshing: boolean;
  reload: () => Promise<void>;
  refresh: () => Promise<void>; // pour le « tirer pour rafraîchir »
}

// Données rechargées à chaque affichage de l'écran
// loader doit être stable (fonction de service ou déclarée hors du composant), sinon chargement en boucle
export function useFocusData<T>(loader: () => Promise<T>, errorMessage: string): FocusData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reload = useCallback(async (): Promise<void> => {
    try {
      const result = await loader();
      setData(result);
      setLoadedAt(new Date());
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, errorMessage));
    }
  }, [loader, errorMessage]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const refresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await reload();
    setIsRefreshing(false);
  }, [reload]);

  return { data, setData, loadError, loadedAt, isRefreshing, reload, refresh };
}
