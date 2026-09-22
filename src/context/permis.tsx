import { createContext } from 'react';

/**
 * 系统信息上下文
 */
export const PermisContext = createContext<PermisContextType>({
	user: { id: null },
	roles: [],
	menus: [],
	menuTree: [],
	permissions: []
});
