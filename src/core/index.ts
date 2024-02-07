import _ from 'lodash';
import * as Wn from './wn';

//
// 为浏览器环境，做的引入索引
//

const G = globalThis;
if (!_.get(G, 'Wn')) {
  _.set(G, 'Wn', Wn);
}

export * from './wn';
