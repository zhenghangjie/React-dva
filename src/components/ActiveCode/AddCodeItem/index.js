import React from 'react';
import ItemCode from './Item';
import styles from './index.less';
// import { getUrlPara } from '../../../utils/utils.js';

export default ({ lists, presetCode, blankBuild }) => {
  // const { search } = location;
  // const cataId = getUrlPara('categoryId', search);
  // const page = getUrlPara('p', search);
  // const catalogId = parseInt(cataId, 10);

  const codes = lists.map((item) => {
    if (item.need_guide === 1) {
      return (
        <ItemCode
          key={item.id}
          data={item}
          data-analyze={[3, item.preset_code_id]}
          presetCode={presetCode}
        />
      );
    } else {
      return false;
    }
  });
  const NotNeedGuides = lists.map((item) => {
    if (item.need_guide === 0) {
      return (
        <ItemCode
          key={item.id}
          data={item}
          data-analyze={[3, item.preset_code_id]}
          presetCode={presetCode}
        />
      );
    } else {
      return false;
    }
  });

  return (
    <div>
      <h2 className={styles.textCenter} style={{ marginTop: '-8px' }}>
        <span>通用</span>
      </h2>
      <div className={styles.root}>
        <div
          onClick={blankBuild}
          className={styles.item}
        >
          <div className={styles.emptyBox}>
            <div className={styles.emptyImgBox}>
              <img
                src="//static.clewm.net/cli/images/add_active@2x.png"
                alt=""
              />
            </div>
            <div className={styles.blankTemplate}>空白模版</div>
          </div>
        </div>
        {NotNeedGuides}
      </div>
      <h2 className={styles.textCenter}>
        <span>场景建码</span>
      </h2>
      <div className={styles.root}>
        {codes}
      </div>
    </div>
  );
};
