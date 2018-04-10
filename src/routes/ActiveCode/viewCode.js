import React from 'react';
import { Button, Card, message, Modal, notification, Input } from 'antd';
import { connect } from 'dva';
import EditorModuleText from '../../components/EditorModule/text.js';
import EditorModuleImg from '../../components/EditorModule/img.js';
import EditorModuleFile from '../../components/EditorModule/file.js';
import EditorModuleAudio from '../../components/EditorModule/audio.js';
import EditorModuleVideo from '../../components/EditorModule/video.js';
import EditorModuleTable from '../../components/EditorModule/table.js';
import QrcodeModel from '../../components/QrcodeModel';
import BeautifyFrame from '../../components/BeautifyFrame';
import img from '../../assets/view_title.png';
import { getOriginData } from '../../common/origin';
import styles from './viewCode.less';
import { getLocalTime, getUrlPara, CutParagraph } from '../../utils/utils.js';


class viewCode extends React.Component {
  state = {
    origin: getOriginData(),
    QrcodeMsg: [],
    QrcodeComponentLists: [],
    QrcodeScan: [],
    modelvisible: false,
    modeldownVisible: true,
    beautyVisible: false,
    currentUser: this.props.currentUser,
    editStatus: false,
    editQrcodeName: '',
    // QrcodeMsgLoading: this.props.QrcodeMsgLoading,
  };

  componentWillMount() {
    const { dispatch, match, location } = this.props;
    const { params } = match;
    const { search } = location;
    const copy = getUrlPara('copy', search);
    if (copy && copy === 'true') {
      message.success('复制成功');
    }

    dispatch({
      type: 'activeCode/fetchQrcodeMsg',
      payload: { id: params.id },
      callback: () => {
        if (this.props.QrcodeMsg && this.props.QrcodeMsg.code === 1) {
          this.setState({
            QrcodeComponentLists: this.props.QrcodeMsg.data.qrcode_compontent,
            QrcodeMsg: this.props.QrcodeMsg.data.qrcode_record,
            QrcodeScan: this.props.QrcodeMsg.data.scan_msg,
            editQrcodeName: this.props.QrcodeMsg.data.qrcode_record.list_name,
          });
        } else if (this.props.QrcodeMsg && this.props.QrcodeMsg.code === 0) {
          message.error(this.props.QrcodeMsg.msg.text);
        } else {
          message.error('数据出错');
        }
      },
    });
  }

  componentDidMount() {
    notification.config({
      placement: 'topLeft',
      duration: 3,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentUser !== nextProps.currentUser) {
      this.setState({
        currentUser: nextProps.currentUser,
      });
    }
    if (this.props.QrcodeMsgLoading !== nextProps.QrcodeMsgLoading) {
      this.setState({
        // QrcodeMsgLoading: nextProps.QrcodeMsgLoading,
      });
    }
  }

  // 获取中间区域模块内容 return component
  getModuleType = (item, editionInfo) => {
    let editionId;
    if (editionInfo !== undefined) {
      editionId = editionInfo.edition_id;
    }
    return item.map((option, index) => {
      const i = index;
      const optionType = option.component_code;
      const recentList = this.state.QrcodeComponentLists[i] || '';
      if (recentList && recentList !== undefined && recentList.attribute_list.length > 0) {
        if (optionType === 'text') {
          return (
            <div
              key={`${optionType}${i}`}
            >
              <EditorModuleText key={`${optionType}${i}`} list={recentList} />
            </div>
          );
        } else if (optionType === 'image') {
          return (
            <div
              key={`${optionType}${i}`}
            >
              <EditorModuleImg key={`${optionType}${i}`} list={recentList} />
            </div>
          );
        } else if (optionType === 'file') {
          return (
            <div
              key={`${optionType}${i}`}
            >
              <EditorModuleFile key={`${optionType}${i}`} list={recentList} />
            </div>
          );
        } else if (optionType === 'audio') {
          return (
            <div
              key={`${optionType}${i}`}
            >
              <EditorModuleAudio key={`${optionType}${i}`} list={recentList} editionId={editionId} />
            </div>
          );
        } else if (optionType === 'video') {
          return (
            <div
              key={`${optionType}${i}`}
            >
              <EditorModuleVideo key={`${optionType}${i}`} list={recentList} editionId={editionId} />
            </div>
          );
        } else if (optionType === 'table') {
          return (
            <div
              key={`${optionType}${i}`}
            >
              <EditorModuleTable key={`${optionType}${i}`} list={recentList} />
            </div>
          );
        } else {
          return (
            <div />
          );
        }
      } else {
        return (
          <div key={i} />
        );
      }
    });
  }

  back = () => {
    window.history.back();
  }

  copy =() => {
    const { match, dispatch, location } = this.props;
    const { params } = match;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const pageSize = getUrlPara('page_size', search);

    const curcatalogId = parseInt(cataId, 10);
    const curPage = parseInt(page, 10);
    const curpageSize = parseInt(pageSize, 10);
    const newWin = window.open('about:blank;');

    dispatch({
      type: 'activeCode/CodeCopy',
      payload: { id: params.id },
      callback: () => {
        if (this.props.CodeCopyMsg.code === 1) {
          const id = parseInt(this.props.CodeCopyMsg.data.id, 10);
          const url = `/active/activecode/viewcode/${id}?categoryId=${curcatalogId}&p=${curPage}&page_size=${curpageSize}&copy=true`;
          // 防拦截
          newWin.location.href = url;
        } else if (this.props.CodeCopyMsg && this.props.CodeCopyMsg.code === 0) {
          message.error(this.props.CodeCopyMsg.msg.text);
          const template = `${this.props.CodeCopyMsg.msg.text}，<a href="/active/activecode?categoryId=${curcatalogId}">点击返回列表页</a>`;
          newWin.document.write(template);
        } else {
          message.error('复制出错');
          const url = `/active/activecode?categoryId=${curcatalogId}`;
          newWin.location.href = url;
        }
      },
    });
  }

  edit = () => {
    const { match, location, history } = this.props;
    const { params } = match;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const curcatalogId = parseInt(cataId, 10);
    history.push(`/edit/${params.id}?categoryId=${curcatalogId}&p=${page}`);
  }

  delete = () => {
    const { match, dispatch, location, history } = this.props;
    const { params } = match;
    const { search } = location;
    const codeIdn = params.id;
    const codeId = parseInt(codeIdn, 10);
    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const curcatalogId = parseInt(cataId, 10);
    const that = this;

    Modal.confirm({
      title: '确定删除这个二维码?',
      content: '二维码删除后，扫码将无法显示！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        dispatch(
          {
            type: 'activeCode/DeleteActive',
            payload: { id: codeId },
            callback: () => {
              if (that.props.DeleteMsg && that.props.DeleteMsg.code === 1) {
                message.success('删除成功');
                history.push(`/active/activecode?categoryId=${curcatalogId}&p=${page}`);
              } else if (that.props.DeleteMsg && that.props.DeleteMsg.code === 0) {
                message.error(that.props.DeleteMsg.msg.text);
              } else {
                message.error('数据出错');
              }
            },
          });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  }
  download = () => {
    // 默认下载type=png size=400的图片。
    const { QrcodeMsg } = this.state;
    const qrcodeImg = QrcodeMsg.qrcode_url;
    let url = qrcodeImg.replace('/qr?', '/qr/downQr?');
    url += '&type=png&downsize=400';
    window.open(url);
  }
  // 美化二维码
  codeBeauty = () => {
    this.changeBeautifyVisible(true);
  }
  // 下载其他格式
  downOtherStyle = () => {
    this.changeModelVisible(true, 'showDownload');
  }

  // 设置qrcode modal显示隐藏
  changeModelVisible = (bool, downVisible) => {
    let temp;
    if (downVisible) {
      temp = true;
    } else {
      temp = false;
    }
    this.setState({
      modelvisible: bool,
      modeldownVisible: temp,
    });
  }
  // 设置美化显示隐藏
  changeBeautifyVisible = (bool) => {
    this.setState({
      beautyVisible: bool,
    });
  }

  editAction = () => {
    this.setState({ editStatus: true });
  }

  cancelEditStatus = () => {
    this.setState({ editStatus: false });
  }

  editQrcodeChange = (e) => {
    this.setState({ editQrcodeName: e.target.value });
  }

  editFocusChange = (e) => {
    this.setState({ editQrcodeName: e.target.value });
  }

  EditBlur = () => {
    this.setState({ editStatus: false });
    const { editQrcodeName } = this.state;
    const { dispatch, match } = this.props;
    const { params } = match;

    dispatch(
      {
        type: 'activeCode/CodeRename',
        payload: { id: params.id, name: editQrcodeName },
        callback: () => {
          if (this.props.CodeRenameMsg.code === 1) {
            message.success('活码名称修改成功');
            // const newLists = renameQrcodeById(lists, editQrcodeId, editQrcodeName).concat();
            // this.setState({ lists: newLists });
          } else {
            message.error(this.props.CodeRenameMsg.msg.text);
          }
        },
      });
  }

  render() {
    const {
      QrcodeMsg,
      QrcodeComponentLists,
      modelvisible,
      modeldownVisible,
      beautyVisible,
      QrcodeScan,
      currentUser,
      origin,
      editStatus,
      editQrcodeName,
      // QrcodeMsgLoading,
    } = this.state;
    const { staticDomain } = origin;
    let orgName;
    if (currentUser.data && currentUser.data !== undefined) {
      orgName = currentUser.data.org_info.org_name;
    } else {
      orgName = '草料二维码';
    }
    let codeName;
    if (editQrcodeName && editQrcodeName !== undefined) {
      codeName = editQrcodeName;
    } else {
      codeName = '未命名活码';
    }

    // 下载模版
    const QrcodeModelTemplate = modelvisible
      ?
      (
        <QrcodeModel
          qrcodeImg={QrcodeMsg.qrcode_url} // 二维码图片地址
          qrcodeUrl={QrcodeMsg.web_url} // 二维码路径
          visible={modelvisible}
          downVisible={modeldownVisible}
          catalogueInfo=""
          fn={this.changeModelVisible}
        />
      )
      :
      '';
    // 美化模版
    const BeautifyFrameTemplate = beautyVisible
      ?
      (
        <BeautifyFrame
          visible={beautyVisible}
          fn={this.changeBeautifyVisible}
          data={QrcodeMsg.web_url} // 二维码路径
        />
      )
      :
      '';

    let todayScan;
    let allScan;

    if (QrcodeScan.total && QrcodeScan.total !== undefined) {
      todayScan = QrcodeScan.day_total;
      allScan = QrcodeScan.total;
    } else {
      todayScan = 0;
      allScan = 0;
    }

    let codeCreateTime;
    let codeUptateTime;

    if (QrcodeMsg.create_time === 0) {
      codeCreateTime = '无创建时间';
      codeUptateTime = '无更新时间';
    } else if (QrcodeMsg.create_time === undefined) {
      codeCreateTime = '';
      codeUptateTime = '';
    } else {
      codeCreateTime = getLocalTime(QrcodeMsg.create_time);
      codeUptateTime = getLocalTime(QrcodeMsg.update_time);
    }

    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div className={styles.statistics}>
            <Card title="总扫描量">
              <div className={styles.number}>
                <h2>{allScan}</h2>
              </div>
              <div className={styles.todayScan}>
                <div className={styles.todayScanCount}>今日扫描量  {todayScan}</div>
                <div className={styles.updateTime}>创建时间  &nbsp;&nbsp;{codeCreateTime}</div>
                <div className={styles.createTime}>更新时间  &nbsp;&nbsp;{codeUptateTime}</div>
              </div>
            </Card>
          </div>
          <div className={styles.content}>
            <div className={styles.imgbox}>
              <img src={`${staticDomain}/images/nc/mobileheader@2x.png`} alt="" />
              <h2>{CutParagraph(orgName, orgName.length, 8)}</h2>
            </div>
            <div className={styles.content_info}>
              {
                (
                  QrcodeComponentLists.length > 0 &&
                  currentUser.data &&
                  currentUser.data.edition_info !== undefined
                )
                ?
                this.getModuleType(QrcodeComponentLists, currentUser.data.edition_info)
                :
                (<Card loading>Whatever content</Card>)
              }
            </div>
          </div>
          <div className={styles.action}>
            <div className={styles.title}>
              <h2 className={`${styles.editNameTitle} ${editStatus ? styles.none : ''}`}>
                <span className={styles.listName}>
                  {CutParagraph(codeName, codeName.length, 8)}
                </span>
                <span className={styles.editname}><i className="anticon anticon-cli-edit" onClick={this.editAction} /></span>
              </h2>
              {
                QrcodeMsg.list_name === undefined
                ?
                  <div />
                :
                  <Input
                    className={`${editStatus ? styles.editInput : styles.none}`}
                    defaultValue={QrcodeMsg.list_name}
                    size="small"
                    id={`${QrcodeMsg.id}`}
                    onBlur={this.EditBlur}
                    onFocus={this.editFocusChange}
                    onChange={this.editQrcodeChange}
                  />
              }
              <img src={QrcodeMsg.qrcode_url} alt="" />
            </div>
            <div className={styles.download}>
              <Button onClick={this.download}>下载</Button>
              <div className={styles.beauty}>
                <span onClick={this.downOtherStyle}>下载其他格式</span>
                <span onClick={this.codeBeauty}>二维码美化</span>
              </div>
            </div>
            <div className={styles.moreaction}>
              <Button
                className={styles.btnItem}
                data-analyze={[2, 3]}
                onClick={this.edit}
              >
                编辑
              </Button>
              <Button
                className={styles.btnItem}
                data-analyze={[2, 2]}
                onClick={this.copy}
              >
                复制
              </Button>
              <Button className={styles.btnItem} onClick={this.delete}>删除</Button>
            </div>
          </div>
        </div>
        { QrcodeModelTemplate }
        { BeautifyFrameTemplate }
        <div className={`${editStatus ? '' : styles.none} ${styles.qrcodemask}`} onClick={this.cancelEditStatus} />
      </div>
    );
  }
}
export default connect(state => ({
  lists: state.activeCode.lists,
  QrcodeMsg: state.activeCode.QrcodeMsg,
  DeleteMsg: state.activeCode.DeleteMsg,
  CodeCopyMsg: state.activeCode.CodeCopyMsg,
  currentUser: state.user.currentUser,
  CodeRenameMsg: state.activeCode.CodeRenameMsg, // 码的重命名
  QrcodeMsgLoading: state.activeCode.QrcodeMsgLoading,
}))(viewCode);
