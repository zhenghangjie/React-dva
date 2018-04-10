import request from '../utils/request';
import { getOriginData } from '../common/origin';
import { toQueryString } from '../utils/utils';

const { ncApiDomain } = getOriginData();

/*
 * 目录的操作接口
 * by fjw
 */

/*
 * 获取目录的树的根节点
 */

export async function fetchCatrgoryTreeRoot(params) {
  return request(`${ncApiDomain}/scene/getMenuList`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 获取目录的树下面children的信息
 */

export async function fetchTreeByRoot(params) {
  return request(`${ncApiDomain}/category/getCatalogTree`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 根据相应的目录id获得相应的目录下的活码
 */

export async function PostActivesByCatalog(params) {
  return request(`${ncApiDomain}/qrcode/getQrcodeList`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

export async function GetActivesByCatalogquery(id) {
  const url = `https://easy-mock.com/mock/5a1266f7c2ddd679e315b4a9/api/qrcode/catalog_id/${id}`;
  return request(url);
}

/*
 * 子目录增加相应的目录
 */

export async function AddCatalog(params) {
  return request(`${ncApiDomain}/category/addCatalogNode`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 子目录删除相应的目录
 */

export async function DeleteCatalogs(id) {
  return request(`${ncApiDomain}/category/deleteCatalogNode?node_id=${id}`, {
    method: 'GET',
  });
}

/*
 * 子目录编辑相应的目录
 */

export async function EditCatalogTitleById(params) {
  // console.log(toQueryString(params).replace(/%5C/g, ''));
  return request(`${ncApiDomain}/category/updateCatalogNodeMsg`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 子目录移动相应的目录,移入移出
 */

export async function DropCatalog(params) {
  return request(`${ncApiDomain}/category/moveCatalogNode`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 子目录上移下移动操作
 */
export async function DropCatalogSibling(params) {
  return request(`${ncApiDomain}/category/moveCatalogNodeSibling`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

// 缓存移动后的活码目录（参数，重新排序后的new_tree_data）
export async function DropCatalogData(params) {
  return request('https://easy-mock.com/mock/5a1266f7c2ddd679e315b4a9/api/qrcode/catalog_id/3', {
    method: 'POST',
    body: params,
  });
}

/*
 * 活码的操作接口
 * by fjw
 */


/*
 * 获取码的信息
 */

export async function getQrcodeMsg(id) {
  return request(`${ncApiDomain}/qrcode/getQrcodeMsg?id=${id}`, {
    method: 'GET',
  });
}

/*
 * 移动活码的信息
 */

export async function MoveQrcodeMsg(params) {
  // console.log(encodeURIComponent(JSON.stringify("")));
  return request(`${ncApiDomain}/qrcode/moveQrcode`, {
    method: 'POST',
    body: toQueryString(params), // move的时候需要去掉双引号
  });
}

/*
 * 复制活码的信息
 */

export async function CopyQrcodeMsg(id) {
  return request(`${ncApiDomain}/qrcode/copyQrcodeMsg?id=${id}`, {
    method: 'GET',
  });
}

/*
 * 删除单个活码
 */

export async function DeleteActiveById(params) {
  return request(`${ncApiDomain}/qrcode/deleteQrcodeMsg`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 删除多个活码
 */

export async function BatchDeleteActiveById(params) {
  return request(`${ncApiDomain}/qrcode/deleteQrcodeMsg`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 修改活码的名称
 */

export async function renameQrcodeMsg(params) {
  return request(`${ncApiDomain}/qrcode/renameQrcodeMsg`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 场景新建的列表
 * by fjw
 */

/*
 * 获取所有的场景
 */

export async function AddScene(params) {
  return request(`${ncApiDomain}/scene/getSceneModuleList`, {
    method: 'POST',
    body: params,
  });
}

/*
 * 获取 场景id下面的案例
 */

export async function getSceneCaseMsg(params) {
  return request(`${ncApiDomain}/scene/getSceneCaseMsg?scene_module_id=${params}`, {
    method: 'GET',
  });
}

/*
 * 根目录的新建
 * by fjw
 */

/*
 * 添加根节点
 */

export async function AddRootCatalogs(params) {
  return request(`${ncApiDomain}/category/createCategoryRoot`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 删除根节点
 */

export async function DeleteRootCatalogs(params) {
  return request(`${ncApiDomain}/category/deleteCategoryRoot`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 编辑根节点
 */

export async function EditRootCatalogs(params) {
  return request(`${ncApiDomain}/category/updateCategoryRoot`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 上移动下移动根节点
 */

export async function DropCatalogRootSibling(params) {
  return request(`${ncApiDomain}/category/moveRootNodeSibling`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

/*
 * 移动根目录进入另一个根目录，或者子目录
 */
export async function moveRootNode(params) {
  return request(`${ncApiDomain}/category/moveRootNode`, {
    method: 'POST',
    body: toQueryString(params),
  });
}

