// import React from 'react';
// import { Icon } from 'antd';

const data = [{
  name: 'courseInfo',
  key: 1,
  columns: [{
    title: '课程名称',
    dataIndex: 'col1',
    key: 'col1',
  }, {
    title: '课程介绍',
    dataIndex: 'col2',
    key: 'col2',
  }],
  data: [{
    key: 1,
    col1: 'Excel学习',
    col2: '首个office商业BI系统',
  }, {
    key: 2,
    col1: '数据分析',
    col2: 'PPT页面版式设计',
  }, {
    key: 3,
    col1: '导图速成',
    col2: '案例解析，直击效果',
  }],
}, {
  name: 'paramInfo',
  key: 2,
  columns: [{
    title: '参数说明',
    colSpan: 2,
    dataIndex: 'col1',
    key: 'col1',
  }, {
    title: '',
    colSpan: 0,
    dataIndex: 'col2',
    key: 'col2',
  }],
  data: [{
    key: 1,
    col1: '规格',
    col2: '220*210cm',
  }, {
    key: 2,
    col1: '厂商',
    col2: '邻家网络科技有限公司',
  }, {
    key: 3,
    col1: '地址',
    col2: '宁波翠柏路89号',
  }, {
    key: 4,
    col1: '热线',
    col2: '4000020232',
  }],
}, {
  name: 'checkInfo',
  key: 3,
  columns: [{
    title: '检查记录',
    colSpan: 3,
    dataIndex: 'col1',
    key: 'col1',
  }, {
    title: '',
    colSpan: 0,
    dataIndex: 'col2',
    key: 'col2',
  }, {
    title: '',
    colSpan: 0,
    dataIndex: 'col3',
    key: 'col3',
  }],
  data: [{
    key: 1,
    col1: '1',
    col2: 'B6巧厢的连接性检查',
    col3: '合格',
  }, {
    key: 2,
    col1: '2',
    col2: 'B6联轴器运作的检查',
    col3: '合格',
  }, {
    key: 3,
    col1: '3',
    col2: 'B6控制箱正常检查',
    col3: '合格',
  }, {
    key: 4,
    col1: '4',
    col2: 'B6的整体消毒是否完善',
    col3: '不合格',
  }],
}, {
  name: 'movieInfo',
  key: 4,
  columns: [{
    title: '#',
    colSpan: 1,
    dataIndex: 'col1',
    key: 'col1',
  }, {
    title: '电影',
    colSpan: 1,
    dataIndex: 'col2',
    key: 'col2',
  }, {
    title: '年份',
    colSpan: 1,
    dataIndex: 'col3',
    key: 'col3',
  }],
  data: [{
    key: 1,
    col1: '1',
    col2: '首个office商业BI系统',
    col3: '1993',
  }, {
    key: 2,
    col1: '2',
    col2: 'PPT页面板式设计',
    col3: '1995',
  }, {
    key: 3,
    col1: '3',
    col2: '案例解析，直击效果',
    col3: '2002',
  }, {
    key: 4,
    col1: '4',
    col2: '适合初学者',
    col3: '2010',
  }],
}, {
  name: 'specificationInfo',
  key: 5,
  columns: [{
    title: '',
    colSpan: 0,
    dataIndex: 'col1',
    key: 'col1',
  }, {
    title: '',
    colSpan: 0,
    dataIndex: 'col2',
    key: 'col2',
  }],
  data: [{
    key: 1,
    col1: '规格',
    col2: '220*210cm',
  }, {
    key: 2,
    col1: '厂商',
    col2: '邻家网络科技有限公司',
  }, {
    key: 3,
    col1: '热线',
    col2: '4000020232',
  }, {
    key: 4,
    col1: '价格',
    col2: '¥599',
  }],
}, {
  name: 'peopleInfo',
  key: 6,
  columns: [{
    title: '本次大会参与人员',
    colSpan: 4,
    dataIndex: 'col1',
    key: 'col1',
  }, {
    title: '',
    colSpan: 0,
    dataIndex: 'col2',
    key: 'col2',
  }, {
    title: '',
    colSpan: 0,
    dataIndex: 'col3',
    key: 'col3',
  }, {
    title: '',
    colSpan: 0,
    dataIndex: 'col4',
    key: 'col4',
  }],
  data: [{
    key: 1,
    col1: '张峰',
    col2: '刘帅帅',
    col3: '叶青',
    col4: '王杰',
  }, {
    key: 2,
    col1: '叶欣欣',
    col2: '李正龙',
    col3: '王磊',
    col4: '赵琳',
  }, {
    key: 3,
    col1: '赵晓路',
    col2: '陆恒',
    col3: '沈涛涛',
    col4: '钱多多',
  }, {
    key: 4,
    col1: '慕炎',
    col2: '潘光德',
    col3: '林奇',
    col4: '艾阳',
  }],
}];

export function getTableInfo() {
  return data;
}

export default data;
