import {
  getCatalogTree,
  addCatalogNode,
  updateCatalogNode,
  deleteCatalogNode,
  getIdcodeList,
  getCodeListApi,
  deleteIdcodeRecord,
  operateIdcodeRecord,
  resignIdCode,
  bacthDownloadApi,
  buildIdcodePhoto,
} from '../services/api';

export default {
  namespace: 'members',

  state: {
    loading: false,
  },

  effects: {
    // 获取目录树
    *getTreelist({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getCatalogTree, payload);
      yield put({
        type: 'getTreelistData',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback(response);
    },
    // 新建目录
    *addTreeNode({ payload, callback }, { call }) {
      const response = yield call(addCatalogNode, payload);
      if (callback) callback(response);
    },
    // 修改目录
    *updateTreeNode({ payload, callback }, { call }) {
      const response = yield call(updateCatalogNode, payload);
      if (callback) callback(response);
    },
    // 删除目录
    *deleteTreeNode({ payload, callback }, { call }) {
      const response = yield call(deleteCatalogNode, payload);
      if (callback) callback(response);
    },
    // 获取列表
    *getList({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeListsLoading',
        payload: true,
      });
      const response = yield call(getIdcodeList, payload);
      yield put({
        type: 'getListData',
        payload: response,
      });
      yield put({
        type: 'changeListsLoading',
        payload: false,
      });
      if (callback) callback(response);
    },
    // 删除成员
    *deleteRecord({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeListsLoading',
        payload: true,
      });
      const response = yield call(deleteIdcodeRecord, payload);
      yield put({
        type: 'changeListsLoading',
        payload: false,
      });
      if (callback) callback(response);
    },
    //  新增||修改单个成员
    *operateIdcode({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeListsLoading',
        payload: true,
      });
      const response = yield call(operateIdcodeRecord, payload);
      yield put({
        type: 'IdcodeRecord',
        payload: response,
      });
      yield put({
        type: 'changeListsLoading',
        payload: false,
      });
      if (callback) callback(response);
    },
    // 标为离职
    *resignIdcode({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeListsLoading',
        payload: true,
      });
      const response = yield call(resignIdCode, payload);
      yield put({
        type: 'IdcodeRecord',
        payload: response,
      });
      yield put({
        type: 'changeListsLoading',
        payload: false,
      });
      if (callback) callback(response);
    },
    // 获取新建码数据
    *getCodeList({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeListsLoading',
        payload: true,
      });
      const response = yield call(getCodeListApi, payload);
      yield put({
        type: 'getCodeListData',
        payload: response,
      });
      yield put({
        type: 'changeListsLoading',
        payload: false,
      });
      if (callback) callback(response);
    },
    // 批量下载
    *batchDownload({ payload, callback }, { call }) {
      const response = yield call(bacthDownloadApi, payload);
      if (callback) callback(response);
    },
    // 新建名片图片
    *buildIdcodePhoto({ payload, callback }, { call }) {
      const response = yield call(buildIdcodePhoto, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    getTreelistData(state, action) {
      return {
        ...state,
        TreelistData: action.payload,
      };
    },
    getListData(state, action) {
      return {
        ...state,
        IdcodelistData: action.payload,
      };
    },
    getCodeListData(state, action) {
      return {
        ...state,
        CodelistData: action.payload,
      };
    },
    changeListsLoading(state, action) { // 列表的loading
      return {
        ...state,
        ListsLoading: action.payload,
      };
    },
  },
  subscriptions: {
  },
};
