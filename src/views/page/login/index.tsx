import src_login from '@/assets/image/login-bg.webp';
import src_left from '@/assets/image/card-left-1.webp';
import utils from 'xe-utils';
import * as Yup from 'yup';
import {
	useEffect,
	useState,
	type ChangeEvent } from 'react';
import {
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Link,
	TextField,
	Typography
} from '@mui/material';
import {
	PersonRegular,
	LockClosedRegular,
	EyeRegular,
	EyeOffRegular
} from '@fluentui/react-icons';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { login } from '@/service';
import { setToken } from '@/store';

export const Login = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);

	const formik = useFormik({
		initialValues: {
			username: '',
			password: '',
			checked: false
		},
		validationSchema: Yup.object().shape({
			username: Yup.string().required('请输入用户名'),
			password: Yup.string().required('请输入密码')
		}),
		onSubmit(values) {
			login(values).then((result) => {
				dispatch(setToken(result.data));
				navigate('/index');
			});
		}
	});

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		formik.handleChange(e);

		utils.cookie.set('checked', e.target.checked, { expires: '7d' });

		if (e.target.checked) {
			utils.cookie.set('username', formik.values.username);
			utils.cookie.set('password', formik.values.password);
		} else {
			utils.cookie.remove('checked');
			utils.cookie.remove('username');
			utils.cookie.remove('password');
		}
	};

	useEffect(() => {
		const checked = utils.cookie.get('checked');
		const username = utils.cookie.get('username') || '';
		const password = utils.cookie.get('password') || '';

		if (checked === 'true') {
			formik.setValues({
				username,
				password,
				checked: true
			});
		}
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
							<form onSubmit={formik.handleSubmit}>
								<FormControl fullWidth>
									<TextField
										size='small'
										variant='outlined'
										placeholder='请输入用户名'
										name='username'
										value={formik.values.username}
										error={
											!!(formik.touched.username && formik.errors.username)
										}
										helperText={formik.errors.username ?? ' '}
										onChange={formik.handleChange}
										slotProps={{
											input: {
												startAdornment: (
													<InputAdornment position='start'>
														<PersonRegular />
													</InputAdornment>
												)
											}
										}}
									/>
								</FormControl>
								<FormControl fullWidth>
									<TextField
										size='small'
										variant='outlined'
										placeholder='请输入密码'
										name='password'
										type={showPassword ? 'text' : 'password'}
										value={formik.values.password}
										error={
											!!(formik.touched.password && formik.errors.password)
										}
										helperText={formik.errors.password ?? ' '}
										onChange={formik.handleChange}
										slotProps={{
											input: {
												startAdornment: (
													<InputAdornment position='start'>
														<LockClosedRegular />
													</InputAdornment>
												),
												endAdornment: (
													<InputAdornment position='end' aria-label='密码'>
														<IconButton
															edge='end'
															onClick={() => setShowPassword(!showPassword)}
														>
															{showPassword ? (
																<EyeOffRegular />
															) : (
																<EyeRegular />
															)}
														</IconButton>
													</InputAdornment>
												)
											}
										}}
									/>
								</FormControl>
								<div className='flex flex-row items-center justify-between mb-10'>
									<FormControlLabel
										control={
											<Checkbox
												name='checked'
												size='small'
												checked={formik.values.checked}
												onChange={onChange}
											/>
										}
										label={<Typography variant='button'>记住密码</Typography>}
									/>
									<Link className='text-sm cursor-pointer' underline='hover'>
										忘记密码?
									</Link>
								</div>
								<Button fullWidth variant='contained' type='submit'>
									立即登录
								</Button>
								<div className='text-center mt-6'>
									<Typography className='space-x-1' variant='caption'>
										<span>您还没有账号吗?</span>
										<Link className='cursor-pointer' underline='hover'>
											立即注册
										</Link>
									</Typography>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
