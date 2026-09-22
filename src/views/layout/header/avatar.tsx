import {
	BuildingBankRegular,
	ProhibitedRegular,
	AppsRegular,
	PhoneRegular,
	LockClosedRegular,
	MailRegular,
	PeopleRegular,
	DocumentRegular,
	PersonRegular,
	PowerRegular,
	ChevronUpDownRegular
} from '@fluentui/react-icons';
import {
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardHeader,
	Popover,
	RadioGroup,
	Stack,
	Typography
} from '@mui/material';
import {
	usePopupState,
	bindTrigger,
	bindPopover
} from 'material-ui-popup-state/hooks';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik, type FormikValues } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { usePermis } from '@/authority';
import { API_UPLOAD } from '@/core';
import { Form, Input, Modal, Radio, Upload, message } from '@/plugins';
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

export const NavAvatar = () => {
	const popupState = usePopupState({
		variant: 'popover',
		popupId: 'navAvatarPopover'
	});
	const { user } = usePermis();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const theme = useStore((state) => state.root.theme);

	const [profileVisible, setProfileVisible] = useState(false);
	const [psdVisible, setPsdVisible] = useState(false);
	const [settingVisible, setSettingVisible] = useState(false);
	const [themeColor, setThemeColor] = useState(theme);

	const logout = () => {
		dispatch(clear());
		navigate('/login');
	};

	const profileFormik = useFormik<FormikValues>({
		initialValues: {
			nickName: user.nickName ?? '',
			sex: user.sex != null ? String(user.sex) : '0',
			phonenumber: user.phonenumber ?? '',
			email: user.email ?? '',
			avatar: user.avatar ?? ''
		},
		validationSchema: Yup.object().shape({
			nickName: Yup.string().required('请输入用户昵称')
		}),
		onSubmit(values) {
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
		}
	});

	const psdFormik = useFormik<FormikValues>({
		initialValues: {
			oldPassword: '',
			newPassword: '',
			confirmPassword: ''
		},
		validationSchema: Yup.object().shape({
			oldPassword: Yup.string().required('请输入原密码'),
			newPassword: Yup.string()
				.required('请输入新密码')
				.min(6, '密码不能少于6个字符'),
			confirmPassword: Yup.string()
				.required('请输入确认密码')
				.oneOf([Yup.ref('newPassword')], '两次输入的新密码不一致')
		}),
		onSubmit(values) {
			updateSystemUserPwd({
				oldPassword: values.oldPassword,
				newPassword: values.newPassword
			}).then(() => {
				message.success('密码修改成功, 请重新登录');
				setPsdVisible(false);
				logout();
			});
		}
	});

	const onOpenProfile = () => {
		profileFormik.resetForm();
		setProfileVisible(true);
		popupState.close();
	};

	const onOpenPsd = () => {
		psdFormik.resetForm();
		setPsdVisible(true);
		popupState.close();
	};

	const onOpenSetting = () => {
		setThemeColor(theme);
		setSettingVisible(true);
		popupState.close();
	};

	const onSaveSetting = () => {
		dispatch(setTheme(themeColor));
		setSettingVisible(false);
	};

	return (
		<>
			<NavBtn aria-haspopup='true' {...bindTrigger(popupState)}>
				<Avatar
					variant='rounded'
					sx={{ width: '28px', height: '28px' }}
					src={user.avatar ? API_UPLOAD + user.avatar : ''}
				>
					<PersonRegular />
				</Avatar>
				<Typography gutterBottom variant='body2'>
					{user.userName ?? '--'}
				</Typography>
				<ChevronUpDownRegular />
			</NavBtn>
			<Popover
				{...bindPopover(popupState)}
				aria-hidden={false}
				slotProps={{ paper: { elevation: 2, sx: { borderRadius: 2 } } }}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<Card className='px-4 py-3'>
					<CardHeader
						className='items-start'
						title={
							<div className='flex items-center justify-between mb-2'>
								<Typography variant='body1'>
									{`${user.nickName}, 欢迎您`}
								</Typography>
								<Button
									color='error'
									size='small'
									title='退出登录'
									sx={{ minWidth: 'initial' }}
									onClick={logout}
								>
									<PowerRegular style={{ fontSize: 16 }} />
								</Button>
							</div>
						}
						subheader={
							<Stack spacing={1}>
								<Stack direction='row' spacing={1}>
									<div className='flex items-center gap-1.5'>
										<PeopleRegular />
										<Typography className='w-24' variant='body2'>
											{user.roles &&
												user.roles.map((role) => role.roleName).join(',')}
										</Typography>
									</div>
									<div className='flex items-center gap-1.5'>
										<BuildingBankRegular />
										<Typography className='w-24' variant='body2'>
											{(user.dept && user.dept.deptName) || '--'}
										</Typography>
									</div>
								</Stack>
								<Stack direction='row' spacing={1}>
									<div className='flex items-center gap-1.5'>
										<PersonRegular />
										<Typography className='w-24' variant='body2'>
											{user.userName}
										</Typography>
									</div>
									<div className='flex items-center gap-1.5'>
										<ProhibitedRegular />
										<Typography className='w-24' variant='body2'>
											{user.sex == 0 ? '男' : '女'}
										</Typography>
									</div>
								</Stack>
								<Stack direction='row' spacing={1}>
									<div className='flex items-center gap-1.5'>
										<MailRegular />
										<Typography className='w-24' variant='body2'>
											{user.email ?? '--'}
										</Typography>
									</div>
									<div className='flex items-center gap-1.5'>
										<PhoneRegular />
										<Typography className='w-24' variant='body2'>
											{user.phonenumber ?? '--'}
										</Typography>
									</div>
								</Stack>
								<Stack direction='row' spacing={1}>
									<div className='flex items-center gap-1.5'>
										<span className='w-5 text-center'>IP</span>
										<Typography className='w-24' variant='body2'>
											{user.loginIp ?? '--'}
										</Typography>
									</div>
								</Stack>
							</Stack>
						}
						avatar={
							<Avatar
								aria-label='recipe'
								src={user.avatar ? API_UPLOAD + user.avatar : ''}
							>
								<PersonRegular />
							</Avatar>
						}
					/>
					<CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
						<Button
							size='small'
							startIcon={<DocumentRegular />}
							onClick={onOpenProfile}
						>
							基本资料
						</Button>
						<Button
							size='small'
							startIcon={<AppsRegular />}
							onClick={onOpenSetting}
						>
							系统设置
						</Button>
						<Button
							size='small'
							startIcon={<LockClosedRegular />}
							onClick={onOpenPsd}
						>
							修改密码
						</Button>
					</CardActions>
				</Card>
			</Popover>

			<Modal
				title='基本资料'
				open={profileVisible}
				onOk={() => profileFormik.handleSubmit()}
				onClose={() => setProfileVisible(false)}
			>
				<Form labelCol={{ flex: '0 0 90px' }} formik={profileFormik}>
					<Form.Item name='avatar' label='用户头像'>
						<Upload />
					</Form.Item>
					<Form.Item required name='nickName' label='用户昵称'>
						<Input placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item name='sex' label='性别'>
						<RadioGroup row>
							<Radio value='0' label='男' />
							<Radio value='1' label='女' />
						</RadioGroup>
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
				onOk={() => psdFormik.handleSubmit()}
				onClose={() => setPsdVisible(false)}
			>
				<Form labelCol={{ flex: '0 0 90px' }} formik={psdFormik}>
					<Form.Item required name='oldPassword' label='原密码'>
						<Input type='password' placeholder='请输入原密码' />
					</Form.Item>
					<Form.Item required name='newPassword' label='新密码'>
						<Input type='password' placeholder='请输入新密码' />
					</Form.Item>
					<Form.Item required name='confirmPassword' label='确认密码'>
						<Input type='password' placeholder='请输入确认密码' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='系统设置'
				open={settingVisible}
				onOk={onSaveSetting}
				onClose={() => setSettingVisible(false)}
			>
				<Typography variant='body2' sx={{ mb: 1.5 }}>
					主题色
				</Typography>
				<Stack direction='row' spacing={1.5}>
					{THEME_COLORS.map((color) => (
						<Box
							key={color}
							onClick={() => setThemeColor(color)}
							sx={{
								width: 24,
								height: 24,
								borderRadius: '50%',
								cursor: 'pointer',
								bgcolor: color,
								border: `2px solid ${color}`,
								boxShadow:
									themeColor === color
										? `0 0 0 2px #fff, 0 0 0 4px ${color}`
										: 'none',
								transition: '0.2s'
							}}
						/>
					))}
				</Stack>
			</Modal>
		</>
	);
};
