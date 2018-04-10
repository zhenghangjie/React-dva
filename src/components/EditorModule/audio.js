import React from 'react';
import { Icon, Slider } from 'antd';
import pub from './public.less';
import styles from './audio.less';

class EditorModuleText extends React.Component {
  state = {
    list: this.props.list,
    editionId: this.props.editionId,
  }
  componentDidMount() {
    this.getInitData(this.state);
  }
  componentWillReceiveProps(nextProps) {
    this.getInitData(nextProps, false);
  }
  getInitData = (obj, isFirst) => {
    const { list } = obj;
    if (!isFirst) {
      this.setState({
        list,
      });
    }
  }
  render() {
    const { list, editionId } = this.state;
    return (
      <div className={list.attribute_list.length > 0 ? `ncPreview ${pub.normal} ${styles.content}` : `ncPreview ${pub.noContent} ${pub.normal}`}>
        {
          list.attribute_list.length > 0 ?
          (
            <div
              className={styles.audioModule}
            >
              <div className={styles.audioIcon}>
                <img src={require('../../assets/paused.png')} alt="" className={styles.imgControll} />
              </div>
              <div className={styles.audioInfo}>
                <p className={styles.audioName}>{(list.attribute_list.length > 0 && list.attribute_list[0].audio_name) ? list.attribute_list[0].audio_name.value : ''}</p>
                <Slider
                  tipFormatter={null}
                  disabled
                />
                <span className={styles.audioSize}>{(list.attribute_list.length > 0 && list.attribute_list[0].audio_size) ? list.attribute_list[0].audio_size.value : ''}</span>
                <span className={styles.audioDuration}>{(list.attribute_list.length > 0 && list.attribute_list[0].audio_long) ? list.attribute_list[0].audio_long.value : ''}</span>
                <span className={styles.audioStartTime}>00:00</span>
              </div>
              {
                ((editionId === '1' || editionId === undefined) && list.play_times > 5) ?
                (
                  <div className={styles.coverLayer}>
                    <p className={styles.layerContent}>该音频播放次数已达5人次上限，无法正常播放</p>
                  </div>
                ) :
                ''
              }
            </div>
          ) :
            <Icon type="cli-audio" className={`${pub.noContentIcon} ${styles.noContentIcon}`} />
        }
      </div>
    );
  }
}

export default EditorModuleText;
