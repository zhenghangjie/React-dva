import React from 'react';
import styles from './move.less';

class EditorModuleMove extends React.Component {
  state = {
    type: this.props.type,
  }
  getComponentType = () => {
    const { type } = this.state;
    let name;
    switch (type) {
      case 'image':
        name = '图片';
        break;
      case 'text':
        name = '文本';
        break;
      case 'file':
        name = '文件';
        break;
      case 'audio':
        name = '音频';
        break;
      case 'video':
        name = '视频';
        break;
      case 'table':
        name = '表格';
        break;
      default:
        name = '';
        break;
    }
    return (
      <span className={styles.moduleType}>
        {name}
      </span>
    );
  }
  render() {
    return (
      <div className={styles.normal}>
        {this.getComponentType()}
        <span data-move="remove">移除</span>
        <span data-move="next">下移</span>
        <span data-move="prev">上移</span>
        <span data-move="gotop">置顶</span>
        <span data-move="copy">复制</span>
      </div>
    );
  }
}

export default EditorModuleMove;
