import React from 'react';
import { Spin } from 'antd';
import ItemCode from './Item';
import styles from './index.less';


export default (
  {
    lists,
    dispatch,
    deleteItem,
    copyItem,
    editItem,
    editNameItem,
    editQrcodeChangeItem,
    editFocusChangeItem,
    editQrcodeStatus,
    loading,
    catalogId,
    location,
    curPage,
    pageSize,
    EditBlur,
    editQrcodeId,
    editQrcodeName,
    changeQrcodeLoading,
  }) => {
  const codes = loading ?
    (<div className={styles.example}><Spin /></div>)
    :
    lists.map((item) => {
      return (
        <div className={styles.root} key={item.id}>
          <ItemCode
            data={item}
            dispatch={dispatch}
            deleteItem={deleteItem}
            copyItem={copyItem}
            editItem={editItem}
            catalogId={catalogId}
            location={location}
            curPage={curPage}
            pageSize={pageSize}
            editQrcodeId={editQrcodeId}
            editQrcodeName={editQrcodeName}
            changeQrcodeLoading={changeQrcodeLoading}
            editNameItem={editNameItem} // 修改码的名称以及编辑状态
            EditBlur={EditBlur} // 失去焦点时，EditBlur时候调借口
            editFocusChangeItem={editFocusChangeItem}
            editQrcodeChangeItem={editQrcodeChangeItem} // 修改码的名称记录id与name
            editQrcodeStatus={editQrcodeStatus} // 修改码的名称以及编辑状态
          />
        </div>
      );
    });
  return (
    <div>
      {codes}
    </div>
  );
};
