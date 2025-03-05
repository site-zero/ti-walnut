import {
  addLogger,
  ENV_KEYS,
  getLogLevel,
  init_ti_std_columns,
  init_ti_std_fields,
  installTiCoreI18n,
  setDefaultLogLevel,
  setEnv,
  Str,
  tidyLogger,
  TiStore,
  Tmpl,
  updateInstalledComponentsLangs,
  useObjColumns,
  useObjFields,
  Util,
  Vars,
} from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import { installWalnutI18n } from '../i18n';
import {
  AjaxResult,
  HubViewOptions,
  isAjaxResult,
  isWnObj,
  ServerConfig,
  SignInForm,
  UserSidebar,
  WnDictSetup,
  WnExecOptions,
  WnFetchObjOptions,
  WnLoadOptions,
  WnObj,
} from '../lib';
import { installWalnutDicts } from './wn-dict';
import { wnRunCommand } from './wn-run-command';

const TICKET_KEY = 'Walnut-Ticket';
const debug = false;

export type GetUrlForObjContentOptions = {
  download?: 'auto' | 'force' | 'raw';
  downName?: string;
  withTicket?: boolean;
};

export class WalnutServer {
  /**
   * 记录远端服务器属性
   */
  private _conf: ServerConfig;

  /**
   * 会话票据
   */
  private _ticket?: string;

  /**
   * 全局缓存
   */
  private _cache: Map<string, any>;

  constructor() {
    this._conf = {
      protocal: 'http',
      host: 'localhost',
      port: 8080,
      site: undefined,
      domain: undefined,
      sidebar: false,
    };
    this._ticket = TiStore.local.getString(TICKET_KEY, undefined);
    this._cache = new Map<string, any>();
  }

  async init(conf: ServerConfig) {
    this._conf = conf;
    let lang = conf.lang ?? 'zh-cn';
    installTiCoreI18n(lang);
    installWalnutI18n(lang);
    updateInstalledComponentsLangs(lang);

    //---------------------------------------------------
    // TODO 我准备放弃 Ti.Log 这个模块了
    if (conf.logLevel) {
      setDefaultLogLevel(getLogLevel(conf.logLevel));
    }
    if (conf.logger) {
      // Logger 的排序，越短的名字越应该排在后面，这样才会覆盖前者
      // 长度相同的，需要先变成 kebab 然后再比较
      let loggerKeys = _.keys(conf.logger)
        .sort((a: string, b: string): number => {
          if (a.length == b.length) {
            let _a = _.kebabCase(a);
            let _b = _.kebabCase(b);
            if (a.length == b.length) {
              return _a.localeCompare(_b);
            }
            return _b.length - _a.length;
          }
          return b.length - a.length;
        })
        .reverse();

      if (debug) console.log('WnServer: loggerKeys=', loggerKeys);
      for (let k of loggerKeys) {
        let v = conf.logger[k];
        let lv = getLogLevel(v);
        if (debug) console.log('addLogger', k, lv);
        addLogger(k, lv);
      }
      tidyLogger();
    }
    //---------------------------------------------------

    // 初始化字典
    if (conf.dicts) {
      let dicts: Record<string, WnDictSetup> | undefined;
      if (_.isString(conf.dicts)) {
        dicts = await this.loadJson(conf.dicts);
      } else {
        dicts = conf.dicts;
      }
      installWalnutDicts(dicts);
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
  } // async init(conf: ServerConfig) {

  getConfig<T>(key: string, dft?: T): T {
    let re = _.get(this._conf, key);
    return re ?? dft;
  }

  findView(path: string, ctx: Vars = {}) {
    let aCtx = { path, ...ctx };
    let view: string | HubViewOptions | undefined = undefined;

    // 获取路径规则
    let __views = this._conf.views ?? {};
    let viewArms = __views[path];
    if (!viewArms) {
      viewArms = __views['*'];
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
      (('hub_view' == hubObj.tp && 'FILE' == hubObj.race) ||
        /\.view.json5?$/.test(hubObj.nm))
    ) {
      view = `id:${hubObj.id}`;
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
      return JSON5.parse(json) as HubViewOptions;
    }

    // 直接就是 View 本身
    return view;
  }

  getUrl(path: string) {
    let sep = path.startsWith('/') ? '' : '/';
    let { protocal, host, port } = this._conf;
    let ports = port == 80 ? '' : ':' + port;
    return `${protocal}://${host}${ports}${sep}${path}`;
  }

  getUrlForObjContent(id: string, options: GetUrlForObjContentOptions = {}) {
    let uri = [`/o/content?str=id:${id}`];
    let { download = 'auto', downName, withTicket } = options;
    if (download) {
      uri.push(`d=${download}`);
    }
    if (downName) {
      uri.push(`dnm=${encodeURIComponent(downName)}`);
    }
    if (withTicket && this._ticket) {
      uri.push(`_wn_ticket_=${this._ticket}`);
    }
    return this.getUrl(uri.join('&'));
  }

  getRequestInit(signal?: AbortSignal, options: RequestInit = {}): RequestInit {
    let headers: HeadersInit = {};
    if (this._ticket) {
      headers['X-Walnut-Ticket'] = this._ticket;
    }
    return { ...options, headers, signal };
  }

  async fetchMySession(): Promise<AjaxResult> {
    if (this._ticket) {
      let re = await Walnut.fetchAjax('/a/me');
      //console.log('fetchMySession:', re);
      if (!re.ok) {
        this._ticket = undefined;
        TiStore.local.remove(TICKET_KEY);
        setEnv(ENV_KEYS.TIMEZONE, null);
      } else {
        setEnv(ENV_KEYS.TIMEZONE, re.data.envs.TIMEZONE);
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
    let re = await this.postFormToGetAjax('/a/auth_login_by_domain_passwd', {
      site: this._conf.site,
      name: info.username,
      passwd: info.password,
      ajax: true,
    });
    if (re && re.ok && re.data) {
      this._ticket = re.data.ticket;
      TiStore.local.set(TICKET_KEY, this._ticket);
      setEnv(ENV_KEYS.TIMEZONE, re.data.vars.TIMEZONE);
    }
    return re;
  }

  async signOut(): Promise<AjaxResult> {
    let re = await this.fetchAjax('/a/sys_ajax_logout');
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
      console.error('Session SignOut Fail!!', re);
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
    let url = this.getUrl(path);
    const body = new URLSearchParams();
    _.forEach(form, (v, k) => {
      body.append(k, v);
    });

    try {
      let init = this.getRequestInit(signal, {
        method: 'post',
        body,
        signal,
      });
      let resp = await fetch(url, init);
      return await resp.text();
    } catch (err) {
      if (!quiet) {
        console.error('postFormToGetText Fail:', err, path, form);
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
    let url = this.getUrl(path);
    const body = new URLSearchParams();
    _.forEach(form, (v, k) => {
      body.append(k, v);
    });

    try {
      let init = this.getRequestInit(signal, {
        method: 'post',
        body,
        signal,
      });
      let resp = await fetch(url, init);
      return await resp.json();
    } catch (err) {
      if (!quiet) {
        console.error('postFormToGetJson Fail:', err, path, form);
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

  async loadContent(
    objPath: string,
    options: WnLoadOptions = {}
  ): Promise<string | null> {
    // 静态路径
    if (objPath.startsWith('load://')) {
      let { quiet, signal } = options;
      let loadPath = `/${objPath.substring(7)}`;
      let resp = await fetch(loadPath, { signal });
      return await resp.text();
    }
    // 尝试缓存
    let cache: Map<string, any> | undefined = undefined;
    if (options.cache) {
      cache = _.isBoolean(options.cache) ? this._cache : options.cache;
      let re = cache.get(objPath);
      if (re) {
        return re;
      }
    }

    // Walnut 的动态路径
    let urlPath = this.cookPath(objPath);
    let re = await this.fetchText(urlPath, _.omit(options, 'cache'));
    if (cache) {
      cache.set(objPath, re);
    }
    return re;
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
          const base64Data = reader.result.toString().split(',')[1];
          resolve(base64Data);
        } else if (quiet) {
          resolve('');
        } else {
          reject(new Error('Failed to convert blob to base64'));
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
      let installModule = new Function('outputs', text);
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
      urlPath += '&path=true';
    }
    if (loadAxis) {
      urlPath += '&axis=true';
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
    let url = this.getUrl(urlPath);
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
        console.error('fetchText Fail:', err, urlPath);
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
      let url = this.getUrl(urlPath);
      let init = this.getRequestInit(signal);
      let resp = await fetch(url, init);
      let text = await resp.text();
      if (cache) {
        cache.set(urlPath, text);
      }
      return JSON5.parse(text);
    } catch (err) {
      if (!quiet) {
        console.error('fetchJson Fail:', err, urlPath);
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
    return { ok: false, errCode: 'e.wn-server.fetchAjaxNil', data: reo };
  }

  async fetchSidebar(): Promise<UserSidebar> {
    let sidebar = this._conf.sidebar;
    if (debug) console.log('fetchSidebar:', sidebar);
    if (sidebar) {
      //  Load the  Static sidebar.
      if (_.isString(sidebar) && sidebar.startsWith('load://')) {
        let url = `/${sidebar.substring(7)}`;
        if (debug) console.log('fetchSidebar:url=>', url);
        let resp = await fetch(url);
        let text = await resp.text();
        let json = JSON5.parse(text);
        if (debug) console.log('sidebar is:', json);
        return json;
      }
      //  load the side bar of Walnut
      else {
        let cmdText = `ti sidebar`;
        if (_.isString(sidebar)) {
          cmdText += ' ' + sidebar;
        }
        if (debug) console.log('fetchSidebar:cmd=>', cmdText);
        let json = await this.exec(cmdText, { as: 'json' });
        if (debug) console.log('sidebar is:', json);
        return json;
      }
    }
    return { sidebar: [] };
  }

  async fetchUIFields(path: string) {
    const _ofs = useObjFields();
    let json = await this.loadJson(path);
    _.forEach(json, (fld, key) => {
      _ofs.setField(key, fld);
    });
  }

  async fetchUIColumns(path: string) {
    const _cols = useObjColumns();
    let json = await this.loadJson(path);
    _.forEach(json, (col, key) => {
      _cols.addColumn(key, col);
    });
  }

  async loadMyDynmicUISettings() {
    if (this._ticket && this._conf.ui) {
      // 动态加载预定字段
      let loading = [] as any[];
      if (this._conf.ui.fields) {
        let paths = _.concat(this._conf.ui.fields);
        for (let ph of paths) {
          loading.push(this.fetchUIFields(ph));
        }
      }
      // 表格列
      if (this._conf.ui.columns) {
        let paths = _.concat(this._conf.ui.columns);
        for (let ph of paths) {
          loading.push(this.fetchUIColumns(ph));
        }
      }
      if (loading.length > 0) {
        await Promise.all(loading);
      }
    }
  }

  async exec(cmdText: string, options: WnExecOptions = {}): Promise<any> {
    // 执行命令
    if (debug) console.log('exec>:', cmdText, options);
    let url = this.getUrl('/a/run/wn.manager');
    let init = this.getRequestInit(options.signal);
    let reo = await wnRunCommand(url, init, cmdText, options);
    if (debug) console.log('exec>:', reo);
    return reo;
  }

  async uploadFile(file: File, options: WnUploadFileOptions) {
    let {
      target,
      uploadName = file.name,
      mode = 'a',
      tmpl = '${major}(${nb})${suffix}',
      progress,
      signal,
    } = options;

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
    const url = `${this.getUrl('/o/save/stream')}?${queryString}`;

    // 构建请求对象
    let $req = new XMLHttpRequest();
    $req.send;

    // 监控请求进度
    if (progress) {
      $req.upload.addEventListener('progress', (ev) => {
        let info: WnUploadFileProgress = {
          percent: ev.loaded / ev.total,
          loaded: ev.loaded,
          total: ev.total,
        };
        progress(info);
      });
    }

    // 发送请求
    return new Promise((resolve, reject) => {
      // Done
      $req.onreadystatechange = () => {
        if (4 == $req.readyState) {
          if (200 == $req.status) {
            resolve($req.responseText);
          } else {
            reject($req.responseText);
          }
        }
      };

      // Open Connection
      $req.open('POST', url, true);

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
  mode?: 'a' | 'r' | 's';
  tmpl?: string;
  progress?: (info: WnUploadFileProgress) => void;
  signal?: AbortSignal;
};

export const Walnut = new WalnutServer();
