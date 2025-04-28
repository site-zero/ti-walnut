import { tiPutComponents } from '@site0/tijs';
import _com_set_edit from './edit/';
import _com_set_input from './input/';
import _com_set_shelf from './shelf/';
import _com_set_tile from './tile/';
import _com_set_view from './view/';

tiPutComponents(_com_set_shelf);
tiPutComponents(_com_set_tile);
tiPutComponents(_com_set_view);
tiPutComponents(_com_set_input);
tiPutComponents(_com_set_edit);

export * from './_features';
export * from './_store';
export * from './_support';
export * from './_types';
export * from './edit/';
export * from './input/';
export * from './shelf';
export * from './tile';
export * from './view';
