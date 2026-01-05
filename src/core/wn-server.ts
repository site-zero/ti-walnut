import {
  Alert,
  ENV_KEYS,
  I18n,
  init_ti_std_columns,
  init_ti_std_fields,
  installTiCoreI18n,
  Match,
  openAppModal,
  setEnv,
  SideBarItem,
  Str,
  TiStore,
  Tmpl,
  updateInstalledComponentsLangs,
  useObjColumns,
  useObjFields,
  Util,
  Vars,
} from "@site0/tijs";
import JSON5 from "json5";
import _ from "lodash";
import { installWalnutI18n } from "../i18n";
import {
  AjaxResult,
  DomainConfig,
  GlobalStatusApi,
  HubViewOptions,
  isAjaxResult,
  isWnObj,
  ServerConfig,
  SignInForm,
  UIViewSetup,
  useGlobalStatus,
  UserSidebar,
  WnApplication,
  WnAssociation,
  WnExecOptions,
  WnFetchObjOptions,
  WnLoadOptions,
  WnObj,
} from "../lib";
import { installWalnutDicts } from "./wn-dict";
import { anyToHubViewOptions } from "./wn-obj-views";
import { wnRunCommand } from "./wn-run-command";

const TICKET_KEY = "Walnut-Ticket";
const debug = false;

/**
 * 定义加载模式类型，用于指定加载 i18n 资源的模式。
 * - "public": 加载公共内容，通常对应以 `load://` 开头的静态路径。
 * - "protected": 加载受保护内容，通常对应需要用户登录才能访问的 Walnut 动态路径。
 */
type LoadMode = "public" | "protected";

export function setTicketToLocalStore(ticket?: string | null) {
  if (ticket) {
    TiStore.local.set(TICKET_KEY, ticket);
  }
}

export type GetUrlForObjContentOptions = {
  download?: "auto" | "force" | "raw";
  downName?: string;
  withTicket?: boolean;
};

export class WalnutServer {
  private _gl_sta: GlobalStatusApi;

  /**
   * 记录远端服务器属性
   */
  private _conf: ServerConfig;

  /**
   * 记录服务视图配置
   */
  private _view: UIViewSetup;

  /**
   * 会话票据
   */
  private _ticket?: string;

  /**
   * 全局缓存
   */
  private _cache: Map<string, any>;

  /**
   * 当 loadMyDynmicUISettings 加载完毕后，服务器才会准备一系列动态 UI 相关的配置
   * 通常这个时候 WnHubArena 才能加载 UI 的配置，为了保证这一点，我们需要提供一个地方
   * 来注册回调
   */
  private _after_dynamic_ui_ready: undefined | (() => Promise<void>);

  private _dynamic_ui_loading: boolean;
  private _dynamic_ui_ready: boolean;

  // 缓冲的应用列表
  private _applications: Map<string, WnApplication>;
  private _associations: WnAssociation[];

  constructor() {
    this._gl_sta = useGlobalStatus();
    this._view = {} as UIViewSetup;
    this._conf = {
      protocal: "http",
      host: "localhost",
      port: 8080,
      site: undefined,
      sidebar: "cat ~/.domain/sidebar.json",
    };
    // 如果 body 里指定了，那么就获取 session 会话
    this._ticket =
      document.body.getAttribute("session-ticket") ||
      TiStore.local.getString(TICKET_KEY, undefined);
    this._cache = new Map<string, any>();
    this._dynamic_ui_loading = false;
    this._dynamic_ui_ready = false;
    this._applications = new Map<string, WnApplication>();
    this._associations = [];
  }

  loadSettingFromDocument(doc: Document, appVersion: string, appTitle: string) {
    // 一切从 body 属性读取
    const $body = doc.body;
    // 读取服务器配置
    const configName =
      $body.getAttribute("server-config") || "server.config.json";
    const serverBase = $body.getAttribute("server-base") || "/";

    // 如果从 app 加载，则会增加一个 appPath 属性，
    // 这样 exit 命令时，会退到一个指定路径
    const appName = $body.getAttribute("app-name");
    const quitPath = $body.getAttribute("quit-path");
    const domain = $body.getAttribute("domain");
    const loginSite = $body.getAttribute("login-site");

    // 确保 appBase 是以 ‘/' 结尾的，因为根据 hubPath
    // 读取真实的打开路径 appPath 的时候，需要的是一个相对路径
    let appBase = $body.getAttribute("app-base");
    if (appBase && !appBase.endsWith("/")) {
      appBase += "/";
    }

    // 更新本地存储的会话票据
    const ticket = $body.getAttribute("session-ticket");
    setTicketToLocalStore(ticket);

    // 初始化全局状态
    this._gl_sta.data.appVersion = appVersion ?? "0.0.0";
    this._gl_sta.data.appTitle = appTitle ?? "A Walnut Application";
    this._gl_sta.data.appName = appName || undefined;
    this._gl_sta.data.appBase = appBase || "/";
    this._gl_sta.data.quitPath = quitPath || undefined;
    this._gl_sta.data.serverBase = serverBase;
    this._gl_sta.data.configName = configName;
    this._gl_sta.data.domain = domain || undefined;
    this._gl_sta.data.loginSite = loginSite || undefined;
  }

  async prepare() {
    let { serverBase, configName, domain, loginSite } = this._gl_sta.data;

    // 准备服务配置文件路径
    let configPath = [serverBase, configName].join("/");
    if (configPath.startsWith("//")) {
      configPath = configPath.substring(1).trim();
    }

    // 读取配置文件
    let resp = await fetch(configPath);
    let config = (await resp.json()) as ServerConfig;

    // 设置默认值
    _.defaults(config, {
      lang: "zh-cn",
    });

    // 确保 config 里面有正确的 domain
    config.domain = domain || undefined;
    config.site = loginSite || undefined;

    // 根据配置文件，设置全局状态管理
    if (config.logo) {
      this._gl_sta.data.appLogo = config.logo;
    }
    if (config.title) {
      this._gl_sta.data.appTitle = config.title;
    }

    // 初始化服务器
    return await this.init(config);
  }

  async init(conf: ServerConfig) {
    this._conf = conf;

    // 加载 i18n 资源
    if (conf.i18n) {
      await this.loadI18n("public");
    }

    this._setup_config(conf);

    return conf;
  } // async init(conf: ServerConfig) {

  /**
   * 根据传入的域名配置初始化相关设置
   *
   * 该方法会执行以下操作：
   * 1. 初始化语言环境
   * 2. 初始化字典
   * 3. 初始化系统界面相关设定
   * 4. 加载 i18n 资源
   *
   * @param conf - 域名配置对象，包含语言、字典、界面等相关配置
   */
  async _setup_config(conf: DomainConfig) {
    // 初始化语言
    let lang = conf.lang;
    if (lang) {
      installTiCoreI18n(lang);
      installWalnutI18n(lang);
      updateInstalledComponentsLangs(lang);
    }

    // 初始化字典
    if (conf.dicts) {
      this.loadDicts("public");
    }

    // 初始化系统界面相关的设定
    if (conf.ui) {
      // 启用标准表单字段
      if (conf.ui.useStdFields) {
        init_ti_std_fields();
      }
      // 启用标准表格列
      if (conf.ui.useStdColumns) {
        init_ti_std_columns();
      }
    }

    // 加载 i18n 资源
    if (conf.i18n) {
      await this.loadI18n("public");
    }
  }

  hasTicket() {
    return this._ticket ? true : false;
  }

  getConfig<T>(key: string, dft?: T): T {
    let re = _.get(this._conf, key);
    return re ?? dft;
  }

  findPath(path: string, content: Vars) {
    let rePath: string = path;

    // 获取路径规则
    let __paths: Vars = this._view.paths ?? {};

    // hubPath 的值类似  `setting/a/b/c` 我们需要用下面的逻辑
    // 来路由这个路径到真正的 Walnut 对象路径
    // 我们会依次循环尝试：
    //  - setting/a/b/c
    //  - setting/a/b
    //  - setting/a
    //  - setting
    // 看看 _paths 里有没有定制对应的映射
    // 譬如，我们在 setting/a  的时候找到了映射，我们会保留 b/c 部分
    // 以便最后添加到返回值的结尾，也就是说，如果规则是:
    //  - setting/a : "~/.domain"
    // 那么函数最后的返回值应该是 "~/.domain/b/c"
    let pathArms = __paths[path];
    // Handle partial path matching: try progressively shorter paths
    if (!pathArms) {
      const segments = path.split("/");

      // 尝试逐步缩短路径来匹配
      for (let i = segments.length - 1; i > 0; i--) {
        let partialPath = segments.slice(0, i).join("/");
        pathArms = __paths[partialPath];

        if (pathArms) {
          // 构造剩余路径并加入上下文，以便渲染
          content.remain = segments.slice(i).join("/") || "";
          break;
        }
      }
    }

    // 还是木有？！最后尝试一下通配符
    if (!pathArms) {
      pathArms = __paths["*"];
    }

    // 挑选路径模板
    if (pathArms) {
      rePath = Util.selectValue(content, pathArms);
    }

    // 搞定
    return rePath;
  }

  findView(path: string, ctx: Vars = {}) {
    let aCtx = { path, ...ctx };
    let view: string | HubViewOptions | undefined = undefined;

    // 获取路径规则
    let __views = this._view.views ?? {};
    let viewArms = __views[path];
    if (!viewArms) {
      viewArms = __views["*"];
    }

    // 挑选路径模板
    if (viewArms) {
      view = Util.selectValue(aCtx, viewArms);
    }

    // 根据模板渲染路径
    if (view) {
      // 编译模板，并渲染
      if (_.isString(view)) {
        let tmpl = Tmpl.parse(view);
        return tmpl.render(aCtx, false);
      }
      // 展开上下文
      return Util.explainObj(aCtx, view);
    }
  }

  /**
   * 加载指定对象的视图选项。
   *
   * 首先，它会检查 Hub 节点本身是否为一个视图对象。如果不是，它会基于 `server.config.json#views` 查找视图设置。
   * 如果找到的视图是一个字符串，它会被视为一个 JSON5 文件的路径，然后该文件会被加载并解析为 `HubViewOptions`。
   * 如果视图已经是一个 `HubViewOptions` 对象，则直接返回。
   *
   * @param hubPath Hub 节点的路径，用于在 `server.config.json#views` 中查找视图设置。
   * @param hubObj Hub 节点对象，用于确定它是否为视图对象以及查找视图设置。
   * @returns `HubViewOptions` 对象，如果未找到则返回 `null`
   */
  async loadHubViewOptions(
    hubPath: string,
    hubObj: WnObj
  ): Promise<HubViewOptions | null> {
    let view: HubViewOptions | string | undefined = undefined;
    // 对象本身就是一个视图对象
    if (
      isWnObj(hubObj) &&
      (("hub_view" == hubObj.tp && "FILE" == hubObj.race) ||
        /\.view.json5?$/.test(hubObj.nm))
    ) {
      view = `id:${hubObj.id}`;
    }
    // 对象关联了视图
    else if (hubObj && hubObj.view) {
      view = hubObj.view;
    }
    // 根据 server.config.json#views 的定义，获取视图设置
    else {
      view = this.findView(hubPath, hubObj);
    }

    // 防空
    if (!view) {
      return null;
    }

    // View 是一个 JSON5 文件, 需要加载一下
    if (_.isString(view)) {
      let json = await this.loadContent(view, { cache: true });
      if (!json) {
        return null;
      }
      let input = JSON5.parse(json);
      return anyToHubViewOptions(input);
    }

    // 直接就是 View 本身
    return anyToHubViewOptions(view);
  }

  getAppStaticPath(path: string) {
    let { serverBase = "/" } = this._gl_sta.data;
    return Util.appendPath(serverBase, path);
  }

  getUrl(path: string, params?: Vars) {
    let sep = path.startsWith("/") ? "" : "/";
    let { protocal, host, port } = this._conf;
    let ports = port == 80 ? "" : ":" + port;
    let server_path: string;
    if (host) {
      server_path = `${protocal}://${host}${ports}${sep}${path}`;
    } else {
      server_path = `${sep}${path}`;
    }

    const qs = new URLSearchParams();
    _.forEach(params, (v, k) => {
      qs.append(k, v);
    });
    let queryString = qs.toString();

    // let qs = [] as string[];
    // if (params) {
    //   _.forEach(params, (v, k) => {
    //     qs.push(`${k}=${encodeURIComponent(v)}`);
    //   });
    // }
    // let queryString = "";
    // if (qs.length > 0) {
    //   queryString = "?" + qs.join("&");
    // }
    return [server_path, queryString].filter(Boolean).join("?");
  }

  getUrlForObjContent(id: string, options: GetUrlForObjContentOptions = {}) {
    let uri = [`/o/content?str=id:${id}`];
    let { download = "auto", downName, withTicket } = options;
    if (download) {
      uri.push(`d=${download}`);
    }
    if (downName) {
      uri.push(`dnm=${encodeURIComponent(downName)}`);
    }
    if (withTicket && this._ticket) {
      uri.push(`_wn_ticket_=${this._ticket}`);
    }
    return this.getUrl(uri.join("&"));
  }

  getRequestInit(signal?: AbortSignal, options: RequestInit = {}): RequestInit {
    let headers: HeadersInit = {};
    if (this._ticket) {
      headers["X-Walnut-Ticket"] = this._ticket;
    }
    return { ...options, headers, signal };
  }

  async fetchMySession(): Promise<AjaxResult> {
    if (debug) console.log(`fetchMySession: ticket=[${this._ticket}]`);
    if (this._ticket) {
      let re = await Walnut.fetchAjax("/a/me");
      if (debug) console.log("fetchMySession:", re);
      if (!re.ok) {
        this._ticket = undefined;
        TiStore.local.remove(TICKET_KEY);
        setEnv(ENV_KEYS.TIMEZONE, null);
      } else {
        setEnv(ENV_KEYS.TIMEZONE, re.data.me?.meta?.TIMEZONE);
      }
      return re;
    }
    return new Promise((resolve) => {
      resolve({
        ok: false,
      });
    });
  }

  async signInToDomain(info: SignInForm): Promise<AjaxResult> {
    // 对于没有指定站点的配置，那么自然只能采用系统账号登录
    let postUrl = this._conf.site
      ? "/a/auth_login_by_domain_passwd"
      : "/a/sys_login_by_passwd";

    // 提交请求
    let re = await this.postFormToGetAjax(postUrl, {
      site: this._conf.site,
      name: info.username,
      passwd: info.password,
      ajax: true,
    });

    // 处理返回
    if (re && re.ok && re.data) {
      this.saveTicketToLocal(re.data.ticket, re.data.me?.meta?.TIMEZONE);
    }
    return re;
  }

  saveTicketToLocal(ticket: string | null | undefined, tz?: string) {
    this._ticket = ticket || undefined;
    // 移除
    if (!ticket) {
      TiStore.local.remove(TICKET_KEY);
      //document.body.removeAttribute("session-ticket");
    }
    // 设置
    else {
      TiStore.local.set(TICKET_KEY, ticket);
      //document.body.setAttribute("session-ticket", ticket);
    }

    // 设置时区
    setEnv(ENV_KEYS.TIMEZONE, tz || null);
  }

  async signOut(): Promise<AjaxResult> {
    let re = await this.fetchAjax("/a/sys_ajax_logout");
    if (re.ok) {
      // Quiet parent Sesssion
      if (re.data && re.data.parent) {
        this._ticket = re.data.parent.ticket;
        TiStore.local.set(TICKET_KEY, this._ticket);
      }
      // Cancel session
      else {
        this._ticket = undefined;
        TiStore.local.remove(TICKET_KEY);
      }
    }
    // Handler error
    else {
      console.error("Session SignOut Fail!!", re);
      alert(JSON.stringify(re));
    }
    return re;
  }

  async postFormToGetText(
    path: string,
    form: Record<string, any>,
    options: WnLoadOptions = {}
  ): Promise<string | null> {
    let { quiet, signal } = options;
    let url = this.getUrl(path, options.query);
    const body = new URLSearchParams();
    _.forEach(form, (v, k) => {
      body.append(k, v);
    });

    try {
      let init = this.getRequestInit(signal, {
        method: "post",
        body,
        signal,
      });
      let resp = await fetch(url, init);
      return await resp.text();
    } catch (err) {
      if (!quiet) {
        console.error("postFormToGetText Fail:", err, path, form);
      }
      return null;
    }
  }

  async postFormToGetJson(
    path: string,
    form: Record<string, any>,
    options: WnLoadOptions = {}
  ): Promise<any> {
    let { quiet, signal } = options;
    let url = this.getUrl(path, options.query);
    const body = new URLSearchParams();
    _.forEach(form, (v, k) => {
      body.append(k, v);
    });

    try {
      let init = this.getRequestInit(signal, {
        method: "post",
        body,
        signal,
      });
      let resp = await fetch(url, init);
      let text = await resp.text();
      return JSON5.parse(text);
    } catch (err) {
      if (!quiet) {
        console.error("postFormToGetJson Fail:", err, path, form);
      }
      return null;
    }
  }

  async postFormToGetAjax(
    path: string,
    form: Record<string, any>,
    options: WnLoadOptions = {}
  ): Promise<AjaxResult> {
    let reo = await this.postFormToGetJson(path, form, options);
    return reo as AjaxResult;
  }

  /**
   * 异步加载指定对象路径的内容。
   *
   * 该方法会尝试从缓存中获取内容，如果缓存中不存在，则根据对象路径的类型（静态路径或 Walnut 动态路径）进行加载。
   * 静态路径以 `load://` 开头，可直接通过 `fetch` 请求加载；动态路径需要用户登录后才能读取。
   *
   * @param objPath - 对象的路径，可以是静态路径或 Walnut 动态路径。
   * @param options - 加载选项，包含是否使用缓存、是否静默处理错误等信息。
   * @returns 如果成功加载内容，则返回内容字符串；否则返回 `null`。
   */
  async loadContent(
    objPath: string,
    options: WnLoadOptions = {}
  ): Promise<string | null> {
    // 尝试缓存
    let cache: Map<string, any> | undefined = undefined;
    if (options.cache) {
      cache = _.isBoolean(options.cache) ? this._cache : options.cache;
      let re = cache.get(objPath);
      if (re) {
        return re;
      }
    }

    // 静态路径
    if (objPath.startsWith("load://")) {
      let { signal } = options;
      let loadPath = this.getAppStaticPath(objPath.substring(7));
      let resp = await fetch(loadPath, { signal });
      let re = await resp.text();
      if (cache) {
        cache.set(objPath, re);
      }
      return re;
    }

    // Walnut 的动态路径，只有登录才能读取
    if (this._ticket) {
      let urlPath = this.cookPath(objPath);
      let re = await this.fetchText(urlPath, _.omit(options, "cache"));
      if (cache) {
        cache.set(objPath, re);
      }
      return re;
    }

    // 啥都木有
    return null;
  }

  /**
   * 异步加载指定对象路径列表的内容，并将加载结果以字符串数组的形式返回。
   *
   * 该方法会遍历传入的对象路径列表，调用 `loadContent` 方法异步加载每个路径的内容。
   * 加载成功的内容会被添加到结果数组中，最终返回该数组。
   *
   * @param objPath - 对象的路径，可以是单个路径字符串或路径字符串数组。
   * @param options - 加载选项，包含是否使用缓存、是否静默处理错误等信息，会传递给 `loadContent` 方法。
   * @returns 一个 Promise，解析为包含所有成功加载内容的字符串数组。
   */
  async loadContentAsList(
    objPath: string | string[],
    options: WnLoadOptions = {}
  ): Promise<string[]> {
    let re = [] as string[];
    let paths = _.concat(objPath);
    let loading: Promise<void>[] = [];
    let that = this;
    async function __load_path(path: string) {
      if (path) {
        let content = await that.loadContent(path, options);
        if (content) {
          re.push(content);
        }
      }
    }
    for (let path of paths) {
      if (!path) {
        continue;
      }
      loading.push(__load_path(path));
    }
    await Promise.all(loading);
    return re;
  }

  /**
   * 异步加载公共内容。
   *
   * 该方法会过滤出以 `load://` 开头的对象路径，然后调用 `loadContentAsList` 方法异步加载这些路径的内容。
   * 如果没有符合条件的路径，将返回一个空数组。
   *
   * @param objPath - 对象的路径，可以是单个路径字符串或路径字符串数组。
   * @param options - 加载选项，包含是否使用缓存、是否静默处理错误等信息，会传递给 `loadContentAsList` 方法。
   * @returns 一个 Promise，解析为包含所有成功加载的公共内容的字符串数组。
   */
  async loadPublicContents(
    objPath: string | string[],
    options: WnLoadOptions = {}
  ) {
    let paths = [] as string[];
    for (let path of _.concat(objPath)) {
      if (path.startsWith("load://")) {
        paths.push(path);
      }
    }
    if (_.isEmpty(paths)) {
      return [];
    }
    return await this.loadContentAsList(paths, options);
  }

  /**
   * 异步加载受保护的内容。
   *
   * 该方法会过滤出不以 `load://` 开头的对象路径，这些路径通常代表需要用户登录才能访问的 Walnut 动态路径。
   * 然后调用 `loadContentAsList` 方法异步加载这些路径的内容。如果没有符合条件的路径，将返回一个空数组。
   *
   * @param objPath - 对象的路径，可以是单个路径字符串或路径字符串数组。
   * @param options - 加载选项，包含是否使用缓存、是否静默处理错误等信息，会传递给 `loadContentAsList` 方法。
   * @returns 一个 Promise，解析为包含所有成功加载的受保护内容的字符串数组。
   */
  async loadProtectedContents(
    objPath: string | string[],
    options: WnLoadOptions = {}
  ) {
    let paths = [] as string[];
    for (let path of _.concat(objPath)) {
      if (path.startsWith("load://")) {
        continue;
      }
      paths.push(path);
    }
    if (_.isEmpty(paths)) {
      return [];
    }
    return await this.loadContentAsList(paths, options);
  }

  /**
   * 异步加载国际化资源。
   *
   * 根据传入的加载模式（`public` 或 `protected`），加载对应的国际化资源文件。
   * 首先会根据配置中的语言设置获取对应语言的资源路径，然后根据加载模式调用不同的方法加载资源。
   * 加载成功后，将资源内容解析为 JSON 并安装到国际化系统中。
   *
   * @param mode - 加载模式，`public` 表示加载公共内容，`protected` 表示加载受保护内容。
   */
  async loadI18n(mode: LoadMode) {
    let lang = this._conf.lang ?? "zh-cn";
    let paths = this._conf.i18n?.[lang] || this._conf.i18n?.["zh-cn"];
    // 防空
    if (!paths || _.isEmpty(paths)) {
      return;
    }
    // 收集结果
    let results = [] as string[];
    if (mode == "public") {
      results = await this.loadPublicContents(paths);
    } else {
      results = await this.loadProtectedContents(paths);
    }
    // 安装
    for (let result of results) {
      if (result) {
        let json = JSON5.parse(result);
        I18n.putAll(json);
      }
    }
  }

  /**
   * 异步加载字典资源。
   *
   * 根据传入的加载模式（`public` 或 `protected`），加载对应的字典资源文件。
   * 首先会根据配置中的字典设置获取字典路径，然后根据加载模式调用不同的方法加载资源。
   * 加载成功后，将资源内容解析为 JSON 并安装到字典系统中。
   *
   * @param mode - 加载模式，`public` 表示加载公共内容，`protected` 表示加载受保护内容。
   */
  async loadDicts(mode: LoadMode) {
    const paths = this._conf.dicts;
    // 防空
    if (_.isEmpty(paths)) return;
    // 收集结果
    let results = [] as string[];
    if (mode == "public") {
      results = await this.loadPublicContents(paths!);
    } else {
      results = await this.loadProtectedContents(paths!);
    }
    // 安装
    for (let result of results) {
      if (result) {
        let json = JSON5.parse(result);
        installWalnutDicts(json);
      }
    }
  }

  /**
   * 异步加载视图设置。
   *
   * 该方法会从配置中获取视图设置文件的路径，若路径存在，则加载该文件内容，
   * 并将内容解析为 JSON 格式后赋值给 `_view` 属性。
   * 若路径不存在或加载失败，则不做任何操作。
   */
  async loadViewSetup() {
    const viewSetupPath = this._conf.ui?.viewSetup;
    // 防空
    if (!viewSetupPath) return;
    // 加载
    let viewSetup = await this.loadContent(viewSetupPath);
    // 安装
    if (viewSetup) {
      this._view = JSON5.parse(viewSetup);

      // 准备应用列表
      this._applications = new Map();
      if (this._view.applications) {
        for (let app of this._view.applications) {
          this._applications.set(app.value, app);
        }
      }

      // 准备关联列表
      this._associations = [];
      if (this._view.associations) {
        for (let as of this._view.associations) {
          this._associations.push({
            apps: _.concat(as.apps),
            test: Match.parse(as.test, false),
          });
        }
      }
    }
  }

  /**
   * 异步加载指定路径的文件并将其转换为Base64编码的字符串。
   *
   * @param objPath - 文件的路径。
   * @param signal - 可选的AbortSignal对象，用于中止请求。
   * @returns 返回一个Promise对象，解析为Base64编码的字符串。
   * @throws 如果请求失败或无法将Blob转换为Base64编码字符串，则抛出错误。
   *
   * @example
   *
   * ```
   * let base64Data = await Walnut.loadBase64Data('id:xxx');
   * img.src = `data:image/jpeg;base64,${base64Data}`
   * ```
   */
  async loadBase64Data(
    objPath: string,
    options: WnLoadOptions = {}
  ): Promise<string> {
    let { quiet, signal } = options;
    let urlPath = this.cookPath(objPath);
    let url = this.getUrl(urlPath);
    let init = this.getRequestInit(signal);
    let resp = await fetch(url, init);
    if (!resp.ok) {
      throw new Error(`Fail to loadBase64(${objPath}): ${resp.statusText}`);
    }
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64Data = reader.result.toString().split(",")[1];
          resolve(base64Data);
        } else if (quiet) {
          resolve("");
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 将对象路径转换为可用于获取内容的 URL。
   *
   * @param objPath 对象系统路径。譬如 `~/.tmp/a.txt`
   * @returns 编码后的 URL 字符串，可用于获取指定路径的内容。
   */
  cookPath(objPath: string): string {
    return `/o/content?str=${encodeURIComponent(objPath)}`;
  }

  async loadJson(objPath: string, options: WnLoadOptions = {}): Promise<any> {
    if (options.cache) {
    }

    let re = await this.loadContent(objPath, options);
    if (_.isNil(re)) {
      return re ?? null;
    }
    try {
      return JSON5.parse(re);
    } catch (err) {
      console.error(`loadJson(${objPath}) fail to parse JSON:`, re, err);
    }
  }

  async loadJsModule(jsPath: string, options: WnLoadOptions = {}) {
    let { quiet, signal } = options;
    //let jsUrl = this.getUrl(jsPath);
    //document.cookie = `SEID=${this._ticket}; path=/`;
    let text = await this.fetchText(jsPath, options);
    if (!text || Str.isBlank(text)) {
      return {};
    }
    // 假设， text 的代码类似
    // (function(ex){/* you can export your module */})(exports)
    let exports = {};
    try {
      let installModule = new Function("outputs", text);
      installModule(exports);
      //console.log('loadJsModule', jsPath, text, exports);
      return exports;
    } catch (error) {
      if (quiet) {
        return {};
      }
      console.error(`Fail to loadJsModule: ${jsPath} :: ${error}`);
    }
  }

  async getObj(id: string, options: WnFetchObjOptions = {}) {
    return await this.fetchObj(`id:${id}`, options);
  }

  async fetchObj(
    objPath: string,
    options: WnFetchObjOptions = {}
  ): Promise<WnObj> {
    let { loadAxis, loadPath, signal } = options;
    let urlPath = `/o/fetch?str=${encodeURIComponent(objPath)}`;
    if (loadPath) {
      urlPath += "&path=true";
    }
    if (loadAxis) {
      urlPath += "&axis=true";
    }
    let re: AjaxResult = await this.fetchAjax(urlPath, options);
    if (re.ok && isWnObj(re.data)) {
      return re.data;
    }
    throw new Error(JSON.stringify(re));
  }

  async fetchText(
    urlPath: string,
    options: WnLoadOptions = {}
  ): Promise<string | null> {
    // 尝试缓存
    let cache: Map<string, any> | undefined = undefined;
    if (options.cache) {
      cache = _.isBoolean(options.cache) ? this._cache : options.cache;
      let re = cache.get(urlPath);
      if (re) {
        return re;
      }
    }
    let { quiet, signal } = options;
    let url = this.getUrl(urlPath, options.query);
    let init = this.getRequestInit(signal);
    try {
      let resp = await fetch(url, init);
      let re = await resp.text();
      if (cache) {
        cache.set(urlPath, re);
      }
      return re;
    } catch (err) {
      if (!quiet) {
        console.error("fetchText Fail:", err, urlPath);
      }
      return null;
    }
  }

  async fetchJson(urlPath: string, options: WnLoadOptions = {}): Promise<any> {
    // 尝试缓存
    let cache: Map<string, any> | undefined = undefined;
    if (options.cache) {
      cache = _.isBoolean(options.cache) ? this._cache : options.cache;
      let text = cache.get(urlPath);
      if (text) {
        return JSON5.parse(text);
      }
    }
    let { quiet, signal } = options;
    try {
      let url = this.getUrl(urlPath, options.query);
      let init = this.getRequestInit(signal);
      let resp = await fetch(url, init);
      let text = await resp.text();
      if (cache) {
        cache.set(urlPath, text);
      }
      return JSON5.parse(text);
    } catch (err) {
      if (!quiet) {
        console.error("fetchJson Fail:", err, urlPath);
      }
      return null;
    }
  }

  async fetchAjax(
    urlPath: string,
    options: WnLoadOptions = {}
  ): Promise<AjaxResult> {
    let reo = await this.fetchJson(urlPath, options);
    if (isAjaxResult(reo)) {
      return reo;
    }
    if (reo) {
      return {
        ok: true,
        data: reo,
      };
    }
    return { ok: false, errCode: "e.wn-server.fetchAjaxNil", data: reo };
  }

  async fetchSidebar(): Promise<UserSidebar> {
    let sidebar = this._conf.sidebar;
    if (debug) console.log("fetchSidebar:", sidebar);
    let re: UserSidebar = { sidebar: [] };
    if (sidebar) {
      //  Load the  Static sidebar.
      if (sidebar.startsWith("load://")) {
        let sidebarPath = this.getAppStaticPath(sidebar.substring(7));
        if (debug) console.log("fetchSidebar:url=>", sidebarPath);
        let resp = await fetch(sidebarPath);
        let text = await resp.text();
        let json = JSON5.parse(text);
        if (debug) console.log("sidebar is:", json);
        re = json as UserSidebar;
      }
      //  load the side bar of Walnut
      else {
        let cmdText = sidebar || "cat ~/.domain/sidebar.json";
        if (debug) console.log("fetchSidebar:cmd=>", cmdText);
        let json = await this.exec(cmdText, { as: "json" });
        if (debug) console.log("sidebar is:", json);
        re = json as UserSidebar;
      }
    }

    // 确保每个菜单项目的链接是正确的
    let { appBase = "/" } = this._gl_sta.data;
    const _tidy_href_of_bar_item = (sbItem: SideBarItem) => {
      if (sbItem.href) {
        if (!sbItem.href.startsWith(appBase)) {
          sbItem.href = Util.appendPath(appBase, sbItem.href);
        }
      }
      if (sbItem.items) {
        for (let subItem of sbItem.items) {
          _tidy_href_of_bar_item(subItem);
        }
      }
    };
    for (let sbItem of re.sidebar) {
      _tidy_href_of_bar_item(sbItem);
    }

    return re;
  }

  async fetchUIFields(path: string) {
    const _ofs = useObjFields();
    let json = await this.loadJson(path);
    // 获取失败
    if (false === json.ok) {
      await Alert(`Fail to fetchUIFields: ${path}`);
      console.error(`Fail to fetchUIFields: ${path}`, json);
      return;
    }
    // 逐个注册
    _.forEach(json, (fld, key) => {
      _ofs.addFieldIfNoExists(key, fld);
    });
  }

  async fetchUIColumns(path: string) {
    const _cols = useObjColumns();
    let json = await this.loadJson(path);
    // 获取失败
    if (false === json.ok) {
      await Alert(`Fail to fetchUIColumns: ${path}`);
      console.error(`Fail to fetchUIColumns: ${path}`, json);
      return;
    }
    // 逐个注册
    _.forEach(json, (col, key) => {
      _cols.addColumnIfNoExists(key, col);
    });
  }

  async loadMyDynmicUISettings() {
    let loading = [] as Promise<void>[];
    if (this._ticket) {
      if (this._conf.ui) {
        // 动态加载预定义字段
        if (this._conf.ui.fields) {
          let paths = _.concat(this._conf.ui.fields);
          for (let ph of paths) {
            loading.push(this.fetchUIFields(ph));
          }
        }
        // 动态加载预定义表格列
        if (this._conf.ui.columns) {
          let paths = _.concat(this._conf.ui.columns);
          for (let ph of paths) {
            loading.push(this.fetchUIColumns(ph));
          }
        }
      }

      // 动态加载视图设置
      loading.push(this.loadViewSetup());

      // 动态加载数据字典
      if (this._conf.dicts) {
        loading.push(this.loadDicts("protected"));
      }

      // 动态加载保护多国语言
      if (this._conf.i18n) {
        loading.push(this.loadI18n("protected"));
      }

      // 开始加载 ...
      if (loading.length > 0) {
        this._dynamic_ui_loading = true;
        await Promise.all(loading);
        // 执行回调函数
        if (this._after_dynamic_ui_ready) {
          await this._after_dynamic_ui_ready();
        }
        this._dynamic_ui_loading = false;
        this._dynamic_ui_ready = true;
      }
    }
  }

  /**
   * 设置动态 UI 加载完成后的回调函数。
   * 当 `loadMyDynmicUISettings` 加载完毕后，会执行该回调函数。
   * 通常用于在动态 UI 配置准备好后，执行 WnHubArena 加载 UI 配置等操作。
   *
   * @param callback - 动态 UI 加载完成后要执行的回调函数，返回一个 Promise。
   */
  set afterDynamicUIReady(callback: () => Promise<void>) {
    this._after_dynamic_ui_ready = callback;
  }

  /**
   * 动态 UI 相关的配置是否已经加载完毕
   */
  get isDynamicUIReady() {
    return this._dynamic_ui_ready;
  }

  /**
   * 动态 UI 相关的配置是否正在加载
   */
  get isDynamicUILoading() {
    return this._dynamic_ui_loading;
  }

  /**
   * 根据传入的 WnObj 对象，获取与之关联的应用列表。
   *
   * 该方法会遍历服务器缓存的关联关系（`_associations`），检查每个关联规则是否匹配传入的对象。
   * 对于匹配的关联规则，将其对应的应用名称收集起来，去重后从应用缓存（`_applications`）中获取对应的应用对象。
   *
   * @param obj - 用于匹配关联规则的 WnObj 对象。
   * @returns 与传入对象关联的 WnApplication 对象数组，如果没有匹配的应用，则返回空数组。
   */
  getObjApplications(obj: WnObj) {
    let appNames: string[] = [];
    for (let as of this._associations) {
      if (as.test.test(obj)) {
        appNames.push(...as.apps);
      }
    }
    let apps = _.uniq(appNames);
    let re = [] as WnApplication[];
    for (let appName of apps) {
      let app = this._applications.get(appName);
      if (app) {
        re.push(app);
      }
    }
    return re;
  }

  /**
   * 获取对象的默认应用程序。
   *
   * 该方法会调用 `getObjApplications` 方法获取对象关联的应用程序列表，
   * 如果列表不为空，则返回列表中的第一个应用程序。
   *
   * @param obj - 要查询的对象
   * @returns 对象的默认应用程序，如果没有关联应用程序则返回 undefined
   */
  getObjDefaultApplication(obj: WnObj) {
    let apps = this.getObjApplications(obj);
    if (apps.length > 0) {
      return apps[0];
    }
  }

  async showRuntimeInfo() {
    let re = await this.exec("sys -runtime -nice");
    await openAppModal({
      title: "Walnut Runtime Info",
      type: "info",
      position: "right",
      width: "640px",
      height: "100%",
      clickMaskToClose: true,
      textOk: null,
      textCancel: null,
      comType: "TiHtmlSnippet",
      comConf: {
        content: `<pre>${re}</pre>`,
      },
    });
  }

  async genIds(n = 1, mode = "snowQ::10"): Promise<string[]> {
    let ids = await this.exec(`val @gen '${mode}' -n ${n} -json`, {
      as: "json",
    });
    return ids as string[];
  }

  async genId(mode = "snowQ::10"): Promise<string> {
    let ids = await this.genIds(1, mode);
    return ids[0];
  }

  async serverToday(fmt = "yyyy-MM-dd", timezone = "UTC"): Promise<string> {
    let re = await this.exec(`datex @fmt '${fmt}' @timezone ${timezone}`);
    return _.trim(re as string);
  }

  async serverNow(
    fmt = "yyyy-MM-dd HH:mm:ss",
    timezone = "UTC"
  ): Promise<string> {
    let re = await this.exec(`datex @fmt '${fmt}' @timezone ${timezone}`);
    return _.trim(re as string);
  }

  async exec(cmdText: string, options: WnExecOptions = {}): Promise<any> {
    // 执行命令
    if (debug) console.log("exec>:", cmdText, options);

    /**
     * 如果设置了 beacon 模式， 很多时候，执行命令是需要跨域的
     * 因此一定需要带上这个参数，以便把会话票据加入到 query string 里
     * 否则服务器从 session 里会取得不了会话票据
     */
    let url: string;
    if (options.beacon && this._ticket) {
      url = this.getUrl("/a/beacon_run/wn-term", {
        _wn_ticket_: this._ticket,
      });
    } else {
      url = this.getUrl("/a/run/wn-term");
    }

    // 准备请求细节
    let init = this.getRequestInit(options.signal);

    // 执行
    let reo = await wnRunCommand(url, init, cmdText, options);
    if (debug) console.log("exec>:", reo);
    return reo;
  }

  async uploadFile(
    file: File,
    options: WnUploadFileOptions
  ): Promise<AjaxResult> {
    let {
      target,
      uploadName = file.name,
      mode = "a",
      tmpl = "${major}(${nb})${suffix}",
      progress,
      signal,
      addMeta = {},
    } = options;

    // 判断是否支持该文件类型
    // 这个 accept 就是标准的 input.accept 属性
    // 支持 ".txt, text/plain, image/*" 这种格式的值
    // 如果检查失败直接抛错
    if (options.accept && file) {
      const _accepts = options.accept
        .toLowerCase()
        .split(",")
        .map((item) => item.trim());
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      let isAccepted = false;

      for (const _accept of _accepts) {
        // 后缀模式: .pdf
        if (_accept.startsWith(".")) {
          // 检查文件扩展名
          const extension = _accept.toLowerCase();
          if (fileName.endsWith(extension)) {
            isAccepted = true;
            break;
          }
        }
        // 通配符: image/*
        else if (_accept.includes("*")) {
          // 使用正则表达式处理包含 * 的 MIME 类型
          const pattern = _accept.replace(/\*/g, ".*");
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(fileType)) {
            isAccepted = true;
            break;
          }
        }
        // 直接比较 MIME 类型
        else {
          if (fileType === _accept) {
            isAccepted = true;
            break;
          }
        }
      }

      if (!isAccepted) {
        let msg = I18n.textf("i18n:warn-unaccept-file", {
          fileType,
          fileName,
          accept: options.accept,
        });
        await Alert(msg, { type: "warn" });
        throw new Error(msg);
      }
    }

    // 空值就没必要更新了
    addMeta = Util.filterRecordNilValue(addMeta || {});

    // 构建请求投
    let init = this.getRequestInit(signal);

    // 构建查询参数
    const params: Vars = {
      str: target,
      nm: uploadName,
      sz: file.size,
      mime: file.type,
      m: mode,
      tmpl,
    };

    // 将 params 转换为查询字符串
    const queryString = new URLSearchParams(params).toString();

    // 构建上传的 URL，包含查询字符串
    const url = `${this.getUrl("/o/save/stream")}?${queryString}`;

    // 构建请求对象
    let $req = new XMLHttpRequest();
    $req.send;

    // 监控请求进度
    if (progress) {
      $req.upload.addEventListener("progress", (ev) => {
        let info: WnUploadFileProgress = {
          percent: ev.loaded / ev.total,
          loaded: ev.loaded,
          total: ev.total,
        };
        progress(info);
      });
    }

    // 保留本对象指针
    const wn = this;

    // 发送请求
    return new Promise<AjaxResult>((resolve, reject) => {
      // Done
      $req.onreadystatechange = () => {
        //console.log('uploadFile : $req.readyState', $req.readyState);
        if (4 == $req.readyState) {
          let reo = JSON5.parse($req.responseText);
          //console.log("uploadFile : readyState == 4", reo);
          if (200 == $req.status && reo.ok) {
            let obj = reo.data;
            // 需要额外更新文件的元数据
            if (addMeta && !_.isEmpty(addMeta) && obj && obj.id) {
              wn.exec(`o 'id:${obj.id}' @update @json -cqn`, {
                as: "json",
                input: JSON.stringify(addMeta),
              })
                .then((newObj) => {
                  resolve({ ok: true, data: newObj });
                })
                .catch((err) => {
                  reject(err);
                });
            }
            // 无需增加额外元数据，直接返回
            else {
              resolve(reo);
            }
          }
          // 哎呀妈呀，出错了
          else {
            reject(reo);
          }
        }
      };

      // Open Connection
      $req.open("POST", url, true);

      // Set headers
      _.forOwn(init.headers, (val, key) => {
        $req.setRequestHeader(key, val);
      });

      // Send Data
      $req.send(file);
    });
  }
}

export type WnUploadFileProgress = {
  /**
   * 上传进度百分比: 0-1
   */
  percent: number;
  /**
   * 已上传字节数
   */
  loaded: number;
  /**
   * 文件总字节数
   */
  total: number;
};

export type WnUploadFileOptions = {
  uploadName?: string;
  target: string;
  mode?: "a" | "r" | "s";
  tmpl?: string;
  // accept="image/*, text/*, .jpg, .jpeg, .pdf"
  accept?: string;
  progress?: (info: WnUploadFileProgress) => void;
  signal?: AbortSignal;
  addMeta?: Vars;
};

export const Walnut = new WalnutServer();
