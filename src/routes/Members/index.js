import React from 'react';
import { Button, Menu, Dropdown, Icon, message, Modal, Input, Pagination, Spin } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import _ from 'lodash';
import io from 'socket.io-client';
import { getUrlPara } from '../../utils/utils.js';
import styles from './index.less';
import Tree from '../../components/CatalogueTree/membersTree.js';
import SingleVcard from '../../components/Modal/addSingleVcard.js';
import MembersSelection from '../../components/Modal/addMembersSelection.js';
import FastInvite from '../../components/Modal/fastInvite.js';
import ShowVcard from '../../components/Modal/showVcard.js';
import MemberItem from '../../components/Lists';
import QrcodeModel from '../../components/QrcodeModel';
import BeautifyFrame from '../../components/BeautifyFrame';

class ActiveCodeLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: '',
      treeId: '', // 代表所有成员 树ID
      currentTitle: '', // 当前目录名称
      modalVisibleMS: false, // 成员选择
      modalVisibleSV: false, // 单个添加
      modalVisibleFI: false, // 快速邀请
      currentList: '', // 当前列表内容
      codeListModule: false, // 名片数据结构
      loading: this.props.loading,
      loadingDownload: false, // 下载loading
      listsLoading: true,
      pageSize: 20, // 行数的size
      currentPage: 1, // 当前页面
      listCount: 1, // 数据总数
      toolBar: [{ id: 0, value: '编辑' }, { id: 1, value: '二维码' }, { id: 2, value: '名片' }], // 操作栏
      moreToolBar: [{ id: 0, value: '标为离职' }, { id: 1, value: '删除' }], // 更多
      columns: [{ id: 0, type: 'imgObj' }, { id: 1, type: 'link' }], // 单行每列显示的类型
      columnsData: [{ id: 1, value: { before: '点击绑定', after: '已绑定' } }], // 每列对应的数据内容
      orgId: '', // 企业id
      modelvisible: false, // 开关 -- 二维码弹窗显示参数
      beautyVisible: false, // 开关 -- 美化二维码显示
      qrcodeImg: '', // 二维码图片
      qrcodeUrl: '',
      modeldownVisible: false,
      cardModelvisible: false, // 开关 -- 名片显示
      cardImg: '', // 名片图
      singleData: '', // 单个成员信息
      companyName: '', // 企业名称
      bindWxVisible: false, // 开关 -- 绑定微信
      cardLoading: true, // 名片弹窗的loading
      inviteCode: '', // 邀请码的二维码路径
    };
    this.downAllVcard = this.downAllVcard.bind(this);
  }
  componentWillMount() {
    const { dispatch, userInfo } = this.props;
    if (userInfo.code === 1) {
      this.setState({
        companyName: userInfo.data.org_info.org_name,
      });
    }
    dispatch({
      type: 'user/fetchCatrgoryTreeData', // 获取根节点的数据
      payload: { module_id: 2 },
      callback: (res) => {
        if (res.code === 1) {
          const orgModuleId = res.data &&
          res.data.menu_list[0] &&
          res.data.menu_list[0].org_module_id;
          dispatch({
            type: 'members/getTreelist',
            payload: {
              org_module_id: orgModuleId,
            },
            callback: (res1) => {
              if (res1.code === 1) {
                this.setState({
                  treeData: this.TreeDataFilter(res1.data),
                  treeId: res1.data.id,
                  orgId: res1.data.org_id,
                });
              } else {
                message.error(res1.msg.text);
              }
            },
          });
        } else {
          message.error(res.msg.text);
        }
      },
    });
    dispatch({
      type: 'members/getCodeList',
      payload: {
        scene_module_id: 11,
      },
      callback: (res) => {
        if (res.code === 1) {
          this.setState({
            codeListModule: res.data.fields,
            inviteCode: res.data.tpl_msg.tpl_code_path,
            orgQrcodeCaseId: res.data.org_qrcode_case.qrcode_id,
          });
        } else {
          message.error(res.msg.text);
        }
      },
    });
  }
  componentWillReceiveProps(nextProps) {
    const { userInfo } = nextProps;
    if (userInfo.code === 1) {
      this.setState({
        companyName: userInfo.data.org_info.org_name,
      });
    }
  }
  // 设置当前标题
  setCurrentTitle = (currentTitle) => {
    this.setState({
      currentTitleObj: currentTitle,
      currentTitle: currentTitle.title,
      listsLoading: true,
      currentList: '',
    });
    const { pageSize } = this.state;
    this.setCurrentContent(currentTitle.key, pageSize, 1);
  }
  // 设置当前列表内容
  setCurrentContent = (categoryId, pageSizes, currentPages) => {
    this.props.dispatch({
      type: 'members/getList',
      payload: {
        category_id: categoryId,
        pageSize: pageSizes,
        currentPage: currentPages,
        scene_module_id: 11, // 场景id,现在默认的场景是公司，id为11，以后同个身份信息在不同场景下的模板，监听传场景id到后台
      },
      callback: (res) => {
        if (res.code === 1) {
          const currentLists = res.data && res.data.list;
          const currentpages = res.data.page && res.data.page.current_page;
          const rowsSizes = res.data.page && res.data.page.list_size;
          const count = res.data.page && res.data.page.record_total;
          this.setState({
            currentList: currentLists,
            currentPage: currentpages,
            pageSize: rowsSizes,
            listCount: count,
            listsLoading: false,
          });
        } else {
          message.error(res.msg.text);
        }
      },
    });
  }
  TreeDataFilter = (obj) => {
    const recursiveFun = (nodeList) => {
      const arr = [];
      nodeList.forEach((item) => {
        const itemObj = {};
        itemObj.title = item.name;
        itemObj.num = item.code_count;
        itemObj.key = item.id.toString();
        if (item.children && item.children.length > 0) {
          itemObj.children = recursiveFun(item.children);
        }
        arr.push(itemObj);
      });
      return arr;
    };
    let arr = [];
    arr.push({
      title: '所有成员',
      num: obj.code_count,
      key: obj.id.toString(),
      type: 'all',
    });
    if (obj.children) {
      arr = arr.concat(recursiveFun(obj.children));
    }
    return arr;
  }
  addMembersSelection = (modalVisibleMS) => {
    this.setState({ modalVisibleMS });
  }
  // 快速邀请
  fastInvite = (modalVisibleFI) => {
    this.setState({
      modalVisibleMS: false,
      bindWxVisible: false,
    });
    this.setState({ modalVisibleFI });
  }
  // 单个添加
  singleAddMembers = (modalVisibleSV) => {
    this.setState({
      modalVisibleMS: false,
      singleData: '',
    });
    this.setState({ modalVisibleSV });
  }
  // 单个添加表单确认返回数据
  singleAddMembersfn = (values, avatarUrl, callback) => {
    const that = this;
    const idcodeId = values.length ? (values[1][0].idcode_id === 0 ? '' : values[1][0].idcode_id) : '';
    const { orgId, currentList, treeId } = this.state;
    const categoryId = getUrlPara('categoryId') || treeId.toString();
    this.setState({
      listsLoading: true,
    });
    this.props.dispatch({
      type: 'members/operateIdcode',
      payload: {
        org_id: orgId,
        photo_path: avatarUrl,
        idcode_id: idcodeId,
        field_data: values,
      },
      callback: (res) => {
        if (res.code === 1) {
          if (callback) {
            callback();
          }
          if (!idcodeId) { // 新增
            that.setState({
              currentPage: 1,
              currentList: '',
            });
            const { pageSize, currentPage } = that.state;
            that.setCurrentContent(categoryId, pageSize, currentPage);
            that.membersTree.setCatagoryNum(categoryId);
          } else if (categoryId !== res.data.category_id.toString()) { // 编辑更换目录，移除当前列表中的编辑项
            that.membersTree.setCatagoryNum(categoryId, 'del');
            that.membersTree.setCatagoryNum(res.data.category_id);
            for (const i in currentList) {
              if (currentList[i].id === parseInt(res.data.idcode_id, 10)) {
                _.pullAt(currentList, i);
              }
            }
            const currentLists = currentList;
            that.setState({
              currentList: currentLists,
              listsLoading: false,
            });
          } else if (currentList) { // 编辑不更换目录，改变当前列表中编辑项的内容
            for (const i in currentList) {
              if (currentList[i].id === parseInt(res.data.idcode_id, 10)) {
                currentList[i].code_path = res.data.code_path;
                currentList[i].code_photo_path = res.data.code_photo_path;
                currentList[i].department = res.data.department;
                currentList[i].idcode_photo = res.data.idcode_photo;
                currentList[i].job = res.data.job;
                currentList[i].mobile = res.data.mobile;
                currentList[i].name = res.data.name;
                currentList[i].memo = res.data.memo;
                currentList[i].address = res.data.address;
                currentList[i].email = res.data.email;
                currentList[i].photo_path = res.data.photo_path;
              }
            }
            const currentLists = currentList;
            that.setState({
              currentList: currentLists,
              listsLoading: false,
            });
          }
        } else {
          message.error('失败，请重试!');
          this.setState({
            listsLoading: false,
            modalVisibleSV: false,
          });
        }
      },
    });
  }
  downAllVcard = () => {
    const { dispatch } = this.props;
    const { treeId, orgId } = this.state;
    let categoryId = getUrlPara('categoryId');
    if (!categoryId) {
      categoryId = treeId;
    }
    this.setState({ loadingDownload: true });
    dispatch({
      type: 'members/batchDownload',
      payload: {
        org_id: orgId,
        category_id: categoryId,
      },
      callback: (res) => {
        if (res.code === 1) {
          const socket = io.connect('//socket.api.cli.im');
          socket.on('idcode_url_socket', (msg) => {
            window.location.href = msg;
            this.setState({ loadingDownload: false });
          });
          socket.emit('login', res.data.socket_id);
        } else {
          message.error(res.msg.text);
        }
      },
    });
  }
  // 编辑企业信息
  updateCompany = (currentCompanyName) => {
    const that = this;
    const { orgId } = that.state;
    const { userInfo } = that.props;
    setTimeout(() => {
      this.companyInput.focus();
    }, 10);
    let treeNodeValue = currentCompanyName;
    Modal.confirm({
      title: '编辑企业信息',
      className: styles.modalSimple,
      content: <Input placeholder="输入企业名称" ref={(ref) => { this.companyInput = ref; }} defaultValue={currentCompanyName} onChange={(e) => { treeNodeValue = e.target.value; }} />,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        that.props.dispatch({
          type: 'user/updateCompanyInfo',
          payload: {
            org_id: orgId,
            user_company: treeNodeValue,
          },
          callback: (res) => {
            if (res.code === 1) {
              // 修改成功后更新redux数据流中的企业信息
              if (userInfo.code === 1) {
                userInfo.data.org_info.org_name = treeNodeValue;
              }
              that.props.dispatch({
                type: 'user/updateCurrent',
                payload: {
                  userInfo,
                },
                callback: () => {
                  that.setState({
                    companyName: treeNodeValue,
                  });
                },
              });
            }
          },
        });
      },
      onCancel() {
      },
    });
  }
  // 编辑部门
  updateDepartment = () => {
    const that = this;
    setTimeout(() => {
      this.departmentInput.focus();
    }, 10);
    const { currentTitle } = this.state;
    const categoryId = getUrlPara('categoryId');
    let treeNodeValue = currentTitle;
    if (categoryId) {
      Modal.confirm({
        title: '编辑部门',
        className: styles.modalSimple,
        content: <Input placeholder="输入部门名称" ref={(ref) => { this.departmentInput = ref; }} defaultValue={currentTitle} onChange={(e) => { treeNodeValue = e.target.value; }} />,
        cancelText: '取消',
        okText: '确认',
        onOk() {
          that.props.dispatch({
            type: 'members/updateTreeNode',
            payload: {
              node_id: parseInt(categoryId, 10),
              node_name: treeNodeValue,
            },
            callback: (res) => {
              if (res.code === 1) {
                that.membersTree.updateDepartmentTitle(treeNodeValue, categoryId, (treeData) => {
                  that.setState({
                    treeData,
                  });
                });
              } else {
                message.error(res.msg.text);
              }
            },
          });
        },
        onCancel() {
        },
      });
    }
  }
  // 删除部门
  deleteDepartment = () => {
    const that = this;
    const categoryId = getUrlPara('categoryId');
    that.props.dispatch({
      type: 'members/deleteTreeNode',
      payload: {
        node_id: parseInt(categoryId, 10),
      },
      callback: (res) => {
        if (res.code === 1) {
          that.membersTree.deleteDepartmentTitle(categoryId, (treeData) => {
            that.setState({
              treeData,
            });
          });
        } else {
          message.error(res.msg.text);
        }
      },
    });
  }
  // 添加子部门
  addSonDepartment = () => {
    const that = this;
    const categoryId = getUrlPara('categoryId');
    setTimeout(() => {
      this.departmentInputAdd.focus();
    }, 10);
    let treeNodeValue;
    if (categoryId) {
      Modal.confirm({
        title: '新增部门',
        className: styles.modalSimple,
        content: <Input placeholder="输入部门名称" ref={(ref) => { this.departmentInputAdd = ref; }} onChange={(e) => { treeNodeValue = e.target.value; }} />,
        cancelText: '取消',
        okText: '确认',
        onOk() {
          that.addSonDepartmentSuccess([`${categoryId}`], treeNodeValue, (response, id) => {
            that.membersTree.addSonDepartment(response, id);
          });
        },
        onCancel() {
        },
      });
    }
  }
  // 添加根部门
  addDepartment = (callback) => {
    const that = this;
    const { treeData, treeId } = this.state;
    let treeNodeValue;
    setTimeout(() => {
      this.groupInputAdd.focus();
    }, 10);
    Modal.confirm({
      title: '新增群组',
      className: styles.modalSimple,
      content: <Input placeholder="输入群组名" ref={(ref) => { this.groupInputAdd = ref; }} onChange={(e) => { treeNodeValue = e.target.value; }} />,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        that.props.dispatch({
          type: 'members/addTreeNode',
          payload: {
            parent_id: parseInt(treeId, 10),
            node_name: treeNodeValue,
          },
          callback: (res) => {
            if (res.code === 1) {
              treeData.push({
                key: res.data.id,
                num: 0,
                title: res.data.name,
              });
              that.setState({
                treeData,
              }, () => {
                if (callback) callback(that.state.treeData, res.data.id);
              });
            } else {
              message.error(res.msg.text);
            }
          },
        });
      },
      onCancel() {
      },
    });
  }
  // 添加子部门成功
  addSonDepartmentSuccess = (selectedTreeNode, nodeName, callback) => {
    const { treeData } = this.state;
    const obj = _.cloneDeep(treeData);
    const ArrAddedFilter = (objParam, selectedKey, newObj) => {
      for (let i = 0; i < objParam.length; i += 1) {
        if (parseInt(objParam[i].key, 10) === parseInt(selectedKey, 10)) {
          if (objParam[i].children) {
            objParam[i].children.push(newObj);
          } else {
            objParam[i].children = [];
            objParam[i].children.push(newObj);
          }
          break;
        } else if (objParam[i].children) {
          ArrAddedFilter(objParam[i].children, selectedKey, newObj);
        }
      }
      return objParam;
    };
    if (selectedTreeNode.length && selectedTreeNode[0]) {
      this.props.dispatch({
        type: 'members/addTreeNode',
        payload: {
          parent_id: parseInt(selectedTreeNode[0], 10),
          node_name: nodeName,
        },
        callback: (res) => {
          if (res.code === 1) {
            const newObj = {
              key: res.data.id,
              num: 0,
              title: res.data.name,
            };
            this.setState({
              treeData: ArrAddedFilter(obj, selectedTreeNode[0], newObj),
            }, () => {
              if (callback) callback(this.state.treeData, res.data.id);
            });
          } else {
            message.error(res.msg.text);
          }
        },
      });
    }
  }
  // 选择树节点
  selectTree = (selectedKeys) => {
    if (selectedKeys.length) {
      this.props.dispatch(routerRedux.replace(`/active/members?categoryId=${selectedKeys[0]}`));
    }
  }
  listOperationMore = () => {
    return (
      <Menu>
        <Menu.Item key="0"><div onClick={this.downAllVcard}>下载本部门名片</div></Menu.Item>
        <Menu.Item key="1">
          <div onClick={this.updateDepartment.bind(this)}>编辑</div>
        </Menu.Item>
        <Menu.Item className={styles.textRed} key="2">
          <div onClick={this.deleteDepartment.bind(this)}>删除部门</div>
        </Menu.Item>
      </Menu>
    );
  }
  // 导入树节点
  inportExcel = () => {
    console.log('一键导入');
  }
  // 绑定微信
  bindWxIdent = (item) => {
    this.setState({
      bindWxVisible: true,
      qrcodeImg: item.code_photo_path,
      qrcodeUrl: item.new_web_url,
    });
  }
  // 绑定微信下载
  handleFooterBtn = (e) => {
    this.setState({
      bindWxVisible: false,
    });
    const type = e.target.getAttribute('data-type') || e.target.parentNode.getAttribute('data-type');
    const size = e.target.getAttribute('data-size') || e.target.parentNode.getAttribute('data-size');
    const { qrcodeImg } = this.state;
    let url = qrcodeImg.replace('/qr?', '/qr/downQr?');
    if (size) {
      url += `&type=${type}&downsize=${size}`;
    } else {
      url += `&type=${type}`;
    }
    window.open(url);
  }
  // 操作栏的方法
  toolFunc = (value, item) => {
    switch (value) {
      case 0:
        this.handleEdit(item);
        break;
      case 1:
        this.handleCode(item);
        break;
      default:
        this.handleCard(item);
    }
  }
  // 编辑成员
  handleEdit = (item) => {
    this.setState({
      modalVisibleSV: true,
      singleData: item,
    });
  }
  handleCode = (item) => {
    this.setState({
      modelvisible: true,
      qrcodeImg: item.code_photo_path,
      qrcodeUrl: item.new_web_url,
    });
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
    });
  }
  // 设置美化modal显示隐藏
  changeBeautifyVisible = (bool) => {
    this.setState({
      beautyVisible: bool,
    });
  }
  // 点击名片
  handleCard = (item) => {
    if (item.idcode_photo) {
      this.setState({
        cardModelvisible: true,
        cardImg: item.idcode_photo,
        cardLoading: false,
      });
    } else { // 重新获取名片图片
      this.setState({
        cardModelvisible: true,
        cardImg: item.idcode_photo,
        cardLoading: true,
      });
      this.BuildIdcodePhoto(item);
    }
  }
  // 重新获取名片合成图
  BuildIdcodePhoto = (item) => {
    const { orgId, companyName } = this.state;
    const that = this;
    this.props.dispatch({
      type: 'members/buildIdcodePhoto',
      payload: {
        org_id: orgId,
        org_name: companyName,
        code_photo_path: item.qrcode_path,
        department: item.department,
        job: item.job,
        name: item.name,
        mobile: item.mobile,
        idcode_id: item.id,
      },
      callback: (res) => {
        console.log(res);
        if (res.code === 1) {
          console.log(res);
        } else {
          message.error(res.msg.text);
          that.setState({
            cardLoading: false,
            cardModelvisible: false,
          });
        }
      },
    });
  }
  // 名片隐藏
  showVcard = () => {
    this.setState({
      cardModelvisible: false,
    });
  }
  // 名片下载
  downCard = () => {
    const { cardImg } = this.state;

    window.open(cardImg);
  }
  // 更多操作中的方法
  moreFunc = (item, value) => {
    if (value.key === '0') {
      this.handleDeparture(item.id);
    }
    if (value.key === '1') {
      this.handleDeleteItem(item.id);
    }
  }
  // 标记离职
  handleDeparture = (idcodeId) => {
    const that = this;
    Modal.confirm({
      title: '确定将该成员标记为离职吗?',
      content: '标记后，。。。。。。。！',
      okType: 'danger',
      onOk() {
        const { orgId } = that.state;
        that.props.dispatch({
          type: 'members/resignIdcode',
          payload: {
            idcode_id: idcodeId,
            org_id: orgId,
          },
          callback: (res) => {
            if (res.code === 1) {
              const { currentList } = that.state;
              for (const i in currentList) {
                if (currentList[i].id === idcodeId) {
                  currentList[i].status = 11;
                }
              }
              const currentLists = currentList;
              that.setState({
                currentList: currentLists,
              });
            } else {
              message.error('标记失败，请重试!');
            }
          },
        });
      },
      onCancel() {},
    });
  }
  // 删除成员
  handleDeleteItem = (idcodeId) => {
    const that = this;
    const { orgId } = this.state;
    Modal.confirm({
      title: '确定删除这个成员?',
      content: '删除后，该成员信息将消失！',
      okType: 'danger',
      onOk() {
        that.props.dispatch({
          type: 'members/deleteRecord',
          payload: {
            idcode_id: idcodeId,
            org_id: orgId,
          },
          callback: (res) => {
            if (res.code === 1) {
              that.setState({
                currentPage: 1,
                listsLoading: true,
                currentList: '',
              });
              const { pageSize, currentPage, treeId } = that.state;
              const categoryId = getUrlPara('categoryId') === '' ? treeId : getUrlPara('categoryId');
              that.setCurrentContent(categoryId, pageSize, currentPage);
              that.membersTree.setCatagoryNum(categoryId, 'del');
            } else {
              message.error('删除失败，请重试!');
            }
          },
        });
      },
      onCancel() {},
    });
  }
  // 分页
  pageChange = (value) => {
    const { pageSize, treeId } = this.state;
    const categoryId = getUrlPara('categoryId') === '' ? treeId : getUrlPara('categoryId');
    this.setState({
      listsLoading: true,
      currentList: '',
    });
    this.setCurrentContent(categoryId, pageSize, value);
  }
  render() {
    const categoryId = getUrlPara('categoryId');
    const {
      treeData,
      treeId,
      currentTitle,
      currentTitleObj,
      loadingDownload,
      modalVisibleMS,
      modalVisibleSV,
      modalVisibleFI,
      currentList,
      codeListModule,
      loading,
      listsLoading,
      pageSize,
      currentPage,
      listCount,
      toolBar,
      moreToolBar,
      columns,
      columnsData,
      modelvisible,
      beautyVisible,
      qrcodeImg,
      qrcodeUrl,
      modeldownVisible,
      singleData,
      cardModelvisible,
      cardImg,
      companyName,
      bindWxVisible,
      cardLoading,
      inviteCode,
      orgQrcodeCaseId,
    } = this.state;
    const initPageSize = parseInt(pageSize, 10);
    const MemberLists = (!currentList.length)
      ?
      (
        <div className={styles.noList}>
          <h3>您还没有创建成员列表</h3>
          <p>马上创建成员信息，即可生成专属名片</p>
          <Button className={styles.newAddButton} onClick={this.inportExcel}>一键导入成员列表</Button>
        </div>
      )
      :
      (
        <div className={styles.listDetail}>
          <div className={styles.listDetailTitle}>
            <div className={styles.listDetailTitle1}>成员</div>
            <div className={styles.listDetailTitle2}>微信绑定</div>
            <div className={styles.listDetailTitle3}>操作</div>
          </div>
          <div className={styles.listDetailList}>
            <ul>
              <MemberItem
                lists={currentList}
                loading={loading}
                columns={columns}
                columnsData={columnsData}
                toolBar={toolBar}
                toolFunc={this.toolFunc.bind(this)}
                moreToolBar={moreToolBar}
                moreFunc={this.moreFunc.bind(this)}
                bindWxIdent={this.bindWxIdent.bind(this)}
              />
            </ul>
            <Pagination
              total={listCount}
              hideOnSinglePage
              current={currentPage}
              pageSize={initPageSize}
              onChange={this.pageChange}
              className={styles.Paging}
            />
          </div>
        </div>
      );
    const renderLists = (listsLoading === true) ?
      (<div className={styles.example}><Spin /></div>)
      :
      MemberLists;
    return (
      <div className={styles.contentbg}>
        <MembersSelection
          visible={modalVisibleMS}
          singleAddMembers={this.singleAddMembers.bind(this)}
          addMembersSelection={this.addMembersSelection.bind(this)}
          fastInvite={this.fastInvite.bind(this)}
        />
        {
          modalVisibleFI &&
          <FastInvite
            visible={modalVisibleFI}
            fastInvite={this.fastInvite.bind(this)}
            qrcodePath={inviteCode}
            handleFooter="true"
            title="二维码邀请建名片"
            contentOne="扫一扫，即可分享邀请链接到公司微信群"
            contentTwo="快速邀请同事创建自己的企业名片"
            btnContent="确定"
          />
        }
        {
          (companyName && codeListModule && modalVisibleSV) &&
          <SingleVcard
            visible={modalVisibleSV}
            singleAddMembers={this.singleAddMembers.bind(this)}
            treeData={treeData}
            codeListModule={codeListModule}
            currentTitleObj={currentTitleObj}
            companyName={companyName}
            singleAddMembersfn={this.singleAddMembersfn.bind(this)}
            singleData={singleData}
          />
        }
        {
          modelvisible &&
            <QrcodeModel
              qrcodeImg={qrcodeImg}
              qrcodeUrl={qrcodeUrl}
              visible={modelvisible}
              downVisible={modeldownVisible}
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
          cardModelvisible &&
          <ShowVcard
            cardModelvisible={cardModelvisible}
            showVcard={this.showVcard.bind(this)}
            cardImg={cardImg}
            cardLoading={cardLoading}
          />
        }
        {
          bindWxVisible &&
          <FastInvite
            visible={bindWxVisible}
            qrcodePath={qrcodeImg}
            fastInvite={this.fastInvite.bind(this)}
            handleFooterBtn={this.handleFooterBtn.bind(this)}
            handleFooter="false"
            title="该名片还未被认领"
            contentOne="扫码验证手机号，认领专属企业名片"
            contentTwo=""
            btnContent="下载"
          />
        }
        <div className={styles.content}>
          <div className={`${styles.contentHeader} ${styles.clearfix}`}>
            <div className={styles.headerTitle}>
              {
                companyName &&
                <span>{companyName}</span>
              }
              <span className={styles.clieditBtn} onClick={this.updateCompany.bind(this, companyName)}><i className="anticon anticon-cli-edit" /></span>
            </div>
            <div className={styles.headerBtn}>
              {
                orgQrcodeCaseId &&
                <Button>
                  <a href={`/edit/${orgQrcodeCaseId}`} target="_blank" rel="noopener noreferrer">企业主页设置</a>
                </Button>
              }
            </div>
          </div>
          <div className={`${styles.mainContent} ${styles.clearfix}`}>
            <div className={styles.catalogue}>
              <div className={styles.TreeTitle}>组织架构</div>
              {
                treeData.length > 0 ?
                  <Tree
                    gData={treeData}
                    treeId={treeId}
                    textAdd="添加部门"
                    addDepartment={this.addDepartment.bind(this)}
                    setCurrentTitle={this.setCurrentTitle.bind(this)}
                    selectTree={this.selectTree.bind(this)}
                    ref={(ref) => { this.membersTree = ref; }}
                  /> :
                  <div className={styles.treeSpin}><Spin /></div>
              }
            </div>
            <div className={styles.listContent}>
              <div className={styles.listTitle}>
                <div className={styles.listTitleLeft}>
                  <span>{currentTitle}</span>
                </div>
                <div className={styles.listOperationRight}>
                  <span onClick={this.addMembersSelection.bind(this, true)}>添加成员</span>
                  {
                    (treeData.length > 0 &&
                    parseInt(categoryId, 10) &&
                    parseInt(treeData[0].key, 10) !== parseInt(categoryId, 10)) ?
                    (
                      <span>
                        <span onClick={this.addSonDepartment}>添加子部门</span>
                        <span>
                          <Dropdown overlay={this.listOperationMore()} trigger={['click']}>
                            <a className="ant-dropdown-link" href="#">
                              更多<Icon type="down" />
                            </a>
                          </Dropdown>
                        </span>
                      </span>
                    ) :
                      <span onClick={this.downAllVcard}><Icon type="loading" className={loadingDownload ? '' : 'none'} style={{ fontSize: 14, marginRight: '8px' }} spin />下载所有名片</span>
                  }
                </div>
              </div>
              { renderLists }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  userInfo: state.user.currentUser,
}))(ActiveCodeLists);
