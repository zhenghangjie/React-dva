import React from 'react';
import { Card, Table, message, Icon } from 'antd';
import { connect } from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import { getTableInfo } from '../../common/tableInfo.js';
import styles from './Table.less';


class TableModule extends React.Component {
  state = {
    list: this.props.list,
    listDefault: this.props.listDefault,
    dataDefault: getTableInfo(),
    data: false,
    columns: false,
  }
  componentDidMount() {
    this.getInitData(this.props.list);
  }
  componentWillReceiveProps(nextProps) {
    this.getInitData(nextProps.list);
    this.setState({
      list: nextProps.list,
    });
  }
  getInitData = (list) => {
    if (list.attribute_list.length > 0) {
      const obj = JSON.parse(list.attribute_list[0].table_html.value);
      const columnsRichText = this.getColumnsRichText();
      // console.log(obj.columns);
      obj.columns.forEach((item, i) => {
        columnsRichText[obj.name][i].title = this.getTitleDom(item.title, i);
      });
      this.setState({
        data: obj.data,
        columns: columnsRichText[obj.name],
      });
    } else {
      this.setState({
        data: false,
        columns: false,
      });
    }
  }
  getInputDom = (text, index, name) => {
    return (
      <input onChange={this.changeTableValue.bind(this, index, name)} defaultValue={text} />
    );
  }
  getTitleDom = (value, index) => {
    return (
      <input onChange={this.changeColumnValue.bind(this, index)} defaultValue={value} />
    );
  }
  getTitleUnchange = (value) => {
    return (
      <div>{value}</div>
    );
  }
  getOperationDom = (record, index) => {
    return (
      <div>
        <Icon type="cli-add-1" onClick={this.addTableTr.bind(this, record, index)} />
        <Icon type="cli-delete" onClick={this.removeTableTr.bind(this, record, index)} />
      </div>
    );
  }
  getMaxKey = (list) => {
    let maxId;
    list.forEach((item, index) => {
      if (index === 0) {
        maxId = item.key;
      } else if (item.key > maxId) {
        maxId = item.key;
      }
    });
    return parseInt(maxId + 1, 10);
  }
  getDefaultTable = () => {
    const { dataDefault } = this.state;
    if (!dataDefault) {
      return [];
    }
    return dataDefault.map((item) => {
      const tableDefaultName = styles[`tableDefault${item.key}`];
      const tableChooseDefaultName = styles.tableChooseDefault;
      return (
        <div
          key={item.key}
          onClick={this.chooseTableType.bind(this, item)}
        >
          <Table
            className={`${tableDefaultName} ${tableChooseDefaultName}`}
            rowClassName={styles.tableDefaultRow}
            columns={item.columns}
            dataSource={item.data}
            size="small"
            bordered
            pagination={false}
          />
        </div>
      );
    });
  }
  getColumnsRichText = () => {
    const columnsRichText = {
      courseInfo: [{
        title: this.getTitleDom('课程名称', 0),
        colSpan: 1,
        dataIndex: 'col1',
        key: 'col1',
        render: (text, record, index) => this.getInputDom(text, index, 'col1'),
      }, {
        title: this.getTitleDom('课程介绍', 1),
        colSpan: 1,
        dataIndex: 'col2',
        key: 'col2',
        render: (text, record, index) => this.getInputDom(text, index, 'col2'),
      }, {
        title: this.getTitleUnchange('操作'),
        colSpan: 1,
        dataIndex: 'col3',
        key: 'col3',
        render: (text, record, index) => this.getOperationDom(record, index),
      }],
      paramInfo: [{
        title: this.getTitleDom('参数说明', 0),
        colSpan: 2,
        dataIndex: 'col1',
        key: 'col1',
        render: (text, record, index) => this.getInputDom(text, index, 'col1'),
      }, {
        title: '',
        colSpan: 0,
        dataIndex: 'col2',
        key: 'col2',
        render: (text, record, index) => this.getInputDom(text, index, 'col2'),
      }, {
        title: this.getTitleUnchange('操作'),
        colSpan: 1,
        dataIndex: 'col3',
        key: 'col3',
        render: (text, record, index) => this.getOperationDom(record, index),
      }],
      checkInfo: [{
        title: this.getTitleDom('检查记录', 0),
        colSpan: 3,
        dataIndex: 'col1',
        key: 'col1',
        render: (text, record, index) => this.getInputDom(text, index, 'col1'),
      }, {
        title: '',
        colSpan: 0,
        dataIndex: 'col2',
        key: 'col2',
        render: (text, record, index) => this.getInputDom(text, index, 'col2'),
      }, {
        title: '',
        colSpan: 0,
        dataIndex: 'col3',
        key: 'col3',
        render: (text, record, index) => this.getInputDom(text, index, 'col3'),
      }, {
        title: this.getTitleUnchange('操作'),
        colSpan: 1,
        dataIndex: 'col4',
        key: 'col4',
        render: (text, record, index) => this.getOperationDom(record, index),
      }],
      movieInfo: [{
        title: this.getTitleDom('#', 0),
        colSpan: 1,
        dataIndex: 'col1',
        key: 'col1',
        render: (text, record, index) => this.getInputDom(text, index, 'col1'),
      }, {
        title: this.getTitleDom('电影', 1),
        colSpan: 1,
        dataIndex: 'col2',
        key: 'col2',
        render: (text, record, index) => this.getInputDom(text, index, 'col2'),
      }, {
        title: this.getTitleDom('年份', 2),
        colSpan: 1,
        dataIndex: 'col3',
        key: 'col3',
        render: (text, record, index) => this.getInputDom(text, index, 'col3'),
      }, {
        title: this.getTitleUnchange('操作'),
        colSpan: 1,
        dataIndex: 'col4',
        key: 'col4',
        render: (text, record, index) => this.getOperationDom(record, index),
      }],
      specificationInfo: [{
        title: '',
        colSpan: 0,
        dataIndex: 'col1',
        key: 'col1',
        render: (text, record, index) => this.getInputDom(text, index, 'col1'),
      }, {
        title: '',
        colSpan: 0,
        dataIndex: 'col2',
        key: 'col2',
        render: (text, record, index) => this.getInputDom(text, index, 'col2'),
      }, {
        title: 'operationBtn',
        colSpan: 0,
        dataIndex: 'col3',
        key: 'col3',
        render: (text, record, index) => this.getOperationDom(record, index),
      }],
      peopleInfo: [{
        title: this.getTitleDom('本次大会参与人员', 0),
        colSpan: 4,
        dataIndex: 'col1',
        key: 'col1',
        render: (text, record, index) => this.getInputDom(text, index, 'col1'),
      }, {
        title: '',
        colSpan: 0,
        dataIndex: 'col2',
        key: 'col2',
        render: (text, record, index) => this.getInputDom(text, index, 'col2'),
      }, {
        title: '',
        colSpan: 0,
        dataIndex: 'col3',
        key: 'col3',
        render: (text, record, index) => this.getInputDom(text, index, 'col3'),
      }, {
        title: '',
        colSpan: 0,
        dataIndex: 'col4',
        key: 'col4',
        render: (text, record, index) => this.getInputDom(text, index, 'col4'),
      }, {
        title: this.getTitleUnchange('操作'),
        colSpan: 1,
        dataIndex: 'col5',
        key: 'col5',
        render: (text, record, index) => this.getOperationDom(record, index),
      }],
    };
    return columnsRichText;
  }
  chooseTableType = (item) => {
    const itemString = JSON.stringify(item);
    const { list, listDefault } = this.state;
    const columnsRichText = this.getColumnsRichText();
    // 编辑/新增改变list数据
    if (list.attribute_list.length > 0) {
      list.attribute_list[0].table_html.value = itemString;
    } else {
      const listTemp = cloneDeep(listDefault);
      const obj = cloneDeep(listTemp.attribute_list);
      obj.table_html.value = itemString;
      list.attribute_list.push(obj);
    }
    this.setState({
      list,
      data: item.data,
      columns: columnsRichText[item.name],
    });
    this.updateList();
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
  updataTableData = (index, key, value, action) => {
    const { list } = this.state;
    if (list.attribute_list.length > 0) {
      const jsonObj = JSON.parse(list.attribute_list[0].table_html.value);
      if (action === 'add') {
        const arrTmp = cloneDeep(jsonObj.data[index]);
        arrTmp.key = key;
        jsonObj.data.splice(index + 1, 0, arrTmp);
      } else if (action === 'remove') {
        jsonObj.data.splice(index, 1);
      } else {
        jsonObj.data[index][key] = value;
      }
      list.attribute_list[0].table_html.value = JSON.stringify(jsonObj);
      this.setState({
        list,
      });
      this.updateList();
    }
  }
  changeTableValue = (index, key, event) => {
    const { data } = this.state;
    const arr = cloneDeep(data);
    arr[index][key] = event.target.value;
    this.setState({
      data: arr,
    });
    this.updataTableData(index, key, event.target.value);
  }
  changeColumnValue = (index, event) => {
    const { list, columns } = this.state;
    const { value } = event.target;
    const arr = cloneDeep(columns);
    arr[index].title = this.getTitleDom(value, index);

    if (list.attribute_list.length > 0) {
      const jsonObj = JSON.parse(list.attribute_list[0].table_html.value);
      jsonObj.columns[index].title = value;
      list.attribute_list[0].table_html.value = JSON.stringify(jsonObj);
      this.setState({
        list,
      });
      this.updateList();
    }
  }
  addTableTr = (record, index) => {
    const i = parseInt(index, 10);
    const { data } = this.state;
    const arrTmp = cloneDeep(record);
    arrTmp.key = this.getMaxKey(data);
    data.splice(i + 1, 0, arrTmp);
    this.setState({
      data,
    });
    this.updataTableData(i, arrTmp.key, '', 'add');
  }
  removeTableTr = (record, index) => {
    const i = parseInt(index, 10);
    const { data } = this.state;
    if (data.length > 1) {
      data.splice(i, 1);
      this.updataTableData(i, '', '', 'remove');
    } else {
      message.error('至少保留一条数据');
    }
    this.setState({
      data,
    });
  }
  render() {
    const { data, columns, list } = this.state;
    const tableKey = list.attribute_list.length > 0 ? JSON.parse(list.attribute_list[0].table_html.value).key : '';
    const tableDefaultName = styles[`tableDefault${tableKey}`];
    const tableEditDefaultName = styles.tableEditDefault;
    return (
      <Card title={data && columns ? '表格' : '选择表格样式'} className={styles.table}>
        {
          data && columns ?
            (
              <Table
                className={`${tableDefaultName} ${tableEditDefaultName}`}
                key={list.uniqueId}
                columns={columns}
                dataSource={data}
                size="small"
                bordered
                pagination={false}
              />
            ) :
            this.getDefaultTable()
        }
      </Card>
    );
  }
}

export default connect(state => ({
  listRecent: state.edit.list,
}))(TableModule);
