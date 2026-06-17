import { SelectValueArm, Vars } from "@site0/tijs";
import { WnApplication, WnAssociation } from "./wn-server-config";


/**
 * @deprecated 我放弃采用 HubView 机制，绝大多数情况，它可能是在给我的维护挖坑
 */
type ServerUISetup = {
  useStdFields?: boolean;
  useStdColumns?: boolean;
  fields?: string | string[];
  columns?: string | string[];
  viewSetup?: string;
};

/**
 * @deprecated 我放弃采用 HubView 机制，绝大多数情况，它可能是在给我的维护挖坑
 */
export type UIViewSetup = {
  /**
   * 可以给扩展(譬如 WnHub)使用， 一个 dirName 具体
   * 可以对应到哪个对象绝对路径，
   * 如果没有指明，默认采用 ~/${dirName}
   *
   * 通常我们有下面的一些使用场景:
   *
   * 1) dirName=pet, objId=mgk34aqt5umn4
   * 2) dirName=pet, objId=xiaobai
   * 3) dirName=pet, objId=undefined
   *
   * 我们可以这么定义路径映射:
   *
   * ```
   * // 1) => '~/pet/'
   * // 2) => '~/pet/'
   * // 3) => '~/pet/
   * objPath: { 'pet': "~/pet" },
   *
   * // 1) => '~/pet/mgk34aqt5umn4'
   * // 2) => '~/pet/xiaobai'
   * // 3) => '~/pet/'
   * objPath: { pet: "~/pet/${objId}" },
   *
   * // 1) => 'id:mgk34aqt5umn4'
   * // 2) => '~/pet/xiaobai'
   * // 3) => '~/pet/'
   * objPath: {
   *   pet: [
   *      [ 'id:${objId}', {objId:'^[a-z0-9]{10,26}$'}],
   *      [ '~/pet/${objId}',{objId:'![BLANK]'}],
   *      '~/pet/${objId}',
   *   ]
   * },
   * // 这种模式的实现参见 util-select-value.ts
   * ```
   *
   * 如果没有声明对应的映射，三种情况输出的结果应该是:
   * // 1) => 'id:mgk34aqt5umn4'
   * // 2) => 'id:xiaobai'
   * // 3) => '~/pet'
   *
   * 如果想修改这个默认行为，你可以声明一个通用规则，譬如
   * // 1) => 'id:mgk34aqt5umn4'
   * // 2) => '~/pet/xiaobai'
   * // 3) => '~/pet/'
   * objPath: {
   *   '*': [
   *      [ 'id:${objId}', {objId:'^[a-z0-9]{10,26}$'}],
   *      [ '~/pet/${objId}',{objId:'![BLANK]'}],
   *      '~/pet/${objId}',
   *   ]
   * },
   */
  paths?: Record<string, SelectValueArm<string, Vars>>;

  /**
   * 指定一个 dirName 应该用哪个视图来呈现
   *
   * 譬如，界面上的 url 是 /user/t003
   * 那么 `dirName='user'; objId='t003`
   *
   * 则你可以这么定义:
   *
   * ```
   * // 直接指定 user 对应的视图全部信息:
   * views: { user: {  HubViewOptions } }
   *
   * // 你也可以将视图定义定义到某个系统文件里
   * views: { user: '~/.gui/user/user.view.json5' }
   *
   * // 或者是站点内的静态资源
   * views: { user: 'load://view/user.view.json' }
   * ```
   * 与 objPath 相同，字符串型的路径也是支持 `{dirName, objId}`
   * 作为上下文的模板渲染，如果是对象形式的，那么则支持 explain
   *
   * 对于下面的三个使用场景:
   *
   * 1) dirName=pet, objId=mgk34aqt5umn4
   * 2) dirName=pet, objId=xiaobai
   * 3) dirName=pet, objId=undefined
   *
   * 依然可以支持 `[ [val,match] ...]` 的选择，同时 '*'
   * 可以作为默认选择， 唯一不同的是，如果最后连  '*' 都没有匹配
   * 应该抛错
   */
  views?: Record<string, SelectValueArm<string | any, Vars>>;

  /**
   * 注册的应用列表
   */
  applications?: WnApplication[];

  /**
   * 配置编辑器可以被哪些对象打开
   */
  associations?: WnAssociation[];
};
