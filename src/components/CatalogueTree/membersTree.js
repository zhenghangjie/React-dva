import React from 'react';
import { Tree, Input, Button } from 'antd';
import _ from 'lodash';
import { getUrlPara } from '../../utils/utils.js';
import styles from './membersTree.less';
import './index.less';


const { TreeNode } = Tree;
const { Search } = Input;

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i += 1) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

class CatalogueTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      selectedTreeNode: [],
      treeData: this.props.gData, // 树目录数组
    };
  }
  componentWillMount() {
    const { treeData } = this.state;
    // 没有指向目录，默认到第一项所有成员
    const categoryId = getUrlPara('categoryId') || (treeData.length && treeData[0].key);
    if (categoryId) {
      // 设置当前选中节点标题
      this.getCurrentItem(categoryId);
      this.setState({
        selectedTreeNode: [`${categoryId}`],
      }, () => {
        this.expandTreeByKey(categoryId);
      });
    }
  }
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onSelect = (selectedKeys) => {
    // TODO 根据key值获取title 返回父级改变当前选定项
    if (selectedKeys.length) {
      // 设置当前选中节点标题
      this.getCurrentItem(selectedKeys[0]);
      this.props.selectTree(selectedKeys);
      this.setState({
        selectedTreeNode: selectedKeys,
      });
    }
  }
  onChange = (e) => {
    const { treeData } = this.state;
    const { value } = e.target;
    const expandedKeys = this.setGenerateList(treeData).map((item) => {
      if (item.title.indexOf(value) > -1) {
        return getParentKey(item.key, treeData);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }
  // 设置当前选中节点标题
  getCurrentItem = (selectedKeyNum) => {
    const { treeData } = this.state;
    const currentTitle = _.find(this.setGenerateList(treeData), (o) => {
      return parseInt(o.key, 10) === parseInt(selectedKeyNum, 10);
    });
    if (currentTitle) {
      this.props.setCurrentTitle(currentTitle);
    }
  }
  // 目录数据格式化（用于搜索）
  setGenerateList = (data) => {
    const dataList = [];
    const generateList = (list) => {
      for (let i = 0; i < list.length; i += 1) {
        const node = list[i];
        const { key, title } = node;
        dataList.push({ key, title });
        if (node.children) {
          generateList(node.children, node.key);
        }
      }
    };
    generateList(data);
    return dataList;
  }
  // 设置当前目录码数量
  setCatagoryNum = (id, type) => {
    const { treeData } = this.state;
    const listFilter = (list) => {
      for (let i = 0; i < list.length; i += 1) {
        const node = list[i];
        if (parseInt(node.key, 10) === parseInt(id, 10)) {
          if (type === 'del') {
            node.num -= 1;
            if (node.type !== 'all') {
              list[0].num -= 1;
            }
          } else {
            node.num += 1;
            if (node.type !== 'all') {
              list[0].num += 1;
            }
          }
          break;
        }
        if (node.children) {
          listFilter(node.children);
        }
      }
      return list;
    };
    this.setState({
      treeData: listFilter(treeData),
    });
  }
  // 根据key展开对应项
  expandTreeByKey = (key) => {
    const { treeData } = this.state;
    const expandedKeys = this.setGenerateList(treeData).map((item) => {
      if (item.key.toString().indexOf(key) > -1) {
        return getParentKey(item.key, treeData);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      autoExpandParent: true,
    });
  }
  // 添加根目录
  addDepartment = () => {
    // const { treeData } = this.state;
    this.props.addDepartment((treeData, id) => {
      this.setState({
        treeData,
      }, () => {
        // 设置当前选中节点标题
        this.getCurrentItem(id);
        this.props.selectTree([`${id}`]);
        this.setState({
          selectedTreeNode: [`${id}`],
        });
      });
    });
  }
  // 修改目录名称
  updateDepartmentTitle = (value, id, callback) => {
    const { treeData } = this.state;
    const updateDepartmentFilter = (objParam, selectedKey) => {
      for (const i in objParam) {
        if (parseInt(objParam[i].key, 10) === parseInt(selectedKey, 10)) {
          objParam[i].title = value;
          break;
        } else if (objParam[i].children) {
          updateDepartmentFilter(objParam[i].children, selectedKey, value);
        }
      }
      return objParam;
    };
    this.setState({
      treeData: updateDepartmentFilter(_.cloneDeep(treeData), id, value),
    }, () => {
      this.getCurrentItem(id);
      if (callback) {
        callback(this.state.treeData);
      }
    });
  }
  // 删除目录
  deleteDepartmentTitle = (id, callback) => {
    const { treeData } = this.state;
    let parentId;
    const deleteDepartmentFilter = (objParam, selectedKey, pid) => {
      for (const i in objParam) {
        if (parseInt(objParam[i].key, 10) === parseInt(selectedKey, 10)) {
          if (pid) {
            parentId = pid;
          } else {
            parentId = objParam[0].key;
          }
          objParam.splice(i, 1);
          break;
        } else if (objParam[i].children) {
          deleteDepartmentFilter(objParam[i].children, selectedKey, objParam[i].key);
        }
      }
      return objParam;
    };
    this.setState({
      treeData: deleteDepartmentFilter(_.cloneDeep(treeData), id),
    }, () => {
      // 设置当前选中节点标题
      this.getCurrentItem(parentId);
      this.props.selectTree([`${parentId}`]);
      this.setState({
        selectedTreeNode: [`${parentId}`],
      });
      if (callback) {
        callback(this.state.treeData);
      }
    });
  }
  // 根据根节点添加子目录
  addSonDepartment = (treeData, id) => {
    this.setState({
      treeData,
    }, () => {
      new Promise((resolve) => {
        this.expandTreeByKey(id);
        resolve();
      }).then(() => {
        // 设置当前选中节点标题
        this.getCurrentItem(id);
        this.props.selectTree([`${id}`]);
        this.setState({
          selectedTreeNode: [`${id}`],
        });
      });
    });
  }
  render() {
    const {
      searchValue, // 搜索内容
      expandedKeys, // 展开的节点
      autoExpandParent, // 需要自动展开的节点
      treeData, // 树数据
      selectedTreeNode, // 选中树节点key
    } = this.state;
    const loop = data => data.map((item) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const itemNum = item.num;
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {`${afterStr} • ${itemNum}`}
        </span>
      ) : <span>{item.title}</span>;
      if (item.children) {
        return (
          <TreeNode key={item.key} title={title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={title} />;
    });
    return (
      <div>
        <Search style={{ marginBottom: 16 }} placeholder="搜索" onChange={this.onChange} />
        {
          treeData.length > 0 &&
          <Tree
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={this.onSelect}
            defaultSelectedKeys={selectedTreeNode}
            selectedKeys={selectedTreeNode}
          >
            {loop(treeData)}
          </Tree>
        }
        <div className={styles.btnContent}>
          <Button
            className={styles.addBtn}
            onClick={this.addDepartment.bind(this)}
          >
            <i className="anticon anticon-cli-add-1" />{this.props.textAdd}
          </Button>
        </div>
      </div>
    );
  }
}

export default CatalogueTree;
