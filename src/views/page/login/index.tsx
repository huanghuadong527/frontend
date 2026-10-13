import src_login from '@/assets/image/login-bg.webp';
import src_left from '@/assets/image/card-left-1.webp';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Typography } from 'antd';
import utils from 'xe-utils';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { login } from '@/service';
import { setToken } from '@/store';

const { Link, Text } = Typography;

export const Login = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [remember, setRemember] = useState(false);

	const onRememberChange = (e: { target: { checked: boolean } }) => {
		const checked = e.target.checked;
		setRemember(checked);

		if (checked) {
			const values = form.getFieldsValue();
			utils.cookie.set('checked', checked, { expires: '7d' });
			utils.cookie.set('username', values.username ?? '');
			utils.cookie.set('password', values.password ?? '');
		} else {
			utils.cookie.remove('checked');
			utils.cookie.remove('username');
			utils.cookie.remove('password');
		}
	};

	const onFinish = (values: AnyObject) => {
		login(values).then((result) => {
			dispatch(setToken(result.data));
			navigate('/index');
		});
	};

	useEffect(() => {
		const checked = utils.cookie.get('checked');
		const username = utils.cookie.get('username') || '';
		const password = utils.cookie.get('password') || '';

		if (checked === 'true') {
			setRemember(true);
			form.setFieldsValue({ username, password });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className='h-screen flex items-center justify-center bg-center bg-cover bg-no-repeat'
			style={{ backgroundImage: `url(${src_login})` }}
		>
			<div className='w-5xl relative overflow-hidden rounded-md shadow-lg bg-white'>
				<div className='absolute inset-0 backdrop-blur-md z-px'></div>
				<div className='relative flex'>
					<div
						className='flex-1 bg-center bg-size-[80%_auto] bg-no-repeat bg-cyan-50'
						style={{ backgroundImage: `url(${src_left})` }}
					></div>
					<div className='flex-1'>
						<div className='px-16 py-20'>
							<div className='text-2xl mb-6'>欢迎登录</div>
							<Form form={form} onFinish={onFinish}>
								<Form.Item
									name='username'
									rules={[{ required: true, message: '请输入用户名' }]}
								>
									<Input
										prefix={<UserOutlined />}
										placeholder='请输入用户名'
									/>
								</Form.Item>
								<Form.Item
									name='password'
									rules={[{ required: true, message: '请输入密码' }]}
								>
									<Input.Password
										prefix={<LockOutlined />}
										placeholder='请输入密码'
									/>
								</Form.Item>
								<div className='flex items-center justify-between mb-10'>
									<Checkbox
										checked={remember}
										onChange={onRememberChange}
									>
										记住密码
									</Checkbox>
									<Link className='text-sm'>忘记密码?</Link>
								</div>
								<Button block type='primary' htmlType='submit'>
									立即登录
								</Button>
								<div className='text-center mt-6'>
									<Text type='secondary'>
										<span>您还没有账号吗?</span>
										<Link className='ml-1'>立即注册</Link>
									</Text>
								</div>
							</Form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
