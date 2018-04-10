import React from 'react';
import styles from './index.less';

export default (
  {
    data,
    presetCode,
    onPreset = (() => { presetCode(data); }),
  }) => {
  const img = data.cover_img !== '' ? data.cover_img : '//alicliimg.clewm.net/592/614/1614592/15090059452276a9f12356657bd34322d8a408878db451509005865.png';
  return (
    <div className={styles.root}>
      <div onClick={onPreset} className={styles.item}>
        <div className={styles.imgBox}>
          <img
            src={img}
            alt=""
          />
        </div>
        <div className={styles.infoBox}>
          <h3>{data.name}</h3>
          <span>{data.memo}</span>
        </div>
      </div>
    </div>
  );
};
