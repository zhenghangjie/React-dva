// import { message } from 'antd';
// import indexOf from 'lodash/indexOf';
import uniq from 'lodash/uniq';
import {
  PostActivesByCatalog,
  DeleteActiveById,
  BatchDeleteActiveById,
  getQrcodeMsg, AddScene,
  getSceneCaseMsg,
  MoveQrcodeMsg,
  CopyQrcodeMsg,
  renameQrcodeMsg,
} from '../services/consoleActive';
import { batchDeleteById } from '../utils/utils.js';


export default {
  namespace: 'activeCode',
  state: {
    count: 6,
    checkedList: [],
    checkAll: false,
    isOpenSceneMsg: false,
    currentpage: 1,
    todayscan: [
      { CVR4qe: 0 },
      { Fsc3Mh: 3 },
    ],
  },

  effects: {
    * fetchActiveByCateId({ payload, callback }, { call, put }) { // 拿到对应目录id下面的码的列表
      yield put({
        type: 'changeQrcodeListsLoading',
        payload: true,
      });
      const { category_id, page, page_size } = payload;
      const response = yield call(PostActivesByCatalog, { category_id, page, page_size });
      yield put({
        type: 'fetchcatalogSuccess',
        payload: response,
      });
      yield put({
        type: 'changeQrcodeListsLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * BatchDeleteActive({ payload, callback }, { call, put }) { // 批量删除码
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const { checkedList } = payload;
      const checkedListString = checkedList.toString();
      // 删除数组中此节点为传过来id数组的值。
      const response = yield call(BatchDeleteActiveById, { id: checkedListString });
      yield put({
        type: 'BatchDeleteSuccess',
        payload: response,
      });

      yield put({
        type: 'changeLoading',
        payload: false,
      });

      if (callback) callback();
    },
    * fetchQrcodeMsg({ payload, callback }, { call, put }) { // 码的详情页面
      yield put({
        type: 'changeQrcodeMsgLoading',
        payload: true,
      });
      const { id } = payload;
      const response = yield call(getQrcodeMsg, id);

      yield put({
        type: 'fetchQrcodeMsgSuccess',
        payload: response,
      });
      yield put({
        type: 'changeQrcodeMsgLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * DeleteActive({ payload, callback }, { call, put }) { // 删除码
      yield put({
        type: 'changeLoading',
        payload: true,
      });

      const { id } = payload;
      const response = yield call(DeleteActiveById, { id });
      yield put({
        type: 'DeleteSuccess',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    // * CopyActive({ payload }, { put }) { // 复制码，
    //   yield put({
    //     type: 'changeLoading',
    //     payload: true,
    //   });
    //   // id = 1;
    // },
    * addScene({ callback }, { put, call }) { // 获取新增页面的所有场景
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(AddScene);
      yield put({
        type: 'addSceneSuccess',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * GetSceneMsg({ payload, callback }, { put, call }) { // 获取具体场景的信息
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const { scene_module_id } = payload;
      const response = yield call(getSceneCaseMsg, scene_module_id);
      yield put({
        type: 'GetSceneMsgSuccess',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * MoveActive({ payload, callback }, { put, call }) { // 移动码
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const { qrcode_ids, category_id, lists } = payload;
      const qrcodeIdsString = qrcode_ids.toString();
      const newLists = batchDeleteById(lists, qrcode_ids).concat();
      const response = yield call(MoveQrcodeMsg, { qrcode_ids: qrcodeIdsString, category_id });
      yield put({
        type: 'MoveActiveSuccess',
        payload: { response, newLists },
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * PutCheckListsId({ payload, callback }, { put }) { // 改变选码的框
      // yield put({
      //   type: 'changeLoading',
      //   payload: true,
      // });
      yield put({
        type: 'PutCheckListsIdSuccess',
        payload,
      });
      // yield put({
      //   type: 'changeLoading',
      //   payload: false,
      // });
      if (callback) callback();
    },
    * checkAllAction({ payload }, { put }) { // 改变全选的按钮
      // yield put({
      //   type: 'changeLoading',
      //   payload: true,
      // });
      yield put({
        type: 'checkAllActionSuccess',
        payload,
      });
      // yield put({
      //   type: 'changeLoading',
      //   payload: false,
      // });
    },
    * changeLists({ payload }, { put }) { // 改变list的state
      // yield put({
      //   type: 'changeLoading',
      //   payload: true,
      // });
      // console.log('=======------payload-----=============,', payload);
      yield put({
        type: 'changeListsSuccess',
        payload,
      });
      // yield put({
      //   type: 'changeLoading',
      //   payload: false,
      // });
    },
    * CodeCopy({ payload, callback }, { put, call }) { // 码的复制
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const { id } = payload;
      const response = yield call(CopyQrcodeMsg, id);
      yield put({
        type: 'CodeCopySuccess',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * CodeRename({ payload, callback }, { put, call }) { // 码的重命名
      yield put({
        type: 'changeQrcodeLoading',
        payload: true,
      });
      const { id, name } = payload;
      const response = yield call(renameQrcodeMsg, { id, name });
      yield put({
        type: 'CodeRenameSuccess',
        payload: response,
      });
      yield put({
        type: 'changeQrcodeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * isOpenScene({ payload, callback }, { put }) { // 下次不再提示
      const { isOpenScene, id } = payload;

      const arr = JSON.parse(localStorage.getItem('openArr'));
      let openArr;
      if (arr && arr !== undefined && arr.length > 0) {
        openArr = arr;
      } else {
        openArr = [];
      }
      if (isOpenScene === true) {
        openArr.push(id);
        openArr = uniq(openArr, true);
      } else {
        const index = openArr.indexOf(id);
        if (index > -1) {
          openArr.splice(index, 1);
        }
      }

      localStorage.setItem('openArr', JSON.stringify(openArr));
      localStorage.setItem('isOpenScene', isOpenScene);
      yield put({
        type: 'isOpenSceneSuccess',
        payload: isOpenScene,
      });
      if (callback) callback();
    },
  },
  reducers: {
    fetchcatalogSuccess(state, action) { // 拿到对应目录id下面的码的列表
      const { payload } = action;
      return {
        ...state,
        ListsByCateIdMsg: payload,
      };
    },
    changeLoading(state, action) { // 改变loading状态
      return {
        ...state,
        loading: action.payload,
      };
    },
    changeQrcodeListsLoading(state, action) { // 改变获取列表的list
      return {
        ...state,
        QrcodeListsLoading: action.payload,
      };
    },
    changeQrcodeMsgLoading(state, action) { // 改变获取列表的list
      return {
        ...state,
        QrcodeMsgLoading: action.payload,
      };
    },
    changeQrcodeLoading(state, action) { // 改变loading状态
      return {
        ...state,
        qrcodeLoading: action.payload,
      };
    },
    DeleteSuccess(state, action) { // 删除
      return {
        ...state,
        DeleteMsg: action.payload,
      };
    },
    BatchDeleteSuccess(state, action) { // 批量删除
      const { payload } = action;
      return {
        ...state,
        BatchDeleteMsg: payload,
      };
    },
    fetchQrcodeMsgSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        QrcodeMsg: payload,
      };
    },
    addSceneSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        SceneMsg: payload,
      };
    },
    GetSceneMsgSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        SceneMsgItem: payload,
      };
    },
    MoveActiveSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        MoveActiveMsg: payload.response,
        lists: payload.newLists,
      };
    },
    PutCheckListsIdSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        checkedList: payload.qrcode_ids,
        lists: payload.lists,
      };
    },
    checkAllActionSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        checkAll: payload.checkall,
        lists: payload.lists,
      };
    },
    changeListsSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        checkAll: payload.checkall,
        lists: payload,
      };
    },
    CodeCopySuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        CodeCopyMsg: payload,
      };
    },
    CodeRenameSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        CodeRenameMsg: payload,
      };
    },
    isOpenSceneSuccess(state, action) {
      const { payload } = action;
      return {
        ...state,
        isOpenSceneMsg: payload,
      };
    },
  },
  subscriptions: {

  },
};
