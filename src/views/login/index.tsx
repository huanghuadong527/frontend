import { useEffect } from 'react';
import { Button, Dropdown, Form, Input, Checkbox } from 'antd';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { login } from '@/service';
import { useDispatch } from 'react-redux';
import { setToken } from '@/store';
import { useCommon } from '@/core';
import { useNavigate } from 'react-router-dom';

import style from './index.module.less';

interface UserInterface {
	username: string;
	password: string;
}

function LoginComponent() {
	const dispathch = useDispatch();
	const navigate = useNavigate();
	const { logout, setTitle } = useCommon();
	const defaultUser: UserInterface = {
		username: 'admin',
		password: 'admin123',
	};

	const [userForm] = Form.useForm<UserInterface>();

	useEffect(() => {
		logout();
		setTitle('登录');
		userForm.setFieldsValue(defaultUser);
	});

	const items = [
		{
			key: 'zh_cn',
			label: '中文',
		},
		{
			key: 'en',
			label: 'English',
		},
	];

	const onSubmit = () => {
		userForm.validateFields().then((params) => {
			login(params).then((result) => {
				if (result.code == 200) {
					dispathch(setToken(result.data));
					// window.location.href = '/#/index';
					navigate('/#/index');
				}
			});
		});
	};

	return (
		<div className={style.login}>
			<div className={style.loginDecorate}></div>
			<div className={style.loginPanel}>
				<div className={style.loginLeft}></div>
				<div className={style.loginRight}>
					<div className={style.loginRightBody}>
						<div className={style.loginI18n}>
							<Dropdown.Button menu={{ items }}>En</Dropdown.Button>
						</div>
						<div className={style.loginForm}>
							<div className={style.loginLabel}>
								<label>后台管理系统</label>
							</div>
							<Form form={userForm}>
								<Form.Item
									name='username'
									rules={[{ required: true, message: '请输入用户名!' }]}
								>
									<Input
										placeholder='请输入用户名!'
										prefix={<UserOutlined />}
									/>
								</Form.Item>
								<Form.Item name='password'>
									<Input
										placeholder='请输入密码!'
										type='password'
										prefix={<KeyOutlined />}
									/>
								</Form.Item>
								<Form.Item>
									<Checkbox>记住密码</Checkbox>
								</Form.Item>
								<Form.Item>
									<Button block type='primary' onClick={() => onSubmit()}>
										登录
									</Button>
								</Form.Item>
							</Form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LoginComponent;
