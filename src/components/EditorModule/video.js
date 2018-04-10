import React from 'react';
import { Icon } from 'antd';
import pub from './public.less';
import styles from './video.less';

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
              className={styles.videoModule}
            >
              <div className={styles.videoInfo}>
                <video
                  className={styles.video}
                  src={list.attribute_list[0].video_url ? list.attribute_list[0].video_url.value : ''}
                  preload="metadata"
                >
                  <track kind="captions" />
                </video>
                <div className={styles.videoIcon}>
                  <Icon type="play-circle" />
                  <div className={styles.videoDuration}>{list.attribute_list[0].video_long ? list.attribute_list[0].video_long.value : ''}</div>
                </div>
                {
                  ((editionId === '1' || editionId === undefined) && list.play_times > 5) ?
                  (
                    <div className={styles.coverLayer}>
                      <p className={styles.layerContent}>该视频播放次数已达5人次上限，无法正常播放</p>
                    </div>
                  ) :
                  ''
                }
              </div>
            </div>
          ) :
            <Icon type="cli-video" className={`${pub.noContentIcon} ${styles.noContentIcon}`} />
        }
      </div>
    );
  }
}

export default EditorModuleText;
