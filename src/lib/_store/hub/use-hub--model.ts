import { HubModel, HubModelOptions } from './hub-view-types';
import { createRdsListHubModel } from './model/create-rds-list-hub-model';
import { createRdsMetaHubModel } from './model/create-rds-meta-hub-model';
import { createStdListHubModel } from './model/create-std-list-hub-model';
import { createStdMetaHubModel } from './model/create-std-meta-hub-model';

export function useHubModel(
  modelName: string,
  objId: string | undefined,
  options: HubModelOptions
) {
  let { model = 'STD-LIST', modelOptions = {} } = options;

  let re: HubModel;
  // 标准对象列表
  if ('STD-LIST' == model) {
    re = createStdListHubModel(modelName, objId, modelOptions);
  }
  // 标准对象元数据
  else if ('STD-META' == model) {
    re = createStdMetaHubModel(objId ?? '', modelOptions);
  }
  // RDS 数据列表
  else if ('RDS-LIST' == model) {
    re = createRdsListHubModel(modelName, objId, modelOptions);
  }
  // RDS 数据元数据
  else if ('RDS-META' == model) {
    re = createRdsMetaHubModel(modelName, objId, modelOptions);
  }
  // 其他不支持
  else {
    throw `Unsupport HubModel [${modelName}]`;
  }

  return re;
}
