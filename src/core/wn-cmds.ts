import { AppModalProps, openAppModal } from '@site0/tijs';
import _ from 'lodash';
import { WnCmdRunnerProps } from '../lib/view';

export type OpenCmdRunnerOptions = WnCmdRunnerProps & {
  dialog?: Omit<AppModalProps, 'events' | 'comType' | 'comConf'>;
};

export async function openCmdRunner(
  options: OpenCmdRunnerOptions
): Promise<any> {
  let comConf = _.omit(options, 'dialog');
  let dialog: AppModalProps = _.assign({
    icon: 'zmdi-laptop',
    title: 'Run  Command ...',
    type: 'info',
    width: '640px',
    height: '90%',
    ...(options.dialog ?? {}),
    comType: 'WnCmdRunner',
    comConf,
    model: {
      event: 'success',
    },
  });
  let re = await openAppModal(dialog);

  return re;
}
