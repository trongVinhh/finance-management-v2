import { useCategories } from "../services/categories/useCategories";
import { useSettings } from "../services/settings/useSettings";

export const useInitDefaults = () => {
  const { initCategories } = useCategories();
  const { initSettings } = useSettings();

  const initDefaults = async (userId: string) => {
    await initCategories(userId);
    await initSettings(userId);
  };

  return { initDefaults };
};
