import { AjaxResult, ServerConfig } from "../lib";

export class WalnutServer {
  /**
   * 记录远端服务器属性
   */
  private _conf: ServerConfig;

  constructor() {
    this._conf = {
      "protocal": "http",
      "host": "localhost",
      "port": 8080
    };
  }

  init(conf: ServerConfig) {
    this._conf = conf;
  }

  getUrl(path: string) {
    let { protocal, host, port } = this._conf;
    let ports = port == 80 ? "" : ":" + port;
    return `${protocal}://${host}${ports}/${path}`;
  }

  async fetchJson(path: string) {
    let url = this.getUrl(path);
    let resp = await fetch(url);
    return await resp.json();
  }

  async fetchAjax(path: string): Promise<AjaxResult> {
    let url = this.getUrl(path);
    let resp = await fetch(url);
    return await resp.json() as AjaxResult;
  }
}

export const Walnut = new WalnutServer();
