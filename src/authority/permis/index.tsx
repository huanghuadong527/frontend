import { useLoaderData } from 'react-router';
import { PermisContext } from '@/context';

/**
 * 系统权限
 * @param param node
 * @returns
 * @description 用户信息 角色列表 权限列表
 */
export const PermisProvider = ({ children }: BaseNode) => {
	const loader = useLoaderData<PermisContextType>();

	return (
		<PermisContext
			value={{
				user: loader.user,
				roles: loader.roles ?? [],
				menus: loader.menus ?? [],
				menuTree: loader.menuTree ?? [],
				permissions: loader.permissions ?? []
			}}
		>
			{children}
		</PermisContext>
	);
};
