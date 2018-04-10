import React from 'react';
import { Icon } from 'antd';
import pub from './public.less';
import styles from './img.less';

class EditorModuleText extends React.Component {
  state = {
    obj: this.props.list,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      obj: nextProps.list,
    });
  }
  render() {
    const { obj } = this.state;
    return (
      <div className={obj.attribute_list.length > 0 ? `ncPreview ${pub.normal} ${styles.center}` : `ncPreview ${pub.noContent} ${pub.normal}`}>
        { obj.attribute_list.length > 0 ?
          <img className={styles.img} src={obj.attribute_list[0].image_url.value} alt="" /> :
          <Icon type="cli-image" className={pub.noContentIcon} />
        }
      </div>
    );
  }
}

export default EditorModuleText;
