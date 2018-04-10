import React from 'react';
import { connect } from 'dva';
import { Modal, Spin } from 'antd';
import styles from './index.less';
import { getOriginData } from '../../common/origin';

class LoginModel extends React.Component {
  state = {
    visible: this.props.visible,
    iframeSrc: `${getOriginData().userDomain}/login?iframe=true&refer_from=console`,
    loading: false,
    type: 'login',
  };
  componentDidMount() {
    window.callbackmsg = () => {
      this.setState({
        visible: false,
      });
      this.props.fn(false);
      this.props.loginSuccess();
      // 登录后初始化用户数据
      this.props.dispatch({
        type: 'user/fetchCurrent',
        payload: {
          isLogin: 1,
        },
      });
    };
    window.changeModalType = (type) => {
      this.setState({
        type,
      });
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
    });
  }
  handleOk = () => {
    this.props.fn(false);
  }
  handleCancel = () => {
    this.props.fn(false);
  }
  render() {
    const { visible, iframeSrc, loading, type } = this.state;
    return (
      <div className={styles.normal}>
        <Modal
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          maskClosable={false}
          // closable={false}
          className={type === 'login' ? styles.loginModal : styles.joinModal}
        >
          <Spin spinning={loading} size="large" delay={500}>
            <iframe scrolling="no" frameBorder="0" id="iframe" title="login" className={styles.loginFrame} src={iframeSrc} />
          </Spin>
        </Modal>
      </div>
    );
  }
}

export default connect(state => ({
  currentUser: state.user.currentUser,
}))(LoginModel);
