import React from 'react';
import { Button, Checkbox, Select, Pagination, Modal, Layout, Spin, message, notification } from 'antd';
// import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { CodeItem } from '../../components/ActiveCode';
import CatalogueTree from '../../components/CatalogueTree';

import { getUrlPara, renameQrcodeById } from '../../utils/utils.js';

import styles from './activeCode.less';


const CheckboxGroup = Checkbox.Group;

class ActiveCode extends React.Component {
  state = {
    treeData: this.props.treeData,
    checkAll: this.props.checkAll, // 是否全选
    checkedList: this.props.checkedList, // 当前选中的码的个数
    rowsSize: 20, // 行数的size
    currentpage: 1, // 当前页面
    modal1Visible: false, // 移动码的model
    isMove: true, // tree是否是移动的tree
    MoveCatelog: [],
    lists: this.props.lists,
    cacheTreeData: this.props.cache_tree_data,
    codeCount: 1,
    loading: this.props.loading,
    qrcodeCount: this.props.qrcode_count, // 总共的码的数量
    editQrcodeId: 1, // 编辑修改活码名称的id
    editQrcodeStatus: false, // 编辑修改活码的状态
    editQrcodeName: '', // 编辑修改活码名称的名字
    changeQrcodeLoading: this.props.changeQrcodeLoading,
    changeQrcodeListsLoading: this.props.changeQrcodeListsLoading,
    // defaultCatalogId: this.props.defaultCatalogId,
    defaultId: '',
  };

  componentWillMount() {
    const { dispatch, location } = this.props;
    const { cacheTreeData, rowsSize, currentpage } = this.state;
    const { search } = location;

    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const pageSize = getUrlPara('page_size', search);
    const curpage = parseInt(page, 10);
    const catalogId = parseInt(cataId, 10);
    const curPageSize = parseInt(pageSize, 10);

    if (cacheTreeData && cacheTreeData.length > 0) { // 返回如果有缓存数据的话，treedata为缓存数据，否则请求接口
      this.setState({ treeData: cacheTreeData });
      dispatch({
        type: 'user/fetchCatrgoryTreeData', // 获取根节点的数据
        payload: { module_id: 1 },
        callback: () => {
          if (this.props.RootCatalogIdMsg.code === 1) {
            if (cataId && cataId !== '' && curpage && curpage !== undefined && curPageSize && curPageSize !== undefined) {
              this.getLists(
                catalogId,
                curpage,
                curPageSize
              );
            } else if (cataId === '') {
              this.getLists(
                this.props.RootCatalogIdMsg.data.menu_list[0].category_root_id,
                currentpage,
                rowsSize
              );
            } else {
              this.getLists(
                catalogId,
                currentpage,
                rowsSize
              );
            }
            dispatch({
              type: 'catelog/defaultCatalogId', // 获取根节点的数据
              payload: this.props.RootCatalogIdMsg.data.menu_list[0].category_root_id,
            });
            this.setState({
              treeData: this.props.RootCatalogIdMsg.data.menu_list,
            });
          } else {
            message.error(this.props.RootCatalogIdMsg.msg.text);
          }
        },
      });
    } else {
      dispatch({
        type: 'user/fetchCatrgoryTreeData', // 获取根节点的数据
        payload: { module_id: 1 },
        callback: () => {
          if (this.props.RootCatalogIdMsg.code === 1) {
            if (cataId && cataId !== '' && curpage && curpage !== undefined && curPageSize && curPageSize !== undefined) {
              this.getLists(
                catalogId,
                curpage,
                curPageSize
              );
            } else if (cataId === '') {
              this.getLists(
                this.props.RootCatalogIdMsg.data.menu_list[0].category_root_id,
                currentpage,
                rowsSize
              );
            } else {
              this.getLists(
                catalogId,
                currentpage,
                rowsSize
              );
            }
            this.setState({
              treeData: this.props.RootCatalogIdMsg.data.menu_list,
              // defaultCatalogId: this.props.RootCatalogIdMsg.data.menu_list[0].category_root_id,
            });
            dispatch({
              type: 'catelog/defaultCatalogId', // 获取根节点的数据
              payload: this.props.RootCatalogIdMsg.data.menu_list[0].category_root_id,
            });
          } else {
            message.error(this.props.RootCatalogIdMsg.msg.text);
          }
        },
      });
    }
    this.setState({
      changeQrcodeListsLoading: 'noloading',
    });
  }

  componentDidMount() {
    notification.config({
      placement: 'topLeft',
      duration: 3,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        checkAll: nextProps.checkAll,
        checkedList: nextProps.checkedList,
        treeData: nextProps.treeData,
        loading: nextProps.loading,
        // lists: nextProps.lists,
        changeQrcodeLoading: nextProps.changeQrcodeLoading,
        qrcodeCount: nextProps.qrcode_count,
      });
      if (this.props.lists !== nextProps.lists) {
        this.setState({
          lists: nextProps.lists,
        });
      }
      if (this.props.changeQrcodeListsLoading !== nextProps.changeQrcodeListsLoading) {
        this.setState({
          changeQrcodeListsLoading: nextProps.changeQrcodeListsLoading,
        });
      }
    }
  }

  // 全选按钮
  onChange = (e) => {
    const { dispatch } = this.props;
    const { lists, rowsSize, currentpage } = this.state;
    dispatch({
      type: 'activeCode/checkAllAction',
      payload: { checkall: e.target.checked, lists },
    });
    if (e.target.checked) {
      const ids = [];
      lists.map((item) => {
        ids.push(item.id);
        return ids;
      });
      const pagesize = rowsSize;
      const currentPage = currentpage;
      const newsId = [];
      ids.map((item, index) => {
        if (index >= pagesize * (currentPage - 1) && index < pagesize * currentPage) {
          newsId.push(item);
        }
        return newsId;
      });
      dispatch({
        type: 'activeCode/PutCheckListsId',
        payload: { qrcode_ids: newsId, lists },
      });
    } else {
      dispatch({
        type: 'activeCode/PutCheckListsId',
        payload: { qrcode_ids: [], lists },
      });
    }
  }
  // 每一个码的checkbox
  onChangeBox = (checkedValues) => {
    const { dispatch } = this.props;
    const { lists, rowsSize } = this.state;
    dispatch({
      type: 'activeCode/PutCheckListsId',
      payload: { qrcode_ids: checkedValues, lists },
    });
    const pagesize = rowsSize;
    const pages = lists.length / pagesize;

    if (pages > 1) {
      dispatch({
        type: 'activeCode/checkAllAction',
        payload: { checkall: checkedValues.length === pagesize, lists },
      });
    } else {
      dispatch({
        type: 'activeCode/checkAllAction',
        payload: { checkall: checkedValues.length === lists.length, lists },
      });
    }
  }
  // 根据目录id获取相应的码的lists；
  getCatalogId = (id) => {
    const { currentpage, rowsSize } = this.state;
    const { location } = this.props;
    const { search } = location;
    const pageSize = getUrlPara('page_size', search);
    const curPageSize = parseInt(pageSize, 10);
    const initPageSize = parseInt(rowsSize, 10);
    if (curPageSize && curPageSize !== undefined) {
      this.getLists(id, currentpage, curPageSize);
    } else {
      this.getLists(id, currentpage, initPageSize);
    }
  }

  // 重新拉取目录下面的码列表
  getLists = (catalogid, curpage, pagesize) => {
    const { dispatch, history } = this.props;
    const { treeData } = this.state;
    dispatch({
      type: 'activeCode/fetchActiveByCateId',
      payload: { category_id: catalogid, page: curpage, page_size: pagesize },
      callback: () => {
        if (this.props.ListsByCateIdMsg.code
          && this.props.ListsByCateIdMsg.code !== undefined
          && this.props.ListsByCateIdMsg.code === 1) {
          // message.success('根据目录id获取码的lists成功');
          const currentpages = this.props.ListsByCateIdMsg.data.page.current_page;
          const CodeListsNumber = this.props.ListsByCateIdMsg.data.page.record_total;
          const rowsSizes = parseInt(this.props.ListsByCateIdMsg.data.page.list_size, 10);
          this.setState(
            {
              lists: this.props.ListsByCateIdMsg.data.list,
              currentpage: currentpages,
              rowsSize: rowsSizes,
              codeCount: CodeListsNumber,
            });
        } else if (this.props.ListsByCateIdMsg.code
          && this.props.ListsByCateIdMsg.code !== undefined
          && this.props.ListsByCateIdMsg.code === 0) {
          this.setState({ defaultId: treeData[0].category_root_id });
          history.push(`/active/activecode?categoryId=${treeData[0].category_root_id}`);
          this.getLists(treeData[0].category_root_id, curpage, pagesize);
        }
      },
    });
  }
  // moveModel
  moveModel = () => {
    this.setState({ modal1Visible: true });
  }

  // cancelModel
  moveCancelModel = () => {
    this.setState({ modal1Visible: false });
  }

  // movecode 显示
  moveCodeSuccess = () => {
    const { dispatch, location } = this.props;
    const { MoveCatelog, checkedList, lists, currentpage, rowsSize } = this.state;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const catalogId = parseInt(cataId, 10); // 当前的目录id

    dispatch(
      {
        type: 'activeCode/MoveActive',
        payload: { qrcode_ids: checkedList, category_id: MoveCatelog, lists },
        callback: () => {
          if (this.props.MoveActiveMsg.code === 1) {
            message.success('移动成功');
            this.getLists(catalogId, currentpage, rowsSize); // 重新拉去lists
            this.changeCheckstatusBycatalog(); // 改变页面时全选的取消
          } else if (this.props.MoveActiveMsg && this.props.MoveActiveMsg.code === 0) {
            message.error(this.props.MoveActiveMsg.msg.text);
          } else {
            message.error('移动出错');
          }
        },
      });
    this.setState({ modal1Visible: false });
  }
  // 移动的目录id
  MoveCatelogId = (id) => {
    this.setState({ MoveCatelog: id });
  }
  // 显示行数的select事件
  rowsChange = (value) => {
    const { location } = this.props;
    const pageSize = parseInt(value, 10);
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const catalogId = parseInt(cataId, 10);
    this.getLists(catalogId, 1, pageSize);
    this.setState({ rowsSize: pageSize });
    this.changeCheckstatusBycatalog(); // 改变页面时全选的取消
  }
  // 分页页数change
  pageChange = (value) => {
    const { location } = this.props;
    const { search } = location;
    const { rowsSize } = this.state;
    const pageSize = parseInt(rowsSize, 10);
    const cataId = getUrlPara('categoryId', search);
    const catalogId = parseInt(cataId, 10);
    this.getLists(catalogId, value, pageSize);
    this.changeCheckstatusBycatalog(); // 改变页面时全选的取消
  }
  // 复制码
  copyItem = (id) => {
    const { dispatch, location } = this.props;
    const { currentpage, rowsSize } = this.state; // 当前页面的page与page-size
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const catalogId = parseInt(cataId, 10); // 当前的目录id
    dispatch({
      type: 'activeCode/CodeCopy',
      payload: { id },
      callback: () => {
        if (this.props.CodeCopyMsg.code === 1) {
          message.success('复制成功');
          this.getLists(catalogId, currentpage, rowsSize); // 重新拉去lists
          this.changeCheckstatusBycatalog();
        } else if (this.props.CodeCopyMsg && this.props.CodeCopyMsg.code === 0) {
          message.error(this.props.CodeCopyMsg.msg.text);
        } else {
          message.error('复制出错');
        }
      },
    });
  }
  // 修改码的名称以及编辑状态
  editNameItem = (id) => {
    this.setState({ editQrcodeId: id });
    this.setState({ editQrcodeStatus: true });
  }

  // 失去焦点时，EditBlur时候调借口
  EditBlur = () => {
    this.setState({ editQrcodeStatus: false });
    const { editQrcodeId, editQrcodeName, lists } = this.state;
    const { dispatch } = this.props;
    dispatch(
      {
        type: 'activeCode/CodeRename',
        payload: { id: editQrcodeId, name: editQrcodeName },
        callback: () => {
          if (this.props.CodeRenameMsg.code === 1) {
            message.success('活码名称修改成功');
            const newLists = renameQrcodeById(lists, editQrcodeId, editQrcodeName).concat();
            this.setState({ lists: newLists });
          } else if (this.props.CodeRenameMsg && this.props.CodeRenameMsg.code === 0) {
            message.error(this.props.CodeRenameMsg.msg.text);
          }
        },
      });
  }

  // 修改码的名称记录id与name
  editQrcodeChangeItem = (id, name) => {
    this.setState({
      editQrcodeName: name,
      editQrcodeId: id,
    });
  }

  editFocusChangeItem = (id, name) => {
    this.setState({
      editQrcodeName: name,
      editQrcodeId: id,
    });
  }

  // 鼠标移动时改变list里面码的id
  // EditMouseOverItem = (id) => {
  //   // this.setState({ editQrcodeId: id });
  // }

  removeEdit = () => {
    this.setState({ editQrcodeStatus: false });
  }

  // 修改码
  editItem = (data) => {
    const { location, history } = this.props;
    const { currentpage } = this.state;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    let catalogId;
    if (cataId && cataId !== undefined) {
      catalogId = parseInt(cataId, 10);
    } else {
      catalogId = data.category_id;
    }
    history.push(`/edit/${data.id}?categoryId=${catalogId}&p=${currentpage}`);
  }
  // 全选旁边的删除码
  deleteItems = () => {
    const { checkedList, currentpage, rowsSize, qrcodeCount } = this.state;
    const { dispatch, location } = this.props;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const catalogId = parseInt(cataId, 10); // 当前的目录id
    const that = this;
    Modal.confirm({
      title: '确定删除这个二维码?',
      content: '二维码删除后，扫码将无法显示！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        dispatch(
          {
            type: 'activeCode/BatchDeleteActive',
            payload: { checkedList },
            callback: () => {
              if (that.props.BatchDeleteMsg.code === 1) {
                message.success('删除成功');
                that.getLists(catalogId, currentpage, rowsSize);
                that.changeCheckstatusBycatalog();
                that.changeQrcodeCount(qrcodeCount - checkedList.length);
              } else if (that.props.BatchDeleteMsg && that.props.BatchDeleteMsg.code === 0) {
                message.error(that.props.BatchDeleteMsg.msg.text);
              } else {
                message.error('数据出错');
              }
            },
          });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  }
  // 删除码
  deleteSingleItem = (id) => {
    const { dispatch, location } = this.props;
    const { currentpage, rowsSize, qrcodeCount } = this.state;
    const that = this;

    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const catalogId = parseInt(cataId, 10); // 当前的目录id

    Modal.confirm({
      title: '确定删除这个二维码?',
      content: '二维码删除后，扫码将无法显示！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        dispatch(
          {
            type: 'activeCode/DeleteActive',
            payload: { id },
            callback: () => {
              if (that.props.DeleteMsg.code === 1) {
                message.success('删除成功');
                that.getLists(catalogId, currentpage, rowsSize);
                that.changeCheckstatusBycatalog();
                that.changeQrcodeCount(qrcodeCount - 1);
              } else if (that.props.DeleteMsg && that.props.DeleteMsg.code === 0) {
                message.error(that.props.DeleteMsg.msg.text);
                that.getLists(catalogId, currentpage, rowsSize);
                that.changeCheckstatusBycatalog();
              } else {
                message.error('数据出错');
              }
            },
          });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  }

  // 改变码的总数
  changeQrcodeCount = (count) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/changeQrcodeCount',
      payload: count,
    });
  }

  // 改变目录时取消全选状态
  changeCheckstatusBycatalog = () => {
    const { dispatch } = this.props;
    const { lists } = this.state;
    dispatch({
      type: 'activeCode/PutCheckListsId',
      payload: { qrcode_ids: [], lists },
    }); // 取消选中的码
    dispatch({
      type: 'activeCode/checkAllAction',
      payload: { checkall: false, lists },
    }); // 取消全选
  }
  // 改变目录时取消全选状态
  changeLists = () => {
    const { dispatch } = this.props;
    const { lists } = this.state;
    dispatch({
      type: 'activeCode/changeLists',
      payload: lists,
    }); // 取消全选
  }

  render() {
    const { todayscan, location, dispatch, treeLoading, match } = this.props;
    const {
      checkedList,
      checkAll,
      rowsSize,
      currentpage,
      modal1Visible,
      isMove,
      lists,
      treeData,
      codeCount,
      loading,
      editQrcodeId,
      editQrcodeStatus,
      changeQrcodeLoading,
      changeQrcodeListsLoading,
      editQrcodeName,
      defaultId,
    } = this.state;
    const { pathname, search } = location;
    // const { params } = match;
    const isCheckCode = checkedList.length === 0;
    const TreeRootId = []; // 根目录的节点
    let moduleId; // 新建根目录时要用到的moudule-id
    const cataId = getUrlPara('categoryId', search);

    const TreeData = (treeData && treeData.length > 0)
      ?
      treeData.map((item) => {
        item.id = item.category_root_id;
        item.parent_id = 0;
        item.level = 1;
        moduleId = item.module_id;
        TreeRootId.push(item.category_root_id);
        return item;
      })
      :
      (
        <div />
      );
    let catalogId;
    if (cataId && cataId !== undefined) {
      catalogId = parseInt(cataId, 10);
    } else if (!cataId) {
      if (treeData && treeData.length > 0) {
        catalogId = treeData[0].category_root_id;
      }
    }

    const CodeLists = (lists !== undefined && lists && lists.length > 0)
      ?
      (
        <div className={styles.root}>
          <div className={styles.header}>
            <div className={styles.left}>当前目录共{codeCount}个码</div>
            <div className={styles.right}>
              <Button
                data-analyze={[2, 1]}
                className={styles.btnColor}
                onClick={() => this.props.history.push(`/active/activecode/addcode?categoryId=${catalogId}&p=${currentpage}`)}
              >
                新建活码
              </Button>
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.top}>
              <div className={styles.top_action}>
                <Checkbox checked={checkAll} onChange={this.onChange}>全选</Checkbox>
                <Button
                  data-analyze={[2, 4]}
                  type="default"
                  className={styles.moveBtn}
                  disabled={isCheckCode}
                  onClick={this.moveModel}
                >移动
                </Button>
                <Modal
                  title="将二维码移动至..."
                  width="600px"
                  style={{ top: 20 }}
                  visible={modal1Visible}
                  wrapClassName={styles.moveCatalog}
                  onOk={this.moveCodeSuccess}
                  onCancel={this.moveCancelModel}
                >
                  {
                    TreeData.length > 0
                      ?
                        <CatalogueTree
                          style={{ height: '100vh' }}
                          tree_data={TreeData}
                          isMove={isMove}
                          MoveCatelog={this.MoveCatelogId}
                          match={match}
                          location={location}
                        />
                      :
                        <Spin />
                  }
                </Modal>
                <Button
                  className={styles.deleteBtn}
                  disabled={isCheckCode}
                  onClick={this.deleteItems}
                >
                  删除
                </Button>
                <div className={`${checkedList.length > 0 ? styles.checkCode : styles.none}`}>已经选中{checkedList.length}个二维码</div>
              </div>
              <div>
                <span className={styles.lineCheck}>显示行数</span>
                <Select
                  defaultValue={rowsSize}
                  style={{ width: 60 }}
                  onChange={this.rowsChange}
                >
                  <Select.Option value="10">10</Select.Option>
                  <Select.Option value="20">20</Select.Option>
                  <Select.Option value="30">30</Select.Option>
                </Select>
              </div>
            </div>
            <ul>
              <CheckboxGroup value={checkedList} onChange={this.onChangeBox}>
                <CodeItem
                  lists={lists}
                  dispatch={dispatch}
                  todayscan={todayscan}
                  deleteItem={this.deleteSingleItem}
                  copyItem={this.copyItem}
                  editItem={this.editItem}
                  editNameItem={this.editNameItem}
                  editFocusChangeItem={this.editFocusChangeItem}
                  editQrcodeChangeItem={this.editQrcodeChangeItem}
                  EditBlur={this.EditBlur}
                  changeQrcodeLoading={changeQrcodeLoading}
                  editQrcodeStatus={editQrcodeStatus}
                  loading={loading}
                  catalogId={catalogId}
                  location={location}
                  curPage={currentpage}
                  pageSize={rowsSize}
                  editQrcodeId={editQrcodeId}
                  editQrcodeName={editQrcodeName}
                />
              </CheckboxGroup>
            </ul>
            <Pagination
              total={codeCount}
              current={currentpage}
              pageSize={rowsSize}
              onChange={this.pageChange}
              className={styles.fr}
            />
          </div>
        </div>
      )
      :
      (
        <div className={`${styles.root} ${styles.nodata}`}>
          <div className={styles.noDataImg} />
          <p className={styles.title}>该目录下还未创建过活码</p>
          <p className={styles.info}>
            活码支持页面跳转、文本、图片、文件等多种类型<br />
            可以在二维码不变的情况下，随时更改内容
          </p>
          <Button
            className={styles.NewAddButton}
            onClick={() => this.props.history.push(`/active/activecode/addcode?categoryId=${catalogId}&p=${currentpage}`)}
          >
            <i className="anticon anticon-cli-add-1" />
            立即新建
          </Button>
        </div>
      );
    const newsCodes = (changeQrcodeListsLoading === 'noloading' || changeQrcodeListsLoading === true || changeQrcodeListsLoading === undefined) ?
      (<div className={styles.example}><Spin /></div>)
      :
      CodeLists;

    const codeCategoryLayouts = (pathname === '/') ? '' : (
      TreeData.length > 0
        ?
        (
          <CatalogueTree
            style={{ height: '100vh' }}
            tree_data={TreeData}
            isMove={false}
            dispatch={dispatch}
            loading={treeLoading}
            match={match}
            getCatalogId={this.getCatalogId}
            changeCheckstatusBycatalog={this.changeCheckstatusBycatalog}
            changeLists={this.changeLists}
            TreeRootId={TreeRootId}
            moduleId={moduleId}
            location={location}
            defaultId={defaultId}
          />
        )
        :
        (
          <div className={styles.example2}>
            <Spin />
          </div>
        )
    );

    return (
      <div>
        <Layout style={{ width: '200px', height: '100vh', background: '#f8f8f8', position: 'fixed', zIndex: 1002, borderRight: '1px solid #e0e1e3' }}>
          { codeCategoryLayouts }
        </Layout>
        {newsCodes}
        <div className={`${editQrcodeStatus ? '' : styles.none} ${styles.mask}`} onClick={this.removeEdit} />
      </div>
    );
  }
}
export default connect(state => ({
  BatchDeleteMsg: state.activeCode.BatchDeleteMsg,
  RootCatalogIdMsg: state.user.RootCatalogIdMsg,
  cache_tree_data: state.catelog.cache_tree_data,
  DeleteMsg: state.activeCode.DeleteMsg,
  ListsByCateIdMsg: state.activeCode.ListsByCateIdMsg,
  lists: state.activeCode.lists,
  MoveActiveMsg: state.activeCode.MoveActiveMsg,
  checkedList: state.activeCode.checkedList,
  currentpage: state.activeCode.currentpage,
  checkAll: state.activeCode.checkAll,
  todayscan: state.activeCode.todayscan,
  treeData: state.user.tree_data,
  loading: state.activeCode.loading,
  treeLoading: state.user.loading,
  CodeCopyMsg: state.activeCode.CodeCopyMsg, // 复制码
  qrcode_count: state.user.qrcode_count, // 树的数据
  CodeRenameMsg: state.activeCode.CodeRenameMsg, // 码的重命名
  changeQrcodeLoading: state.activeCode.qrcodeLoading, // 码的重命名之后的loading
  changeQrcodeListsLoading: state.activeCode.QrcodeListsLoading, // 码列表获取之后的loading
  defaultCatalogId: state.catelog.defaultCatalogId,
}))(ActiveCode);
