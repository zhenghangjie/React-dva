import React from 'react';
import Cookies from 'universal-cookie';
import { Layout, Menu, Icon } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import styles from './BasicLayout.less';
import { getActiveNav } from '../common/nav';
// import activeCode from '../routes/ActiveCode';
// import addCode from '../routes/ActiveCode/addCode';
// import viewCode from '../routes/ActiveCode/viewCode';

import { getOriginData } from '../common/origin';
import { getRouteData } from '../utils/utils';
import Header from '../components/Header';
import CustomerContent from '../components/cusManager';


const { Sider, Content } = Layout;
const { SubMenu } = Menu;
let currentOpenKeys = [];

class BasicLayout extends React.Component {
  constructor(props) {
    super(props);
    // 把一级 Layout 的 children 作为菜单项
    this.origin = getOriginData();
    this.state = {
      // collapsed: false,
      // openKeys: this.getDefaultCollapsedSubMenus(props),
      windowWidth: window.innerWidth,
      menus: [],
      capacityInfo: {},
      helpState: false,
    };
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchCurrent',
      callback: () => {
        this.getInitMenu();
      },
    });
    this.props.dispatch({
      type: 'user/fetchCapacity',
      callback: () => {
        if (this.props.capacityInfo.code === 1) {
          this.setState({
            capacityInfo: this.props.capacityInfo,
          });
        }
      },
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.whenResize);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      capacityInfo: nextProps.capacityInfo,
    });
  }


  componentWillUpdate() {
    clearTimeout(this.resizeTimeout);
  }
  getInitMenu = () => {
    const { currentUser } = this.props;
    const { menus } = this.state;
    if (currentUser.code === 1) {
      const menuJson = JSON.parse(currentUser.data.user_config_info.user_route_json);
      let i;
      let key;
      // 链接filter 路由验证(根据协议判断直接跳转 or router)
      const linkFilter = (link) => {
        if (link && link.indexOf('//' === 0)) {
          return `https:${link}`;
        } else {
          return link;
        }
      };
      let j = 0;
      for (i in menuJson) {
        if (Object.prototype.hasOwnProperty.call(menuJson, i)) {
          let obj = {
            name: menuJson[i].name,
            icon: menuJson[i].icon_class.replace(/clicon-nav/, 'cli'), // 替换老系统icon
            path: linkFilter(menuJson[i].link) || i,
            children: [],
            key: `nav_active_${j}`,
          };
          j += 1;
          if (menuJson[i].cata) {
            const objChildren = menuJson[i].cata;
            for (key in objChildren) {
              if (Object.prototype.hasOwnProperty.call(objChildren, key)) {
                const objChildItem = {
                  name: objChildren[key].name,
                  path: linkFilter(objChildren[key].link),
                };
                obj.children.push(objChildItem);
              }
            }
          }
          if (menuJson[i].sys === 'console') { // 嫩草系统内部走组件路由
            obj = getActiveNav();
          }
          menus.push(obj);
        }
      }
      this.setState({ menus });
    }
  }
  // getDefaultCollapsedSubMenus(props) {
  //   const currentMenuSelectedKeys = [...this.getCurrentMenuSelectedKeys(props)];
  //   currentMenuSelectedKeys.splice(-1, 1);
  //   if (currentMenuSelectedKeys.length === 0) {
  //     return ['dashboard'];
  //   }
  //   return currentMenuSelectedKeys;
  // }
  getCurrentMenuSelectedKeys(props) {
    const { location: { pathname } } = props || this.props;
    const { menus } = this.state;
    const keys = pathname.split('/').slice(1);
    if (keys.length === 1 && keys[0] === '') {
      return [menus[0].key];
    }
    return keys;
  }
  getNavMenuItems(menusData, parentPath = '') {
    if (!menusData) {
      return [];
    }
    return menusData.map((item) => {
      if (!item.name) {
        return null;
      }
      let itemPath;
      if (item.path.indexOf('http') === 0) {
        itemPath = item.path;
      } else {
        itemPath = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
      }
      if (item.children && item.children.some(child => child.name)) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  <Icon type={item.icon} />
                  <span>{item.name}</span>
                </span>
              ) : item.name
            }
            key={item.key || item.path}
          >
            {this.getNavMenuItems(item.children, itemPath)}
          </SubMenu>
        );
      }
      const icon = item.icon && <Icon type={item.icon} />;
      return (
        <Menu.Item key={item.key || item.path}>
          {
            /^https?:\/\//.test(itemPath) ? (
              <a href={itemPath} target={item.target}>
                {icon}<span>{item.name}</span>
              </a>
            ) : (
              <Link to={itemPath} target={item.target}>
                {icon}<span>{item.name}</span>
              </Link>
            )
          }
        </Menu.Item>
      );
    });
  }
  getPageTitle() {
    const { location } = this.props;
    const { pathname } = location;
    let title = '草料二维码管理中心';

    if (pathname === '/active/addCode') {
      title = '添加活码';
    }

    if (pathname.indexOf('/active/viewCode/') > -1) {
      title = '预览活码';
    }

    getRouteData('BasicLayout').forEach((item) => {
      if (item.path === pathname) {
        title = `${item.name}`;
      }
    });
    return title;
  }
  // handleOpenChange = (openKeys) => {
  //   const lastOpenKey = openKeys[openKeys.length - 1];
  //   const isMainMenu = this.menus.some(
  //     item => (item.key === lastOpenKey || item.path === lastOpenKey)
  //   );
  //   this.setState({
  //     openKeys: isMainMenu ? [lastOpenKey] : [...openKeys],
  //   });
  // }
  getActiveMenuKeys = () => {
    const openNameKeys = [];
    for (let i = 1; i < 6; i += 1) {
      const cookies = new Cookies();
      const openNameVal = `nav_active_${i}`;
      const openName = cookies.get(openNameVal);
      if (parseInt(openName, 10) === 1 || i === 2) {
        openNameKeys.push(openNameVal);
      }
    }
    currentOpenKeys = openNameKeys;
    return openNameKeys;
  }
  handleOpenChange = (openKeys) => {
    const a = new Set(openKeys);
    const b = new Set(currentOpenKeys);
    const hostName = window.location.hostname.split('.');
    const hostNameString = `.${hostName[hostName.length - 2]}.${hostName[hostName.length - 1]}`;
    if (openKeys.length > currentOpenKeys.length) {
      const differOpenKeys = Array.from(new Set([...a].filter(x => !b.has(x))));
      differOpenKeys.forEach((value) => {
        const cookies = new Cookies();
        cookies.set(value, '1', { domain: hostNameString, path: '/' });
      });
    } else {
      const differOpenKeys = Array.from(new Set([...b].filter(x => !a.has(x))));
      differOpenKeys.forEach((value) => {
        const cookies = new Cookies();
        cookies.set(value, '0', { domain: hostNameString, path: '/' });
      });
    }
    currentOpenKeys = openKeys;
  }
  modifyPassword = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
      payload: {
        no: 22,
        aaa: 33,
      },
      callback: () => {
      },
    });
  }
  changeHelpStatus = (value) => {
    this.setState({ helpState: value });
  }
  // whenResize = () => {
  //   const width = window.innerWidth - 200;
  //   this.setState({ windowWidth: width });
  // }
  render() {
    const { currentUser, location, history } = this.props;
    const { userDomain } = this.origin;
    const { pathname } = location;
    const {
      windowWidth,
      menus,
      capacityInfo,
      helpState,
    } = this.state;
    const menu = (
      <Menu className={styles.menu}>
        <Menu.Item><a href={`${userDomain}/center/userinfo`}>账户详情</a></Menu.Item>
        <Menu.Item><a href={`${userDomain}/password/edit`}>修改密码</a></Menu.Item>
        <Menu.Item><a href={`${userDomain}/login/out`}>安全退出</a></Menu.Item>
      </Menu>
    );
    // Don't show popup menu when it is been collapsed
    // const menuProps = this.state.collapsed ? {} : {
    //   openKeys: this.state.openKeys,
    // };

    const layout = (
      <Layout style={{ minWidth: '1280px' }}>
        <Sider
          style={{ overflow: 'visible', position: 'fixed', left: 0, zIndex: 1101, top: '57px', bottom: 0, boxShadow: 'none' }}
          width={220}
          className={styles.sider}
        >
          {
            menus.length > 0 &&
            <Menu
              theme="dark"
              mode="inline"
              // {...menuProps}
              selectedKeys={this.getCurrentMenuSelectedKeys()}
              defaultOpenKeys={this.getActiveMenuKeys()}
              onOpenChange={this.handleOpenChange}
              className={styles.siderMenu}
              style={{ width: '100%' }}
            >
              {this.getNavMenuItems(menus)}
            </Menu>
          }
        </Sider>
        <CustomerContent currentUser={currentUser} />
        <Layout style={{ marginLeft: 220 }}>
          <Header
            currentUser={currentUser}
            capacityInfo={capacityInfo}
            pathname={pathname}
            menu={menu}
            clickfunction={this.modifyPassword}
            width={windowWidth}
            location={location}
            helpState={helpState}
            changeHelpStatus={this.changeHelpStatus}
            history={history}
          />
          <Content style={{ height: '100%', marginTop: '56px' }}>
            <Layout>
              <Switch>
                {
                  getRouteData('BasicLayout').map(item =>
                    (
                      <Route
                        exact={item.exact}
                        key={item.path}
                        path={item.path}
                        component={item.component}
                      />
                    )
                  )
                }
              </Switch>
            </Layout>
          </Content>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(state => ({
  currentUser: state.user.currentUser,
  capacityInfo: state.user.capacityInfo,
}))(BasicLayout);
