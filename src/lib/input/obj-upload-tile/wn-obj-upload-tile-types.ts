import { CommonProps, UploadTileProps } from '@site0/tijs';
import { WnObjUploaderProps } from '../../';

export type WnObjUploadTileProps = CommonProps &
  Omit<UploadTileProps, 'actions'> &
  WnObjUploaderProps & {};
