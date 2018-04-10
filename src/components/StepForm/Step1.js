import React from 'react';
import { Button, Checkbox } from 'antd';
import { getOriginData } from '../../common/origin';
import styles from './step.less';

export default (
  {
    step1,
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
  if (SceneMsg.scene_img && SceneMsg.scene_img !== undefined) {
    img = SceneMsg.scene_img;
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
        <div className={styles.btnBox}>
          <Button className={`${styles.btn} ${styles.greenBtn}`} onClick={step1}>下一步</Button>
          <div className={styles.jumpBox}>
            <span
              onClick={onSkip}
              data-analyze={[3, 3]}
              className={styles.quickMade}
            >
              跳过引导，直接建码
            </span>
          </div>
        </div>
        <div className={styles.jumpStep}>
          <Checkbox data-analyze={[3, 2]} onChange={onChangeIsOpen} defaultChecked={isOpenSceneMsg}>
            下次不再显示
          </Checkbox>
        </div>
      </div>
    </div>
  );
};
