import { Button, Typography } from 'antd';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

export const RootErrorBoundary = () => {
	const error = useRouteError();
	const navigate = useNavigate();
	let src = '/src/assets/image/error/report.png';
	let tooltip = 'Unknown Error';

	if (isRouteErrorResponse(error)) {
		if (error.status == 403 || error.status == 404 || error.status == 500) {
			if (error.status == 403) {
				tooltip = '拒绝访问!';
			} else if (error.status == 404) {
				tooltip = '该页面不存在!';
			} else if (error.status == 500) {
				tooltip = '服务器内部异常!';
			}
			src = `/src/assets/image/error/${error.status}.png`;
		}
	} else if (error instanceof Error) {
		tooltip = error.message;
	} else if (typeof error == 'string') {
		tooltip = error;
	}
	return (
		<div className='h-screen flex flex-col items-center justify-center gap-3'>
			<img className='w-md' src={src} />
			<Typography.Text type='danger'>{tooltip}</Typography.Text>
			<div className='flex gap-5'>
				<Button onClick={() => navigate('/index')}>返回首页</Button>
				<Button onClick={() => navigate(-1)}>返回上一页</Button>
			</div>
		</div>
	);
};
