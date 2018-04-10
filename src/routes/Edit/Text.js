import React from 'react';
import { Card } from 'antd';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import RichText from '../../components/RichEditor';

class Text extends React.Component {
  state = {
    list: this.props.list,
    listDefault: this.props.listDefault,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      list: nextProps.list,
    });
  }
  changeValue = (value) => {
    const { list, listDefault } = this.state;
    // 编辑/新增改变list数据
    if (list.attribute_list.length > 0) {
      list.attribute_list[0].content_html.value = value;
    } else {
      const listTemp = cloneDeep(listDefault);
      const obj = cloneDeep(listTemp.attribute_list);
      obj.content_html.value = value;
      list.attribute_list.push(obj);
    }
    this.setState({
      list,
    });
    this.props.dispatch({
      type: 'edit/fetchTextContent',
      payload: {
        list: this.state.list,
      },
    });
  }
  render() {
    const { list } = this.state;
    return (
      <Card title="文本">
        <RichText
          value={list.attribute_list.length > 0 ? list.attribute_list[0].content_html.value : ''}
          changeValue={this.changeValue.bind(this)}
        />
      </Card>
    );
  }
}

export default connect(state => ({
  listRecent: state.edit.list,
}))(Text);
