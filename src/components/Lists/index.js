import React from 'react';
import { Menu, Dropdown, Icon, Card, Spin } from 'antd';
import styles from './index.less';


class MemberLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: this.props.loading,
      lists: this.props.lists, // 列表数组
      toolBar: this.props.toolBar, // 操作栏
      moreToolBar: this.props.moreToolBar, // 更多操作
      columns: this.props.columns, // 列数&单列显示的类型
      columnsData: this.props.columnsData, // 单列的数据内容
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      lists: nextProps.lists,
    });
  }
  toolBarFilter = (list) => {
    const { toolBar, moreToolBar } = this.state;
    if (toolBar && toolBar.length) {
      // 更多操作栏
      const moreList = (moreToolBar && moreToolBar.length) ?
        (
          moreToolBar.map((item) => {
            return (
              <Menu.Item key={item.id}>
                <div>{item.value}</div>
              </Menu.Item>
            );
          })
        )
        : '';
      const menu = (
        <Menu className={styles.menuAction} onClick={this.props.moreFunc.bind(this, list)}>
          {moreList}
        </Menu>
      );
      // 操作栏
      const toolList = toolBar.map((item) => {
        return (
          <div className={`${styles.btnAction} ${styles.text_link}`} key={item.id} onClick={this.props.toolFunc.bind(this, item.id, list)}>{item.value}</div>
        );
      });
      return (
        <div className={`${styles.item_l} ${styles.item_action}`} >
          {toolList}
          {moreToolBar && moreToolBar.length ?
            (
              <Dropdown overlay={menu} trigger={['click']} >
                <a className="ant-dropdown-link">
                  更多<Icon type="down" />
                </a>
              </Dropdown>
            )
            : ''
          }
        </div>
      );
    } else {
      return '';
    }
  }
  columnsFilter = (item) => {
    const { columns } = this.state;
    return columns.map((col) => {
      switch (col.type) {
        case 'imgObj':
          return this.culImgObjFilter(item, col.id);
        default:
          return this.culLinkFilter(item, col.id);
      }
    });
  }
  culImgObjFilter = (item, id) => { // 有图列
    const departure = item.status === 11 ?
      (<span>已离职</span>)
      : '';
    return (
      <div className={`${styles.item_l} ${styles.item_l_three}`} key={id}>
        <div className={styles.item_ll_img}><img src={item.photo_path} alt="" />{departure}</div>
        <div className={styles.item_ll}>
          <p>{item.name}</p>
          <p className={styles.grey}>{item.job}</p>
        </div>
      </div>
    );
  }
  culLinkFilter = (item, id) => { // 点击事件列
    const { columnsData } = this.state;
    const data = (columnsData && columnsData.length) ?
      (
        columnsData.map((colData) => {
          const colDataDom = colData.id === id ?
            (
              <div className={`${styles.item_l} ${styles.item_l_three}`} key={id}>
                { item.is_bind === 0 ?
                  <p className={`${styles.text_link} ${styles.toLeft}`} onClick={this.props.bindWxIdent.bind(this, item)}>{colData.value.before}</p>
                  :
                  <p className={`${styles.text_nolink} ${styles.toLeft}`}>{colData.value.after}</p>
                }
              </div>
            )
            :
            '';
          return colDataDom;
        })
      )
      : '';
    return data;
  }
  render() {
    const { lists, loading } = this.state;
    const datalist = loading ?
      (<div className={styles.example}><Spin /></div>)
      :
      lists.map((item) => {
        return (
          <div key={item.id}>
            <Card>
              <li className={styles.root} key={item.id}>
                <div className={styles.item}>
                  {this.columnsFilter(item)}
                  {this.toolBarFilter(item)}
                </div>
              </li>
            </Card>
          </div>
        );
      });
    return (
      <div>
        {datalist}
      </div>
    );
  }
}

export default MemberLists;

