import { Button, Result } from 'antd';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getErrorMessage } from 'react-error-boundary';
import {
	isRouteErrorResponse,
	useNavigate,
	useRouteError,
} from 'react-router';

interface Props {
	children?: ReactNode;
	fallback?: ReactNode;
	/** 兼容 react-error-boundary 的 fallbackRender 场景 */
	error?: unknown;
	resetErrorBoundary?: () => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export const RouterErrorBoundary = () => {
	const navigate = useNavigate();
	const error = useRouteError();

	const onJump = (url: string) => navigate(url);

	let result: ReactNode = '';

	if (isRouteErrorResponse(error)) {
		result = (
			<Result
				status={error.status as any}
				title={error.statusText}
				subTitle={error.data}
				extra={[
					<Button type='primary' key='home' onClick={() => onJump('/index')}>
						返回首页
					</Button>,
					<Button key='reload' onClick={() => location.reload()}>
						刷新
					</Button>,
				]}
			/>
		);
	} else if (error instanceof Error) {
		result = (
			<Result
				status='error'
				title='系统故障'
				subTitle='请稍后再试，或者联系系统管理员'
				extra={[
					<Button type='primary' key='home' onClick={() => onJump('/index')}>
						返回首页
					</Button>,
					<Button key='reload' onClick={() => location.reload()}>
						刷新
					</Button>,
				]}
			/>
		);
	} else {
		result = (
			<Result
				status='warning'
				title='未知错误'
				extra={
					<Button type='primary' onClick={() => onJump('/index')}>
						返回首页
					</Button>
				}
			/>
		);
	}

	return (
		<div className='w-full h-screen flex items-center justify-center'>
			{result}
		</div>
	);
};

export class CustomErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error('[ErrorBoundary]', error, info);
	}

	handleReset = () => {
		this.props.resetErrorBoundary?.();
	};

	render(): ReactNode {
		const activeError =
			this.props.error ?? (this.state.hasError ? this.state.error : undefined);
		const { resetErrorBoundary, fallback } = this.props;

		if (activeError) {
			return (
				fallback ?? (
					<div className='w-full h-screen flex flex-col items-center justify-center text-center p-8 gap-4'>
						<h2 className='text-xl font-semibold text-red-500 mb-2'>页面出错了</h2>
						<p className='text-sm text-gray-500'>
							{getErrorMessage(activeError) ?? '未知错误'}
						</p>
						{resetErrorBoundary && (
							<Button type='primary' onClick={this.handleReset}>
								重试
							</Button>
						)}
					</div>
				)
			);
		}
		return this.props.children;
	}
}
