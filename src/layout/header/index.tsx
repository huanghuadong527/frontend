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
			label: '????????????',
			icon: <SettingOutlined />,
		},
		{
			key: 'info',
			label: '????????????',
			icon: <IdcardOutlined />,
		},
		{
			key: 'layout',
			label: '????????????',
			icon: <LayoutOutlined />,
		},
		{
			key: 'password',
			label: '????????????',
			icon: <LockOutlined />,
		},
		{
			type: 'divider',
		},
		{
			key: 'logout',
			label: '????????????',
			icon: <LogoutOutlined />,
		},
	];

	const onCollapse = () => {
		props.onCollapse!(!props.collapsed);
	};

	const onScreenfull = () => {
		if (!screenfull.isEnabled) {
			message.warning('??????????????????????????????');
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
						message.success('???????????????????????????!');
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
					<SearchOutlined /> ??????
				</a>
				<a className={style.layoutHeaderHandle} onClick={onScreenfull}>
					<ExpandOutlined /> ??????
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
				title='????????????'
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
					<Form.Item label='????????????'>
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
										<p className='ant-upload-text'>?????????????????????????????????</p>
										<p className='ant-upload-hint'>
											????????????jpg/png??????, ????????????500kb
										</p>
									</>
								)}
							</Upload.Dragger>
						</ImgCrop>
					</Form.Item>
					<Form.Item
						name='nickName'
						label='????????????'
						rules={[{ required: true }]}
					>
						<Input placeholder='?????????????????????' />
					</Form.Item>
					<Form.Item name='sex' label='??????'>
						<Radio.Group>
							<Radio value={0}>???</Radio>
							<Radio value={1}>???</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='phonenumber' label='????????????'>
						<Input placeholder='?????????????????????' />
					</Form.Item>
					<Form.Item name='email' label='????????????'>
						<Input placeholder='?????????????????????' />
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title='????????????'
				width={600}
				footer={false}
				open={infoVisible}
				onCancel={() => setInfoVisible(false)}
			>
				{user ? (
					<Descriptions bordered size='small' column={2}>
						<Descriptions.Item label='??????'>{user.nickName}</Descriptions.Item>
						<Descriptions.Item label='?????????'>
							{user.userName}
						</Descriptions.Item>
						<Descriptions.Item label='??????'>
							{user.sex == 0 ? '???' : '???'}
						</Descriptions.Item>
						<Descriptions.Item label='????????????'>
							{user.phonenumber}
						</Descriptions.Item>
						<Descriptions.Item label='??????'>{user.email}</Descriptions.Item>
						<Descriptions.Item label='????????????'>
							{user.dept ? user.dept.deptName : ''}
						</Descriptions.Item>
						<Descriptions.Item label='????????????'>
							{user.roles
								? user.roles.map((item: any) => item.roleName).join(',')
								: ''}
						</Descriptions.Item>
						<Descriptions.Item label='??????IP'>{user.loginIp}</Descriptions.Item>
						<Descriptions.Item label='?????????'>
							{user.createBy || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='????????????'>
							{user.createTime || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='?????????'>
							{user.updateBy || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='????????????'>
							{user.updateTime || '--'}
						</Descriptions.Item>
						<Descriptions.Item label='????????????'>
							{user.status == 0 ? '??????' : '??????'}
						</Descriptions.Item>
					</Descriptions>
				) : (
					<></>
				)}
			</Modal>
			<Modal
				title='????????????'
				width={450}
				open={psdVisible}
				onOk={onSavePsd}
				onCancel={() => setPsdVisible(false)}
			>
				<Form autoComplete='off' labelCol={{ span: 4 }}>
					<Form.Item label='?????????'>
						<Input.Password placeholder='??????????????????' />
					</Form.Item>
					<Form.Item label='?????????'>
						<Input.Password placeholder='??????????????????' />
					</Form.Item>
					<Form.Item label='????????????'>
						<Input.Password placeholder='?????????????????????' />
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title='????????????'
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
