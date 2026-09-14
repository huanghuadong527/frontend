import { Spin } from 'antd';

export const Loading = () => {
	return (
		<div className='w-full h-screen flex items-center justify-center'>
			<Spin size='large' />
		</div>
	);
};
