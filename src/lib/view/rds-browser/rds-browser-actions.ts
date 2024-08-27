import { ActionBarProps } from '@site0/tijs';
import { RdsBrowserFeature } from './use-rds-browser';

export function useRdsBrowserActions(_RD: RdsBrowserFeature): ActionBarProps {
  return {
    style: {
      padding: 'var(--ti-gap-m)',
    },
    vars: _RD.StatusVars.value,
    items: [
      {
        icon: 'zmdi-flare',
        text: 'NEW',
        action: 'create',
      },
      {},
      {
        icon: 'zmdi-floppy',
        text: 'SAVE',
        altDisplay: {
          test: { saving: true },
          icon: 'fas-spinner fa-pulse',
          text: 'i18n:saving',
        },
        enabled: { changed: true },
        action: 'save',
      },
      {},
      {
        icon: 'zmdi-time-restore',
        text: 'DROP CHANGES',
        enabled: { changed: true },
        action: 'reset',
      },
      {},
      {
        text: 'DELETE',
        icon: 'fas-trash-can',
        className: 'is-error',
        enabled: { hasChecked: true },
        action: 'remove',
      },
      {},
      {
        icon: 'zmdi-refresh',
        text: 'REFRESH',
        disabled: { changed: true },
        altDisplay: {
          test: { reloading: true },
          icon: 'zmdi-refresh zmdi-hc-spin',
          text: 'i18n:loading',
        },
        action: 'reload',
      },
    ],
  };
}
