import React from 'react';
import { Modal, message, Spin } from 'antd';
import { connect } from 'dva';
import indexOf from 'lodash/indexOf';
// import { routerRedux } from 'dva/router';
import { AddCodeItem } from '../../components/ActiveCode';
import StepForm from '../../components/StepForm';
import { getUrlPara } from '../../utils/utils.js';
import styles from './addCode.less';


class addCode extends React.Component {
  state = {
    modal2Visible: false,
    curId: 1, // 选中的场景
    SceneLists: [],
    preserName: '',
    curStep: 0,
    // isOpenSceneMsg: this.props.isOpenSceneMsg,
    // treeData: this.props.treeData,
    curRandow: 1,
  };

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'activeCode/addScene',
      callback: () => {
        if (this.props.SceneMsg && this.props.SceneMsg.code === 1) {
          this.setState({
            SceneLists: this.props.SceneMsg.data,
          });
        } else if (this.props.SceneMsg && this.props.SceneMsg.code === 0) {
          message.error(this.props.SceneMsg.msg.text);
        } else {
          message.error('数据出错');
        }
      },
    });
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        // isOpenSceneMsg: nextProps.isOpenSceneMsg,
      });
    }
  }


  onBack = () => {
    const { history } = this.props;
    history.goBack();
  }

  setModal2Visible = (modal2Visible) => {
    this.setState({
      modal2Visible,
      curStep: 0,
    });
  }

  back = () => {
    window.history.back();
  }
  imgText =() => {
    this.setState({ curId: 2 });
    this.setModal2Visible(true);
  }

  education = () => {
    this.setState({ curId: 3 });
    this.setModal2Visible(true);
  };

  video = () => {
    this.setState({ curId: 4 });
    this.setModal2Visible(true);
  }

  closeScene = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'activeCode/isOpenScene',
      payload: { isOpenScene: false },
      callback: () => {
      },
    });
    this.setState({
      curRandow: Math.random(),
    });
    this.setModal2Visible(false);
  }

  blankBuild = () => {
    const { location, history, dispatch } = this.props;
    // 数据埋点
    dispatch({
      type: 'user/clicklog',
      payload: {
        fir: 100, // 场景的新建
        sec: 0,
      },
    });

    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const catalogId = parseInt(cataId, 10);
    history.replace(`/edit?categoryId=${catalogId}&p=${page}`);
  }

  presetCode = (data) => {
    // const { isOpenSceneMsg } = this.state;
    const { location, history, dispatch } = this.props;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const curpage = parseInt(page, 10);
    const catalogId = parseInt(cataId, 10);
    // 数据埋点
    dispatch({
      type: 'user/clicklog',
      payload: {
        fir: 100, // 场景的新建
        sec: data.preset_code_id,
      },
    });

    const arrays = JSON.parse(localStorage.getItem('openArr'));
    // const isOpenSceneLocalstorage = localStorage.getItem('isOpenScene');

    let isOpenArr;

    if (arrays && arrays !== undefined && arrays.length > 0) {
      isOpenArr = arrays;
    } else {
      isOpenArr = [];
    }

    const isOpenId = indexOf(isOpenArr, data.id);

    if (isOpenId > -1) {
      history.replace(`/edit/${data.preset_code_id}?categoryId=${catalogId}&p=${curpage}`);
    } else if (data.need_guide === 0) {
      history.replace(`/edit/${data.preset_code_id}?categoryId=${catalogId}&p=${curpage}`);
    } else {
      this.setState({
        curId: data.id,
        preserName: data.name,
        curRandow: data.id,
      });
      this.setModal2Visible(true);
    }
  }

  render() {
    const { curId, SceneLists, preserName, curStep, curRandow } = this.state;
    const { location, history } = this.props;

    const AddCodeLists =
      SceneLists.length > 0
        ?
        (
          <AddCodeItem
            lists={SceneLists}
            presetCode={this.presetCode}
            location={location}
            history={history}
            blankBuild={this.blankBuild}
          />
        )
        :
        (
          <div className={styles.example}>
            <Spin />
          </div>
        );


    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <h2>请选择场景新建二维码</h2>
          <div>新版二维码仅支持使用微信扫一扫，在小程序打开页面，速度更快体验更佳</div>
        </header>
        <div className={styles.itemBox}>
          {AddCodeLists}
        </div>
        {
          // <Button onClick={this.onBack}>返回</Button>
        }
        <Modal
          title=""
          key={curRandow} // 为了解决modal关闭后状态不会自动清空。 如果希望每次打开都是新内容，需要自行手动清空旧的状态。
          wrapClassName={styles.scenes}
          footer={null}
          width={860}
          visible={this.state.modal2Visible}
          onOk={() => this.setModal2Visible(false)}
          onCancel={this.closeScene}
        >
          <StepForm
            curId={curId}
            preserName={preserName}
            curStep={curStep}
            location={location}
          />
        </Modal>
      </div>
    );
  }
}
export default connect(state => ({
  lists: state.activeCode.lists,
  SceneMsg: state.activeCode.SceneMsg,
  treeData: state.user.tree_data,
  isOpenSceneMsg: state.activeCode.isOpenSceneMsg,
}))(addCode);
