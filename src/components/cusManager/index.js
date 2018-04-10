import React from 'react';
import { Layout, Icon, Tooltip } from 'antd';
import styles from './index.less';

function ToolTipsTitle() {
  return (
    <div>
      <p className={styles.tipsContent}>问题解答，操作指南，业务咨询</p>
      <p className={styles.tipsContent}>任何问题都可以找我解决。</p>
      <p className={styles.tipsColor}>工作时间：工作日9:00～17:30</p>
    </div>
  );
}

export default ({ currentUser }) => {
  return (
    <div className={styles.cusContent}>
      {currentUser.data ? (
        <Layout>
          <Tooltip overlayClassName={styles.toolTipStyle} placement="topLeft" title={ToolTipsTitle}>
            <a className={styles.footerService} href={`${currentUser.data.manager_info.group_link}`} target="_blank" rel="noopener noreferrer">
              <img className={styles.cusPhoto} src={`${currentUser.data.manager_info.logo_pic}`} alt="" />
              <span className={styles.portraitmbellish} />
              <div className={styles.managerInfo}>
                <div className={styles.contentInfo}>
                  <span className={styles.managerName}>
                    {currentUser.data.manager_info.realname}
                  </span>
                  <span className={styles.managerType}>
                    {currentUser.data.manager_info.star_text}
                  </span>
                </div>
                <Icon type="cli-qq" className={styles.managerQQ} />
              </div>
            </a>
          </Tooltip>
          <div className={styles.serviceTel}>
            <Icon type="cli-phone" className={styles.managerPhone} />
            <span>{currentUser.data.manager_info.telphone}</span>
          </div>
          <div className={styles.helpContent}>
            <a className={styles.managerHelp} href="//cli.im/news/faq" target="_blank" rel="noopener noreferrer">帮助中心</a>
          </div>
        </Layout>
        ) : '' }
    </div>
  );
};
