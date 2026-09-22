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

const Icons: CObject = {
	SettingsRegular,
	ServerRegular,
	BuildingShopRegular,
	BookRegular,
	WrenchRegular
};

export const MenuIcon = ({ name }: Props) => {
	if (name && Icons[name]) {
		const Icon = Icons[name];
		return <Icon />;
	}
	return null;
};
