import React from 'react';
import { Card } from 'antd';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import UploadImg from '../../components/Upload/image.js';

class Img extends React.Component {
  state = {
    list: this.props.list,
    listDefault: this.props.listDefault,
    extsArr: ['jpg', 'jpeg', 'gif', 'png', 'bmp'],
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
  uploadImg = (src, key) => {
    const { list, listDefault } = this.state;
    if (list.attribute_list.length > 0) {
      list.attribute_list[0].image_url.value = src;
      list.attribute_list[0].image_url.save_key = key;
    } else {
      const listTemp = cloneDeep(listDefault);
      const obj = cloneDeep(listTemp.attribute_list);
      obj.image_url.value = src;
      obj.image_url.save_key = key;
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
      <Card title="图片">
        <UploadImg
          upload={this.uploadImg.bind(this)}
          url={list.attribute_list.length > 0 ? list.attribute_list[0].image_url.value : ''}
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
}))(Img);
