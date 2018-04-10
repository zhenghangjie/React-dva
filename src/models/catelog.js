import { getUploadToken } from '../services/api';

export default {
  namespace: 'catelog',
  state: {
    defaultCatalogId: '',
  },
  effects: {
    *getUploadToken({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getUploadToken, payload);
      yield put({
        type: 'uploadToken',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * changeExpandedKeys({ payload }, { put }) { // 默认展开的id
      const { pid } = payload;
      yield put({
        type: 'changeExpandedKeysSuccess',
        payload: pid,
      });
    },
    * CacheTreeDataAction({ payload, callback }, { put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const { tree_data } = payload;

      const aaa = tree_data.concat();

      yield put({
        type: 'CacheTreeDataSuccess',
        payload: aaa,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * defaultCatalogId({ payload }, { put }) {
      yield put({
        type: 'defaultCatalogIdSuccess',
        payload,
      });
    },
  },
  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    changeExpandedKeysSuccess(state, action) { // 默认选中展开的
      return {
        ...state,
        expandedKeys: action.payload,
      };
    },
    CacheTreeDataSuccess(state, action) { // load treedata 缓存
      const { payload } = action;
      return {
        ...state,
        cache_tree_data: payload,
      };
    },
    defaultCatalogIdSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        defaultCatalogId: payload,
      };
    },
  },
  subscriptions: {

  },
};
