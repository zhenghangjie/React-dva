import React from 'react';
import { Layout, Spin, Dropdown, Icon } from 'antd';
import {
  getUrlPara,
  formatFileSize,
} from '../../utils/utils.js';
import { getOriginData } from '../../common/origin';
import styles from './index.less';


const { Header } = Layout;


export default ({
  capacityInfo,
  currentUser,
  menu,
  clickfunction,
  pathname,
  width,
  // location,
  helpState,
  changeHelpStatus,
  history,
  clickHelpStatus = ((value) => { changeHelpStatus(value); }),
}) => {
  const { search } = location;
  const origin = getOriginData();
  const cataId = getUrlPara('categoryId', search);
  // const page = getUrlPara('p', search);
  // const pageSize = getUrlPara('page_size', search);
  // const curpage = parseInt(page, 10);
  const catalogId = parseInt(cataId, 10);
  // const curPageSize = parseInt(pageSize, 10);

  let fileIsOver = 0;
  let imgIsOver = 0;


  let capacityFile;
  let capacityImg;
  if (currentUser.data && currentUser.data !== undefined) {
    capacityFile = formatFileSize(currentUser.data.edition_info.capacity_file);
    capacityImg = formatFileSize(currentUser.data.edition_info.capacity_img);
  } else {
    capacityImg = '';
    capacityFile = '';
  }

  let curcapacityFile;
  let curcapacityImg;
  if (capacityInfo
      && capacityInfo.data !== undefined
      && currentUser.data
      && currentUser.data !== undefined) {
    curcapacityFile = formatFileSize(capacityInfo.data.file);
    curcapacityImg = formatFileSize(capacityInfo.data.img);
    if (currentUser.data.edition_info.capacity_file * 0.9 < capacityInfo.data.file
      && currentUser.data.edition_info.capacity_file > capacityInfo.data.file) {
      fileIsOver = 2;
    } else if (currentUser.data.edition_info.capacity_file < capacityInfo.data.file) {
      fileIsOver = 1;
    }

    if (currentUser.data.edition_info.capacity_img * 0.9 < capacityInfo.data.img
      && currentUser.data.edition_info.capacity_img > capacityInfo.data.img) {
      imgIsOver = 2;
    } else if (currentUser.data.edition_info.capacity_img < capacityInfo.data.img) {
      imgIsOver = 1;
    }
  } else {
    curcapacityFile = '';
    curcapacityImg = '';
  }

  let overText;
  let isOver = 0;
  if (imgIsOver === 1 && fileIsOver === 1) {
    overText = '图片与文件都';
    isOver = 1;
  } else if (imgIsOver === 1) {
    overText = '图片';
    isOver = 1;
  } else if (fileIsOver === 1) {
    overText = '文件';
    isOver = 1;
  } else if (imgIsOver === 2 && fileIsOver === 2) {
    overText = '图片与文件都';
    isOver = 0;
  } else if (imgIsOver === 2) {
    overText = '图片';
    isOver = 0;
  } else if (fileIsOver === 2) {
    overText = '文件';
    isOver = 0;
  }


  const HeaderTopText = () => {
    if (pathname.indexOf('/addcode') > -1) {
      return (<span onClick={() => history.push(`/active/activecode?categoryId=${catalogId}`)} className={styles.addBack}><i className="anticon anticon-cli-angle-left" />返回</span>);
    } else if (pathname.indexOf('/viewcode/') > -1) {
      return (<span onClick={() => history.push(`/active/activecode?categoryId=${catalogId}`)} className={styles.addBack}><i className="anticon anticon-cli-angle-left" />返回</span>);
    } else if (pathname.indexOf('/active/activecode') > -1) {
      return (
        <div className={styles.codeTypeBox}>
          <a href="//cli.im">
            <span className={styles.logo} />
          </a>
          <span>
            容量使用情况：图片
            <span className={`${imgIsOver === 1 ? styles.red : ''}`}>{curcapacityImg}</span>/{capacityImg}，文件
            <span className={`${fileIsOver === 1 ? styles.red : ''}`}>{curcapacityFile}</span>/{capacityFile}。
          </span>
          <span className={`${imgIsOver > 0 || fileIsOver > 0 ? styles.up : styles.none}`}>
            {overText}容量{isOver === 1 ? '已经' : '将要'}超标，为了不影响你的正常使用，建议<a target="_blank" rel="noopener noreferrer" href={`${origin.bizDomain}/buy`}>升级版本</a>!
          </span>
        </div>
      );
    } else if (pathname.indexOf('/active/members') > -1) {
      return (
        <div className={styles.codeTypeBox}>
          <span className={styles.codeType}>成员管理</span>
        </div>
      );
    }
  };

  const toptext = HeaderTopText();
  return (
    <Header className={styles.header} style={{ width }}>
      <div className={styles.left}>
        {toptext}
      </div>
      <div className={styles.right}>
        <a href="//cli.im" className={styles.indexLink} onClick={clickfunction}>返回首页</a>
        <i onClick={() => clickHelpStatus(true)} className={`anticon anticon-cli-question-o ${styles.questionHelp}`} />
        <div className={`${helpState ? '' : styles.none} ${styles.helpCenterBox}`}>
          <div className={styles.helpTop}>
            帮助
            <span className={styles.guideTop} />
            <span className={styles.pointer} onClick={() => clickHelpStatus(false)}><i className="anticon anticon-cli-close-1" /></span>
          </div>
          <a href="//cli.im/news/category/newsreport" target="_blank" rel="noopener noreferrer" className={`${styles.orderFunc} ${styles.b_r}`}>
            <i className="anticon anticon-cli-update" />
            <span>更新日志</span>
          </a>
          <a href="//cli.im/news/category/newsreport" target="_blank" rel="noopener noreferrer" className={styles.orderFunc}>
            <i className="anticon anticon-cli-solution" />
            <span>帮助中心</span>
          </a>
        </div>
        <div className={`${helpState ? styles.helpMask : styles.none}`} onClick={() => clickHelpStatus(false)} />
        {
          // <i className={`fa fa-question-circle ${styles.questionHelp}`} />
        }
        {currentUser.data ? (
          <Dropdown overlay={menu} trigger={['click']}>
            <span className={`${styles.action} ${styles.account}`}>
              <Icon type="user" style={{ marginRight: '3px' }} />
              {currentUser.data.user_info && currentUser.data.user_info.account}
              <i className={`anticon anticon-cli-caretdown ${styles.downbtn}`} />
            </span>
          </Dropdown>
        ) : <Spin size="small" style={{ marginLeft: 8 }} />}
      </div>
    </Header>
  );
};
