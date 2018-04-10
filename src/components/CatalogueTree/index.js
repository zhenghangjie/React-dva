import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Tree, Button, Input, Spin, message, Modal } from 'antd';
import indexOf from 'lodash/indexOf';
import uniq from 'lodash/uniq';
import {
  editValueById,
  findItemById,
  getUrlPara,
  findItemByOrgModuleId,
  findHasChildrenItem,
  AddChildrenItem,
  CutParagraph,
  deleteById,
} from '../../utils/utils.js';

import styles from './index.less';

class CatalogueTree extends React.Component {
  state = {
    gData: this.props.tree_data, // 目录树的数据
    cacheTreeData: this.props.cache_tree_data,
    expandedKeys: this.props.expandedKeys === undefined ? [] : this.props.expandedKeys, // 默认展开那一个目录
    current_id: [], // 当前选中的目录的id
    edit_status: false, // 目录是否正在编辑
    // TreeDatasByRoot: this.props.TreeDatasByRoot, // 通过目录获取目录下的数据
    isMove: this.props.isMove, // 是否是移动按钮点过来的目录树
    current_org_module_id: 1,
    TreeRootId: this.props.TreeRootId,
    qrcodeCount: this.props.qrcode_count,
    RootCatalogLoading: this.props.RootCatalogLoading,
    CurRootCatalogLoading: this.props.CurRootCatalogLoading, // 添加根目录时候的loading
    editCatalogName: '', // 编辑修改活码名称的名字
    // defaultId: this.props.defaultId,
  }
  componentWillMount() {
    const { isMove, gData } = this.state;
    const { dispatch, MoveCatelog, location } = this.props;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);

    if (search === '' && cataId === '') { // 没有catelogid时，默认选中第一个跟目录,重定向到第一个根目录
      dispatch(routerRedux.push(`/active/activecode?categoryId=${this.props.tree_data[0].id}`));
      this.setState({ current_id: [`${gData[0].id}`] });
      if (isMove) {
        MoveCatelog(this.props.tree_data[0].id);
      }
      const json = [];
      const Item = findItemById(this.props.tree_data, gData[0].id, json);
      if (Item && Item.length > 0) {
        this.setState({ current_org_module_id: Item[0].org_module_id });
      }
    } else {
      const catalogId = parseInt(cataId, 10);
      this.setState({ current_id: [`${catalogId}`] });
      if (isMove) {
        MoveCatelog(catalogId);
      }
      const json = [];
      const Item = findItemById(gData, catalogId, json);
      if (Item && Item.length > 0) {
        this.setState({ current_org_module_id: Item[0].org_module_id });
      }
    }
  }
  componentDidMount() {
  }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    if (this.props !== nextProps) {
      this.setState({
        gData: nextProps.tree_data,
        // TreeDatasByRoot: nextProps.TreeDatasByRoot,
        cacheTreeData: nextProps.cache_tree_data,
        TreeRootId: nextProps.TreeRootId,
        qrcodeCount: nextProps.qrcode_count,
        RootCatalogLoading: nextProps.RootCatalogLoading,
        CurRootCatalogLoading: nextProps.CurRootCatalogLoading,
      });
      if (nextProps.expandedKeys && nextProps.expandedKeys !== undefined) {
        this.setState({
          expandedKeys: nextProps.expandedKeys,
        });
      }
      if (nextProps.defaultId && nextProps.defaultId !== this.props.defaultId) {
        this.setState({
          current_id: [`${nextProps.defaultId}`],
        });
      }
    }
  }

  /** 移动操作时，触发的事件
   *  移动时的借口传值，向下移动时取睡的下，向上移动时取谁的上。（移动按照这个思路做）
   */
  onDrop = (info) => {
    // const { dispatch } = this.props;
    const { cacheTreeData } = this.state;
    const dropKey = info.node.props.eventKey;
    const orgModuleId = info.node.props.dataRef.org_module_id;
    const dragKey = parseInt(info.dragNode.props.eventKey, 10);

    const isRoot = this.isCatelogRootId(dragKey); // 判断是否是根节点
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.id === parseInt(key, 10)) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };

    let data; // 如果有缓存时取缓存data，如果没有，取gData。
    if (cacheTreeData && cacheTreeData.length > 0) {
      data = [...this.state.cacheTreeData];
    } else {
      data = [...this.state.gData];
    }

    let dragObj;
    if (info.dropToGap) {
      loop(data, dragKey, (val) => {
        dragObj = val;
      });
      let ar;
      let i;
      let prItem;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
        prItem = item;
      });
      if (dropPosition === -1) { // 移动到空隙,移动到下空隙
        if (isRoot === -1) { // =============子目录节点===================
          const json = [];
          let Alldata; // 如果有缓存时取缓存data，如果没有，取gData。

          if (cacheTreeData && cacheTreeData.length > 0) {
            Alldata = [...this.state.cacheTreeData];
          } else {
            Alldata = [...this.state.gData];
          }

          const curParItem =
            findItemById(Alldata, dragObj.parent_id, json).concat(); // 找到移动后新的父节点item。

          const childrenArray = curParItem[0].children; // 移动后，当前目录的所有的元素。

          if (i === 0) { // 移动到了第一个！！
            // ['移动的点': dragObj; '移动的点的下一个': childrenArray[i + 1];'移动新目录里面的节点': prItem]

            if (dragObj.parent_id !== prItem.parent_id) { // 判断是否是同一级目录下面的上下移动
              // 通过prItem和dragObj的parent_id, 不是同一级
              const jsons = [];
              const curPItem = findItemById(data, prItem.parent_id, jsons); // 此元素现在的父元素;
              const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
              // 判断是否超过层级
              if (isOver === 1) {
                message.error('目录层级超过三级');
              } else {
                loop(data, dragKey, (val, index, arr) => {
                  arr.splice(index, 1);
                });
                // 目录层级超没过三级;
                dragObj.level = prItem.level;
                this.DropCatalogInOut(
                  prItem.parent_id, dragObj.id, orgModuleId, data, dragObj, prItem); // 移入移出节点
              }
            } else {
              loop(data, dragKey, (val, index, arr) => {
                arr.splice(index, 1);
              });
              ar.splice(i, 0, dragObj);
              this.moveChildCatalogTree(
                dragObj.id, childrenArray[i + 1].id, orgModuleId, data); // 平级移动节点
            }
          } else if (i !== 0) { // 移动到了不是第一个！！
            // ['移动的点', dragObj; '移动的点的上一个', childrenArray[i - 1]; '移动的点的下一个', childrenArray[i + 1]]
            if (dragObj.parent_id !== prItem.parent_id) { // 判断是否是同一级目录下面的上下移动
              // 不是同一级目录下面的上下移动
              if (prItem.parent_id === 0) { // 移动到根目录
                message.error('子目录暂不支持移动到根目录');
              } else {
                const jsons = [];
                const curPItem =
                  findItemById(data, prItem.parent_id, jsons); // 找到现在Item的父级元素，为了拿到他的level。

                const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
                // 是否有超过三级的前端判断，这里需要加判断，如果根目录下面的事没有level的。
                if (isOver === 1) {
                  message.error('目录层级超过三级');
                } else {
                  loop(data, dragKey, (val, index, arr) => {
                    arr.splice(index, 1);
                  });
                  this.DropCatalogInOut(
                    prItem.parent_id, dragObj.id, orgModuleId, data, dragObj, prItem);
                }
              }
            } else { // 是同一级目录下面的上下移动
              loop(data, dragKey, (val, index, arr) => {
                arr.splice(index, 1);
              });

              const Direction =
              this.moveDirection(dragObj.node_left, childrenArray[i - 1].node_left); // 判断上移还是下移
              if (Direction === 1) { // 上移动
                ar.splice(i, 0, dragObj);
                this.moveChildCatalogTree(
                  dragObj.id, childrenArray[i + 1].id, orgModuleId, data);
              } else if (Direction === 0) { // 下移动
                ar.splice(i - 1, 0, dragObj);
                if (childrenArray[i - 2] && childrenArray[i - 2] !== undefined) { // 防止报错，第一个移动到第一个
                  this.moveChildCatalogTree(
                    dragObj.id, childrenArray[i - 2].id, orgModuleId, data);
                }
              }
            }
          }
        } else { // =============根节点===================
          const isDefault = dragObj.is_default;
          if (isDefault === 0) {
            if (i === 0) {
              if (dragObj.parent_id !== prItem.parent_id) { // 判断是否是同一级目录下面的上下移动
                // 不是同一级
                const jsons = [];
                const curPItem = findItemById(data, prItem.parent_id, jsons);
                // 找到现在Item的父级元素，为了拿到他的level。
                const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
                // 是否有超过三级的前端判断，这里需要加判断，如果根目录下面的事没有level的。
                if (isOver === 1) {
                  message.error('目录层级超过三级');
                } else {
                  loop(data, dragKey, (val, index, arr) => {
                    arr.splice(index, 1);
                  });
                  this.moveInOutRootCatalogTree(
                    prItem.parent_id, dragObj.org_module_id, prItem.org_module_id, data);
                }
              } else {
                ar.splice(i, 0, dragObj);
                this.moveRootCatalogTree(
                  dragObj.org_module_id, ar[i + 1].org_module_id, 1, data);
              }
            } else if (i !== 0) { // 同一级的移动
              if (dragObj.parent_id !== prItem.parent_id) { // 判断是否是同一级目录下面的上下移动
                const jsons = [];
                const curPItem = findItemById(data, prItem.parent_id, jsons);
                const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
                if (isOver === 1) {
                  message.error('目录层级超过了三级');
                } else {
                  loop(data, dragKey, (val, index, arr) => {
                    arr.splice(index, 1);
                  });
                  this.moveInOutRootCatalogTree( // 根目录移入移出
                    prItem.parent_id, dragObj.org_module_id, prItem.org_module_id, data);
                }
              } else {
                const Direction = this.moveDirection(dragObj.sort, ar[i - 1].sort); // 判断向上还是向下移动
                if (Direction === 1) { // 上移动
                  ar.splice(i, 0, dragObj);
                  this.moveRootCatalogTree(
                    dragObj.org_module_id, ar[i + 1].org_module_id, 1, data);
                } else if (Direction === 0) { // 下移动
                  ar.splice(i, 0, dragObj);
                  if (ar[i - 1] && ar[i - 1] !== undefined) {
                    this.moveRootCatalogTree(
                      dragObj.org_module_id, ar[i - 1].org_module_id, 1, data);
                  }
                }
              }
            }
          } else {
            message.error('默认目录不能移动');
          }
        }
      } else if (dropPosition !== -1) {
        // 上空隙
        if (isRoot === -1) { // =============子目录节点===================
          // ['移动的点': dragObj; '移动的点的上一个': childrenArray[i];'移动新目录里面的节点': prItem]
          const json = [];
          const curParItem = findItemById(this.state.gData, dragObj.parent_id, json).concat();
          const childrenArray = curParItem[0].children;

          if (i === childrenArray.length - 1) { // 移动到了最后一个
            if (dragObj.parent_id !== prItem.parent_id) { // 不是同一级
              const jsons = [];
              const curPItem = findItemById(data, prItem.parent_id, jsons);
              const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
              if (isOver === 1) {
                message.error('目录层级超过三级');
              } else {
                loop(data, dragKey, (val, index, arr) => {
                  arr.splice(index, 1);
                });
                this.DropCatalogInOut(
                  prItem.parent_id, dragObj.id, orgModuleId, data, dragObj, prItem);
              }
            } else {
              loop(data, dragKey, (val, index, arr) => {
                arr.splice(index, 1);
              });
              ar.splice(i, 0, dragObj);
              this.moveChildCatalogTree(dragObj.id, childrenArray[i - 1].id, orgModuleId, data);
            }
          } else if (i !== childrenArray.length - 1) {
            // 移动的不是最后一个数据
            if (dragObj.parent_id !== prItem.parent_id) { // 不是同一级
              if (prItem.parent_id === 0) { // 移动到的目录是根目录
                message.error('子目录暂不支持移动到根目录');
              } else {
                const jsons = [];
                const curPItem = findItemById(data, prItem.parent_id, jsons);
                const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
                if (isOver === 1) {
                  message.error('目录超过了3级');
                } else {
                  loop(data, dragKey, (val, index, arr) => {
                    arr.splice(index, 1);
                  });
                  this.DropCatalogInOut(
                    prItem.parent_id, dragObj.id, orgModuleId, data, dragObj, prItem);
                }
              }
            } else {
              loop(data, dragKey, (val, index, arr) => {
                arr.splice(index, 1);
              });
              const Direction =
                this.moveDirection(dragObj.node_left, childrenArray[i].node_left); // 判断上下移动方向
              if (Direction === 1) { // 上移动
                ar.splice(i + 1, 0, dragObj);
                if (childrenArray[i + 2] && childrenArray[i + 2] !== undefined) {
                  this.moveChildCatalogTree(
                    dragObj.id, childrenArray[i + 2].id, orgModuleId, data);
                }
              } else if (Direction === 0) { // 下移动
                ar.splice(i, 0, dragObj);
                this.moveChildCatalogTree(
                  dragObj.id, childrenArray[i - 1].id, orgModuleId, data);
              }
            }
          }
        } else { // =============根节点===================
          const isDefault = dragObj.is_default;
          if (isDefault === 0) {
            if (i === this.state.gData.length - 1) { // 最后一个
              if (dragObj.parent_id !== prItem.parent_id) {
                // message.error('不同级不能移动');
                const jsons = [];
                const curPItem = findItemById(data, prItem.parent_id, jsons);
                const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
                if (isOver === 1) {
                  message.error('目录层级超过三级');
                } else {
                  loop(data, dragKey, (val, index, arr) => {
                    arr.splice(index, 1);
                  });
                  // message.success('没超过三级');
                  this.moveInOutRootCatalogTree(
                    prItem.parent_id, dragObj.org_module_id, prItem.org_module_id, data);
                }
              } else {
                loop(data, dragKey, (val, index, arr) => {
                  arr.splice(index, 1);
                });
                ar.splice(i + 1, 0, dragObj);
                this.moveRootCatalogTree(
                  dragObj.org_module_id, ar[i - 1].org_module_id, 1, data);
              }
            } else if (i !== this.state.gData.length - 1) { // 移动到不是最后一个
              // [移动的点: dragObj, 移动的点的上一个: ar[i], 下一个元素: ar[i + 2]]
              if (dragObj.parent_id !== prItem.parent_id) { // 不同级
                const jsons = [];
                const curPItem = findItemById(data, prItem.parent_id, jsons);
                const isOver = this.isOverLevel(curPItem[0].level, dragObj.children_level);
                if (isOver === 1) {
                  message.error('目录层级超过三级');
                } else {
                  loop(data, dragKey, (val, index, arr) => {
                    arr.splice(index, 1);
                  });
                  this.moveInOutRootCatalogTree(
                    prItem.parent_id, dragObj.org_module_id, prItem.org_module_id, data);
                }
              } else {
                loop(data, dragKey, (val, index, arr) => {
                  arr.splice(index, 1);
                });
                const Direction = this.moveDirection(dragObj.sort, ar[i].sort);
                if (Direction === 1) { // 上移动
                  ar.splice(i + 1, 0, dragObj);
                  if (ar[i + 2] && ar[i + 2] !== undefined) {
                    this.moveRootCatalogTree(
                      dragObj.org_module_id, ar[i + 2].org_module_id, 1, data);
                  }
                } else if (Direction === 0) { // 下移动
                  ar.splice(i, 0, dragObj);
                  this.moveRootCatalogTree(
                    dragObj.org_module_id, ar[i - 1].org_module_id, 1, data);
                }
              }
            }
          } else {
            message.error('默认目录不能移动');
          }
        }
      }
    } else { // 移动进目录里面
      loop(data, dropKey, (item) => {
        loop(data, dragKey, (val) => {
          dragObj = val;
        }); // 拿到移动的item

        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        dragObj.parent_id = item.id;
        if (isRoot === -1) { // =============子目录节点===================
          const isOver = this.isOverLevel(item.level, dragObj.children_level);
          if (isOver === 1) {
            message.error('目录层级超过三级');
          } else {
            // 子目录
            this.DropCatalogInOut(
              dragObj.parent_id, dragKey, orgModuleId, data, dragObj, item);
          }
        } else { // =============父目录节点===================
          const isDefault = dragObj.is_default;
          if (isDefault === 0) {
            const isOver = this.isOverLevel(item.level, dragObj.children_level);
            if (isOver === 1) {
              message.error('目录层级超过三级');
            } else if (isOver !== 1) {
              if (item.category_root_id && item.category_root_id !== undefined) {
                const newsData = deleteById(data, dragObj.id).concat();
                this.moveInOutRootCatalogTree(
                  item.category_root_id, dragObj.org_module_id, item.org_module_id, newsData);
                // 根节点移动到根节点
              } else {
                const newsData = deleteById(data, dragObj.id).concat();
                this.moveInOutRootCatalogTree(
                  item.id, dragObj.org_module_id, item.org_module_id, newsData);
                // 根节点移动到子节点
              }
            }
          } else {
            message.error('默认目录不能移动');
          }
        }
      });
    }
    // console.log('==============data,', data);
    // this.setState({
    //   gData: data,
    //   cacheTreeData: data,
    // });
  }

  onExpand = (expandedKeys) => {
    const { dispatch } = this.props;
    // this.setState({
    //   expandedKeys: uniq(expandedKeys, true),
    // });
    dispatch({
      type: 'catelog/changeExpandedKeys',
      payload: { pid: expandedKeys },
    }); // 改变默认展开的值
    this.setState({
      expandedKeys,
    });
  }

  // 点击节点动态加载数据
  onLoadData = (treeNode) => {
    const { dispatch, changeLists } = this.props;
    const { isMove, cacheTreeData } = this.state;
    const { org_module_id } = treeNode.props.dataRef;

    if (!isMove) {
      changeLists(); // 改变目录时取消全选状态
    }

    return new Promise((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }

      dispatch({
        type: 'user/fetchTreeDataByRoot',
        payload: { org_id: 1, org_module_id },
        callback: () => {
          if (this.props.TreeDatasByRoot.code === 1) {
            // this.setState({ TreeDatasByRoot: this.props.TreeDatasByRoot.data.children });
            setTimeout(() => {
              treeNode.props.dataRef.children = this.props.TreeDatasByRoot.data.children.concat();
              this.setState({
                gData: [...this.state.gData],
                cacheTreeData: [...this.state.gData],
                current_org_module_id: treeNode.props.dataRef.org_module_id,
              });
              if (cacheTreeData && cacheTreeData.length > 0) {
                // console.log('=====changeCacheTreeData========');
                this.changeCacheTreeData(this.state.cacheTreeData);
              } else {
                // console.log('=====changeTreeData========');
                this.changeCacheTreeData(this.state.gData); // 缓存树的数据
              }
              resolve();
            }, 1000);
          } else {
            message.error(this.props.TreeDatasByRoot.msg.text);
          }
        },
      });
    });
  }

  /** 重新获取拉去根节点目录数据 getMenuList
   *  @param {Array} data 需要处理的根节点的数据
   */
  getRootCatalogAgain = (data) => {
    const { dispatch } = this.props;
    const { cacheTreeData } = this.state;
    dispatch({
      type: 'user/fetchCatrgoryTreeData', // 获取根节点的数据
      payload: { module_id: 1 },
      callback: () => {
        if (this.props.RootCatalogIdMsg.code === 1) {
          // message.success('封装函数时的重新拉取重新拉取树成功');

          if (cacheTreeData && cacheTreeData.length > 0) {
            const json = [];
            const HasChildrenItem = findHasChildrenItem(data, json);
            const newData =
              AddChildrenItem(this.props.RootCatalogIdMsg.data.menu_list, HasChildrenItem).concat();
            // console.log('newData=============', newData);
            // 此数组是为了解决根节点目录移动之后，子目录消失的问题
            this.changeCacheTreeData(newData);
            this.setState({
              gData: newData,
              cacheTreeData: newData,
            });
          } else {
            // this.changeCacheTreeData(this.props.RootCatalogIdMsg.data.menu_list);
            this.setState({
              gData: this.props.RootCatalogIdMsg.data.menu_list,
              cacheTreeData: this.props.RootCatalogIdMsg.data.menu_list,
            });
          }
        } else {
          message.error(this.props.RootCatalogIdMsg.msg.text);
        }
      },
    }); // 拉取根节点
  }

  /** 重新获取拉去根节点下面子目录的数据 getCatalogTree
   *  @param {Number} orgId org_id 企业的id // 这里没传，后台读session
   *  @param {Number} orgModuleId org_module_id
   *  @param {Array} data 需要处理的根节点的数据
   */
  getChildCatalogByRootid = (orgModuleId, data) => {
    const { dispatch, cacheTreeData } = this.props;
    const { expandedKeys } = this.state;
    dispatch({
      type: 'catelog/changeExpandedKeys',
      payload: { pid: uniq(expandedKeys, true) },
    }); // 改变默认展开的值
    dispatch(
      {
        type: 'user/fetchTreeDataByRoot',
        payload: { org_module_id: orgModuleId },
        callback: () => {
          if (this.props.TreeDatasByRoot.code === 1) {
            // message.success('封装函数时子目录树拉取成功');
            const json = [];
            const curItem = findItemByOrgModuleId(data, orgModuleId, json);
            curItem[0].children = this.props.TreeDatasByRoot.data.children;

            if (cacheTreeData && cacheTreeData.length > 0) {
              this.changeCacheTreeData(data); // 改变缓存的数据
            } else {
              this.changeCacheTreeData(data); // 改变缓存的数据
            }

            this.setState({
              gData: data,
              current_org_module_id: orgModuleId,
              cacheTreeData: data,
            });
          } else {
            // message.error('树拉取失败');
            message.error(this.props.TreeDatasByRoot.msg.text);
          }
        },
      }); // 重新拉去树
  }

  // 添加目录的操作
  addChild = (e) => {
    if (this.state.edit_status === true) {
      this.setState({
        edit_status: false,
      });
    } else {
      const id = e.target.getAttribute('data_id');
      const orgModuleId = e.target.getAttribute('data_org_module_id');

      new Promise((resolve) => {
        this.setState({
          current_id: [`${id}`],
          current_org_module_id: parseInt(orgModuleId, 10),
        });
        resolve();
      }).then(() => {
        // 阻止事件冒泡
        const {
          gData,
          current_id,
          isMove,
          current_org_module_id,
          cacheTreeData,
          expandedKeys,
        } = this.state;
        const { dispatch, getCatalogId } = this.props;
        const curId = parseInt(current_id.toString(), 10);
        const isRoot = this.isCatelogRootId(curId);

        if (!isMove) {
          if (isRoot === -1) {
            dispatch(
              {
                type: 'user/AddCatalog',
                payload: { parent_id: curId },
                callback: () => {
                  this.props.AddtreeMsg.data.parent_id
                    =
                    parseInt(this.props.AddtreeMsg.data.parent_id, 10);
                  this.props.AddtreeMsg.data.id
                    =
                    parseInt(this.props.AddtreeMsg.data.id, 10);
                  this.props.AddtreeMsg.data.children_count = 0; // 下面没有子目录

                  // 添加自动触发onexpend函数
                  expandedKeys.push(`${this.props.AddtreeMsg.data.parent_id}`);

                  if (this.props.AddtreeMsg.code === 1) {
                    message.success('新增目录成功');
                    if (cacheTreeData && cacheTreeData.length > 0) {
                      // console.log('cacheTreeData');
                      this.getChildCatalogByRootid(current_org_module_id, cacheTreeData);
                      // 重新拉取根节点下面的数据
                    } else {
                      // console.log('gData');
                      this.getChildCatalogByRootid(current_org_module_id, gData); // 重新拉取根节点下面的数据
                    }
                    // 添加自动触发onexpend函数
                    this.onExpand(expandedKeys);
                    getCatalogId(this.props.AddtreeMsg.data.id);
                    dispatch(routerRedux.push(`/active/activecode?categoryId=${this.props.AddtreeMsg.data.id}`));
                    this.setState(
                      {
                        current_id: [`${this.props.AddtreeMsg.data.id}`],
                        edit_status: true,
                        current_org_module_id: this.props.AddtreeMsg.data.org_module_id,
                      });
                  } else {
                    message.error('新增目录失败');
                  }
                },
              });
          } else {
            dispatch(
              {
                type: 'user/AddCatalog',
                payload: { tree_data: gData, parent_id: curId },
                callback: () => {
                  this.props.AddtreeMsg.data.parent_id
                    =
                    parseInt(this.props.AddtreeMsg.data.parent_id, 10);
                  this.props.AddtreeMsg.data.id
                    =
                    parseInt(this.props.AddtreeMsg.data.id, 10);
                  this.props.AddtreeMsg.data.children_count = 0; // 下面没有子目录
                  // 添加自动触发onexpend函数
                  expandedKeys.push(`${this.props.AddtreeMsg.data.parent_id}`);

                  if (this.props.AddtreeMsg.code === 1) {
                    message.success('新增目录成功');
                    if (cacheTreeData && cacheTreeData.length > 0) {
                      // console.log('cacheTreeData');
                      this.getChildCatalogByRootid(current_org_module_id, cacheTreeData);
                      this.getRootCatalogAgain(cacheTreeData);
                      // 重新拉取根节点下面的数据
                    } else {
                      // console.log('gData');
                      this.getChildCatalogByRootid(current_org_module_id, gData); // 重新拉取根节点下面的数据
                      this.getRootCatalogAgain(gData);
                    }
                    this.setState(
                      {
                        current_id: [`${this.props.AddtreeMsg.data.id}`],
                        edit_status: true,
                        current_org_module_id: this.props.AddtreeMsg.data.org_module_id,
                      });
                    // 添加自动触发onexpend函数
                    this.onExpand(expandedKeys);
                    getCatalogId(this.props.AddtreeMsg.data.id);
                    dispatch(routerRedux.push(`/active/activecode?categoryId=${this.props.AddtreeMsg.data.id}`));
                  } else {
                    message.error(this.props.AddtreeMsg.msg.text);
                  }
                },
              });
          }
        }
      });
    }
  }
  // 目录的删除操作
  delete = (e) => {
    if (this.state.edit_status === true) {
      this.setState({
        edit_status: false,
      });
    } else {
      const curId = e.target.getAttribute('data_id');
      new Promise((resolve) => {
        this.setState({
          current_id: [`${curId}`],
        });
        resolve();
      }).then(() => {
        // 阻止事件冒泡
        const { current_id,
          gData,
          current_org_module_id,
          cacheTreeData,
          expandedKeys,
        } = this.state;
        const { dispatch, getCatalogId } = this.props;
        const id = parseInt(current_id.toString(), 10);
        const isRoot = this.isCatelogRootId(id);
        const that = this;

        if (isRoot === -1) { // 不是根节点
          Modal.confirm({
            title: '确定删除这个目录?',
            content: '目录删除后，无法恢复！',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
              dispatch({
                type: 'user/DeleteCatalog',
                payload: { tree_data: gData, id },
                callback: () => {
                  if (that.props.DeletetreeMsg.code === 1) {
                    message.success('子目录删除成功');
                    if (cacheTreeData && cacheTreeData.length > 0) {
                      that.getChildCatalogByRootid(current_org_module_id, cacheTreeData);
                      // 重新拉去根节点树数据
                      that.getRootCatalogAgain(cacheTreeData); // 重新拉去根的根节点
                      dispatch(routerRedux.push(`/active/activecode?categoryId=${cacheTreeData[0].id}`));
                      getCatalogId(cacheTreeData[0].id);
                      that.setState({ current_id: [`${cacheTreeData[0].id}`] });
                    } else {
                      that.getChildCatalogByRootid(current_org_module_id, gData); // 重新拉去根节点树数据
                      that.getRootCatalogAgain(gData); // 重新拉去根的根节点
                      dispatch(routerRedux.push(`/active/activecode?categoryId=${gData[0].id}`));
                      getCatalogId(gData[0].id);
                      that.setState({ current_id: [`${gData[0].id}`] });
                    }
                    // 添加自动触发onexpend函数
                    that.onExpand(expandedKeys);
                  } else {
                    message.error(that.props.DeletetreeMsg.msg.text);
                  }
                },
              });
            },
            onCancel() {
              // console.log('Cancel');
            },
          });
        } else { // 根节点
          Modal.confirm({
            title: '确定删除这个目录?',
            content: '目录删除后，无法恢复！',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
              dispatch({
                type: 'user/DeleteRootCatalog',
                payload: { node_id: id },
                callback: () => {
                  if (that.props.DeleteRootCatalogMsg.code === 1) {
                    message.success('根目录删除成功');
                    if (cacheTreeData && cacheTreeData.length > 0) {
                      that.getRootCatalogAgain(cacheTreeData); // 重新拉去根的根节点
                      dispatch(routerRedux.push(`/active/activecode?categoryId=${cacheTreeData[0].id}`));
                      getCatalogId(cacheTreeData[0].id);
                      that.setState({ current_id: [`${cacheTreeData[0].id}`] });
                    } else {
                      that.getRootCatalogAgain(gData); // 重新拉去根的根节点
                      dispatch(routerRedux.push(`/active/activecode?categoryId=${gData[0].id}`));
                      getCatalogId(gData[0].id);
                      that.setState({ current_id: [`${gData[0].id}`] });
                    }
                  } else {
                    message.error(that.props.DeleteRootCatalogMsg.msg.text);
                  }
                },
              });
            },
            onCancel() {
              // console.log('Cancel');
            },
          });
        }
      });
    }
  }
  // 目录的编辑操作
  edit = (e) => {
    if (this.state.edit_status === true) {
      this.setState({
        edit_status: false,
      });
    } else {
      const id = e.target.getAttribute('data_id');
      const input = document.getElementById(id);
      window.setTimeout(() => {
        input.focus();
      }, 0);
      new Promise((resolve) => {
        this.setState({
          current_id: [`${id}`],
        });
        resolve();
      }).then(() => {
        // 阻止事件冒泡
        this.setState({ edit_status: true });
      });
    }
  }
  // focusClick = (e) => {

  //   const curId = parseInt(this.state.current_id.toString(), 10);
  //   const  user = document.getElementById(curId);
  //   user.focus();
  //   console.log('1222222222222222222', user);

  // }
  // 编辑操作时，目录名称的操作。
  InputChange = (e) => {
    this.setState({ editCatalogName: e.target.value });
  }
  // focus时input的改变edit的状态
  inputFocus = (e) => {
    this.setState({ editCatalogName: e.target.value });
  }
  // blur时input的改变edit的状态
  inputBlur = () => {
    const { gData, current_id, isMove, cacheTreeData, editCatalogName } = this.state;
    const { dispatch } = this.props;
    const curId = parseInt(current_id.toString(), 10);
    const isRoot = this.isCatelogRootId(curId);
    if (isRoot === -1) {
      if (!isMove) {
        if (editCatalogName !== '') {
          dispatch(
            {
              type: 'user/EditCatalog',
              payload: { new_title: editCatalogName, id: curId, tree_data: gData },
              callback: () => {
                if (this.props.EdittreeMsg.code === 1) {
                  let newTreeData;
                  if (cacheTreeData && cacheTreeData.length > 0) {
                    newTreeData = editValueById(cacheTreeData, curId, editCatalogName).concat();
                    this.changeCacheTreeData(newTreeData);
                  } else {
                    newTreeData = editValueById(gData, curId, editCatalogName).concat();
                    this.changeTreeData(newTreeData);
                  }
                  this.setState(
                    {
                      gData: newTreeData,
                      cacheTreeData: newTreeData,
                    });
                } else {
                  message.error(this.props.EdittreeMsg.msg.text);
                }
              },
            });
        } else {
          message.error('修改名称不能为空！！！');
        }
      }
    } else if (isRoot !== -1) {
      if (editCatalogName !== '') {
        dispatch(
          {
            type: 'user/EditRootCatalog',
            payload: { node_name: editCatalogName, node_id: curId },
            callback: () => {
              if (this.props.EditRootCatalogMsg.code === 1) {
                let newTreeData;
                if (cacheTreeData && cacheTreeData.length > 0) {
                  newTreeData = editValueById(cacheTreeData, curId, editCatalogName).concat();
                  this.changeCacheTreeData(newTreeData);
                } else {
                  newTreeData = editValueById(gData, curId, editCatalogName).concat();
                  this.changeTreeData(newTreeData);
                }
              } else {
                message.error(this.props.EdittreeMsg.msg.text);
              }
            },
          });
      } else {
        message.error('名称不能为空！！！');
      }
    }

    this.setState({ edit_status: false });
  }

  // 目录退出编辑
  removeEdit = () => {
    this.setState({ edit_status: false });
  }
  // 添加目录
  addCategory = () => {
    const { gData, isMove, cacheTreeData } = this.state;
    const { dispatch, moduleId, getCatalogId } = this.props;

    if (!isMove) {
      dispatch(
        {
          type: 'user/AddRootCatalog',
          payload: { module_id: moduleId },
          callback: () => {
            if (this.props.AddRootCatalogMsg.code === 1) {
              message.success('添加根目录成功');
              // console.log('===================================');
              // console.log(this.props.AddRootCatalogMsg);
              // console.log('===================================');
              // 将root_id 转成number
              this.props.AddRootCatalogMsg.data.data.category_root_id
                =
                parseInt(this.props.AddRootCatalogMsg.data.data.category_root_id, 10);
              // 添加id
              this.props.AddRootCatalogMsg.data.data.module_id
                =
                parseInt(this.props.AddRootCatalogMsg.data.data.module_id, 10);
              // 添加id
              this.props.AddRootCatalogMsg.data.data.org_module_id
                =
                parseInt(this.props.AddRootCatalogMsg.data.data.org_module_id, 10);
              // 添加level
              this.props.AddRootCatalogMsg.data.data.level = 1;
              // 添加id
              this.props.AddRootCatalogMsg.data.data.id
                =
                this.props.AddRootCatalogMsg.data.data.category_root_id;
              // 添加pid
              this.props.AddRootCatalogMsg.data.data.parent_id = 0;
              // let newTreeData;

              if (cacheTreeData && cacheTreeData.length > 0) { // 有缓存数据
                this.getRootCatalogAgain(cacheTreeData);
              } else { // 无缓存数据
                this.getRootCatalogAgain(gData); // 重新拉去根的根节点
              }
              this.setState(
                {
                  current_id: [`${this.props.AddRootCatalogMsg.data.data.id}`],
                  edit_status: true,
                  current_org_module_id: this.props.AddRootCatalogMsg.data.data.org_module_id,
                });
              getCatalogId(this.props.AddRootCatalogMsg.data.data.id);
              dispatch(routerRedux.push(`/active/activecode?categoryId=${this.props.AddRootCatalogMsg.data.data.id}`));
            } else {
              message.error(this.props.AddRootCatalogMsg.msg);
            }
          },
        });
    }
  }
  /** 点击select时的click函数
   *  @param {Array} selectedKeys 当前选中节点的id
   *  by fjw
   */
  handleClick = (selectedKeys, event) => {
    const { isMove } = this.state;
    const { dispatch, MoveCatelog, getCatalogId, changeCheckstatusBycatalog } = this.props;
    const catalogId = selectedKeys.toString();

    // const Pid = event.node.props.dataRef.id;
    // const pid = event.node.props.dataRef.parent_id;
    const orgModuleId = event.node.props.dataRef.org_module_id;

    if (this.state.edit_status === true) {
      this.setState({
        edit_status: false,
        current_id: selectedKeys,
      });
      if (isMove) {
        MoveCatelog(parseInt(catalogId, 10));
      } else {
        const catalog = parseInt(selectedKeys.toString(), 10);
        getCatalogId(catalog);
        changeCheckstatusBycatalog();
        dispatch(routerRedux.push(`/active/activecode?categoryId=${catalogId}`));
      }
    } else {
      this.setState(
        {
          current_id: selectedKeys,
          current_org_module_id: orgModuleId,
        });

      if (isMove) {
        MoveCatelog(parseInt(catalogId, 10));
      } else {
        const catalog = parseInt(selectedKeys.toString(), 10);
        getCatalogId(catalog);
        changeCheckstatusBycatalog();
        dispatch(routerRedux.push(`/active/activecode?categoryId=${catalogId}`));
      }
    }
  }

  /** 判断此节点是否为根节点
   *  @param {Number} id 目录id
   *  by fjw
   */
  isCatelogRootId = (id) => {
    const { TreeRootId } = this.state;
    const istrue = indexOf(TreeRootId, id);
    return istrue;
  }

  /** 判断上下移动方向
   *  @param {Number} curNodeLeft 当前的移动元素的node_left
   *  @param {Number} prevNodeLeft 移动元素的前一个的node_left
   *  by fjw
   */
  moveDirection = (curNodeLeft, prevNodeLeft) => {
    if (curNodeLeft > prevNodeLeft) {
      return 1; // 上移
    } else if (curNodeLeft < prevNodeLeft) {
      return 0; // 下移
    }
  }

  /** 上下移动子目录节点的树
   *  @param {Number} current_org_module_id 当前的移动元素id
   *  @param {Number} target_org_module_id  移动的目标元素id
   *  @param {Number} org_id 重新拉去树时候的org_id
   *  @param {Number} module_id 重新拉去树时候的module_id
   *  @param {Array} data 移动后的数据更新后的state；
   *  by fjw
   */
  moveChildCatalogTree = (currentNodeId, targetNodeId, orgModuleId, data) => {
    const { dispatch } = this.props;
    dispatch(
      {
        type: 'user/DropCatalogSibling',
        payload: { target_node_id: targetNodeId, current_node_id: currentNodeId },
        callback: () => {
          if (this.props.DropCatalogSiblingMsg.code === 1) {
            message.success('移动成功');
            this.getChildCatalogByRootid(orgModuleId, data); // 重新拉去根节点树数据
          } else {
            message.error(this.props.DropCatalogSiblingMsg.msg.text);
          }
        },
      });
  }

  /** 上下移动根节点的树
   *  @param {Number} current_org_module_id 当前的移动元素id
   *  @param {Number} target_org_module_id  移动的目标元素id
   *  @param {Number} org_id 重新拉去树时候的org_id // 这里没传，后台读session
   *  @param {Number} module_id 重新拉去树时候的module_id
   *  @param {Array} data 移动后的数据更新后的state
   *  by fjw
   */
  moveRootCatalogTree = (currentOrgId, targetOrgId, moduleId, data) => {
    const { dispatch } = this.props;
    dispatch(
      {
        type: 'user/DropCatalogRootSibling',
        payload: {
          target_org_module_id: targetOrgId,
          current_org_module_id: currentOrgId,
        },
        callback: () => {
          if (this.props.DropCatalogRootSiblingMsg.code === 1) {
            message.success('移动成功');
            this.getRootCatalogAgain(data); // 重新拉去根的根节点
          } else {
            message.error(this.props.DropCatalogRootSiblingMsg.msg.text);
          }
        },
      });
  }

  /** 移入移出根节点的树
   *  @param {Number} current_org_module_id 当前的移动元素id
   *  @param {Number} target_org_module_id  移动的目标元素id
   *  @param {Number} module_id 重新拉去树时候的module_id
   *  @param {Array} data 移动后的数据更新后的state;
   *  by fjw
   */

  moveInOutRootCatalogTree = (targetNodeId, orgModuleId, itemOrgModuleId, data) => {
    const { dispatch } = this.props;

    dispatch(
      {
        type: 'user/moveRootNode', // 移动到节点里面
        payload: {
          target_node_id: targetNodeId,
          org_module_id: orgModuleId,
        },
        callback: () => {
          if (this.props.moveRootNodeMsg.code === 1) {
            message.success('移动成功');
            this.getChildCatalogByRootid(itemOrgModuleId, data); // 重新拉去根节点树数据
            this.getRootCatalogAgain(data); // 重新拉去根节点数据
          } else {
            message.error(this.props.moveRootNodeMsg.msg.text);
          }
        },
      });
  }

  /** 更新tree树的数据，改变父组件的tree
   *  @param {Array} data
   *  by fjw
   */
  changeTreeData = (data) => {
    const { dispatch } = this.props;
    dispatch(
      {
        type: 'user/changeTreeData',
        payload: data,
      });
  }

  changeCacheTreeData = (data) => {
    const { dispatch } = this.props;
    // const { current_id } = this.state;
    dispatch({
      type: 'catelog/CacheTreeDataAction',
      payload: { tree_data: data },
      callback: () => {
      },
    }); // 缓存树的数据
    // dispatch({
    //   type: 'catelog/changeExpandedKeys',
    //   payload: { pid: current_id },
    // }); // 改变默认展开的值
    // this.setState({
    //   expandedKeys: current_id,
    // });
  }

  /** 移动进入组件
   *  @param {Array} data
   *  by fjw
   */
  DropCatalogInOut = (Pid, NodeId, orgModuleId, data, dragObj, prItem) => {
    const { dispatch } = this.props;
    if (prItem.org_module_id !== dragObj.org_module_id) { // 不同根目录之间的移动
      dispatch(
        {
          type: 'user/DropCatalog', // 移动到节点里面
          payload: { parent_id: Pid, node_id: NodeId },
          callback: () => {
            if (this.props.DropCatalogMsg.code === 1) {
              message.success('移动成功');
              this.getChildCatalogByRootid(orgModuleId, data); // 重新拉去根节点数据下面的子目录
              this.getChildCatalogByRootid(dragObj.org_module_id, data); // 重新拉去根节点数据下面的子目录
              this.getRootCatalogAgain(data); // 重新拉去所有根
            } else {
              message.error(this.props.DropCatalogMsg.msg.text);
            }
          },
        });
    } else {
      dispatch(
        {
          type: 'user/DropCatalog', // 移动到节点里面
          payload: { parent_id: Pid, node_id: NodeId },
          callback: () => {
            if (this.props.DropCatalogMsg.code === 1) {
              message.success('移动成功');
              this.getChildCatalogByRootid(orgModuleId, data); // 重新拉去根节点数据下面的子目录
              this.getRootCatalogAgain(data); // 重新拉去根节点的数据
            } else {
              message.error(this.props.DropCatalogMsg.msg.text);
            }
          },
        });
    }
  }

  /** 移动进入组件
   *  @param {Number} curLevel 当前目录的是第几层
   *  @param {Number} childLevel 他的子目录有几层
   *  by fjw
   */
  isOverLevel = (curLevel, childLevel) => {
    if (curLevel + childLevel > 3) {
      return 1;
    }
    return 0;
  }

  render() {
    const {
      isMove,
      current_id,
      cacheTreeData,
      gData,
      qrcodeCount,
      CurRootCatalogLoading,
      RootCatalogLoading,
    } = this.state;
    const AllTreeData = (cacheTreeData && cacheTreeData.length > 0) ? cacheTreeData : gData;

    const curId = parseInt(current_id.toString(), 10);

    const loop = data => data.map((item) => {
      const editInputBoolean = curId === item.id;
      let editDisable;
      let isDefault;
      let ItemTitle;

      if (item.is_default && item.is_default !== undefined && item.is_default === 1) {
        isDefault = 1;
      } else {
        isDefault = 0;
      }

      if (RootCatalogLoading && RootCatalogLoading !== undefined) {
        editDisable = true;
      } else {
        editDisable = (this.state.edit_status === true && editInputBoolean === true);
      }

      if (!isMove && editInputBoolean) {
        ItemTitle = CutParagraph(item.name, item.name.length, 7);
      } else if (!isMove && !editInputBoolean) {
        ItemTitle = item.name;
      } else if (isMove && editInputBoolean) {
        ItemTitle = item.name;
      } else if (isMove && !editInputBoolean) {
        ItemTitle = item.name;
      }

      const title = (
        <div className={styles.titleNames} onClick={this.focusClick}>
          <div className={styles.titleInfo}>{ItemTitle}</div>
          <div className={`${this.state.edit_status ? styles.Editing : ''} ${item.level < 3 ? '' : styles.ItemLevelThree} ${isDefault === 1 ? styles.defaultAdd : ''} ${editInputBoolean ? styles.show : styles.none} ${styles.block_inline}`}>
            <span className={`${styles.add} ${isMove ? styles.none : ''}`} onClick={this.addChild}>&nbsp;&nbsp;&nbsp;<i data_id={item.id} data_org_module_id={item.org_module_id} className="anticon anticon-cli-add-o" /></span>
            <span className={`${styles.edit} ${isMove ? styles.none : ''}`} onClick={this.edit}>&nbsp;<i data_id={item.id} className="anticon anticon-cli-edit" /></span>
            <span className={`${styles.delete} ${isMove ? styles.none : ''}`} onClick={this.delete}>&nbsp;<i data_id={item.id} className="anticon anticon-cli-delete" /></span>
          </div>
          <Input
            className={`${styles.edit_input} ${this.state.edit_status && editInputBoolean ? '' : styles.none}`}
            size="small"
            data-id={item.id}
            id={item.id}
            // ref={(input) => { console.log('=================',input) }}
            defaultValue={item.name}
            onChange={this.InputChange}
            onBlur={this.inputBlur}
            onFocus={this.inputFocus}
            autoFocus
          />
        </div>
      );
      if (item.children && item.children.length) {
        return (
          <Tree.TreeNode
            disabled={editDisable}
            key={item.id}
            title={title}
            dataRef={item}
            selectable={!editInputBoolean}
          >
            {loop(item.children)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          disabled={editDisable}
          key={item.id}
          isLeaf={item.children_count <= 0}
          title={title}
          dataRef={item}
          selectable={!editInputBoolean}
        />
      );
    });
    return (
      <div className={`${!isMove ? styles.normal : styles.move}`}>
        { this.state.gData ?
          <div>
            <div className={`${this.state.isMove ? styles.none : ''} ${styles.categoryTitle}`}>
              目录
              <span>(共{qrcodeCount}个码)</span>
            </div>
            <Tree
              loadData={this.onLoadData}
              defaultExpandedKeys={this.state.expandedKeys}
              selectedKeys={this.state.current_id}
              // expandedKeys={this.state.expandedKeys}
              draggable={!isMove}
              onSelect={this.handleClick}
              onDrop={this.onDrop}
              onDragEnter={this.onDragEnter}
              onExpand={this.onExpand}
            >
              {loop(AllTreeData)}
            </Tree>
            <Button
              className={`${this.state.isMove ? styles.none : styles.button_block} ${styles.addBtn}`}
              onClick={this.addCategory}
              loading={CurRootCatalogLoading}
            >
              <i className="anticon anticon-cli-add-1" />新建根目录
            </Button>
            <div className={`${this.state.edit_status ? '' : styles.none} ${styles.catalog_mask}`} onClick={this.removeEdit} />
          </div>
          :
          <div className={styles.example}>
            <Spin />
          </div>
        }
      </div>
    );
  }
}

export default connect(state => ({
  TreeDatasByRoot: state.user.TreeDatasByRoot, // 目录下面的子目录获取
  tree_data: state.user.tree_data, // 树的数据
  qrcode_count: state.user.qrcode_count, // 树的数据
  cache_tree_data: state.catelog.cache_tree_data, // 缓存的树的数据，为了解决子目录需要重新加载的问题。
  expandedKeys: state.catelog.expandedKeys, // 默认展开的节点
  DeletetreeMsg: state.user.DeletetreeMsg, // 删除子目录的信息
  AddtreeMsg: state.user.AddtreeMsg, // 添加子目录的信息
  EdittreeMsg: state.user.EdittreeMsg, // 修改目录名字的信息
  AddRootCatalogMsg: state.user.AddRootCatalogMsg, // 添加根目录
  DeleteRootCatalogMsg: state.user.DeleteRootCatalogMsg, // 删除根节点目录
  EditRootCatalogMsg: state.user.EditRootCatalogMsg, // 修改目录名称
  DropCatalogMsg: state.user.DropCatalogMsg, // 子目录移入移出目录
  RootCatalogIdMsg: state.user.RootCatalogIdMsg, // 拉去所有的根节点
  DropCatalogSiblingMsg: state.user.DropCatalogSiblingMsg, // 子目录上下集移动
  DropCatalogRootSiblingMsg: state.user.DropCatalogRootSiblingMsg, // 根目录上下集移动
  moveRootNodeMsg: state.user.moveRootNodeMsg, // 根目录移动到另一个根目录或者子目录里面
  RootCatalogLoading: state.user.RootCatalogLoading,
  CurRootCatalogLoading: state.user.CurRootCatalogLoading, // 添加根目录时的loading
}))(CatalogueTree);
