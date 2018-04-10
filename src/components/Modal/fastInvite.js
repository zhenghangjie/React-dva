import React from 'react';
import { Modal, Button } from 'antd';
import styles from './fastInvite.less';

class addSingleVcard extends React.Component {
  state = {
    visible: this.props.visible,
    title: this.props.title,
    contentOne: this.props.contentOne,
    contentTwo: this.props.contentTwo,
    btnContent: this.props.btnContent,
    qrcodePath: this.props.qrcodePath,
    handleFooter: this.props.handleFooter,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
    });
  }
  fastInvite = () => {
    this.setState({ visible: false });
    this.props.fastInvite(false);
  }
  handleFooterBtn = (e) => {
    const { handleFooter } = this.state;
    if (handleFooter.toString() === 'true') {
      this.fastInvite();
    } else {
      this.props.handleFooterBtn(e);
    }
  }
  render() {
    const { visible, title, contentOne, contentTwo, btnContent, qrcodePath } = this.state;
    return (
      <div>
        <Modal
          width={576}
          visible={visible}
          onCancel={this.fastInvite}
          footer={null}
          maskClosable={false}
          className={styles.modalContent}
        >
          <div className={styles.flexContent}>
            <div className={styles.imgLeft}>
              <img src={qrcodePath} alt="" />
            </div>
            <div className={styles.textRight}>
              <div className={styles.title}>{title}</div>
              <div className={styles.desc}>{contentOne}</div>
              <div className={styles.desc}>{contentTwo}</div>
              <Button type="primary" onClick={this.handleFooterBtn.bind(this)} className={styles.confirmBtn} data-type="png" data-size="400">{btnContent}</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default addSingleVcard;
