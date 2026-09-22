import {
	WrenchRegular,
	ServerRegular,
	BookRegular,
	SettingsRegular,
	BuildingShopRegular
} from '@fluentui/react-icons';

interface Props {
	name: string;
}

// 后端菜单 icon 字段使用 Ant Design 图标名，这里映射到对应的 Fluent UI 图标
const Icons: CObject = {
	SettingOutlined: SettingsRegular,
	HddOutlined: ServerRegular,
	ShopOutlined: BuildingShopRegular,
	ReadOutlined: BookRegular,
	BuildOutlined: WrenchRegular
};

export const MenuIcon = ({ name }: Props) => {
	if (name && Icons[name]) {
		const Icon = Icons[name];
		return <Icon />;
	}
	return null;
};
