import { use } from 'react';
import { PermisContext } from '@/context';

/** 所有权限标识（管理员） */
const ALL_PERMISSION = '*:*:*';

/** 管理员角色标识 */
const SUPER_ADMIN = 'admin';

const toArray = (value?: string | string[]) =>
	value === undefined || value === null
		? []
		: Array.isArray(value)
			? value
			: [value];

export const usePermis = () => use(PermisContext);

/**
 * 校验是否拥有权限（传入多个时需全部满足）
 * @param permissions 当前用户权限列表
 * @param permission 目标权限标识
 */
export const checkPermi = (
	permissions: string[],
	permission?: string | string[]
) => {
	const list = toArray(permission);
	if (list.length === 0) return true;
	return list.every(
		(p) => permissions.includes(ALL_PERMISSION) || permissions.includes(p)
	);
};

/**
 * 校验是否拥有角色（传入多个时任一满足）
 * @param roles 当前用户角色列表
 * @param role 目标角色标识
 */
export const checkRole = (roles: string[], role?: string | string[]) => {
	const list = toArray(role);
	if (list.length === 0) return true;
	return list.some((r) => roles.includes(SUPER_ADMIN) || roles.includes(r));
};

/**
 * 按钮/角色权限校验
 * @description 基于登录用户角色与权限列表做校验
 */
export const usePermission = () => {
	const { roles, permissions } = usePermis();

	const hasPermi = (permission?: string | string[]) =>
		checkPermi(permissions, permission);
	const hasRole = (role?: string | string[]) => checkRole(roles, role);

	return { hasPermi, hasRole };
};
