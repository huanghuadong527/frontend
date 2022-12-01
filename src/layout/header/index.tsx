import ImgCrop from 'antd-img-crop';
import screenfull from 'screenfull';
import {
	Avatar,
	Button,
	Dropdown,
	Form,
	Input,
	Image,
	message,
	Modal,
	Space,
	Upload,
	Radio,
	Descriptions,
	theme,
} from 'antd';
import {
	CaretDownOutlined,
	ExpandOutlined,
	IdcardOutlined,
	InboxOutlined,
	LayoutOutlined,
	LockOutlined,
	LogoutOutlined,
	MenuUnfoldOutlined,
	SearchOutlined,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { ColorResult, SketchPicker } from 'react-color';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FORM_LAYOUT, SY_CONFIG, useCommon } from '@/core';
import { useEffect, useState } from 'react';
import { setGloblaTheme, useAppSelector } from '@/store';
import type { MenuProps } from 'antd';
import { updateSystemUserInfo, uploadImage } from '@/service';

import style from './index.module.less';

const { useToken } = theme;

function header(props: AppIndexProps) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { user, theme } = useAppSelector((state) => state);
	const [userVisible, setUserVisible] = useState(false);
	const [psdVisible, setPsdVisible] = useState(false);
	const [sysVisible, setSysVisible] = useState(false);
	const [infoVisible, setInfoVisible] = useState(false);
	// const [isScreenfull, setIsScreenfull] = useState(false);
	const [avatarImageSrc, setAvatarImageSrc] = useState<string | null>(null);
	const [themeColor, setThemeColor] = useState(theme);
	const [userForm] = Form.useForm();
	const { logout } = useCommon();
	const { token } = useToken();

	const onSelectHandleItem = (key: string) => {
		switch (key) {
			case 'user':
				if (user && user.avatar) {
					setAvatarImageSrc(user.avatar);
				}
				setUserVisible(true);
				break;
			case 'info':
				setInfoVisible(true);
				break;
			case 'password':
				setPsdVisible(true);
				break;
			case 'layout':
				setSysVisible(true);
				break;
			case 'logout':
				navigate('/login');
				logout();
				break;
		}
	};

	const items: MenuProps['items'] = [
		{
			key: 'user',
			label: '基本资料',
			icon: <SettingOutlined />,
		},
		{
			key: 'info',
			label: '个人信息',
			icon: <IdcardOutlined />,
		},
		{
			key: 'layout',
			label: '系统设置',
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
	];

	const onCollapse = () => {
		props.onCollapse!(!props.collapsed);
	};

	const onScreenfull = () => {
		if (!screenfull.isEnabled) {
			message.warning('你的浏览器不支持全屏');
			return;
		}
		screenfull.toggle();
	};

	const onUpload = ({ file }: any) => {
		if (file) {
			const formData = new FormData();
			formData.append('file', file);
			uploadImage(formData).then((result) => {
				setAvatarImageSrc(result.data);
			});
		}
	};

	const onSaveUserSetting = () => {
		userForm.validateFields().then((values) => {
			let params: { [key: string]: string } = {};
			if (avatarImageSrc) {
				params.avatar = avatarImageSrc;
			}
			if (user && user.id) {
				updateSystemUserInfo({
					...values,
					...params,
					id: user.id,
				}).then((result) => {
					if (result.code == 200) {
						message.success('已更新用户基本资料!');
						onCancelUserSetting();
						onSelectHandleItem('logout');
					}
				});
			}
		});
	};

	const onCancelUserSetting = () => {
		setUserVisible(false);
		setAvatarImageSrc(null);
	};

	const onSavePsd = () => {};

	const onChangeScreenfull = () => {
		if (screenfull.isEnabled) {
			// setIsScreenfull(screenfull.isFullscreen);
		}
	};

	const onChangeTheme = (color: ColorResult) => {
		setThemeColor(color.hex);
	};

	const onSavaSysSetting = () => {
		setSysVisible(false);
		dispatch(setGloblaTheme(themeColor));
	};

	useEffect(() => {
		if (screenfull.isEnabled) {
			screenfull.on('change', onChangeScreenfull);
		}
	}, []);

	return (
		<div className={style.layoutHeader}>
			<Button icon={<MenuUnfoldOutlined />} onClick={onCollapse} />
			<Space>
				<a className={style.layoutHeaderHandle}>
					<SearchOutlined /> 搜索
				</a>
				<a className={style.layoutHeaderHandle} onClick={onScreenfull}>
					<ExpandOutlined /> 全屏
				</a>
				<Dropdown menu={{ items, onClick: (e) => onSelectHandleItem(e.key) }}>
					<a className={style.layoutHeaderHandle}>
						<Space>
							<Avatar
								shape='square'
								style={{ borderRadius: '4px' }}
								src={user ? `${SY_CONFIG.upload}${user.avatar}` : null}
								icon={<UserOutlined />}
							/>
							{user ? user.nickName : ''}
							<CaretDownOutlined />
						</Space>
					</a>
				</Dropdown>
			</Space>
			<Modal
				title='基本资料'
				width={450}
				open={userVisible}
				onOk={onSaveUserSetting}
				onCancel={onCancelUserSetting}
			>
				<Form
					{...FORM_LAYOUT}
					autoComplete='off'
					form={userForm}
					initialValues={user}
				>
					<Form.Item label='用户头像'>
						<ImgCrop grid rotate shape='rect' minZoom={0}>
							<Upload.Dragger
								listType='picture-card'
								showUploadList={false}
								customRequest={onUpload}
							>
								{avatarImageSrc ? (
									<Image
										preview={false}
										height={80}
										src={`${SY_CONFIG.upload}${avatarImageSrc}`}
									/>
								) : (
									<>
										<p className='ant-upload-drag-icon'>
											<InboxOutlined />
										</p>
										<p className='ant-upload-text'>点击或者拖拽图片到这里</p>
										<p className='ant-upload-hint'>
											只能上传jpg/png文件, 且不超过500kb
										</p>
									</>
								)}
							</Upload.Dragger>
						</ImgCrop>
					</Form.Item>
					<Form.Item
						name='nickName'
						label='用户名称'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入用户名称' />
					</Form.Item>
					<Form.Item name='sex' label='性别'>
						<Radio.Group>
							<Radio value={0}>男</Radio>
							<Radio value={1}>女</Radio>
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
				title='个人信息'
				width={600}
				footer={false}
				open={infoVisible}
				onCancel={() => setInfoVisible(false)}
			>
				{user ? (
					<Descriptions bordered size='small' column={2}>
						<Descriptions.Item label='昵称'>{user.nickName}</Descriptions.Item>
						<Descriptions.Item label='用户名'>
							{user.userName}
						</Descriptions.Item>
						<Descriptions.Item label='性别'>
							{user.sex == 0 ? '男' : '女'}
						</Descriptions.Item>
						<Descriptions.Item label='联系方式'>
							{user.phonenumber}
						</Descriptions.Item>
						<Descriptions.Item label='邮箱'>{user.email}</Descriptions.Item>
						<Descriptions.Item label='所属部门'>
							{user.dept ? user.dept.deptName : ''}
						</Descriptions.Item>
						<Descriptions.Item label='所属角色'>
							{user.roles
								? user.roles.map((item: any) => item.roleName).join(',')
								: ''}
						</Descriptions.Item>
						<Descriptions.Item label='登录IP'>{user.loginIp}</Descriptions.Item>
						<Descriptions.Item label='创建人'>
							{user.createBy || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='创建日期'>
							{user.createTime || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='更新人'>
							{user.updateBy || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='更新日期'>
							{user.updateTime || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='账号状态'>
							{user.status == 0 ? '正常' : '停用'}
						</Descriptions.Item>
					</Descriptions>
				) : (
					<></>
				)}
			</Modal>
			<Modal
				title='修改密码'
				width={450}
				open={psdVisible}
				onOk={onSavePsd}
				onCancel={() => setPsdVisible(false)}
			>
				<Form autoComplete='off' labelCol={{ span: 4 }}>
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
			<Modal
				title='系统设置'
				width={600}
				open={sysVisible}
				onOk={onSavaSysSetting}
				onCancel={() => setSysVisible(false)}
			>
				<div className='flex-row'>
					<SketchPicker
						color={themeColor}
						presetColors={['#2EAFBB', '#1890ff', '#25b887']}
						styles={{
							default: {
								picker: {
									boxShadow: 'none',
									border: `1px solid ${token.colorBorder}`,
									borderRadius: 0,
								},
							},
						}}
						onChange={onChangeTheme}
					/>
					<div className='flex'></div>
				</div>
			</Modal>
		</div>
	);
}

export default header;
