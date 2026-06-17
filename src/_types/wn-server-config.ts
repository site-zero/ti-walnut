import {
  I18nLang,
  LayoutProps,
  SelectValueArm,
  StrOptionItem,
  TiMatch,
  Vars,
} from "@site0/tijs";

export type DomainConfig = {
  lang?: I18nLang;
  /**
   * 指定了 i18n 资源文件的路径
   * {zh_cn: ['load://resources/i18n/zh_cn.json', '~/.i18n/zh_cn.json']]}
   * 每个资源文件，如果不是 'load://' 开头，必须登录以后才能读取
   * 这样，那些被登录之才能看到的界面（也就是主要界面）的文字可以交给标准数据模型动态管理
   * 当然为了考虑消息，你也可以不这么做，甚至将资源文件静态编译到代码里
   *
   * 如果语言没有匹配，则考虑降级重试，优先级为
   * 1) en-us
   * 2) en
   * 3) zh-cn  // 最后总是用 zh-cn 来兜底
   */
  i18n?: Record<string, string | string[]>;
  sidebar?: string;
  dicts?: string | string[];
};

export type ServerConfig = DomainConfig & {
  logo?: string;
  mainLogo?: string;
  appTitle?: string;
  protocal: "http" | "https";
  host: string;
  port: number;
  // 指定 API 请求前缀，格式类似
  // http://my_app.local.io:8080/api/
  // 其中这个 my_app.local.io 必须是 domain 的 A 映射
  // 如果是 B,C 映射，需要加上 domain 后缀
  // > http://my_app.local.io:8080/api/{myDomain}
  apiPrefix?: string;
  domain?: string;
  site?: string;
  // 指定受保护的设置，在一个应用需要跨越多个域使用的时候，
  // 我们需要每个域指定的 lang|ui|i18n|sidebar|dists|objPath|views
  // 都是不同，因此，我们可以指定 setup:"~/domain/setup.json"
  // 在登录后，即可获取相应配置
  setup?: string;
};

export type WnDictSetup = {
  /**
   * 动态字典，那么，会认为 data 为一个命令模板，上下文就是 Vars
   */
  dynamic?: boolean;
  /**
   * 动态字典命令模板执行的时候标准输入，需要 explain, 上下文就是 Vars
   */
  input?: any;

  /**
   * 字典如何获取标准字段
   */
  value?: string;
  text?: string;
  icon?: string | SelectValueArm<string, Vars>;
  tip?: string;

  /**
   * 字典如何获取数据
   */
  data?: string | Vars[];
  query?: string;
  item?: string;
};

export interface SignInForm {
  username?: string;
  password?: string;
}

export type GuiViewLayout = {
  desktop: LayoutProps;
  pad: LayoutProps;
  phone: LayoutProps;
};

export type GuiViewLayoutMode = keyof GuiViewLayout;

export type WnAssociationInput = {
  /**
   * 关联的应用列表
   */
  apps: string[] | string;
  /**
   * 关联对象的匹配条件
   */
  test: any;
};

export type WnApplication = Omit<StrOptionItem, "style" | "className">;
export type WnAssociation = {
  /**
   * 关联的应用列表
   */
  apps: string[];
  /**
   * 关联对象的匹配条件
   */
  test: TiMatch;
};
