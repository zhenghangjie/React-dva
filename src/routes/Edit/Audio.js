import React from 'react';
import { Card } from 'antd';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import UploadAudio from '../../components/Upload/audio.js';

class Audio extends React.Component {
  state = {
    list: this.props.list,
    listDefault: this.props.listDefault,
    extsArr: ['mp3', 'm4a'],
    uploadInfo: this.props.uploadInfo,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      list: nextProps.list,
    });
  }
  updateList = () => {
    const { list } = this.state;
    this.props.dispatch({
      type: 'edit/fetchTextContent',
      payload: {
        list,
      },
    });
  }
  uploadAudio = (url, key, fileObj) => {
    const { list, listDefault } = this.state;
    if (list.attribute_list.length > 0) {
      list.attribute_list[0].audio_url.value = url;
      list.attribute_list[0].audio_url.save_key = key;
      list.attribute_list[0].audio_name.value = fileObj.filename;
      list.attribute_list[0].audio_size.value = fileObj.filesize;
    } else {
      const listTemp = cloneDeep(listDefault);
      const obj = cloneDeep(listTemp.attribute_list);
      obj.audio_url.value = url;
      obj.audio_url.save_key = key;
      obj.audio_name.value = fileObj.filename;
      obj.audio_size.value = fileObj.filesize;
      list.attribute_list.push(obj);
    }
    this.setState({
      list,
    });
    this.updateList();
  }
  updateFileDuration = (fileDuration) => {
    const { list, listDefault } = this.state;
    if (list.attribute_list.length > 0) {
      list.attribute_list[0].audio_long.value = fileDuration;
    } else {
      const listTemp = cloneDeep(listDefault);
      const obj = cloneDeep(listTemp.attribute_list);
      obj.audio_long.value = fileDuration;
      list.attribute_list.push(obj);
    }
    this.setState({
      list,
    });
    this.updateList();
  }
  render() {
    const { list, extsArr, uploadInfo } = this.state;
    return (
      <Card title="音频">
        <UploadAudio
          upload={this.uploadAudio.bind(this)}
          updateFileDuration={this.updateFileDuration.bind(this)}
          url={list.attribute_list.length > 0 ? list.attribute_list[0].audio_url.value : ''}
          list={list}
          extsArr={extsArr}
          uploadInfo={uploadInfo}
          changeUploadState={this.props.changeUploadState}
          loading={this.props.loading} // 上传状态
        />
      </Card>
    );
  }
}

export default connect(state => ({
  listRecent: state.edit.list,
}))(Audio);
