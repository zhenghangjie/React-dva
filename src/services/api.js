import request from '../utils/request';
import { getOriginData } from '../common/origin';
import { toQueryString } from '../utils/utils';

const { ncApiDomain, uploadTokenUrl, uploadBase64Url } = getOriginData();

export async function queryEditList(params) {
  return request(`${ncApiDomain}/qrcode/getQrcodeMsg?id=${params}`, {
    method: 'GET',
  });
}

export async function queryDefaultList() {
  return request(`${ncApiDomain}/qrcode/getDefaultComponentMsg`, {
    method: 'GET',
  });
}

export async function postQrcodeMsg(params) {
  return request(`${ncApiDomain}/qrcode/operateQrcodeMsg`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

export async function getUploadToken(params) {
  return request(`${uploadTokenUrl}/${params.ext}`, {
    method: 'GET',
  });
}

export async function uploadBase64(params) {
  return request(`${uploadBase64Url}`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

export async function showCollectControll(params) {
  return request(`${ncApiDomain}/user/user_set`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 企业名片接口

// export async function getOrgModuleId(params) {
//   return request('//nc.cliim.net/scene/getMenuList?module_id=2', {
//     method: 'GET',
//     body: toQueryString(params),
//   });
// }

// 获取目录树内容
export async function getCatalogTree(params) {
  return request(`${ncApiDomain}/category/getCatalogTree`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 添加树节点
export async function addCatalogNode(params) {
  return request(`${ncApiDomain}/category/addCatalogNode`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 更新树节点
export async function updateCatalogNode(params) {
  return request(`${ncApiDomain}/category/updateCatalogNodeMsg`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 删除树节点
export async function deleteCatalogNode(params) {
  return request(`${ncApiDomain}/category/deleteCatalogNode`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 获取列表内容
export async function getIdcodeList(params) {
  return request(`${ncApiDomain}/idcode/getIdcodeList/page/${params.currentPage}?category_id=${params.category_id}&page_size=${params.pageSize}&scene_module_id=${params.scene_module_id}`, {
    method: 'GET',
  });
}

// 删除成员
export async function deleteIdcodeRecord(params) {
  return request(`${ncApiDomain}/idcode/deleteIdcodeRecord`, {
    method: 'POST',
    body: toQueryString(params),
  });
}
// 新增||修改单个成员
export async function operateIdcodeRecord(params) {
  return request(`${ncApiDomain}/idcode/operateIdcodeRecord`, {
    method: 'POST',
    body: toQueryString(params),
  });
}
// 标为离职
export async function resignIdCode(params) {
  return request(`${ncApiDomain}/idcode/resignIdcode`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 获取码可用字段信息
export async function getCodeListApi(params) {
  return request(`${ncApiDomain}/idcode/createIdcodeUI?scene_module_id=${params.scene_module_id}`, {
    method: 'GET',
  });
}

// 批量下载
export async function bacthDownloadApi(params) {
  return request(`${ncApiDomain}/idcode/batchDownCategoryIdcode`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 新建名片图片
export async function buildIdcodePhoto(params) {
  return request(`${ncApiDomain}/idcode/buildIdcodePhoto`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

export async function showCollect(params) {
  return request(`${ncApiDomain}/user/getUserShowCollect`, {
    method: 'POST',
    body: toQueryString(params),
  });
}
// 企业名片接口end
