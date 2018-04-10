import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './index.less';

export default class RichEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
    this.formats = ['background', 'bold', 'color', 'font', 'code', 'italic', 'link', 'size', 'strike', 'underline', 'blockquote', 'header', 'indent', 'list', 'align', 'direction', 'code-block', 'formula'];
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }
  handleChange = (value) => {
    this.props.changeValue(value);
    this.setState({
      value,
    });
  }
  modulesData = () => {
    const colors = ['#FFFFFF', '#000000', '#FE2C23', '#FF9901', '#FFE400', '#A3E043', '#38D9F0', '#4DA8EE', '#AA17D0',
      '#F3F3F1', '#949494', '#FCDBD6', '#FDE9D0', '#FFFACF', '#D4E9D6', '#DEF3F3', '#CEE0EF', '#DFDBED',
      '#DCDEDD', '#595856', '#EE837D', '#F8C387', '#EFE962', '#9ABD9D', '#83CCD2', '#89B0CE', '#9389B1',
      '#C1C6CA', '#41464B', '#A10000', '#CF770B', '#B2B200', '#557B5C', '#01A3B0', '#3776A6', '#765C83',
      '#ADADAD', '#2B2B2B', '#4A0000', '#663D00', '#666600', '#00552E', '#00767A', '#194E77', '#530D6F'];
    const modules = {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', { color: colors }, { background: colors }, { size: [] }, { list: 'ordered' }, { list: 'bullet' }, { align: '' }, { align: 'center' }, { align: 'right' }, 'clean']],
        handlers: {
        },
      },
    };
    return modules;
  }
  render() {
    const { value } = this.state;
    return (
      <ReactQuill
        value={value || ''}
        onChange={this.handleChange}
        modules={this.modulesData()}
        formats={this.formats}
      />
    );
  }
}
