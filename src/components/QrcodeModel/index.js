import React from 'react';
import { Row, Col, Modal, Layout, Button } from 'antd';
import Download from './down.js';
import BeautifyFrame from '../BeautifyFrame';
import styles from './index.less';

const { Footer, Content } = Layout;

export default class QrcodeModel extends React.Component {
  state = {
    visible: this.props.visible,
    downVisible: this.props.downVisible || false,
    beautyVisible: false,
    qrcodeImg: this.props.qrcodeImg,
    qrcodeUrl: this.props.qrcodeUrl,
    catalogueInfo: this.props.catalogueInfo,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      qrcodeImg: nextProps.qrcodeImg,
      qrcodeUrl: nextProps.qrcodeUrl,
      downVisible: nextProps.downVisible,
      catalogueInfo: nextProps.catalogueInfo,
    });
  }
  handleOk = () => {
    this.props.fn(false);
  }
  handleCancel = () => {
    this.props.fn(false);
  }
  downloadShow = () => {
    this.setState({
      downVisible: true,
    });
  }
  downQrcode = (e) => {
    const type = e.target.getAttribute('data-type') || e.target.parentNode.getAttribute('data-type');
    const size = e.target.getAttribute('data-size') || e.target.parentNode.getAttribute('data-size');
    const { qrcodeImg } = this.state;
    let url = qrcodeImg.replace('/qr?', '/qr/downQr?');
    console.log(url);
    console.log(qrcodeImg);
    if (size) {
      url += `&type=${type}&downsize=${size}`;
    } else {
      url += `&type=${type}`;
    }
    window.open(url);
  }
  linkToCatalogue = (catalogueInfo) => {
    this.props.linkfn(catalogueInfo);
  }
  // 设置美化modal显示隐藏
  changeBeautifyVisible = (bool) => {
    this.setState({
      beautyVisible: bool,
    });
  }
  render() {
    const {
      visible,
      downVisible,
      beautyVisible,
      qrcodeImg,
      qrcodeUrl,
      catalogueInfo,
    } = this.state;
    return (
      <div className={styles.normal}>
        <Modal
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          wrapClassName={styles.modal}
          style={downVisible ? { minWidth: 1000 } : { maxWidth: 340 }}
        >
          <Layout style={{ borderRadius: '4px' }}>
            <Content>
              <div className={downVisible ? `${styles.content} ${styles.contentHeight}` : styles.content}>
                <div className={styles.title}>二维码下载</div>
                <div className={styles.qrcodeContent}>
                  <img src={qrcodeImg} alt="" />
                </div>
                <div className={styles.operatingBtnContent}>
                  <Row>
                    <Col
                      span={12}
                      className={downVisible ? styles.operatingDownText : styles.operatingDown}
                      onClick={this.downloadShow.bind(this)}
                    >下载其他格式
                    </Col>
                    <Col
                      span={12}
                      className={styles.operatingBeautify}
                      onClick={this.changeBeautifyVisible.bind(this, true)}
                    >二维码美化
                    </Col>
                  </Row>
                  {
                    catalogueInfo ?
                    (
                      <div className={styles.noticeInfo}>该活码已保存至
                        <span
                          onClick={this.linkToCatalogue.bind(this, catalogueInfo)}
                          className={styles.catologueName}
                        >
                          {catalogueInfo.name}
                        </span>
                        里，点击前去后台管理。
                      </div>
                    ) : ''
                  }
                </div>
              </div>
              {
                downVisible ? (
                  <div className={styles.downContent}>
                    <Download downQrcode={this.downQrcode.bind(this)} />
                  </div>
                ) :
                ''
              }
            </Content>
            <Footer className={styles.footer}>
              <div className={styles.footerLeft}>
                <Button
                  className={styles.downloadBtn}
                  type="primary"
                  onClick={this.downQrcode.bind(this)}
                  data-type="png"
                  data-size="400"
                >下载
                </Button>
              </div>
            </Footer>
          </Layout>
        </Modal>
        <BeautifyFrame
          visible={beautyVisible}
          fn={this.changeBeautifyVisible.bind(this, false)}
          data={qrcodeUrl}
        />
      </div>
    );
  }
}
