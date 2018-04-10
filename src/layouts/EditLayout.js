import React from 'react';
import { Layout, Button, Spin, message, Icon, Modal, notification, Tooltip } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import Immutable from 'immutable';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import styles from './EditLayout.less';
import { getUrlPara, listObjAssign } from '../utils/utils';
import { getOriginData } from '../common/origin';
import { getModuleData } from '../common/nav';
import EditorModuleText from '../components/EditorModule/text.js';
import EditorModuleImg from '../components/EditorModule/img.js';
import EditorModuleFile from '../components/EditorModule/file.js';
import EditorModuleAudio from '../components/EditorModule/audio.js';
import EditorModuleVideo from '../components/EditorModule/video.js';
import EditorModuleTable from '../components/EditorModule/table.js';
import EditorModuleMove from '../components/EditorModule/move.js';
import QrcodeModel from '../components/QrcodeModel';
import BeautifyFrame from '../components/BeautifyFrame';
import LoginFrame from '../components/Login';
import Img from '../routes/Edit/Img';
import Text from '../routes/Edit/Text';
import File from '../routes/Edit/File';
import Audio from '../routes/Edit/Audio';
import Video from '../routes/Edit/Video';
import Table from '../routes/Edit/Table';

const { Header, Content } = Layout;
const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

class EditLayout extends React.Component {
  constructor(props) {
    super(props);
    this.menus = getModuleData();
    this.origin = getOriginData();
    this.state = {
      userInfo: false,
      uploadInfo: false,
      showStatus: false,
      operationType: '',
      list: [],
      listRemove: [],
      qrcodeRecord: '',
      listLoading: true,
      modelvisible: false,
      modeldownVisible: false,
      qrcodevisible: false,
      beautyVisible: false,
      modelloginVisible: false,
      listDefault: '',
      qrcodeImg: '',
      qrcodeUrl: '',
      catalogueInfo: {
        id: false,
        name: '默认目录',
      },
      isFirst: true,
      uploading: false,
      saving: false, // 保存loading状态
      presetCase: 0, // 场景新建标识 场景新建为1 编辑为0
      isLogin: false, // 判断登录状态
      showCollect: 0,
    };
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchCurrent',
      payload: {
        notValid: 1,
      },
      callback: () => {
        if (this.props.userInfo.code === 1) {
          const userInfo = this.props.userInfo.data;
          const isLogin = userInfo.nologin !== 1;
          this.setState({
            isLogin,
          });
          const imgUploadInfo = {
            capacityUsed: 0,
            capacityUsable: userInfo.edition_info.capacity_img,
            limitSize: userInfo.edition_info.image_size_limit,
            editionInfo: userInfo.edition_info,
          };
          const fileUploadInfo = {
            capacityUsed: 0,
            capacityUsable: userInfo.edition_info.capacity_file,
            limitSize: userInfo.edition_info.file_size_limit,
            editionInfo: userInfo.edition_info,
          };
          const mediaUploadInfo = {
            capacityUsed: 0,
            capacityUsable: userInfo.edition_info.capacity_video,
            limitSize: userInfo.edition_info.video_limitsize,
          };
          this.setState({
            userInfo,
            uploadInfo: {
              imgUploadInfo,
              fileUploadInfo,
              mediaUploadInfo,
            },
          });
          this.props.dispatch({
            type: 'user/fetchCapacity',
            payload: {
              notValid: 1,
            },
            callback: () => {
              if (this.props.capacityInfo.code === 1) {
                const capacityInfo = this.props.capacityInfo.data;
                const obj1 = this.state.uploadInfo;
                const obj2 = Immutable.fromJS(obj1)
                  .updateIn(['imgUploadInfo', 'capacityUsed'], () => capacityInfo.img)
                  .updateIn(['fileUploadInfo', 'capacityUsed'], () => capacityInfo.file)
                  .updateIn(['mediaUploadInfo', 'capacityUsed'], () => capacityInfo.video);
                this.setState({
                  uploadInfo: obj2.toJS(),
                });
              } else {
                message.error(this.props.capacityInfo.msg.text);
              }
            },
          });
          this.props.dispatch({
            type: 'edit/showCollect',
            payload: {
              user_id: parseInt(this.props.userInfo.data.user_info.user_id, 10),
            },
            callback: (response) => {
              if (response.code === 1) {
                this.setState({
                  showCollect: response.data,
                });
              }
            },
          });
        } else {
          message.error(this.props.userInfo.msg.text);
        }
      },
    });
    const arr = this.props.location.pathname.split('/');
    const qrcodeId = arr[arr.length - 1];
    if (qrcodeId !== 'edit') {
      this.getQrcodeMsg(qrcodeId);
    } else {
      this.setState({
        listLoading: false,
      });
    }
    this.props.dispatch({
      type: 'edit/getDefaultList',
      callback: () => {
        if (this.props.Defaultlist.code === 1) {
          this.setState({
            listDefault: this.props.Defaultlist.data,
          });
        } else {
          message.error(this.props.Defaultlist.msg.text);
        }
      },
    });
  }
  componentDidMount() {
    notification.config({
      placement: 'topLeft',
      duration: 3,
    });
  }
  getQrcodeMsg = (qrcodeId) => {
    this.props.dispatch({
      type: 'activeCode/fetchQrcodeMsg',
      payload: {
        id: qrcodeId,
      },
      callback: () => {
        if (this.props.QrcodeMsg.code === 1) {
          this.setInitState(this.props.QrcodeMsg.data);
        } else {
          message.error(this.props.QrcodeMsg.msg.text);
        }
      },
    });
  }
  getPageTitle = () => {
    const title = '编辑';
    return title;
  }
  // 设置list初始值
  setInitState = (item) => {
    let isFirst;
    const listObj = cloneDeep(item.qrcode_compontent);
    const presetCase = item.qrcode_record.preset_case; // 场景新建标识
    if (presetCase) { // 场景新建
      isFirst = true;
      this.setState({
        presetCase,
      });
    } else {
      isFirst = false;
    }
    this.setState({
      list: listObjAssign(listObj),
      isFirst,
      qrcodeRecord: item.qrcode_record,
      qrcodeImg: item.qrcode_record.qrcode_url,
      qrcodeUrl: item.qrcode_record.web_url,
      listRemove: [],
      listLoading: false,
      showStatus: false,
    });
  }
  // 获取左侧导航模块信息 return component
  getNavMenuItems(menusData, parentPath = '') {
    if (!menusData) {
      return [];
    }
    return menusData.map((item) => {
      if (!item.name) {
        return null;
      }
      let itemPath;
      if (item.path.indexOf('http') === 0) {
        itemPath = item.path;
      } else {
        itemPath = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
      }
      if (item.children && item.children.some(child => child.name)) {
        return (
          <span className={styles.mediaModuleContent} key={item.key || item.path}>
            <div className={styles.mediaModuleTitle}>
              <Icon type={item.icon} style={{ marginRight: '8px' }} />
              <span>{item.name}</span>
            </div>
            {this.getNavMenuItems(item.children, itemPath)}
          </span>
        );
      }
      itemPath = parentPath;
      return (
        <div
          className={styles.mediaModule}
          onClick={this.addEditorModule}
          key={item.key || item.path}
          data-type={item.path}
        >
          <Icon type={item.icon} style={{ marginRight: '8px' }} />
          <span>{item.name}</span>
        </div>
      );
    });
  }
  // 获取中间区域模块内容 return component
  getModuleType = (item, editionInfo) => {
    let editionId;
    if (editionInfo !== undefined) {
      editionId = editionInfo.edition_id;
    }
    return item.map((option, index) => {
      const i = index;
      const optionType = option.type;
      const recentList = this.state.list[i] || '';
      const uidFocus = option.uniqueId;
      const { uniqueId } = this.state.operationType;
      if (optionType === 'text') {
        return (
          <div
            id={`module_${uidFocus}`}
            className={uidFocus === uniqueId ? `${styles.moduleText} ${styles.borderFocus}` : styles.moduleText}
            onClick={this.showOperationBox.bind(this, option)}
            key={`${optionType}${i}`}
          >
            <EditorModuleText key={`${optionType}${i}`} list={recentList} />
            <div className={styles.mask}>
              <div className={styles.operationBtn}>
                {recentList.desc}
                <EditorModuleMove type={optionType} />
              </div>
            </div>
          </div>
        );
      } else if (optionType === 'image') {
        return (
          <div
            id={`module_${uidFocus}`}
            className={uidFocus === uniqueId ? `${styles.moduleText} ${styles.borderFocus}` : styles.moduleText}
            onClick={this.showOperationBox.bind(this, option)}
            key={`${optionType}${i}`}
          >
            <EditorModuleImg key={`${optionType}${i}`} list={recentList} />
            <div className={styles.mask}>
              <div className={styles.operationBtn}>
                {recentList.desc}
                <EditorModuleMove type={optionType} />
              </div>
            </div>
          </div>
        );
      } else if (optionType === 'file') {
        return (
          <div
            id={`module_${uidFocus}`}
            className={uidFocus === uniqueId ? `${styles.moduleText} ${styles.borderFocus}` : styles.moduleText}
            onClick={this.showOperationBox.bind(this, option)}
            key={`${optionType}${i}`}
          >
            <EditorModuleFile key={`${optionType}${i}`} list={recentList} />
            <div className={styles.mask}>
              <div className={styles.operationBtn}>
                {recentList.desc}
                <EditorModuleMove type={optionType} />
              </div>
            </div>
          </div>
        );
      } else if (optionType === 'audio') {
        return (
          <div
            id={`module_${uidFocus}`}
            className={uidFocus === uniqueId ? `${styles.moduleText} ${styles.borderFocus}` : styles.moduleText}
            onClick={this.showOperationBox.bind(this, option)}
            key={`${optionType}${i}`}
          >
            <EditorModuleAudio key={`${optionType}${i}`} list={recentList} editionId={editionId} />
            <div className={styles.mask}>
              <div className={styles.operationBtn}>
                {recentList.desc}
                <EditorModuleMove type={optionType} />
              </div>
            </div>
          </div>
        );
      } else if (optionType === 'video') {
        return (
          <div
            id={`module_${uidFocus}`}
            className={uidFocus === uniqueId ? `${styles.moduleText} ${styles.borderFocus}` : styles.moduleText}
            onClick={this.showOperationBox.bind(this, option)}
            key={`${optionType}${i}`}
          >
            <EditorModuleVideo key={`${optionType}${i}`} list={recentList} editionId={editionId} />
            <div className={styles.mask}>
              <div className={styles.operationBtn}>
                {recentList.desc}
                <EditorModuleMove type={optionType} />
              </div>
            </div>
          </div>
        );
      } else if (optionType === 'table') {
        return (
          <div
            id={`module_${uidFocus}`}
            className={uidFocus === uniqueId ? `${styles.moduleText} ${styles.borderFocus}` : styles.moduleText}
            onClick={this.showOperationBox.bind(this, option)}
            key={`${optionType}${i}`}
          >
            <EditorModuleTable key={`${optionType}${i}`} list={recentList} />
            <div className={styles.mask}>
              <div className={styles.operationBtn}>
                {recentList.desc}
                <EditorModuleMove type={optionType} />
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div />
        );
      }
    });
  }
  // 获取数组下标返回uniqueID
  getArrIndex = (option) => {
    const { list } = this.state;
    let index;
    for (const i in list) {
      if (Object.prototype.hasOwnProperty.call(list, i)) {
        if (list[i].uniqueId === option.uniqueId) {
          index = i;
          break;
        }
      }
    }
    return index;
  }
  // 获取操作区域类型 return component
  getOperationType = (option) => {
    const { listDefault, uploadInfo, uploading } = this.state;
    if (option.type === 'text') {
      return (
        <Text
          list={option}
          listDefault={listDefault.text}
        />
      );
    } else if (option.type === 'image') {
      return (
        <Img
          list={option}
          listDefault={listDefault.image}
          uploadInfo={uploadInfo.imgUploadInfo}
          changeUploadState={this.changeUploadState.bind(this)}
          loading={uploading} // 上传状态
        />
      );
    } else if (option.type === 'file') {
      return (
        <File
          list={option}
          listDefault={listDefault.file}
          uploadInfo={uploadInfo.fileUploadInfo}
          changeUploadState={this.changeUploadState.bind(this)}
          loading={uploading} // 上传状态
        />
      );
    } else if (option.type === 'audio') {
      return (
        <Audio
          list={option}
          listDefault={listDefault.audio}
          uploadInfo={uploadInfo.mediaUploadInfo}
          changeUploadState={this.changeUploadState.bind(this)}
          loading={uploading} // 上传状态
        />
      );
    } else if (option.type === 'video') {
      return (
        <Video
          list={option}
          listDefault={listDefault.video}
          uploadInfo={uploadInfo.mediaUploadInfo}
          changeUploadState={this.changeUploadState.bind(this)}
          loading={uploading} // 上传状态
        />
      );
    } else if (option.type === 'table') {
      return (
        <Table list={option} listDefault={listDefault.table} />
      );
    } else {
      return (
        <div />
      );
    }
  }
  // 新增模块 添加uid
  getMaxUniqueId = (list) => {
    let maxId;
    list.forEach((item, index) => {
      if (index === 0) {
        maxId = item.uniqueId;
      } else if (item.uniqueId > maxId) {
        maxId = item.uniqueId;
      }
    });
    return maxId + 1;
  }
  // 点击左侧组件导航添加模块
  addEditorModule = (e) => {
    const { listDefault, operationType, uploading } = this.state;
    if (operationType.uniqueId) {
      const moduleDomObj = document.getElementById(`module_${operationType.uniqueId}`);
      const editContent = document.getElementById('editContent');
      if (moduleDomObj) {
        new Promise((resolve) => {
          resolve();
        }).then(() => {
          editContent.scrollTop = moduleDomObj.offsetTop - 60;
        });
      }
    }
    const moduleType = e.target.getAttribute('data-type') || e.target.parentNode.getAttribute('data-type');
    const editorModule = () => {
      const newList = this.state.list;
      let obj;
      let maxId;
      if (newList.length > 0) {
        maxId = this.getMaxUniqueId(newList);
      } else {
        maxId = 0;
      }
      if (moduleType === 'text') {
        obj = cloneDeep(listDefault.text);
      } else if (moduleType === 'image') {
        obj = cloneDeep(listDefault.image);
      } else if (moduleType === 'file') {
        obj = cloneDeep(listDefault.file);
      } else if (moduleType === 'audio') {
        obj = cloneDeep(listDefault.audio);
      } else if (moduleType === 'video') {
        obj = cloneDeep(listDefault.video);
      } else if (moduleType === 'table') {
        obj = cloneDeep(listDefault.table);
      } else {
        obj = cloneDeep(listDefault.text);
      }
      // 添加类型属性和唯一ID（用于模块操作，保存时去除）
      obj.type = moduleType;
      obj.uniqueId = maxId;
      obj.attribute_list = [];
      const indexCurrent = findIndex(newList, { uniqueId: operationType.uniqueId });
      if (indexCurrent > -1) {
        newList.splice(indexCurrent + 1, 0, obj);
      } else {
        newList.push(obj);
        // 滚动定位到最底部
        const editContent = document.getElementById('editContent');
        if (editContent) {
          new Promise((resolve) => {
            resolve();
          }).then(() => {
            editContent.scrollTop = editContent.scrollHeight;
          });
        }
      }
      this.setState({
        list: newList,
      });
      this.showOperationBox(obj);
    };
    const that = this;
    if (uploading) {
      const { confirm } = Modal;
      confirm({
        title: '警告',
        content: '该操作将会中断上传，是否继续？',
        cancelText: '中断上传',
        okText: '继续上传',
        onOk() {
          return false;
        },
        onCancel() {
          new Promise((resolve) => {
            that.changeUploadState(false); // 终止上传
            resolve();
          }).then(() => {
            editorModule();
          });
        },
      });
    } else {
      editorModule();
    }
  }
  // 编辑区域内操作项（排序）
  sortList = (list, index, action) => {
    const arr = list;
    const i = parseInt(index, 10);
    if (action === 'prev') {
      if (i > 0) {
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
        this.setState({
          list: arr,
        });
      } else {
        message.error('已经是最上级，无法上移');
      }
    } else if (action === 'next') {
      if (i < list.length - 1) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        this.setState({
          list: arr,
        });
      } else {
        message.error('已经是最下级，无法下移');
      }
    } else if (action === 'gotop') {
      if (i > 0) {
        const flag = arr[i];
        arr.splice(i, 1);
        arr.unshift(flag);
        this.setState({
          list: arr,
        });
      } else {
        message.error('已经是最上级，无法上移');
      }
    } else if (action === 'remove') {
      const { listRemove } = this.state;
      const arrTmp = cloneDeep(arr[i]);
      // id存在的情况下改变状态值
      if (arrTmp.id) {
        arrTmp.status = 1;
        listRemove.push(arrTmp);
      }
      arr.splice(i, 1);
      this.setState({
        list: arr,
        listRemove,
      });
    } else if (action === 'copy') {
      const arrTmp = cloneDeep(arr[i]);
      arrTmp.uniqueId = this.getMaxUniqueId(arr);
      arrTmp.id = '';
      arr.splice(i + 1, 0, arrTmp);
    }
  }
  linkToCatalogue = (catalogueInfo) => {
    const { history } = this.props;
    notification.close('saveSuccess');
    history.push(`/active/activecode?categoryId=${catalogueInfo.id}&categoryRootId=${catalogueInfo.rootId}&p=${catalogueInfo.page}`);
  }
  linkComponent = () => {
    const { catalogueInfo } = this.state;
    return (
      <div className={styles.saveSuccess}>
        <span className={styles.fl}>该活码已保存至</span>
        <span
          onClick={this.linkToCatalogue.bind(this, catalogueInfo)}
          className={styles.catologueName}
        >
          {catalogueInfo.name}
        </span>
        <span className={styles.fl}>里，点击前去后台管理</span>
      </div>
    );
  }
  // 登录成功后回调
  loginSuccess = () => {
    new Promise((resolve) => {
      this.setState({
        isLogin: true,
      });
      resolve();
    }).then(() => {
      this.createQrcode(false);
    });
  }
  // 生成二维码
  createQrcode = (isSaved) => {
    const { list, qrcodeRecord, listRemove, isFirst, uploading, isLogin } = this.state;
    // 未登录状态下出登录弹窗
    if (!isLogin) {
      this.changeLoginVisible(true);
      return false;
    }
    let categoryId = parseInt(getUrlPara('categoryId', this.props.location.search), 10);
    let categoryPage;
    if (getUrlPara('p', this.props.location.search)) {
      categoryPage = parseInt(getUrlPara('p', this.props.location.search), 10);
    } else {
      categoryPage = 1;
    }
    if (!categoryId) {
      categoryId = '';
    }
    let obj = cloneDeep(list);
    obj = obj.concat(listRemove);
    let listNew;
    obj.map((item) => {
      delete item.uniqueId;
      delete item.type;
      return item;
    });
    if (qrcodeRecord) { // 案例建码或编辑
      // 只要url参数中传了categoryId 都是目录新建
      if (categoryId !== '') {
        qrcodeRecord.category_id = categoryId;
      }
      listNew = {
        qrcode_compontent: obj,
        qrcode_record: qrcodeRecord,
      };
    } else {
      listNew = {
        qrcode_compontent: obj,
        qrcode_record: {
          list_name: '',
          category_id: categoryId,
        },
      };
    }
    if (!listNew.qrcode_compontent.length) {
      message.error('请先编辑内容再生码');
      return false;
    } else {
      let i = 0;
      while (listNew.qrcode_compontent) {
        if (listNew.qrcode_compontent[i].attribute_list.length > 0) {
          break;
        }
        i += 1;
        if (i === listNew.qrcode_compontent.length) {
          break;
        }
      }
      if (listNew.qrcode_compontent.length === i) {
        message.error('请先编辑内容再保存');
        return false;
      }
    }
    const qrcodeFun = () => {
      this.setState({
        saving: true,
      });
      this.changeUploadState(false); // 终止上传
      this.props.dispatch({
        type: 'edit/saveQrcodeMsg',
        payload: {
          qrcode_msg: listNew,
        },
        callback: () => {
          this.setState({
            saving: false,
          });
          if (this.props.SaveRetMsg.code === 1) {
            const ret = this.props.SaveRetMsg.data;
            this.setState({
              showStatus: false, // 隐藏操作区域
              operationType: '', // 设置当前操作类型为空
              qrcodeImg: ret.qrcode_url,
              qrcodeUrl: ret.web_url,
              catalogueInfo: {
                id: ret.category_msg.category_id,
                rootId: ret.category_msg.category_root_id,
                name: ret.category_msg.name,
                page: categoryPage,
              },
            });
            this.setInitState(ret.qrcode_msg);
            if (!isSaved) {
              this.changeModelVisible(true);
            } else {
              notification.success({
                message: '保存成功！',
                style: { width: '550px' },
                key: 'saveSuccess',
                description: this.linkComponent(),
              });
            }
            // 首次保存更换按钮
            if (isFirst) {
              this.setState({
                isFirst: false,
              });
            }
          } else {
            message.error(this.props.SaveRetMsg.msg.text);
          }
        },
      });
    };
    const that = this;
    if (uploading) {
      const { confirm } = Modal;
      confirm({
        title: '警告',
        content: '该操作将会中断上传，是否继续？',
        cancelText: '中断上传',
        okText: '继续上传',
        onOk() {
          return false;
        },
        onCancel() {
          new Promise((resolve) => {
            that.changeUploadState(false); // 终止上传
            resolve();
          }).then(() => {
            qrcodeFun();
          });
        },
      });
    } else {
      qrcodeFun();
    }
  }
  // 改变上传中状态
  changeUploadState = (bool) => {
    this.setState({
      uploading: bool,
    });
  }
  // 显示右侧操作区域
  showOperationBox = (option, e) => {
    const { uploading, operationType } = this.state;
    let { showStatus } = this.state;
    let action;
    if (e) {
      action = e.target.getAttribute('data-move');
    }
    const operationBox = () => {
      const { list } = this.state;
      const index = this.getArrIndex(option);
      showStatus = true;
      if (action === 'prev' || action === 'next' || action === 'gotop' || action === 'remove' || action === 'copy') {
        this.sortList(list, index, action);
        if (action === 'remove') {
          showStatus = false;
        }
      }
      if (operationType !== '' && showStatus) {
        new Promise((resolve) => {
          this.setState({
            showStatus: false,
            operationType: '',
          });
          setTimeout(() => {
            resolve();
          }, 200);
        }).then(() => {
          this.setState({
            showStatus,
            operationType: option,
          });
        });
      } else {
        this.setState({
          showStatus,
          operationType: option,
        });
      }
    };
    const that = this;
    if (uploading) {
      const { confirm } = Modal;
      confirm({
        title: '警告',
        content: '该操作将会中断上传，是否继续？',
        cancelText: '中断上传',
        okText: '继续上传',
        onOk() {
          return false;
        },
        onCancel() {
          operationBox();
          that.changeUploadState(false); // 终止上传
        },
      });
    } else {
      operationBox();
    }
  }
  // 隐藏右侧操作区域
  hideOperationBox = () => {
    const { uploading } = this.state;
    const that = this;
    if (uploading) {
      const { confirm } = Modal;
      confirm({
        title: '警告',
        content: '该操作将会中断上传，是否继续？',
        cancelText: '中断上传',
        okText: '继续上传',
        onOk() {
          return false;
        },
        onCancel() {
          that.setState({
            showStatus: false,
            operationType: '',
          });
          that.changeUploadState(false); // 终止上传
        },
      });
    } else {
      this.setState({
        showStatus: false,
        operationType: '',
      });
    }
  }
  // 设置qrcode modal显示隐藏
  changeModelVisible = (bool, downVisible) => {
    let temp;
    if (downVisible) {
      temp = true;
    } else {
      temp = false;
    }
    this.setState({
      modelvisible: bool,
      modeldownVisible: temp,
      qrcodevisible: false,
    });
  }
  // 设置美化modal显示隐藏
  changeBeautifyVisible = (bool) => {
    this.setState({
      beautyVisible: bool,
      qrcodevisible: false,
    });
  }
  // 显示二维码浮层
  changeQrcodeVisible = (bool) => {
    this.setState({
      qrcodevisible: bool,
    });
  }
  historyBack = () => {
    const { history } = this.props;
    history.goBack();
  }
  createAgain = () => {
    const { history, location } = this.props;
    const { catalogueInfo, presetCase } = this.state;
    new Promise((resolve) => {
      this.setState({
        showStatus: false, // 隐藏操作区域
        operationType: '', // 设置当前操作类型为空
        list: [],
        listRemove: [],
        qrcodeRecord: '',
        isFirst: true,
      });
      resolve();
    }).then(() => {
      const arr = location.pathname.split('/');
      const qrcodeId = arr[arr.length - 1];
      if (parseInt(presetCase, 10) === 1 && qrcodeId !== 'edit') {
        this.getQrcodeMsg(qrcodeId);
        history.replace(`/edit/${qrcodeId}?categoryId=${catalogueInfo.id}&categoryRootId=${catalogueInfo.rootId}&p=${catalogueInfo.page}`);
      } else if (catalogueInfo.id) {
        history.replace(`/edit?categoryId=${catalogueInfo.id}&categoryRootId=${catalogueInfo.rootId}&p=${catalogueInfo.page}`);
      } else {
        history.replace(`/edit${location.search}`);
      }
    });
  }
  changeLoginVisible = (bool) => {
    this.setState({
      modelloginVisible: bool,
    });
  }
  loginComponent = (bool) => {
    const { cliDomain } = this.origin;
    document.domain = cliDomain;
    if (bool) {
      return (
        <LoginFrame
          visible
          fn={this.changeLoginVisible.bind(this, false)}
          loginSuccess={this.loginSuccess.bind(this)}
        />
      );
    } else {
      return (
        <div />
      );
    }
  }
  //  改变是否显示收藏按钮
  changeCollect = () => {
    const userId = parseInt(this.props.userInfo.data.user_info.user_id, 10);
    const { showCollect } = this.state;
    let setValue;
    if (showCollect === 1) {
      this.setState({
        showCollect: 0,
      });
      setValue = 0;
    } else {
      this.setState({
        showCollect: 1,
      });
      setValue = 1;
    }
    this.props.dispatch({
      type: 'edit/showCollectControll',
      payload: {
        user_id: userId,
        set_key: 'show_collect',
        set_value: setValue,
      },
      callback: () => {

      },
    });
  }
  render() {
    const {
      userInfo,
      showStatus,
      list,
      operationType,
      listLoading,
      modelvisible,
      modeldownVisible,
      modelloginVisible,
      qrcodevisible,
      beautyVisible,
      qrcodeImg,
      qrcodeUrl,
      catalogueInfo,
      isFirst,
      saving,
      showCollect,
      isLogin,
    } = this.state;
    const { staticDomain } = this.origin;
    const layout = (
      <Layout style={{ background: '#f0f0f0', minWidth: '1280px', height: '100vh' }}>
        {this.loginComponent(modelloginVisible)}
        {
          modelvisible &&
            <QrcodeModel
              qrcodeImg={qrcodeImg}
              qrcodeUrl={qrcodeUrl}
              visible={modelvisible}
              downVisible={modeldownVisible}
              catalogueInfo={catalogueInfo}
              linkfn={this.linkToCatalogue.bind(this)}
              fn={this.changeModelVisible.bind(this)}
            />
        }
        {
          beautyVisible &&
            <BeautifyFrame
              visible={beautyVisible}
              fn={this.changeBeautifyVisible.bind(this, false)}
              data={qrcodeUrl}
            />
        }
        {
          qrcodevisible &&
            <div
              className={styles.qrcodeContent}
              onMouseEnter={this.changeQrcodeVisible.bind(this, true)}
              onMouseLeave={this.changeQrcodeVisible.bind(this, false)}
            >
              <div className={styles.qrcodeTitle}>微信扫码预览</div>
              <img src={qrcodeImg} alt="" />
              <div className={styles.operatingBtnContent}>
                <div
                  className={styles.operatingDown}
                  onClick={this.changeModelVisible.bind(this, true, 'showDownload')}
                >下载其他格式
                </div>
                <div
                  className={styles.operatingBeautify}
                  onClick={this.changeBeautifyVisible.bind(this, true)}
                >二维码美化
                </div>
              </div>
            </div>
        }
        <Header className={styles.header}>
          <a href="//cli.im" target="_blank" rel="noopener noreferrer">
            <img className={styles.logo} src={`${staticDomain}/images/nc/cli-icon@2x.png`} alt="" />
          </a>
          <div style={{ float: 'right' }}>
            {
              isFirst ?
                <Button type="primary" data-analyze={[1, 2]} onClick={this.createQrcode.bind(this, false)} loading={saving}>生成二维码</Button> :
                (
                  <span>
                    <Icon
                      type="cli-code"
                      onMouseEnter={this.changeQrcodeVisible.bind(this, true)}
                      onMouseLeave={this.changeQrcodeVisible.bind(this, false)}
                      className={styles.qrcodeIcon}
                    />
                    <Button
                      type="primary"
                      onClick={this.createQrcode.bind(this, true)}
                      loading={saving}
                      data-analyze={[1, 3]}
                    >
                      保存
                    </Button>
                    <Button className={styles.clibtn} style={{ marginLeft: '8px' }} data-analyze={[1, 0]} onClick={this.createAgain.bind(this)}>再建一个</Button>
                  </span>
                )
            }
            <Button className={styles.clibtn} style={{ marginLeft: '8px' }} data-analyze={[1, 1]} onClick={this.historyBack.bind(this)}>返回</Button>
          </div>
        </Header>
        <Layout className={styles.NavContent}>
          {this.getNavMenuItems(this.menus)}
        </Layout>
        <Layout className={styles.editContent} id="editContent" style={{ height: '100vh' }}>
          <img
            className={styles.headerImg}
            src={`${staticDomain}/images/nc/mobileheader@2x.png`}
            alt=""
          />
          <div className={styles.companyName}>{userInfo.org_info ? userInfo.org_info.org_name : '草料二维码'}</div>
          <div className={styles.moduleContent}>
            { listLoading ? (<div style={{ textAlign: 'center' }}><Spin /></div>) :
              this.getModuleType(list, userInfo.edition_info)
            }
          </div>
          <div className={isLogin ? styles.collectContent : styles.collectContentHide}>
            <Tooltip placement="top" title="收藏功能说明">
              <a href="//cli.im/news/help/33390" target="_blank" rel="noopener noreferrer" className={styles.collectQuestion}>
                <Icon className={`${styles.collectQuestionIcon} anticon anticon-cli-question-fill`} />
              </a>
            </Tooltip>
            <div className={styles.collectName}>开启收藏</div>
            <input type="checkbox" className={styles.showCollect} onClick={this.changeCollect.bind(this)} checked={showCollect} />
          </div>
        </Layout>
        <Content>
          <Layout className={showStatus ? styles.operationShow : styles.operationContent}>
            <Icon type="close" className={styles.iconClose} onClick={this.hideOperationBox.bind(this)} />
            {this.getOperationType(operationType)}
          </Layout>
        </Content>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(state => ({
  userInfo: state.user.currentUser,
  capacityInfo: state.user.capacityInfo,
  currentList: state.edit.list,
  QrcodeMsg: state.activeCode.QrcodeMsg,
  Defaultlist: state.edit.Defaultlist,
  qrcodeId: state.edit.qrcodeId,
  SaveRetMsg: state.edit.SaveRetMsg,
}))(EditLayout);
