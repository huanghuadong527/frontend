import { Typography } from 'antd';

export const Welcome = () => {
	return (
		<div className='h-full flex items-center justify-center'>
			<Typography.Title
				level={5}
				style={{ color: 'rgba(0,0,0,0.45)', margin: 0 }}
			>
				欢迎使用思阳管理系统
			</Typography.Title>
		</div>
	);
};

export default Welcome;
