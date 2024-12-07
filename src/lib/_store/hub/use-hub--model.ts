import { HubModel, HubModelOptions } from './hub-view-types';
import { createStdListHubModel } from './model/create-std-list-hub-model';

export function useHubModel(modelName: string, options: HubModelOptions) {
  let { model = 'STD-LIST', modelOptions = {} } = options;

  let re: HubModel;
  if ('STD-LIST' == model) {
    re = createStdListHubModel(modelName, modelOptions);
  }
  // 其他不支持
  else {
    throw `Unsupport HubModel [${modelName}]`;
  }

  return re;
}
