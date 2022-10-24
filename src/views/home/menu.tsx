import React from 'react';
import {
	AuditOutlined,
	FileTextOutlined,
	FundProjectionScreenOutlined,
	HddOutlined,
	OneToOneOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { MenuProps } from '@/store';

export const data: MenuProps[] = [
	{
		key: 'c57e2867-8dd2-f0de-28f7-8b02ed17bfbd',
		label: '系统管理',
		icon: <HddOutlined />,
		children: [
			{
				key: '52e8b8c6-81d1-29a2-5156-6bc85f74991e',
				label: '组织树',
				path: '/organization'
			},
			{
				key: 'e9a6d65b-e823-17a6-f918-99b5f1f945a2',
				label: '用户管理',
				path: '/user',
			},
			{
				key: 'ed4b47c2-5123-2d3f-1555-26ad2608079f',
				label: '范围管理',
				path: '/scope',
			},
			{
				key: 'd8b8a143-963f-f214-7c77-f3dca0fd26a1',
				label: '部门管理',
				path: '/dept',
			},
			{
				key: 'b876dcc8-8887-8a1f-03a3-9ff2da4f377c',
				label: '层级管理',
				path: '/layer',
			},
			{
				key: '518300b8-0b5f-74a9-56b5-041cfea2aa75',
				label: '用户组',
				path: '/user-group'
			},
			{
				key: '1173d28f-cca9-90a7-524c-c146d8546e75',
				label: '班次管理',
				path: '/shift'
			},
			{
				key: 'e001f36e-835b-2873-969d-cbc1d2514278',
				label: '设备台账',
				path: '/equipment-account'
			},
			{
				key: '497479f8-89bc-138d-48ca-2c7e80b12b65',
				label: '设备类型',
				path: '/equipment-type'
			},
			{
				key: '3b4e8cce-db9d-fc5b-b69b-b90316741587',
				label: '设备等级',
				path: '/equipment-level'
			},
		],
	},
	{
		key: '59058c7a-4e68-1687-930d-3f7a064f7511',
		label: '基础建模',
		icon: <AuditOutlined />,
		children: [
			{
				key: '6226bdd5-7b3f-d066-37cf-783db5385852',
				label: '文档',
				path: '/document'
			},
			{
				key: 'a14208bc-dce2-5a8f-e935-3c6572c2cc00',
				label: '列表',
				path: '/rules'
			},
			{
				key: 'c2a9c26a-6385-2cc7-4cf2-aab5d1b19ba0',
				label: '问题库',
				path: '/question'
			},
			{
				key: '021ca266-cbd0-d444-9bb4-876b278e7211',
				label: '标签库',
				path: '/custom-tag'
			},
			{
				key: '65cce277-768f-74f3-7dca-daec1503e92c',
				label: '安灯消息设置',
				path: '/safety-light-message'
			},
			{
				key: '0125eec7-036b-d6bd-aa51-2b4c7eca8365',
				label: '应急维修消息',
				path: '/emergency-maintenance'
			},
		],
	},
	{
		key: '4685bdc2-77f6-944c-a44a-4bc200716d63',
		label: '报告',
		icon: <FileTextOutlined />,
		children: [
			{
				key: '95ed1450-973b-d07e-e56d-152200c22602',
				label: '报告',
				path: '/report'
			},
			{
				key: 'be4d9cc0-3082-16fa-bbe3-442a7c04d4a0',
				label: '所有任务',
				path: '/all-report'
			},
		],
	},
	{
		key: '74aa7e50-c976-b94d-6e10-1eacc2e14bcc',
		label: '设置',
		icon: <SettingOutlined />,
		children: [
			{
				key: 'c0345b0c-8f30-6980-faad-ce68db9dab5d',
				label: '缓解设置',
				path: '/mitigation-settings'
			},
			{
				key: 'da09893c-86c3-8fa1-0e0c-1ad75ebadb95',
				label: '场地设置',
			},
		],
	},
	{
		key: '675142cf-1d30-fb26-1337-1b0b5f18b687',
		label: '中控大屏',
		icon: <FundProjectionScreenOutlined />,
		children: [
			{
				key: '75f36207-ca91-806e-797d-b70c6700a5ca',
				label: '设备管理大屏',
				path: '/device-manage'
			},
			{
				key: '401fe517-4c0a-df21-1cd5-3690750d15c8',
				label: '安灯状态大屏',
				path: '/safety-lamp-status',
			},
			{
				key: '81e9c0b6-f291-fb33-8575-c48a31902ba2',
				label: '移动巡检大屏',
			},
			{
				key: '69023b34-aca9-7232-b2d0-b2bc5505ce0a',
				label: '移动巡检设置',
			},
		],
	},
	{
		key: '78653e52-4e09-2bbc-0258-39cbffb7e396',
		label: '备品备件',
		icon: <OneToOneOutlined />,
		children: [
			{
				key: '7fbc69d4-649a-9b16-95a4-e0861edcce45',
				label: '备件台账管理',
				path: '/standing-book'
			},
			{
				key: '961d1af3-b4df-d05f-91e2-55b43fb376ec',
				label: '备件库位配置',
				path: '/location-config'
			},
			{
				key: '1aa9e586-c852-1840-3320-b30ed713845b',
				label: '备件类型配置',
				path: '/type-config'
			},
			{
				key: 'a0c7cbf0-a153-6cd8-defe-a8f5c39f5b3b',
				label: '配件流动记录',
				path: '/flow-record'
			},
			{
				key: '47ddfb58-bf7d-1a67-762a-a34da3aecebc',
				label: '备件审核管理',
				path: '/audit-manage'
			},
			{
				key: 'a37bd1cc-61d5-71a6-7814-8ccb4e8ea3a3',
				label: '备件备库管理',
				path: '/space-warehouse'
			},
			{
				key: 'b5e205ab-6f29-a20a-6784-4ad000bb42f1',
				label: '备件替换管理',
				path: '/replacement'
			},
			{
				key: 'b5e205ab-6f29-a20a-6784-4ad000bb42f2',
				label: '备件维修管理 ',
				path: '/repair'
			},
		],
	},
];
