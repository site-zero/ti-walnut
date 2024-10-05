import { ActionBarItem, ActionBarProps } from '@site0/tijs';
import { DataListStore } from '../../_store';
import { RdsBrowserFeature, RdsBrowserProps } from './rds-browser-types';
import _ from 'lodash';

export function useRdsBrowserActions(
  props: RdsBrowserProps,
  Data: DataListStore,
  _RD: RdsBrowserFeature
): ActionBarProps {
  // 内置默认的菜单条
  let items: ActionBarItem[] = [];

  // 是否支持新建项目
  if (props.createNewItem) {
    items.push(
      {
        icon: 'zmdi-flare',
        text: 'NEW',
        action: 'create',
      },
      {}
    );
  }
  // 其他的动作项
  items.push(
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
    }
  );

  let actionBar: ActionBarProps = _.assign(
    {
      style: {
        padding: 'var(--ti-gap-m)',
      },
      vars: _RD.StatusVars.value,
      items,
    },
    props.actions
  );

  // 完全定制的菜单条
  if (props.guiActionBar) {
    return props.guiActionBar(actionBar, Data, _RD);
  }

  return actionBar;
}
