import { getSystemResource, getSystemUserInfo } from '@/service';

/**
 * 加载系统信息
 * @description 用户信息 角色列表 权限列表
 */
export const authLoader = async () => {
	const user = await getSystemUserInfo();
	const menus = await getSystemResource();
	const tree = (menus.data ?? []).map(normalizeMenu);
	return {
		...user,
		menus: flattenMenus(tree),
		menuTree: tree
	};
};

/** 后端菜单 id/parentId 为数字，统一转成字符串，与 antd Menu/Tabs 的 key 保持一致 */
const normalizeMenu = (node: MenuProps): MenuProps => ({
	...node,
	id: String(node.id),
	parentId: node.parentId ? String(node.parentId) : node.parentId,
	children: node.children?.map(normalizeMenu)
});

const flattenMenus = (tree: MenuProps[], result: MenuProps[] = []): MenuProps[] => {
	tree.forEach((node) => {
		result.push(node);
		if (node.children?.length) {
			flattenMenus(node.children, result);
		}
	});
	return result;
};
