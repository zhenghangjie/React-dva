import React from 'react';
import { Upload, Icon, message, Button, Progress } from 'antd';
import { checkFileExts, getExtsByName, getIconByExts } from '../../utils/utils';
import { getOriginData } from '../../common/origin';
import styles from './file.less';

export default class Uploads extends React.Component {
  state = {
    origin: getOriginData(),
    extsArr: this.props.extsArr, // 上传文件后缀名限制
    uploadInfo: this.props.uploadInfo, // 文件上传限制信息(bytes)
    uploadLoading: false, // 上传loading状态
    list: this.props.list, // 文件组件list
    url: this.props.url, // 文件地址
    idTemp: '', // 记录上传前uid
    iconUrl: '',
    progressVal: 0,
    fileUid: '',
  };
  componentDidMount() {
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
    if (list.attribute_list.length > 0 && list.attribute_list[0].file_name) {
      const exts = getExtsByName(list.attribute_list[0].file_name.value);
      this.getFileImgBySuffix(exts);
    }
    if (!isFirst) {
      this.setState({
        url,
        list,
        uploadLoading: false,
      });
    }
  }
  getFileImgBySuffix = (ext) => {
    const { staticDomain } = this.state.origin;
    const iconUrl = getIconByExts(ext, staticDomain);
    this.setState({
      iconUrl,
    });
  }
  handleChange = (info) => {
    const { idTemp, list, fileUid, uploadLoading } = this.state;
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
      if (ret.code === 200) {
        if (idTemp === list.uniqueId
        && uploadLoading
        && fileUid === info.file.originFileObj.uid) { // 此判断用于确定上传前选中模块是否与上传后选中模块相同(防止上传过程中模块切换)
          this.props.upload(ret.data);
          this.setState({
            url: ret.data.url,
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
    if (checkFileExts(file, extsArr, limitSize, capacityUsed, capacityUsable, 'file', '', editionInfo.from_edition_id)) {
      const ext = getExtsByName(file.name);
      this.getFileImgBySuffix(ext);
      this.setState({
        fileUid: file.uid,
      });
      this.props.changeUploadState(true); // 改变上传状态
      return true;
    } else {
      return false;
    }
  }
  cancelUpload = () => {
    this.props.changeUploadState(false); // 改变上传状态
  }
  render() {
    const {
      origin,
      url,
      uploadLoading,
      iconUrl,
      list,
      progressVal,
    } = this.state;
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
          showUploadList={false}
          action={origin.uploadDomain}
          beforeUpload={this.beforeUpload}
          accept=".docx, .doc, .ppt, .pptx, .pdf, .xls, .xlsx"
          onChange={this.handleChange}
        >
          {
            url ?
            (
              !uploadLoading &&
              (
                <div>
                  <img
                    alt=""
                    className={styles.fileIcon}
                    src={iconUrl}
                    onLoad={this.loadingImg.bind(this, false)}
                  />
                  <div>
                    <div className={styles.fileName}>{(list.attribute_list.length > 0 && list.attribute_list[0].file_name) ? list.attribute_list[0].file_name.value : ''}</div>
                    <div>{(list.attribute_list.length > 0 && list.attribute_list[0].file_size) ? list.attribute_list[0].file_size.value : ''}</div>
                  </div>
                  <Button className={styles.uploadBtn}><Icon type="cli-upload" /> 重新上传</Button>
                </div>
              )
            ) :
            (
              !uploadLoading &&
              (
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">文件上传</div>
                </div>
              )
            )
          }
        </Upload>
      </div>
    );
  }
}
