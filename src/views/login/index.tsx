import React, { useEffect } from 'react';
import { Button, Dropdown, Menu, Form, Input, Checkbox } from 'antd';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { login } from '@/service';
import { useDispatch } from 'react-redux';
import { setToken } from '@/store';
import { useCommon } from '@/core';
import { useNavigate } from 'react-router-dom';

interface UserInterface {
	username: string;
	password: string;
}

function LoginComponent() {
	const dispathch = useDispatch();
	const navigate = useNavigate();
	const { logout } = useCommon();
	const defaultUser: UserInterface = {
		username: 'admin',
		password: 'admin123',
	};

	const [userForm] = Form.useForm<UserInterface>();

	useEffect(() => {
		logout();
		userForm.setFieldsValue(defaultUser);
	});

	const menuI18nItem = (
		<Menu>
			<Menu.Item>中文</Menu.Item>
			<Menu.Item>English</Menu.Item>
		</Menu>
	);

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
		<div className='container sy-login'>
			<div className='sy-login--decorate'></div>
			<div className='sy-login--panel'>
				<div className='sy-login--left flex'></div>
				<div className='flex'>
					<div className='sy-login--right'>
						<div className='sy-login--i18n text-right'>
							<Dropdown.Button overlay={menuI18nItem}>En</Dropdown.Button>
						</div>
						<div className='sy-login--form'>
							<div className='sy-login--label'>
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
