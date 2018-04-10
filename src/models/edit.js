import { queryEditList, queryDefaultList, postQrcodeMsg, showCollectControll, showCollect } from '../services/api';

export default {
  namespace: 'edit',

  state: {
    list: [],
    loading: false,
  },

  effects: {
    *getList({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const { id } = payload;
      const response = yield call(queryEditList, id);
      yield put({
        type: 'getlist',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    *getDefaultList({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryDefaultList, payload);
      yield put({
        type: 'getDefaultlist',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    *saveQrcodeMsg({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(postQrcodeMsg, payload);
      yield put({
        type: 'getQrcodeMsg',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    *fetchTextContent({ payload }, { put }) {
      yield put({
        type: 'save',
        payload,
      });
    },
    *showCollectControll({ payload, callback }, { call }) {
      const response = yield call(showCollectControll, payload);
      if (callback) callback(response);
    },
    *showCollect({ payload, callback }, { call }) {
      const response = yield call(showCollect, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    getlist(state, action) {
      return {
        ...state,
        initList: action.payload,
      };
    },
    getDefaultlist(state, action) {
      return {
        ...state,
        Defaultlist: action.payload,
      };
    },
    getQrcodeMsg(state, action) {
      return {
        ...state,
        SaveRetMsg: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
  subscriptions: {
  },
};
