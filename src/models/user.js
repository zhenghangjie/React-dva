import Cookies from 'universal-cookie';
import { query as queryUsers, queryCurrent, queryssoInfo, queryCapacity, postclicklog, updateCompanyMsg } from '../services/user';
import {
  AddCatalog,
  DeleteCatalogs,
  fetchTreeByRoot,
  EditCatalogTitleById,
  DropCatalog,
  fetchCatrgoryTreeRoot,
  AddRootCatalogs,
  DeleteRootCatalogs,
  EditRootCatalogs,
  DropCatalogSibling, // 子目录上移动下移动操作
  DropCatalogRootSibling, // 根目录上移动下移动
  moveRootNode, // 移动根目录进入另一个根目录，或者子目录
} from '../services/consoleActive';
import { dataAnalysis } from '../utils/utils';

export default {
  namespace: 'user',

  state: {
    list: [],
    loading: false,
    sessionId: false,
    qrcode_count: 0,
    currentUser: {
      id: 3,
      name: '毛磊',
      avatar: 'http://tx.haiqq.com/uploads/allimg/150327/2100245K1-8.jpg',
    },
  },

  effects: {
    * fetchCatrgoryTreeData({ payload, callback }, { call, put }) { // 获取目录根节点lists
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // const { module_id } = payload;
      const response = yield call(fetchCatrgoryTreeRoot, payload);
      yield put({
        type: 'fetchCatrgoryTreeSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback(response);
    },
    * fetchTreeDataByRoot({ payload, callback }, { call, put }) { // 获取目录根节点下面的具体children
      // yield put({
      //   type: 'AddRootCatalogLoading',
      //   payload: true,
      // });
      // const { org_module_id } = payload;
      const response = yield call(fetchTreeByRoot, payload);
      yield put({
        type: 'fetchTreeDataByRootSuccess',
        payload: response,
      });
      // yield put({
      //   type: 'AddRootCatalogLoading',
      //   payload: false,
      // });
      if (callback) callback();
    },
    * fetchUserInfo(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    * fetchCurrent({ payload, callback }, { call, put, select }) {
      const saveCurrentUser = yield select(state => state.user.currentUser);
      const sessionId = yield select(state => state.user.sessionId);
      const cookies = new Cookies();
      const sessionIdCurrent = cookies.get('PHPSESSID');
      const isLogin = payload ? payload.isLogin : false;
      if (saveCurrentUser.code !== 1 || sessionIdCurrent !== sessionId || isLogin === 1) {
        yield put({
          type: 'changeLoading',
          payload: true,
        });
        const response = yield call(queryCurrent, payload);
        yield put({
          type: 'saveCurrentUser',
          payload: response,
        });
        yield put({
          type: 'saveSessionId',
          payload: sessionIdCurrent,
        });
        yield put({
          type: 'changeLoading',
          payload: false,
        });
      }
      if (callback) callback();
    },
    * updateCurrent({ payload, callback }, { put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      yield put({
        type: 'saveCurrentUser',
        payload: payload.userInfo,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * updateCompanyInfo({ payload, callback }, { call }) {
      const response = yield call(updateCompanyMsg, payload);
      if (callback) callback(response);
    },
    * fetchCapacity({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryCapacity, payload);
      yield put({
        type: 'saveCapacityInfo',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * fetchSsoServer({ payload, callback }, { call, put }) {
      const response = yield call(queryssoInfo, payload);
      yield put({
        type: 'ssoInfo',
        payload: response,
      });
      if (callback) callback();
    },
    *updateTreeData({ payload }, { put }) {
      yield put({
        type: 'updateTreeDatas',
        payload: payload.data,
      });
    },
    * AddCatalog({ payload, callback }, { call, put }) {
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // const { parent_id } = payload;
      const response = yield call(AddCatalog, payload);
      yield put({
        type: 'AddtreeSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * EditCatalog({ payload, callback }, { put, call }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      // const { new_title, id } = payload;
      const response = yield call(EditCatalogTitleById, payload);
      yield put({
        type: 'editCatrgoryTreeSuccess',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * DeleteCatalog({ payload, callback }, { call, put }) {
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      const { id } = payload;
      const response = yield call(DeleteCatalogs, id);
      yield put({
        type: 'DeleteSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    // 根目录节点的操作
    * AddRootCatalog({ payload, callback }, { put, call }) { // 新增根目录
      yield put({
        type: 'CurAddRootCatalogLoading',
        payload: true,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // const { module_id } = payload;
      const response = yield call(AddRootCatalogs, payload);
      yield put({
        type: 'AddRootCatalogSuccess',
        payload: response,
      });
      yield put({
        type: 'CurAddRootCatalogLoading',
        payload: false,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * DeleteRootCatalog({ payload, callback }, { put, call }) { // 删除根目录
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // const { node_id } = payload;
      const response = yield call(DeleteRootCatalogs, payload);
      yield put({
        type: 'DeleteRootCatalogSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * EditRootCatalog({ payload, callback }, { put, call }) { // 删除根目录
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      // const { node_id, node_name } = payload;
      const response = yield call(EditRootCatalogs, payload);
      yield put({
        type: 'EditRootCatalogSuccess',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * DropCatalog({ payload, callback }, { put, call }) { // 移入移出子目录的节点
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // const { parent_id, node_id } = payload;
      const response = yield call(DropCatalog, payload);
      yield put({
        type: 'DropCatalogSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * changeTreeData({ payload }, { put }) { // 移动码
      yield put({
        type: 'changeLoading',
        payload: true,
      });

      yield put({
        type: 'changeTreeDataSuccess',
        payload,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    * DropCatalogSibling({ payload, callback }, { put, call }) { // 上移下移子目录的节点
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // console.log(payload);
      // const { target_node_id, current_node_id } = payload;

      const response = yield call(DropCatalogSibling, payload);

      // console.log(response);
      yield put({
        type: 'DropCatalogSiblingSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * DropCatalogRootSibling({ payload, callback }, { put, call }) { // 上移下移根目录的节点
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // const { target_org_module_id, current_org_module_id } = payload;
      const response = yield call(DropCatalogRootSibling, payload);
      yield put({
        type: 'DropCatalogRootSiblingSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * moveRootNode({ payload, callback }, { put, call }) { // 移动根目录进入另一个根目录，或者子目录
      yield put({
        type: 'AddRootCatalogLoading',
        payload: true,
      });
      // const { target_node_id, org_module_id } = payload;
      const response = yield call(moveRootNode, payload);
      yield put({
        type: 'moveRootNodeSuccess',
        payload: response,
      });
      yield put({
        type: 'AddRootCatalogLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * changeQrcodeCount({ payload }, { put }) { // 改变改用户下面的所有码的数量
      yield put({
        type: 'changeQrcodeCountSuccess',
        payload,
      });
    },
    * clicklog({ payload }, { call }) {
      yield call(postclicklog, payload);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    ssoInfo(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    AddRootCatalogLoading(state, action) {
      return {
        ...state,
        RootCatalogLoading: action.payload,
      };
    },
    CurAddRootCatalogLoading(state, action) {
      return {
        ...state,
        CurRootCatalogLoading: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    saveCapacityInfo(state, action) {
      return {
        ...state,
        capacityInfo: action.payload,
      };
    },
    saveSessionId(state, action) {
      return {
        ...state,
        sessionId: action.payload,
      };
    },
    updateTreeDatas(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    AddtreeSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        AddtreeMsg: payload,
      };
    },
    DeleteSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        DeletetreeMsg: payload,
      };
    },
    fetchCatrgoryTreeSuccess(state, action) { // 目录树获取
      const { payload } = action;
      return {
        ...state,
        RootCatalogIdMsg: payload,
        tree_data: payload.data.menu_list,
        qrcode_count: payload.data && payload.data.count_msg && payload.data.count_msg.qrcode_count,
      };
    },
    fetchTreeDataByRootSuccess(state, action) { // 目录树节点下面数据的获取
      const { payload } = action;
      return {
        ...state,
        TreeDatasByRoot: payload,
      };
    },
    editCatrgoryTreeSuccess(state, action) { // 编辑
      const { payload } = action;
      return {
        ...state,
        EdittreeMsg: payload,
      };
    },
    AddRootCatalogSuccess(state, action) { // 新建根节点
      const { payload } = action;
      return {
        ...state,
        AddRootCatalogMsg: payload,
      };
    },
    DeleteRootCatalogSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        DeleteRootCatalogMsg: payload,
      };
    },
    EditRootCatalogSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        EditRootCatalogMsg: payload,
      };
    },
    DropCatalogSuccess(state, action) { // 根目录下的活吗的移动
      const { payload } = action;
      return {
        ...state,
        DropCatalogMsg: payload,
      };
    },
    DropCatalogSiblingSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        DropCatalogSiblingMsg: payload,
      };
    },
    changeTreeDataSuccess(state, action) { // 根目录下面的treedata添加，触发父级的treedata
      const { payload } = action;
      return {
        ...state,
        tree_data: payload,
      };
    },
    DropCatalogRootSiblingSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        DropCatalogRootSiblingMsg: payload,
      };
    },
    moveRootNodeSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        moveRootNodeMsg: payload,
      };
    },
    changeQrcodeCountSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        qrcode_count: payload,
      };
    },
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(({ pathname }) => {
        if (pathname) {
          // 声明式埋点动态绑定
          document.addEventListener('click', dataAnalysis, false);
        }
      });
    },
  },
};
