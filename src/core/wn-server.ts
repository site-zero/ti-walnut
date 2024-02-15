import { installTiCoreI18n, TiStore } from '@site0/tijs';
import _ from 'lodash';
import { installWalnutI18n } from '../i18n';
import { AjaxResult, ServerConfig, SignInForm } from '../lib';

const TICKET_KEY = 'Walnut-Ticket';

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
    this._ticket = TiStore.local.getString(TICKET_KEY, undefined);
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
