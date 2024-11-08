import { CommonProps, UploadBarProps } from '@site0/tijs';
import { WnObjUploaderProps } from '../../';

export type WnObjUploadBarProps = CommonProps &
  Omit<UploadBarProps, 'actions'> &
  WnObjUploaderProps & {};
