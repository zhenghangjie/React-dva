import React from 'react';
import { connect } from 'dva';
import { Upload, Icon, message, Button, Progress, Slider } from 'antd';
import { checkFileExts, getExtsByName, formatFileSize, formatTime } from '../../utils/utils';
import { getOriginData } from '../../common/origin';
import styles from './audio.less';

class Uploads extends React.Component {
  state = {
    origin: getOriginData(),
    extsArr: this.props.extsArr, // 上传文件后缀名限制
    uploadInfo: this.props.uploadInfo, // 文件上传限制信息(bytes)
    uploadLoading: false, // 上传loading状态
    list: this.props.list, // 音频组件list
    url: this.props.url, // 音频地址
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
    currentTime: '00:00',
    timer: false,
    currentValue: 0,
    fileUid: '',
  };
  componentDidMount() {
    this.audioEventListener();
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
          filename: list.attribute_list[0].audio_name.value,
          filesize: list.attribute_list[0].audio_size.value,
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
  audioEventListener = () => {
    const audioObj = document.getElementById('audio');
    if (audioObj) {
      audioObj.addEventListener('loadedmetadata', () => {
        const fileDuration = formatTime(audioObj.duration);
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
          this.audioEventListener();
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
    if (checkFileExts(file, extsArr, limitSize, capacityUsed, capacityUsable, 'audio', ('data' in currentUser ? currentUser.data.manager_info.contact_link : ''), editionId)) {
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
  mediaControl = (fileDuration) => {
    const audioObj = document.getElementById('audio');
    const { timer } = this.state;
    let boolTemp;
    const totalTimeArr = fileDuration.split(':');
    const totalTimeNum = (parseInt(totalTimeArr[0], 10) * 60) + parseInt(totalTimeArr[1], 10);
    const interval = () => {
      const currentStringTime = formatTime(audioObj.currentTime);
      const sliderValue = (audioObj.currentTime / totalTimeNum) * 100;
      this.setState({
        currentTime: currentStringTime,
        currentValue: sliderValue,
      });
    };
    if (audioObj.paused) {
      audioObj.play();
      boolTemp = true;
      this.setState({
        timer: setInterval(interval, 1000),
      });
    } else {
      audioObj.pause();
      boolTemp = false;
      clearInterval(timer);
    }
    this.setState({
      isPlay: boolTemp,
    });
  }
  audioEnd = () => {
    const { timer } = this.state;
    clearInterval(timer);
    this.setState({
      isPlay: false,
    });
  }
  sliderChanged = (value) => {
    const { fileDuration } = this.state;
    const audioObj = document.getElementById('audio');
    const changedTime = Math.floor((value / 100) * audioObj.duration, 10);
    audioObj.currentTime = changedTime;
    const currentStringTime = formatTime(changedTime);
    this.setState({
      currentTime: currentStringTime,
    });
    this.mediaControl(fileDuration);
  }
  sliderChanging = (value) => {
    const { timer } = this.state;
    const audioObj = document.getElementById('audio');
    audioObj.pause();
    clearInterval(timer);
    this.setState({
      isPlay: false,
      currentValue: value,
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
      fileObj,
      fileDuration,
      isPlay,
      progressVal,
      currentTime,
      currentValue,
    } = this.state;
    return (
      <div className={styles.normal}>
        <div className={url && !uploadLoading ? '' : `${styles.none}`}>
          <div className={styles.audioModule}>
            <div
              className={styles.audioIcon}
              onClick={this.mediaControl.bind(this, fileDuration)}
            >
              <img src={isPlay ? require('../../assets/playing.gif') : require('../../assets/paused.png')} alt="" className={styles.imgControll} />
            </div>
            <div className={styles.audioInfo}>
              <p className={styles.audioName}>{fileObj.filename}</p>
              <Slider
                tipFormatter={null}
                onAfterChange={this.sliderChanged.bind(this)}
                onChange={this.sliderChanging.bind(this)}
                value={currentValue}
              />
              <span className={styles.audioSize}>{fileObj.filesize}</span>
              <span className={styles.audioDuration}>{fileDuration}</span>
              <span className={styles.audioStartTime}>{currentTime}</span>
            </div>
            <audio
              id="audio"
              src={url}
              preload="auto"
              onEnded={this.audioEnd.bind(this)}
            >
              <track kind="captions" />你的浏览器不支持音频播放
            </audio>
          </div>
          {this.freeUsersTips()}
          <Upload
            name="file"
            showUploadList={false}
            action={origin.uploadQiniuUrl}
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            data={tokenData}
            accept=".mp3, .m4a"
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
            accept=".mp3, .m4a"
          >
            {
              !uploadLoading &&
              <div>
                <Icon type="plus" />
                <div className="ant-upload-text">音频上传</div>
              </div>
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
