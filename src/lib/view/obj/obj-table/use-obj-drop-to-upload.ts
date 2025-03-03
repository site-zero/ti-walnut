import { ThumbProps, useDropping } from '@site0/tijs';
import { Ref } from 'vue';
import { Walnut, WnUploadFileOptions } from '../../../../core';
import { WnObj } from '../../../_types';
import { WnObjTableEmitter } from './wn-obj-table-types';

export type ObjUploadItem = ThumbProps & {
  index: number;
  file: File;
  progress: number;
  abort: AbortController | null;
  newObj?: WnObj;
};

export type ObjDropToUploadOptions = {
  _drag_enter: Ref<boolean>;
  _upload_files: Ref<ObjUploadItem[]>;
  target: () => HTMLElement | null;
  // 需要采用动态上传参数，因为随着目录的变化，上传参数可能会变化
  uploadOptions: () => WnUploadFileOptions | undefined;
  emit: WnObjTableEmitter;
};

export function useObjDropToUpload(options: ObjDropToUploadOptions) {
  let { target, _drag_enter, _upload_files, uploadOptions, emit } = options;

  /**
   * 检查上传是否完成。
   *
   * 遍历 `_upload_files` 数组，如果所有文件都已完成上传（即 `item.abort` 为 false），
   * 则将所有新创建的对象（`item.newObj`）提取到一个数组中，
   * 清空 `_upload_files` 数组，并触发 `upload:done` 事件，传递新创建的对象数组。
   *
   * @private
   *
   * @emits upload:done 当所有文件上传完成后触发，传递新创建的对象数组。
   */
  function _do_check_upload_finished() {
    let in_uploading = 0;
    for (let i = 0; i < _upload_files.value.length; i++) {
      let item = _upload_files.value[i];
      if (item.abort) {
        in_uploading++;
      }
    }
    // 标记上传完成
    if (!in_uploading) {
      let objs: WnObj[] = [];
      for (let it of _upload_files.value) {
        if (it.newObj) {
          objs.push(it.newObj);
        }
      }
      _upload_files.value = [];
      emit('upload:done', objs);
    }
  }

  /**
   * 执行上传队列中的文件。
   *
   * 遍历 `_upload_files.value` 数组，对每个文件执行上传操作。
   * - 跳过正在上传的文件。
   * - 创建 AbortController 用于控制上传过程。
   * - 准备上传参数，包括文件名、进度回调和 AbortSignal。
   * - 调用 Walnut.uploadFile 执行上传，并在上传完成后更新文件状态。
   * - 上传完成后，将 `item.abort` 设置为 null，并将新对象信息存储在 `item.newObj` 中。
   * - 最后调用 `_do_check_upload_finished` 检查是否所有文件都已上传完成。
   *
   * @private
   */
  function _do_upload() {
    let up_options = uploadOptions();
    if (!up_options || !up_options.target) {
      console.error('No upload options');
      return
    };

    for (let i = 0; i < _upload_files.value.length; i++) {
      let item = _upload_files.value[i];
      // 正在上传的文件跳过
      if (item.abort) continue;

      // 开始上传
      item.abort = new AbortController();

      // 准备上传参数
      let uploading: WnUploadFileOptions = {
        ...up_options,
        uploadName: item.file.name,
        progress: (info) => {
          item.progress = info.percent;
        },
        signal: item.abort.signal,
      };

      // 执行上传
      Walnut.uploadFile(item.file, uploading).then((re: any) => {
        console.log('Upload Done:', re.data);
        // 上传完成
        item.abort = null;
        item.newObj = re.data;
        _do_check_upload_finished();
      });
    }
  }

  /**
   * 将 FileList 中的文件加入到上传队列中。
   *
   * @param files - 待加入上传队列的 FileList 对象。
   */
  function _join_upload_items(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      _upload_files.value.push({
        // 上传数据信息
        index: i,
        file,
        progress: 0,
        abort: null,

        // 显示控件
        preview: {
          src: file,
          width: '100%',
          height: '64px',
          objectFit: 'contain',
        },
        text: file.name,
        width: 100,
        textSize: 's',
      });
    }
  }

  const dropping = useDropping({
    target,
    enter: () => {
      _drag_enter.value = true;
    },
    over: () => {
      _drag_enter.value = true;
    },
    leave: () => {
      _drag_enter.value = false;
    },
    drop: (files) => {
      if (!files) return;
      _join_upload_items(files);
      _do_upload();
    }, // drop: (files) => {
  });

  // 启动 Dropping
  dropping();
}
