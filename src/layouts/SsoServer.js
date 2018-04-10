import React from 'react';
// import { connect } from 'dva';
// import Cookies from 'universal-cookie';
import { getUrlPara } from '../utils/utils';

export default class SsoServer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonpCallback: getUrlPara('jsonpCallback'),
    };
  }
  componentWillMount() {
    new Promise((resolve) => {
      this.props.dispatch({
        type: 'user/fetchSsoServer',
        payload: {
          ssid: getUrlPara('ssid'),
          type: getUrlPara('type'),
          keepstate: getUrlPara('keepstate'),
          jsonpCallback: getUrlPara('jsonpCallback'),
        },
        callback: () => {
          // async function test() {
          //   console.log(11111);
          //   await new Promise(resolve2 => setTimeout(resolve2, 3000));
          //   console.log(22222);
          //   resolve();
          // }
          // test();
          resolve();
        },
      });
    }).then(() => {
    });
  }
  render() {
    const { jsonpCallback } = this.state;
    return (
      <div>{`${jsonpCallback}()`}</div>
    );
  }
}

// export default connect(state => ({
//   ssoInfo: state.user.ssoInfo,
// }))(SsoServer);
