import { GlobalStatusApi } from '../../_features';
import { WnObj } from '../../_types';
import {
  HubModel,
  HubModelCreateSetup,
  HubModelOptions,
} from './hub-view-types';
import { createEmptyHubModel } from './model/create-empty-hub-model';
import { createRdsListHubModel } from './model/create-rds-list-hub-model';
import { createRdsMetaHubModel } from './model/create-rds-meta-hub-model';
import { createStdListHubModel } from './model/create-std-list-hub-model';
import { createStdMetaHubModel } from './model/create-std-meta-hub-model';

type HubModeMaker = (setup: HubModelCreateSetup) => HubModel;

const HUB_MODELS = new Map<string, HubModeMaker>();
HUB_MODELS.set('EMPTY', createEmptyHubModel);
HUB_MODELS.set('STD-LIST', createStdListHubModel);
HUB_MODELS.set('STD-META', createStdMetaHubModel);
HUB_MODELS.set('RDS-LIST', createRdsListHubModel);
HUB_MODELS.set('RDS-META', createRdsMetaHubModel);

export function addHubModelMaker(
  modelName: string,
  maker: HubModeMaker
) {
  HUB_MODELS.set(modelName, maker);
}

/**
 * 加载视图抽象模型
 *
 * @param modelName 模块名称：
 *  - std 就是顶级目录名
 *  - rds 就是数据实体名
 * @param objPath 模块内部对象路径【选】
 *  - std 就是目录下的对象相对路径。
 *  - rds 就是数据实体的对象主键
 * @param options 模型选项。
 */
export function useHubModel(
  _gb_sta: GlobalStatusApi,
  hubObj: WnObj,
  options: HubModelOptions,
  objId?: string
) {
  let { model = 'EMPTY', modelOptions = {} } = options;
  let setup: HubModelCreateSetup = {
    global: _gb_sta,
    hubObj,
    modelOptions,
    objId,
  };
  let maker = HUB_MODELS.get(model);
  if (!maker) {
    throw `Unsupport HubModel [${model}]: ${JSON.stringify(options)}`;
  }

  let re: HubModel = maker(setup);

  return re;
}
