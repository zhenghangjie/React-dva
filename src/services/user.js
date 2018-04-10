import request from '../utils/request';
import { getOriginData } from '../common/origin';
import { toQueryString } from '../utils/utils';

const { ncApiDomain, analysisUrl } = getOriginData();

export async function query() {
  return request('/api/users');
}

export async function queryCurrent(params) {
  let url;
  if (params) {
    url = `${ncApiDomain}/user/initUserSession?not_valid=${params.notValid}`;
  } else {
    url = `${ncApiDomain}/user/initUserSession`;
  }
  return request(url, {
    method: 'GET',
  });
}

export async function queryCapacity(params) {
  let url;
  if (params) {
    url = `${ncApiDomain}/user/overview/capacity?not_valid=${params.notValid}`;
  } else {
    url = `${ncApiDomain}/user/overview/capacity`;
  }
  return request(url, {
    method: 'GET',
  });
}

export async function queryssoInfo(param) {
  return request(`${ncApiDomain}/api/sso/sso_server?ssid=${param.ssid}&keepstate=${param.keepstate}&type=${param.type}&jsonpCallback=${param.jsonpCallback}`, {
    method: 'GET',
  });
}

export async function postclicklog(params) {
  return request(`${analysisUrl}/log/click`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

export async function updateCompanyMsg(params) {
  return request(`${ncApiDomain}/user/updateCompanyMsg`, {
    method: 'POST',
    body: toQueryString(params),
  });
}
