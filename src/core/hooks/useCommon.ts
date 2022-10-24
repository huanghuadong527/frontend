import { delSelectable, delTabs, delToken } from '@/store';
import { useDispatch } from 'react-redux';

interface CommonProps {
	logout: () => void;
}

/**
 * 系统常用工具
 */
const useCommon = (): CommonProps => {
	const dispatch = useDispatch();

	const logout = () => {
		dispatch(delToken());
		dispatch(delTabs());
		dispatch(delSelectable());
	};

	return {
		logout,
	};
};

export { useCommon };
