import {
	AppstoreOutlined,
	BankOutlined,
	DownOutlined,
	FileTextOutlined,
	LockOutlined,
	MailOutlined,
	PhoneOutlined,
	PoweroffOutlined,
	StopOutlined,
	TeamOutlined,
	UserOutlined
} from '@ant-design/icons';
import { App, Avatar, Button, Form, Input, Modal, Popover, Radio } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { usePermis } from '@/authority';
import { ImageUpload } from '@/components/image-upload';
import { API_UPLOAD } from '@/core';
import { updateSystemUserInfo, updateSystemUserPwd } from '@/service';
import { clear, setTheme, useStore } from '@/store';

import { NavBtn } from './nav-btn';

const THEME_COLORS = [
	'#1677ff',
	'#2EAFBB',
	'#25b887',
	'#FF5722',
	'#722ed1',
	'#faad14'
];

const getSrc = (value?: string) => (value ? API_UPLOAD + value : '');

const InfoRow = ({
	icon,
	value
}: {
	icon: ReactNode;
	value: ReactNode;
}) => (
	<div className='flex items-center gap-1.5'>
		<span className='w-6 flex justify-center text-gray-400'>{icon}</span>
		<span
			className='w-32 truncate'
			title={typeof value === 'string' ? value : undefined}
		>
			{value}
		</span>
	</div>
);

export const NavAvatar = () => {
	const { message } = App.useApp();
	const { user } = usePermis();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const theme = useStore((state) => state.root.theme);

	const [profileForm] = Form.useForm();
	const [psdForm] = Form.useForm();

	const [popoverOpen, setPopoverOpen] = useState(false);
	const [profileVisible, setProfileVisible] = useState(false);
	const [psdVisible, setPsdVisible] = useState(false);
	const [settingVisible, setSettingVisible] = useState(false);
	const [themeColor, setThemeColor] = useState(theme);

	const logout = () => {
		dispatch(clear());
		navigate('/login');
	};

	const onFinishProfile = (values: AnyObject) => {
		updateSystemUserInfo({
			nickName: values.nickName,
			sex: Number(values.sex),
			phonenumber: values.phonenumber,
			email: values.email,
			avatar: values.avatar
		}).then(() => {
			message.success('已更新用户基本资料');
			setProfileVisible(false);
			logout();
		});
	};

	const onFinishPsd = (values: AnyObject) => {
		updateSystemUserPwd({
			oldPassword: values.oldPassword,
			newPassword: values.newPassword
		}).then(() => {
			message.success('密码修改成功, 请重新登录');
			setPsdVisible(false);
			logout();
		});
	};

	const onOpenProfile = () => {
		profileForm.setFieldsValue({
			nickName: user.nickName ?? '',
			sex: user.sex != null ? String(user.sex) : '0',
			phonenumber: user.phonenumber ?? '',
			email: user.email ?? '',
			avatar: user.avatar ?? ''
		});
		setProfileVisible(true);
		setPopoverOpen(false);
	};

	const onOpenPsd = () => {
		psdForm.resetFields();
		setPsdVisible(true);
		setPopoverOpen(false);
	};

	const onOpenSetting = () => {
		setThemeColor(theme);
		setSettingVisible(true);
		setPopoverOpen(false);
	};

	const onSaveSetting = () => {
		dispatch(setTheme(themeColor));
		setSettingVisible(false);
	};

	const popoverContent = (
		<div className='py-2 w-80'>
			<div className='px-4 pb-3 border-b border-gray-100 flex items-start justify-between'>
				<div className='flex gap-3'>
					<Avatar
						size={40}
						src={getSrc(user.avatar)}
						icon={<UserOutlined />}
					/>
					<span className='self-center text-base'>{`${user.nickName}, 欢迎您`}</span>
				</div>
				<Button
					type='text'
					danger
					size='small'
					icon={<PoweroffOutlined />}
					title='退出登录'
					onClick={logout}
				/>
			</div>
			<div className='px-4 py-3 flex flex-col gap-2'>
				<div className='flex gap-4'>
					<InfoRow
						icon={<TeamOutlined />}
						value={user.roles && user.roles.map((role) => role.roleName).join(',')}
					/>
					<InfoRow
						icon={<BankOutlined />}
						value={(user.dept && user.dept.deptName) || '--'}
					/>
				</div>
				<div className='flex gap-4'>
					<InfoRow icon={<UserOutlined />} value={user.userName} />
					<InfoRow
						icon={<StopOutlined />}
						value={user.sex == 0 ? '男' : '女'}
					/>
				</div>
				<div className='flex gap-4'>
					<InfoRow icon={<MailOutlined />} value={user.email ?? '--'} />
					<InfoRow
						icon={<PhoneOutlined />}
						value={user.phonenumber ?? '--'}
					/>
				</div>
				<div className='flex gap-4'>
					<InfoRow icon={<UserOutlined />} value={user.loginIp ?? '--'} />
				</div>
			</div>
			<div className='px-4 pt-2 border-t border-gray-100 flex justify-between'>
				<Button
					type='text'
					size='small'
					icon={<FileTextOutlined />}
					onClick={onOpenProfile}
				>
					基本资料
				</Button>
				<Button
					type='text'
					size='small'
					icon={<AppstoreOutlined />}
					onClick={onOpenSetting}
				>
					系统设置
				</Button>
				<Button
					type='text'
					size='small'
					icon={<LockOutlined />}
					onClick={onOpenPsd}
				>
					修改密码
				</Button>
			</div>
		</div>
	);

	return (
		<>
			<Popover
				content={popoverContent}
				trigger='click'
				placement='bottomRight'
				open={popoverOpen}
				onOpenChange={setPopoverOpen}
			>
				<NavBtn>
					<Avatar
						shape='square'
						size={28}
						src={getSrc(user.avatar)}
						icon={<UserOutlined />}
					/>
					<span className='text-sm'>{user.userName ?? '--'}</span>
					<DownOutlined style={{ fontSize: 12 }} />
				</NavBtn>
			</Popover>

			<Modal
				title='基本资料'
				open={profileVisible}
				destroyOnHidden
				forceRender
				onOk={() => profileForm.submit()}
				onCancel={() => setProfileVisible(false)}
			>
				<Form
					form={profileForm}
					labelCol={{ flex: '0 0 90px' }}
					onFinish={onFinishProfile}
				>
					<Form.Item name='avatar' label='用户头像'>
						<ImageUpload />
					</Form.Item>
					<Form.Item
						name='nickName'
						label='用户昵称'
						rules={[{ required: true, message: '请输入用户昵称' }]}
					>
						<Input placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item name='sex' label='性别'>
						<Radio.Group>
							<Radio value='0'>男</Radio>
							<Radio value='1'>女</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='phonenumber' label='手机号码'>
						<Input placeholder='请输入手机号码' />
					</Form.Item>
					<Form.Item name='email' label='用户邮箱'>
						<Input placeholder='请输入用户邮箱' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='修改密码'
				open={psdVisible}
				destroyOnHidden
				forceRender
				onOk={() => psdForm.submit()}
				onCancel={() => setPsdVisible(false)}
			>
				<Form form={psdForm} labelCol={{ flex: '0 0 90px' }} onFinish={onFinishPsd}>
					<Form.Item
						name='oldPassword'
						label='原密码'
						rules={[{ required: true, message: '请输入原密码' }]}
					>
						<Input.Password placeholder='请输入原密码' />
					</Form.Item>
					<Form.Item
						name='newPassword'
						label='新密码'
						rules={[
							{ required: true, message: '请输入新密码' },
							{ min: 6, message: '密码不能少于6个字符' }
						]}
					>
						<Input.Password placeholder='请输入新密码' />
					</Form.Item>
					<Form.Item
						name='confirmPassword'
						label='确认密码'
						dependencies={['newPassword']}
						rules={[
							{ required: true, message: '请输入确认密码' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('newPassword') === value) {
										return Promise.resolve();
									}
									return Promise.reject(new Error('两次输入的新密码不一致'));
								}
							})
						]}
					>
						<Input.Password placeholder='请输入确认密码' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='系统设置'
				open={settingVisible}
				onOk={onSaveSetting}
				onCancel={() => setSettingVisible(false)}
			>
				<div className='mb-2 text-sm text-gray-500'>主题色</div>
				<div className='flex gap-3'>
					{THEME_COLORS.map((color) => (
						<div
							key={color}
							onClick={() => setThemeColor(color)}
							style={{
								width: 24,
								height: 24,
								borderRadius: '50%',
								cursor: 'pointer',
								backgroundColor: color,
								boxShadow:
									themeColor === color
										? `0 0 0 2px #fff, 0 0 0 4px ${color}`
										: 'none',
								transition: '0.2s'
							}}
						/>
					))}
				</div>
			</Modal>
		</>
	);
};
