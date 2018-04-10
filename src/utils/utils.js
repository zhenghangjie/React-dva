import { Modal } from 'antd';
import React from 'react';
import difference from 'lodash/difference';
import cloneDeep from 'lodash/cloneDeep';
import indexOf from 'lodash/indexOf';
import findIndex from 'lodash/findIndex';
import navData from '../common/nav';
import { getOriginData } from '../common/origin';
import styles from './utils.less';
import request from './request';

const { analysisUrl } = getOriginData();

function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

/** 判断浏览器内核是否为IE
 *  by zhj
 */
export function isIe() {
  return ('ActiveXObject' in window);
}

/** 数据统计声明式埋点
 *  by zhj
 */
function handleAction(e) {
  const dataAnalyze = e.target.getAttribute('data-analyze');
  if (dataAnalyze) {
    const arr = dataAnalyze.split(',');
    const params = {
      fir: parseInt(arr[0], 10),
      sec: parseInt(arr[1], 10),
    };
    // 数据统计记录
    request(`${analysisUrl}/log/click`, {
      method: 'POST',
      body: toQueryString(params),
    });
  }
}

/** 数据统计声明式埋点闭包
 *  by zhj
 */
export function dataAnalysis(event) {
  handleAction(event);
}

/** 获取导航 基础组件路由数据
 *  @param {String} path 路径
 *  by zhj
 */

export function getRouteData(path) {
  if (!navData.some(item => item.layout === path) ||
      !(navData.filter(item => item.layout === path)[0].children)) {
    return null;
  }
  const dataList = cloneDeep(navData.filter(item => item.layout === path)[0]);
  const nodeList = getPlainNode(dataList.children);
  return nodeList;
}

/** 新标签页打开防拦截
 *  @param {String} path 路径
 *  by zhj
 */
export function labelOpen(path) {
  const newWin = window.open('about:blank;');
  newWin.location.href = path;
}

/** 内部调用，文件格式错误的modal
*  @param {string} fileType 当前上传类型
 *  by my
 */
function ExtModal(fileType) {
  let typeContent;
  if (fileType === 'video') {
    typeContent = '视频类：mp4；';
  } else if (fileType === 'audio') {
    typeContent = '音频类：m4a，mp3；';
  } else if (fileType === 'file') {
    typeContent = '文件类：pdf，doc，docx，ppt，pptx，xls，xlsx；';
  } else if (fileType === 'image') {
    typeContent = '图片类：jpg，jpeg，png，gif；';
  }
  Modal.warning({
    title: '非常抱歉，暂不支持当前上传的格式',
    width: '580px',
    content: (
      <div>
        <p>出于安全的考虑以及根据网监部门和安全联盟的规定。目前仅支持以下格式：</p>
        <p>{ typeContent }</p>
      </div>
    ),
    okText: '关闭',
    maskClosable: true,
  });
}

/** 内部调用，上传文件过大的modal
 *  @param {number} limitSize 最大上传
 *  @param {number} fileSize 当前文件大小
 *  by my
 */
function LtlimitSizeModal(limitSize, fileSize, fileType, editionId) {
  let titleInfo;
  if (fileType === 'video') {
    titleInfo = '上传视频过大';
  } else if (fileType === 'audio') {
    titleInfo = '上传音频过大';
  } else if (fileType === 'file') {
    titleInfo = '上传文件过大';
  } else if (fileType === 'image') {
    titleInfo = '上传图片过大';
  }
  if (fileType === 'file' && parseInt(editionId, 10) === 1) {
    const LtlimitSize = Modal.warning({
      title: titleInfo,
      width: '580px',
      content: `最大支持${limitSize / 1024 / 1024}MB，现在该文件为${(fileSize / 1024 / 1024).toFixed(1)}MB。`,
      okText: '我知道了',
      maskClosable: true,
      iconType: 'exclamation-circle',
      onOk() {
        LtlimitSize.destroy();
      },
    });
    return;
  } else if (fileType === 'file' && parseInt(editionId, 10) !== 1) {
    const LtlimitSize = Modal.warning({
      title: titleInfo,
      width: '580px',
      content: `受小程序限制，活码小程序版文件上传最大支持${limitSize / 1024 / 1024}MB，该文件为${(fileSize / 1024 / 1024).toFixed(1)}MB。`,
      okText: '我知道了',
      maskClosable: true,
      iconType: 'exclamation-circle',
      onOk() {
        LtlimitSize.destroy();
      },
    });
    return;
  }
  if (parseInt(editionId, 10) === 1) {
    const LtlimitSize = Modal.confirm({
      title: titleInfo,
      width: '580px',
      content: `最大支持${limitSize / 1024 / 1024}MB，现在该文件为${(fileSize / 1024 / 1024).toFixed(1)}MB，付费用户拥有更高上传权限。`,
      okText: '立即升级',
      cancelText: '下次再说',
      maskClosable: true,
      iconType: 'exclamation-circle',
      onOk() {
        labelOpen('//cli.im/news/price');
      },
      onCancel() {
        LtlimitSize.destroy();
      },
    });
  } else {
    const LtlimitSize = Modal.warning({
      title: titleInfo,
      width: '580px',
      content: `最大支持${limitSize / 1024 / 1024}MB，现在该文件为${(fileSize / 1024 / 1024).toFixed(1)}MB。`,
      okText: '我知道了',
      maskClosable: true,
      iconType: 'exclamation-circle',
      onOk() {
        LtlimitSize.destroy();
      },
    });
  }
}

/** 内部调用，容量超过90%但未超过100%的modal
 *  @param {number} capacityUsedMB 已使用容量
 *  @param {number} capacityUsableMB 最大容量
*  @param {string} targetUrl 客户经理qq
 *  by my
 */
function CapacityWillOverModal(capacityUsedMB, capacityUsableMB, targetUrl, fileType) {
  let titleInfo;
  let typeContent;
  if (fileType === 'video' || fileType === 'audio') {
    titleInfo = '音视频容量即将超标';
    typeContent = '音视频';
  } else if (fileType === 'file') {
    titleInfo = '文件容量即将超标';
    typeContent = '文件';
  } else if (fileType === 'image') {
    titleInfo = '图片容量即将超标';
    typeContent = '图片';
  }
  const CapacityOver = Modal.confirm({
    title: titleInfo,
    width: '580px',
    content: (
      <div>
        <p>您的{typeContent}容量为
          <span className={styles.characterBold}>{capacityUsableMB}MB</span>，
        已使用<span className={styles.characterBold}>{capacityUsedMB}MB</span>
        </p>
        <p>为避免影响{typeContent}上传，建议你升级版本！如果需要帮助，<a href={`${targetUrl}`} target="_blank" rel="noopener noreferrer">点击咨询</a></p>
      </div>
    ),
    okText: '立即升级',
    cancelText: '继续上传',
    maskClosable: true,
    iconType: 'exclamation-circle',
    onOk() {
      labelOpen('//cli.im/news/price');
    },
    onCancel() {
      CapacityOver.destroy();
    },
  });
}

/** 内部调用，容量超标超过100%的modal
 *  @param {number} capacityOverMB 超过容量
 *  @param {number} capacityUsableMB 最大容量
 *  by my
 */
function CapacityOverModal(capacityOverMB, capacityUsableMB, targetUrl, fileType) {
  let titleInfo;
  let typeContent;
  if (fileType === 'video' || fileType === 'audio') {
    titleInfo = '音视频容量超标';
    typeContent = '音视频';
  } else if (fileType === 'file') {
    titleInfo = '文件容量超标';
    typeContent = '文件';
  } else if (fileType === 'image') {
    titleInfo = '图片容量超标';
    typeContent = '图片';
  }
  const CapacityMoreOver = Modal.confirm({
    title: titleInfo,
    width: '580px',
    content: (
      <div>
        <p>您的{typeContent}容量为
          <span className={styles.characterBold}>{capacityUsableMB}MB</span>
        ，已超标使用<span className={styles.characterWarn}>{capacityOverMB}MB</span>
        </p>
        <p>无法继续上传，建议你升级版本！如果需要帮助，<a href={`${targetUrl}`} target="_blank" rel="noopener noreferrer">点击咨询</a></p>
      </div>
    ),
    okText: '立即升级',
    cancelText: '下次再说',
    maskClosable: true,
    iconType: 'exclamation-circle',
    onOk() {
      labelOpen('//cli.im/news/price');
    },
    onCancel() {
      CapacityMoreOver.destroy();
    },
  });
}

export function BreakEditModal() {
  const BreakEdit = Modal.confirm({
    title: '正在上传',
    width: '580px',
    content: '上传过程中，编辑其他组件将会中断上传，是否中断上传去编辑？',
    okText: '否',
    cancelText: '是',
    maskClosable: true,
    iconType: 'exclamation-circle',
    onOk() {
      BreakEdit.destroy();
    },
    onCancel() {
      BreakEdit.destroy();
    },
  });
}

/** 列表对象初始化对象合并
 *  @param {object} listObj 列表对象
 *  by zhj
 */
export function listObjAssign(listObj) {
  const listTmp = [];
  for (const i in listObj) {
    if (Object.prototype.hasOwnProperty.call(listObj, i)) {
      const obj = Object.assign(listObj[i], {
        type: listObj[i].component_code,
        uniqueId: parseInt(i, 10),
      });
      listTmp.push(obj);
    }
  }
  return listTmp;
}

/** 计算文件上传预计耗时
 *  @param {int} time
 *  by zhj
 */
export function CalUploadTime(time) {
  let second;
  if (time % 60 < 1) {
    second = 1;
  } else {
    second = parseInt(time % 60, 10);
  }
  if (time / 60 > 1) {
    return `${parseInt(time / 60, 10)}分${second}秒`;
  } else {
    return `${second}秒`;
  }
}

/** 验证后缀名 文件上传过滤器
 *  @param {Object} file对象
 *  @param {Array} extsArr 可上传文件类型
 *  @param {Int} limitSize 可上传文件大小
 *  @param {Int} capacityUsed 已用容量
 *  @param {Int} capacityUsable 可用容量
 *  by zhj
 */
export function checkFileExts(file, extsArr, limitSize, capacityUsed,
  capacityUsable, fileType, qqLink, editionId) {
  const ext = getExtsByName(file.name);
  const isExt = indexOf(extsArr, ext) !== -1;
  if (!isExt) {
    ExtModal(fileType);
  }
  const isLtlimitSize = file.size < limitSize;
  if (isExt && !isLtlimitSize) {
    LtlimitSizeModal(limitSize, file.size, fileType, editionId);
  }
  const isCapacityUsable = parseInt(capacityUsed, 10) < parseInt(capacityUsable, 10);
  const isCapacityOver150 = parseInt(capacityUsed, 10) < parseInt(capacityUsable, 10) * 0.9;
  const capacityUsableMB = (parseInt(capacityUsable, 10) / 1024 / 1024).toFixed(1);
  const capacityUsedMB = (parseInt(capacityUsed, 10) / 1024 / 1024).toFixed(1);
  const capacityOverMB = (capacityUsedMB - capacityUsableMB).toFixed(1);
  // const capacityUsableGB = (parseInt(capacityUsable, 10) / 1024 / 1024 / 1024).toFixed(1);
  if (isExt && isLtlimitSize && !isCapacityUsable) {
    CapacityOverModal(capacityOverMB, capacityUsableMB, qqLink, fileType);
  } else if (isExt && isLtlimitSize && isCapacityUsable && !isCapacityOver150) {
    CapacityWillOverModal(capacityUsedMB, capacityUsableMB, qqLink, fileType);
  }
  return isExt && isLtlimitSize && isCapacityUsable;
}

/** 根据文件扩展名获取icon
 *  @param {string} extRecent 后缀名
 *  @param {string} staticDomain 静态资源地址
 *  by zhj
 */
export function getIconByExts(extRecent, staticDomain) {
  let iconUrl;
  if (extRecent === 'jpg' || extRecent === 'gif' || extRecent === 'jpeg' || extRecent === 'png' || extRecent === 'bmp') {
    iconUrl = `${staticDomain}/images/coding/imgicon.png`;
  } else if (extRecent === 'pdf') {
    iconUrl = `${staticDomain}/images/coding/pdf.png`;
  } else if (extRecent === 'ppt' || extRecent === 'pptx' || extRecent === 'pps' || extRecent === 'ppsx' || extRecent === 'pot' || extRecent === 'potx' || extRecent === 'dps') {
    iconUrl = `${staticDomain}/images/coding/ppt.png`;
  } else if (extRecent === 'mp3' || extRecent === 'wma' || extRecent === 'mid') {
    iconUrl = `${staticDomain}/images/coding/video.png`;
  } else if (extRecent === 'doc' || extRecent === 'docx' || extRecent === 'wps' || extRecent === 'rtf') {
    iconUrl = `${staticDomain}/images/coding/word.png`;
  } else if (extRecent === 'xls' || extRecent === 'xlsx') {
    iconUrl = `${staticDomain}/images/coding/excel.png`;
  } else {
    iconUrl = `${staticDomain}/images/coding/coding-file.png`;
  }
  return iconUrl;
}

/** 根据文件名获取扩展名
 *  @param {string} name 文件名
 *  by zhj
 */
export function getExtsByName(name) {
  if (name) {
    const one = name.replace(/(\\+)/g, '#').split('#');
    const two = one[one.length - 1].split('.');
    const ext = two[two.length - 1].toLowerCase();
    return ext;
  }
}

/** 格式化时间(以秒为单位转换成时:分:秒格式)
 *  @param {string} time 需要格式化的时间
 *  @param {string} type 格式化类型 hasHour(有小时位)
 *                                 notHasHour(没有小时位)
 *  by zhj
 */
export function formatTime(time, type = 'notHasHour') {
  let hour = '00';
  let minute = '00';
  let second = '00';
  let resultTime = '';
  if (time && type === 'hasHour') {
    const thisHour = parseInt(time / 3600, 10);
    const thisMinute = parseInt((time - (thisHour * 3600)) / 60, 10);
    const thisSecond = parseInt(time - (thisHour * 3600) - (thisMinute * 60), 10);
    hour = thisHour < 10 ? `0${thisHour}` : `${thisHour}`;
    minute = thisMinute < 10 ? `0${thisMinute}` : `${thisMinute}`;
    second = thisSecond < 10 ? `0${thisSecond}` : `${thisSecond}`;
  } else if (time && type !== 'hasHour') {
    const thisMinute = parseInt(time / 60, 10);
    const thisSecond = parseInt((time - (thisMinute * 60)), 10);
    minute = thisMinute < 10 ? `0${thisMinute}` : `${thisMinute}`;
    second = thisSecond < 10 ? `0${thisSecond}` : `${thisSecond}`;
  }
  resultTime = (type === 'hasHour') ? (`${hour}:${minute}:${second}`) : (`${minute}:${second}`);
  if (time < 1 && time > 0) {
    return '00:01';
  } else {
    return resultTime;
  }
}

/** 获取Url参数
 *  @param {String} name 参数名
 *  @param {String} search window.location.search
 *  by zhj
 */
export function getUrlPara(name, search = window.location.search) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
  const r = search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return '';
}

/** 对象字符串序列化
 *  @param {object} obj
 *  by zhj
 */
function jsonStringify(obj) {
  if (typeof obj === 'string') {
    return obj;
  } else {
    return JSON.stringify(obj);
  }
}

/** payload对象转formData keyvalue格式
 *  @param {object} obj json对象
 *  by zhj
 */
export function toQueryString(obj) {
  return obj ? Object.keys(obj).sort().map((key) => {
    const val = obj[key];
    if (Array.isArray(val)) {
      return val.sort().map((val2) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(jsonStringify(val2))}`;
      }).join('&');
    }

    return `${encodeURIComponent(key)}=${encodeURIComponent(jsonStringify(val))}`;
  }).join('&') : '';
}

/** 格式化文件大小
 *  @param {String} fileSize 文件大小
 *  by zhj
 */
export function formatFileSize(fileSize, idx = 0) {
  const units = ['B', 'KB', 'MB', 'GB'];
  const idxplus = idx + 1;
  if (fileSize < 1024 || idx === units.length - 1) {
    return fileSize.toFixed(2) + units[idx];
  }
  return formatFileSize(fileSize / 1024, idxplus);
}

/** 超出省略。
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 数组中需要处理数据的id
 *  @param {String} action 增加或者删除child_count
 *  by fjw
 */
export function CutParagraph(name, length, size) {
  let newName;
  if (length > size) {
    newName = `${name.substring(0, size)}...`;
    return newName;
  } else {
    return name;
  }
}

/** 根据id来改变数组中相应id的下面的child_count，场景：当删除或者增加目录的时候，处理child_count目录。
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 数组中需要处理数据的id
 *  @param {String} action 增加或者删除child_count
 *  by fjw
 */
export function changeChileCountById(arr, id, action) {
  arr.forEach((item) => {
    if (item.id === id) {
      if (action === 'add') {
        item.children_count += 1;
      } else if (action === 'delete') {
        item.children_count -= 1;
      }
    }

    if (item.children && item.children.length) {
      changeChileCountById(item.children, id, action);
    }
  });
  return arr;
}

/** 根据id来删除数组中相应id的对像，需要遍历
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 数组中需要处理数据的id
 *  by fjw
 */
export function deleteById(arr, id) {
  arr.forEach((item, i) => {
    if (item.id === id) {
      arr.splice(i, 1);
    }
    if (item.children && item.children.length) {
      deleteById(item.children, id);
    }
  });
  return arr;
}

/** 根据id来删除单个码
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 数组中需要删除数据的id
 *  by fjw
 */
export function deleteActiveById(arr, id) {
  const index = findIndex(arr, { id });
  const deleItem = arr.splice(index, 1);
  const newLists = difference(arr, deleItem);// 删除后的id
  return newLists;
}


/** 根据要删除的数组里面的id删除对应的数组中的数据(批量删码)
 *  @param {Array} arr 需要处理的数组
 *  @param {Array} arrId 需要删除的id数组
 *  by fjw
 */
export function batchDeleteById(arr, arrId) {
  const array = [];
  arr.forEach((item) => {
    arrId.forEach((val) => {
      if (item.id === val) {
        array.push(item);
      }
    });
  });
  const newArr = difference(arr, array);
  return newArr;
}

/** 目录新增的方法
 *  @param {Array} arr 需要处理的数组
 *  @param {number} arrId 需要新增的pId
 *  @param {Object} arrId 需要新增的数据
 *  by fjw
 */
export function addCategoryById(arr, pId, newCate) {
  if (pId === 0) {
    arr.push(newCate);
  } else {
    arr.forEach((item) => {
      if (item.id === pId) {
        if (item.children !== undefined) {
          item.children.push(newCate);
        } else {
          item.children = [];
          item.children.push(newCate);
        }
      }

      if (item.children && item.children.length) {
        return addCategoryById(item.children, pId, newCate);
      }
    });
  }
  return arr;
}

/** 根据orgModuleid获取item的值
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 需要查找的orgmoduleid
 *  @param {Array} resArr 返回目标ID对应的数据集合
 *  by fjw
 */
export function findItemByOrgModuleId(arr, id, resArr) {
  arr.forEach((item) => {
    if (item.org_module_id === id) {
      resArr.push(item);
    }

    if (item.children && item.children.length) {
      return findItemByOrgModuleId(item.children, id, resArr);
    }
  });
  return resArr;
}

/** 获取数组下面有children的item的值
 *  @param {Array} arr 需要处理的数组
 *  @param {Array} resArr 返回目标ID对应的数据集合
 *  by fjw
 */
export function findHasChildrenItem(arr, resArr) {
  arr.forEach((item) => {
    if (item.children && item.children.length) {
      resArr.push(item);
    }
  });
  return resArr;
}

/** 根据目标数组给data添加相应的children（为了解决当根目录移动过后，目录的子目录消失的问题）
 *  @param {Array} arr 需要处理的数组
 *  @param {Array} resarr 根据此数组处理（添加children）目标数组
 *  by fjw
 */
export function AddChildrenItem(arr, resArr) {
  arr.forEach((item) => {
    resArr.forEach((val) => {
      if (item.category_root_id === val.category_root_id) {
        item.children = val.children;
      }
    });
  });
  return arr;
}

/** 根据id获取item的值
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 需要查找的id
 *  @param {Array} resArr 返回目标ID对应的数据集合
 *  by fjw
 */
export function findItemById(arr, id, resArr) {
  arr.forEach((item) => {
    if (item.id === id) {
      resArr.push(item);
    }

    if (item.children && item.children.length) {
      return findItemById(item.children, id, resArr);
    }
  });
  return resArr;
}

/** 目录修改的方法
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 需要修改的的id
 *  @param {String} value 需要修改后的title
 *  by fjw
 */
export function editValueById(arr, id, value) {
  arr.forEach((item) => {
    if (item.id === id) {
      item.name = value;
    }
    if (item.children && item.children.length) {
      return editValueById(item.children, id, value);
    }
  });
  return arr;
}

/** 活码修改的方法
 *  @param {Array} arr 需要处理的数组
 *  @param {number} id 需要修改的的id
 *  @param {String} value 需要修改后的title
 *  by fjw
 */
export function renameQrcodeById(arr, id, value) {
  arr.forEach((item) => {
    if (item.id === id) {
      item.list_name = value;
    }
  });
  return arr;
}

/** 时间戳转为时间
 *  @param {number} value 需要处理的的时间戳
 *  by fjw
 */
export function getLocalTime(value) {
  return new Date(parseInt(value, 10) * 1000).toLocaleString();
}
