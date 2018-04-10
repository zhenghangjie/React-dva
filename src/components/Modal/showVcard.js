import React from 'react';
import { Modal, Layout, Button, Spin } from 'antd';
import styles from './showVcard.less';

class showVcard extends React.Component {
  state = {
    cardModelvisible: this.props.cardModelvisible,
    cardImg: this.props.cardImg,
    cardLoading: this.props.cardLoading,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      cardModelvisible: nextProps.cardModelvisible,
      cardImg: nextProps.cardImg,
      cardLoading: nextProps.cardLoading,
    });
  }
  handleCancel = () => {
    this.setState({ cardModelvisible: false });
    this.props.showVcard(false);
  }
  downCard = (e) => {
    const type = e.target.getAttribute('data-type') || e.target.parentNode.getAttribute('data-type');
    const size = e.target.getAttribute('data-size') || e.target.parentNode.getAttribute('data-size');
    const { cardImg } = this.state;
    let url = cardImg.replace('/qr?', '/qr/downQr?');
    console.log(url);
    console.log(cardImg);
    if (size) {
      url += `&type=${type}&downsize=${size}`;
    } else {
      url += `&type=${type}`;
    }
    window.open(url);
  }
  render() {
    const { cardModelvisible, cardImg, cardLoading } = this.state;
    const { Footer, Content } = Layout;
    console.log(cardImg);
    return (
      <div>
        <Modal
          visible={cardModelvisible}
          footer={null}
          wrapClassName={styles.cardModal}
          width={340}
          onCancel={this.handleCancel}
        >
          <Layout style={{ borderRadius: '4px' }}>
            <Content>
              <div className={styles.content}>
                {
                  cardLoading === true ?
                  (<div className={styles.example}><Spin /></div>)
                  :
                  (
                    <div className={styles.qrcodeContent}>
                      <img src={cardImg} alt="" />
                    </div>
                  )
                }
              </div>
            </Content>
            <Footer className={styles.footer}>
              <div className={styles.footerLeft}>
                <Button
                  className={styles.downloadBtn}
                  type="primary"
                  data-type="png"
                  data-size="400"
                  onClick={this.downCard.bind(this)}
                >下载
                </Button>
              </div>
            </Footer>
          </Layout>
        </Modal>
      </div>
    );
  }
}

export default showVcard;
