import React from 'react';
import { Card } from 'antd';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import UploadFile from '../../components/Upload/file.js';

class File extends React.Component {
  state = {
    list: this.props.list,
    listDefault: this.props.listDefault,
    extsArr: ['docx', 'doc', 'ppt', 'pptx', 'pdf', 'xls', 'xlsx'], // 小程序端只支持这些后缀名文件预览展示
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
  uploadFile = (data) => {
    const { list, listDefault } = this.state;
    if (list.attribute_list.length > 0) {
      list.attribute_list[0].file_url.value = data.url;
      list.attribute_list[0].file_url.save_key = data.key;
      list.attribute_list[0].file_name.value = data.filename;
      list.attribute_list[0].file_size.value = data.filesize;
    } else {
      const listTemp = cloneDeep(listDefault);
      const obj = cloneDeep(listTemp.attribute_list);
      obj.file_url.value = data.url;
      obj.file_url.save_key = data.key;
      obj.file_name.value = data.filename;
      obj.file_size.value = data.filesize;
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
      <Card title="文件">
        <UploadFile
          upload={this.uploadFile.bind(this)}
          url={list.attribute_list.length > 0 ? list.attribute_list[0].file_url.value : ''}
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
}))(File);
