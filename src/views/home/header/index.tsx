import ImgCrop from 'antd-img-crop';
import screenfull from 'screenfull';
import {
	Avatar,
	Button,
	Dropdown,
	Form,
	Input,
	Menu,
	message,
	Modal,
	Space,
	Upload,
} from 'antd';
import {
	CaretDownOutlined,
	ExpandOutlined,
	InboxOutlined,
	LayoutOutlined,
	LockOutlined,
	LogoutOutlined,
	MenuUnfoldOutlined,
	SearchOutlined,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useNavigate } from 'react-router-dom';
import { useCommon } from '@/core';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { State, UseStore } from '@/store';

function header(props: AppIndexProps) {
	const navigate = useNavigate();
	const [userVisible, setUserVisible] = useState(false);
	const [psdVisible, setPsdVisible] = useState(false);
	const [isScreenfull, setIsScreenfull] = useState(false);
	const { logout } = useCommon();
	const { user } = useSelector<UseStore, State>((state) => state.common);

	const onSelectHandleItem = ({ key }: MenuInfo) => {
		switch (key) {
			case 'user':
				setUserVisible(true);
				break;
			case 'password':
				setPsdVisible(true);
			case 'layout':
				console.log('layout');
				break;
			case 'logout':
				navigate('/login');
				logout();
				break;
		}
	};

	const handle = (
		<Menu
			items={[
				{
					key: 'user',
					label: '个人设置',
					icon: <SettingOutlined />,
				},
				{
					key: 'layout',
					label: '布局设置',
					icon: <LayoutOutlined />,
				},
				{
					key: 'password',
					label: '修改密码',
					icon: <LockOutlined />,
				},
				{
					type: 'divider',
				},
				{
					key: 'logout',
					label: '退出登录',
					icon: <LogoutOutlined />,
				},
			]}
			onClick={onSelectHandleItem}
		/>
	);

	const onCollapse = () => {
		props.onCollapse!(!props.collapsed);
	};

	const onScreenfull = () => {
		if (!screenfull.isEnabled) {
      message.warning('你的浏览器不支持全屏');
      return;
    }
    screenfull.toggle();
	}

	const onSaveUserSetting = () => {};

	const onSavePsd = () => {};

	const onChangeScreenfull = () =>{
    if (screenfull.isEnabled) {
      setIsScreenfull(screenfull.isFullscreen);
    }
  }

	useEffect(() => {
		if (screenfull.isEnabled) {
      screenfull.on('change', onChangeScreenfull);
    }
	}, []);

	return (
		<div className='mes-header'>
			<Button
				className='mes-flexible'
				icon={<MenuUnfoldOutlined />}
				onClick={onCollapse}
			/>
			<div className='flex-1'></div>
			<Space>
				<a className='mes-header--handle'>
					<SearchOutlined /> 搜索
				</a>
				<a className='mes-header--handle' onClick={onScreenfull}>
					<ExpandOutlined /> 全屏
				</a>
				<Dropdown overlay={handle}>
					<a className='mes-header--handle'>
						<Avatar
							src='https://demo.leanfocus.com.cn/static/img/profile.473f5971.jpg'
							icon={<UserOutlined />}
						/>
						{'  '}
						管理员
						<CaretDownOutlined />
					</a>
				</Dropdown>
			</Space>
			<Modal
				title='个人中心'
				width={450}
				open={userVisible}
				onOk={onSaveUserSetting}
				onCancel={() => setUserVisible(false)}
			>
				<Form autoComplete='off' initialValues={user}>
					<Form.Item label='用户头像'>
						<ImgCrop grid rotate shape='round' minZoom={0}>
							<Upload.Dragger>
								<p className='ant-upload-drag-icon'>
									<InboxOutlined />
								</p>
								<p className='ant-upload-text'>点击或者拖拽图片到这里</p>
								<p className='ant-upload-hint'>
									只能上传jpg/png文件, 且不超过500kb
								</p>
							</Upload.Dragger>
						</ImgCrop>
					</Form.Item>
					<Form.Item name='userName' label='用户名称'>
						<Input />
					</Form.Item>
					<Form.Item name='phoneNumber' label='手机号码'>
						<Input />
					</Form.Item>
					<Form.Item name='email' label='用户邮箱'>
						<Input />
					</Form.Item>
					<Form.Item name='deptText' label='所属部门'>
						<Input />
					</Form.Item>
					<Form.Item name='roleText' label='所属角色'>
						<Input />
					</Form.Item>
					<Form.Item name='createTime' label='创建日期'>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
			<Modal title='修改密码'
				width={450}
				open={psdVisible}
				onOk={onSavePsd}
				onCancel={() => setPsdVisible(false)}>
				<Form autoComplete='off' labelCol={{span: 4}}>
					<Form.Item label='原密码'>
						<Input.Password placeholder='请输入原密码' />
					</Form.Item>
					<Form.Item label='新密码'>
						<Input.Password placeholder='请输入新密码' />
					</Form.Item>
					<Form.Item label='确认密码'>
						<Input.Password placeholder='请输入确认密码' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

export default header;
