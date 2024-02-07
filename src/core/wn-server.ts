import { installTiCoreI18n, TiStore } from '@site0/tijs';
import _ from 'lodash';
import { installWalnutI18n } from '../i18n';
import { AjaxResult, ServerConfig, SignInForm } from '../lib';

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
    };
    this._ticket = TiStore.local.getString('Walnut-Ticket', undefined);
  }

  init(conf: ServerConfig) {
    this._conf = conf;
    let lang = conf.lang ?? 'zh-cn';
    installTiCoreI18n(lang);
    installWalnutI18n(lang);
  }

  private getUrl(path: string) {
    let sep = path.startsWith('/') ? '' : '/';
    let { protocal, host, port } = this._conf;
    let ports = port == 80 ? '' : ':' + port;
    return `${protocal}://${host}${ports}${sep}${path}`;
  }

  private getRequestInit(): RequestInit {
    let headers: HeadersInit = {};
    if (this._ticket) {
      headers['X-Walnut-Ticket'] = this._ticket;
    }
    return { headers };
  }

  async signInToDomain(info: SignInForm) {
    let re = await this.postFormToGetAjax('/a/auth_login_by_domain_passwd', {
      site: this._conf.site,
      name: info.username,
      passwd: info.password,
      ajax: true,
    });
    if (re && re.ok && re.data) {
      this._ticket = re.data.ticket;
      TiStore.local.set('Walnut-Ticket', this._ticket);
    }
    return re;
  }

  async postFormToGetJson(
    path: string,
    form: Record<string, any>
  ): Promise<any> {
    let url = this.getUrl(path);
    const body = new URLSearchParams();
    _.forEach(form, (v, k) => {
      body.append(k, v);
    });
    let resp = await fetch(url, {
      method: 'POST',
      body,
    });
    return await resp.json();
  }

  async postFormToGetAjax(
    path: string,
    form: Record<string, any>
  ): Promise<AjaxResult> {
    let reo = await this.postFormToGetJson(path, form);
    return reo as AjaxResult;
  }

  async fetchJson(path: string): Promise<any> {
    let headers: HeadersInit = {};
    if (this._ticket) {
      headers['X-Walnut-Ticket'] = this._ticket;
    }
    let url = this.getUrl(path);
    let init = this.getRequestInit();
    let resp = await fetch(url, init);
    return await resp.json();
  }

  async fetchAjax(path: string): Promise<AjaxResult> {
    let reo = await this.fetchJson(path);
    return reo as AjaxResult;
  }
}

export const Walnut = new WalnutServer();
