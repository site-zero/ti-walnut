import { GlobalStatusApi } from '../../_features';
import { WnObj } from '../../_types';
import { HubModel, HubModelOptions } from './hub-view-types';
import { createRdsListHubModel } from './model/create-rds-list-hub-model';
import { createRdsMetaHubModel } from './model/create-rds-meta-hub-model';
import { createStdListHubModel } from './model/create-std-list-hub-model';
import { createStdMetaHubModel } from './model/create-std-meta-hub-model';

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
  let { model = 'STD-LIST', modelOptions = {} } = options;

  let re: HubModel;
  // 标准对象列表
  if ('STD-LIST' == model) {
    re = createStdListHubModel(_gb_sta, hubObj, modelOptions, objId);
  }
  // 标准对象元数据
  else if ('STD-META' == model) {
    re = createStdMetaHubModel(hubObj, modelOptions);
  }
  // RDS 数据列表
  else if ('RDS-LIST' == model) {
    re = createRdsListHubModel(_gb_sta, modelOptions, objId);
  }
  // RDS 数据元数据
  else if ('RDS-META' == model) {
    re = createRdsMetaHubModel(modelOptions, objId);
  }
  // 其他不支持
  else {
    throw `Unsupport HubModel [${model}]: ${JSON.stringify(options)}`;
  }

  return re;
}
