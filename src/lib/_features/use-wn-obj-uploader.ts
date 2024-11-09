import { I18n, Icons, ImageProps } from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import { computed, Ref, ref } from 'vue';
import {
  AjaxResult,
  getWnObjIcon,
  isAjaxResult,
  Walnut,
  WnUploadFileOptions,
} from '../../..';
import {
  isWnObj,
  useWnObj,
  WnObj,
  WnObjInput,
  WnObjInputType,
} from '../../lib';

export type WnObjUploaderEmitter = {
  (event: 'change', payload: WnObjInput | null): void;
  (event: 'fail', payload: AjaxResult): void;
};

export type WnObjUploaderProps = {
  value?: WnObjInput;
  valueType?: WnObjInputType;
  upload: Omit<WnUploadFileOptions, 'progress' | 'signal'>;
  placeholder?: string;
};

export function useWnObjUploader(
  props: WnObjUploaderProps,
  emit: WnObjUploaderEmitter,
  _obj: Ref<WnObj | undefined>,
  _base64_data: Ref<string | undefined>
) {
  //console.warn('!!!!!!!!useObjUploader', props, _obj);
  const _cache = new Map<string, WnObj>();
  const _progress = ref<number>(0);
  const _file = ref<File>();
  const _fail_message = ref<string>();
  const objs = useWnObj();

  /**
   * 计算属性 `ValueType`，根据 `props.valueType` 的值返回相应的类型。
   * 如果 `props.valueType` 未定义，则返回默认值 `'idPath'`。
   *
   * @computed
   * @returns {string} 返回 `props.valueType` 或默认值 `'idPath'`。
   */
  const ValueType = computed(() => props.valueType ?? 'idPath');
  /**
   * 计算属性 BarPreview，用于根据文件或对象的值生成图像属性。
   *
   * @returns 如果 `_file.value` 存在，则返回包含文件源的图像属性。
   *          如果 `_obj.value` 存在，则返回包含对象图标源的图像属性。
   *          否则，返回一个空的图像属性对象。
   */
  const BarPreview = computed((): ImageProps => {
    if (_file.value) {
      return { src: _file.value, objectFit: 'cover' };
    }

    if (_obj.value) {
      let obj = _obj.value;
      /**
       * 对于图片对象，如果有 `_base64_data` 则返回 base64 图片源。
       */
      let mime = /^image\/(.+)$/.exec(obj.mime);
      if (mime && _base64_data.value) {
        let src = `data:image/${mime[1]};base64,${_base64_data.value}`;
        return { src };
      }

      let iconInput = getWnObjIcon(obj);
      let icon = Icons.parseIcon(iconInput);
      return { src: icon };
    }

    return {};
  });

  /**
   * 计算属性 `BarText` 返回一个字符串，表示文件或对象的名称或标题。
   *
   * - 如果 `_file` 有值，则返回 `_file.value.name`。
   * - 如果 `_obj` 有值，则返回 `_obj.value.title` 或 `_obj.value.nm`。
   * - 如果都没有值，则返回空字符串。
   *
   * @returns {string} 文件或对象的名称或标题，或空字符串。
   */
  const BarText = computed(() => {
    if (_file.value) {
      return _file.value.name;
    }

    if (_obj.value) {
      return _obj.value.title || _obj.value.nm;
    }

    return I18n.text(props.placeholder || 'i18n:wn-obj-upload-bar-placeholder');
  });

  function __set_obj(obj: WnObjInput | undefined) {
    if (isWnObj(obj)) {
      if (!_cache.has(obj.id)) {
        _cache.set(obj.id, obj);
      }
      _obj.value = obj;
    } else {
      _obj.value = undefined;
    }
  }

  function __to_obj_value(obj: WnObj): WnObjInput {
    if (ValueType.value === 'obj') {
      return _.cloneDeep(obj);
    }
    if (ValueType.value === 'id') {
      return obj.id;
    }
    if (ValueType.value === 'idPath') {
      return `id:${obj.id}`;
    }
    if (ValueType.value === 'path') {
      if (obj.ph) {
        return obj.ph;
      }
      if (obj.pid) {
        return `id:${obj.pid}/${obj.nm}`;
      }
      throw new Error(`Fail to create WnObj Path : ${JSON.stringify(obj)}`);
    }
    throw new Error(`Unknown WnObjInputType: ${ValueType.value}`);
  }

  /**
   * 异步加载对象的方法，根据输入的类型加载对象并设置到 `_obj.value` 中。
   *
   * @remarks
   * 该方法会根据输入的类型进行不同的处理：
   * - 如果输入是 WnObj 对象且类型为 'obj'，则直接克隆并设置到 `_obj.value`。
   * - 如果输入是字符串且类型为 'id'，则通过 `objs.get` 方法获取对象并设置到 `_obj.value`。
   * - 如果输入是字符串且类型为 'idPath' 或 'path'，则通过 `objs.fetch` 方法获取对象并设置到 `_obj.value`。
   * - 如果输入类型未知，则会在控制台输出错误信息，并将 `_obj.value` 设置为 undefined。
   *
   */
  async function loadObj(input?: WnObjInput) {
    let _input_type = ValueType.value;

    // 防空
    if (!input) {
      _obj.value = undefined;
      _base64_data.value = undefined;
      return;
    }

    // 获取类型
    if (isWnObj(input) && _input_type === 'obj') {
      _obj.value = _.cloneDeep(input);
    }
    // 需要考虑异步加载
    else if (_.isString(input)) {
      // ID
      if (_input_type === 'id') {
        // 使用缓存
        let obj = _cache.get(input);
        if (!obj) {
          obj = await objs.get(input);
        }
        __set_obj(obj);
      }
      // id:xxxx
      else if (_input_type === 'idPath') {
        let objId = input.substring(3).trim();
        let obj = _cache.get(objId);
        if (!obj) {
          obj = await objs.fetch(input);
        }
        __set_obj(obj);
      }
      // /path/to/obj
      else if (_input_type === 'path') {
        const obj = await objs.fetch(input);
        __set_obj(obj);
      }
      // 错误
      else {
        console.error('Unknown WnObjInputType:', _input_type);
        _obj.value = undefined;
      }
    }

    // 如果有对象则获取 base64 数据
    if (_obj.value) {
      let obj = _obj.value;
      if (obj.thumb) {
        _base64_data.value = await Walnut.loadBase64Data(obj.thumb);
      } else {
        _base64_data.value = undefined;
      }
    }
  }

  let lastAbort: AbortController | undefined = undefined;
  /**
   * 执行文件上传操作。
   *
   * @param file - 要上传的文件。
   * @returns 一个 Promise，表示上传操作的完成。
   *
   * @remarks
   * 该函数会在上传前取消上一次的上传操作，并使用新的 AbortController 实例。
   * 上传过程中会更新进度，并在上传完成后处理返回结果。
   * 如果上传成功且返回结果为有效对象，则会触发 'change' 事件。
   * 如果上传失败或返回结果无效，则会触发 'fail' 事件并记录失败信息。
   *
   * @throws 如果上传过程中发生错误，会在控制台输出错误信息。
   */
  async function doUpload(file: File) {
    _file.value = file;
    // 取消上一次上传
    if (lastAbort) {
      lastAbort.abort();
      lastAbort = new AbortController();
    } else {
      lastAbort = new AbortController();
    }

    // 上传的配置
    let options: WnUploadFileOptions = {
      ...props.upload,
      progress: ({ percent }) => {
        _progress.value = percent;
      },
      signal: lastAbort.signal,
    };

    // 执行上传
    try {
      _fail_message.value = undefined;
      let re = await Walnut.uploadFile(file, options);
      let reo = JSON5.parse(re as string);
      console.log('Upload Result Object:', reo, re);
      if (isAjaxResult(reo)) {
        if (reo.ok) {
          if (isWnObj(reo.data)) {
            __set_obj(reo.data);

            let val = __to_obj_value(reo.data);
            emit('change', val);
          } else {
            _fail_message.value = re as string;
            emit('fail', {
              ok: false,
              msg: 'e.web.obj.upload.InvalidResult',
              data: re,
            });
          }
        } else {
          _fail_message.value = reo.msg;
        }
      }
      // 不管怎么样，就是错误了
      else {
        _fail_message.value = re as string;
        emit('fail', { ok: false, msg: 'e.web.obj.upload.Fail', data: re });
      }
      // if (isWnObj(reo)) {
      //   _obj.value = reo;
      //   _cache.set(reo.id, reo);
      // } else {

      // }
    } catch (e) {
      console.error('Upload Result Fail:', e);
    }

    // 上传完成后
    _file.value = undefined;
  }

  /**
   * 中止当前上传操作。
   * 如果存在上一次的中止控制器，则调用其 abort 方法。
   */
  function abortUpload() {
    if (lastAbort) {
      lastAbort.abort();
    }
  }

  async function doClear() {
    if (_obj.value && _obj.value.id) {
      _progress.value = _.random(0, 0.8, true);
      await Walnut.exec(`rm 'id:${_obj.value.id}'`);
      _progress.value = 1;
      _.delay(() => {
        _progress.value = 0;
        _obj.value = undefined;
        _base64_data.value = undefined;
        _fail_message.value = undefined;
        emit('change', null);
      }, 200);
    }
  }

  /**
   * 计算属性，返回一个布尔值，表示是否正在上传文件。
   * 如果 `_file.value` 存在，则返回 `true`，否则返回 `false`。
   *
   * @returns {boolean} 是否正在上传文件
   */
  const isUploading = computed(() => !!_file.value);
  const isInvalid = computed(() => !!_fail_message.value);
  const hasValue = computed(() => !!props.value);

  //---------------------------------------------
  //                输出特性
  //---------------------------------------------
  return {
    ValueType,
    isUploading,
    isInvalid,
    hasValue,
    BarPreview,
    BarText,
    Progress: computed(() => _progress.value),
    FailMessage: computed(() => _fail_message.value),
    loadObj,
    doUpload,
    abortUpload,
    doClear,
  };
}
