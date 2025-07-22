import { BlockEvent, TabChangeEvent, Util, Vars } from "@site0/tijs";
import JSON5 from "json5";
import _ from "lodash";
import { isObjContentEditable } from "../../../../core";
import {
  isWnObjViewerEmitEventName,
  isWnObjViewerPartialChange,
  WnObjViewerEmitEventName,
  WnObjViewerEmitter,
  WnObjViewerHandlerPayload,
  WnObjViewerProps,
} from "./wn-obj-viewer-types";

export type WnObjViewerApi = ReturnType<typeof useWnObjViewer>;

export function useWnObjViewer(
  props: WnObjViewerProps,
  emit: WnObjViewerEmitter
) {
  function isDIR() {
    return "DIR" === props.meta?.race;
  }
  function isFILE() {
    return "FILE" === props.meta?.race;
  }

  function canEditContent() {
    if (!props.meta) {
      return false;
    }
    return isObjContentEditable(props.meta);
  }

  function getContentData() {
    if (!props.content) {
      return null;
    }
    try {
      return JSON5.parse(props.content ?? "{}");
    } catch (err) {
      return null;
    }
  }

  function onTabChange(event: TabChangeEvent) {
    //console.log('onTabChange', event, 'content' == event.to.value);
    let _show_content = false;
    if (_.isArray(props.contentTab)) {
      _show_content = props.contentTab.indexOf(event.to.value) >= 0;
    } else {
      _show_content = event.to.value == props.contentTab;
    }
    emit("show-content", _show_content);
  }

  function onMetaChange(delta: Vars) {
    //console.log('onMetaChange', delta);
    emit("meta-change", delta);
  }

  function onContentChange(content: any) {
    //console.log('onContentChange', content);
    let str: string;
    if (_.isNil(content)) {
      str = "";
    } else if (_.isString(content)) {
      str = content;
    } else {
      if (props.formatJsonIndent) {
        str = JSON.stringify(content, null, props.formatJsonIndent);
      } else {
        str = JSON.stringify(content);
      }
    }
    emit("content-change", str);
  }

  function handleBlockEvent(event: BlockEvent) {
    let { eventName, data } = event;
    let handler = props.blockEventRouter?.[eventName];

    // 准备上下文
    let payload: WnObjViewerHandlerPayload = {
      event,
      meta: props.meta ?? {},
      content: props.content ?? "",
      ContentData: getContentData(),
    };

    // 没找到的话，用内置的标准处理方式
    if (!handler) {
      handler = {
        "show-content": "show-content",
        "meta-change": "meta-change",
        "content-change": "content-change",
      }[event.eventName] as WnObjViewerEmitEventName;
    }

    // 标准事件名称
    if (isWnObjViewerEmitEventName(handler)) {
      // 显示或者隐藏内容块
      if ("show-content" == handler) {
        emit("show-content", data ? true : false);
      }
      // 元数据修改
      else if ("meta-change" == handler) {
        onMetaChange(data);
      }
      // 内容修改
      else if ("content-change" == handler) {
        onContentChange(data);
      }
      // 不可能
      else {
        console.error("Invalid Event Name:", event);
        return;
      }
    }
    // 部分修改
    else if (isWnObjViewerPartialChange(handler)) {
      let newData = Util.jsonClone(payload.ContentData);
      // 深层合并对应键的对象
      if ("merge" == handler.setMode) {
        _.merge(_.get(newData, handler.setPath), data);
      }
      // 浅层合并对应键的对象
      else if ("assign" == handler.setMode) {
        _.assign(_.get(newData, handler.setPath), data);
      }
      // 直接设置
      else {
        _.set(newData, handler.setPath, data);
      }

      onContentChange(newData);
    }
    // 指定事件的处理函数
    else if (_.isFunction(handler)) {
      handler(payload, emit);
    }
    // 无法找到处理函数
    else {
    }
  }

  return {
    isDIR,
    isFILE,
    getContentData,
    canEditContent,
    onTabChange,
    onMetaChange,
    onContentChange,
    handleBlockEvent,
  };
}
