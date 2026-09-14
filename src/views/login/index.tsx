import { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import {
	EyeInvisibleOutlined,
	EyeOutlined,
	LockOutlined,
	UserOutlined
} from '@ant-design/icons';
import { login } from '@/service';
import { setToken, useAppDispatch } from '@/store';
import { useCommon } from '@/core';
import { useNavigate } from 'react-router';
import loginBg from '@/assets/image/login-bg.png';
import loginLeftBg from '@/assets/image/login-left-bg.png';

interface UserInterface {
	username: string;
	password: string;
}

function LoginComponent() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { logout, setTitle } = useCommon();
	const [showPassword, setShowPassword] = useState(false);

	const [userForm] = Form.useForm<UserInterface>();

	useEffect(() => {
		logout();
		setTitle('登录');
		userForm.setFieldsValue({ username: 'admin', password: 'Rl52013142#' });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = () => {
		userForm.validateFields().then((params) => {
			login(params).then((result) => {
				if (result.code == 200) {
					dispatch(setToken(result.data));
					navigate('/index');
				}
			});
		});
	};

	return (
		<div
			className='h-screen flex items-center justify-center bg-center bg-cover bg-no-repeat'
			style={{ backgroundImage: `url(${loginBg})` }}
		>
			<div className='relative flex overflow-hidden rounded-md shadow-lg bg-white w-5xl max-w-full'>
				<div
					className='flex-1 bg-cyan-50 bg-center bg-no-repeat'
					style={{
						backgroundImage: `url(${loginLeftBg})`
					}}
				></div>
				<div className='flex-1'>
					<div className='px-16 py-20'>
						<div className='text-2xl mb-6'>欢迎登录</div>
						<Form form={userForm}>
							<Form.Item
								name='username'
								rules={[{ required: true, message: '请输入用户名!' }]}
							>
								<Input placeholder='请输入用户名' prefix={<UserOutlined />} />
							</Form.Item>
							<Form.Item
								name='password'
								rules={[{ required: true, message: '请输入密码!' }]}
							>
								<Input
									placeholder='请输入密码'
									type={showPassword ? 'text' : 'password'}
									prefix={<LockOutlined />}
									suffix={
										<span
											className='cursor-pointer'
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeInvisibleOutlined />
											) : (
												<EyeOutlined />
											)}
										</span>
									}
								/>
							</Form.Item>
							<div className='flex items-center justify-between mb-6'>
								<Checkbox>记住密码</Checkbox>
								<a className='text-sm'>忘记密码?</a>
							</div>
							<Button block type='primary' onClick={onSubmit}>
								立即登录
							</Button>
							<div className='text-center mt-6 text-xs text-gray-400'>
								<span>您还没有账号吗?</span>
								<a className='ml-1'>立即注册</a>
							</div>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}

export const Component = LoginComponent;
