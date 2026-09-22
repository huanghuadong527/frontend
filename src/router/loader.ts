import { getSystemResource, getSystemUserInfo } from '@/service';

/**
 * 加载系统信息
 * @description 用户信息 角色列表 权限列表
 */
export const authLoader = async () => {
	const user = await getSystemUserInfo();
	const menus = await getSystemResource();
	const tree = menus.data ?? [];
	return {
		...user,
		menus: flattenMenus(tree),
		menuTree: tree
	};
};

const flattenMenus = (tree: MenuProps[], result: MenuProps[] = []): MenuProps[] => {
	tree.forEach((node) => {
		result.push(node);
		if (node.children?.length) {
			flattenMenus(node.children, result);
		}
	});
	return result;
};
