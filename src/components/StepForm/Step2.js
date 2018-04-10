import React from 'react';
import { Button, Checkbox } from 'antd';
import { getOriginData } from '../../common/origin';
import styles from './step.less';

export default (
  {
    step2,
    SceneMsg,
    skipGuild,
    changeIsOpen,
    isOpenSceneMsg,
    onChangeIsOpen = ((e) => { changeIsOpen(e.target.checked, SceneMsg.id); }),
    onSkip = (() => { skipGuild(SceneMsg.preset_code_id); }),
  }) => {
  let img;
  let isloding;
  const origin = getOriginData();
  if (SceneMsg.operate_img && SceneMsg.operate_img !== undefined) {
    img = SceneMsg.operate_img;
    isloding = false;
  } else {
    img = `${origin.staticDomain}/images/cli-loading@2x.gif`;
    isloding = true;
  }
  return (
    <div className={styles.root}>
      <div className={`${styles.img} ${isloding ? styles.loading : ''}`}>
        <img src={img} alt="" />
      </div>
      <div className={styles.footer}>
        <div className={`${styles.btnBox} ${styles.rightBtn}`}>
          <Button className={styles.btn} onClick={() => step2(-1)}>上一步</Button>
          <Button className={`${styles.btn} ${styles.greenBtn} ${styles.nextBtn}`} onClick={() => step2(1)}>下一步</Button>
          <div className={styles.jumpBox}>
            <span
              className={styles.quickMade}
              data-analyze={[3, 3]}
              onClick={onSkip}
            >
              跳过引导，直接建码
            </span>
          </div>
        </div>
        <div className={styles.jumpStep}>
          <Checkbox
            data-analyze={[3, 2]}
            onChange={onChangeIsOpen}
            defaultChecked={isOpenSceneMsg}
          >
            下次不再显示
          </Checkbox>
        </div>
      </div>
    </div>
  );
};
