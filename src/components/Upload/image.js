import React from 'react';
import { Upload, Icon, message, Button, Progress } from 'antd';
import { checkFileExts } from '../../utils/utils';
import { getOriginData } from '../../common/origin';
import styles from './image.less';

export default class Uploads extends React.Component {
  state = {
    origin: getOriginData(),
    extsArr: this.props.extsArr, // 上传文件后缀名限制
    uploadInfo: this.props.uploadInfo, // 图片上传限制信息(bytes)
    uploadLoading: false, // 上传loading状态
    list: this.props.list, // 图片组件list
    url: this.props.url, // 图片地址
    idTemp: '', // 记录上传前uid
    progressVal: 0,
    fileUid: '',
  };
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      url: nextProps.url,
      list: nextProps.list,
      uploadLoading: nextProps.loading,
    });
  }
  handleChange = (info) => {
    const { idTemp, list, fileUid, uploadLoading } = this.state;
    if (idTemp !== list.uniqueId) { // 此判断用于确定上传前选中模块是否与上传后选中模块相同(防止上传过程中模块切换)
      return false;
    }
    if (info.event && fileUid === info.file.originFileObj.uid) {
      let progressVal = parseInt(info.event.percent, 10);
      if (progressVal === 100) {
        progressVal = 99;
      }
      this.setState({ progressVal });
    }
    if (info.file.status === 'done') {
      // 重新上传初始化进度条
      const ret = info.file.response;
      if (ret.code === 200) {
        if (idTemp === list.uniqueId
        && uploadLoading
        && fileUid === info.file.originFileObj.uid) { // 此判断用于确定上传前选中模块是否与上传后选中模块相同(防止上传过程中模块切换)
          const imgUrl = `${ret.data.url}?x-oss-process=image/resize,w_350/auto-orient,1`;
          this.props.upload(imgUrl, ret.data.key);
          this.setState({
            url: imgUrl,
          });
        }
      } else {
        message.error(ret.msg);
      }
      this.loadingImg(false);
      this.props.changeUploadState(false); // 改变上传状态
    }
  }
  loadingImg = (bool) => {
    this.setState({
      uploadLoading: bool,
    });
  }
  beforeUpload = (file) => {
    const { extsArr, uploadInfo } = this.state;
    const { limitSize, capacityUsed, capacityUsable, editionInfo } = uploadInfo;
    this.setState({
      idTemp: this.state.list.uniqueId,
    });
    if (checkFileExts(file, extsArr, limitSize, capacityUsed, capacityUsable, 'image', '', editionInfo.from_edition_id)) {
      this.setState({
        fileUid: file.uid,
      });
      this.props.changeUploadState(true); // 改变上传状态
    } else {
      return false;
    }
  }
  cancelUpload = () => {
    this.props.changeUploadState(false); // 改变上传状态
  }
  render() {
    const { origin, url, uploadLoading, progressVal } = this.state;
    return (
      <div className={styles.normal}>
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
          className="avatar-uploader"
          name="Filedata"
          listType="picture-card"
          accept=".jpg, .jpeg, .png, .gif, .bmp"
          showUploadList={false}
          action={origin.uploadDomain}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
        >
          {
            url ?
            (
              !uploadLoading &&
              (
                <div>
                  <img alt="" style={{ width: '100%' }} className="" src={url} onLoad={this.loadingImg.bind(this, false)} />
                  <Button className={styles.uploadBtn}><Icon type="cli-upload" /> 重新上传</Button>
                </div>
              )
            ) :
            (
              !uploadLoading &&
              (
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">图片上传</div>
                </div>
              )
            )
          }
        </Upload>
      </div>
    );
  }
}
