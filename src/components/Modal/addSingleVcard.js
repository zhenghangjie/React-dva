import React from 'react';
import { Modal, Button, Form, Input, TreeSelect, Upload } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import { Cropper } from 'react-image-cropper';
import styles from './addSingleVcard.less';

const FormItem = Form.Item;

const treeDataFilter = (objParam, companyName) => {
  for (let i = 0; i < objParam.length; i += 1) {
    if (objParam[i].children) {
      treeDataFilter(objParam[i].children, companyName);
    }
    objParam[i].value = objParam[i].key;
    objParam[i].label = objParam[i].title;
    if (objParam[i].type === 'all') {
      objParam[i].title = companyName;
      objParam[i].label = companyName;
    }
  }
  return objParam;
};

const formArrFilter = (arrObj, id, value) => {
  for (const i in arrObj) {
    if ({}.hasOwnProperty.call(arrObj, i)) {
      if (arrObj[i].length) {
        formArrFilter(arrObj[i], id, value);
      }
      if (parseInt(arrObj[i].system_field_id, 10) === parseInt(id, 10)) {
        arrObj[i].field_value = value;
      }
    }
  }
  return arrObj;
};

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i += 1) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

// 根据key获取当前title
// const getCurrentValueByKey = (key, tree) => {
//   let value;
//   for (let i = 0; i < tree.length; i += 1) {
//     const node = tree[i];
//     if (node.key === key) {
//       value = node.title;
//       break;
//     }
//     if (node.children) {
//       value = getCurrentValueByKey(key, node.children);
//     }
//   }
//   return value;
// };

class addSingleVcard extends React.Component {
  state = {
    loading: this.props.loading,
    visible: this.props.visible,
    treeData: this.props.treeData,
    singleData: this.props.singleData,
    avatarUrl: '',
    codeListModule: this.props.codeListModule,
  }
  componentWillMount() {
    const { singleData } = this.state;
    if (singleData) {
      this.setState({
        avatarUrl: singleData.photo_path,
      });
    }
  }
  componentDidMount() {
    const { setFieldsValue } = this.props.form;
    const { singleData } = this.state;
    if (singleData) {
      setFieldsValue({
        12: singleData.name,
        13: singleData.mobile,
        14: singleData.email,
        16: { value: singleData.department, label: '' },
        17: singleData.job,
        18: singleData.address,
        21: singleData.memo,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
      treeData: nextProps.treeData,
    });
  }
  onChangeSelect = () => {
    // const { setFieldsValue } = this.props.form;
    // setFieldsValue({
    //   6: valueObj.value,
    // });
  }
  setIdcodeId = (codeListModules, singleData) => {
    const idcodeId = singleData ? singleData.id : 0;
    for (const i in codeListModules) {
      if ({}.hasOwnProperty.call(codeListModules, i)) {
        for (const j in codeListModules[i]) {
          if ({}.hasOwnProperty.call(codeListModules[i], j)) {
            if (!('field_value' in codeListModules[i][j])) {
              codeListModules[i][j].field_value = '';
            }
            codeListModules[i][j].idcode_id = idcodeId;
          }
        }
      }
    }
    this.setState({
      codeListModule: codeListModules,
    });
  }
  handleOk = () => {
    const { codeListModule, singleData, avatarUrl } = this.state;
    this.setIdcodeId(codeListModule, singleData);
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ loading: true });
      const objValue = _.pickBy(values, _.identity);
      for (const i in objValue) {
        if ({}.hasOwnProperty.call(objValue, i)) {
          // 传递部门id
          if (parseInt(i, 10) === 16) {
            formArrFilter(codeListModule, i, objValue[i].value);
          } else {
            formArrFilter(codeListModule, i, objValue[i]);
          }
        }
      }
      this.props.singleAddMembersfn(codeListModule, avatarUrl, () => {
        form.resetFields();
        this.setState({ visible: false });
        this.props.singleAddMembers(false);
      });
    });
  }
  handleCancel = () => {
    // this.props.form.resetFields();
    this.setState({ visible: false });
    this.props.singleAddMembers(false);
  }
  beforeUpload = () => {
    return false;
  }
  previewFile = (info) => {
    const { file } = info;
    const { dispatch } = this.props;
    const reader = new FileReader();
    const that = this;
    reader.onloadend = () => {
      Modal.confirm({
        title: '头像裁剪',
        content: <Cropper
          src={reader.result}
          ref={(ref) => { that.cropper = ref; }}
        />,
        okText: '确认',
        onOk() {
          dispatch({
            type: 'api/base64ImgUpload',
            payload: {
              base64: that.cropper.crop(),
            },
            callback: (res) => {
              if (res.code === 200) {
                that.setState({
                  avatarUrl: res.data.url,
                });
              }
            },
          });
        },
        onCancel() {
        },
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      that.setState({
        avatarUrl: '',
      });
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { companyName, currentTitleObj } = this.props;
    if (currentTitleObj.title === '所有成员') {
      currentTitleObj.title = companyName;
    }
    const { visible, loading, treeData, avatarUrl } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
    };
    return (
      <div>
        <Modal
          visible={visible}
          title="添加名片"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          maskClosable={false}
          wrapClassName={styles.wrapModal}
          className={styles.modalContent}
          footer={[
            <Button htmlType="submit" key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              保存
            </Button>,
          ]}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label="头像"
            >
              {getFieldDecorator('avatarVcard')(
                <div>
                  <div className={styles.avatar}>
                    <img src={avatarUrl} alt="" />
                  </div>
                  <Upload
                    name="Filedata"
                    onChange={this.previewFile}
                    beforeUpload={this.beforeUpload}
                    showUploadList={false}
                  >
                    <Button>上传头像</Button>
                  </Upload>
                </div>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="姓名"
            >
              {getFieldDecorator('12', {
                rules: [{
                  required: true, message: '请输入姓名!',
                }],
              })(
                <Input placeholder="请输入姓名" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="手机"
            >
              {getFieldDecorator('13', {
                rules: [{
                  required: true, message: '请输入手机号码!',
                }, {
                  pattern: /^1[3|4|5|6|7|8|9][0-9]{9}$/,
                  message: '请输入正确的手机号码!',
                }],
                validateTrigger: 'onSubmit',
              })(
                <Input placeholder="请输入手机号码" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="部门"
            >
              {treeData.length > 0 &&
                getFieldDecorator('16', {
                  initialValue: { value: currentTitleObj.key, label: currentTitleObj.value },
                })(
                  <TreeSelect
                    style={{ width: '100%' }}
                    labelInValue
                    dropdownStyle={{ maxHeight: 200, overflow: 'auto', zIndex: 3000 }}
                    treeData={treeDataFilter(_.cloneDeep(treeData), companyName)}
                    placeholder="请选择部门"
                    treeDefaultExpandAll
                    onChange={this.onChangeSelect}
                  />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="职位"
            >
              {getFieldDecorator('17', {
                rules: [],
              })(
                <Input placeholder="请输入职位" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="邮箱"
            >
              {getFieldDecorator('14', {
                rules: [{
                  type: 'email', message: '请输入正确的邮箱地址！',
                }],
              })(
                <Input placeholder="请输入邮箱" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="地址"
            >
              {getFieldDecorator('18', {
                rules: [],
              })(
                <Input placeholder="请输入地址" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="签名"
            >
              {getFieldDecorator('21', {
                rules: [],
              })(
                <Input placeholder="请输入备注" />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const WrappedaddSingleVcard = Form.create()(addSingleVcard);
export default connect()(WrappedaddSingleVcard);
