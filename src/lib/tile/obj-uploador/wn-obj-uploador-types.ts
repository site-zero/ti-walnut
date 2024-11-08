import { CommonProps, UploadBarProps } from '@site0/tijs';
import { ObjUploaderProps } from '../../';

export type WnObjUploadorProps = CommonProps &
  Omit<UploadBarProps, 'actions'> &
  ObjUploaderProps & {};
