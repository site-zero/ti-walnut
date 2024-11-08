import { Icons, ImageProps } from '@site0/tijs';
import _ from 'lodash';
import { computed, Ref, ref } from 'vue';
import { getWnObjIcon, Walnut, WnUploadFileOptions } from '../../..';
import {
  isWnObj,
  useWnObj,
  WnObj,
  WnObjInput,
  WnObjInputType,
} from '../../lib';

export type ObjUploaderProps = {
  value?: WnObjInput;
  valueType?: WnObjInputType;
  upload: Omit<WnUploadFileOptions, 'progress' | 'signal'>;
};

export function useObjUploader(
  _obj: Ref<WnObj | undefined>,
  props: ObjUploaderProps
) {
  const _progress = ref<number>(0);
  const _file = ref<File>();
  const objs = useWnObj();

  function __get_value_type(
    input: WnObjInput,
    type: WnObjInputType
  ): WnObjInputType {
    if (type === 'auto') {
      if (isWnObj(input)) {
        return 'obj';
      } else if (_.isString(input)) {
        // id:xxx
        if (/^id:/.test(input)) {
          return 'idPath';
        }
        // ~/path/to/obj
        else if (/^~?\//.test(input)) {
          return 'path';
        }
        // 默认就是 id
        else {
          return 'id';
        }
      }
    }
    return type;
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
   * @example
   * ```typescript
   * await loadObj('some-id', 'id');
   * console.log(_obj.value); // 输出获取到的对象
   * ```
   */
  async function loadObj(input?: WnObjInput) {
    let type = props.valueType ?? 'auto';

    // 防空
    if (!input) {
      _obj.value = undefined;
      return;
    }

    // 获取类型
    let _input_type = __get_value_type(input, type);
    if (isWnObj(input) && _input_type === 'obj') {
      _obj.value = _.cloneDeep(input);
    }
    // 需要考虑异步加载
    else if (_.isString(input)) {
      // ID
      if (_input_type === 'id') {
        const obj = await objs.get(input);
        _obj.value = isWnObj(obj) ? obj : undefined;
      }
      // id:xxxx || /path/to/obj
      else if (_input_type === 'idPath' || _input_type === 'path') {
        const obj = await objs.fetch(input);
        _obj.value = obj;
      }
      // 错误
      else {
        console.error('Unknown WnObjInputType:', _input_type);
        _obj.value = undefined;
      }
    }
  }

  let lastAbort: AbortController | undefined = undefined;

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
    await Walnut.uploadFile(file, options);

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

  /**
   * 计算属性，返回一个布尔值，表示是否正在上传文件。
   * 如果 `_file.value` 存在，则返回 `true`，否则返回 `false`。
   *
   * @returns {boolean} 是否正在上传文件
   */
  const isUploading = computed(() => !!_file.value);

  /**
   * 计算属性 BarPreview，用于根据文件或对象的值生成图像属性。
   *
   * @returns 如果 `_file.value` 存在，则返回包含文件源的图像属性。
   *          如果 `_obj.value` 存在，则返回包含对象图标源的图像属性。
   *          否则，返回一个空的图像属性对象。
   */
  const BarPreview = computed((): ImageProps => {
    if (_file.value) {
      return { src: _file.value };
    }

    if (_obj.value) {
      let iconInput = getWnObjIcon(_obj.value);
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

    return '';
  });

  //---------------------------------------------
  //                输出特性
  //---------------------------------------------
  return {
    isUploading,
    BarPreview,
    BarText,
    Progress: computed(() => _progress.value),
    loadObj,
    doUpload,
    abortUpload,
  };
}
