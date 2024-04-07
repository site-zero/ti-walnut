import { ref } from 'vue';
import { ObjEditFeatures, ObjEditState } from './obj.edit.type';

export function userObjEdit(): ObjEditFeatures {
  let re: ObjEditState = {
    meta: ref(),
    content: ref(),
    savedContent: ref(),
    contentPath: ref(),
    contentType: ref(),
    contentData: ref(),
    fieldStatus: ref({}),
  };

  return {
    ...re,
  };
}
