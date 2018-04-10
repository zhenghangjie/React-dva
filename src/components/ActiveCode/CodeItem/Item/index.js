import React from 'react';
import { Checkbox, Menu, Dropdown, Icon, Input, Card, Spin } from 'antd';
import { Link, routerRedux } from 'dva/router';
import styles from './index.less';
import { getUrlPara, CutParagraph } from '../../../../utils/utils.js';

export default (
  {
    data,
    dispatch,
    deleteItem,
    editItem,
    copyItem,
    location,
    editNameItem,
    editQrcodeStatus,
    editQrcodeChangeItem,
    editFocusChangeItem,
    editFocusChange = ((e) => { editFocusChangeItem(data.id, e.target.value); }), // focus的名称,
    editQrcodeChange = ((e) => { editQrcodeChangeItem(data.id, e.target.value); }), // 改码的名称
    editQrcodeId,
    editQrcodeName, // 修改之后，将data的name修改成修改之后的name
    changeQrcodeLoading,
    curPage,
    pageSize,
    EditBlur,
    onEditName = (() => { editNameItem(data.id); }),
    onEdit = (() => { editItem(data); }),
    onCopy = (() => { copyItem(data.id); }),
    onDelete = (() => { deleteItem(data.id); }),
    qrcodeMsg = (() => { dispatch(routerRedux.push(`/active/activecode/viewcode/${data.id}?categoryId=${curcatalogId}&p=${curPage}&page_size=${pageSize}`)); }),
  }) => {
  const menu = (
    <Menu className={styles.menuAction}>
      <Menu.Item>
        <div style={{ padding: '6px 16px', width: '100%', height: '100%' }} data-analyze={[2, 2]} onClick={onCopy}>复制</div>
      </Menu.Item>
      <Menu.Item>
        <div style={{ padding: '6px 16px', width: '100%', height: '100%' }} onClick={onDelete}>删除</div>
      </Menu.Item>
    </Menu>
  );
  const { search } = location;
  const cataId = getUrlPara('categoryId', search);
  let curcatalogId;
  if (cataId && cataId !== undefined) {
    curcatalogId = parseInt(cataId, 10);
  } else {
    curcatalogId = data.category_id;
  }

  let todayScan;
  let allScan;

  const newName = CutParagraph(data.list_name, data.list_name.length, 20);

  if (data.scan_msg.total && data.scan_msg.total !== undefined) {
    todayScan = data.scan_msg.day_total;
    allScan = data.scan_msg.total;
  } else {
    todayScan = 0;
    allScan = 0;
  }

  const datalists = (editQrcodeId === data.id && changeQrcodeLoading) ?
    (<div className={styles.example}><Spin /></div>)
    :
    (
      <Card loading={editQrcodeId === data.id && changeQrcodeLoading}>
        <li className={styles.root} key={data.id} >
          <div className={styles.item}>
            <div className={styles.item_info}>
              <Checkbox value={data.id} />
              <div style={{ marginLeft: 20 }}>
                <h4
                  className={`${(editQrcodeId === data.id && editQrcodeStatus === true) ? styles.none : ''} ${styles.title}`}
                  id={data.id}
                >
                  <span className={styles.titleInfo} onClick={qrcodeMsg}>{newName}</span>
                  <span className={`${styles.editIcon}`} ><i className="anticon anticon-cli-edit" onClick={onEditName} /></span>
                </h4>
                <Input
                  className={`${(editQrcodeId === data.id && editQrcodeStatus === true) ? styles.EditInput : styles.none}`}
                  size="small"
                  defaultValue={editQrcodeId === data.id ? editQrcodeName : data.list_name}
                  onBlur={EditBlur}
                  onFocus={editFocusChange}
                  onChange={editQrcodeChange}
                />
                <div className={styles.time_count}>
                  <div className={styles.count}>今天扫描{todayScan}次 累计扫描<span>{allScan}次</span></div>
                </div>
              </div>
            </div>
            <div className={styles.time}>
              <span className={styles.update_time}>{data.create_time !== '' ? data.create_time : '时间为空'}</span>
            </div>
            <div className={styles.item_action}>
              <Link to={`/active/activecode/viewcode/${data.id}?categoryId=${curcatalogId}&p=${curPage}&page_size=${pageSize}`} className={styles.btnAction}>
                <div>二维码</div>
              </Link>
              <div onClick={onEdit} data-analyze={[2, 3]} className={styles.btnAction}>编辑</div>
              <Dropdown overlay={menu}>
                <a className="ant-dropdown-link">
                  更多<Icon type="down" />
                </a>
              </Dropdown>
            </div>
          </div>
          <div className={styles.qrcodemask} onClick={qrcodeMsg} />
        </li>
      </Card>
    );

  return (
    <div>
      {datalists}
    </div>
  );
};
