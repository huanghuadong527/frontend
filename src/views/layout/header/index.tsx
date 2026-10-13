import logo from '@/assets/image/logo.png';
import { useRef } from 'react';
import { theme } from 'antd';
import {
	SearchOutlined,
	MenuOutlined,
	ExpandOutlined,
	CompressOutlined
} from '@ant-design/icons';
import { useFullscreen, useToggle } from 'react-use';
import { usePermis } from '@/authority';

import { NavBtn } from './nav-btn';
import { NavAvatar } from './avatar';

export const Header = ({
	isMobile,
	onOpenMenu
}: {
	isMobile: boolean;
	onOpenMenu: () => void;
}) => {
	const dRef = useRef(document.body);
	const { user } = usePermis();
	const { token } = theme.useToken();
	const [show, toggle] = useToggle(false);
	const isFullscreen = useFullscreen(dRef, show, {
		onClose: () => toggle(false)
	});

	return (
		<div
			style={{
				color: '#fff',
				backgroundColor: token.colorPrimary
			}}
		>
			<div className='h-12.5 leading-12.5 px-3 md:px-5 flex items-center justify-between'>
				<div className='flex items-center gap-1'>
					{isMobile ? (
						<NavBtn onClick={onOpenMenu}>
							<MenuOutlined />
						</NavBtn>
					) : null}
					<img className='h-9' src={logo} />
					{isMobile ? null : <span className='text-xl'>智能管理系统</span>}
				</div>
				<div className='h-full flex items-center gap-1'>
					<NavBtn>
						<SearchOutlined />
						{isMobile ? null : <span>搜索</span>}
					</NavBtn>
					<NavBtn onClick={() => toggle()}>
						{isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
						{isMobile ? null : <span>全屏</span>}
					</NavBtn>
					{user ? <NavAvatar /> : null}
				</div>
			</div>
		</div>
	);
};
