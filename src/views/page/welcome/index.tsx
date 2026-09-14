import { Typography } from 'antd';

const Welcome = () => {
	return (
		<div
			className='w-full h-full flex flex-col'
			style={{ alignItems: 'center', justifyContent: 'center' }}
		>
			<Typography.Title level={4} type='secondary'>
				欢迎使用思阳管理系统
			</Typography.Title>
		</div>
	);
};

export const Component = Welcome;
