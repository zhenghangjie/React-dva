import React from 'react';
import { Icon } from 'antd';
import { getExtsByName, getIconByExts } from '../../utils/utils';
import { getOriginData } from '../../common/origin';
import pub from './public.less';
import styles from './file.less';

class EditorModuleText extends React.Component {
  state = {
    origin: getOriginData(),
    list: this.props.list,
    iconUrl: '',
  }
  componentDidMount() {
    this.getInitData(this.state);
  }
  componentWillReceiveProps(nextProps) {
    this.getInitData(nextProps, false);
  }
  getInitData = (obj, isFirst) => {
    const { list } = obj;
    const { staticDomain } = this.state.origin;
    if (list.attribute_list.length > 0 && list.attribute_list[0].file_name) {
      const exts = getExtsByName(list.attribute_list[0].file_name.value);
      const iconUrl = getIconByExts(exts, staticDomain);
      this.setState({
        iconUrl,
      });
    }
    if (!isFirst) {
      this.setState({
        list,
      });
    }
  }
  render() {
    const { list, iconUrl } = this.state;
    return (
      <div className={list.attribute_list.length > 0 ? `ncPreview ${pub.normal} ${styles.content}` : `ncPreview ${pub.noContent} ${pub.normal}`}>
        {
          list.attribute_list.length > 0 ?
          (
            <div>
              <div className={styles.left}>
                <p className={styles.name}>
                  {(list.attribute_list.length > 0 && list.attribute_list[0].file_name) ? list.attribute_list[0].file_name.value : ''}
                </p>
                <p className={styles.size}>
                  {(list.attribute_list.length > 0 && list.attribute_list[0].file_size) ? list.attribute_list[0].file_size.value : ''}
                </p>
              </div>
              <img
                alt=""
                className={styles.fileIcon}
                src={iconUrl}
              />
            </div>
          ) :
            <Icon type="cli-file" className={`${pub.noContentIcon} ${styles.noContentIcon}`} />
        }
      </div>
    );
  }
}

export default EditorModuleText;
