import {
  addLogger,
  getLogger,
  getLogLevel,
  installTiCoreI18n,
  setDefaultLogLevel,
  Str,
  tidyLogger,
  TiStore,
  updateInstalledComponentsLangs,
} from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import { installWalnutI18n } from '../i18n';
import {
  AjaxResult,
  FetchObjOptions,
  ServerConfig,
  SignInForm,
  UserSidebar,
  WnDictSetup,
  WnExecOptions,
  WnObj,
} from '../lib';
import { installWalnutDicts } from './wn-dict';
import { wnRunCommand } from './wn-run-command';

const TICKET_KEY = 'Walnut-Ticket';
const log = getLogger('wn.core.server');

export class WalnutServer {
  /**
   * 记录远端服务器属性
   */
  private _conf: ServerConfig;

  /**
   * 会话票据
   */
  private _ticket?: string;

  constructor() {
    this._conf = {
      protocal: 'http',
      host: 'localhost',
      port: 8080,
      site: undefined,
      sidebar: false,
    };
    this._ticket = TiStore.local.getString(TICKET_KEY, undefined);
  }

  async init(conf: ServerConfig) {
    log.info('init server', conf);
    this._conf = conf;
    let lang = conf.lang ?? 'zh-cn';
    installTiCoreI18n(lang);
    installWalnutI18n(lang);
    updateInstalledComponentsLangs(lang);
    if (conf.logLevel) {
      setDefaultLogLevel(getLogLevel(conf.logLevel));
    }
    if (conf.logger) {
      _.forEach(conf.logger, (v, k) => {
        let lv = getLogLevel(v);
        addLogger(k, lv);
      });
      tidyLogger();
    }
    if (conf.dicts) {
      let dicts: Record<string, WnDictSetup> | undefined;
      if (_.isString(conf.dicts)) {
        dicts = await this.loadJson(conf.dicts);
      } else {
        dicts = conf.dicts;
      }
      installWalnutDicts(dicts);
    }
  }

  getConfig<T>(key: string, dft?: T): T {
    let re = _.get(this._conf, key);
    return re ?? dft;
  }

  getUrl(path: string) {
    let sep = path.startsWith('/') ? '' : '/';
    let { protocal, host, port } = this._conf;
    let ports = port == 80 ? '' : ':' + port;
    return `${protocal}://${host}${ports}${sep}${path}`;
  }

  getRequestInit(signal?: AbortSignal): RequestInit {
    let headers: HeadersInit = {};
    if (this._ticket) {
      headers['X-Walnut-Ticket'] = this._ticket;
    }
    return { headers, signal };
  }

  async fetchMySession(): Promise<AjaxResult> {
    if (this._ticket) {
      let re = await Walnut.fetchAjax('/a/me');
      if (!re.ok) {
        this._ticket = undefined;
        TiStore.local.remove(TICKET_KEY);
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

  async postFormToGetJson(
    path: string,
    form: Record<string, any>,
    signal?: AbortSignal
  ): Promise<any> {
    let url = this.getUrl(path);
    const body = new URLSearchParams();
    _.forEach(form, (v, k) => {
      body.append(k, v);
    });
    let resp = await fetch(url, {
      method: 'POST',
      body,
      signal,
    });
    return await resp.json();
  }

  async postFormToGetAjax(
    path: string,
    form: Record<string, any>,
    signal?: AbortSignal
  ): Promise<AjaxResult> {
    let reo = await this.postFormToGetJson(path, form, signal);
    return reo as AjaxResult;
  }

  async loadContent(objPath: string, signal?: AbortSignal): Promise<string> {
    // 静态路径
    if (objPath.startsWith('load://')) {
      let loadPath = `/${objPath.substring(7)}`;
      let resp = await fetch(loadPath, { signal });
      return await resp.text();
    }
    // Walnut 的动态路径
    let urlPath = this.cookPath(objPath);
    return await this.fetchText(urlPath, signal);
  }

  /**
   * @param objPath 存放在 Walnut 系统的对象路径
   * @returns  可以加载的 Walnut 系统的对象路径
   */
  cookPath(objPath: string): string {
    return `/o/content?str=${encodeURIComponent(objPath)}`;
  }

  async loadJson(objPath: string, signal?: AbortSignal): Promise<any> {
    let re = await this.loadContent(objPath, signal);
    try {
      return JSON5.parse(re);
    } catch (err) {
      log.error(`loadJson(${objPath}) fail to parse JSON:`, re, err);
    }
  }

  async loadJsModule(jsPath: string, signal?: AbortSignal) {
    //let jsUrl = this.getUrl(jsPath);
    //document.cookie = `SEID=${this._ticket}; path=/`;
    let text = await this.fetchText(jsPath, signal);
    if (Str.isBlank(text)) {
      return {};
    }
    // 假设， text 的代码类似
    // (function(ex){/* you can export your module */})(exports)
    let exports = {};
    try {
      let installModule = new Function('exports', text);
      installModule(exports);
      return exports;
    } catch (error) {
      log.error(`Fail to loadJsModule: ${jsPath} :: ${error}`);
    }
  }

  async getObj(id: string, options: FetchObjOptions = {}) {
    return await this.fetchObj(`id:${id}`, options);
  }

  async fetchObj(
    objPath: string,
    options: FetchObjOptions = {}
  ): Promise<WnObj> {
    let { loadAxis, loadPath, signal } = options;
    let urlPath = `/o/fetch?str=${encodeURIComponent(objPath)}`;
    if (loadPath) {
      urlPath += '&path=true';
    }
    if (loadAxis) {
      urlPath += '&axis=true';
    }
    let re: AjaxResult<WnObj> = await this.fetchAjax(urlPath, signal);
    if (re.ok && re.data) {
      return re.data;
    }
    throw new Error(JSON.stringify(re));
  }

  async fetchText(urlPath: string, signal?: AbortSignal): Promise<any> {
    let url = this.getUrl(urlPath);
    let init = this.getRequestInit(signal);
    let resp = await fetch(url, init);
    return await resp.text();
  }

  async fetchJson(urlPath: string, signal?: AbortSignal): Promise<any> {
    let url = this.getUrl(urlPath);
    let init = this.getRequestInit(signal);
    let resp = await fetch(url, init);
    let text = await resp.text();
    return JSON5.parse(text);
  }

  async fetchAjax(urlPath: string, signal?: AbortSignal): Promise<AjaxResult> {
    let reo = await this.fetchJson(urlPath, signal);
    return reo as AjaxResult;
  }

  async fetchSidebar(): Promise<UserSidebar> {
    let sidebar = this._conf.sidebar;
    log.info('fetchSidebar:', sidebar);
    if (sidebar) {
      //  Load the  Static sidebar.
      if (_.isString(sidebar) && sidebar.startsWith('load://')) {
        let url = `/${sidebar.substring(7)}`;
        log.info('fetchSidebar:url=>', url);
        let resp = await fetch(url);
        let text = await resp.text();
        let json = JSON5.parse(text);
        if (log.isDebugEnabled()) {
          log.debug('sidebar is:', json);
        }
        return json;
      }
      //  load the side bar of Walnut
      else {
        let cmdText = `ti sidebar`;
        if (_.isString(sidebar)) {
          cmdText += ' ' + sidebar;
        }
        log.info('fetchSidebar:cmd=>', cmdText);
        let json = await this.exec(cmdText, { as: 'json' });
        if (log.isDebugEnabled()) {
          log.debug('sidebar is:', json);
        }
        return json;
      }
    }
    return { sidebar: [] };
  }

  async exec(cmdText: string, options: WnExecOptions = {}): Promise<any> {
    // 执行命令
    log.info('exec>:', cmdText, options);
    let url = this.getUrl('/a/run/wn.manager');
    let init = this.getRequestInit(options.signal);
    let reo = await wnRunCommand(url, init, cmdText, options);
    if (log.isDebugEnabled()) {
      log.debug('exec>:', reo);
    }
    return reo;
  }
}

export const Walnut = new WalnutServer();
