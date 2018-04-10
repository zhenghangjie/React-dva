import React from 'react';
import { Table, Icon } from 'antd';
import 'react-quill/dist/quill.snow.css';
import pub from './public.less';
// import styles from '../../routes/Edit/Table.less';
import styles from './table.less';

class EditorModuleText extends React.Component {
  state = {
    obj: this.props.list,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      obj: nextProps.list,
    });
  }
  initTable = (item) => {
    const obj = JSON.parse(item);
    if (obj && obj.columns && obj.data) {
      return (
        <Table
          className={styles[`tableDefault${obj.key}`]}
          columns={obj.columns}
          dataSource={obj.data}
          size="small"
          bordered
          pagination={false}
        />
      );
    }
  }
  render() {
    const { obj } = this.state;
    return (
      <div className={obj.attribute_list.length > 0 ? `ncPreview ${pub.normal} ${styles.content}` : `ncPreview ${pub.noContent} ${pub.normal}`}>
        {
          obj.attribute_list.length > 0 ?
            (
              this.initTable(obj.attribute_list[0].table_html.value)
            ) :
              <Icon type="cli-form" className={pub.noContentIcon} />
         }
      </div>
    );
  }
}

export default EditorModuleText;
