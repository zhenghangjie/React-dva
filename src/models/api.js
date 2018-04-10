import { getUploadToken, uploadBase64 } from '../services/api';

export default {
  namespace: 'api',
  state: {

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
    *base64ImgUpload({ payload, callback }, { call }) {
      const response = yield call(uploadBase64, payload);
      if (callback) callback(response);
    },
  },
  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    uploadToken(state, action) {
      return {
        ...state,
        uploadToken: action.payload,
      };
    },
  },
  subscriptions: {

  },
};
