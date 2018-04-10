import React from 'react';
import { Icon } from 'antd';
import styles from './down.less';

export default class Download extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.downQrcode = this.props.downQrcode;
  }

  render() {
    return (
      <div className={styles.normal}>
        <div className={styles.downItem}>
          <div className={styles.downLeft}>
            <h3>普通格式</h3>
            <span>含美化样式</span>
          </div>
          <div className={styles.downRight}>
            <a
              className={styles.downBtn}
              onClick={this.downQrcode}
              data-type="png"
              data-size="1000"
            >
              <Icon className={styles.icon} type="cli-circle-down" />
              <span className={styles.downTitle__sm}>大尺寸</span>
              <span className={styles.downSize}>1000*1000像素</span>
            </a>
            <a
              className={styles.downBtn}
              onClick={this.downQrcode}
              data-type="png"
              data-size="500"
            >
              <Icon className={styles.icon} type="cli-circle-down" />
              <span className={styles.downTitle__sm}>中等尺寸</span>
              <span className={styles.downSize}>500*500像素</span>
            </a>
            <a
              className={styles.downBtn}
              onClick={this.downQrcode}
              data-type="png"
              data-size="300"
            >
              <Icon className={styles.icon} type="cli-circle-down" />
              <span className={styles.downTitle__sm}>小尺寸</span>
              <span className={styles.downSize}>300*300像素</span>
            </a>
          </div>
        </div>
        <div className={styles.downItem}>
          <div className={styles.downLeft}>
            <h3>矢量格式</h3>
            <span>不含美化样式</span>
          </div>
          <div className={styles.downRight}>
            <a
              className={styles.downBtn}
              onClick={this.downQrcode}
              data-type="pdf"
            >
              <Icon className={styles.icon} type="cli-circle-down" />
              <span className={styles.downTitle}>PDF格式</span>
            </a>
            <a
              className={styles.downBtn}
              onClick={this.downQrcode}
              data-type="svg"
            >
              <Icon className={styles.icon} type="cli-circle-down" />
              <span className={styles.downTitle}>SVG格式</span>
            </a>
            <a
              className={styles.downBtn}
              onClick={this.downQrcode}
              data-type="eps"
            >
              <Icon className={styles.icon} type="cli-circle-down" />
              <span className={styles.downTitle}>EPS格式</span>
            </a>
          </div>
        </div>
        <div className={`${styles.downItem} ${styles.downItemNoBottom}`}>
          <div className={styles.downLeft}>
            <h3 className={styles.singleTitle}>打包下载</h3>
          </div>
          <div className={styles.downRight}>
            <a
              className={`${styles.downBtn} ${styles.downBtn__lg}`}
              onClick={this.downQrcode}
              data-type="zip"
            >
              <Icon className={styles.icon} type="cli-circle-down" />
              <span className={styles.downTitle}>内含三种尺寸的位图和所有格式的矢量图</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
