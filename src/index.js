import dva from 'dva';
import { notification } from 'antd';
import 'moment/locale/zh-cn';
import createBrowserHistory from 'history/createBrowserHistory';
import models from './models';
import './polyfill';
import './index.less';
import { isIe } from './utils/utils';

// 1. Initialize
const app = dva({
  history: createBrowserHistory(),
});

// 2. Plugins
// app.use({});

// 3. Model move to router
models.forEach((m) => {
  app.model(m);
});

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');

if (isIe()) {
  notification.error({
    message: '你的浏览器版本过旧！',
    description: '可能会造成多数功能不可使用，请升级你的浏览器',
    duration: 60,
  });
}

// 获取用户账号信息
// const { ncApiDomain } = getOriginData();
// request(`${ncApiDomain}/user/getUserSSInfo`, {
//   method: 'GET',
// }).then((result) => {
//   console.log(result);
// });

// dispatch({
//   type: 'user/fetchCurrent',
//   callback: () => {
//     console.log(111);
//   },
// });
