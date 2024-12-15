import { computed, ref } from 'vue';
import { GuiViewLayoutMode } from '../_types/wn-types';

const _view_mode = ref<GuiViewLayoutMode>('desktop');

export function useGuiViewMeasure() {
  const viewMode = computed(() => _view_mode.value);

  return {
    viewMode,
    setViewMode: (mode: GuiViewLayoutMode) => {
      _view_mode.value = mode;
    },
  };
}
