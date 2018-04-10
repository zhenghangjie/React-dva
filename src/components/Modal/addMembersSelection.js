import React from 'react';
import { Modal } from 'antd';
import styles from './addMembersSelection.less';
import { getOriginData } from '../../common/origin';

class addSingleVcard extends React.Component {
  state = {
    visible: this.props.visible,
    origin: getOriginData(),
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
    });
  }
  handleCancel = () => {
    this.setState({ visible: false });
    this.props.addMembersSelection(false);
  }
  singleAddMembers = () => {
    this.props.singleAddMembers(true);
  }
  fastInvite = () => {
    this.props.fastInvite(true);
  }
  render() {
    const { visible, origin } = this.state;
    return (
      <div>
        <Modal
          width={576}
          visible={visible}
          title="添加名片"
          onCancel={this.handleCancel}
          footer={null}
          maskClosable={false}
          className={styles.modalContent}
        >
          <div className={styles.flexContent}>
            <div
              className={styles.flexChild}
              onClick={this.fastInvite.bind(this)}
            >
              <img className={styles.logoImg} src={`${origin.staticDomain}/images/nc/idcode_logo_1@2x.png`} alt="" />
              <div className={styles.textTitle}>快速邀请</div>
            </div>
            <div className={styles.flexChild}>
              <img className={styles.logoImg} src={`${origin.staticDomain}/images/nc/idcode_logo_2@2x.png`} alt="" />
              <div className={styles.textTitle}>批量导入</div>
            </div>
            <div
              className={styles.flexChild}
              onClick={this.singleAddMembers.bind(this)}
            >
              <img className={styles.logoImg} src={`${origin.staticDomain}/images/nc/idcode_logo_3@2x.png`} alt="" />
              <div className={styles.textTitle}>单个添加</div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default addSingleVcard;
