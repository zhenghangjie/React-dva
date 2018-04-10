import BasicLayout from '../layouts/BasicLayout';
import EditLayout from '../layouts/EditLayout';
import Img from '../routes/Edit/Img';
import Text from '../routes/Edit/Text';
import Video from '../routes/Edit/Video';
import Table from '../routes/Edit/Table';
import activeCode from '../routes/ActiveCode';
import members from '../routes/Members';
import addCode from '../routes/ActiveCode/addCode';
import viewCode from '../routes/ActiveCode/viewCode';
import '../iconfont.less'; // 引入字体样式文件


const data = [{
  component: BasicLayout,
  layout: 'BasicLayout',
  children: [{
    name: '概况',
    icon: 'cli-general',
    path: '/',
  }, {
    name: '静态码',
    path: 'static',
    icon: 'cli-static-code',
    children: [{
      name: '文本',
      path: 'https://cli.im/user/static?t=text',
    }, {
      name: '微信',
      path: 'https://cli.im/user/static?t=weixin',
    }, {
      name: '网址',
      path: 'https://cli.im/user/static?t=url',
    }],
  }, {
    name: '活码小程序版',
    path: 'active',
    icon: 'cli-new-code',
    children: [{
      name: '活码',
      path: 'activecode',
      component: activeCode,
      children: [{
        path: 'addcode',
        component: addCode,
      }, {
        path: 'viewcode/:id',
        component: viewCode,
      }],
    }, {
      name: '人员管理',
      path: 'members',
      component: members,
    }, {
      path: 'addcode',
      component: addCode,
    }, {
      path: 'viewcode/:id',
      component: viewCode,
    }],
  }, {
    name: '活码（旧版）',
    path: 'qrcode',
    icon: 'cli-qrcode',
    children: [{
      name: '文本码',
      path: 'https://cli.im/user/active?t=text',
    }, {
      name: '图文码',
      path: 'https://cli.im/user/active?t=imgtext',
    }, {
      name: '文件码',
      path: 'https://cli.im/user/active?t=file',
    }, {
      name: '网址码',
      path: 'https://cli.im/user/active?t=web',
    }, {
      name: '商品码',
      path: 'https://cli.im/user/active/pro',
    }, {
      name: '名片码',
      path: 'https://biz.cli.im/vcard',
    }, {
      name: '企业码',
      path: 'https://biz.cli.im/index',
    }],
  }, {
    name: '高级活码',
    path: 'active_advance',
    icon: 'cli-senior-qrcode',
    children: [{
      name: '记录码',
      path: 'https://biz.cli.im/Rec/reclist',
    }, {
      name: '溯源码',
      path: 'https://cli.im/user/origin/category',
    }, {
      name: '行业解决方案',
      path: 'https://biz.cli.im/product/guide',
    }],
  }, {
    name: '设置',
    path: 'setting',
    icon: 'cli-set',
    children: [{
      name: '素材',
      path: 'https://biz.cli.im/sucai',
    }, {
      name: '美化模版',
      path: 'https://user.cli.im/beautify',
    }],
  }, {
    name: '编辑',
    icon: 'cli-solution',
    path: '/edit',
  }],
}, {
  component: EditLayout,
  layout: 'EditLayout',
  children: [{
    name: '多媒体基础组件',
    icon: 'cli-new-code',
    path: 'edit',
    children: [{
      name: '文本',
      path: 'text',
      icon: 'cli-txt',
      component: Text,
    }, {
      name: '图片',
      path: 'image',
      icon: 'cli-image',
      component: Img,
    }, {
      name: '文件',
      path: 'file',
      icon: 'cli-file',
      component: File,
    }, {
      name: '音频',
      path: 'audio',
      icon: 'cli-audio',
      component: Audio,
    }, {
      name: '视频',
      path: 'video',
      icon: 'cli-video',
      component: Video,
    }, {
      name: '表格',
      path: 'table',
      icon: 'cli-form',
      component: Table,
    }],
  }],
}];

const activeNav = {
  name: '活码小程序版',
  path: 'active',
  key: 'nav_active_2',
  icon: 'cli-new-code',
  children: [{
    name: '二维码列表',
    path: 'activecode',
    component: activeCode,
    children: [{
      path: 'addcode',
      component: addCode,
    }, {
      path: 'viewcode/:id',
      component: viewCode,
    }],
  }, {
    name: '人员管理',
    path: 'members',
    component: members,
  }, {
    path: 'addcode',
    component: addCode,
  }, {
    path: 'viewcode/:id',
    component: viewCode,
  }],
};

export function getActiveNav() {
  return activeNav;
}


export function getNavData() {
  return data[0].children;
}

export function getModuleData() {
  return data[1].children;
}
export default data;
