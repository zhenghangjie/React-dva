import React from 'react';
import { Modal, Spin } from 'antd';
import styles from './index.less';
import { getOriginData } from '../../common/origin';

export default class QrcodeModel extends React.Component {
  state = {
    visible: this.props.visible,
    iframeSrc: `//${getOriginData().cliDomain}/beautify?qrcode=${this.props.data}`,
    loading: true,
  };
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
  changeLoading = () => {
    this.setState({
      loading: false,
    });
  }
  render() {
    const { visible, iframeSrc, loading } = this.state;
    return (
      <div className={styles.normal}>
        <Modal
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          maskClosable={false}
          style={{ minWidth: '998px', height: '498px', padding: 0 }}
        >
          <Spin spinning={loading} size="large" delay={500}>
            <iframe title="beautify" className={styles.beautifyFrame} src={iframeSrc} onLoad={this.changeLoading.bind(this)} frameBorder="0" />
          </Spin>
        </Modal>
      </div>
    );
  }
}
