import React from 'react';
import { connect } from 'dva';
import { Upload, Icon, message, Button, Progress } from 'antd';
import { checkFileExts, getExtsByName, formatFileSize, formatTime } from '../../utils/utils';
import { getOriginData } from '../../common/origin';
import styles from './video.less';

class Uploads extends React.Component {
  state = {
    origin: getOriginData(),
    extsArr: this.props.extsArr, // 上传文件后缀名限制
    uploadInfo: this.props.uploadInfo, // 文件上传限制信息(bytes)
    uploadLoading: false, // 上传loading状态
    list: this.props.list, // 视频组件list
    url: this.props.url, // 视频地址
    isPlay: false,
    idTemp: '', // 记录上传前uid
    tokenData: {
      token: '',
      key: '',
    },
    fileObj: {
      filename: '',
      filesize: '',
    },
    fileDuration: '',
    currentUser: this.props.currentUser,
    progressVal: 0,
    fileUid: '',
  };
  componentDidMount() {
    this.videoEventListener();
    this.getInitData(this.state);
  }
  componentWillReceiveProps(nextProps) {
    this.getInitData(nextProps, false);
    this.setState({
      uploadLoading: nextProps.loading,
    });
  }
  getInitData = (obj, isFirst) => {
    const { list, url } = obj;
    if (list.attribute_list.length > 0) {
      this.setState({
        fileObj: {
          filename: list.attribute_list[0].video_name.value,
          filesize: list.attribute_list[0].video_size.value,
        },
      });
    }
    if (!isFirst) {
      this.setState({
        url,
        list,
        isPlay: false,
        uploadLoading: false,
      });
    }
  }
  videoEventListener = () => {
    const videoObj = document.getElementById('video');
    if (videoObj) {
      videoObj.addEventListener('loadedmetadata', () => {
        const fileDuration = formatTime(videoObj.duration);
        this.setState({
          fileDuration,
        });
        this.props.updateFileDuration(fileDuration);
        this.loadingImg(false);
        this.props.changeUploadState(false); // 改变上传状态
      });
    }
  }
  handleChange = (info) => {
    const { idTemp, list, origin, fileObj, fileUid, uploadLoading } = this.state;
    if (info.event && fileUid === info.file.originFileObj.uid) {
      let progressVal = parseInt(info.event.percent, 10);
      if (progressVal === 100) {
        progressVal = 99;
      }
      this.setState({ progressVal });
    }
    if (idTemp !== list.uniqueId) { // 此判断用于确定上传前选中模块是否与上传后选中模块相同(防止上传过程中模块切换)
      return false;
    }
    if (info.file.status === 'done') {
      // 重新上传初始化进度条
      const ret = info.file.response;
      if (ret.key) {
        if (idTemp === list.uniqueId
        && uploadLoading
        && fileUid === info.file.originFileObj.uid) { // 此判断用于确定上传前选中模块是否与上传后选中模块相同(防止上传过程中模块切换)
          const url = `${origin.qiniuSourceUrl}${ret.key}`;
          this.setState({
            url,
          });
          this.props.upload(url, ret.key, fileObj);
          this.videoEventListener();
        }
      } else {
        message.error(ret.msg);
      }
    }
  }
  loadingImg = (bool) => {
    this.setState({
      uploadLoading: bool,
    });
  }
  beforeUpload = (file) => {
    const { extsArr, uploadInfo, currentUser } = this.state;
    const { limitSize, capacityUsed, capacityUsable } = uploadInfo;
    const editionId = currentUser.data.edition_info.from_edition_id;
    this.setState({
      idTemp: this.state.list.uniqueId,
    });
    if (checkFileExts(file, extsArr, limitSize, capacityUsed,
      capacityUsable, 'video', ('data' in currentUser ? currentUser.data.manager_info.contact_link : ''), editionId)) {
      this.props.changeUploadState(true); // 改变上传状态
      return new Promise((resolve) => {
        this.props.dispatch({
          type: 'api/getUploadToken',
          payload: {
            ext: getExtsByName(file.name),
          },
          callback: () => {
            const tokenData = {
              token: this.props.uploadToken.uptoken,
              key: this.props.uploadToken.filename,
            };
            this.setState({
              tokenData,
              fileObj: {
                filename: file.name,
                filesize: formatFileSize(file.size),
              },
              fileUid: file.uid,
            });
            resolve();
          },
        });
      });
    } else {
      return false;
    }
  }
  mediaControl = () => {
    const videoObj = document.getElementById('video');
    let boolTemp;
    if (videoObj.paused) {
      videoObj.play();
      boolTemp = true;
    } else {
      videoObj.pause();
      boolTemp = false;
    }
    this.setState({
      isPlay: boolTemp,
    });
  }
  videoEnd = () => {
    this.setState({
      isPlay: false,
    });
  }
  freeUsersTips = () => {
    const { currentUser } = this.state;
    let version = 1;
    if ('data' in currentUser) {
      version = parseInt(currentUser.data.edition_info.edition_id, 10);
    }
    return (
      <div className={`${styles.freeTipsContent} ${(version === 1 ? '' : 'none')}`}>
        <Icon type="exclamation-circle-o" className={styles.warnIcon} />
        <span className={styles.freeTips}>免费用户添加了音视频组件的码只供5个用户扫描试用如需更大范围传播，请
          <a href="//cli.im/news/price" target="_blank" rel="noopener noreferrer" className={styles.link}>升级到付费版本</a>
        </span>
      </div>
    );
  }
  cancelUpload = () => {
    this.props.changeUploadState(false); // 改变上传状态
  }
  render() {
    const {
      origin,
      url,
      uploadLoading,
      tokenData,
      fileDuration,
      isPlay,
      progressVal,
    } = this.state;
    return (
      <div className={styles.normal}>
        <div className={url && !uploadLoading ? '' : `${styles.none}`}>
          <div
            className={styles.videoModule}
            onClick={this.mediaControl.bind(this)}
          >
            <div className={styles.videoInfo}>
              <video
                id="video"
                className={styles.video}
                src={url}
                preload="metadata"
                onEnded={this.videoEnd.bind(this)}
              >
                <track kind="captions" />你的浏览器不支持视频播放
              </video>
              {
                isPlay ? '' :
                (
                  <div className={styles.videoIcon}>
                    <Icon type="play-circle" />
                    <div className={styles.videoDuration}>{fileDuration}</div>
                  </div>
                )
              }
            </div>
            {this.freeUsersTips()}
          </div>
          <Upload
            name="file"
            showUploadList={false}
            action={origin.uploadQiniuUrl}
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            data={tokenData}
            accept=".mp4, .m3u8"
          >
            <Button className={styles.uploadBtn}><Icon type="cli-upload" /> 重新上传</Button>
          </Upload>
        </div>
        <div className={url && !uploadLoading ? `${styles.none}` : ''}>
          {
            uploadLoading &&
            <div className="loadingProgressContent">
              <Progress percent={progressVal} status="active" showInfo={false} size="small" />
              <div className="progressContent">
                <p>上传中,已上传{progressVal}%</p>
                <p>请耐心等待</p>
                <Icon type="close-circle" onClick={this.cancelUpload.bind(this)} />
              </div>
            </div>
          }
          <Upload
            className={url ? '' : 'avatar-uploader'}
            name="file"
            listType="picture-card"
            showUploadList={false}
            action={origin.uploadQiniuUrl}
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            data={tokenData}
            accept=".mp4, .m3u8"
          >
            {
              !uploadLoading &&
              (
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">视频上传</div>
                </div>
              )
            }
          </Upload>
          {this.freeUsersTips()}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  uploadToken: state.api.uploadToken,
  currentUser: state.user.currentUser,
}))(Uploads);
