import React from 'react';
import { Icon } from 'antd';
import 'react-quill/dist/quill.snow.css';
import pub from './public.less';
import styles from './text.less';

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
      <div className={obj.attribute_list.length > 0 ? `ncPreview ${pub.normal} ${styles.content}` : `ncPreview ${pub.noContent} ${pub.normal}`}>
        {
          obj.attribute_list.length > 0 ?
            (
              <span
                dangerouslySetInnerHTML={{ __html: `<div class="ql-editor text-container">${obj.attribute_list[0].content_html.value}</div>` }}
              />
            ) :
              <Icon type="cli-txt" className={pub.noContentIcon} />
         }
      </div>
    );
  }
}

export default EditorModuleText;
