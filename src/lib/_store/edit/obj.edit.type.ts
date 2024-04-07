import { FieldStatus } from '@site0/tijs';
import { Ref } from 'vue';
import { WnObj } from '../../';

/*
----------------------------------------
         Current Editing
----------------------------------------
*/
export type ObjEditState = {
  meta: Ref<WnObj | undefined>;
  content: Ref<string | undefined>;
  savedContent: Ref<string | undefined>;
  contentPath: Ref<string | undefined>;
  contentType: Ref<string | undefined>;
  contentData: Ref<any>;
  fieldStatus: Ref<Record<string, FieldStatus>>;
};
export type ObjEditActions = {};
export type ObjEditFeatures = ObjEditState & ObjEditActions;
