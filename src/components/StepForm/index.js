import React, { PureComponent } from 'react';
import { Steps, message } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import { getUrlPara } from '../../utils/utils.js';
import styles from './index.less';

const { Step } = Steps;

class StepForm extends PureComponent {
  state = {
    curStep: this.props.curStep,
    SceneMsg: [],
    isOpenSceneMsg: this.props.isOpenSceneMsg,
  };

  componentWillMount() {
    const { dispatch, curId } = this.props;
    dispatch({
      type: 'activeCode/GetSceneMsg',
      payload: { scene_module_id: curId },
      callback: () => {
        if (this.props.SceneMsgItem.code
          && this.props.SceneMsgItem.code !== undefined
          && this.props.SceneMsgItem.code === 1) {
          this.setState({
            SceneMsg: this.props.SceneMsgItem.data,
          });
        } else {
          message.error(this.props.SceneMsgItem.msg);
        }
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        isOpenSceneMsg: nextProps.isOpenSceneMsg,
      });
    }
  }

  getCurrentComponent() {
    const { curStep } = this.state;
    const componentMap = {
      0: Step1,
      1: Step2,
      2: Step3,
      3: Step4,
    };
    return componentMap[curStep];
  }

  step1 = () => {
    this.setState({ curStep: 1 });
  }

  step2 = (id) => {
    if (id === 1) {
      this.setState({ curStep: 2 });
    } else if (id === -1) {
      this.setState({ curStep: 0 });
    }
  }

  step3 = (id) => {
    if (id === 1) {
      this.setState({ curStep: 3 });
    } else if (id === -1) {
      this.setState({ curStep: 1 });
    }
  }

  // step4 = (id) => {
  //   if (id === -1) {
  //     this.setState({ curStep: 2 });
  //   }
  // }

  skipGuild = (id) => {
    const { dispatch, location } = this.props;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const curpage = parseInt(page, 10);
    const catalogId = parseInt(cataId, 10);
    dispatch({
      type: 'activeCode/isOpenScene',
      payload: { isOpenScene: false },
      callback: () => {
      },
    });
    dispatch(routerRedux.replace(`/edit/${id}?categoryId=${catalogId}&p=${curpage}`));
  }

  StartBuildCode = (id) => {
    const { dispatch, location } = this.props;
    const { search } = location;
    const cataId = getUrlPara('categoryId', search);
    const page = getUrlPara('p', search);
    const curpage = parseInt(page, 10);
    const catalogId = parseInt(cataId, 10);
    dispatch({
      type: 'activeCode/isOpenScene',
      payload: { isOpenScene: false },
      callback: () => {
      },
    });
    dispatch(routerRedux.replace(`/edit/${id}?categoryId=${catalogId}&p=${curpage}`));
  }

  changeIsOpen = (value, id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'activeCode/isOpenScene',
      payload: { isOpenScene: value, id },
      callback: () => {
      },
    });
  }

  render() {
    const { curStep, SceneMsg, isOpenSceneMsg } = this.state;
    const CurrentComponent = this.getCurrentComponent();
    return (
      <div className={styles.root}>
        <div>
          <Steps className={styles.steps} size="small" current={curStep} >
            <Step title="使用场景" />
            <Step title="建码步骤" />
            <Step title="印刷排版" />
          </Steps>
          <CurrentComponent
            step1={this.step1}
            step2={this.step2}
            step3={this.step3}
            skipGuild={this.skipGuild}
            StartBuildCode={this.StartBuildCode}
            SceneMsg={SceneMsg}
            changeIsOpen={this.changeIsOpen}
            isOpenSceneMsg={isOpenSceneMsg}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  SceneMsgItem: state.activeCode.SceneMsgItem,
  isOpenSceneMsg: state.activeCode.isOpenSceneMsg,
}))(StepForm);
