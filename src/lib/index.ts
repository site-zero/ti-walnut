import { tiPutComponents } from '@site0/tijs';
import _com_set_shelf from './shelf/';
import _com_set_tile from './tile/';
import _com_set_view from './view/';

tiPutComponents(_com_set_shelf);
tiPutComponents(_com_set_tile);
tiPutComponents(_com_set_view);

export * from './_features';
export * from './_store';
export * from './_top';
export * from './shelf';
export * from './tile';
export * from './view';
